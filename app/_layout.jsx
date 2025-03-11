import { Stack } from "expo-router";
import "../global.css";
import { useColorScheme } from "nativewind";

function RootLayoutNav() {
  const { colorScheme } = useColorScheme();
  
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return <RootLayoutNav />;
}