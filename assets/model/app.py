import warnings
import json
import math
import logging
from flask import Flask, request, jsonify
import tensorflow as tf
import numpy as np
from PIL import Image
import io
import os
import psycopg2
from mtcnn import MTCNN
import base64
from flask_cors import CORS
from sklearn.metrics.pairwise import cosine_similarity
from waitress import serve

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Suppress deprecation warnings
warnings.filterwarnings("ignore", message=".*tf.lite.Interpreter is deprecated.*")

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Load TFLite model
model_path = os.path.join(os.path.dirname(__file__), "facenet_model.tflite")
interpreter = tf.lite.Interpreter(model_path=model_path)
interpreter.allocate_tensors()

# Get input/output details
input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

# Initialize MTCNN for face detection
detector = MTCNN()

# Database connection configuration
DB_CONFIG = {
    'dbname': 'fyp-ams',
    'user': 'postgres',
    'password': 'root',
    'host': 'localhost',
    'port': '5432'
}

def preprocess_image(image_bytes):
    """Convert uploaded image to model input format"""
    try:
        if isinstance(image_bytes, io.BytesIO):
            image_bytes = image_bytes.getvalue()
        img = Image.open(io.BytesIO(image_bytes))
        if img.mode != "RGB":
            img = img.convert("RGB")
        expected_shape = (160, 160)
        img = img.resize(expected_shape)
        img = np.array(img, dtype=np.float32)
        img = img / 255.0
        img = np.expand_dims(img, axis=0)
        return img
    except Exception as e:
        logger.error(f"Error during preprocessing: {str(e)}")
        raise ValueError("Failed to preprocess the image.") from e


@app.route('/')
def home():
    return "Face Recognition API is running! Send a POST request to /recognize or /compare"


@app.route('/recognize', methods=['POST'])
def recognize_face():
    try:
        data = request.get_json()
        if not data or 'image' not in data or 'studentId' not in data or 'studentName' not in data:
            return jsonify({"error": "Missing image, student ID, or student name"}), 400

        image_data = data['image']
        student_id = data['studentId']
        student_name = data['studentName']

        image_bytes = base64.b64decode(image_data)
        img = np.array(Image.open(io.BytesIO(image_bytes)))
        detections = detector.detect_faces(img)

        if not detections:
            return jsonify({"error": "No face detected in the image."}), 400

        x, y, width, height = detections[0]['box']

        # Basic validation
        if width <= 0 or height <= 0:
            return jsonify({"error": "Invalid face bounding box detected."}), 400

        face = img[y:y + height, x:x + width]
        face_image = Image.fromarray(face.astype('uint8'), 'RGB')
        buffered = io.BytesIO()
        face_image.save(buffered, format="JPEG")
        buffered.seek(0)

        input_data = preprocess_image(buffered)
        interpreter.set_tensor(input_details[0]['index'], input_data)
        interpreter.invoke()

        new_embedding = interpreter.get_tensor(output_details[0]['index'])[0]

        # Validate embedding
        if not isinstance(new_embedding, np.ndarray):
            return jsonify({"error": "Model output is not a valid NumPy array"}), 500
        if np.isnan(new_embedding).any():
            return jsonify({"error": "Model returned an embedding with NaN values"}), 500

        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()

        # Check existing embeddings
        cursor.execute('SELECT "Student_Id", "FaceEmbedding" FROM "FaceData"')
        rows = cursor.fetchall()
        similarities = []

        for row in rows:
            stored_embedding = row[1]  # FaceEmbedding
            if stored_embedding is None:
                continue
            try:
                if isinstance(stored_embedding, dict):
                    stored_embedding = list(stored_embedding.values())
                elif isinstance(stored_embedding, str):
                    stored_embedding = json.loads(stored_embedding)
                stored_embedding = np.array(stored_embedding, dtype=np.float32)

                if stored_embedding.shape != (512,): 
                    logger.warning(f"Skipping Student {row[0]}: Invalid shape {stored_embedding.shape}")
                    continue
                if np.isnan(stored_embedding).any():
                    logger.warning(f"Skipping Student {row[0]} due to NaN in embedding.")
                    continue

                stored_embedding = stored_embedding.reshape(1, -1)
                new_embedding_2d = new_embedding.reshape(1, -1)
                similarity = cosine_similarity(new_embedding_2d, stored_embedding)[0][0]
                similarities.append(float(similarity))
            except Exception as e:
                logger.error(f"Error comparing embedding for student {row[0]}: {str(e)}")
                continue

        threshold = 0.85
        if similarities and max(similarities) >= threshold:
            cursor.close()
            conn.close()
            return jsonify({
                "success": False,
                "message": "You cannot register your face twice."
            }), 200

        # Store new face embedding
        embedding_list = new_embedding.tolist()
        if any(math.isnan(x) for x in embedding_list):
            return jsonify({"error": "Cannot store embedding containing NaN"}), 500

        cursor.execute(
            'INSERT INTO "FaceData" ("Student_Id", "FaceEmbedding", "StudentName") VALUES (%s, %s, %s)',
            (student_id, json.dumps(embedding_list), student_name)
        )
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({
            "success": True,
            "message": "Face registered successfully"
        })

    except Exception as e:
        logger.error(f"Unhandled error during processing: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/compare', methods=['POST'])
def compare_face():
    try:
        data = request.get_json()
        if not data or 'image' not in data:
            return jsonify({"error": "No image provided"}), 400

        image_data = data['image']
        image_bytes = base64.b64decode(image_data)
        img = np.array(Image.open(io.BytesIO(image_bytes)))

        detections = detector.detect_faces(img)
        if not detections:
            return jsonify({"error": "No face detected in the image."}), 400

        x, y, width, height = detections[0]['box']

        # Basic validation
        if width <= 0 or height <= 0:
            return jsonify({"error": "Invalid face bounding box detected."}), 400

        face = img[y:y + height, x:x + width]
        face_image = Image.fromarray(face.astype('uint8'), 'RGB')
        buffered = io.BytesIO()
        face_image.save(buffered, format="JPEG")
        buffered.seek(0)

        input_data = preprocess_image(buffered)
        interpreter.set_tensor(input_details[0]['index'], input_data)
        interpreter.invoke()

        new_embedding = interpreter.get_tensor(output_details[0]['index'])[0]

        # Validate embedding
        if not isinstance(new_embedding, np.ndarray):
            return jsonify({"error": "Model output is not a valid NumPy array"}), 500
        if np.isnan(new_embedding).any():
            return jsonify({"error": "Model returned an embedding with NaN values"}), 500

        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute('SELECT "Student_Id", "FaceEmbedding", "StudentName" FROM "FaceData"')
        rows = cursor.fetchall()
        cursor.close()
        conn.close()

        similarities = []
        for row in rows:
            student_id, stored_embedding, name = row
            if stored_embedding is None:
                continue
            try:
                if isinstance(stored_embedding, str):
                    stored_embedding = json.loads(stored_embedding)
                stored_embedding = np.array(stored_embedding, dtype=np.float32)

                if stored_embedding.shape != (512,): 
                    logger.warning(f"Skipping Student {student_id}: Invalid shape {stored_embedding.shape}")
                    continue
                if np.isnan(stored_embedding).any():
                    logger.warning(f"Skipping Student {student_id} due to NaN in embedding.")
                    continue

                stored_embedding = stored_embedding.reshape(1, -1)
                new_embedding_2d = new_embedding.reshape(1, -1)
                similarity = cosine_similarity(new_embedding_2d, stored_embedding)[0][0]

                similarities.append({
                    "Student_Id": student_id,
                    "StudentName": name,
                    "similarity": float(similarity)
                })
            except Exception as e:
                logger.error(f"Error comparing embedding for student {student_id}: {str(e)}")
                continue

        if not similarities:
            return jsonify({
                "success": False,
                "message": "No valid face embeddings found in the database.",
                "hint": "Make sure at least one face has been registered and try again."
            }), 200

        best_match = max(similarities, key=lambda x: x['similarity'])
        threshold = 0.85

        if best_match["similarity"] >= threshold:
            message = f"Face matched with student: {best_match['StudentName']}"
        else:
            message = "No matching face found in the database."

        return jsonify({
            "success": True,
            "best_match": {
                "Student_Id": best_match["Student_Id"],
                "StudentName": best_match["StudentName"],
                "similarity": float(best_match["similarity"])
            },
            "message": message,
            "all_matches": similarities
        })

    except Exception as e:
        logger.error(f"Unhandled error during processing: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/debug_embeddings', methods=['GET'])
def debug_embeddings():
    conn = psycopg2.connect(**DB_CONFIG)
    cursor = conn.cursor()
    cursor.execute('SELECT "Student_Id", "FaceEmbedding" FROM "FaceData"')
    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    result = []
    for row in rows:
        student_id, embedding = row
        try:
            if isinstance(embedding, str):
                embedding = json.loads(embedding)
            result.append({"Student_Id": student_id, "Sample": embedding[:5]})
        except Exception as e:
            result.append({"Student_Id": student_id, "Error": str(e)})
    return jsonify(result)


if __name__ == '__main__':
    serve(app, host='0.0.0.0', port=5000)