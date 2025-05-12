import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { Ionicons } from '@expo/vector-icons';
import { fetchYears } from '../api/name'; // Make sure this exists

export default function StudentDepartmentScreen() {
  const { colorScheme, setColorScheme } = useColorScheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState('Choose Year');
  const [years, setYears] = useState([]);

  const router = useRouter();

  // Primary color
  const PRIMARY_COLOR = '#7647EB';

  // Toggle between dark/light mode
  const toggleMode = () => {
    setColorScheme(colorScheme === 'dark' ? 'light' : 'dark');
  };

  // Handle back button press
  const handleBackButtonPress = () => {
    router.back();
  };

  // Navigate to profile
  const handleProfileIconPress = () => {
    router.push('/student/profile/StudentProfileScreen');
  };

  // Fetch available years (mocked or API-based)
  useEffect(() => {
    const getYears = async () => {
      try {
        const response = await fetchYears(); // Replace with actual data as needed
        setYears(response);
      } catch (error) {
        console.error('Error fetching years:', error);
      }
    };
    getYears();
  }, []);

  // Handle year selection and navigate
  const handleYearSelect = async (year) => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (!userData) {
        Alert.alert('Error', 'User data not found');
        return;
      }

      const user = JSON.parse(userData);
      setSelectedYear(year);
      setIsDropdownOpen(false);

      // Navigate to modules screen with student ID and year
      router.push({
        pathname: '/enrolmentKey/StudentModulesScreen',
        params: {
          year: year,
          studentId: user.id,
          departmentId: user.department_Id
        }
      });
    } catch (error) {
      console.error('Error handling year selection:', error);
      Alert.alert('Error', 'Failed to process your selection');
    }
  };

  // Color variables
  const isDarkMode = colorScheme === 'dark';
  const textColor = isDarkMode ? '#E2E2E2' : '#000';
  const backgroundColor = isDarkMode ? '#121212' : '#fff';
  const headerBg = isDarkMode ? '#1E1E1E' : '#F5F5F5';
  const cardBg = isDarkMode ? '#1E1E1E' : '#fff';
  const borderColor = isDarkMode ? '#3b3b3b' : '#e5e5e5';

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: headerBg }]}>
        <View style={styles.headerLeft}>
          {/* Back Button */}
          <TouchableOpacity onPress={handleBackButtonPress} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>

          {/* Profile Icon + Label */}
          <TouchableOpacity 
            onPress={handleProfileIconPress} 
            style={[styles.profileContainer, { marginLeft: 12 }]}
          >
            <View style={[styles.profileImage, { backgroundColor: isDarkMode ? '#333' : '#eee' }]}>
              <Ionicons name="person" size={20} color={textColor} />
            </View>
            <Text style={[styles.headerTitle, { color: textColor }]}>Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Right Side Icons */}
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.notificationIcon}>
            <Ionicons name="notifications-outline" size={24} color={textColor} />
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleMode}>
            <Ionicons 
              name={isDarkMode ? "sunny-outline" : "moon-outline"} 
              size={24} 
              color={textColor} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Year Selection Row */}
      <View style={styles.yearRow}>
        <Text style={[styles.yearLabel, { color: textColor }]}>Year:</Text>
        <TouchableOpacity
          style={[styles.dropdown, { backgroundColor: PRIMARY_COLOR }]}
          onPress={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <Text style={[styles.dropdownText, { color: '#fff' }]}>{selectedYear}</Text>
          <Ionicons
            name={isDropdownOpen ? "chevron-up" : "chevron-down"}
            size={24}
            color="#fff"
          />
        </TouchableOpacity>
      </View>

      {/* Dropdown List */}
      {isDropdownOpen && (
        <View style={[
          styles.dropdownList, 
          { 
            backgroundColor: cardBg,
            borderColor: borderColor,
            borderWidth: 1
          }
        ]}>
          {years.map((year, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.dropdownItem, { 
                borderBottomColor: borderColor,
                backgroundColor: index % 2 === 0 ? cardBg : (isDarkMode ? '#2A2A2A' : '#F5F5F5')
              }]}
              onPress={() => handleYearSelect(year)}
            >
              <Text style={[styles.dropdownItemText, { color: textColor }]}>{year}</Text>
              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color={PRIMARY_COLOR} 
              />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginTop: 40,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationIcon: {
    padding: 8,
    marginRight: 12,
  },
  yearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  yearLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginRight: 10,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 25,
    width: '70%',
  },
  dropdownText: {
    fontSize: 16,
    fontWeight: '500',
  },
  dropdownList: {
    position: 'absolute',
    top: 180,
    right: 20,
    width: '70%',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1000,
  },
  dropdownItem: {
    padding: 16,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownItemText: {
    fontSize: 16,
  },
});