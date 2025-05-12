import React, { useState, useRef } from 'react';
import { StyleSheet,Text,TouchableOpacity,View,Alert,Image,Dimensions,} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function AttendanceScreen() {
  const [facing, setFacing] = useState('back');
  const [capturedImageUri, setCapturedImageUri] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const cameraRef = useRef(null);

  const [permission, requestPermission] = useCameraPermissions();

  if (!permission || !permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>We need your permission to use the camera</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        setCapturedImageUri(photo.uri);
      } catch (error) {
        Alert.alert('Error', 'Failed to take picture');
      }
    }
  };

  const toggleCameraFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  const sendImageToServer = async () => {
    if (!capturedImageUri) return;
    setIsProcessing(true);

    try {
      const base64 = await FileSystem.readAsStringAsync(capturedImageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const response = await fetch('http://10.2.5.57:5000/compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: base64 }),
      });

      const result = await response.json();

      if (result.success && result.best_match?.similarity >= 0.85) {
        const StudentName = result.best_match.StudentName || 'Unknown';
        Alert.alert(
          'Success',
          `Attendance marked for:\n${result.best_match.StudentName}`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('No Match', result.message || 'Face not recognized.');
      }

      setCapturedImageUri(null);
    } catch (error) {
      console.error('Error sending image:', error);
      Alert.alert('Error', 'Failed to mark attendance');
    } finally {
      setIsProcessing(false);
    }
  };

  if (capturedImageUri) {
    return (
      <View style={styles.previewContainer}>
        <Text style={styles.title}>Verify Face</Text>
        <Text style={styles.subtitle}>Make sure your face is clearly visible.</Text>
        <Image source={{ uri: capturedImageUri }} style={styles.imagePreview} />
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.retakeButton]}
            onPress={() => setCapturedImageUri(null)}
            disabled={isProcessing}
          >
            <Text style={styles.buttonText}>Retake</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.submitButton]}
            onPress={sendImageToServer}
            disabled={isProcessing}
          >
            <Text style={styles.buttonText}>{isProcessing ? 'Processing...' : 'Submit'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Mark Attendance</Text>
          <Text style={styles.instructionText}>Center your face in the frame</Text>
        </View>
        <View style={styles.faceGuide} />
        <View style={styles.controls}>
          <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
            <MaterialCommunityIcons name="camera-flip" size={40} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
            <MaterialCommunityIcons name="face-recognition" size={40} color="white" />
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDF7FE',
  },
  camera: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 50,
    width: '100%',
    alignItems: 'center',
  },
  headerText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  instructionText: {
    color: 'white',
    fontSize: 16,
    marginTop: 10,
  },
  faceGuide: {
    position: 'absolute',
    top: '25%',
    left: '15%',
    width: '70%',
    height: '35%',
    borderWidth: 2,
    borderColor: 'rgba(28, 211, 119, 0.7)',
    borderRadius: 400,
  },
  controls: {
    position: 'absolute',
    bottom: 50,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  flipButton: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 15,
    borderRadius: 30,
  },
  captureButton: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#CDABFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    color: '#7647EB',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    color: '#7647EB',
    fontSize: 16,
    marginBottom: 30,
  },
  imagePreview: {
    width: width - 40,
    height: width - 40,
    borderRadius: width / 2,
    marginBottom: 30,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    minWidth: 120,
    alignItems: 'center',
  },
  retakeButton: {
    backgroundColor: '#F44336',
  },
  submitButton: {
    backgroundColor: '#7647EB',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: '#FDF7FE',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  permissionText: {
    fontSize: 18,
    color: '#7647EB',
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#7647EB',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
  },
  permissionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});