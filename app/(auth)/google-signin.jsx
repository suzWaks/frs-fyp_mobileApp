import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Dimensions, Platform } from 'react-native';
import React, { useState } from 'react';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import Toast from 'react-native-toast-message';

const { width, height } = Dimensions.get('window');

// Update the API_CONFIG to use the configuration from app.json
// Add ROLE_MAP and ROUTES constants
// Update the ROLE_MAP to match the schema where role_Id starts from 0
// Update the ROLE_MAP to match the actual role IDs from the backend
const ROLE_MAP = {
  1: 'ADMIN',
  2: 'DAA',
  3: 'PL',
  4: 'TUTOR',
  5: 'STUDENT'
};

const ROUTES = {
  ADMIN: '/admin/dashboard',
  TUTOR: '/(tutor)/tutor',
  STUDENT: '/(students)/student',
  DAA: '/(tabs)/home',
  PL: '/(tutor)/tutor',  // PL will use the tutor route
  DEFAULT: '/home'
};

// Update the API_CONFIG to match your backend port
// Update API_CONFIG with the correct endpoint for email verification
// Update API_CONFIG to include debug mode
const API_CONFIG = {
  BASE_URL: Platform.select({
    web: 'http://localhost:5253/api',
    android: 'http://10.2.4.216:5253/api',
    ios: 'http://10.2.4.216:5253/api',
    default: 'http://10.2.4.216:5253/api'
  }),
  ENDPOINTS: {
    STAFFS: '/Staffs',
    ROLES: '/Roles',
    STUDENTS: '/Students'
  }
};

export default function GoogleSignInScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
  };

  // Add Toast import at the top
// Remove duplicate Toast import since it's already imported at the top
  
  // Update handleEmailVerification function
  const handleEmailVerification = async () => {
    if (!email || !validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
  
    try {
      setLoading(true);
      const trimmedEmail = email.toLowerCase().trim();
      
      // First check staff list
      const staffEndpoint = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.STAFFS}`;
      const studentEndpoint = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.STUDENTS}`;
      
      // Check staff first
      const staffResponse = await fetch(staffEndpoint);
      const staffList = await staffResponse.json();
      const staffMember = staffList.find(staff => staff.email.toLowerCase() === trimmedEmail);
  
      if (staffMember) {
        //console.log('Staff member raw data:', staffMember);
        console.log('Staff ID:', staffMember.staff_Id);
        console.log('Staff member data:', {
          roleId: staffMember.role_Id,
          roleName: staffMember.role?.role_Name
        });
        
        const role = ROLE_MAP[staffMember.role_Id];
        console.log('Mapped role:', role);
        
        if (!role) {
          Alert.alert('Error', 'Invalid role assignment. Please contact administrator.');
          return;
        }
  
        // Store user data with additional information
        const userInfo = {
          id: staffMember.id,
          staffId: staffMember.staff_Id,
          email: staffMember.email,
          name: staffMember.name,
          role: role,
          departmentId: staffMember.department_Id,
          departmentName: staffMember.department.department_Name,
          googleId: staffMember.google_Id,
          phoneNo: staffMember.phone_No,
          profilePicture: staffMember.profile_PictureURL,
          classes: staffMember.classes
        };
  
        await AsyncStorage.setItem('userData', JSON.stringify(userInfo));
  
        Toast.show({
          type: 'success',
          text1: 'Email Verified',
          text2: `Welcome ${userInfo.name} from ${userInfo.departmentName}`,
          position: 'bottom',
          visibilityTime: 2000,
        });
  
        // Updated navigation logic with proper error handling
        setTimeout(() => {
          console.log('Role before navigation:', role); // Debug log
          console.log('Available routes:', ROUTES); // Debug log
          
          switch (role) {
            case 'TUTOR':
              router.replace('/(tutor)/tutor');
              break;
            case 'DAA':
              router.replace('/(tabs)/home');
              break;
            case 'ADMIN':
              router.replace('/admin/dashboard');
              break;
            case 'STUDENT':
              router.replace('/(students)/student');
              break;
            default:
              console.error('Invalid role:', role);
              Alert.alert('Error', 'Invalid role configuration');
          }
        }, 2000);
  
      } else {
        // If not staff, check student list
        const studentResponse = await fetch(studentEndpoint);
        const studentList = await studentResponse.json();
        const student = studentList.find(student => student.email.toLowerCase() === trimmedEmail);
  
        if (student) {
          // Store student data with department info
          const userInfo = {
            id: student.id,
            studentId: student.student_Id,
            email: student.email,
            name: student.name,
            role: 'STUDENT',
            department_Id: student.department_Id,  // Keep the exact field name
            departmentName: student.department?.department_Name || 'Department Not Assigned',
            google_Id: student.google_Id,
            phone_No: student.phone_No,
            profile_PictureURL: student.profile_PictureURL,
            moduleIds: student.moduleIds || []  // Include existing moduleIds
          };
  
          await AsyncStorage.setItem('userData', JSON.stringify(userInfo));
  
          Toast.show({
            type: 'success',
            text1: 'Email Verified',
            text2: `Welcome ${userInfo.name} from ${userInfo.departmentName}`,
            position: 'bottom',
            visibilityTime: 2000,
          });
  
          setTimeout(() => {
            router.replace('/(students)/student');
          }, 2000);
        } else {
          Alert.alert('Error', 'Email not found in our records');
        }
      }
    } catch (error) {
      console.error('Verification error:', error);
      Alert.alert('Error', error.message || 'Failed to verify email');
    } finally {
      setLoading(false);
    }
  };

  // Add Toast component at the end of your return statement
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Google Sign In</Text>
        <Text style={styles.subtitle}>Enter your institutional email</Text>
      </View>

      <View style={styles.inputContainer}>
        <MaterialIcons name="email" size={24} color="#7647EB" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Email Address"
          placeholderTextColor="#888"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          autoComplete="email"
        />
      </View>

      <TouchableOpacity 
        style={[styles.verifyButton, loading && styles.buttonDisabled]}
        onPress={handleEmailVerification}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Verifying...' : 'Verify Email'}
        </Text>
      </TouchableOpacity>
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#7647EB',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#7647EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    height: 56,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    color: '#333',
    fontSize: 16,
  },
  verifyButton: {
    backgroundColor: '#7647EB',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#7647EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    backgroundColor: '#a78bfa',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});