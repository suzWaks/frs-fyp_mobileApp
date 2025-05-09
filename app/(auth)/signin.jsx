// Move these to the top with other imports
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Dimensions, KeyboardAvoidingView, Platform, Animated, Easing } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Link, router } from 'expo-router';
import { MaterialIcons, Ionicons, FontAwesome, Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Add this right after the imports and before any other code
const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;

// Configuration
// Update API_CONFIG to use HTTP instead of HTTPS
const API_CONFIG = {
  BASE_URL: Constants.expoConfig?.extra?.API_BASE_URL || 'http://192.168.137.249:5253/api',  // Updated for Android emulator
  ENDPOINTS: {
    STAFFS: '/Staffs',
    STUDENTS: '/Students'
  }
};

// Add logging to debug API calls
// Add these constants after API_CONFIG
const ROLE_MAP = {
  1: 'TUTOR',
  2: 'DAA',
  3: 'ADMIN',
  4: 'STUDENT'
};

const ROUTES = {
  ADMIN: '/admin/dashboard',
  TUTOR: '/(tutor)/tutor',
  STUDENT: '/(students)/student',
  DAA: '/(tabs)/home',
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
  
  // Add useEffect for animation
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
  
  // Move these functions inside the component
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

    return true;
  };

  const handleLogin = async () => {
    if (!validateInputs()) return;
  
    try {
      setLoading(true);
      const trimmedEmail = email.toLowerCase().trim();
      
      console.log('Attempting to connect to:', `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.STAFFS}`);

      // First, try staff endpoint
      let response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.STAFFS}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: trimmedEmail, password })
      });

      console.log('Staff endpoint response status:', response.status);
      // If not found in staff, try student endpoint
      if (!response.ok) {
        response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.STUDENTS}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: trimmedEmail, password })
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Authentication failed');
      }

      const data = await response.json();
      await handleSuccessfulLogin(data);
    } catch (error) {
      handleLoginError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessfulLogin = async (data) => {
    try {
      // Handle both data structures (Google sign-in and regular sign-in)
      const user = data.user || data;
      const token = data.token || null;
      
      // Get role name from either role_Id or existing role
      let roleName;
      if (user.role_Id) {
        roleName = ROLE_MAP[user.role_Id];
        console.log('Role mapped from role_Id:', roleName);
      } else {
        roleName = user.role?.toUpperCase();
        console.log('Role from user object:', roleName);
      }
  
      if (!roleName) {
        throw new Error('Invalid role assignment');
      }
  
      const userData = {
        id: user.staff_Id || user.id,
        email: user.email,
        role: roleName,
        name: user.name,
        departmentId: user.department_Id || user.departmentId,
        token
      };
  
      console.log('Storing user data:', userData);
      
      // Store user data based on authentication type
      if (rememberMe || !token) {
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
      } else {
        await AsyncStorage.setItem('authToken', token);
      }
  
      const route = ROUTES[roleName];
      console.log('Navigating to route:', route);
  
      Alert.alert('Success', `Welcome ${userData.name}`, [
        {
          text: 'OK',
          onPress: () => router.replace(route)
        }
      ]);
    } catch (error) {
      console.error('Login success handling error:', error);
      Alert.alert('Error', 'Failed to process login. Please try again.');
    }
  };

  const handleLoginError = (error) => {
    console.error('Sign in error:', error);
    let errorMessage = 'An error occurred during sign in';
    
    if (error.message.includes('Network request failed')) {
      errorMessage = 'Network error. Please check your connection.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    Alert.alert('Error', errorMessage);
  };

  const toggleRememberMe = () => {
    setRememberMe(!rememberMe);
  };
  
  // Return statement should be inside the component
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
          <TouchableOpacity 
            onPress={() => setSecureText(!secureText)}
            activeOpacity={0.7}
          >
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
          style={[styles.signInButton, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.8}
        >
          <Text style={styles.signInButtonText}>
            {loading ? 'Signing In...' : 'Sign In'}
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