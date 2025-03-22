import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";
import Icon from "react-native-vector-icons/Ionicons";
import { useRouter } from 'expo-router';

export default function EditProfileScreen() {
  const [image, setImage] = useState("https://via.placeholder.com/150");
  const router = useRouter();

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

  const handleSaveChanges = () => {
    // Perform save changes logic here
    router.back(); // Navigate back to the previous screen
  };

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
          <TextInput style={styles.input} placeholder="Sonam Tenzin" value="Sonam Tenzin" />
        </View>

        <View style={styles.inputContainer}>
          <Icon name="call-outline" size={20} color="#007AFF" style={styles.icon} />
          <TextInput style={styles.input} placeholder="+975 | 17908548" value="+975 | 17908548" />
        </View>

        <View style={styles.inputContainer}>
          <Icon name="mail-outline" size={20} color="#007AFF" style={styles.icon} />
          <TextInput style={styles.input} placeholder="sonamtenzey0@gmail.com" value="sonamtenzey0@gmail.com" />
        </View>

        <View style={styles.inputContainer}>
          <Icon name="location-outline" size={20} color="#007AFF" style={styles.icon} />
          <TextInput style={styles.input} placeholder="Address" value="Rinchending, Phuentsholing" />
        </View>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </TouchableOpacity>
    </View>
  );
}

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
