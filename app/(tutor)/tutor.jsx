import { View, Text, ScrollView, TouchableOpacity, Animated, TouchableWithoutFeedback, StyleSheet, Switch, Image } from "react-native";
import { useColorScheme } from "nativewind";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router"; 
import AttendanceDialog from "../tutorcomponent/attendanceDialog.jsx";
import AsyncStorage from "@react-native-async-storage/async-storage"; 
import Constants from "expo-constants";

export default function HeaderScreen() {
  const router = useRouter(); 
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [isTutorMode, setIsTutorMode] = useState(true); 
  const [userRole, setUserRole] = useState(null);
  const [staffData, setStaffData] = useState(null);
  const [selectedClassId, setSelectedClassId] = useState(null);
  
  const API_BASE_URL = Constants.expoConfig.extra.API_BASE_URL;
  const primaryColor = '#7647EB';
  const lightPrimary = '#9D71EE';
  const lightestPrimary = '#CDABFF';

  // Array of different colors for module headers
  const moduleHeaderColors = [ 
   '#009db8',  
   '#0071ff',
    '#00a17f',
    '#7647eb', 
    '#a994c8', 
    '#0095ea', 
  ];

  // Function to get a color based on module code or index
  const getModuleColor = (index) => {
    return moduleHeaderColors[index % moduleHeaderColors.length];
  };

  // Header icon/text colors
  const headerIconColor = colorScheme === 'dark' ? '#E0E0E0' : '#000';
  const headerTextColor = colorScheme === 'dark' ? '#E0E0E0' : '#000';

  // Fetch user data and staff data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Load user data from AsyncStorage
        const userDataString = await AsyncStorage.getItem('userData');
        
        if (!userDataString) {
          console.log('No user data found in storage');
          return;
        }
  
        const userData = JSON.parse(userDataString);
        console.log('Loaded user data:', userData); // Debug log
  
        // Set user role
        if (userData.role) {
          const role = userData.role.toLowerCase();
          setUserRole(role);
          
          // Set tutor mode if role is tutor or PL
          setIsTutorMode(role === 'tutor' || role === 'pl');
        }
  
        // Check if we have a staff ID (for staff members)
        if (userData.staffId) {
          console.log('Fetching data for staff ID:', userData.staffId); // Debug log
          
          // Fetch staff data from API
          const response = await fetch(`${API_BASE_URL}/Staffs`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          const staff = data.find((staff) => staff.staff_Id === userData.staffId);
          
          if (staff) {
            console.log('Found staff data:', staff); // Debug log
            setStaffData(staff);
          } else {
            console.error(`Staff with ID ${userData.staffId} not found`);
          }
        } 
      } catch (error) {
        console.error('Error loading data:', error);
        // You might want to add error handling here (e.g., show a toast)
      }
    };
  
    loadUserData();
  }, []);

  const toggleRole = async () => {
    const newRole = !isTutorMode ? "tutor" : "daa";
    setIsTutorMode(!isTutorMode);
    await AsyncStorage.setItem("role", newRole);
  
    if (newRole === "tutor") {
      router.push("/tutor");
    } else {
      router.push("/home");
    }
  };
  
  const [recentViewOptionsVisible, setRecentViewOptionsVisible] = useState(null);
  const [allModulesViewOptionsVisible, setAllModulesViewOptionsVisible] = useState(null);
  const [dropdownAnimation] = useState(new Animated.Value(0));

  const toggleDropdown = (index, type) => {
    const setDropdownVisible = type === 'recent' ? setRecentViewOptionsVisible : setAllModulesViewOptionsVisible;
    const currentState = type === 'recent' ? recentViewOptionsVisible : allModulesViewOptionsVisible;

    if (currentState === index) {
      Animated.timing(dropdownAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setDropdownVisible(null));
    } else {
      setDropdownVisible(index);
      Animated.timing(dropdownAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const dropdownOpacity = dropdownAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1], 
  });

  const dropdownTranslateY = dropdownAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-10, 0], 
  });

  const handleOutsideClick = () => {
    setRecentViewOptionsVisible(null);
    setAllModulesViewOptionsVisible(null);
  };

  const handleViewPress = (moduleCode, viewType, class_Id) => {
    const route = viewType === "attendance" ? "/tutorcomponent/attendanceReport" : "/tutorcomponent/moduleDetail";
    router.push({
      pathname: route,
      params: { moduleCode: moduleCode, class_Id: class_Id },
    });
  };

  const handleNotificationIconPress = () => {
    router.push("/tutorcomponent/notificationScreen"); 
  };

  const handleProfileIconPress = () => {
    router.push(`/profile/profile?id=${staffData.id}`); // Navigate to the profile screen
  };

  const handleTakeAttendancePress = (class_Id) => {
    setSelectedClassId(class_Id);
    setModalVisible(true);
    console.log("Passed class id: ", class_Id);
  };

  if (!staffData) {
    return <Text>Loading...</Text>;
  }

  return (
    <TouchableWithoutFeedback onPress={handleOutsideClick}>
      <View style={[styles.container, { backgroundColor: colorScheme === "dark" ? "#121212" : "#fff" }]}>

        <AttendanceDialog visible={modalVisible} onClose={() => setModalVisible(false)} class_Id={selectedClassId} />

        <View style={[styles.header, { backgroundColor: colorScheme === "dark" ? "#1E1E1E" : "#fff" }]}>

          <TouchableOpacity onPress={handleProfileIconPress} style={styles.profileSection}>
            {staffData.profileImage ? (
              <Image
                source={{ uri: staffData.profileImage }}
                style={styles.profileImage}
              />
            ) : (
              <Ionicons 
                name="person-circle-outline" 
                size={40} 
                color={headerIconColor} 
              />
            )}
            <Text style={[styles.profileText, { color: headerTextColor }]}>
              {staffData.name}
            </Text>
          </TouchableOpacity>

          <View style={styles.headerRight}>
            <TouchableOpacity onPress={handleNotificationIconPress} style={styles.notificationIcon}>
              <Ionicons 
                name="notifications-outline" 
                size={24} 
                color={headerIconColor} 
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => toggleColorScheme(colorScheme === "light" ? "dark" : "light")}>
              <Ionicons 
                name={colorScheme === "dark" ? "sunny-outline" : "moon-outline"} 
                size={24} 
                color={headerIconColor} 
              />
            </TouchableOpacity>
          </View>

        </View>

        {/* Show toggle only for DAA role */}
        {userRole === 'daa' && (
          <View style={[styles.toggleRoleContainer, { backgroundColor: colorScheme === "dark" ? "#1E1E1E" : "#f4f4f4" }]}>
            <Text style={{ color: colorScheme === "dark" ? "#E0E0E0" : "#000", fontSize: 16 }}>
              {isTutorMode ? "DAA" : "Tutor"}
            </Text>
            <Switch 
              value={isTutorMode} 
              onValueChange={toggleRole} 
              thumbColor={primaryColor}
              trackColor={{ false: "#CCCCCC", true: lightestPrimary }}
            />
            <Text style={{ color: primaryColor, fontSize: 16, fontWeight: 'bold' }}>
              {isTutorMode ? "Tutor" : "DAA"}
            </Text>
          </View>
        )}

        <View style={styles.contentContainer}>
          {/* Recent Modules */}
          <Text style={[styles.sectionTitle, { color: '#000' }]}>Recent</Text>
          <View style={[styles.cardContainer, { backgroundColor: colorScheme === "dark" ? "#1E1E1E" : "#fff" }]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={true} style={{ borderRadius: 10 }}>
              {staffData.classes.map((module, index) => (
                <View key={index} style={[styles.moduleCard, { backgroundColor: colorScheme === "dark" ? "#2D2D2D" : "#fff" }]}>
                  <View style={[styles.moduleHeader, { backgroundColor: getModuleColor(index) }]}>
                    <View>
                      <Text style={[styles.moduleCode, { color: '#fff' }]}>{module.module_Code}</Text>
                      <Text style={[styles.moduleName, { color: 'rgba(255,255,255,0.8)' }]}>{module.class_Name}</Text>
                    </View>
                    <TouchableOpacity 
                      onPress={() => toggleDropdown(index, 'recent')}
                      style={[styles.viewButton, { backgroundColor: getModuleColor(index) }]}
                    >
                      <Text style={[styles.viewButtonText, { textDecorationLine: 'underline' }]}>View</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Take Attendance Button */}
                  <View style={styles.attendanceButtonContainer}>
                    <TouchableOpacity 
                      onPress={() => handleTakeAttendancePress(module.class_Id)} 
                      style={[styles.attendanceButton, { backgroundColor: getModuleColor(index) }]}
                    >
                      <Text style={styles.attendanceButtonText}>Take Attendance</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Dropdown Options for Recent */}
                  {recentViewOptionsVisible === index && (
                    <Animated.View
                      style={[styles.dropdownMenu, { 
                        backgroundColor: getModuleColor(index),
                        opacity: dropdownOpacity,
                        transform: [{ translateY: dropdownTranslateY }],
                      }]}
                    >
                      <TouchableOpacity 
                        style={styles.dropdownItem}
                        onPress={() => handleViewPress(module.module_Code, 'attendance', module.class_Id)}
                      >
                        <Text style={[styles.dropdownItemText, { color: '#fff' }]}>Attendance Report</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.dropdownItem}
                        onPress={() => handleViewPress(module.module_Code, 'moduleDetail', module.class_Id)}
                      >
                        <Text style={[styles.dropdownItemText, { color: '#fff' }]}>Module Detail</Text>
                      </TouchableOpacity>
                    </Animated.View>
                  )}
                </View>
              ))}
            </ScrollView>
          </View>

          {/* All Modules */}
          <Text style={[styles.sectionTitle, { color: '#000' }]}>All Modules</Text>
          <ScrollView style={styles.verticalScroll}>
            {staffData.classes.map((module, index) => (
              <View key={index} style={[styles.moduleCardVertical, { backgroundColor: colorScheme === "dark" ? "#2D2D2D" : "#fff" }]}>
                <View style={[styles.moduleHeader, { backgroundColor: getModuleColor(index) }]}>
                  <View>
                    <Text style={[styles.moduleCode, { color: '#fff' }]}>{module.module_Code}</Text>
                    <Text style={[styles.moduleName, { color: 'rgba(255,255,255,0.8)' }]}>{module.class_Name}</Text>
                  </View>
                  <TouchableOpacity 
                    onPress={() => toggleDropdown(index, 'allModules')}
                    style={[styles.viewButton, { backgroundColor:getModuleColor(index)}]}
                  >
                    <Text style={[styles.viewButtonText, { textDecorationLine: 'underline' }]}>View</Text>
                  </TouchableOpacity>
                </View>

                {/* Take Attendance Button */}
                <View style={styles.attendanceButtonContainer}>
                  <TouchableOpacity 
                    onPress={() => handleTakeAttendancePress(module.class_Id)} 
                    style={[styles.attendanceButton, { backgroundColor: getModuleColor(index) }]}
                  >
                    <Text style={styles.attendanceButtonText}>Take Attendance</Text>
                  </TouchableOpacity>
                </View>

                {/* Dropdown Options for All Modules */}
                {allModulesViewOptionsVisible === index && (
                  <Animated.View
                    style={[styles.dropdownMenuVertical, { 
                      backgroundColor: getModuleColor(index),
                      opacity: dropdownOpacity,
                      transform: [{ translateY: dropdownTranslateY }],
                    }]}
                  >
                    <TouchableOpacity 
                      style={styles.dropdownItem}
                      onPress={() => handleViewPress(module.module_Code, 'attendance', module.class_Id)}
                    >
                      <Text style={[styles.dropdownItemText, { color: '#fff' }]}>Attendance Report</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.dropdownItem}
                      onPress={() => handleViewPress(module.module_Code, 'moduleDetail', module.class_Id)}
                    >
                      <Text style={[styles.dropdownItemText, { color: '#fff' }]}>Module Detail</Text>
                    </TouchableOpacity>
                  </Animated.View>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 30,
  },
  header: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileText: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: "bold",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  notificationIcon: {
    marginRight: 16,
  },
  toggleRoleContainer: {
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 10,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  cardContainer: {
    borderRadius: 10,
    marginBottom: 16,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  moduleCard: {
    width: 280,
    borderRadius: 10,
    marginRight: 12,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  moduleCardVertical: {
    borderRadius: 10,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  moduleHeader: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  moduleCode: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  moduleName: {
    fontSize: 14,
  },
  viewButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  viewButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  attendanceButtonContainer: {
    padding: 16,
    alignItems: 'flex-end',
  },
  attendanceButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  attendanceButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 60,
    right: 10,
    borderRadius: 6,
    padding: 8,
    width: 160,
    zIndex: 10,
  },
  dropdownMenuVertical: {
    position: 'absolute',
    top: 60,
    right: 10,
    borderRadius: 6,
    padding: 8,
    width: 160,
    zIndex: 10,
  },
  dropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  dropdownItemText: {
    fontSize: 14,
  },
  verticalScroll: {
    marginBottom: 16,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
});