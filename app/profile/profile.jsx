// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   Image,
//   StyleSheet,
//   Alert,
// } from "react-native";
// import * as ImagePicker from "expo-image-picker";
// import Icon from "react-native-vector-icons/Ionicons";
// import { useRouter, useLocalSearchParams } from "expo-router";
// import Constants from "expo-constants";

// export default function EditProfileScreen() {
//   const { id } = useLocalSearchParams();
//   const [staffData, setStaffData] = useState(null);
//   const [roles, setRoles] = useState([]);
//   const [departments, setDepartments] = useState([]);
//   const [showRoleDropdown, setShowRoleDropdown] = useState(false);
//   const [showDeptDropdown, setShowDeptDropdown] = useState(false);
//   const router = useRouter();
//   const API_BASE_URL = Constants.expoConfig.extra.API_BASE_URL;

//   useEffect(() => {
//     const fetchStaffData = async () => {
//       try {
//         const response = await fetch(`${API_BASE_URL}/Staffs/${id}`);
//         const data = await response.json();
//         setStaffData(data);
//       } catch (error) {
//         console.error("Error fetching staff data:", error);
//         Alert.alert("Error", "Failed to load profile data");
//       }
//     };

//     const fetchRoles = async () => {
//       try {
//         const response = await fetch(`${API_BASE_URL}/Roles`);
//         const data = await response.json();
//         setRoles(data);
//       } catch (error) {
//         console.error("Error fetching roles:", error);
//       }
//     };

//     const fetchDepartments = async () => {
//       try {
//         const response = await fetch(`${API_BASE_URL}/Departments`);
//         const data = await response.json();
//         setDepartments(data);
//       } catch (error) {
//         console.error("Error fetching departments:", error);
//       }
//     };

//     if (id) {
//       fetchStaffData();
//       fetchRoles();
//       fetchDepartments();
//     }
//   }, [id]);

//   const pickImage = async () => {
//     let result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//       aspect: [4, 3],
//       quality: 1,
//     });

//     if (!result.canceled && staffData) {
//       setStaffData({ ...staffData, profile_PictureURL: result.assets[0].uri });
//     }
//   };

//   const handleSaveChanges = async () => {
//     try {
//       const updatedData = {
//         staff_Id: staffData.staff_Id,
//         google_Id: staffData.google_Id,
//         name: staffData.name,
//         phone_No: staffData.phone_No,
//         email: staffData.email,
//         profile_PictureURL: staffData.profile_PictureURL,
//         role_Id: staffData.role_Id,
//         department_Id: staffData.department?.department_Id,
//       };

//       const response = await fetch(`${API_BASE_URL}/Staffs/${id}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(updatedData),
//       });

//       if (response.ok) {
//         Alert.alert("Success", "Profile updated successfully!");
//         router.back();
//       } else {
//         Alert.alert("Error", "Failed to update profile");
//       }
//     } catch (error) {
//       console.error("Error updating profile:", error);
//       Alert.alert("Error", "Something went wrong");
//     }
//   };

//   if (!staffData) {
//     return (
//       <View style={styles.container}>
//         <Text>Loading profile...</Text>
//       </View>
//     );
//   }

//   const roleName =
//     roles.find((role) => role.role_Id === staffData.role_Id)?.role_Name || "Select Role";

//   const departmentName =
//     departments.find((dept) => dept.department_Id === staffData.department?.department_Id)?.department_Name || "Select Department";

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <Text style={styles.headerText}>Edit Profile</Text>
//         <TouchableOpacity
//           style={styles.cancelButton}
//           onPress={() => router.back()}
//         >
//           <Text style={styles.cancelButtonText}>Cancel</Text>
//         </TouchableOpacity>
//       </View>

//       <View style={styles.profilePhotoSection}>
//         <TouchableOpacity
//           style={styles.profilePhotoContainer}
//           onPress={pickImage}
//         >
//           <View style={styles.imageBorder}>
//             <Image
//               source={{ uri: staffData.profile_PictureURL }}
//               style={styles.profilePhoto}
//             />
//           </View>
//           <Text style={styles.addPhotoText}>Change Profile Photo</Text>
//         </TouchableOpacity>
//       </View>

//       <View style={styles.formSection}>
//         <View style={styles.inputContainer}>
//           <Icon name="person-outline" size={20} color="#007AFF" style={styles.icon} />
//           <TextInput
//             style={styles.input}
//             placeholder="Full Name"
//             value={staffData.name}
//             onChangeText={(text) => setStaffData({ ...staffData, name: text })}
//           />
//         </View>

//         <View style={styles.inputContainer}>
//           <Icon name="briefcase-outline" size={20} color="#007AFF" style={styles.icon} />
//           <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowRoleDropdown(!showRoleDropdown)}>
//             <Text>{roleName}</Text>
//           </TouchableOpacity>
//         </View>
//         {showRoleDropdown && (
//           <View style={styles.dropdown}>
//             {roles.map((role) => (
//               <TouchableOpacity
//                 key={role.role_Id}
//                 onPress={() => {
//                   setStaffData({ ...staffData, role_Id: role.role_Id });
//                   setShowRoleDropdown(false);
//                 }}
//               >
//                 <Text>{role.role_Name}</Text>
//               </TouchableOpacity>
//             ))}
//           </View>
//         )}

//         <View style={styles.inputContainer}>
//           <Icon name="business-outline" size={20} color="#007AFF" style={styles.icon} />
//           <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowDeptDropdown(!showDeptDropdown)}>
//             <Text>{departmentName}</Text>
//           </TouchableOpacity>
//         </View>
//         {showDeptDropdown && (
//           <View style={styles.dropdown}>
//             {departments.map((dept) => (
//               <TouchableOpacity
//                 key={dept.department_Id}
//                 onPress={() => {
//                   setStaffData({
//                     ...staffData,
//                     department: { department_Id: dept.department_Id },
//                   });
//                   setShowDeptDropdown(false);
//                 }}
//               >
//                 <Text>{dept.department_Name}</Text>
//               </TouchableOpacity>
//             ))}
//           </View>
//         )}
//       </View>

//       <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
//         <Text style={styles.saveButtonText}>Save Changes</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 16,
//     backgroundColor: "#fff",
//   },
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 20,
//   },
//   headerText: {
//     fontSize: 24,
//     fontWeight: "bold",
//   },
//   cancelButton: {
//     padding: 10,
//     backgroundColor: "rgba(255, 0, 0, 0.1)",
//     borderRadius: 10,
//   },
//   cancelButtonText: {
//     color: "red",
//     fontSize: 16,
//   },
//   profilePhotoSection: {
//     alignItems: "center",
//     marginBottom: 20,
//   },
//   profilePhotoContainer: {
//     alignItems: "center",
//   },
//   imageBorder: {
//     borderWidth: 2,
//     borderColor: "#007AFF",
//     borderRadius: 60,
//     padding: 4,
//   },
//   profilePhoto: {
//     width: 100,
//     height: 100,
//     borderRadius: 50,
//   },
//   addPhotoText: {
//     color: "#007AFF",
//     fontSize: 16,
//     marginTop: 8,
//     opacity: 0.5,
//   },
//   formSection: {
//     marginBottom: 20,
//   },
//   inputContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 20,
//     padding: 10,
//     marginBottom: 20,
//   },
//   icon: {
//     marginRight: 10,
//   },
//   input: {
//     flex: 1,
//     fontSize: 14,
//   },
//   dropdown: {
//     backgroundColor: "#eee",
//     padding: 10,
//     marginBottom: 10,
//     borderRadius: 10,
//   },
//   saveButton: {
//     backgroundColor: "#7647EB",
//     borderRadius: 20,
//     padding: 16,
//     alignItems: "center",
//   },
//   saveButtonText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "bold",
//   },
// });


import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import Icon from "react-native-vector-icons/Ionicons";
import { useRouter, useLocalSearchParams } from "expo-router";
import Constants from "expo-constants";

export default function EditProfileScreen() {
  const { id } = useLocalSearchParams();
  const [staffData, setStaffData] = useState(null);
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);
  const router = useRouter();
  const API_BASE_URL = Constants.expoConfig.extra.API_BASE_URL;

  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/Staffs/${id}`);
        const data = await response.json();
        setStaffData(data);
      } catch (error) {
        console.error("Error fetching staff data:", error);
        Alert.alert("Error", "Failed to load profile data");
      }
    };

    const fetchRoles = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/Roles`);
        const data = await response.json();
        setRoles(data);
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    };

    const fetchDepartments = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/Departments`);
        const data = await response.json();
        setDepartments(data);
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };

    if (id) {
      fetchStaffData();
      fetchRoles();
      fetchDepartments();
    }
  }, [id]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && staffData) {
      setStaffData({ ...staffData, profile_PictureURL: result.assets[0].uri });
    }
  };

  const handleSaveChanges = async () => {
    try {
      const updatedData = {
        staff_Id: staffData.staff_Id,
        google_Id: staffData.google_Id,
        name: staffData.name,
        phone_No: staffData.phone_No,
        email: staffData.email,
        profile_PictureURL: staffData.profile_PictureURL,
        role_Id: staffData.role_Id,
        department_Id: staffData.department?.department_Id,
      };

      const response = await fetch(`${API_BASE_URL}/Staffs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        Alert.alert("Success", "Profile updated successfully!");
        router.back();
      } else {
        Alert.alert("Error", "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Something went wrong");
    }
  };

  if (!staffData) {
    return (
      <View style={styles.container}>
        <Text>Loading profile...</Text>
      </View>
    );
  }

  const roleName =
    roles.find((role) => role.role_Id === staffData.role_Id)?.role_Name || "Select Role";

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Edit Profile</Text>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.profilePhotoSection}>
        <TouchableOpacity
          style={styles.profilePhotoContainer}
          onPress={pickImage}
        >
          <View style={styles.imageBorder}>
            <Image
              source={{ uri: staffData.profile_PictureURL }}
              style={styles.profilePhoto}
            />
          </View>
          <Text style={styles.addPhotoText}>Change Profile Photo</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formSection}>
        <View style={styles.inputContainer}>
          <Icon
            name="person-outline"
            size={20}
            color="#007AFF"
            style={styles.icon}
          />
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={staffData.name}
            onChangeText={(text) => setStaffData({ ...staffData, name: text })}
          />
        </View>

        <View style={styles.inputContainer}>
          <Icon
            name="briefcase-outline"
            size={20}
            color="#007AFF"
            style={styles.icon}
          />
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => setShowRoleDropdown(!showRoleDropdown)}
          >
            <Text>{roleName}</Text>
          </TouchableOpacity>
        </View>
        {showRoleDropdown && (
          <View style={styles.dropdown}>
            {roles.map((role) => (
              <TouchableOpacity
                key={role.role_Id}
                style={styles.dropdownItem}
                onPress={() => {
                  setStaffData({ ...staffData, role_Id: role.role_Id });
                  setShowRoleDropdown(false);
                }}
              >
                <Text>{role.role_Name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.inputContainer}>
          <Icon
            name="call-outline"
            size={20}
            color="#007AFF"
            style={styles.icon}
          />
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            keyboardType="phone-pad"
            value={staffData.phone_No.toString()}
            onChangeText={(text) =>
              setStaffData({ ...staffData, phone_No: text })
            }
          />
        </View>

        <View style={styles.inputContainer}>
          <Icon
            name="mail-outline"
            size={20}
            color="#007AFF"
            style={styles.icon}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            keyboardType="email-address"
            value={staffData.email}
            onChangeText={(text) => setStaffData({ ...staffData, email: text })}
          />
        </View>

        <View style={styles.inputContainer}>
          <Icon
            name="school-outline"
            size={20}
            color="#007AFF"
            style={styles.icon}
          />
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => setShowDeptDropdown(!showDeptDropdown)}
          >
            <Text>
              {staffData.department?.department_Name || "Select Department"}
            </Text>
          </TouchableOpacity>
        </View>
        {showDeptDropdown && (
          <View style={styles.dropdown}>
            {departments.map((dept) => (
              <TouchableOpacity
                key={dept.departmentId}
                style={styles.dropdownItem}
                onPress={() => {
                  setStaffData({
                    ...staffData,
                    department: {
                      department_Id: dept.departmentId,
                      department_Name: dept.departmentName,
                    },
                  });
                  setShowDeptDropdown(false);
                }}
              >
                <Text>{dept.departmentName}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
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
    padding: 12,
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
    marginBottom: 20,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
  },
  dropdown: {
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    paddingVertical: 4,
    marginBottom: 10,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    elevation: 3,
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
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
