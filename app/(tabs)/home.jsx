import { View, Text, TouchableOpacity, Switch, StyleSheet, ScrollView, ImageBackground, Image } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

export default function HomeScreen() {
  const { colorScheme, setColorScheme } = useColorScheme();
  const [isTutorMode, setIsTutorMode] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const API_BASE_URL = Constants.expoConfig.extra.API_BASE_URL;

  // Theme colors - Move these up before they're used
  const isDarkMode = colorScheme === 'dark';
  const textColor = isDarkMode ? '#E2E2E2' : '#000';
  const backgroundColor = isDarkMode ? '#121212' : '#FFF';
  const cardBackground = isDarkMode ? '#1E1E1E' : '#F5F5F5';
  const iconColor = isDarkMode ? '#FFF' : '#000';

  // Primary color palette
  const PRIMARY_COLOR = '#7647EB';
  const PRIMARY_LIGHT = '#9D7AFF';
  const PRIMARY_DARK = '#5B2DCF';

  // Load user data and role preference
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Load user data
        const storedData = await AsyncStorage.getItem('userData');
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          setUserData(parsedData);
          // Set initial role based on user data
          setIsTutorMode(parsedData.role === 'TUTOR');
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Toggle role
  const toggleRole = async () => {
    const newRole = !isTutorMode ? 'tutor' : 'daa';
    setIsTutorMode(!isTutorMode);
    await AsyncStorage.setItem('role', newRole);
    router.push(newRole === 'tutor' ? '/tutor' : '/daa');
  };

  // Toggle color scheme
  const toggleMode = () => {
    setColorScheme(colorScheme === 'dark' ? 'light' : 'dark');
  };

  // Fetch department data
  // Update the fetch endpoint and department cards rendering
  useEffect(() => {
    const getDepartments = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/Departments`);
        const data = await response.json();
        console.log('Department data:', data); 
        setDepartments(data);
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };
    getDepartments();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <Text style={[styles.loadingText, { color: textColor }]}>Loading...</Text>
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <Text style={[styles.errorText, { color: textColor }]}>No user data found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            onPress={() => {
              const userDataToPass = {
                email: userData.email // Make sure this matches the email in your database
              };
              router.push({
                pathname: "/profile/profile",
                params: { userData: JSON.stringify(userDataToPass) }
              });
            }} 
            style={styles.profileSection}
          >
            <Ionicons name="person-circle-outline" size={40} color={iconColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textColor }]}>
            {isTutorMode ? 'Tutor Dashboard' : 'DAA Dashboard'}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.notificationIcon}>
            <Ionicons name="notifications-outline" size={24} color={iconColor} />
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleMode}>
            <Ionicons 
              name={isDarkMode ? "sunny-outline" : "moon-outline"} 
              size={24} 
              color={iconColor} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Role Toggle */}
      <View style={styles.toggleContainer}>
        <Text style={{ color: textColor }}>DAA</Text>
        <Switch 
          value={isTutorMode} 
          onValueChange={toggleRole} 
          thumbColor={PRIMARY_COLOR}
          trackColor={{ false: isDarkMode ? '#333' : '#ddd', true: PRIMARY_LIGHT }}
        />
        <Text style={{ color: textColor }}>Tutor</Text>
      </View>

      {/* Departments */}
      {!isTutorMode && (
        <>
          <Text style={[styles.title, { color: textColor }]}>Departments</Text>
          <ScrollView style={styles.scrollView}>
            {departments.map((dept, index) => {
              const isAlternateCard = index % 2 === 0;
              return (
                <TouchableOpacity
                  key={dept.departmentId}
                  style={[
                    styles.departmentCard, 
                    { 
                      backgroundColor: isAlternateCard ? '#FFF' : PRIMARY_COLOR,
                      borderWidth: isAlternateCard ? 1 : 0,
                      borderColor: '#eee'
                    }
                  ]}
                  onPress={() => {
                    console.log('Selected department ID:', dept.departmentId);
                    router.push({
                      pathname: `/department/${dept.departmentId}`,
                      params: { departmentId: dept.departmentId }
                    });
                  }}
                >
                  <Image
                    source={{ 
                      uri: `${API_BASE_URL}/Departments/image/${dept.departmentId}` 
                    }}
                    style={styles.iconPlaceholder}
                  />
                  <Text 
                    style={[
                      styles.departmentText, 
                      { color: isAlternateCard ? '#000' : '#FFF' }
                    ]}
                  >
                    {dept.departmentName}
                  </Text>
                  <Ionicons 
                    name="chevron-forward-outline" 
                    size={24} 
                    color={isAlternateCard ? PRIMARY_COLOR : '#FFF'} 
                  />
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </>
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
    gap: 12,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  departmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  deptImage: {
    iconPlaceholder: {
      width: 40,
      height: 40,
      borderRadius: 8,
      marginRight: 16,
    },
    marginRight: 16,
  },
  departmentText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
});