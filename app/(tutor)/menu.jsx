import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, SafeAreaView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'nativewind';

// Primary colors
const PRIMARY_COLOR = '#7647EB';
const PRIMARY_LIGHT = '#9D7AFF';
const PRIMARY_DARK = '#5B2DCF';

export default function MenuScreen() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [userData, setUserData] = useState(null);
  const { colorScheme, setColorScheme } = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  useEffect(() => {
    const getUserData = async () => {
      try {
        const data = await AsyncStorage.getItem('userData');
        if (data) {
          setUserData(JSON.parse(data));
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    getUserData();
  }, []);

  const handleLogout = () => {
    setModalVisible(true);
  };

  const confirmLogout = async () => {
    try {
      await AsyncStorage.clear();
      router.replace('/(auth)/signin');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const cancelLogout = () => {
    setModalVisible(false);
  };

  // Dynamic styles based on theme
  const dynamicStyles = {
    backgroundColor: isDarkMode ? '#121212' : '#fff',
    textColor: isDarkMode ? '#E2E2E2' : '#000',
    headerBg: isDarkMode ? '#1E1E1E' : PRIMARY_LIGHT,
    cardBg: isDarkMode ? '#1E1E1E' : '#fff',
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: dynamicStyles.backgroundColor }]}>
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: dynamicStyles.headerBg }]}>
          <Text style={[styles.headerText, { color: '#fff' }]}>Menu</Text>
        </View>

        {/* Profile Section */}
        <TouchableOpacity 
          style={[styles.profileSection, { backgroundColor: isDarkMode ? '#1E1E1E' : '#f5f5f5' }]}
          onPress={() => router.push('/profile/profile')}
        >
          <View style={[styles.profileIcon, { backgroundColor: PRIMARY_COLOR }]}>
            <Ionicons name="person-outline" size={24} color="#fff" />
          </View>
          <Text style={[styles.profileName, { color: dynamicStyles.textColor }]}>
            {userData?.name || 'User'}
          </Text>
        </TouchableOpacity>

        {/* Main Menu Items */}
        <View style={styles.menuItems}>
          <TouchableOpacity 
            style={[styles.menuItem, { backgroundColor: isDarkMode ? '#1E1E1E' : '#f5f5f5' }]}
          >
            <Ionicons name="settings-outline" size={24} color={PRIMARY_COLOR} />
            <Text style={[styles.menuText, { color: dynamicStyles.textColor }]}>Settings</Text>
          </TouchableOpacity>
          <View style={styles.separator} />
          <TouchableOpacity 
            style={[styles.menuItem, { backgroundColor: isDarkMode ? '#1E1E1E' : '#f5f5f5' }]}
          >
            <Ionicons name="notifications-outline" size={24} color={PRIMARY_COLOR} />
            <Text style={[styles.menuText, { color: dynamicStyles.textColor }]}>Notifications</Text>
          </TouchableOpacity>
        </View>

        {/* Logout Section */}
        <View style={styles.logoutSection}>
          <Text style={[styles.moreText, { color: PRIMARY_COLOR }]}>More</Text>
          <TouchableOpacity 
            style={[styles.logoutButton, { backgroundColor: isDarkMode ? '#1E1E1E' : '#f5f5f5' }]} 
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={24} color={PRIMARY_COLOR} />
            <Text style={[styles.logoutText, { color: dynamicStyles.textColor }]}>Logout</Text>
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
          <View style={[styles.modalContent, { backgroundColor: dynamicStyles.backgroundColor }]}>
            <Text style={[styles.modalTitle, { color: dynamicStyles.textColor }]}>Confirm Logout</Text>
            <Text style={[styles.modalMessage, { color: dynamicStyles.textColor }]}>
              Are you sure you want to log out?
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: PRIMARY_COLOR }]} 
                onPress={cancelLogout}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: PRIMARY_DARK }]} 
                onPress={confirmLogout}
              >
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
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    elevation: 3,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 12,
  },
  profileIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: {
    marginLeft: 16,
    fontSize: 18,
    fontWeight: '600',
  },
  menuItems: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginVertical: 4,
  },
  menuText: {
    marginLeft: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 8,
  },
  logoutSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  moreText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  logoutText: {
    marginLeft: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});