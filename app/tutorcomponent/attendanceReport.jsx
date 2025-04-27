import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  TouchableWithoutFeedback,
  ActivityIndicator
} from "react-native";
import { useColorScheme } from "nativewind";
import { BarChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router"; 
import Svg, { Circle } from "react-native-svg";

const screenWidth = Dimensions.get("window").width;
const API_BASE_URL = "http://localhost:5253/api";

export default function AttendanceReport() {
  const { colorScheme } = useColorScheme();
  const [allModulesViewOptionsVisible, setAllModulesViewOptionsVisible] = useState(false);
  const dropdownOpacity = useRef(new Animated.Value(0)).current;
  const dropdownTranslateY = useRef(new Animated.Value(-10)).current;
  const [chartView, setChartView] = useState("month");
  const params = useLocalSearchParams();
  const class_Id = params.class_Id;
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [noAttendanceIssueCount, setNoAttendanceIssueCount] = useState(0);
  const [attendanceIssueCount, setAttendanceIssueCount] = useState(0);
  const [availableMonths, setAvailableMonths] = useState([]);
  const [monthlyPresentPercentage, setMonthlyPresentPercentage] = useState([]);

  const router = useRouter(); 

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/AttendanceRecords/class/${class_Id}`);
        const data = await response.json();
        setAttendanceData(data);
        calculateAttendanceStats(data);
        processMonthlyData(data);
      } catch (error) {
        console.error("Error fetching attendance data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, [class_Id]);

  const processMonthlyData = (records) => {
    if (!records || records.length === 0) return;
  
    // Extract unique months from the records
    const monthMap = {};
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
    records.forEach(record => {
      const date = new Date(record.date);
      const month = date.getMonth(); // 0-11
      const monthName = monthNames[month];
      
      if (!monthMap[monthName]) {
        monthMap[monthName] = {
          present: 0,
          total: 0
        };
      }
  
      record.students.forEach(student => {
        monthMap[monthName].total++;
        if (student.status === 0) { // Only count as present if status is 0
          monthMap[monthName].present++;
        }
        // Status 1 (leave) and 2 (absent) are automatically not counted as present
      });
    });
  
    // Prepare data for chart
    const months = Object.keys(monthMap);
    const percentages = months.map(month => {
      const percentage = (monthMap[month].present / monthMap[month].total) * 100;
      return Math.round(percentage);
    });
  
    console.log("Available months:", months);
    setAvailableMonths(months);
    setMonthlyPresentPercentage(percentages);
  };

  const calculateAttendanceStats = (records) => {
    if (!records || records.length === 0) {
      setNoAttendanceIssueCount(0);
      setAttendanceIssueCount(0);
      return;
    }
  
    const studentAttendanceMap = new Map();
  
    records.forEach(record => {
      record.students.forEach(student => {
        if (!studentAttendanceMap.has(student.studentId)) {
          studentAttendanceMap.set(student.studentId, {
            name: student.name,
            presentCount: 0,
            totalCount: 0,
            leaveCount: 0,
          });
        }
  
        const studentRecord = studentAttendanceMap.get(student.studentId);
  
        if (student.status === 0) {
          studentRecord.presentCount++;
          studentRecord.totalCount++;
        } else if (student.status === 1) {
          studentRecord.totalCount++;
        } else if (student.status === 2) {
          studentRecord.leaveCount++;
        }
      });
    });
  
    let noIssueCount = 0;
    let issueCount = 0;
  
    studentAttendanceMap.forEach(student => {
      const effectiveTotal = student.totalCount + student.leaveCount;
      const attendancePercentage = (student.presentCount / effectiveTotal) * 100;
  
      // Apply different threshold if the student has leave
      const threshold = student.leaveCount > 0 ? 80 : 90;
  
      if (attendancePercentage >= threshold) {
        noIssueCount++;
      } else {
        issueCount++;
      }
    });
  
    setNoAttendanceIssueCount(noIssueCount);
    setAttendanceIssueCount(issueCount);
  };
  

  const totalAttendance = noAttendanceIssueCount + attendanceIssueCount;
  const noAttendanceIssuePercentage = totalAttendance > 0 
    ? (noAttendanceIssueCount / totalAttendance) * 100 
    : 0;

  const radius = 30;
  const strokeWidth = 15;
  const circumference = 2 * Math.PI * radius;

  const chartConfig = {
    backgroundGradientFrom: colorScheme === "dark" ? "#1e293b" : "#ffffff",
    backgroundGradientTo: colorScheme === "dark" ? "#1e293b" : "#ffffff",
    color: (opacity = 1) => `rgba(${colorScheme === "dark" ? "255, 255, 255" : "0, 0, 0"}, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
  };

  // Monthly Data calculated from actual records
  const monthlyData = {
    labels: availableMonths,
    datasets: [
      {
        data: monthlyPresentPercentage,
        color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
        strokeWidth: 2,
      },
    ],
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

  if (loading) {
    return (
      <View className={`flex-1 justify-center items-center ${colorScheme === "dark" ? "bg-gray-900" : "bg-white"}`}>
        <ActivityIndicator size="large" color={colorScheme === "dark" ? "#7C3AED" : "#000"} />
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={closeDropdown}>
      <ScrollView
        className={`flex-1 p-4 ${colorScheme === "dark" ? "bg-gray-900" : "bg-white"}`}
      >
        <Text className={`text-xl font-bold mb-2 ${colorScheme === "dark" ? "text-gray-400" : "text-black"}`}>
          Report Analysis
        </Text>

        {/* Report Analysis Section */}
        <View
          className={`p-4 rounded-lg shadow-md mb-6 items-center w-full ${colorScheme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}
          style={{ paddingLeft: 10 }}
        >
          <View className="flex-row justify-between items-center">
            <View className="items-center">
              <Svg width={150} height={150} viewBox="0 0 100 100">
                <Circle
                  cx="50"
                  cy="50"
                  r={radius}
                  stroke="#E9D5FF"
                  strokeWidth={strokeWidth}
                  fill="none"
                />
                <Circle
                  cx="50"
                  cy="50"
                  r={radius}
                  stroke="#7C3AED"
                  strokeWidth={strokeWidth}
                  fill="none"
                  strokeDasharray={`${(noAttendanceIssuePercentage / 100) * circumference} ${circumference}`}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                />
              </Svg>
            </View>
            <View>
              <View className="flex-row items-center gap-x-2 mb-5">
                <Text className={`text-base ${colorScheme === "dark" ? "text-gray-400" : "text-black"}`}>No attendance Issue</Text>
                <Text className={`text-base font-semibold ${colorScheme === "dark" ? "text-gray-400" : "text-black"}`}>
                  {noAttendanceIssueCount}
                </Text>
              </View>
              <View className="flex-row items-center gap-x-2">
                <Text className={`text-base ${colorScheme === "dark" ? "text-gray-400" : "text-black"}`}>Attendance Issue</Text>
                <Text className={`text-base font-semibold ${colorScheme === "dark" ? "text-gray-400" : "text-black"}`}>
                  {attendanceIssueCount}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Students Present Percentage */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className={`text-lg font-semibold ${colorScheme === "dark" ? "text-gray-400" : "text-black"}`}>
            Present Percentage
          </Text>
          <View className="flex-row bg-primary-100 dark:bg-gray-700 rounded-[10px]">
            <TouchableOpacity
              onPress={() => setChartView("month")}
              className={`px-2 py-1 rounded-[10px] ${chartView === "month" ? "bg-primary dark:bg-purple-600" : "bg-transparent"}`}
            >
              <Text className={`${chartView === "month" ? "text-white" : "text-gray-600 dark:text-gray-300"}`}>
                Months
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Scrollable Bar Chart */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View 
            className={`p-4 rounded-lg shadow-md items-center w-full ${colorScheme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}
          >
            {availableMonths.length > 0 ? (
              <BarChart
                data={monthlyData}
                width={screenWidth * 2}
                height={200}
                yAxisSuffix="%"
                chartConfig={chartConfig}
                showValuesOnTopOfBars
                fromZero
                style={{ borderRadius: 16, alignSelf: "center" }}
              />
            ) : (
              <Text className={`text-center ${colorScheme === "dark" ? "text-gray-400" : "text-black"}`}>
                No attendance data available for any month
              </Text>
            )}
          </View>
        </ScrollView>

        <View style={{ flex: 1 }} />

        {/* Student Report Section with Dropdown */}
        <View 
          className={`p-4 rounded-[10px] shadow-md w-full mt-5 ${colorScheme === "dark" ? "bg-gray-800" : "bg-purple-100"}`}
        >
          <View className="flex-row items-center justify-between">
            <Text className={`text-lg font-bold ${colorScheme === "dark" ? "text-gray-400" : "text-black"}`}>Student Report</Text>
            <TouchableOpacity
              className="bg-primary rounded-[10px] px-6 py-3"
              onPress={toggleDropdown}
            >
              <Text className="text-white font-bold">View</Text>
            </TouchableOpacity>
          </View>

          {allModulesViewOptionsVisible && (
            <Animated.View
              className={`absolute top-[-75px] right-2 rounded-[10px] py-2 px-2 w-[150px] shadow-lg ${colorScheme === "dark" ? "bg-gray-700" : "bg-purple-100"}`}
              style={{
                opacity: dropdownOpacity,
                transform: [{ translateY: dropdownTranslateY }],
              }}
            >
              <TouchableOpacity
                className={`px-2 py-2 rounded-[10px] mb-1 ${colorScheme === "dark" ? "bg-gray-700" : "bg-purple-100"}`}
                onPress={() => {
                  router.push({
                    pathname: "/tutorcomponent/dayWise",
                    params: { class_Id: class_Id }
                  });
                  closeDropdown();
                }}
              >
                <Text className="text-black text-center">Daily</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`px-4 py-2 rounded-[10px] ${colorScheme === "dark" ? "bg-gray-700" : "bg-purple-100"}`}
                onPress={() => {
                  router.push({
                    pathname: "/tutorcomponent/monthWise",
                    params: { class_Id: class_Id }
                  });
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