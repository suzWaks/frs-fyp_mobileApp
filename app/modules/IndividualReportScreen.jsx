import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  Platform,
  StyleSheet,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { useColorScheme } from "nativewind";
import * as WebBrowser from "expo-web-browser";
import Constants from "expo-constants";

const statusOptions = [
  { label: "Present", color: "#28a745" },
  { label: "Absent", color: "#dc3545" },
  { label: "Leave", color: "#007bff" },
];

// Helper function to calculate hours from time interval
const calculateHours = (timeInterval) => {
  if (!timeInterval) return 0;
  
  try {
    // Handle different time interval formats
    const parts = timeInterval.split(/[-–]/).map(part => part.trim());
    if (parts.length !== 2) return 0;
    
    const [startTime, endTime] = parts;
    
    // Parse hours and minutes
    const parseTime = (timeStr) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return { hours: isNaN(hours) ? 0 : hours, minutes: isNaN(minutes) ? 0 : minutes };
    };
    
    const start = parseTime(startTime);
    const end = parseTime(endTime);
    
    // Calculate total minutes
    const startTotalMinutes = start.hours * 60 + start.minutes;
    const endTotalMinutes = end.hours * 60 + end.minutes;
    
    // Calculate difference in hours
    const totalHours = (endTotalMinutes - startTotalMinutes) / 60;
    
    return totalHours > 0 ? totalHours : 0;
  } catch (error) {
    console.error("Error calculating hours:", error);
    return 0;
  }
};

export default function IndividualReport() {
  const { colorScheme } = useColorScheme();
  const { class_Id, studentId, name } = useLocalSearchParams();
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentInfo] = useState({
    name: name,
    student_Id: studentId,
  });

  const API_BASE_URL = Constants.expoConfig.extra.API_BASE_URL;
  const iconColor = colorScheme === "dark" ? "#D1D5DB" : "#000";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `${API_BASE_URL}/Students/${studentId}/attendance`
        );
        if (!response.ok) throw new Error("Attendance fetch failed");
        const data = await response.json();

        const classRecords = data.filter(
          (record) => record.attendanceRecord.class_Id.toString() === class_Id
        );

        const formattedRecords = classRecords.map((record) => ({
          id: record.id,
          date: new Date(record.attendanceRecord.date).toLocaleDateString(),
          time: record.attendanceRecord.time_Interval,
          status:
            record.status === 0
              ? "Present"
              : record.status === 1
              ? "Absent"
              : "Leave",
          class_Id: record.attendanceRecord.class_Id,
          hours: calculateHours(record.attendanceRecord.time_Interval),
        }));

        setAttendanceRecords(formattedRecords);
      } catch (error) {
        console.error("Error fetching data:", error);
        Alert.alert("Error", "Failed to load attendance records");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [class_Id, studentId]);

  const handleDownloadReport = async () => {
    const csvContent = [
      ["Date", "Time", "Status", "Class"],
      ...attendanceRecords.map(({ date, time, status, class_Id }) => [
        date,
        time,
        status,
        class_Id,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    if (Platform.OS === "web") {
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      WebBrowser.openBrowserAsync(url);
      return;
    }

    const fileUri =
      FileSystem.documentDirectory +
      `${studentInfo.name}_Attendance_Report.csv`;
    try {
      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          dialogTitle: `${studentInfo.name}'s Attendance Report`,
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

  // Calculate total hours and hours by status
  const totalHours = attendanceRecords.reduce((sum, record) => sum + (record.hours || 0), 0);
  const presentHours = attendanceRecords
    .filter((r) => r.status === "Present")
    .reduce((sum, record) => sum + (record.hours || 0), 0);
  const absentHours = attendanceRecords
    .filter((r) => r.status === "Absent")
    .reduce((sum, record) => sum + (record.hours || 0), 0);
  const leaveHours = attendanceRecords
    .filter((r) => r.status === "Leave")
    .reduce((sum, record) => sum + (record.hours || 0), 0);

  const radius = 45;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const attendancePercentage =
    totalHours === 0 ? 0 : presentHours / totalHours;

  if (loading) {
    return (
      <View
        className={`flex-1 justify-center items-center ${
          colorScheme === "dark" ? "bg-gray-800" : "bg-white"
        }`}
      >
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View
      className={`flex-1 p-4 ${
        colorScheme === "dark" ? "bg-gray-800" : "bg-white"
      }`}
    >
      <View className="items-center mb-3">
        <Text
          className={`text-lg font-bold mb-2 ${
            colorScheme === "dark" ? "text-gray-400" : "text-black"
          }`}
        >
          {"Individual Report"}
        </Text>
      </View>
      {/* Student Profile Section */}
      <View className="mb-4 flex-row items-center space-x-2">
        <Ionicons name="person-sharp" size={20} color={iconColor} />
        <Text style={{ color: colorScheme === "dark" ? "#D1D5DB" : "#555" }}>
          Student ID: {studentInfo.student_Id}
        </Text>
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
            {presentHours.toFixed(0)}hrs
          </Text>
          <Text style={[styles.summaryLabel, styles.presentLabel]}>
            Present
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryCount, styles.absentCount]}>
            {absentHours.toFixed(0)}hrs
          </Text>
          <Text style={[styles.summaryLabel, styles.absentLabel]}>Absent</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryCount, styles.leaveCount]}>
            {leaveHours.toFixed(0)}hrs
          </Text>
          <Text style={[styles.summaryLabel, styles.leaveLabel]}>Leave</Text>
        </View>
      </View>

      {/* Download Button */}
      <View className="flex-row justify-end items-center mb-1">
        <TouchableOpacity
          onPress={handleDownloadReport}
          className="p-2"
          disabled={attendanceRecords.length === 0}
        >
          <Ionicons
            name="download-outline"
            size={24}
            color={
              attendanceRecords.length === 0
                ? colorScheme === "dark"
                  ? "#6B7280"
                  : "#9CA3AF"
                : iconColor
            }
          />
        </TouchableOpacity>
      </View>

      {/* Attendance Records Header */}
      <View
        className={`flex-row justify-between p-3 ${
          colorScheme === "dark" ? "bg-gray-400" : "bg-gray-100"
        }`}
      >
        <Text className="flex-1 text-center font-semibold">Date</Text>
        <Text className="flex-1 text-center font-semibold">Time</Text>
        <Text className="flex-1 text-center font-semibold">Status</Text>
      </View>

      {/* Attendance Records List */}
      {attendanceRecords.length === 0 ? (
        <View className="flex-1 justify-center items-center mt-10">
          <Text
            className={`text-lg ${
              colorScheme === "dark" ? "text-gray-300" : "text-gray-500"
            }`}
          >
            No attendance records found
          </Text>
        </View>
      ) : (
        <FlatList
          data={attendanceRecords}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View
              className={`flex-row justify-between items-center p-3 border-b ${
                colorScheme === "dark" ? "border-gray-600" : "border-gray-200"
              }`}
            >
              <Text
                className="flex-1 text-center"
                style={{ color: colorScheme === "dark" ? "#D1D5DB" : "#000" }}
              >
                {item.date}
              </Text>
              <Text
                className="flex-1 text-center"
                style={{ color: colorScheme === "dark" ? "#D1D5DB" : "#000" }}
              >
                {item.time}
              </Text>
              <Text
                className="flex-1 text-center text-sm font-semibold p-2 rounded-md"
                style={{
                  color:
                    statusOptions.find((o) => o.label === item.status)?.color ||
                    "#000",
                }}
              >
                {item.status}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
    fontSize: 20,
    fontWeight: "bold",
    paddingHorizontal: 20,
    paddingVertical: 24,
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
});