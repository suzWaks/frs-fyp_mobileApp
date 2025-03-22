import { View, Text, TouchableOpacity, StyleSheet, FlatList, TextInput, useColorScheme } from 'react-native';
import React, { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const attendanceReport = [
  { id: '1', name: 'Nima Yozer', class: 'CTE411', date: '19-12-2024', time: '9:30 AM', status: 'Present' },
  { id: '2', name: 'Suzal Wakhlrey', class: 'CTE411', date: '19-12-2024', time: '9:30 AM', status: 'Absent' },
  { id: '3', name: 'Dechen Pelden', class: 'CTE411', date: '19-12-2024', time: '9:30 AM', status: 'Leave' },
  { id: '4', name: 'Sonam Tenzin', class: 'CTE411', date: '19-12-2024', time: '9:30 AM', status: 'Leave' },
];

export default function ReportScreen() {
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
      <View style={[styles.header, { backgroundColor: primaryColor }]}>
        <View>
          <Text style={styles.headerTitle}>{code} - {name}</Text>
          <Text style={styles.headerSubtitle}>19th Nov, 2024 - 20th Dec, 2024</Text>
        </View>
        <View style={styles.headerRight}>
          <Ionicons name="notifications-outline" size={24} color="#fff" />
          <TouchableOpacity onPress={toggleMode} style={styles.modeToggle}>
            <Ionicons name={isDarkMode ? "sunny-outline" : "moon-outline"} size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter */}
      <View style={styles.filterContainer}>
        <Text style={[styles.filterLabel, { color: textColor }]}>Filter by Date</Text>
        <View style={styles.dateInputRow}>
          <TextInput style={[styles.dateInput, { color: textColor, borderColor: textColor }]} placeholder="From" placeholderTextColor={textColor} />
          <Ionicons name="calendar-outline" size={20} color={primaryColor} />
          <TextInput style={[styles.dateInput, { color: textColor, borderColor: textColor }]} placeholder="To" placeholderTextColor={textColor} />
          <Ionicons name="calendar-outline" size={20} color={primaryColor} />
        </View>
        <TouchableOpacity style={[styles.applyFilterButton, { backgroundColor: primaryColor }]}>
          <Text style={styles.applyFilterButtonText}>Apply Filter</Text>
        </TouchableOpacity>
      </View>

      {/* Attendance Report */}
      <Text style={[styles.attendanceReportTitle, { color: textColor }]}>Attendance Report</Text>
      <FlatList
        data={attendanceReport}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.reportCard}>
            <Text style={[styles.reportText, { color: textColor }]}>{item.name}</Text>
            <Text style={[styles.reportText, { color: textColor }]}>{item.class}</Text>
            <Text style={[styles.reportText, { color: textColor }]}>{item.date}</Text>
            <Text style={[styles.reportText, { color: textColor }]}>{item.time}</Text>
            <Text style={[styles.reportText, styles[item.status.toLowerCase()]]}>{item.status}</Text>
          </View>
        )}
      />

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={[styles.editButton, { backgroundColor: primaryColor }]}>
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.downloadButton, { borderColor: primaryColor }]}>
          <Text style={[styles.downloadButtonText, { color: primaryColor }]}>Download Report</Text>
        </TouchableOpacity>
      </View>
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
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modeToggle: {
    marginLeft: 16, // Add margin to create gap
  },
  filterContainer: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  dateInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  dateInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
  },
  applyFilterButton: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  applyFilterButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  attendanceReportTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  reportCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  reportText: {
    fontSize: 14,
    flex: 1,
    textAlign: 'center',
  },
  present: {
    color: '#28a745',
  },
  absent: {
    color: '#dc3545',
  },
  leave: {
    color: '#ffc107',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  editButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  downloadButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
    borderWidth: 1,
    borderColor: '#6B4EFF',
  },
  downloadButtonText: {
    color: '#6B4EFF',
    fontSize: 16,
    fontWeight: '500',
  },
});