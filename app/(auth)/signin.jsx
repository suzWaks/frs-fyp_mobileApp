import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import React from 'react';
import { Link, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchRoute } from '../api/mockApi'; // Import the mock API

export default function SignInScreen() {
  const router = useRouter();

  const handleLoginHOD = async () => {
    await AsyncStorage.setItem('userRole', 'hod'); // Save the user role as HOD
    const route = await fetchRoute('hod'); // Fetch the route for HOD
    router.push(route);
  };

  const handleLoginStudent = async () => {
    await AsyncStorage.setItem('userRole', 'student'); // Save the user role as Student
    const route = await fetchRoute('student'); // Fetch the route for Student
    router.push(route);
  };

  const handleLoginTutor = async () => {
    await AsyncStorage.setItem('userRole', 'tutor'); // Save the user role as Tutor
    const route = await fetchRoute('tutor'); // Fetch the route for Tutor
    router.push(route);
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign In</Text>
      <TouchableOpacity style={styles.loginButton} onPress={handleLoginHOD}>
        <Text style={styles.loginButtonText}>Login as DAA</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.loginButton} onPress={handleLoginStudent}>
        <Text style={styles.loginButtonText}>Login as Student</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.loginButton} onPress={handleLoginTutor}>
        <Text style={styles.loginButtonText}>Login as Tutor</Text>
      </TouchableOpacity>
      <Link href="/signup" style={styles.link}>Don't have an account? Sign up</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    color: 'black',  // Set title color to black
  },
  loginButton: {
    backgroundColor: '#6B4EFF',  // Purple color
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,  // Rectangle shape with slight rounding
    marginBottom: 20,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  link: {
    marginTop: 20,
    color: 'blue',
  },
});