import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform, ToastAndroid } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const API_BASE_URL = Constants.expoConfig.extra.API_BASE_URL;

const EnrollmentScreen = () => {
  const { code, name, instructor, classId, studentId } = useLocalSearchParams();
  const [enrollmentKey, setEnrollmentKey] = useState('');
  const router = useRouter();

  const handleJoin = async () => {
    try {
      if (!enrollmentKey.trim()) {
        if (Platform.OS === 'android') {
          ToastAndroid.showWithGravity(
            "Please enter an enrollment key",
            ToastAndroid.LONG,
            ToastAndroid.CENTER
          );
        } else {
          Alert.alert("Error", "Please enter an enrollment key");
        }
        return;
      }

      // Get student data from AsyncStorage
      const userData = await AsyncStorage.getItem('userData');
      if (!userData) {
        if (Platform.OS === 'android') {
          ToastAndroid.showWithGravity(
            "User data not found",
            ToastAndroid.LONG,
            ToastAndroid.CENTER
          );
        } else {
          Alert.alert("Error", "User data not found");
        }
        return;
      }

      const student = JSON.parse(userData);
      console.log('Student Data:', student); // Debug log

      // First verify if entered key matches the module's enrollment key
      if (enrollmentKey.trim() !== code.trim()) {
        if (Platform.OS === 'android') {
          ToastAndroid.showWithGravity(
            "Invalid enrollment key",
            ToastAndroid.LONG,
            ToastAndroid.CENTER
          );
        } else {
          Alert.alert("Error", "Invalid enrollment key");
        }
        return;
      }

      // Get existing ModuleIds or initialize empty array
      const existingModuleIds = student.moduleIds || [];
      
      // Check if already enrolled
      if (existingModuleIds.includes(parseInt(classId))) {
        if (Platform.OS === 'android') {
          ToastAndroid.showWithGravity(
            "You are already enrolled in this module",
            ToastAndroid.LONG,
            ToastAndroid.CENTER
          );
        } else {
          Alert.alert("Error", "You are already enrolled in this module");
        }
        return;
      }

      // Combine existing and new moduleIds
      const updatedModuleIds = [...existingModuleIds, parseInt(classId)];

      // Now PUT the class_Id into student's ModuleIds array using the passed studentId
      const updateResponse = await fetch(`${API_BASE_URL}/Students/${studentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: studentId,
          student_Id: parseInt(student.studentId) || 0,
          google_Id: student.google_Id,
          name: student.name,
          email: student.email,
          year: student.year || "1",
          phone_No: parseInt(student.phone_No) || 0,
          profile_PictureURL: student.profile_PictureURL || "",
          department_Id: parseInt(student.department_Id) || 1,
          moduleIds: updatedModuleIds
        })
      });

      // Remove the duplicate debug logs since they're not needed anymore

      if (updateResponse.ok) {
        // Update the local storage with new moduleIds
        const updatedUserData = {
          ...student,
          moduleIds: updatedModuleIds
        };
        await AsyncStorage.setItem('userData', JSON.stringify(updatedUserData));

        console.log('Enrollment successful'); // Debug log
        if (Platform.OS === 'android') {
          ToastAndroid.showWithGravity(
            `Successfully enrolled in ${name}!`,
            ToastAndroid.LONG,
            ToastAndroid.CENTER
          );
        } else {
          Alert.alert('Success', `Successfully enrolled in ${name}!`);
        }
        
        // Add a small delay before navigation to ensure toast is visible
        setTimeout(() => {
          router.replace({
            pathname: '/(students)/student',
            params: { 
              refresh: true,
              instructorName: instructor // This is already passing the instructor name
            }
          });
        }, 2000);
      } else {
        console.log('Enrollment failed:', await updateResponse.text()); // Debug log
        if (Platform.OS === 'android') {
          ToastAndroid.showWithGravity(
            "Failed to enroll. Please try again.",
            ToastAndroid.LONG,
            ToastAndroid.CENTER
          );
        } else {
          Alert.alert("Error", "Failed to enroll. Please try again.");
        }
      }
    } catch (error) {
      console.error('Enrollment error:', error); // Debug log
      if (Platform.OS === 'android') {
        ToastAndroid.showWithGravity(
          "An error occurred. Please try again.",
          ToastAndroid.LONG,
          ToastAndroid.CENTER
        );
      } else {
        Alert.alert("Error", "An error occurred. Please try again.");
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{code} - {name}</Text>
        <Text style={styles.subtitle}>{instructor} | BE in IT | 4th year</Text>
      </View>

      {/* Input Field */}
      <TextInput
        style={styles.input}
        placeholder="Enter enrollment code.."
        placeholderTextColor="#999"
        value={enrollmentKey}
        onChangeText={setEnrollmentKey}
      />

      {/* Join Button */}
      <TouchableOpacity style={styles.button} onPress={handleJoin}>
        <Text style={styles.buttonText}>Join</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#7647EB',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default EnrollmentScreen;