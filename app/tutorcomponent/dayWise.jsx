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
  { label: "Present", color: "#28a745" },
  { label: "Absent", color: "#dc3545" },
  { label: "Medical Leave", color: "#007bff" },
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
  const [loading, setLoading] = useState(true);

  const iconColor = colorScheme === "dark" ? "#D1D5DB" : "#000";
  const API_BASE_URL = Constants.expoConfig.extra.API_BASE_URL;

  const timeSlots = [
    "08:00-9:00 AM",
    "09:00-10:00 AM",
    "10:15-11:15 AM",
    "11:15-12:15 PM",
  ];

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);

        // Step 1: Fetch attendance records for the specific class
        const attendanceResponse = await fetch(
          `${API_BASE_URL}/AttendanceRecords/class/${class_Id}`
        );
        if (!attendanceResponse.ok)
          throw new Error("Failed to fetch attendance data");

        const attendanceData = await attendanceResponse.json();

        // Use first attendance record to set date, time, and students
        if (attendanceData.length > 0) {
          const firstRecord = attendanceData[0];
          setDate(new Date(firstRecord.date));
          setSelectedTime(firstRecord.time_Interval);

          const formattedStudents = firstRecord.students.map((student) => ({
            studentNumber: student.studentId.toString(),
            studentName: student.name,
            status:
              student.status === 0
                ? "Present"
                : student.status === 1
                ? "Absent"
                : "Medical Leave",
          }));

          setStudents(formattedStudents);
        } else {
          setStudents([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [class_Id]);

  const handleReset = () => {
    setDate(new Date());
    setSelectedTime("Select Time");
    setShowDatePicker(false);
    setShowTimeDropdown(false);
  };

  const handleDownloadReport = async () => {
    const csvContent = [
      ["Student ID", "Student Name", "Status"],
      ...students.map(({ studentNumber, studentName, status }) => [
        studentNumber,
        studentName,
        status,
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

    const fileUri = FileSystem.documentDirectory + "Attendance_Report.csv";

    try {
      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
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

  const handleSaveStatus = () => {
    if (selectedStudent) {
      selectedStudent.status = selectedStatus;
      setModalVisible(false);
    }
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    setShowTimeDropdown(false);
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setDate(currentDate);
  };

  if (loading) {
    return (
      <View
        className={`flex-1 justify-center items-center ${colorScheme === "dark" ? "bg-gray-800" : "bg-white"}`}
      >
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View
      className={`flex-1 p-4 ${colorScheme === "dark" ? "bg-gray-800" : "bg-white"}`}
    >
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
                color:
                  statusOptions.find((option) => option.label === item.status)
                    ?.color || "#000",
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
              Status
            </Text>

            <View className="w-full items-center">
              {statusOptions.map((option) => (
                <TouchableOpacity
                  key={option.label}
                  className="py-3 w-full mb-2 rounded-md items-center"
                  style={{
                    backgroundColor:
                      option.label === selectedStatus
                        ? "#7647EB"
                        : colorScheme === "dark"
                          ? "#2d3748"
                          : "#f3f3f3",
                  }}
                  onPress={() => setSelectedStatus(option.label)}
                >
                  <Text
                    className="font-bold"
                    style={{
                      color:
                        option.label === selectedStatus
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
