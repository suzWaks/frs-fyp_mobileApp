import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image, Pressable } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function HeadCountScreen() {
  const router = useRouter();
  const { studentName } = useLocalSearchParams();
  const [students, setStudents] = useState([
    { id: '1', name: 'Esther Howard', image: 'https://via.placeholder.com/40' },
    { id: '2', name: 'Savannah Nguyen', image: 'https://via.placeholder.com/40' },
    { id: '3', name: 'Marvin McKinney', image: 'https://via.placeholder.com/40' },
    { id: '4', name: 'Jacob Jones', image: 'https://via.placeholder.com/40' },
    { id: '5', name: 'Floyd Miles', image: 'https://via.placeholder.com/40' },
    { id: '6', name: 'Annette Black', image: 'https://via.placeholder.com/40' },
    { id: '7', name: 'Bessie Cooper', image: 'https://via.placeholder.com/40' },
    { id: '8', name: 'Darrell Steward', image: 'https://via.placeholder.com/40' },
  ]);

  useEffect(() => {
    if (studentName) {
      setStudents((prevStudents) => [...prevStudents, { id: (prevStudents.length + 1).toString(), name: studentName, image: 'https://via.placeholder.com/40' }]);
    }
  }, [studentName]);

  const handleDelete = (index) => {
    setStudents((prevStudents) => prevStudents.filter((_, i) => i !== index));
  };

  const handleEdit = (index) => {
    // Handle edit functionality here
    console.log(`Edit student at index ${index}`);
  };

  const handleDonePress = () => {
    router.back(); // Navigate back to the previous screen
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Head Count</Text>
        <Ionicons name="ellipsis-vertical" size={24} color="#000" />
      </View>

      {/* Members List */}
      <Text style={styles.membersListLabel}>Members List</Text>
      <FlatList
        data={students}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <View style={styles.studentCard}>
            <Image source={{ uri: item.image }} style={styles.studentImage} />
            <Text style={styles.studentName}>{item.name}</Text>
            <View style={styles.actions}>
              <Pressable
                style={({ pressed }) => [
                  styles.actionButton,
                  pressed && styles.deleteButtonPressed,
                ]}
                onPress={() => handleDelete(index)}
              >
                <Ionicons name="close" size={20} color="#FF6B6B" />
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.actionButton,
                  pressed && styles.editButtonPressed,
                ]}
                onPress={() => handleEdit(index)}
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
});