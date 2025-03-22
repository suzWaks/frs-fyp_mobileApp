import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image } from 'react-native';
import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const attendanceData = [
  { date: '23/4/2024', time: '10-12 am', status: 'Present' },
  { date: '27/4/2024', time: '10-12 am', status: 'Absent' },
  { date: '28/4/2024', time: '10-12 am', status: 'Present' },
  { date: '2/5/2024', time: '10-12 am', status: 'Present' },
  { date: '7/5/2024', time: '10-12 am', status: 'Absent' },
  { date: '7/5/2024', time: '10-12 am', status: 'Present' },
  { date: '7/5/2024', time: '10-12 am', status: 'Present' },
  { date: '7/5/2024', time: '10-12 am', status: 'Present' },
  { date: '7/5/2024', time: '10-12 am', status: 'Present' },
];

export default function IndividualReportScreen() {
  const { name, id, image } = useLocalSearchParams();
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="arrow-back" size={24} color="#000" onPress={() => router.back()} />
        <Text style={styles.headerTitle}>Individual Report</Text>
      </View>

      {/* Student Info */}
      <View style={styles.studentInfo}>
        <Image source={{ uri: image }} style={styles.studentImage} />
        <View>
          <Text style={styles.studentName}>{name}</Text>
          <Text style={styles.studentId}>{id}</Text>
        </View>
      </View>

      {/* Attendance Summary */}
      <View style={styles.summaryCard}>
        <View style={styles.pieChart}>
          <Text style={styles.pieChartText}>97%</Text>
        </View>
        <View style={styles.summaryDetails}>
          <Text>Total Hrs: 46 hrs</Text>
          <Text>Present Hrs: 45 hrs</Text>
          <Text>Absent Hrs: 1 hr</Text>
        </View>
        <Ionicons name="download-outline" size={24} color="#000" style={styles.downloadIcon} />
      </View>

      {/* Table Column Titles */}
      <View style={styles.tableHeader}>
        <Text style={styles.tableHeaderText}>Date</Text>
        <Text style={styles.tableHeaderText}>Time</Text>
        <Text style={styles.tableHeaderText}>Attendance</Text>
      </View>

      {/* Attendance List */}
      <FlatList
        data={attendanceData}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.attendanceRow}>
            <Text style={styles.attendanceDate}>{item.date}</Text>
            <Text style={styles.attendanceTime}>{item.time}</Text>
            <Text style={[styles.attendanceStatus, styles[item.status.toLowerCase()]]}>{item.status}</Text>
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
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 10,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  studentImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 10,
  },
  studentName: {
    fontSize: 18,
    fontWeight: '600',
  },
  studentId: {
    fontSize: 16,
    color: '#888',
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    marginBottom: 20,
  },
  pieChart: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  pieChartText: {
    fontSize: 24,
    fontWeight: '600',
  },
  summaryDetails: {
    flex: 1,
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
  attendanceDate: {
    flex: 1,
    textAlign: 'left',
  },
  attendanceTime: {
    flex: 1,
    textAlign: 'center',
  },
  attendanceStatus: {
    flex: 1,
    textAlign: 'right',
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
  editButton: {
    marginLeft: 10,
  },
});