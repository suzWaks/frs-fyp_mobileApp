import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image, TextInput } from 'react-native';
import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Updated Attendance Data
const attendanceData = [
  { studentNumber: '02210182', studentName: 'Elvis Moren', status: 'Present' },
  { studentNumber: '02210200', studentName: 'Oscar Chu', status: 'Absent' },
  { studentNumber: '02210128', studentName: 'Lauren Garsier', status: 'Present' },
  { studentNumber: '02210128', studentName: 'Lauren Garsier', status: 'Present' },
  { studentNumber: '02210128', studentName: 'Lauren Garsier', status: 'Present' },
  { studentNumber: '02210128', studentName: 'Lauren Garsier', status: 'Present' },
  { studentNumber: '02210128', studentName: 'Lauren Garsier', status: 'Present' },
  { studentNumber: '02210200', studentName: 'Oscar Chu', status: 'Absent' },
  { studentNumber: '02210200', studentName: 'Oscar Chu', status: 'Absent' },
  { studentNumber: '02210200', studentName: 'Oscar Chu', status: 'Absent' },
  { studentNumber: '02210128', studentName: 'Lauren Garsier', status: 'Present' },
  { studentNumber: '02210128', studentName: 'Lauren Garsier', status: 'Present' },
];

export default function DayWiseReport() {
  const { name, id, image } = useLocalSearchParams();
  const router = useRouter();

  const handleDownloadReport = () => {
    // Implement the download functionality here
    alert('Download Report clicked');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Student Report</Text>
        <View style={styles.headerIcons}>
          <Ionicons name="notifications-outline" size={24} color="#000" />
          <TouchableOpacity onPress={handleDownloadReport}>
            <Ionicons name="download-outline" size={24} color="#000" style={styles.downloadIcon} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Date and Time Picker */}
      <View style={styles.dateTimePicker}>
        <TextInput style={styles.dateInput} placeholder="Date" />
        <TextInput style={styles.timeInput} placeholder="Time" />
      </View>

      {/* Table Header */}
      <View style={styles.tableHeader}>
        <Text style={styles.tableHeaderText}>Student ID</Text>
        <Text style={styles.tableHeaderText}>Student Name</Text>
        <Text style={styles.tableHeaderText}>Status</Text>
      </View>

      {/* Attendance List */}
      <FlatList
        data={attendanceData}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.attendanceRow}>
            <Text style={styles.attendanceText}>{item.studentNumber}</Text>
            <Text style={styles.attendanceText}>{item.studentName}</Text>
            <Text style={[styles.attendanceText, styles[item.status.toLowerCase()]]}>{item.status}</Text>
            <TouchableOpacity style={styles.editButton}>
              <Ionicons name="create-outline" size={24} color="#000" />
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
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateTimePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dateInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    marginRight: 10,
  },
  timeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    marginRight: 10,
  },
  downloadIcon: {
    marginLeft: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tableHeaderText: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '600',
  },
  attendanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  attendanceText: {
    flex: 1,
    textAlign: 'center',
  },
  present: {
    color: '#28a745',
  },
  absent: {
    color: '#dc3545',
  },
  editButton: {
    marginLeft: 10,
  },
});