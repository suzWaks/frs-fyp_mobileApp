import { Stack } from "expo-router";
import "../global.css";
import { useColorScheme } from "nativewind";

function RootLayoutNav() {
  const { colorScheme } = useColorScheme();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Auth Group (Signin, Signup screens) */}
      <Stack.Screen 
        name="(auth)" 
        options={{ 
          headerShown: false,
          // Prevent going back after logout
          gestureEnabled: false 
        }} 
      />

      {/* App Group (Protected screens including tabs) */}
      <Stack.Screen 
        name="(tabs)" 
        options={{ 
          headerShown: false,
          // Prevent going back to auth screens
          gestureEnabled: false 
        }} 
      />
    </Stack>
  );
}

export default function RootLayout() {
  return <RootLayoutNav />;
}