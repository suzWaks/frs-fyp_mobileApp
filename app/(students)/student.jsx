import { View, Text, ImageBackground, TouchableOpacity, Image, StyleSheet } from "react-native";
import { useColorScheme } from "nativewind";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from 'expo-router';
import { fetchDepartmentRoute } from '../api/mockApi'; // Import the mock API

export default function HomeScreen() {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const router = useRouter();

  const handlePlusIconPress = async () => {
    const route = await fetchDepartmentRoute('student'); // Fetch the route for the student
    router.push(route);
  };

  const handleProfileIconPress = () => {
    router.push('/profile/profile'); // Navigate to the profile screen
  };

  return (
    <ImageBackground 
      source={require("../../assets/images/emptybox.png")} // Ensure the path is correct
      style={styles.backgroundImage}
      resizeMode="cover" // Try "contain", "stretch", or "center" if needed
    >
      {/* Header Section */}
      <View style={[styles.header, { backgroundColor: colorScheme === "dark" ? "#1a1b26" : "#fff" }]}>
        <TouchableOpacity onPress={handleProfileIconPress} style={styles.profileSection}>
          <Ionicons name="person-circle-outline" size={40} color={colorScheme === "dark" ? "white" : "black"} />
          <Text style={[styles.profileText, { color: colorScheme === "dark" ? "white" : "black" }]}>
            Hello, Suzal
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
      <View style={[styles.mainContent, { backgroundColor: colorScheme === "dark" ? "#1a1b26" : "#fff" }]}>
        <View style={styles.imageContainer}>
          <Image 
            source={require("../../assets/images/emptybox.png")} 
            style={styles.image}
          />
        </View>
        <Text style={[styles.welcomeText, { color: colorScheme === "dark" ? "white" : "black" }]}>
          You have nothing here yet
        </Text>
        <Text style={[styles.subText, { color: colorScheme === "dark" ? "gray" : "black" }]}>
          Enroll in a module
        </Text>
      </View>

      {/* Floating Plus Icon */}
      <TouchableOpacity
        onPress={handlePlusIconPress}
        style={styles.floatingButton}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%", 
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
  mainContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    width: 150, // Set the desired width
    height: 150, // Set the desired height
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subText: {
    fontSize: 16,
  },
  floatingButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#6c33ff",
    padding: 15,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },
});
