import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AttendanceDialog from '../tutorcomponent/attendanceDialog';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import Constants from 'expo-constants';

const statusOptions = [
  { label: "Present", color: "#28a745" },
  { label: "Absent", color: "#dc3545" },
  { label: "Leave", color: "#007bff" },
];

const ModuleReport = () => {
  const { code, name, instructor } = useLocalSearchParams();
  const [attendanceData, setAttendanceData] = useState([]);  
  const [activeButton, setActiveButton] = useState(null);
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const router = useRouter();

  const API_BASE_URL = Constants.expoConfig.extra.API_BASE_URL;
  const iconColor = colorScheme === "dark" ? "#D1D5DB" : "#000";

  useEffect(() => {
    const getUserDetails = async () => {
      const role = await AsyncStorage.getItem('userRole');
      const name = await AsyncStorage.getItem('userName');
      setUserRole(role);
      setUserName(name);
    };
    getUserDetails();
  }, []);

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/AttendanceRecords/class`);
        const data = await response.json();
        
        const formattedRecords = data.map((record) => ({
          id: record.id,
          date: new Date(record.date).toLocaleDateString(),
          time: record.time_Interval,
          status: record.status === 0 ? "Present" : record.status === 1 ? "Absent" : "Leave",
          class_Id: record.class_Id,
        }));
        
        setAttendanceData(formattedRecords || []);
      } catch (error) {
        console.error('Error fetching attendance data:', error);
        setAttendanceData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, []);

  const handleDownloadReport = async () => {
    const csvContent = [
      ["Date", "Time", "Status", "Class"],
      ...attendanceData.map(({ date, time, status, class_Id }) => [
        date,
        time,
        status,
        class_Id,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const fileUri = FileSystem.documentDirectory + `${name}_Attendance_Report.csv`;
    try {
      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          dialogTitle: `${name}'s Attendance Report`,
          mimeType: "text/csv",
        });
      } else {
        Alert.alert(
          "Report Saved",
          "The report has been saved to your device storage"
        );
      }
    } catch (error) {
      Alert.alert("Error", "Could not save the file");
      console.error(error);
    }
  };

  const handleTakeAttendancePress = () => {
    router.push('/StudentAttendance/attendancescreen');
    setIsDialogVisible(false);
  };

  const handleBackPress = () => {
    router.replace('/student');
  };

  // Calculate summary counts
  const presentCount = attendanceData.filter(r => r.status === "Present").length;
  const absentCount = attendanceData.filter(r => r.status === "Absent").length;
  const leaveCount = attendanceData.filter(r => r.status === "Leave").length;

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colorScheme === "dark" ? "#1a1b26" : "#fff" }]}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colorScheme === "dark" ? "#1a1b26" : "#fff" }]}>
      {/* Header Section */}
      <View style={[styles.header, { backgroundColor: colorScheme === "dark" ? "#1a1b26" : "#fff" }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color={colorScheme === "dark" ? "white" : "black"} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/profile/profile')} style={styles.profileSection}>
            <Icon name="person-circle-outline" size={40} color={colorScheme === "dark" ? "white" : "black"} />
            <Text style={[styles.greeting, { color: colorScheme === "dark" ? "white" : "black" }]}>
              Hello, {userName}
            </Text>
          </TouchableOpacity>
        </View>
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

      {/* Attendance Summary Card */}
      <View
        style={[
          styles.attendanceSummary,
          {
            backgroundColor: colorScheme === "dark" ? "#1F2937" : "#fff",
          },
        ]}
      >
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryCount, styles.presentCount]}>
            {presentCount}
          </Text>
          <Text style={[styles.summaryLabel, styles.presentLabel]}>
            Present
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryCount, styles.absentCount]}>
            {absentCount}
          </Text>
          <Text style={[styles.summaryLabel, styles.absentLabel]}>Absent</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryCount, styles.leaveCount]}>
            {leaveCount}
          </Text>
          <Text style={[styles.summaryLabel, styles.leaveLabel]}>Leave</Text>
        </View>
      </View>

      {/* Download Button */}
      <View style={styles.downloadButtonContainer}>
        <TouchableOpacity
          onPress={handleDownloadReport}
          style={styles.downloadButton}
          disabled={attendanceData.length === 0}
        >
          <Icon
            name="download-outline"
            size={24}
            color={
              attendanceData.length === 0
                ? colorScheme === "dark"
                  ? "#6B7280"
                  : "#9CA3AF"
                : iconColor
            }
          />
        </TouchableOpacity>
      </View>

      {/* Attendance Records Header */}
      <View style={[styles.tableHeader, { backgroundColor: colorScheme === "dark" ? "#333" : "#7647EB" }]}>
        <Text style={[styles.tableHeaderText, { color: colorScheme === "dark" ? "white" : "#fff" }]}>Date</Text>
        <Text style={[styles.tableHeaderText, { color: colorScheme === "dark" ? "white" : "#fff" }]}>Time</Text>
        <Text style={[styles.tableHeaderText, { color: colorScheme === "dark" ? "white" : "#fff" }]}>Status</Text>
      </View>

      {/* Attendance Records List */}
      {attendanceData.length === 0 ? (
        <View style={[styles.emptyContainer, { backgroundColor: colorScheme === "dark" ? "#1a1b26" : "#fff" }]}>
          <Text style={[styles.emptyText, { color: colorScheme === "dark" ? "white" : "black" }]}>
            No attendance records found
          </Text>
        </View>
      ) : (
        <FlatList
          data={attendanceData}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={[styles.tableRow, { borderBottomColor: colorScheme === "dark" ? "#333" : "#eee" }]}>
              <Text style={[styles.tableCell, { color: colorScheme === "dark" ? "white" : "black" }]}>
                {item.date}
              </Text>
              <Text style={[styles.tableCell, { color: colorScheme === "dark" ? "white" : "black" }]}>
                {item.time}
              </Text>
              <Text
                style={[
                  styles.tableCell,
                  {
                    color: statusOptions.find((o) => o.label === item.status)?.color || "#000",
                    fontWeight: 'bold'
                  }
                ]}
              >
                {item.status}
              </Text>
            </View>
          )}
        />
      )}

      {/* Buttons Container */}
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
        userRole={userRole}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 12,
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
  modeIcon: {
    marginLeft: 16,
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
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  summaryItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  summaryCount: {
    fontSize: 24,
    fontWeight: "bold",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 50,
    color: "#fff",
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 20,
    color: "#fff",
  },
  presentCount: {
    color: "#28a745",
    backgroundColor: "#90EE90",
  },
  absentCount: {
    color: "#dc3545",
    backgroundColor: "#FFCCCB",
  },
  leaveCount: {
    color: "#007bff",
    backgroundColor: "#ADD8E6",
  },
  presentLabel: {
    color: "#fff",
    backgroundColor: "green",
  },
  absentLabel: {
    color: "#fff",
    backgroundColor: "red",
  },
  leaveLabel: {
    color: "#fff",
    backgroundColor: "blue",
  },
  downloadButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 10,
  },
  downloadButton: {
    padding: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  tableHeaderText: {
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  tableCell: {
    fontSize: 14,
    flex: 1,
    textAlign: 'center',
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