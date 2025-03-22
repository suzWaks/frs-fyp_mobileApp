import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { getEnrolledModules } from '../api/enrollModule'; // Import the mock API

const HomeWithModules = () => {
  const [modules, setModules] = useState([]);
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const router = useRouter();

  useEffect(() => {
    const fetchModules = async () => {
      const enrolledModules = await getEnrolledModules();
      setModules(enrolledModules);
    };
    fetchModules();
  }, []);

  const handleProfilePress = () => {
    router.push('/profile/profile'); // Navigate to the profile screen
  };

  return (
    <View style={[styles.container, { backgroundColor: colorScheme === "dark" ? "#1a1b26" : "#f8f9fa" }]}>
      {/* Header Section */}
      <View style={[styles.header, { backgroundColor: colorScheme === "dark" ? "#1a1b26" : "#fff" }]}>
        <TouchableOpacity onPress={handleProfilePress} style={styles.profileSection}>
          <Icon name="person-circle-outline" size={40} color={colorScheme === "dark" ? "white" : "black"} />
          <Text style={[styles.greeting, { color: colorScheme === "dark" ? "white" : "black" }]}>
            Hello, Suzal
          </Text>
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => alert("Notifications pressed")} style={styles.notificationIcon}>
            <Icon
              name="notifications-outline"
              size={24}
              color={colorScheme === "dark" ? "white" : "black"}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => toggleColorScheme(colorScheme === "light" ? "dark" : "light")}>
            <Icon 
              name={colorScheme === "dark" ? "sunny-outline" : "moon-outline"} 
              size={24} 
              color={colorScheme === "dark" ? "white" : "black"} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Modules Enrolled */}
      <Text style={[styles.sectionTitle, { color: colorScheme === "dark" ? "white" : "black" }]}>Modules enrolled</Text>

      {/* Course List */}
      <FlatList
        data={modules}
        keyExtractor={(item) => item.code}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {/* Upper Section */}
            <View style={styles.cardHeader}>
              <Text style={styles.courseCode}>{item.code}</Text>
              <Text style={styles.courseTitle}>{item.name}</Text>
              <Text style={styles.instructor}>{item.instructor}</Text>
            </View>

            {/* Lower Section */}
            <View style={styles.cardFooter}>
              <View style={styles.attendanceSection}>
                <View style={styles.attendanceRow}>
                  <Text style={styles.attendanceLabel}>Progress</Text>
                  <Text style={styles.present}>{item.progress} complete</Text>
                </View>
                <View style={styles.attendanceRowSpacer} />
                <View style={styles.attendanceRow}>
                  <Text style={styles.attendanceLabel}>Total classes</Text>
                  <Text style={styles.absent}>{item.totalClasses}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push(`/enrolmentKey/ModuleReport?code=${item.code}&name=${item.name}&instructor=${item.instructor}`)}
              >
                <Text style={styles.actionButtonText}>View More</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.floatingButton} onPress={() => router.push('/department/[name]')}>
        <Icon name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    marginBottom: 20,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  greeting: {
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  card: {
    borderRadius: 19,
    marginBottom: 20,
    overflow: "hidden",
  },
  cardHeader: {
    backgroundColor: "#7647EB",
    padding: 16,
    alignItems: "center", // Centering text
  },
  cardFooter: {
    backgroundColor: "#f0f0f0",
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  courseCode: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center", 
  },
  courseTitle: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 4,
    textAlign: "center", 
  },
  instructor: {
    fontSize: 14,
    color: "#e0e0e0",
    marginBottom: 10,
    textAlign: "center", 
  },
  attendanceSection: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  attendanceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  attendanceRowSpacer: {
    height: 18, 
  },
  attendanceLabel: {
    fontSize: 14,
    color: "#333",
    marginRight: 8,
  },
  present: {
    backgroundColor: "#32CD32",
    color: "#fff",
    paddingHorizontal: 10,
    borderRadius: 8,
    textAlign: "center",
  },
  absent: {
    backgroundColor: "#ff3b30",
    color: "#fff",
    paddingHorizontal: 10,
    borderRadius: 8,
    textAlign: "center",
  },
  actionButton: {
    borderWidth: 2,
    borderColor: "#7647EB",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignItems: "center",
  },
  actionButtonText: {
    color: "#6c33ff",
    fontSize: 14,
    fontWeight: "bold",
  },
  floatingButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#6c33ff",
    padding: 15,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },
});

export default HomeWithModules;
