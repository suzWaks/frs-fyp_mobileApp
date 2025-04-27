import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "react-native";

export default function TutorLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Define colors based on theme
  const activeColor = "#7647EB"; // Using your specified primary color
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
      tabBarLabelStyle: {
        fontSize: 12,
        marginBottom: 8,
      },
      tabBarIconStyle: {
        marginTop: 8,
      },
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
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "home" : "home-outline"} 
              size={size} 
              color={focused ? activeColor : color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="modules"
        options={{
          title: "Modules",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "library" : "library-outline"} 
              size={size} 
              color={focused ? activeColor : color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: "Menu",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "menu" : "menu-outline"} 
              size={size} 
              color={focused ? activeColor : color} 
            />
          ),
        }}
      />
    </Tabs>
  );
}