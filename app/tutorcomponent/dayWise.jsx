import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
  Modal,
  Platform,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import DateTimePicker from "@react-native-community/datetimepicker";
import moment from "moment";
import { useColorScheme } from "nativewind";
import * as WebBrowser from "expo-web-browser";
import Constants from "expo-constants";

const statusOptions = [
  { label: "Present", value: "Present", color: "#28a745" },
  { label: "Absent", value: "Absent", color: "#dc3545" },
  { label: "Leave", value: "Leave", color: "#007bff" },
];

export default function DayWiseReport() {
  const { colorScheme } = useColorScheme();
  const { class_Id } = useLocalSearchParams();
  const [students, setStudents] = useState([]);
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [selectedTime, setSelectedTime] = useState("Select Time");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("Present");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [currentAttendanceId, setCurrentAttendanceId] = useState(null);

  const iconColor = colorScheme === "dark" ? "#D1D5DB" : "#000";
  const API_BASE_URL = Constants.expoConfig.extra.API_BASE_URL;

  useEffect(() => {
    fetchAttendanceRecords();
  }, [class_Id]);

  useEffect(() => {
    if (date && attendanceRecords.length > 0) {
      updateTimeSlots();
    }
  }, [date, attendanceRecords]);

  const fetchAttendanceRecords = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/AttendanceRecords/class/${class_Id}`
      );
      if (!response.ok) throw new Error("Failed to fetch attendance data");
      
      const data = await response.json();
      setAttendanceRecords(data);
      
      if (data.length === 0) {
        setStudents([]);
        setTimeSlots([]);
        setSelectedTime("Select Time");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      Alert.alert("Error", "Failed to fetch attendance data");
    } finally {
      setLoading(false);
    }
  };

  const updateTimeSlots = () => {
    const formattedDate = moment(date).format("YYYY-MM-DD");
    const recordsForDate = attendanceRecords.filter(
      record => moment(record.date).format("YYYY-MM-DD") === formattedDate
    );
    
    const uniqueTimeSlots = [...new Set(recordsForDate.map(record => record.time_Interval))];
    setTimeSlots(uniqueTimeSlots);
    
    if (uniqueTimeSlots.length === 0) {
      setStudents([]);
      setSelectedTime("Select Time");
    }
  };

  const fetchStudentsForDateTime = async () => {
    if (selectedTime === "Select Time" || !date) return;
    
    try {
      setLoading(true);
      const formattedDate = moment(date).format("YYYY-MM-DD");
      const record = attendanceRecords.find(
        r => 
          moment(r.date).format("YYYY-MM-DD") === formattedDate && 
          r.time_Interval === selectedTime
      );
      
      if (record) {
        const formattedStudents = record.students.map((student) => {
          let status;
          switch(student.status) {
            case 0: status = "Present"; break;
            case 1: status = "Absent"; break;
            case 2: status = "Leave"; break;
            default: status = "Present";
          }
          
          return {
            studentId: student.studentId,
            studentNumber: student.studentId.toString(),
            studentName: student.name,
            status: status,
            statusId: student.statusId,
          };
        });
        
        setStudents(formattedStudents);
        setCurrentAttendanceId(record.attendance_Id);
      } else {
        setStudents([]);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      Alert.alert("Error", "Failed to fetch student data");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    if (students.length === 0) {
      Alert.alert("No Data", "There is no data to download");
      return;
    }

    const formattedDate = moment(date).format("MM/DD/YYYY");
    const formattedTime = selectedTime === "Select Time" ? "All Times" : selectedTime;

    const csvContent = [
      ["Attendance Report"],
      [`Date: ${formattedDate}`],
      [`Time: ${formattedTime}`],
      ["Student ID", "Student Name", "Status"],
      ...students.map(({ studentNumber, studentName, status }) => [
        studentNumber,
        studentName,
        status,
      ]),
    ]
      .map(row => row.join(","))
      .join("\n");

    if (Platform.OS === "web") {
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      WebBrowser.openBrowserAsync(url);
      return;
    }

    const fileUri = FileSystem.documentDirectory + `Attendance_Report_${formattedDate.replace(/\//g, "-")}_${formattedTime.replace(/[: ]/g, "-")}.csv`;

    try {
      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "text/csv",
          dialogTitle: "Share Attendance Report",
          UTI: "public.comma-separated-values-text",
        });
      } else {
        Alert.alert("Error", "Sharing is not available on this device");
      }
    } catch (error) {
      Alert.alert("Error", "Could not save the file");
      console.error(error);
    }
  };

  const handleEditStatus = (student) => {
    setSelectedStudent(student);
    setSelectedStatus(student.status);
    setModalVisible(true);
  };

  const handleSaveStatus = async () => {
    if (!selectedStudent) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/Students/${selectedStudent.studentId}/attendancestatus/${selectedStudent.statusId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: selectedStatus,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update attendance status");
      }

      const updatedStudents = students.map((student) => {
        if (student.studentId === selectedStudent.studentId) {
          return {
            ...student,
            status: selectedStatus,
          };
        }
        return student;
      });

      setStudents(updatedStudents);
      setModalVisible(false);
      Alert.alert("Success", "Attendance status updated successfully");
    } catch (error) {
      console.error("Error updating attendance status:", error);
      Alert.alert("Error", "Failed to update attendance status");
    }
  };

  const handleReset = () => {
    setDate(new Date());
    setSelectedTime("Select Time");
    setShowDatePicker(false);
    setShowTimeDropdown(false);
    setStudents([]);
    updateTimeSlots();
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    setShowTimeDropdown(false);
    fetchStudentsForDateTime();
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setDate(currentDate);
    setSelectedTime("Select Time");
    setStudents([]);
  };

  const getStatusColor = (status) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option ? option.color : "#000";
  };

  if (loading) {
    return (
      <View className={`flex-1 justify-center items-center ${colorScheme === "dark" ? "bg-gray-800" : "bg-white"}`}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View className={`flex-1 p-4 ${colorScheme === "dark" ? "bg-gray-800" : "bg-white"}`}>
      <View className="flex-row justify-end items-center mb-6">
        <TouchableOpacity onPress={handleDownloadReport} className="p-2">
          <Ionicons name="download-outline" size={24} color={iconColor} />
        </TouchableOpacity>
      </View>

      <View className="flex-row items-center justify-between mb-6">
        <TouchableOpacity onPress={handleReset} className="mr-4">
          <Ionicons name="refresh-outline" size={24} color={iconColor} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          className="flex-1 relative mr-4"
        >
          <TextInput
            className="border border-gray-300 rounded-lg p-3 w-full"
            placeholder="Select Date"
            value={moment(date).format("MM/DD/YYYY")}
            editable={false}
            style={{
              borderColor: colorScheme === "dark" ? "#D1D5DB" : "#000",
              color: colorScheme === "dark" ? "#D1D5DB" : "#000",
            }}
          />
        </TouchableOpacity>

        <View className="flex-1 relative z-10">
          <TouchableOpacity
            className={`flex-row items-center justify-between border rounded-lg p-3 w-full`}
            onPress={() => setShowTimeDropdown(!showTimeDropdown)}
            style={{
              borderColor: colorScheme === "dark" ? "#D1D5DB" : "#D1D5DB",
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
              color={iconColor}
              className="ml-2"
            />
          </TouchableOpacity>

          {showTimeDropdown && (
            <View
              className="absolute top-12 left-0 right-0 bg-white border border-gray-200 rounded-[10px] max-h-52 z-20 shadow-lg"
              style={{
                zIndex: 20,
                backgroundColor: colorScheme === "dark" ? "#374151" : "#fff",
              }}
            >
              <FlatList
                data={timeSlots}
                keyExtractor={(item) => item}
                className="rounded-[10px] overflow-hidden"
                renderItem={({ item }) => (
                  <TouchableOpacity
                    className={`p-3 border-b border-gray-200 ${
                      colorScheme === "dark" ? "bg-gray-700" : "bg-white"
                    }`}
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
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      <View
        className={`flex-row justify-between p-3 ${
          colorScheme === "dark" ? "bg-gray-400" : "bg-gray-100"
        }`}
      >
        <Text className="flex-1 text-center font-semibold">Student ID</Text>
        <Text className="flex-1 text-center font-semibold">Student Name</Text>
        <Text className="flex-1 text-center font-semibold">Status</Text>
        <Text className="flex-1 text-center font-semibold">Edit</Text>
      </View>

      <FlatList
        data={students}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center mt-10">
            <Text className={`text-lg ${colorScheme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
              {selectedTime === "Select Time" ? "Select a date and time interval" : "No data available"}
            </Text>
          </View>
        }
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View className="flex-row justify-between items-center p-3">
            <Text
              className="flex-1 text-center"
              style={{ color: colorScheme === "dark" ? "#D1D5DB" : "#000" }}
            >
              {item.studentNumber}
            </Text>
            <Text
              className="flex-1 text-center"
              style={{ color: colorScheme === "dark" ? "#D1D5DB" : "#000" }}
            >
              {item.studentName}
            </Text>
            <Text
              className="flex-1 text-center text-sm font-semibold p-2 rounded-md"
              style={{
                color: getStatusColor(item.status),
              }}
            >
              {item.status}
            </Text>
            <TouchableOpacity
              onPress={() => handleEditStatus(item)}
              className="flex-1 items-center"
            >
              <Ionicons name="create-outline" size={20} color={iconColor} />
            </TouchableOpacity>
          </View>
        )}
      />

      <Modal visible={modalVisible} transparent animationType="slide">
        <View className="flex-1 justify-center items-center bg-black/50">
          <View
            className={`p-5 rounded-lg w-4/5 items-center ${
              colorScheme === "dark" ? "bg-gray-800" : "bg-white"
            }`}
          >
            <Text
              className={`text-lg font-semibold mb-4 ${
                colorScheme === "dark" ? "text-gray-300" : "text-black"
              }`}
            >
              Edit Status for {selectedStudent?.studentName}
            </Text>

            <View className="w-full items-center">
              {statusOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  className="py-3 w-full mb-2 rounded-md items-center"
                  style={{
                    backgroundColor:
                      option.value === selectedStatus
                        ? "#7647EB"
                        : colorScheme === "dark"
                          ? "#2d3748"
                          : "#f3f3f3",
                  }}
                  onPress={() => setSelectedStatus(option.value)}
                >
                  <Text
                    className="font-bold"
                    style={{
                      color:
                        option.value === selectedStatus
                          ? "white"
                          : option.color,
                    }}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View className="flex-row justify-between w-full mt-4">
              <TouchableOpacity
                className="flex-1 bg-green-500 p-3 rounded-md items-center mr-2"
                onPress={handleSaveStatus}
              >
                <Text className="text-white font-semibold">Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-red-500 p-3 rounded-md items-center ml-2"
                onPress={() => setModalVisible(false)}
              >
                <Text className="text-white font-semibold">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}