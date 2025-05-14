import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'nativewind';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';

const API_BASE_URL = Constants.expoConfig.extra.API_BASE_URL;

// Add the formatDate function before the component
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export default function StudentModulesScreen() {
  const params = useLocalSearchParams();
  console.log('StudentModulesScreen Params:', params);

  const { colorScheme, setColorScheme } = useColorScheme();
  const { year, departmentId, studentId } = params;
  const router = useRouter();

  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [classData, setClassData] = useState({}); // New state to store class_Id and enrollKey pairs

  // Theme colors
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
        console.log('User Data from Storage:', user); // Debug log

        // If departmentId is not in params, use it from user data
        const departmentIdToUse = departmentId || user.department_Id;
        console.log('Department ID being used:', departmentIdToUse); // Debug log

        if (!departmentIdToUse) {
          Alert.alert('Error', 'Department ID not found');
          return;
        }

        // Use the same endpoint as ModulesScreen with the correct departmentId
        const endpoint = `${API_BASE_URL}/Classes/department/${encodeURIComponent(departmentIdToUse)}${year ? `?yearLevel=${year}` : ''}`;
        console.log('Fetching from:', endpoint);

        const response = await fetch(endpoint);
        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error:', errorText);
          throw new Error(`Failed to fetch modules: ${response.status}`);
        }

        const data = await response.json();

        // Store class_Id and enrollKey pairs separately
        const classDataMap = {};
        data.forEach(classInfo => {
          classDataMap[classInfo.class_Id] = {
            enrollKey: classInfo.enrollKey || '',
            class_Id: classInfo.class_Id
          };
        });
        setClassData(classDataMap);

        // Transform the data to match your module card structure
        const formattedModules = data.map(classData => ({
          name: classData.class_Name || 'Untitled',
          instructor: classData.staff?.[0]?.name || 'Not Assigned',
          startDate: classData.startDate || new Date().toISOString(),
          endDate: classData.endDate || new Date().toISOString(),
          moduleCode: classData.module_Code || 'No Code',
          yearLevel: classData.yearLevel || '',
          class_Id: classData.class_Id || '',
          department: classData.departments && classData.departments[0] ? {
            id: classData.departments[0].department_Id,
            name: classData.departments[0].department_Name
          } : null,
          staffDetails: classData.staff || []
        }));

        // Filter modules based on year level
        const yearMapping = {
          'first year': '1',
          'second year': '2',
          'third year': '3',
          'fourth year': '4'
        };
        const numericYear = yearMapping[year.toLowerCase()];
        
        const filteredModules = formattedModules.filter(module => 
          module.yearLevel === numericYear
        );

        setModules(filteredModules);

      } catch (error) {
        console.error('Error fetching modules:', error);
        Alert.alert('Error', 'Failed to load modules. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, [departmentId, year]);

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
        <Text style={[styles.moduleCode, { color: PRIMARY_COLOR }]}>{item.moduleCode || 'No Code'}</Text>
        <Text style={[styles.moduleName, { color: textColor }]}>{item.name || 'Untitled'}</Text>
      </View>
      <Text style={[styles.instructor, { color: textColor }]}>
        Instructor: {item.instructor || 'Not Assigned'}
      </Text>
      <View style={styles.dateContainer}>
        <Text style={[styles.dateText, { color: textColor }]}>
          Start: {formatDate(item.startDate)}
        </Text>
        <Text style={[styles.dateText, { color: textColor }]}>
          End: {formatDate(item.endDate)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // Add the missing style
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
    moduleCard: {
      padding: 15,
      borderRadius: 10,
      marginBottom: 15,
      backgroundColor: '#F5F5F5',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 5,
      elevation: 3,
      width: '100%',
    },
    moduleHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    moduleCode: {
      fontSize: 16,
      fontWeight: '600',
      color: '#7647EB',
      marginRight: 10,
    },
    moduleName: {
      fontSize: 16,
      fontWeight: '500',
      flex: 1,
    },
    yearLevel: {
      fontSize: 14,
      marginBottom: 8,
      color: '#666',
    },
    enrollKey: {
      fontSize: 14,
      marginBottom: 8,
      color: '#666',
      fontWeight: '500',
    },
    dateContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 8,
    },
    dateText: {
      fontSize: 14,
      opacity: 0.8,
    },
    listContent: {
      paddingBottom: 20,
      width: '100%',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 18,
      textAlign: 'center',
    }
  });

  const handleCardPress = async (item) => {
    try {
      const classInfo = classData[item.class_Id];
      console.log('Class Info:', classInfo); // Debug log
      
      router.push({
        pathname: '/enrolmentKey/ModuleEnrollment',
        params: {
          code: classInfo?.enrollKey || '',
          name: item.name,
          instructor: item.instructor,
          classId: item.class_Id,
          studentId: studentId // Pass the studentId from params
        }
      });
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
      {/* Header */}
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
            <Text style={[styles.profileText, { color: textColor }]}>My Modules</Text>
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

      {/* Module List */}
      {modules.length > 0 ? (
        <FlatList
          data={modules}
          keyExtractor={(item) => item.class_Id.toString()}
          renderItem={renderModule}
          contentContainerStyle={styles.listContent}
          style={{ width: '100%' }}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: textColor }]}>
            No modules found for this student
          </Text>
        </View>
      )}
    </View>
  );
}