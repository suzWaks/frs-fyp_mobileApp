import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { Ionicons } from '@expo/vector-icons';

// API Config
const API_BASE_URL = 'http://10.2.5.57:5253'; // From your logs

export default function StudentModulesScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const { colorScheme } = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  // Theme Colors
  const textColor = isDarkMode ? '#E2E2E2' : '#000';
  const backgroundColor = isDarkMode ? '#121212' : '#FFF';
  const cardBg = isDarkMode ? '#1E1E1E' : '#F5F5F5';
  const borderColor = isDarkMode ? '#333' : '#E5E5E5';
  const PRIMARY_COLOR = '#7647EB';

  const { studentId, year } = params;

  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch classes for student
  useEffect(() => {
    const fetchStudentClasses = async () => {
      try {
        if (!studentId) {
          console.warn('No studentId provided');
          return;
        }

        const url = `${API_BASE_URL}/api/Students/${studentId}/classes`;
        console.log('Fetching from:', url); // 👈 DEBUGGING LINE

        const response = await fetch(url);

        if (!response.ok) {
          const errorText = await response.text(); // Get error body
          console.error('Failed to fetch modules:', errorText);
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Map the data into module format
        const formattedModules = data.map((cls) => ({
          class_Id: cls.class_Id,
          name: cls.class_Name,
          moduleCode: cls.module_Code,
          enrollKey: cls.enrollKey || '',
          yearLevel: cls.yearLevel,
          startDate: cls.startDate,
          endDate: cls.endDate,
          instructor: cls.staff?.[0]?.name || 'Not Assigned',
        }));

        setModules(formattedModules);
      } catch (error) {
        console.error('Error fetching student classes:', error);
        alert('Failed to load modules. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentClasses();
  }, [studentId]);

  // Handle card press
  const handleCardPress = (item) => {
    router.push({
      pathname: '/enrolmentKey/ModuleEnrollment',
      params: {
        code: item.enrollKey,
        name: item.name,
        instructor: item.instructor,
        classId: item.class_Id,
      },
    });
  };

  // Render Each Module Card
  const renderModule = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.moduleCard,
        {
          backgroundColor: cardBg,
          borderColor: borderColor,
          borderWidth: 1,
        },
      ]}
      onPress={() => handleCardPress(item)}
    >
      <View style={styles.moduleHeader}>
        <Text style={[styles.moduleCode, { color: PRIMARY_COLOR }]}>
          {item.moduleCode}
        </Text>
        <Text style={[styles.moduleName, { color: textColor }]}>
          {item.name}
        </Text>
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
          <TouchableOpacity style={styles.profileSection}>
            <Ionicons name="person-circle-outline" size={40} color={textColor} />
            <Text style={[styles.profileText, { color: textColor }]}>
              Modules
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.notificationIcon}>
            <Ionicons name="notifications-outline" size={24} color={textColor} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              setColorScheme(isDarkMode ? 'light' : 'dark')
            }
          >
            <Ionicons
              name={isDarkMode ? 'sunny-outline' : 'moon-outline'}
              size={24}
              color={textColor}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Year Selection Row */}
      <View style={styles.yearSelection}>
        <Text style={[styles.yearLabel, { color: textColor }]}>Year:</Text>
        <View style={[styles.yearDropdown, { backgroundColor: PRIMARY_COLOR }]}>
          <Text style={styles.yearDropdownText}>{year || 'First Year'}</Text>
        </View>
      </View>

      {/* Module List */}
      <FlatList
        data={modules}
        renderItem={renderModule}
        keyExtractor={(item) => item.class_Id.toString()}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

// Reuse Styles from Original ModulesScreen
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