import React, { useState, useRef, useEffect } from 'react';
import {StyleSheet,Text,TouchableOpacity,View,Alert,Image,Dimensions} from 'react-native';
import { CameraView, CameraType } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
  const [facing, setFacing] = useState('back');
  const [capturedImageUri, setCapturedImageUri] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const cameraRef = useRef(null);
  const [studentId, setStudentId] = useState(null);
  const [studentName, setStudentName] = useState(null); 

  useEffect(() => {
    const loadStudentId = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const { id, name, faceRegistered } = JSON.parse(userData); 
          
          // Check if this user already has face registered
          if (faceRegistered) {
            Alert.alert(
              'Face Already Registered',
              'You have already registered your face. Please use the login screen.',
              [
                {
                  text: 'OK',
                  onPress: () => {
                    // Clear user data and redirect to login
                    AsyncStorage.removeItem('userData');
                    router.replace('/(auth)/signin');
                  }
                }
              ]
            );
            return;
          }
          
          setStudentId(id);
          setStudentName(name);
        }
      } catch (error) {
        console.error('Error loading student data:', error);
      }
    };
    loadStudentId();
  }, []);

  const router = useRouter();

  const registerFace = async () => {
    if (!capturedImageUri) return;
    if (!studentId || !studentName) { 
      Alert.alert('Error', 'Student ID or Name not found. Please log in again.');
      return;
    }

    setIsProcessing(true);

    try {
      const base64 = await FileSystem.readAsStringAsync(capturedImageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const response = await fetch('http://10.2.5.57:5000/recognize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64,
          studentId: studentId,
          studentName: studentName,
          token: await AsyncStorage.getItem('userToken'), // Add token for verification
        }),
      });

      const result = await response.json();

      if (response.status === 200 && !result.success) {
        if (result.error === 'face_exists') {
          // If face exists but doesn't belong to current user
          await AsyncStorage.removeItem('userData');
          Alert.alert('Security Alert', 'Face recognition failed. Please login again.', [
            {
              text: 'OK',
              onPress: () => router.replace('/(auth)/signin')
            }
          ]);
          return;
        }
        Alert.alert('Info', result.message, [
          {
            text: 'OK',
            onPress: () => router.replace('/(students)/student')
          }
        ]);
      } else if (result.success) {
        // Update userData to indicate face is registered
        const userData = JSON.parse(await AsyncStorage.getItem('userData'));
        await AsyncStorage.setItem('userData', JSON.stringify({
          ...userData,
          faceRegistered: true
        }));
        
        Alert.alert('Success', result.message || 'Face registered successfully', [
          {
            text: 'OK',
            onPress: () => {
              router.replace('/(students)/student');
            }
          }
        ]);
      } else {
        Alert.alert('Error', result.error || 'Registration failed');
      }

      setCapturedImageUri(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to register face');
    } finally {
      setIsProcessing(false);
    }
  };

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
    setFacing(facing === 'back' ? 'front' : 'back');
  };

  if (capturedImageUri) {
    return (
      <View style={styles.previewContainer}>
        <Text style={styles.title}>Face Registration</Text>
        <Text style={styles.subtitle}>Please ensure your face is clearly visible.</Text>
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
            style={[styles.button, styles.registerButton]}
            onPress={registerFace}
            disabled={isProcessing}
          >
            <Text style={styles.buttonText}>
              {isProcessing ? 'Processing...' : 'Register'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Register Your Face</Text>
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
  registerButton: {
    backgroundColor: '#7647EB',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});