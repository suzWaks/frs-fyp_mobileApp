import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'nativewind';
import { Ionicons } from '@expo/vector-icons';
import { isModuleEnrolled } from '../api/enrollModule'; // Import the mock API

const modules = [
  { code: 'CTE-411', name: 'Artificial Intelligence', instructor: 'Mr. Manoj Chhetri', progress: '25%', totalClasses: 12 },
  { code: 'DIS-404', name: 'Management Information System', instructor: 'Mr. Kewang Dewan', progress: '25%', totalClasses: 12 },
  { code: 'MAT-412', name: 'Optimization Techniques', instructor: 'Mr. Jayne Namgyal', progress: '25%', totalClasses: 12 },
  { code: 'ITM-404', name: 'Professional Practices', instructor: 'Mr. Yodi Jamtsho', progress: '25%', totalClasses: 12 },
];

export default function ModulesScreen() {
  const colorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark');
  const [userRole, setUserRole] = useState(null);
  const { year } = useLocalSearchParams(); // Retrieve the year from the navigation parameters
  const router = useRouter();

  useEffect(() => {
    const getUserRole = async () => {
      const role = await AsyncStorage.getItem('userRole');
      setUserRole(role);
    };
    getUserRole();
  }, []);

  const toggleMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleProfileIconPress = () => {
    router.push('/profile/profile'); // Navigate to the profile screen
  };

  const textColor = isDarkMode ? '#a9b1d6' : '#000';
  const backgroundColor = isDarkMode ? '#1a1b26' : '#fff';
  const headerBg = isDarkMode ? '#24283b' : '#F0F0FF';
  const primaryColor = isDarkMode ? '#7aa2f7' : '#6B4EFF';

  const handleCardPress = async (item) => {
    const enrolled = await isModuleEnrolled(item.code);
    if (enrolled) {
      router.push('/enrolmentKey/HomeWithModules');
    } else {
      if (userRole === 'hod') {
        router.push(`/modules/ModuleDetailScreen?code=${item.code}&name=${item.name}&instructor=${item.instructor}`);
      } else {
        router.push(`/enrolmentKey/ModuleEnrollment?code=${item.code}&name=${item.name}&instructor=${item.instructor}`);
      }
    }
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleProfileIconPress} style={styles.profileSection}>
          <Ionicons name="person-circle-outline" size={40} color={textColor} />
          <Text style={[styles.profileText, { color: textColor }]}>Profile</Text>
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <Ionicons name="notifications-outline" size={24} color={textColor} style={styles.notificationIcon} />
          <TouchableOpacity onPress={toggleMode}>
            <Ionicons name={isDarkMode ? "sunny-outline" : "moon-outline"} size={24} color={textColor} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Year Selection */}
      <View style={styles.yearSelection}>
        <Text style={[styles.yearLabel, { color: textColor }]}>Year:</Text>
        <TouchableOpacity style={[styles.yearDropdown, { backgroundColor: primaryColor }]}>
          <Text style={styles.yearDropdownText}>{year}</Text>
          <Ionicons name="chevron-down" size={24} color="#fff" />
        </TouchableOpacity>
        {userRole !== 'student' && (
          <TouchableOpacity
            style={styles.viewStudentsButton}
            onPress={() => router.push(`/modules/StudentListScreen?year=${year}`)}
          >
            <Text style={[styles.viewStudentsText, { color: primaryColor }]}>View Students</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Modules List */}
      <FlatList
        data={modules}
        keyExtractor={(item) => item.code}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.moduleCard, { backgroundColor: headerBg }]}
            onPress={() => handleCardPress(item)}
          >
            <View style={styles.moduleHeader}>
              <Text style={[styles.moduleCode, { color: primaryColor }]}>{item.code}</Text>
              <Text style={[styles.moduleName, { color: textColor }]}>{item.name}</Text>
            </View>
            <Text style={[styles.moduleInstructor, { color: textColor }]}>{item.instructor}</Text>
            <View style={styles.moduleFooter}>
              <Text style={[styles.moduleProgress, { color: textColor }]}>{item.progress} complete</Text>
              <Text style={[styles.moduleTotalClasses, { color: textColor }]}>Total classes: {item.totalClasses}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

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
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginRight: 16, // Add margin to create gap
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
  viewStudentsButton: {
    padding: 10,
  },
  viewStudentsText: {
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
    fontWeight: '600',
  },
  moduleInstructor: {
    fontSize: 14,
    marginBottom: 10,
  },
  moduleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moduleProgress: {
    fontSize: 14,
  },
  moduleTotalClasses: {
    fontSize: 14,
  },
});