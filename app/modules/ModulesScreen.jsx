import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'nativewind';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';

  const API_BASE_URL = Constants.expoConfig.extra.API_BASE_URL;

export default function ModulesScreen() {
  const params = useLocalSearchParams();
  console.log('ModulesScreen Params:', params);

  const { colorScheme, setColorScheme } = useColorScheme();
  const { year, departmentId, studentId } = params;
  const router = useRouter();

  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

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

        let endpoint;

        // STUDENT LOGIC (unchanged DAA logic)
        if (user.role.toLowerCase() === 'student') {
          // Use this endpoint for students:
          // GET /api/Students/{studentId}/classes
          endpoint = `${API_BASE_URL}/api/Students/${studentId}/classes`;
        } else {
          // DAA or HoD - keep existing behavior unchanged
          endpoint = `${API_BASE_URL}/api/Classes/department/${encodeURIComponent(departmentId)}${year ? `?yearLevel=${year}` : ''}`;
        }

        const response = await fetch(endpoint);
        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error:', errorText);
          throw new Error(`Failed to fetch modules: ${response.status}`);
        }

        const data = await response.json();

        // Transform the data to match your module card structure
        const formattedModules = data.map(classData => ({
          code: classData.enrollKey || '',
          name: classData.class_Name || '',
          instructor: classData.staff?.[0]?.name || 'Not Assigned',
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
        Alert.alert('Error', 'Failed to load modules. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, [departmentId, year, studentId]);

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

      {/* Year Selection Row - Only show for DAA/HoD */}
      {!studentId && (
        <View style={styles.yearSelection}>
          <Text style={[styles.yearLabel, { color: textColor }]}>Year:</Text>
          <View style={[styles.yearDropdown, { backgroundColor: PRIMARY_COLOR }]}>
            <Text style={styles.yearDropdownText}>{year || 'Select Year'}</Text>
          </View>
        </View>
      )}

      {/* Module List */}
      <FlatList
        data={modules}
        keyExtractor={(item) => item.class_Id.toString()}
        renderItem={renderModule}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

// Styles remain unchanged as per your original file
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
    backgroundColor: '#F5F5F5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
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
  moduleInstructor: {
    fontSize: 14,
    marginBottom: 8,
    color: '#666',
  },
  yearLevel: {
    fontSize: 14,
    marginBottom: 8,
    color: '#666',
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  dateText: {
    fontSize: 14,
    color: '#666',
  },
  listContent: {
    paddingBottom: 20,
  },
});