import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "react-native";

export default function TabLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Define colors based on theme
  const activeColor = "#7647EB"; // primary color from your theme
  const inactiveColor = isDark ? "#a9b1d6" : "#11181C";
  const backgroundColor = isDark ? "#1a1b26" : "#FFFFFF";
  const borderColor = isDark ? "#2c2e3f" : "#e0e0e0";
  
  return (
    <Tabs screenOptions={{
      // Using inline styles for tab bar since Tabs component doesn't support className
      tabBarStyle: {
        height: 70,
        backgroundColor: backgroundColor,
        borderTopColor: borderColor,
        borderTopWidth: 1,
      },
      tabBarActiveTintColor: activeColor,
      tabBarInactiveTintColor: inactiveColor,
      // For headers we can use native styling
      headerStyle: {
        backgroundColor: backgroundColor,
      },
      headerTintColor: isDark ? "#a9b1d6" : "#11181C",
    }}>
      <Tabs.Screen
        name="student"
        options={{
          title: "Home",
          headerShown: false, // Hide the header for the student screen
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="modules"
        options={{
          title: "Modules",
          headerTitleAlign: "center",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="library" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: "Menu",
          tabBarIcon: ({ color, size }) => {
            console.log("Rendering Menu Icon");
            return <Ionicons name="menu-outline" size={size} color={color} /> // Hamburger icon
          },
        }}
      />
    </Tabs>
  );
}