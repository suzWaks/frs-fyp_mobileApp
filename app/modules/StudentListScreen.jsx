import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image, Pressable, Modal } from 'react-native';
import React, { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const students = [
  { id: '1', name: 'Esther Howard', image: 'https://via.placeholder.com/40' },
  { id: '2', name: 'Savannah Nguyen', image: 'https://via.placeholder.com/40' },
  { id: '3', name: 'Marvin McKinney', image: 'https://via.placeholder.com/40' },
  { id: '4', name: 'Jacob Jones', image: 'https://via.placeholder.com/40' },
  { id: '5', name: 'Floyd Miles', image: 'https://via.placeholder.com/40' },
  { id: '6', name: 'Annette Black', image: 'https://via.placeholder.com/40' },
  { id: '7', name: 'Bessie Cooper', image: 'https://via.placeholder.com/40' },
  { id: '8', name: 'Darrell Steward', image: 'https://via.placeholder.com/40' },
];

export default function StudentListScreen() {
  const { year } = useLocalSearchParams();
  const router = useRouter();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const handleEditPress = () => {
    router.push('/profile/profile'); // Navigate to the profile screen
  };

  const handleDeletePress = (student) => {
    setSelectedStudent(student);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedStudent(null);
  };

  const handleDelete = () => {
    // Perform delete action here
    setIsModalVisible(false);
    setSelectedStudent(null);
  };

  const handleDonePress = () => {
    router.back(); // Navigate back to the previous screen
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>4IT Students</Text>
        <Ionicons name="ellipsis-vertical" size={24} color="#000" />
      </View>

      {/* Members List */}
      <Text style={styles.membersListLabel}>Members List</Text>
      <FlatList
        data={students}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.studentCard}>
            <Image source={{ uri: item.image }} style={styles.studentImage} />
            <Text style={styles.studentName}>{item.name}</Text>
            <View style={styles.actions}>
              <Pressable
                onPress={() => handleDeletePress(item)}
                style={({ pressed }) => [
                  styles.actionButton,
                  pressed && styles.deleteButtonPressed,
                ]}
              >
                <Ionicons name="close" size={20} color="#FF6B6B" />
              </Pressable>
              <Pressable
                onPress={handleEditPress}
                style={({ pressed }) => [
                  styles.actionButton,
                  pressed && styles.editButtonPressed,
                ]}
              >
                <Ionicons name="create-outline" size={20} color="#6B4EFF" />
              </Pressable>
            </View>
          </View>
        )}
      />

      {/* Done Button */}
      <TouchableOpacity style={styles.doneButton} onPress={handleDonePress}>
        <Text style={styles.doneButtonText}>Done</Text>
      </TouchableOpacity>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Are you sure you want to delete the student?</Text>
            <Text style={styles.modalMessage}>
              **Caution!! This will delete all the records related to this student
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancel}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDelete}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  membersListLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
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
  studentName: {
    flex: 1,
    fontSize: 16,
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 10,
    padding: 5,
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
  },
  deleteButtonPressed: {
    backgroundColor: '#FFEBEB',
  },
  editButtonPressed: {
    backgroundColor: '#EDEBFF',
  },
  doneButton: {
    backgroundColor: '#6B4EFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: 'red',
  },
  modalActions: {
    flexDirection: 'row',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#000',
  },
  deleteButton: {
    backgroundColor: '#FF6B6B',
    padding: 10,
    borderRadius: 5,
  },
  deleteButtonText: {
    fontSize: 16,
    color: '#fff',
  },
});