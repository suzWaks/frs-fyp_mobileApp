import { View, Text, TouchableOpacity, StyleSheet, FlatList, Platform, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import DateTimePicker from '@react-native-community/datetimepicker';

// const attendanceData = [
//   { date: '19th Nov, 2024', time: '9:30 am - 10:30 am' },
//   { date: '19th Nov, 2024', time: '9:30 am - 10:30 am' },
//   { date: '19th Nov, 2024', time: '9:30 am - 10:30 am' },
// ];
import Constants from "expo-constants";

const API_BASE_URL = Constants.expoConfig.extra.API_BASE_URL;

export default function ModuleDetailScreen() {
  const { code, name, instructor, classId } = useLocalSearchParams();
  const router = useRouter();
  const { colorScheme, setColorScheme } = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isWeb] = useState(Platform.OS === 'web');

  // // API configuration
  // const API_BASE_URL = Platform.select({
  //   web: 'http://localhost:5253',
  //   android: 'http://10.2.5.57:5253/api',
  //   ios: 'http://localhost:5253',
  //   default: 'http://10.2.23.104:5253/api',
  // });

  useEffect(() => {
    fetchAttendanceRecords();
  }, [classId]);

  const fetchAttendanceRecords = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/AttendanceRecords/class/${classId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch attendance records');
      }
      const data = await response.json();
      
      // Get today's date at midnight for comparison
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Filter records for today's date only
      const todayRecords = data.filter(record => {
        const recordDate = new Date(record.date);
        recordDate.setHours(0, 0, 0, 0);
        return recordDate.getTime() === today.getTime();
      });
      
      const formattedRecords = todayRecords.map(record => ({
        date: new Date(record.date).toLocaleDateString(),
        time: record.time_Interval,
        attendanceId: record.attendance_Id,
        locationId: record.location_Id,
        totalStudents: record.students ? record.students.length : 0,
        presentCount: record.students ? record.students.filter(s => s.status === 0).length : 0,
        absentCount: record.students ? record.students.filter(s => s.status === 1).length : 0,
        leaveCount: record.students ? record.students.filter(s => s.status === 2).length : 0
      }));
      
      setAttendanceRecords(formattedRecords);
    } catch (error) {
      console.error('Error fetching attendance records:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAttendanceRecords = async (date) => {
    try {
      setLoading(true);
      // Add one day to the selected date to match the server date
      const adjustedDate = new Date(date);
      adjustedDate.setDate(adjustedDate.getDate() + 1);
      const formattedDate = adjustedDate.toISOString().split('T')[0];
      
      const response = await fetch(
        `${API_BASE_URL}/AttendanceRecords/class/${classId}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch filtered records');
      }
      
      const data = await response.json();
      
      // Filter records for the selected date
      const filteredData = data.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate.toISOString().split('T')[0] === formattedDate;
      });
      
      // Use the original selected date for display
      const displayDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
      });

      const formattedRecords = filteredData.map(record => ({
        date: displayDate, // Use the original selected date for display
        time: record.time_Interval,
        attendanceId: record.attendance_Id,
        totalStudents: record.students ? record.students.length : 0,
        presentCount: record.students ? record.students.filter(s => s.status === 0).length : 0,
        absentCount: record.students ? record.students.filter(s => s.status === 1).length : 0,
        leaveCount: record.students ? record.students.filter(s => s.status === 2).length : 0
      }));
      
      setAttendanceRecords(formattedRecords);
    } catch (error) {
      console.error('Error filtering attendance records:', error);
    } finally {
      setLoading(false);
    }
  };

  // Primary color and its variations
  const PRIMARY_COLOR = '#7647EB';
  const PRIMARY_LIGHT = '#9D7AFF';
  const PRIMARY_DARK = '#5B2DCF';

  const toggleMode = () => {
    setColorScheme(isDarkMode ? 'light' : 'dark');
  };

  const handleBackPress = () => {
    router.back();
  };

  // Color variables
  const textColor = isDarkMode ? '#E2E2E2' : '#000';
  const backgroundColor = isDarkMode ? '#121212' : '#fff';
  const headerBg = isDarkMode ? '#1E1E1E' : '#F5F5F5';
  const cardBg = isDarkMode ? '#1E1E1E' : '#fff';
  const borderColor = isDarkMode ? '#3b3b3b' : '#e5e5e5';
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [viewMode, setViewMode] = useState('month'); // 'month' or 'date'


  const handleDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      const selectedDateTime = new Date(date);
      selectedDateTime.setHours(0, 0, 0, 0);
      filterAttendanceRecords(selectedDateTime);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Header - Kept neutral as requested */}
      <View style={[styles.header, { backgroundColor: headerBg }]}>
        <View style={styles.leftHeader}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.headerText, { color: textColor }]}>Hello, DAA</Text>
        </View>
        <View style={styles.headerRight}>
          <Ionicons 
            name="notifications-outline" 
            size={24} 
            color={textColor} 
            style={styles.notificationIcon}
          />
          <TouchableOpacity onPress={toggleMode} style={styles.modeToggle}>
            <Ionicons 
              name={isDarkMode ? "sunny-outline" : "moon-outline"} 
              size={24} 
              color={textColor} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Module Details - Using primary color */}
      <View style={styles.moduleDetails}>
        <Text style={[styles.moduleCode, { color: textColor }]}>{code} - {name}</Text>
        <Text style={[styles.moduleInstructor, { color: PRIMARY_COLOR }]}>{instructor}</Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: PRIMARY_COLOR }]}
          onPress={() => router.push(`/modules/ReportScreen?code=${code}&name=${name}&instructor=${instructor}`)}
        >
          <Text style={styles.buttonText}>Generate report till date</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: PRIMARY_COLOR }]}
          onPress={() => router.push(`/modules/ClassTakenReportScreen?code=${code}&name=${name}&instructor=${instructor}`)}
        >
          <Text style={styles.buttonText}>View Class Taken Report</Text>
        </TouchableOpacity>
      </View>

      {/* Attendance List - Using primary color for accents */}
      <View style={styles.attendanceHeader}>
        <Text style={[styles.attendanceHeaderText, { color: textColor }]}>PERIOD-WISE REPORT</Text>
        <View style={styles.filterRow}>
          <TouchableOpacity 
            style={[styles.filterButton, { 
              backgroundColor: headerBg,
              borderColor: PRIMARY_COLOR,
              borderWidth: 1
            }]}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={16} color={PRIMARY_COLOR} />
            <Text style={[styles.filterButtonText, { color: PRIMARY_COLOR }]}>
              {selectedDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric'
              })}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      {/* Remove the selected date card section */}

      <FlatList
        data={attendanceRecords}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={[styles.attendanceCard, { 
            backgroundColor: cardBg,
            borderColor: borderColor,
            borderWidth: 1,
            marginTop: 10,
            padding: 15,
            borderRadius: 10,
            marginBottom: 10
          }]}>
            <View style={styles.dateTimeContainer}>
              <Text style={[styles.dateText, { color: textColor }]}>
                {item.date}
              </Text>
              <Text style={[styles.timeText, { color: textColor }]}>
                {item.time}
              </Text>
            </View>
            <TouchableOpacity 
              onPress={() => router.push({
                pathname: '/modules/AttendanceDetailScreen',
                params: {
                  classId: classId,
                  date: item.date,
                  time: item.time,
                  attendanceId: item.attendanceId
                }
              })}
              style={[styles.viewAttendanceButton, { 
                backgroundColor: PRIMARY_COLOR,
                paddingVertical: 8,
                paddingHorizontal: 16,
                borderRadius: 20
              }]}
            >
              <Text style={[styles.viewAttendanceText, { 
                color: '#fff',
                fontSize: 14,
                fontWeight: '500'
              }]}>
                View Attendance
              </Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: textColor }]}>
              No attendance records found for this date
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  leftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '500',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationIcon: {
    marginRight: 16,
  },
  modeToggle: {
    marginLeft: 16,
  },
  moduleDetails: {
    marginBottom: 20,
  },
  moduleCode: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 5,
  },
  moduleInstructor: {
    fontSize: 16,
    marginBottom: 20,
    fontWeight: '500',
  },
  button: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  attendanceHeader: {
    marginBottom: 10,
  },
  attendanceHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 10,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 5,
  },
  attendanceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dateTimeContainer: {
    flex: 1,
  },
  invalidDateText: {
    fontSize: 14,
    marginBottom: 4,
  },
  viewAttendanceButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  viewAttendanceText: {
    textAlign: 'center',
  }
});