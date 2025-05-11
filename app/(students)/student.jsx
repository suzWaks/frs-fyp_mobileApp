import React, { useEffect, useState } from 'react';
import { View, Text, ImageBackground, TouchableOpacity, Image, StyleSheet, FlatList, ActivityIndicator, Alert } from "react-native";
import { useColorScheme } from "nativewind";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native'; // Add this import at the top

// API configuration
const API_CONFIG = {
  BASE_URL: Platform.select({
    web: 'http://localhost:5253/api',
    android: 'http://10.2.4.216:5253/api',
    ios: 'http://10.2.4.216:5253/api',
    default: 'http://10.2.4.216:5253/api'
  })
};

export default function StudentScreen() {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const router = useRouter();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch enrolled modules
  const fetchModules = async () => {
    try {
      setLoading(true);
      
      // Get user data from AsyncStorage
      const userData = await AsyncStorage.getItem('userData');
      if (!userData) {
        throw new Error('User data not found');
      }
      
      const user = JSON.parse(userData);
      
      // Fetch enrolled modules for this student
      const response = await fetch(`${API_CONFIG.BASE_URL}/Students/${user.id}/classes`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch modules: ${response.status}`);
      }

      const data = await response.json();
      
      // Transform data to match our card component structure
      const formattedModules = data.map(module => ({
        code: module.enrollKey || '',
        name: module.class_Name || '',
        instructor: module.instructorName || 'Not Assigned',
        progress: module.progress || '0%',
        totalClasses: module.totalClasses || 0,
        class_Id: module.class_Id
      }));

      setModules(formattedModules);
    } catch (error) {
      console.error("Error fetching modules:", error);
      Alert.alert("Error", "Failed to load modules");
    } finally {
      setLoading(false);
    }
  };

  // Refresh modules when screen focuses
  useFocusEffect(
    React.useCallback(() => {
      fetchModules();
    }, [])
  );

  const handlePlusIconPress = () => {
    router.push('/department/student');
  };

  const handleProfileIconPress = () => {
    router.push('/profile/profile');
  };

  // Theme colors
  const themeColors = {
    dark: {
      background: "#1a1b26",
      cardBackground: "#2a2b38",
      text: "#ffffff",
      secondaryText: "#a0a0a0",
      headerBg: "#1a1b26",
      cardFooter: "#2a2b38",
    },
    light: {
      background: "#f8f9fa",
      cardBackground: "#ffffff",
      text: "#333333",
      secondaryText: "#666666",
      headerBg: "#ffffff",
      cardFooter: "#f5f5f5",
    },
  };
  const colors = themeColors[colorScheme];

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.text} />
      </View>
    );
  }

  // Header Component
  const Header = () => (
    <View style={[styles.header, { backgroundColor: colors.headerBg }]}>
      <TouchableOpacity onPress={handleProfileIconPress} style={styles.profileSection}>
        <Ionicons name="person-circle-outline" size={40} color={colors.text} />
        <Text style={[styles.profileText, { color: colors.text }]}>Hello, Student</Text>
      </TouchableOpacity>
      <View style={styles.headerRight}>
        <TouchableOpacity onPress={() => router.push('/notifications')} style={styles.notificationIcon}>
          <Ionicons name="notifications-outline" size={24} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleColorScheme}>
          <Ionicons 
            name={colorScheme === "dark" ? "sunny-outline" : "moon-outline"} 
            size={24} 
            color={colors.text} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Floating Action Button
  const FloatingActionButton = () => (
    <TouchableOpacity
      onPress={handlePlusIconPress}
      style={[styles.floatingButton, { backgroundColor: '#6c33ff' }]}
    >
      <Ionicons name="add" size={24} color="#fff" />
    </TouchableOpacity>
  );

  // Empty State View
  const EmptyState = () => (
    <ImageBackground 
      source={require("../../assets/images/emptybox.png")}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={[styles.mainContent, { backgroundColor: colors.background }]}>
        <View style={styles.imageContainer}>
          <Image 
            source={require("../../assets/images/emptybox.png")} 
            style={styles.image}
          />
        </View>
        <Text style={[styles.welcomeText, { color: colors.text }]}>
          You have nothing here yet
        </Text>
        <Text style={[styles.subText, { color: colors.secondaryText }]}>
          Enroll in a module
        </Text>
      </View>
    </ImageBackground>
  );

  // Modules List View
  const ModulesList = () => (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {modules.length === 1 ? 'Enrolled Module' : 'Enrolled Modules'}
      </Text>
      
      <FlatList
        data={modules}
        keyExtractor={(item) => item.class_Id.toString()}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.cardHeader}>
              <Text style={styles.courseCode}>{item.code}</Text>
              <Text style={styles.courseTitle}>{item.name}</Text>
              <Text style={styles.instructor}>Prof. {item.instructor}</Text>
            </View>

            <View style={[styles.cardFooter, { backgroundColor: colors.cardFooter }]}>
              <View style={styles.progressContainer}>
                <Text style={[styles.progressLabel, { color: colors.text }]}>Progress</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: item.progress }]} />
                </View>
                <Text style={[styles.progressText, { color: colors.text }]}>{item.progress}</Text>
              </View>

              <View style={styles.classesContainer}>
                <Text style={[styles.classesLabel, { color: colors.text }]}>Total Classes</Text>
                <Text style={[styles.classesCount, { color: colors.text }]}>{item.totalClasses}</Text>
              </View>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push({
                  pathname: '/enrolmentKey/ModuleReport',
                  params: {
                    code: item.code,
                    name: item.name,
                    instructor: item.instructor,
                    classId: item.class_Id
                  }
                })}
              >
                <Text style={styles.actionButtonText}>View Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <Header />
      {modules.length > 0 ? <ModulesList /> : <EmptyState />}
      <FloatingActionButton />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%", 
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingTop: 50,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileText: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: "bold",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  notificationIcon: {
    marginRight: 16,
  },
  mainContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subText: {
    fontSize: 16,
  },
  floatingButton: {
    position: "absolute",
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 16,
    marginLeft: 16,
  },
  card: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    backgroundColor: "#7647EB",
    padding: 20,
    alignItems: "center",
  },
  cardFooter: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  courseCode: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  courseTitle: {
    fontSize: 16,
    color: "#fff",
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  instructor: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    fontStyle: 'italic',
  },
  progressContainer: {
    width: '100%',
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'right',
  },
  classesContainer: {
    marginRight: 16,
  },
  classesLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  classesCount: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  actionButton: {
    borderWidth: 1,
    borderColor: "#7647EB",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    width: '100%',
  },
  actionButtonText: {
    color: "#7647EB",
    fontSize: 14,
    fontWeight: "bold",
  },
  listContent: {
    paddingBottom: 80,
  },
});