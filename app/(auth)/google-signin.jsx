import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Dimensions, Platform } from 'react-native';
import React, { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import Toast from 'react-native-toast-message';

const { width, height } = Dimensions.get('window');

// Initialize ROLE_MAP as empty object, will be populated after fetching roles
let ROLE_MAP = {};

const ROUTES = {
  ADMIN: '/admin/dashboard',
  TUTOR: '/(tutor)/tutor',
  STUDENT: '/(students)/student',
  DAA: '/(tabs)/home',
  PL: '/(tutor)/tutor',
  DEFAULT: '/home'
};

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
  const [rolesLoaded, setRolesLoaded] = useState(false);

  // Fetch roles when component mounts
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ROLES}`);
        const roles = await response.json();
        
        // Create ROLE_MAP dynamically
        roles.forEach(role => {
          ROLE_MAP[role.id] = role.normalizedName;
        });
        
        setRolesLoaded(true);
      } catch (error) {
        console.error('Failed to fetch roles:', error);
        Alert.alert('Error', 'Failed to load role information. Please try again later.');
      }
    };

    fetchRoles();
  }, []);

  const validateEmail = (email) => {
    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
  };

  const handleEmailVerification = async () => {
    if (!rolesLoaded) {
      Alert.alert('Error', 'Role information is still loading. Please wait.');
      return;
    }

    if (!email || !validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
  
    try {
      setLoading(true);
      const trimmedEmail = email.toLowerCase().trim();
      
      const staffEndpoint = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.STAFFS}`;
      const studentEndpoint = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.STUDENTS}`;
      
      // Check staff first
      const staffResponse = await fetch(staffEndpoint);
      const staffList = await staffResponse.json();
      const staffMember = staffList.find(staff => staff.email.toLowerCase() === trimmedEmail);
  
      if (staffMember) {
        console.log('Staff member data:', {
          roleId: staffMember.role_Id,
        });
        
        const role = ROLE_MAP[staffMember.role_Id];
        console.log('Mapped role:', role);
        
        if (!role) {
          Alert.alert('Error', 'Invalid role assignment. Please contact administrator.');
          return;
        }
  
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
  
        setTimeout(() => {
          console.log('Role before navigation:', role);
          console.log('Available routes:', ROUTES);
          
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
          const userInfo = {
            id: student.id,
            studentId: student.student_Id,
            email: student.email,
            name: student.name,
            role: 'STUDENT',
            department_Id: student.department_Id,
            departmentName: student.department?.department_Name || 'Department Not Assigned',
            google_Id: student.google_Id,
            phone_No: student.phone_No,
            profile_PictureURL: student.profile_PictureURL,
            moduleIds: student.moduleIds || []
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
        style={[styles.verifyButton, (loading || !rolesLoaded) && styles.buttonDisabled]}
        onPress={handleEmailVerification}
        disabled={loading || !rolesLoaded}
      >
        <Text style={styles.buttonText}>
          {!rolesLoaded ? 'Loading...' : loading ? 'Verifying...' : 'Verify Email'}
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