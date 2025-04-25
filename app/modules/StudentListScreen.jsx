import { View, Text, TouchableOpacity, FlatList, Image, Pressable, Modal } from 'react-native';
import React, { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';

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
  const { colorScheme, setColorScheme } = useColorScheme();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Dark mode state and colors
  const isDarkMode = colorScheme === 'dark';
  const textColor = isDarkMode ? '#a9b1d6' : '#000';
  const backgroundColor = isDarkMode ? '#1a1b26' : '#fff';
  const headerBg = isDarkMode ? '#24283b' : '#F0F0FF';
  const cardBg = isDarkMode ? '#24283b' : '#fff';
  const borderColor = isDarkMode ? '#3b3b3b' : '#e5e5e5';

  const toggleMode = () => {
    const newMode = isDarkMode ? 'light' : 'dark';
    setColorScheme(newMode);
  };

  const handleEditPress = () => {
    router.push('/profile/profile');
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
    setIsModalVisible(false);
    setSelectedStudent(null);
    // Add your actual delete logic here
  };

  const handleBackPress = () => {
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: headerBg }]}>
        {/* Left Side: Back Button */}
        <View style={styles.leftHeader}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: textColor }]}>4IT Students</Text>
        </View>

        {/* Right Side: Mode Toggle */}
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={toggleMode}>
            <Ionicons 
              name={isDarkMode ? "sunny-outline" : "moon-outline"} 
              size={24} 
              color={textColor} 
            />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Members List */}
      <Text style={[styles.sectionTitle, { color: textColor }]}>Members List</Text>
      <FlatList
        data={students}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.studentCard, { 
            backgroundColor: cardBg,
            borderColor: borderColor 
          }]}>
            <Image source={{ uri: item.image }} style={styles.studentImage} />
            <Text style={[styles.studentName, { color: textColor }]}>{item.name}</Text>
            <View style={styles.actionsContainer}>
              <Pressable
                onPress={() => handleDeletePress(item)}
                style={[styles.actionButton, { backgroundColor: isDarkMode ? '#3b3b3b' : '#f0f0f0' }]}
              >
                <Ionicons name="close" size={20} color="#FF6B6B" />
              </Pressable>
              <Pressable
                onPress={handleEditPress}
                style={[styles.actionButton, { backgroundColor: isDarkMode ? '#3b3b3b' : '#f0f0f0' }]}
              >
                <Ionicons name="create-outline" size={20} color="#6B4EFF" />
              </Pressable>
            </View>
          </View>
        )}
      />

      {/* Delete Confirmation Modal */}
      <Modal visible={isModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: cardBg }]}>
            <Text style={[styles.modalTitle, { color: textColor }]}>
              Are you sure you want to delete the student?
            </Text>
            <Text style={styles.warningText}>
              **Caution!! This will delete all the records related to this student
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, { backgroundColor: isDarkMode ? '#3b3b3b' : '#f0f0f0' }]}
                onPress={handleCancel}
              >
                <Text style={[styles.buttonText, { color: textColor }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton]}
                onPress={handleDelete}
              >
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = {
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
  leftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
  },
  studentImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 15,
  },
  studentName: {
    flex: 1,
    fontSize: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    borderRadius: 20,
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  warningText: {
    fontSize: 14,
    color: '#FF6B6B',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    width: '48%',
    alignItems: 'center',
  },
  cancelButton: {
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: '#FF6B6B',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
};