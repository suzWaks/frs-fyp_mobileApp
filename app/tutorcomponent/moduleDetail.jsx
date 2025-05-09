import React, { useEffect, useState, useRef } from "react";
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
import { useRouter } from "expo-router";
import { useLocalSearchParams } from "expo-router";
import Constants from "expo-constants";

const screenWidth = Dimensions.get("window").width;

export default function ModuleDetails() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const [allModulesViewOptionsVisible, setAllModulesViewOptionsVisible] =
    useState(false);
  const [chartView, setChartView] = useState("month");
  const dropdownOpacity = useRef(new Animated.Value(0)).current;
  const dropdownTranslateY = useRef(new Animated.Value(-10)).current;
  const { class_Id } = useLocalSearchParams();
  const [enrollKey, setEnrollKey] = useState("");
  const [moduleCode, setModuleCode] = useState("");
  const API_BASE_URL = Constants.expoConfig.extra.API_BASE_URL;

  useEffect(() => {
    const fetchEnrollmentKey = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/Classes/${class_Id}`
        );
        const data = await response.json();
        setEnrollKey(data.enrollKey);
        setModuleCode(data.module_Code);
      } catch (error) {
        console.error("Error fetching enrollment key:", error);
      }
    };
    if (class_Id) {
      fetchEnrollmentKey();
    }
  }, [class_Id]);

  const handleViewPress = () => {
    router.push("/tutorcomponent/classReport");
  };

  const handleUpdateEnrollKey = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/Classes/${class_Id}`
      );
      if (!response.ok) throw new Error("Failed to fetch class data");

      const currentData = await response.json();

      const updatedClass = {
        class_Id: currentData.class_Id,
        class_Name: currentData.class_Name,
        module_Code: currentData.module_Code,
        enrollKey: enrollKey,
        yearLevel: currentData.yearLevel,
      };

      const updateResponse = await fetch(
        `${API_BASE_URL}/Classes/${class_Id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedClass),
        }
      );

      const responseText = await updateResponse.text();
      let result = null;
      if (responseText) {
        result = JSON.parse(responseText);
      }

      if (updateResponse.ok) {
        console.log("Enrollment key updated successfully:", result);
      } else {
        //console.error("Failed to update enrollment key:", result?.message || updateResponse.statusText);
      }
    } catch (error) {
      console.error("Error updating enrollment key:", error);
    }
  };

  const attendanceData = {
    labels: [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ],
    datasets: [
      {
        data: [100, 90, 80, 70, 60, 50, 85, 95, 75, 65, 55, 45],
        color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  const weeklyData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        data: [75, 60, 80, 70],
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
      legendFontSize: 14,
    },
    {
      name: "Class Not Taken",
      population: 3,
      color: "#c084fc",
      legendFontColor: "#7F7F7F",
      legendFontSize: 14,
    },
  ];

  const chartConfig = {
    backgroundGradientFrom: colorScheme === "dark" ? "#1e293b" : "#ffffff",
    backgroundGradientTo: colorScheme === "dark" ? "#1e293b" : "#ffffff",
    color: (opacity = 1) =>
      `rgba(${colorScheme === "dark" ? "255, 255, 255" : "0, 0, 0"}, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
  };

  const toggleDropdown = () => {
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
    } else {
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
        className={`flex-1 p-4 ${colorScheme === "dark" ? "bg-gray-900" : "bg-white"}`}
      >
        <View className="items-center mb-3">
          <Text
            className={`text-xl font-bold mb-2 ${
              colorScheme === "dark" ? "text-gray-400" : "text-black"
            }`}
          >
            {moduleCode || "Loading..."}
          </Text>
        </View>

        <View className="flex-row items-center mb-4 space-x-4">
          <TextInput
            className={`flex-1 border ${
              colorScheme === "dark" ? "border-gray-600" : "border-gray-300"
            } rounded-[10px] p-2 text-lg`}
            value={enrollKey}
            onChangeText={(text) => setEnrollKey(text)}
            editable={true}
            placeholderTextColor={colorScheme === "dark" ? "#D1D5DB" : "#6B7280"}
          />
          <TouchableOpacity
            className="bg-primary rounded-[10px] p-3"
            onPress={handleUpdateEnrollKey}
          >
            <Text className="text-white font-bold">Update</Text>
          </TouchableOpacity>
        </View>

        <View className="items-center">
          <Text
            className={`text-lg font-semibold text-center mb-2 ${
              colorScheme === "dark" ? "text-gray-400" : "text-black"
            }`}
          >
            Report Analysis
          </Text>
          <PieChart
            data={pieChartData}
            width={screenWidth - 30}
            height={140}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor={colorScheme === "dark" ? "#2D3748" : "#e1d5f7"}
            absolute
            format={(value) => `${value}%`}
            style={{
              borderRadius: 10,
              marginBottom: 15,
            }}
          />
        </View>

        <View className="flex-row justify-between items-center mb-4">
          <Text
            className={`text-lg font-semibold ${
              colorScheme === "dark" ? "text-gray-400" : "text-black"
            }`}
          >
            Class Taken
          </Text>
          <View className="flex-row bg-primary-100 dark:bg-gray-70 rounded-[10px]">
            <TouchableOpacity
              onPress={() => setChartView("month")}
              className="px-2 py-1 rounded-[10px] bg-primary dark:bg-purple-600"
            >
              <Text className="text-white">
                Months
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View
            className={`p-4 rounded-lg shadow-md items-center w-full ${
              colorScheme === "dark" ? "bg-gray-800" : "bg-gray-100"
            }`}
          >
            <BarChart
              data={attendanceData}
              width={screenWidth * 2}
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

        <View
          className={`p-4 rounded-[10px] shadow-md w-full mt-5 ${
            colorScheme === "dark" ? "bg-gray-800" : "bg-purple-100"
          }`}
        >
          <View className="flex-row items-center justify-between">
            <Text
              className={`text-lg font-bold ${
                colorScheme === "dark" ? "text-gray-400" : "text-black"
              }`}
            >
              Detail Report
            </Text>
            <TouchableOpacity
              className="bg-primary rounded-[10px] px-6 py-3"
              onPress={toggleDropdown}
            >
              <Text className="text-white font-bold" onPress={handleViewPress}>
                View
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}
