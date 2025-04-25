import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { Ionicons } from '@expo/vector-icons';
import { fetchYears } from '../api/name';

export default function DepartmentScreen() {
  const { colorScheme, setColorScheme } = useColorScheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState('Choose Year');
  const [years, setYears] = useState([]);
  const { name } = useLocalSearchParams();
  const router = useRouter();

  // Primary color and its variations
  const PRIMARY_COLOR = '#7647EB';
  const PRIMARY_LIGHT = '#9D7AFF';
  const PRIMARY_DARK = '#5B2DCF';

  const toggleMode = () => {
    setColorScheme(colorScheme === 'dark' ? 'light' : 'dark');
  };

  const handleProfileIconPress = () => {
    router.push('/profile/profile');
  };

  const handleBackButtonPress = () => {
    router.back();
  };

  useEffect(() => {
    const getYears = async () => {
      const response = await fetchYears();
      setYears(response);
    };
    getYears();
  }, []);

  // Color variables
  const isDarkMode = colorScheme === 'dark';
  const textColor = isDarkMode ? '#E2E2E2' : '#000';
  const backgroundColor = isDarkMode ? '#121212' : '#fff';
  const headerBg = isDarkMode ? '#1E1E1E' : '#F5F5F5';
  const cardBg = isDarkMode ? '#1E1E1E' : '#fff';
  const borderColor = isDarkMode ? '#3b3b3b' : '#e5e5e5';

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Header - Kept without primary color as requested */}
      <View style={[styles.header, { backgroundColor: headerBg }]}>
        {/* Left Side: Back Button and Profile Icon */}
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={handleBackButtonPress} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>

          {/* Profile Icon */}
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

        {/* Right Side: Notification and Mode Toggle */}
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

      {/* Year Selection Row - Using primary color */}
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
              onPress={() => {
                setSelectedYear(year);
                setIsDropdownOpen(false);
                router.push({
                  pathname: '/modules/ModulesScreen',
                  params: {
                    year: year,
                    departmentId: name  // Changed from userType to departmentId
                  }
                });
              }}
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