import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { useColorScheme } from "nativewind";

const allAttendanceData = [
  { date: '2025-01-10', time: '09:00-10:00 AM', status: 'Yes' },
  { date: '2025-01-15', time: '10:15-11:15 AM', status: 'No' },
  { date: '2025-02-05', time: '08:00-09:00 AM', status: 'Yes' },
  { date: '2025-02-20', time: '02:00-03:00 PM', status: 'Yes' },
  { date: '2025-03-10', time: '11:30-12:30 PM', status: 'Yes' },
  { date: '2025-03-25', time: '10:15-11:15 AM', status: 'Yes' },
  { date: '2025-04-01', time: '09:30-10:30 AM', status: 'Yes' },
  { date: '2025-04-15', time: '01:00-02:00 PM', status: 'No' },
  { date: '2025-05-12', time: '10:00-11:00 AM', status: 'Yes' },
  { date: '2025-05-22', time: '02:30-03:30 PM', status: 'No' },
  { date: '2025-06-05', time: '09:45-10:45 AM', status: 'Yes' },
  { date: '2025-06-18', time: '03:00-04:00 PM', status: 'No' },
  { date: '2025-10-07', time: '08:30-09:30 AM', status: 'Yes' },
];

const statusOptions = [
  { label: "Yes", color: "#28a745" },
  { label: "No", color: "#dc3545" },
];

// Extract unique months from the data (month names only)
const monthsInData = [...new Set(allAttendanceData.map(item => 
  new Date(item.date).toLocaleString('default', { month: 'long' })
))];

export default function ClassReport() {
  const { colorScheme } = useColorScheme();
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [filteredData, setFilteredData] = useState(allAttendanceData);
  const iconColor = colorScheme === "dark" ? "#D1D5DB" : "#000";

  useEffect(() => {
    // Set default to current month
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    setSelectedMonth(currentMonth);
    filterDataByMonth(currentMonth);
  }, []);

  const handleReset = () => {
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    setSelectedMonth(currentMonth);
    filterDataByMonth(currentMonth);
    setShowMonthDropdown(false);
  };

  const filterDataByMonth = (month) => {
    const filtered = allAttendanceData.filter(item => {
      const itemMonth = new Date(item.date).toLocaleString('default', { month: 'long' });
      return itemMonth === month;
    });
    setFilteredData(filtered);
  };

  const handleDownloadReport = async () => {
    const csvContent = [
      ["Date", "Time", "Status"],
      ...filteredData.map(({ date, time, status }) => [
        date,
        time,
        status,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

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

  const handleMonthSelect = (month) => {
    setSelectedMonth(month);
    filterDataByMonth(month);
    setShowMonthDropdown(false);
  };

  return (
    <View
      className={`flex-1 p-4 ${
        colorScheme === "dark" ? "bg-gray-800" : "bg-white"
      }`}
    >
      <View className="flex-row items-center justify-between mb-6">
        <TouchableOpacity onPress={handleReset} className="p-2">
          <Ionicons name="refresh-outline" size={24} color={iconColor} />
        </TouchableOpacity>

        <View className="flex-1 relative mx-2">
          <TouchableOpacity
            className={`flex-row items-center justify-between border rounded-lg p-3 w-36`}
            onPress={() => setShowMonthDropdown(!showMonthDropdown)}
            style={{
              borderColor: colorScheme === "dark" ? "#D1D5DB" : "#D1D5DB",
            }}
          >
            <Text
              style={{ color: colorScheme === "dark" ? "#D1D5DB" : "#000" }}
            >
              {selectedMonth}
            </Text>
            <Ionicons
              name={showMonthDropdown ? "chevron-up" : "chevron-down"}
              size={16}
              color={iconColor}
              className="ml-2"
            />
          </TouchableOpacity>

          {showMonthDropdown && (
            <View className="absolute w-36 top-12 left-0 right-0 bg-white border border-gray-200 rounded-[10px] max-h-52 z-10 shadow-lg">
              <FlatList
                data={monthsInData}
                keyExtractor={(item) => item}
                className="rounded-[10px] overflow-hidden"
                renderItem={({ item }) => (
                  <TouchableOpacity
                    className={`p-3 border-b border-gray-200  ${
                      colorScheme === "dark" ? "bg-gray-700" : "bg-white"
                    }`}
                    onPress={() => handleMonthSelect(item)}
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

        <TouchableOpacity onPress={handleDownloadReport} className="p-2">
          <Ionicons name="download-outline" size={24} color={iconColor} />
        </TouchableOpacity>
      </View>

      <View
        className={`flex-row justify-between p-3 ${
          colorScheme === "dark" ? "bg-gray-400" : "bg-gray-100"
        }`}
      >
        <Text className="flex-1 text-center font-semibold">Date</Text>
        <Text className="flex-1 text-center font-semibold">Time</Text>
        <Text className="flex-1 text-center font-semibold">Status</Text>
      </View>

      <FlatList
        data={filteredData}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View className="flex-row justify-between items-center p-3">
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
              className="flex-1 text-center"
              style={{
                color: statusOptions.find((opt) => opt.label === item.status)
                  ?.color,
              }}
            >
              {item.status}
            </Text>
          </View>
        )}
      />
    </View>
  );
}