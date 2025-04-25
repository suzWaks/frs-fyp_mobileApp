import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";
import Icon from "react-native-vector-icons/Ionicons";
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function EditProfileScreen() {
  const { userData } = useLocalSearchParams();
  const userInfo = userData ? JSON.parse(userData) : null;
  const [image, setImage] = useState("https://i.imgur.com/6VBx3io.png");
  const [staffData, setStaffData] = useState(null);
  const router = useRouter();
  
  // Add the missing isLoading state
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        setIsLoading(true);
        const storedUserData = await AsyncStorage.getItem('userData');
        
        if (!storedUserData) {
          console.error('No user data found in storage');
          return;
        }
  
        const parsedUserData = JSON.parse(storedUserData);
        
        // Since we already have the user data, let's use it directly
        setStaffData({
          staffName: parsedUserData.name,
          email: parsedUserData.email,
          phoneNumber: parsedUserData.phoneNo,
          staffId: parsedUserData.staffId,
          // Add any other fields you want to display
        });
  
        // Set profile picture if available
        if (parsedUserData.profilePicture) {
          setImage(parsedUserData.profilePicture);
        }
  
      } catch (error) {
        console.error('Error setting staff data:', error);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchStaffData();
  }, []);
  
  // Update handleSaveChanges to use the correct ID
  const handleSaveChanges = async () => {
    try {
      const storedUserData = await AsyncStorage.getItem('userData');
      const parsedUserData = JSON.parse(storedUserData);
      
      const response = await fetch(`http://10.0.2.2:5253/api/Staffs/${parsedUserData.staffId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          staffId: parsedUserData.staffId,
          staffName: parsedUserData.name,
          email: parsedUserData.email,
          phoneNumber: parsedUserData.phoneNo,
          profileImage: image,
          // Add other required fields
        })
      });
  
      if (response.ok) {
        console.log('Profile updated successfully');
        router.back();
      } else {
        console.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // Remove these duplicate declarations:
  // const handleSaveChanges = async () => { ... };
  // const handleSaveChanges = () => { router.back(); };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Edit Profile</Text>
        <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.profilePhotoSection}>
        <TouchableOpacity style={styles.profilePhotoContainer} onPress={pickImage}>
          <View style={styles.imageBorder}>
            <Image source={{ uri: image }} style={styles.profilePhoto} />
          </View>
          <Text style={styles.addPhotoText}>Add Profile Photo</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formSection}>
        <View style={styles.inputContainer}>
          <Icon name="person-outline" size={20} color="#007AFF" style={styles.icon} />
          <TextInput 
            style={styles.input} 
            placeholder="Name"
            value={isLoading ? "Loading..." : (staffData?.staffName || "Not available")}
            editable={false}
          />
        </View>

        <View style={styles.inputContainer}>
          <Icon name="call-outline" size={20} color="#007AFF" style={styles.icon} />
          <TextInput 
            style={styles.input} 
            placeholder="Phone"
            value={isLoading ? "Loading..." : (staffData?.phoneNumber || "Not available")}
            editable={false}
          />
        </View>

        <View style={styles.inputContainer}>
          <Icon name="mail-outline" size={20} color="#007AFF" style={styles.icon} />
          <TextInput 
            style={styles.input} 
            placeholder="Email"
            value={isLoading ? "Loading..." : (staffData?.email || "Not available")}
            editable={false}
          />
        </View>

        <View style={styles.inputContainer}>
          <Icon name="location-outline" size={20} color="#007AFF" style={styles.icon} />
          <TextInput 
            style={styles.input} 
            placeholder="Address"
            value={isLoading ? "Loading..." : (staffData?.address || "Not available")}
            editable={false}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </TouchableOpacity>
    </View>
  );
}

// Add this styles definition at the bottom of the file
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  cancelButton: {
    padding: 18,
    backgroundColor: "rgba(255, 0, 0, 0.1)",
    borderRadius: 20,
  },
  cancelButtonText: {
    color: "red",
    fontSize: 16,
  },
  profilePhotoSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  profilePhotoContainer: {
    alignItems: "center",
  },
  imageBorder: {
    borderWidth: 2,
    borderColor: "#007AFF",
    borderRadius: 60,
    padding: 4,
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  addPhotoText: {
    color: "#007AFF",
    fontSize: 16,
    marginTop: 8,
    opacity: 0.5,
  },
  formSection: {
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    padding: 10,
    marginBottom: 29,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: "#7647EB",
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
