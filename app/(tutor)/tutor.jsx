import { View, Text, ScrollView, TouchableOpacity, Image, Animated, TouchableWithoutFeedback, StyleSheet } from "react-native";
import { useColorScheme } from "nativewind";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router"; // Add this import
import AttendanceDialog from "../tutorcomponent/attendanceDialog"; // Import the dialog component

export default function HeaderScreen() {
  const router = useRouter(); // Add this
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const [modalVisible, setModalVisible] = useState(false);

  // Separate state for recent and all modules dropdown visibility
  const [recentViewOptionsVisible, setRecentViewOptionsVisible] = useState(null);
  const [allModulesViewOptionsVisible, setAllModulesViewOptionsVisible] = useState(null);

  const [dropdownAnimation] = useState(new Animated.Value(0)); // For dropdown animation

  const toggleDropdown = (index, type) => {
    const setDropdownVisible = type === 'recent' ? setRecentViewOptionsVisible : setAllModulesViewOptionsVisible;
    const currentState = type === 'recent' ? recentViewOptionsVisible : allModulesViewOptionsVisible;

    if (currentState === index) {
      // Close the dropdown if it's already open
      Animated.timing(dropdownAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setDropdownVisible(null));
    } else {
      // Open the dropdown
      setDropdownVisible(index);
      Animated.timing(dropdownAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  // Interpolating the dropdown animation to scale and fade in/out
  const dropdownOpacity = dropdownAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1], // Fade effect
  });

  const dropdownTranslateY = dropdownAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-10, 0], // Slide effect
  });

  // Function to close dropdown when clicking outside
  const handleOutsideClick = () => {
    setRecentViewOptionsVisible(null);
    setAllModulesViewOptionsVisible(null);
  };

  const handleViewPress = (moduleCode, viewType) => {
    const route = viewType === 'attendance' ? '/tutorcomponent/attendanceReport' : '/tutorcomponent/moduleDetail';
    router.push({
      pathname: route,
      params: { moduleCode: moduleCode }
    });
  };

  const handleProfileIconPress = () => {
    router.push('/profile/profile'); // Navigate to the profile screen
  };

  return (
    <TouchableWithoutFeedback onPress={handleOutsideClick}>
      <View style={[styles.container, { backgroundColor: colorScheme === "dark" ? "#1a1b26" : "#fff" }]}>
        {/* Attendance Dialog */}
        <AttendanceDialog
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
        />

        {/* Header Section */}
        <View style={[styles.header, { backgroundColor: colorScheme === "dark" ? "#1a1b26" : "#fff" }]}>
          <TouchableOpacity onPress={handleProfileIconPress} style={styles.profileSection}>
            <Ionicons name="person-circle-outline" size={40} color={colorScheme === "dark" ? "white" : "black"} />
            <Text style={[styles.profileText, { color: colorScheme === "dark" ? "white" : "black" }]}>
              Hello, Ms. Dechen
            </Text>
          </TouchableOpacity>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={() => alert("Notifications pressed")} style={styles.notificationIcon}>
              <Ionicons
                name="notifications-outline"
                size={24}
                color={colorScheme === "dark" ? "white" : "black"}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => toggleColorScheme(colorScheme === "light" ? "dark" : "light")}>
              <Ionicons 
                name={colorScheme === "dark" ? "sunny-outline" : "moon-outline"} 
                size={24} 
                color={colorScheme === "dark" ? "white" : "black"} 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Content */}
        <View className="flex-1 p-4">
          {/* Recent Modules */}
          <Text className="text-md font-semibold mb-2">Recent</Text>
          <View className="bg-blue-100 p-2 shadow-xl rounded-[10px] mb-4">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-1"
            >
              {[{ code: "CTE411", name: "Artificial Intelligence" }, { code: "DIS404", name: "Management Information System" }, { code: "MAT402", name: "Optimization Techniques" }].map(
                (module, index) => (
                  <View
                    key={index}
                    className="bg-white pb-4 shadow-xl rounded-[10px] mr-3 w-80"
                  >
                    <View className="bg-purple-200 p-4 rounded-t-[10px] shadow-lg">
                      <View className="flex-row items-center justify-between">
                        <View>
                          <Text className="text-lg font-semibold">{module.code}</Text>
                          <Text className="text-sm">{module.name}</Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => toggleDropdown(index, 'recent')} // Toggle recent dropdown visibility
                        >
                          <Text className="bg-primary text-white px-4 py-2 rounded-[10px]">
                            View
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Take Attendance Button */}
                    <View className="flex-row justify-end mt-4">
                      <TouchableOpacity
                        onPress={() => setModalVisible(true)}
                        className="bg-primary px-4 py-2 rounded-[10px] w-36 mr-4"
                      >
                        <Text className="text-white text-center">Take Attendance</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Dropdown Options for Recent */}
                    {recentViewOptionsVisible === index && (
                      <Animated.View
                      className="absolute top-14 right-2 bg-purple-100 rounded-[10px] py-2 px-2 w-[150px] shadow-lg"
                      style={{
                        opacity: dropdownOpacity,
                        transform: [{ translateY: dropdownTranslateY }],
                      }}
                      >
                        <TouchableOpacity
                          className="bg-purple-100 px-2 py-2 rounded-[10px] mb-1"
                          onPress={() => handleViewPress(module.code, 'attendance')} // Updated this line
                        >
                          <Text className="text-black text-center">Attendance Report</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          className="bg-purple-100 px-4 py-2 rounded-[10px]"
                          onPress={() => handleViewPress(module.code, 'moduleDetail')} // Updated this line
                        >
                          <Text className="text-black text-center">Module Detail</Text>
                        </TouchableOpacity>
                      </Animated.View>
                    )}
                  </View>
                )
              )}
            </ScrollView>
          </View>

          {/* All Modules */}
          <Text className="text-md font-semibold mb-2">All Modules</Text>
          <ScrollView>
            {[{ code: "CTE411", name: "Artificial Intelligence" }, { code: "DIS404", name: "Management Information System" }, { code: "MAT402", name: "Optimization Techniques" }].map(
              (module, index) => (
                <View
                  key={index}
                  className="bg-white pb-4 shadow-xl rounded-[10px] mb-3 w-full"
                >
                  <View className="bg-purple-200 p-4 rounded-t-[10px] shadow-lg">
                    <View className="flex-row items-center justify-between">
                      <View>
                        <Text className="text-lg font-semibold">{module.code}</Text>
                        <Text className="text-sm">{module.name}</Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => toggleDropdown(index, 'allModules')} // Toggle all modules dropdown visibility
                      >
                        <Text className="bg-primary text-white px-4 py-2 rounded-[10px]">
                          View
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Take Attendance Button */}
                  <View className="flex-row justify-end mt-4">
                    <TouchableOpacity
                      onPress={() => setModalVisible(true)}
                      className="bg-primary px-4 py-2 rounded-[10px] w-36 mr-4"
                    >
                      <Text className="text-white text-center">Take Attendance</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Dropdown Options for All Modules */}
                  {allModulesViewOptionsVisible === index && (
                    <Animated.View
                    className="absolute top-14 right-2 bg-purple-100 rounded-[10px] py-2 px-2 w-[150px] shadow-lg"
                    style={{
                      opacity: dropdownOpacity,
                      transform: [{ translateY: dropdownTranslateY }],
                    }}
                    >
                      <TouchableOpacity
                        className="bg-purple-100 px-2 py-2 rounded-[10px] mb-1"
                        onPress={() => handleViewPress(module.code, 'attendance')} // Updated this line
                      >
                        <Text className="text-black text-center">Attendance Report</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="bg-purple-100 px-4 py-2 rounded-[10px]"
                        onPress={() => handleViewPress(module.code, 'moduleDetail')} // Updated this line
                      >
                        <Text className="text-black text-center">Module Detail</Text>
                      </TouchableOpacity>
                    </Animated.View>
                  )}
                </View>
              )
            )}
          </ScrollView>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
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
});