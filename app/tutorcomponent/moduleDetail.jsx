import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  TouchableWithoutFeedback,
  TextInput,
} from "react-native";
import { useColorScheme } from "nativewind";
import { BarChart, PieChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";

const screenWidth = Dimensions.get("window").width;

export default function ModuleDetails() {
  const { colorScheme } = useColorScheme();
  const [allModulesViewOptionsVisible, setAllModulesViewOptionsVisible] =
    useState(false);
  const dropdownOpacity = useRef(new Animated.Value(0)).current;
  const dropdownTranslateY = useRef(new Animated.Value(-10)).current;

  const attendanceData = {
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    datasets: [
      {
        data: [100, 90, 80, 70, 60, 50, 85, 95, 75, 65, 55, 45],
        color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  const pieChartData = [
    {
      population: 97,
      name: "Class Taken",
      color: "#d8b4fe",
      legendFontColor: "#7F7F7F",
      legendFontSize: 15,
    },
    {
      name: "Class Not Taken",
      population: 3,
      color: "#c084fc",
      legendFontColor: "#7F7F7F",
      legendFontSize: 15,
    },
  ];

  // Chart configuration
  const chartConfig = {
    backgroundGradientFrom: colorScheme === "dark" ? "#1e293b" : "#ffffff",
    backgroundGradientTo: colorScheme === "dark" ? "#1e293b" : "#ffffff",
    color: (opacity = 1) =>
      `rgba(${
        colorScheme === "dark" ? "255, 255, 255" : "0, 0, 0"
      }, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
  };

  const toggleDropdown = () => {
    if (allModulesViewOptionsVisible) {
      // Hide dropdown
      Animated.parallel([
        Animated.timing(dropdownOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(dropdownTranslateY, {
          toValue: -10,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => setAllModulesViewOptionsVisible(false));
    } else {
      // Show dropdown
      setAllModulesViewOptionsVisible(true);
      Animated.parallel([
        Animated.timing(dropdownOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(dropdownTranslateY, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const closeDropdown = () => {
    if (allModulesViewOptionsVisible) {
      Animated.parallel([
        Animated.timing(dropdownOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(dropdownTranslateY, {
          toValue: -10,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => setAllModulesViewOptionsVisible(false));
    }
  };

  return (
    <TouchableWithoutFeedback onPress={closeDropdown}>
      <ScrollView
        className={
          "flex-1 p-4 " + (colorScheme === "dark" ? "bg-gray-900" : "bg-white")
        }
      >
        <Text className="text-xl font-bold mb-2">CTE411</Text>

        <View className="flex-row items-center mb-4 space-x-4">
          <TextInput
            className="flex-1 border border-gray-300 rounded-[10px] p-2 text-lg"
            placeholder="Enter Enrollment Key"
          />
          <TouchableOpacity
            className="bg-primary rounded-[10px] p-3"
            onPress={() => console.log("Update pressed")}
          >
            <Text className="text-white font-bold">Update</Text>
          </TouchableOpacity>
        </View>

        <View
          className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6 items-center w-full"
          style={{ paddingLeft: 10 }}
        >
          <Text className="text-lg font-semibold text-center mb-2">
            Report Analysis
          </Text>
          <PieChart
            data={pieChartData}
            width={screenWidth * 0.8}
            height={140}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            absolute
            format={(value) => `${value}%`}
            style={{
              borderRadius: 10,
              alignSelf: "flex-start",
              marginBottom: 3,
            }}
          />
        </View>

        <Text className="text-lg font-semibold mb-4">
        Class Taken Percentage
        </Text>

        {/* Scrollable Bar Chart */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md items-center w-full">
            <BarChart
              data={attendanceData}
              width={screenWidth * 2} // Make it scrollable
              height={200}
              yAxisSuffix="%"
              chartConfig={chartConfig}
              showValuesOnTopOfBars
              fromZero
              style={{ borderRadius: 16, alignSelf: "center" }}
            />
          </View>
        </ScrollView>

        <View style={{ flex: 1 }} />

        {/* Student Report Section with Dropdown */}
        <View className="bg-purple-100 dark:bg-purple-900 p-4 rounded-lg shadow-md w-full mt-16">
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-bold">Detail Report</Text>
            <TouchableOpacity
              className="bg-purple-600 dark:bg-purple-500 rounded-lg px-6 py-3"
              onPress={toggleDropdown}
            >
              <Text className="text-white font-bold" onPress={() => {
                  alert("Attendance Report clicked");
                }}>View</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}
