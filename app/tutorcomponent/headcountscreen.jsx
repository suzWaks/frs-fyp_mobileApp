import {View,Text,TouchableOpacity,StyleSheet,FlatList,Pressable,ActivityIndicator,} from "react-native";
import React, { useEffect, useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import Constants from "expo-constants";
import DateTimePicker from "@react-native-community/datetimepicker";
import Toast from 'react-native-toast-message';

export default function HeadCountScreen() {
  const { colorScheme } = useColorScheme();
  const router = useRouter();
  const { studentName, class_Id } = useLocalSearchParams();
  const [students, setStudents] = useState([]);
  const [classInfo, setClassInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_BASE_URL = Constants.expoConfig.extra.API_BASE_URL;

  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState("Select Time");
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const timeSlots = ["08:00 - 9:00","09:00 - 10:00","10:15 - 11:15","11:15 - 12:15","10:15 - 12:15", ]; 

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const classResponse = await fetch(
          `${API_BASE_URL}/Classes/${class_Id}`
        );
        if (!classResponse.ok)
          throw new Error("Failed to fetch class information");
        const classData = await classResponse.json();
        setClassInfo(classData);

        const attendanceResponse = await fetch(
          `${API_BASE_URL}/Classes/${class_Id}/students`
        );
        if (!attendanceResponse.ok)
          throw new Error("Failed to fetch attendance records");
        const attendanceData = await attendanceResponse.json();

        const enrolledStudents = attendanceData.map((record) => ({
          id: record.student_Id,
          studentNumber: record.student_Id.toString(),
          name: record.name || "Unknown Student",
          status: "present",
        }));

        setStudents(enrolledStudents);

        if (studentName) {
          setStudents((prevStudents) => [
            ...prevStudents,
            {
              id: (prevStudents.length + 1).toString(),
              studentNumber: `0221010${prevStudents.length + 1}`,
              name: studentName,
              status: "present",
            },
          ]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to load class data',
          position: 'bottom',
        });
      } finally {
        setLoading(false);
      }
    };

    if (class_Id) {
      fetchData();
    }
  }, [class_Id, studentName]);

  const toggleStatus = (id, newStatus) => {
    setStudents((prevStudents) =>
      prevStudents.map((student) =>
        student.id === id
          ? {
              ...student,
              status: student.status === newStatus ? "present" : newStatus,
            }
          : student
      )
    );
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    setShowTimeDropdown(false);
  };

  const handleReset = () => {
    setStudents(students.map((student) => ({ ...student, status: "present" })));
    setDate(new Date());
    setSelectedTime("Select Time");
    Toast.show({
      type: 'success',
      text1: 'Reset',
      text2: 'All fields have been reset',
      position: 'bottom',
      visibilityTime: 1500,
    });
  };

  const handleDonePress = async () => {
    try {
      if (selectedTime === "Select Time") {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Please select a time slot',
          position: 'bottom',
        });
        return;
      }
  
      const attendanceData = {
        classId: parseInt(class_Id),
        locationId: 1,
        timeInterval: selectedTime,
        studentStatuses: students.map(student => ({
          studentId: parseInt(student.id),
          status: capitalizeFirstLetter(student.status)
        }))
      };
  
      console.log("Sending attendance data:", JSON.stringify(attendanceData, null, 2));
  
      const response = await fetch(`${API_BASE_URL}/AttendanceRecords/headcount`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(attendanceData),
      });
  
      const responseText = await response.text();
      console.log("Response Text:", responseText);
  
      if (!response.ok) {
        throw new Error(responseText);
      }
  
      const successData = JSON.parse(responseText);
      console.log("Attendance saved successfully:", successData);
  
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Attendance recorded successfully',
        position: 'bottom',
        visibilityTime: 2000,
        onHide: () => {
          router.push({
            pathname: "/(tutor)/tutor",
            params: { attendanceSuccess: "true" },
          });
        }
      });
    } catch (error) {
      console.error("Error saving attendance:", error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to save attendance',
        position: 'bottom',
      });
    }
  };
  
  // Helper function to capitalize first letter and format status
  const capitalizeFirstLetter = (status) => {
    switch (status) {
      case 'present':
        return 'Present';
      case 'absent':
        return 'Absent';
      case 'leave':
        return 'Leave';
      default:
        return status;
    }
  };

  const presentCount = students.filter(
    (student) => student.status === "present"
  ).length;
  const absentCount = students.filter(
    (student) => student.status === "absent"
  ).length;
  const leaveCount = students.filter(
    (student) => student.status === "leave"
  ).length;

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: colorScheme === "dark" ? "#1F2937" : "#fff",
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: colorScheme === "dark" ? "#F3F4F6" : "#000",
    },
    moduleInfo: {
      fontSize: 16,
      marginBottom: 16,
      color: colorScheme === "dark" ? "#9CA3AF" : "#4B5563",
    },
    studentCard: {
      flexDirection: "row",
      alignItems: "center",
      padding: 10,
      borderBottomWidth: 1,
      borderBottomColor: colorScheme === "dark" ? "#374151" : "#eee",
    },
    studentName: {
      flex: 1,
      fontSize: 16,
      marginLeft: 10,
      color: colorScheme === "dark" ? "#F3F4F6" : "#000",
    },
    studentNumber: {
      width: 80,
      fontSize: 14,
      color: colorScheme === "dark" ? "#9CA3AF" : "#6B7280",
    },
    actionButton: {
      padding: 5,
      borderRadius: 5,
      marginLeft: 5,
    },
    doneButton: {
      backgroundColor: "#6B4EFF",
      padding: 15,
      borderRadius: 10,
      alignItems: "center",
      marginTop: 20,
    },
    summaryContainer: {
      padding: 16,
      borderRadius: 8,
      marginBottom: 16,
      backgroundColor: colorScheme === "dark" ? "#111827" : "#E5E7EB",
    },
    summaryText: {
      fontSize: 16,
      color: colorScheme === "dark" ? "#9CA3AF" : "#4B5563",
    },
    summaryCount: {
      fontSize: 16,
      fontWeight: "bold",
      color: colorScheme === "dark" ? "#E5E7EB" : "#111827",
    },
  });

  if (loading) {
    return (
      <View
        style={[
          dynamicStyles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#6B4EFF" />
      </View>
    );
  }

  return (
    <>
      <View style={dynamicStyles.container}>
        {classInfo && (
          <Text style={dynamicStyles.moduleInfo}>
            {classInfo.module_Code} - {classInfo.class_Name}
          </Text>
        )}

        <View style={{ marginBottom: 20, zIndex: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            {/* Date Picker */}
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: "#D1D5DB",
                padding: 12,
                borderRadius: 8,
                backgroundColor: colorScheme === "dark" ? "#374151" : "#fff",
              }}
            >
              <Text
                style={{ color: colorScheme === "dark" ? "#D1D5DB" : "#000" }}
              >
                {date.toDateString()}
              </Text>
            </TouchableOpacity>

            {/* Time Dropdown Trigger */}
            <View style={{ flex: 1 }}>
              <TouchableOpacity
                onPress={() => setShowTimeDropdown(!showTimeDropdown)}
                style={{
                  borderWidth: 1,
                  borderColor: "#D1D5DB",
                  padding: 12,
                  borderRadius: 8,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  backgroundColor: colorScheme === "dark" ? "#374151" : "#fff",
                }}
              >
                <Text
                  style={{ color: colorScheme === "dark" ? "#D1D5DB" : "#000" }}
                >
                  {selectedTime}
                </Text>
                <Ionicons
                  name={showTimeDropdown ? "chevron-up" : "chevron-down"}
                  size={16}
                  color={colorScheme === "dark" ? "#D1D5DB" : "#000"}
                />
              </TouchableOpacity>

              {/* Floating Dropdown */}
              {showTimeDropdown && (
                <View
                  style={{
                    position: "absolute",
                    top: 50,
                    left: 0,
                    right: 0,
                    backgroundColor: "#fff",
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: "#D1D5DB",
                    zIndex: 999,
                    elevation: 5,
                  }}
                >
                  <FlatList
                    data={timeSlots}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={{
                          padding: 12,
                          borderBottomWidth: 1,
                          borderBottomColor: "#D1D5DB",
                          backgroundColor:
                            colorScheme === "dark" ? "#374151" : "#fff",
                        }}
                        onPress={() => handleTimeSelect(item)}
                      >
                        <Text
                          style={{
                            color: colorScheme === "dark" ? "#D1D5DB" : "#000",
                          }}
                        >
                          {item}
                        </Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>
              )}
            </View>

            {/* Reset Button */}
            <TouchableOpacity
              style={{
                width: 25,
                height: 25,
                justifyContent: "center",
                alignItems: "center",
              }}
              onPress={handleReset}
            >
              <Ionicons name="refresh" size={25} color={colorScheme === "dark" ? "#D1D5DB" : "#000"} />
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}
        </View>

        <View style={dynamicStyles.summaryContainer}>
          <View style={styles.summaryRow}>
            <Text style={dynamicStyles.summaryText}>Total present:</Text>
            <Text style={dynamicStyles.summaryCount}>{presentCount} members</Text>
          </View>
          <View style={[styles.summaryRow, { marginTop: 8 }]}>
            <Text style={dynamicStyles.summaryText}>Total absent:</Text>
            <Text style={dynamicStyles.summaryCount}>{absentCount} members</Text>
          </View>
          <View style={[styles.summaryRow, { marginTop: 8 }]}>
            <Text style={dynamicStyles.summaryText}>Total on leave:</Text>
            <Text style={dynamicStyles.summaryCount}>{leaveCount} members</Text>
          </View>
        </View>

        <FlatList
          data={students}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={dynamicStyles.studentCard}>
              <Text style={dynamicStyles.studentNumber}>
                {item.studentNumber}
              </Text>
              <Text style={dynamicStyles.studentName}>{item.name}</Text>

              <Pressable
                style={({ pressed }) => [
                  dynamicStyles.actionButton,
                  { marginRight: 10 },
                  pressed && styles.buttonPressed,
                  item.status === "present" && { backgroundColor: "#6B4EFF" },
                ]}
                onPress={() => toggleStatus(item.id, "present")}
              >
                <Ionicons
                  name="checkmark"
                  size={20}
                  color={item.status === "present" ? "#fff" : "#10B981"}
                />
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  dynamicStyles.actionButton,
                  pressed && styles.buttonPressed,
                  item.status === "absent" && { backgroundColor: "#6B4EFF" },
                ]}
                onPress={() => toggleStatus(item.id, "absent")}
              >
                <Ionicons
                  name="close"
                  size={20}
                  color={item.status === "absent" ? "#fff" : "#FF6B6B"}
                />
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  dynamicStyles.actionButton,
                  pressed && styles.buttonPressed,
                  item.status === "leave" && { backgroundColor: "#6B4EFF" },
                ]}
                onPress={() => toggleStatus(item.id, "leave")}
              >
                <Ionicons
                  name="add-outline"
                  size={20}
                  color={item.status === "leave" ? "#fff" : "#3B82F6"}
                />
              </Pressable>
            </View>
          )}
        />

        <TouchableOpacity
          style={dynamicStyles.doneButton}
          onPress={handleDonePress}
        >
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
      <Toast />
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  doneButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});