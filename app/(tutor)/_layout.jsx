import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "react-native";

export default function TutorLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Define colors based on theme
  const activeColor = isDark ? "#7aa2f7" : "#2ac3de";
  const inactiveColor = isDark ? "#a9b1d6" : "#11181C";
  const backgroundColor = isDark ? "#1a1b26" : "#FFFFFF";
  const borderColor = isDark ? "#2c2e3f" : "#e0e0e0";
  
  return (
    <Tabs screenOptions={{
      tabBarStyle: {
        height: 70,
        backgroundColor: backgroundColor,
        borderTopColor: borderColor,
        borderTopWidth: 1,
      },
      tabBarActiveTintColor: activeColor,
      tabBarInactiveTintColor: inactiveColor,
      headerStyle: {
        backgroundColor: backgroundColor,
      },
      headerTintColor: isDark ? "#a9b1d6" : "#11181C",
      headerShown: false,
    }}>
      <Tabs.Screen
        name="tutor"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="modules"
        options={{
          title: "Modules",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="library" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}