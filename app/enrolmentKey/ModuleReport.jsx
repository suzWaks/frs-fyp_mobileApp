import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; // Import Ionicons
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AttendanceDialog from '../tutorcomponent/attendanceDialog'; // Import the AttendanceDialog component

const ModuleReport = () => {
  const { code, name, instructor } = useLocalSearchParams();
  const attendanceData = [
    { date: '23/4/2024', time: '10-12 am', attendance: 'Present' },
    { date: '27/4/2024', time: '10-12 am', attendance: 'Absent' },
    { date: '28/4/2024', time: '10-12 am', attendance: 'Present' },
    { date: '2/5/2024', time: '10-12 am', attendance: 'Present' },
    { date: '7/5/2024', time: '10-12 am', attendance: 'Present' },
  ];

  // State to track which button is pressed
  const [activeButton, setActiveButton] = useState(null);
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState(''); // State to store user name
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const router = useRouter();

  // Fetch user role and name from AsyncStorage
  useEffect(() => {
    const getUserDetails = async () => {
      const role = await AsyncStorage.getItem('userRole');
      const name = await AsyncStorage.getItem('userName'); // Assuming userName is stored in AsyncStorage
      setUserRole(role);
      setUserName(name);
    };
    getUserDetails();
  }, []);

  const handleTakeAttendancePress = () => {
    setIsDialogVisible(true);
  };

  const handleBackPress = () => {
    router.replace('/enrolmentKey/HomeWithModules'); // Ensure navigation to HomeWithModules page
  };

  return (
    <View style={[styles.container, { backgroundColor: colorScheme === "dark" ? "#1a1b26" : "#fff" }]}>
      {/* Header Section */}
      <View style={[styles.header, { backgroundColor: colorScheme === "dark" ? "#1a1b26" : "#fff" }]}>
        <TouchableOpacity onPress={() => router.push('/profile/profile')} style={styles.profileSection}>
          <Icon name="person-circle-outline" size={40} color={colorScheme === "dark" ? "white" : "black"} />
          <Text style={[styles.greeting, { color: colorScheme === "dark" ? "white" : "black" }]}>
            Hello, {userName}
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
          <TouchableOpacity onPress={() => toggleColorScheme(colorScheme === "light" ? "dark" : "light")} style={styles.modeIcon}>
            <Icon 
              name={colorScheme === "dark" ? "sunny-outline" : "moon-outline"} 
              size={24} 
              color={colorScheme === "dark" ? "white" : "black"} 
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.moduleInfo}>
        <Text style={[styles.moduleCode, { color: colorScheme === "dark" ? "white" : "#7647EB" }]}>{code} - {name}</Text>
        <Text style={[styles.instructor, { color: colorScheme === "dark" ? "white" : "#7647EB" }]}>{instructor}</Text>
      </View>

      <View style={styles.attendanceSummary}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryCount, styles.presentCount]}>23</Text>
          <Text style={[styles.summaryLabel, styles.presentLabel]}>Present</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryCount, styles.absentCount]}>04</Text>
          <Text style={[styles.summaryLabel, styles.absentLabel]}>Absent</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryCount, styles.leaveCount]}>01</Text>
          <Text style={[styles.summaryLabel, styles.leaveLabel]}>Leave</Text>
        </View>
      </View>

      {/* Filter Section */}
      <View style={styles.filterContainer}>
        <Text style={[styles.filterText, { color: colorScheme === "dark" ? "white" : "black" }]}>Filter:</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Icon name="calendar" size={16} color="#7647EB" style={styles.icon} />
          <Text style={styles.filterButtonText}>Choose Date</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Icon name="time-outline" size={16} color="#7647EB" style={styles.icon} />
          <Text style={styles.filterButtonText}>Choose Time</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.attendanceTable}>
        <View style={[styles.tableHeader, { backgroundColor: colorScheme === "dark" ? "#333" : "#7647EB" }]}>
          <Text style={[styles.tableHeaderText, { color: colorScheme === "dark" ? "white" : "#fff" }]}>Date</Text>
          <Text style={[styles.tableHeaderText, { color: colorScheme === "dark" ? "white" : "#fff" }]}>Time</Text>
          <Text style={[styles.tableHeaderText, { color: colorScheme === "dark" ? "white" : "#fff" }]}>Attendance</Text>
        </View>
        {attendanceData.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={[styles.tableCell, { color: colorScheme === "dark" ? "white" : "black" }]}>{item.date}</Text>
            <Text style={[styles.tableCell, { color: colorScheme === "dark" ? "white" : "black" }]}>{item.time}</Text>
            <Text style={[styles.tableCell, item.attendance === 'Present' ? styles.present : styles.absent]}>
              {item.attendance}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.applyLeaveButton,
            activeButton === 'applyLeave' && styles.buttonPressed,
          ]}
          onPress={() => setActiveButton(activeButton === 'applyLeave' ? null : 'applyLeave')}
        >
          <Text
            style={[
              styles.buttonText,
              activeButton === 'applyLeave' && styles.buttonTextPressed,
            ]}
          >
            Apply Leave
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.takeAttendanceButton,
            activeButton === 'takeAttendance' && styles.buttonPressed,
          ]}
          onPress={handleTakeAttendancePress}
        >
          <Text
            style={[
              styles.buttonText,
              activeButton === 'takeAttendance' && styles.buttonTextPressed,
            ]}
          >
            Take Attendance
          </Text>
        </TouchableOpacity>
      </View>

      {/* Attendance Dialog */}
      <AttendanceDialog
        visible={isDialogVisible}
        onClose={() => setIsDialogVisible(false)}
        userRole={userRole} // Pass userRole to the dialog
      />
    </View>
  );
};

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
    marginRight: 8, // Adjusted margin
  },
  modeIcon: {
    marginLeft: 8, // Adjusted margin
  },
  moduleInfo: {
    padding: 16,
  },
  moduleCode: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  instructor: {
    fontSize: 14,
  },
  attendanceSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryCount: {
    fontSize: 24,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 50,
    color: '#fff',
  },
  presentCount: {
    backgroundColor: '#90EE90',
  },
  absentCount: {
    backgroundColor: '#FFCCCB',
  },
  leaveCount: {
    backgroundColor: '#ADD8E6',
  },
  summaryLabel: {
    fontSize: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 20,
    color: '#fff',
  },
  presentLabel: {
    backgroundColor: 'green',
  },
  absentLabel: {
    backgroundColor: 'red',
  },
  leaveLabel: {
    backgroundColor: 'blue',
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
  },
  filterText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 20,
    opacity: 0.5,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 7,
    borderRadius: 9,
    marginRight: 20,
  },
  icon: {
    marginRight: 8,
  },
  filterButtonText: {
    fontSize: 13,
  },
  attendanceTable: {
    flex: 1,
    paddingHorizontal: 12,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 2,
  },
  tableHeaderText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  tableCell: {
    fontSize: 12,
  },
  present: {
    color: 'green',
  },
  absent: {
    color: 'red',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  applyLeaveButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#7647EB',
    padding: 20,
    borderRadius: 30,
    flex: 1,
    marginRight: 10,
  },
  takeAttendanceButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#7647EB',
    padding: 20,
    borderRadius: 30,
    flex: 1,
    marginLeft: 10,
  },
  buttonText: {
    color: '#7647EB',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonPressed: {
    backgroundColor: '#7647EB',
  },
  buttonTextPressed: {
    color: '#fff',
  },
});

export default ModuleReport;