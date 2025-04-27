import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, SafeAreaView, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; // Use useRouter for navigation with expo-router
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MenuScreen() {
  const router = useRouter(); // Using useRouter from expo-router for navigation
  const [modalVisible, setModalVisible] = useState(false); // State to control the modal visibility

  // Handle Logout - Show confirmation dialog
  const handleLogout = () => {
    setModalVisible(true); // Open the modal dialog
  };

  // Confirm Logout - Clear AsyncStorage and navigate to SignIn
  const confirmLogout = async () => {
    console.log("Logging out...");
    try {
      // Clear AsyncStorage
      await AsyncStorage.multiRemove(['userToken', 'userRole']);
      console.log("AsyncStorage cleared.");

      // Check if data is cleared for debugging
      const token = await AsyncStorage.getItem('userToken');
      const role = await AsyncStorage.getItem('userRole');
      console.log('Token after logout:', token);
      console.log('Role after logout:', role);

      // Navigate to SignIn screen inside the auth folder
      router.replace('/(auth)/signin'); // Use expo-router to navigate to SignIn
      console.log("Redirecting to SignIn screen...");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Close the modal without logging out
  const cancelLogout = () => {
    setModalVisible(false); // Close the modal dialog
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerText}>Menu</Text>
        </View>

        {/* Profile Section */}
        <TouchableOpacity style={styles.profileSection}>
          <View style={styles.profileIcon}>
            <Ionicons name="person-outline" size={24} color="#65676b" />
          </View>
          <Text style={styles.profileName}>Mughiwaraa NJ Voii</Text>
        </TouchableOpacity>

        {/* Main Menu Items */}
        <View style={styles.menuItems}>
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="settings-outline" size={24} color="black" />
            <Text style={styles.menuText}>Settings</Text>
          </TouchableOpacity>
          <View style={styles.separator} />
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="notifications-outline" size={24} color="black" />
            <Text style={styles.menuText}>Notifications</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <MaterialCommunityIcons name="message-text-outline" size={24} color="black" />
            <Text style={styles.menuText}>Message requests</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <MaterialCommunityIcons name="archive-outline" size={24} color="black" />
            <Text style={styles.menuText}>Archive</Text>
          </TouchableOpacity>
        </View>

        {/* Logout Section */}
        <View style={styles.logoutSection}>
          <Text style={styles.moreText}>More</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="black" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={cancelLogout}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Logout</Text>
            <Text style={styles.modalMessage}>Are you sure you want to log out?</Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={cancelLogout}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={confirmLogout}>
                <Text style={styles.modalButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f4f4f4',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  profileIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#e0e0e0',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: {
    marginLeft: 16,
    fontSize: 16,
    fontWeight: '600',
  },
  menuItems: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  menuText: {
    marginLeft: 16,
    fontSize: 16,
  },
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 8,
  },
  logoutSection: {
    marginTop: 24,
  },
  moreText: {
    paddingLeft: 16,
    fontSize: 14,
    color: '#888',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  logoutText: {
    marginLeft: 16,
    fontSize: 16,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#2196F3',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#7647EB', // Updated button color
    borderRadius: 5,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
  },
});
