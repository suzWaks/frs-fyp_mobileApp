import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated, TouchableWithoutFeedback } from 'react-native';
import { useColorScheme } from 'nativewind';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { useRouter } from 'expo-router'; // Import useRouter

const screenWidth = Dimensions.get('window').width;

export default function AttendanceReport() {
  const { colorScheme } = useColorScheme();
  const [allModulesViewOptionsVisible, setAllModulesViewOptionsVisible] = useState(false);
  const dropdownOpacity = useRef(new Animated.Value(0)).current;
  const dropdownTranslateY = useRef(new Animated.Value(-10)).current;

  const router = useRouter(); // Use useRouter to get the router object

  const attendanceData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        data: [100, 90, 80, 70, 60, 50, 85, 95, 75, 65, 55, 45],
        color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  const pieChartData = [
    { population: 36, name: 'No Attendance Issue', color: '#d8b4fe', legendFontColor: '#7F7F7F', legendFontSize: 15 },
    { name: 'Attendance Issue', population: 5, color: '#c084fc', legendFontColor: '#7F7F7F', legendFontSize: 15 },
  ];

  const chartConfig = {
    backgroundGradientFrom: colorScheme === 'dark' ? '#1e293b' : '#ffffff',
    backgroundGradientTo: colorScheme === 'dark' ? '#1e293b' : '#ffffff',
    color: (opacity = 1) => `rgba(${colorScheme === 'dark' ? '255, 255, 255' : '0, 0, 0'}, ${opacity})`,
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
      <ScrollView className={"flex-1 p-4 " + (colorScheme === "dark" ? "bg-gray-900" : "bg-white")}>
        <Text className="text-xl font-bold mb-2">Report Analysis</Text>

        <View className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6 items-center w-full" style={{ paddingLeft: 10 }}>
          <Text className="text-lg font-semibold text-center mb-2">Report Analysis</Text>
          <PieChart
            data={pieChartData}
            width={screenWidth * 0.8}
            height={140}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            absolute
            style={{ borderRadius: 10, alignSelf: 'flex-start', marginBottom: 3 }}
          />
        </View>

        <Text className="text-lg font-semibold mb-4">Students Present Percentage</Text>

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
              style={{ borderRadius: 16, alignSelf: 'center' }}
            />
          </View>
        </ScrollView>

        <View style={{ flex: 1 }} />

        {/* Student Report Section with Dropdown */}
        <View className="bg-purple-100 dark:bg-purple-900 p-4 rounded-lg shadow-md w-full mt-16">
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-bold">Student Report</Text>
            <TouchableOpacity
              className="bg-purple-600 dark:bg-purple-500 rounded-lg px-6 py-3"
              onPress={toggleDropdown}
            >
              <Text className="text-white font-bold">View</Text>
            </TouchableOpacity>
          </View>

          {/* Dropdown Menu */}
          {allModulesViewOptionsVisible && (
            <Animated.View
              className="absolute top-14 right-2 bg-purple-100 rounded-[10px] py-2 px-2 w-[150px] shadow-lg"
              style={{
                opacity: dropdownOpacity,
                transform: [{ translateY: dropdownTranslateY }],
              }}
            >
              <TouchableOpacity
                className="bg-purple-100 px-2 py-2 rounded-[10px] mb-1"
                onPress={() => {
                  router.push('/tutorcomponent/dayWise'); // Navigate to DayWiseReport screen
                  closeDropdown();
                }}
              >
                <Text className="text-black text-center">Daily</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-purple-100 px-4 py-2 rounded-[10px]"
                onPress={() => {
                  router.push('/tutorcomponent/monthWise'); // Navigate to MonthWiseReport screen
                  closeDropdown();
                }}
              >
                <Text className="text-black text-center">Monthly</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}