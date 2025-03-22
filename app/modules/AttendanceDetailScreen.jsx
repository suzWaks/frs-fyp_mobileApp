import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image } from 'react-native';
import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const students = [
  { id: '1', name: 'Suzal Wakhlrey', status: 'Present', image: 'https://via.placeholder.com/40' },
  { id: '2', name: 'Nima Yozer', status: 'Absent', image: 'https://via.placeholder.com/40' },
  { id: '3', name: 'Dechen Pelden', status: 'Leave', image: 'https://via.placeholder.com/40' },
  { id: '4', name: 'Sonam Tenzin', status: 'Leave', image: 'https://via.placeholder.com/40' },
];

export default function AttendanceDetailScreen() {
  const { date, time } = useLocalSearchParams();
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Period-wise report</Text>
      </View>

      {/* Module Details */}
      <View style={styles.moduleDetails}>
        <Text style={styles.moduleCode}>CTE411 - Artificial Intelligence</Text>
        <View style={styles.dateTimeRow}>
          <Text style={styles.moduleDate}>{date}</Text>
          <Text style={styles.moduleTime}>{time}</Text>
        </View>
      </View>

      {/* Students List */}
      <FlatList
        data={students}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push(`/modules/IndividualReportScreen?name=${item.name}&id=${item.id}&image=${item.image}`)}
          >
            <View style={styles.studentCard}>
              <Image source={{ uri: item.image }} style={styles.studentImage} />
              <View style={styles.studentInfo}>
                <Text style={styles.studentName}>{item.name}</Text>
                <Text style={styles.studentDetails}>0210228, 4IT</Text>
              </View>
              <Text style={[styles.studentStatus, styles[item.status.toLowerCase()]]}>{item.status}</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.downloadButton}>
          <Text style={styles.downloadButtonText}>Download Report</Text>
        </TouchableOpacity>
      </View>
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
  moduleDetails: {
    backgroundColor: '#6B4EFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  moduleCode: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 10,
  },
  dateTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moduleDate: {
    fontSize: 16,
    color: '#fff',
  },
  moduleTime: {
    fontSize: 16,
    color: '#fff',
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  studentImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
  },
  studentDetails: {
    fontSize: 14,
    color: '#888',
  },
  studentStatus: {
    fontSize: 14,
    fontWeight: '600',
    padding: 5,
    borderRadius: 5,
    textAlign: 'center',
    width: 70,
  },
  present: {
    backgroundColor: '#D4EDDA',
    color: '#155724',
  },
  absent: {
    backgroundColor: '#F8D7DA',
    color: '#721C24',
  },
  leave: {
    backgroundColor: '#FFF3CD',
    color: '#856404',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  editButton: {
    backgroundColor: '#6B4EFF',
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
    backgroundColor: '#fff',
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