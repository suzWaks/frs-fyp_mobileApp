import { View, Text, TouchableOpacity, StyleSheet, FlatList, useColorScheme } from 'react-native';
import React, { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const attendanceData = [
  { date: '19th Nov, 2024', time: '9:30 am - 10:30 am' },
  { date: '19th Nov, 2024', time: '9:30 am - 10:30 am' },
  { date: '19th Nov, 2024', time: '9:30 am - 10:30 am' },
];

export default function ModuleDetailScreen() {
  const { code, name, instructor } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark');

  const toggleMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const textColor = isDarkMode ? '#a9b1d6' : '#000';
  const backgroundColor = isDarkMode ? '#1a1b26' : '#fff';
  const primaryColor = isDarkMode ? '#7aa2f7' : '#6B4EFF';

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerText, { color: textColor }]}>Hello, DAA</Text>
        <View style={styles.headerRight}>
          <Ionicons name="notifications-outline" size={24} color={textColor} />
          <TouchableOpacity onPress={toggleMode} style={styles.modeToggle}>
            <Ionicons name={isDarkMode ? "sunny-outline" : "moon-outline"} size={24} color={textColor} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Module Details */}
      <View style={styles.moduleDetails}>
        <Text style={[styles.moduleCode, { color: textColor }]}>{code} - {name}</Text>
        <Text style={[styles.moduleInstructor, { color: primaryColor }]}>{instructor}</Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: primaryColor }]}
          onPress={() => router.push(`/modules/ReportScreen?code=${code}&name=${name}&instructor=${instructor}`)}
        >
          <Text style={styles.buttonText}>Generate report till date</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: primaryColor }]}
          onPress={() => router.push(`/modules/ClassTakenReportScreen?code=${code}&name=${name}&instructor=${instructor}`)}
        >
          <Text style={styles.buttonText}>View Class Taken Report</Text>
        </TouchableOpacity>
      </View>

      {/* Attendance List */}
      <View style={styles.attendanceHeader}>
        <Text style={[styles.attendanceHeaderText, { color: textColor }]}>PERIOD-WISE REPORT</Text>
        <View style={styles.filterRow}>
          <Text style={[styles.filterLabel, { color: textColor }]}>Filter:</Text>
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="calendar-outline" size={16} color={primaryColor} />
            <Text style={styles.filterButtonText}>Choose Date</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="time-outline" size={16} color={primaryColor} />
            <Text style={styles.filterButtonText}>Choose Time</Text>
          </TouchableOpacity>
        </View>
      </View>
      <FlatList
        data={attendanceData}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.attendanceCard}>
            <View>
              <Text style={styles.attendanceText}>{item.date}</Text>
              <Text style={styles.attendanceText}>{item.time}</Text>
            </View>
            <TouchableOpacity onPress={() => router.push(`/modules/AttendanceDetailScreen?date=${item.date}&time=${item.time}`)}>
              <Text style={styles.viewAttendanceText}>View Attendance</Text>
            </TouchableOpacity>
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
    marginBottom: 20,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '500',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modeToggle: {
    marginLeft: 16, // Add margin to create gap
  },
  moduleDetails: {
    marginBottom: 20,
  },
  moduleCode: {
    fontSize: 20,
    fontWeight: '600',
  },
  moduleInstructor: {
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
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
    backgroundColor: '#F0F0FF',
    padding: 10,
    borderRadius: 10,
    marginRight: 10,
  },
  filterButtonText: {
    color: '#6B4EFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 5,
  },
  attendanceCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  attendanceText: {
    fontSize: 16,
    marginBottom: 5,
  },
  viewAttendanceText: {
    color: '#6B4EFF',
    fontSize: 16,
    fontWeight: '500',
  },
});