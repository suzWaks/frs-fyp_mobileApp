// home.jsx - with standard Tailwind classes
import { View, Text, ScrollView, Switch } from "react-native";
import { useColorScheme } from "nativewind";

export default function HomeScreen() {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  
  return (
    <View className={`flex-1 ${colorScheme === "dark" ? "bg-gray-900" : "bg-white"} justify-center items-center`}>
      <Text
        className={`text-lg font-bold ${colorScheme === "dark" ? "text-white" : "text-black"}`}
        onPress={() => toggleColorScheme(colorScheme === "light" ? "dark" : "light")}
      >
        {`The color scheme is ${colorScheme}, \n Press to toggle`}
      </Text>
    </View>
  );
}