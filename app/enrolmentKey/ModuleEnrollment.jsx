import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { enrollModule } from '../api/enrollModule'; // Import the mock API

const EnrollmentScreen = () => {
  const { code, name, instructor } = useLocalSearchParams();
  const [enrollmentKey, setEnrollmentKey] = useState('');
  const router = useRouter();

  const handleJoin = async () => {
    const response = await enrollModule(enrollmentKey);
    if (response.success) {
      Alert.alert("Success", response.message);
      router.push('/enrolmentKey/HomeWithModules'); // Navigate to HomeWithModules page
    } else {
      Alert.alert("Error", response.message);
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