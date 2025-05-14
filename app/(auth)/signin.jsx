import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Dimensions, KeyboardAvoidingView, Platform, Animated, Easing } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Link, router } from 'expo-router';
import { MaterialIcons, Ionicons, FontAwesome, Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import Toast from 'react-native-toast-message';

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;

// Configuration
const API_CONFIG = {
  BASE_URL: Platform.select({
    web: 'http://localhost:5253/api',
    android: 'http://10.2.24.196:5253/api',
    ios: 'http://10.2.24.196:5253/api',
    default: 'http://10.2.24.196:5253/api'
  }),
  ENDPOINTS: {
    LOGIN: '/login',
    STAFFS: '/Staffs',
    STUDENTS: '/Students',
    ROLES: '/Roles'
  }
};

let ROLE_MAP = {};

const ROUTES = {
  ADMIN: '/admin/dashboard',
  TUTOR: '/(tutor)/tutor',
  STUDENT: '/(students)/student',
  DAA: '/(tabs)/home',
  PL: '/(tutor)/tutor',
  DEFAULT: '/home'
};

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(height * 0.1));
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

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.back(1)),
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      router.push('/google-signin');
    } catch (error) {
      console.error('Google Sign In error:', error);
      Alert.alert('Error', 'Failed to initiate Google Sign In');
    }
  };

  const validateInputs = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return false;
    }

    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return false;
    }

    return true;
  };

 const handleLogin = async () => {
  if (!validateInputs()) return;
  if (!rolesLoaded) {
    Alert.alert('Error', 'Role information is still loading. Please wait.');
    return;
  }

  try {
    setLoading(true);
    const trimmedEmail = email.toLowerCase().trim();
    
    // First authenticate with the login endpoint
    const loginResponse = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email: trimmedEmail, 
        password 
      })
    });

    if (!loginResponse.ok) {
      throw new Error('Invalid email or password');
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;

    // Now find the user's role by checking staff and student endpoints
    const staffEndpoint = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.STAFFS}`;
    const studentEndpoint = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.STUDENTS}`;
    
    // Check staff first
    const staffResponse = await fetch(staffEndpoint);
    const staffList = await staffResponse.json();
    const staffMember = staffList.find(staff => staff.email.toLowerCase() === trimmedEmail);

    if (staffMember) {
      const role = ROLE_MAP[staffMember.role_Id];
      
      if (!role) {
        throw new Error('Invalid role assignment. Please contact administrator.');
      }

      const userInfo = {
        id: staffMember.id,
        staffId: staffMember.staff_Id,
        email: staffMember.email,
        name: staffMember.name,
        role: role,
        departmentId: staffMember.department_Id,
        departmentName: staffMember.department?.department_Name || 'Department Not Assigned',
        token: token,
        phoneNo: staffMember.phone_No,
        profilePicture: staffMember.profile_PictureURL,
        classes: staffMember.classes || []
      };

      await handleUserLoginSuccess(userInfo);
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
          departmentId: student.department_Id,
          departmentName: student.department?.department_Name || 'Department Not Assigned',
          token: token,
          phoneNo: student.phone_No,
          profilePicture: student.profile_PictureURL,
          moduleIds: student.moduleIds || []
        };

        await handleUserLoginSuccess(userInfo);
      } else {
        throw new Error('Email not found in our records');
      }
    }
  } catch (error) {
    console.error('Login error:', error);
    Toast.show({
      type: 'error',
      text1: 'Login Failed',
      text2: error.message || 'Invalid credentials',
      position: 'bottom',
      visibilityTime: 3000,
    });
  } finally {
    setLoading(false);
  }
};

const handleUserLoginSuccess = async (userInfo) => {
  // Store user data based on remember me preference
  if (rememberMe) {
    await AsyncStorage.setItem('userData', JSON.stringify(userInfo));
  }
  // if (userInfo.token) {
  //   await AsyncStorage.setItem('authToken', userInfo.token);
  // }

  Toast.show({
    type: 'success',
    text1: 'Login Successful',
    text2: `Welcome ${userInfo.name}`,
    position: 'bottom',
    visibilityTime: 2000,
  });

  setTimeout(() => {
    switch (userInfo.role) {
      case 'ADMIN':
        router.replace(ROUTES.ADMIN);
        break;
      case 'TUTOR':
      case 'PL':
        router.replace(ROUTES.TUTOR);
        break;
      case 'DAA':
        router.replace(ROUTES.DAA);
        break;
      case 'STUDENT':
        router.replace(ROUTES.STUDENT);
        break;
      default:
        console.error('Invalid role:', userInfo.role);
        router.replace(ROUTES.DEFAULT);
    }
  }, 2000);
};

  const toggleRememberMe = () => {
    setRememberMe(!rememberMe);
  };

  const toggleSecureText = () => {
    setSecureText(!secureText);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
    >
      <Animated.View 
        style={[
          styles.innerContainer,
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to CST Attendance Management System</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
        </View>
    
        {/* Email Input */}
        <View style={styles.inputContainer}>
          <MaterialIcons 
            name="email" 
            size={isSmallDevice ? 20 : 24} 
            color="#7647EB" 
            style={styles.icon} 
          />
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            placeholderTextColor="#888"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            autoComplete="email"
            textContentType="emailAddress"
          />
        </View>
    
        {/* Password Input */}
        <View style={styles.inputContainer}>
          <Ionicons 
            name="lock-closed" 
            size={isSmallDevice ? 18 : 20} 
            color="#7647EB" 
            style={styles.icon} 
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#888"
            secureTextEntry={secureText}
            value={password}
            onChangeText={setPassword}
            autoComplete="password"
            textContentType="password"
          />
          <TouchableOpacity onPress={toggleSecureText}>
            <Ionicons 
              name={secureText ? "eye-off" : "eye"} 
              size={isSmallDevice ? 20 : 24} 
              color="#7647EB" 
              style={styles.icon} 
            />
          </TouchableOpacity>
        </View>
    
        {/* Remember Me and Forgot Password */}
        <View style={styles.optionsContainer}>
          <TouchableOpacity 
            style={styles.rememberMeContainer} 
            onPress={toggleRememberMe}
            activeOpacity={0.7}
          >
            <Feather 
              name={rememberMe ? "check-square" : "square"} 
              size={isSmallDevice ? 16 : 20} 
              color={rememberMe ? "#7647EB" : "#888"} 
            />
            <Text style={styles.rememberText}>Remember me</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>
    
        {/* Sign In Button */}
        <TouchableOpacity 
          style={[styles.signInButton, (loading || !rolesLoaded) && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading || !rolesLoaded}
          activeOpacity={0.8}
        >
          <Text style={styles.signInButtonText}>
            {!rolesLoaded ? 'Loading...' : loading ? 'Signing In...' : 'Sign In'}
          </Text>
        </TouchableOpacity>
    
        {/* Or Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>Or continue with</Text>
          <View style={styles.dividerLine} />
        </View>
    
        {/* Google Sign-In Button */}
        <TouchableOpacity 
          style={styles.googleButton}
          onPress={handleGoogleSignIn}
          activeOpacity={0.7}
        >
          <FontAwesome 
            name="google" 
            size={isSmallDevice ? 18 : 22} 
            color="#7647EB" 
            style={styles.googleIcon} 
          />
          <Text style={styles.googleText}>Continue with Google</Text>
        </TouchableOpacity>
    
        {/* Link to Admin Info */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <Link href="/admininfo" style={styles.link}>Contact Admin</Link>
        </View>
        
        <Toast />
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: width * 0.07,
    paddingBottom: height * 0.03,
  },
  header: {
    marginBottom: height * 0.04,
  },
  title: {
    fontSize: width < 375 ? 20 : 24,
    fontWeight: '700',
    color: '#7647EB',
    marginBottom: 8,
    textAlign: 'center',
    lineHeight: width < 375 ? 26 : 30,
  },
  subtitle: {
    fontSize: width < 375 ? 14 : 16,
    color: '#666',
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: height * 0.02,
    shadowColor: '#7647EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    height: height * 0.07,
    maxHeight: 56,
  },
  input: {
    flex: 1,
    height: '100%',
    color: '#333',
    fontSize: width < 375 ? 14 : 16,
    paddingVertical: 0,
  },
  icon: {
    marginRight: 10,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: height * 0.03,
    alignItems: 'center',
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rememberText: {
    color: '#555',
    marginLeft: 8,
    fontSize: width < 375 ? 12 : 14,
  },
  forgotPasswordText: {
    color: '#7647EB',
    fontSize: width < 375 ? 12 : 14,
    fontWeight: '500',
  },
  signInButton: {
    width: '100%',
    backgroundColor: '#7647EB',
    padding: height * 0.02,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: height * 0.03,
    shadowColor: '#7647EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    backgroundColor: '#a78bfa',
  },
  signInButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: width < 375 ? 14 : 16,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: height * 0.03,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#888',
    fontSize: width < 375 ? 12 : 14,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    backgroundColor: '#fff',
    borderColor: '#e0e0e0',
    borderWidth: 1,
    padding: height * 0.015,
    borderRadius: 12,
    marginBottom: height * 0.02,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  googleIcon: {
    marginRight: 10,
  },
  googleText: {
    color: '#7647EB',
    fontWeight: '600',
    fontSize: width < 375 ? 14 : 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: height * 0.02,
    flexWrap: 'wrap',
  },
  footerText: {
    color: '#666',
    fontSize: width < 375 ? 12 : 14,
  },
  link: {
    color: '#7647EB',
    marginLeft: 5,
    fontWeight: '500',
    fontSize: width < 375 ? 12 : 14,
  },
});