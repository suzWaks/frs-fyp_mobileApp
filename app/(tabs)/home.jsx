import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ImageBackground } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { Ionicons } from '@expo/vector-icons';
import { fetchDepartments } from '../api/home'; // Import the mock API

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark');
  const [departments, setDepartments] = useState([]);
  const router = useRouter();

  const toggleMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  useEffect(() => {
    const getDepartments = async () => {
      const response = await fetchDepartments();
      setDepartments(response);
    };
    getDepartments();
  }, []);

  // Define theme colors
  const primaryColor = isDarkMode ? '#7aa2f7' : '#6B4EFF';
  const secondaryColor = isDarkMode ? '#24283b' : '#F0F0FF';
  const textColor = isDarkMode ? '#a9b1d6' : '#000';
  const backgroundColor = isDarkMode ? '#1a1b26' : '#fff';

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.profileImage, { backgroundColor: isDarkMode ? '#24283b' : '#F0F0FF' }]}>
            <Ionicons name="person" size={20} color={textColor} />
          </View>
          <Text style={[styles.headerTitle, { color: textColor }]}>Profile</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.notificationIcon}>
            <Ionicons name="notifications-outline" size={24} color={textColor} />
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleMode}>
            <Ionicons name={isDarkMode ? "sunny-outline" : "moon-outline"} size={24} color={textColor} />
          </TouchableOpacity>
        </View>
      </View>
      
      <Text style={[styles.title, { color: textColor }]}>Departments</Text>
      
      <ScrollView style={styles.scrollView}>
        {departments.map((dept, index) => {
          const isAlternate = dept.color === '#6B4EFF';
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.departmentCard, 
                { backgroundColor: isAlternate ? primaryColor : secondaryColor }
              ]}
              onPress={() => {
                router.push(`/department/${dept.name}`);
              }}
            >
              <ImageBackground
                source={{ uri: 'https://via.placeholder.com/150' }}
                style={styles.iconPlaceholder}
                imageStyle={{ borderRadius: 8 }}
              />
              <Text style={[
                styles.departmentText,
                { color: isDarkMode ? '#fff' : (isAlternate ? '#fff' : '#000') }
              ]}>
                {dept.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  scrollView: {
    flex: 1,
  },
  departmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  iconPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 15,
  },
  departmentText: {
    fontSize: 16,
    fontWeight: '500',
  },
});