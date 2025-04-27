import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'nativewind';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { isModuleEnrolled } from '../api/enrollModule';

// Add API configuration
const API_CONFIG = {
  BASE_URL: Platform.select({
    web: 'http://localhost:5253/api',
    android: 'http://10.0.2.2:5253/api',
    ios: 'http://localhost:5253/api',
    default: 'http://localhost:5253/api'
  }),
  ENDPOINTS: {
    CLASSES: '/Classes',
    STUDENTS: '/Students',  // Added Students endpoint
    DEPARTMENTS: '/Departments'  // Added Departments endpoint
  }
};

export default function ModulesScreen() {
  const { colorScheme, setColorScheme } = useColorScheme();
  const params = useLocalSearchParams();
  console.log('All received params:', params);
  const { year, departmentId } = params;
  console.log('Extracted departmentId:', departmentId);
  const router = useRouter();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add theme colors
  const isDarkMode = colorScheme === 'dark';
  const textColor = isDarkMode ? '#E2E2E2' : '#000';
  const backgroundColor = isDarkMode ? '#121212' : '#FFF';
  const cardBg = isDarkMode ? '#1E1E1E' : '#F5F5F5';
  const borderColor = isDarkMode ? '#333' : '#E5E5E5';
  const PRIMARY_COLOR = '#7647EB';

  useEffect(() => {
    const fetchModules = async () => {
      try {
        setLoading(true);
        
        const userData = await AsyncStorage.getItem('userData');
        if (!userData) {
          Alert.alert('Error', 'User data not found');
          return;
        }

        const user = JSON.parse(userData);
        let endpoint;

        // If user is a student, keep the existing student endpoint
        if (user.role.toLowerCase() === 'student') {
          endpoint = `${API_CONFIG.BASE_URL}/Students/${user.id}/classes`;
        } else {
          // For DAA/PL, ONLY use the departmentId from params (selected department)
          if (!departmentId) {
            console.log('No department ID provided');
            Alert.alert('Error', 'Please select a department first');
            return;
          }
          
          // Log the departmentId to verify it's being passed correctly
          console.log('Attempting to fetch classes for department:', departmentId);
          
          // Ensure departmentId is properly formatted in the URL
          endpoint = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CLASSES}/department/${encodeURIComponent(departmentId)}`;
        }
        
        // Log the final endpoint for debugging
        console.log('Final endpoint:', endpoint);
        
        const response = await fetch(endpoint);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error:', errorText);
          throw new Error(`Failed to fetch modules: ${response.status}`);
        }

        const data = await response.json();
        console.log('API Response data:', data);
        
        // Transform the data to match your module card structure
        const formattedModules = data.map(classData => ({
          code: classData.enrollKey || '',
          name: classData.class_Name || '',
          instructor: classData.staff && classData.staff[0] ? classData.staff[0].name : 'Not Assigned',
          class_Id: classData.class_Id,
          startDate: classData.startDate || new Date().toISOString(),
          endDate: classData.endDate || new Date().toISOString(),
          moduleCode: classData.module_Code || '',
          yearLevel: classData.yearLevel || '',
          department: classData.departments && classData.departments[0] ? {
            id: classData.departments[0].department_Id,
            name: classData.departments[0].department_Name
          } : null,
          studentCount: classData.students ? classData.students.length : 0,
          staffDetails: classData.staff || []
        }));

        setModules(formattedModules);
      } catch (error) {
        console.error('Error fetching modules:', error);
        Alert.alert('Error', 'Failed to load modules');
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if we have a departmentId or if the user is a student
    fetchModules();
  }, [departmentId]);

  // Update the FlatList render item to include module code
  const renderModule = ({ item }) => (
    <TouchableOpacity
      style={[styles.moduleCard, { 
        backgroundColor: cardBg,
        borderColor: borderColor,
        borderWidth: 1
      }]}
      onPress={() => handleCardPress(item)}
    >
      <View style={styles.moduleHeader}>
        <Text style={[styles.moduleCode, { color: PRIMARY_COLOR }]}>{item.moduleCode}</Text>
        <Text style={[styles.moduleName, { color: textColor }]}>{item.name}</Text>
      </View>
      
      <Text style={[styles.moduleInstructor, { color: textColor }]}>
        Instructor: {item.instructor}
      </Text>

      <Text style={[styles.yearLevel, { color: textColor }]}>
        Year: {item.yearLevel}
      </Text>
      
      <View style={styles.dateContainer}>
        <Text style={[styles.dateText, { color: textColor }]}>
          Start: {new Date(item.startDate).toLocaleDateString()}
        </Text>
        <Text style={[styles.dateText, { color: textColor }]}>
          End: {new Date(item.endDate).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // Update handleCardPress for DAA view
  // Update handleCardPress to handle both DAA and student navigation
  const handleCardPress = async (item) => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (!userData) {
        Alert.alert('Error', 'User not found, please log in again');
        router.replace('/(auth)/signin');
        return;
      }

      const { role } = JSON.parse(userData);

      if (role.toLowerCase() === 'daa' || role.toLowerCase() === 'hod') {
        // DAA and HoD see module details
        router.push({
          pathname: '/modules/ModuleDetailScreen',
          params: {
            code: item.code,
            name: item.name,
            instructor: item.instructor,
            classId: item.class_Id
          }
        });
      } else if (role.toLowerCase() === 'student') {
        // Students are directed to enrollment page
        router.push({
          pathname: '/enrolmentKey/ModuleEnrollment',
          params: {
            code: item.code,
            name: item.name,
            instructor: item.instructor,
            classId: item.class_Id
          }
        });
      }
    } catch (error) {
      console.error('Error handling card press:', error);
      Alert.alert('Error', 'Failed to process request');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Updated Header */}
      <View style={styles.header}>
        <View style={styles.leftHeader}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={async () => {
              const userData = await AsyncStorage.getItem('userData');
              if (userData) {
                const userDataToPass = {
                  email: JSON.parse(userData).email
                };
                router.push({
                  pathname: "/profile/profile",
                  params: { userData: JSON.stringify(userDataToPass) }
                });
              }
            }} 
            style={styles.profileSection}
          >
            <Ionicons name="person-circle-outline" size={40} color={textColor} />
            <Text style={[styles.profileText, { color: textColor }]}>Modules</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.notificationIcon}>
            <Ionicons name="notifications-outline" size={24} color={textColor} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setColorScheme(colorScheme === 'dark' ? 'light' : 'dark')}>
            <Ionicons 
              name={isDarkMode ? "sunny-outline" : "moon-outline"} 
              size={24} 
              color={textColor} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Year Selection */}
      <View style={styles.yearSelection}>
        <Text style={[styles.yearLabel, { color: textColor }]}>Year:</Text>
        <View style={[styles.yearDropdown, { backgroundColor: PRIMARY_COLOR }]}>
          <Text style={styles.yearDropdownText}>{year}</Text>
        </View>
      </View>
      
      {/* Existing FlatList remains the same */}
      <FlatList
        data={modules}
        keyExtractor={(item) => (item && item.class_Id !== undefined) ? item.class_Id.toString() : Math.random().toString()}
        renderItem={renderModule}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

// Add new styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  leftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  profileText: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationIcon: {
    marginRight: 16,
  },
  yearSelection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  yearLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginRight: 10,
  },
  yearDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 25,
    width: '50%',
    marginRight: 10,
  },
  yearDropdownText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  moduleCard: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  moduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  moduleCode: {
    fontSize: 16,
    fontWeight: '600',
  },
  moduleName: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    marginLeft: 10,
  },
  moduleInstructor: {
    fontSize: 14,
    marginBottom: 10,
    color: '#666',
  },
  progressContainer: {
    marginTop: 10,
  },
  progressTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
  },
  classesText: {
    fontSize: 14,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  listContent: {
    paddingBottom: 20,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  dateText: {
    fontSize: 14,
    opacity: 0.8,
  },
});