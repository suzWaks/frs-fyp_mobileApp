import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { Ionicons } from '@expo/vector-icons';
import { fetchYears } from '../api/name'; // Import the mock API

export default function DepartmentScreen() {
  const colorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState('Choose Year');
  const [years, setYears] = useState([]);
  const { name } = useLocalSearchParams();
  const router = useRouter();

  const toggleMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleProfileIconPress = () => {
    router.push('/profile/profile'); // Navigate to the profile screen
  };

  useEffect(() => {
    const getYears = async () => {
      const response = await fetchYears();
      setYears(response);
    };
    getYears();
  }, []);

  const textColor = isDarkMode ? '#a9b1d6' : '#000';
  const backgroundColor = isDarkMode ? '#1a1b26' : '#fff';
  const dropdownBg = isDarkMode ? '#24283b' : '#F0F0FF';
  const primaryColor = isDarkMode ? '#7aa2f7' : '#6B4EFF';

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleProfileIconPress} style={styles.headerLeft}>
          <View style={[styles.profileImage, { backgroundColor: dropdownBg }]}>
            <Ionicons name="person" size={20} color={textColor} />
          </View>
          <Text style={[styles.headerTitle, { color: textColor }]}>Profile</Text>
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.notificationIcon}>
            <Ionicons name="notifications-outline" size={24} color={textColor} />
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleMode}>
            <Ionicons name={isDarkMode ? "sunny-outline" : "moon-outline"} size={24} color={textColor} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Year Selection Row */}
      <View style={styles.yearRow}>
        <Text style={[styles.yearLabel, { color: textColor }]}>Year:</Text>
        <TouchableOpacity
          style={[styles.dropdown, { backgroundColor: primaryColor }]}
          onPress={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <Text style={[styles.dropdownText, { color: '#fff' }]}>
            {selectedYear}
          </Text>
          <Ionicons 
            name={isDropdownOpen ? "chevron-up" : "chevron-down"} 
            size={24} 
            color="#fff"
          />
        </TouchableOpacity>
      </View>

      {/* Dropdown List */}
      {isDropdownOpen && (
        <View style={[styles.dropdownList, { backgroundColor: dropdownBg }]}>
          {years.map((year, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.dropdownItem, { borderBottomColor: isDarkMode ? '#444' : '#eee' }]}
              onPress={() => {
                setSelectedYear(year);
                setIsDropdownOpen(false);
                router.push(`/modules/ModulesScreen?year=${year}&userType=${name}`);
              }}
            >
              <Text style={[styles.dropdownItemText, { color: textColor }]}>
                {year}
              </Text>
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
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRight: {
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
  notificationIcon: {
    padding: 8,
    marginRight: 12,
  },
  yearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
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
    top: 90,
    width: '80%',
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
  },
  dropdownItemText: {
    fontSize: 16,
    textAlign: 'center',
  },
});


