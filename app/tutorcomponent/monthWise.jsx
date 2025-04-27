import { View, Text, TouchableOpacity, FlatList, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useColorScheme } from 'nativewind';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Constants from 'expo-constants';

export default function MonthWiseReport() {
  const { class_Id } = useLocalSearchParams();
  const router = useRouter();
  const allMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  const { colorScheme } = useColorScheme();
  const API_BASE_URL = Constants.expoConfig.extra.API_BASE_URL;

  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availableMonths, setAvailableMonths] = useState([]);

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        setLoading(true);
        
        // First fetch all attendance records to determine available months
        const response = await fetch(`${API_BASE_URL}/AttendanceRecords/class/${class_Id}`);
        if (!response.ok) throw new Error("Failed to fetch attendance data");
        
        const attendanceData = await response.json();
        
        // Extract unique months from the attendance data
        const monthsSet = new Set();
        attendanceData.forEach(record => {
          const date = new Date(record.date);
          const monthName = date.toLocaleString('default', { month: 'long' });
          monthsSet.add(monthName);
        });
        
        const available = Array.from(monthsSet);
        setAvailableMonths(available);
        
        // If current month isn't available, select the first available month
        if (available.length > 0 && !available.includes(selectedMonth)) {
          setSelectedMonth(available[0]);
        }
        
        // Now filter data for the selected month
        const monthNumber = allMonths.indexOf(selectedMonth) + 1;
        const monthData = attendanceData.filter(record => {
          const date = new Date(record.date);
          return (date.getMonth() + 1) === monthNumber;
        });
        
        // Calculate student statistics
        const studentStats = {};
        monthData.forEach((record) => {
          record.students?.forEach((student) => {
            const id = student.studentId;
            if (!studentStats[id]) {
              studentStats[id] = { 
                name: student.name,
                Present: 0, 
                Absent: 0, 
                Leave: 0 
              };
            }

            if (student.status === 0) {
              studentStats[id].Present += 1;
            } else if (student.status === 1) {
              studentStats[id].Absent += 1;
            } else if (student.status === 2) {
              studentStats[id].Leave += 1;
            }
          });
        });

        // Format the data for display
        const formattedStudents = Object.keys(studentStats).map((id) => ({
          id: parseInt(id),
          studentNumber: id,
          studentName: studentStats[id].name,
          Present: studentStats[id].Present,
          Absent: studentStats[id].Absent,
          Leave: studentStats[id].Leave,
        }));

        setFilteredData(formattedStudents);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, [class_Id, selectedMonth]);

  const handleReset = () => {
    if (availableMonths.includes(currentMonth)) {
      setSelectedMonth(currentMonth);
    } else if (availableMonths.length > 0) {
      setSelectedMonth(availableMonths[0]);
    }
    setShowMonthDropdown(false);
  };

  const handleDownloadReport = async () => {
    const csvContent = [
      ['Student ID', 'Student Name', 'Present', 'Absent', 'Leave'],
      ...filteredData.map(({ studentNumber, studentName, Present, Absent, Leave }) => [
        studentNumber, studentName, Present, Absent, Leave,
      ]),
    ].map((row) => row.join(',')).join('\n');

    const fileUri = FileSystem.documentDirectory + 'Attendance_Report.csv';
    try {
      await FileSystem.writeAsStringAsync(fileUri, csvContent, { encoding: FileSystem.EncodingType.UTF8 });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert('Error', 'Sharing is not available on this device');
      }
    } catch (error) {
      Alert.alert('Error', 'Could not save the file');
      console.error(error);
    }
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
    <View className={`flex-1 p-4 ${colorScheme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
      <View className="flex-row items-center justify-between mb-5">
        <TouchableOpacity onPress={handleReset} className="mr-2">
          <Ionicons name="refresh-outline" size={24} color={colorScheme === 'dark' ? '#D1D5DB' : '#000'} />
        </TouchableOpacity>

        <View className="relative flex-1">
          <TouchableOpacity
            className={`w-36 flex-row items-center justify-between border rounded-[10px] p-3 ${colorScheme === 'dark' ? 'border-gray-300' : 'border-gray-300'}`}
            onPress={() => setShowMonthDropdown(!showMonthDropdown)}
          >
            <Text style={{ color: colorScheme === 'dark' ? '#D1D5DB' : '#000' }}>
              {selectedMonth}
            </Text>
            <Ionicons name={showMonthDropdown ? "chevron-up" : "chevron-down"} size={16} color={colorScheme === 'dark' ? '#D1D5DB' : '#000'} className="ml-2" />
          </TouchableOpacity>
          {showMonthDropdown && (
            <View className={`absolute top-12 left-0 right-0 border border-gray-200 rounded-[10px] ${colorScheme === 'dark' ? 'bg-gray-700' : 'bg-white'} max-h-48 z-10 shadow-md w-36`}>
              <FlatList
                data={availableMonths}
                keyExtractor={(item) => item}
                className="rounded-[10px] overflow-hidden"
                renderItem={({ item }) => (
                  <TouchableOpacity
                    className={`p-3 border-b ${colorScheme === 'dark' ? 'border-gray-500' : 'border-gray-200'}`}
                    onPress={() => { setSelectedMonth(item); setShowMonthDropdown(false); }}
                  >
                    <Text style={{ color: colorScheme === 'dark' ? '#D1D5DB' : '#000' }}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}
        </View>

        <TouchableOpacity onPress={handleDownloadReport} className="p-2">
          <Ionicons name="download-outline" size={24} color={colorScheme === 'dark' ? '#D1D5DB' : '#000'} />
        </TouchableOpacity>
      </View>

      <View className={`flex-row justify-between p-3 ${colorScheme === 'dark' ? 'bg-gray-400' : 'bg-gray-100'}`}>
        <Text className="flex-1 text-center font-semibold">Student ID</Text>
        <Text className="flex-1 text-center font-semibold">Student Name</Text>
        <Text className="flex-1 text-center font-semibold">Present</Text>
        <Text className="flex-1 text-center font-semibold">Absent</Text>
        <Text className="flex-1 text-center font-semibold">Leave</Text>
      </View>

      <FlatList
        data={filteredData}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/(tutor)/setting",
                params: { 
                  studentId: item.id, 
                  class_Id: class_Id,
                  studentName: item.studentName // Passing the student name here
                },
              })
            }
          >
            <View className={`flex-row justify-between items-center p-3 ${colorScheme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
              <Text className="flex-1 text-center" style={{ color: colorScheme === 'dark' ? '#D1D5DB' : '#000' }}>{item.studentNumber}</Text>
              <Text className="flex-1 text-center" style={{ color: colorScheme === 'dark' ? '#D1D5DB' : '#000' }}>{item.studentName}</Text>
              <Text className="flex-1 text-center text-green-500">{item.Present}</Text>
              <Text className="flex-1 text-center text-red-500">{item.Absent}</Text>
              <Text className="flex-1 text-center text-blue-500">{item.Leave}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}