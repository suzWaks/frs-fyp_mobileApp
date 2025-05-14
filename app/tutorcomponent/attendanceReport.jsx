import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  TouchableWithoutFeedback,
  ActivityIndicator,
  FlatList,
  Alert
} from "react-native";
import Constants from "expo-constants";
import { useColorScheme } from "nativewind";
import { BarChart, PieChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const screenWidth = Dimensions.get("window").width;
const API_BASE_URL = Constants.expoConfig.extra.API_BASE_URL;

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
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [pieData, setPieData] = useState([]);
  const [monthlyAttendanceStatus, setMonthlyAttendanceStatus] = useState({});
  const [monthDropdownVisible, setMonthDropdownVisible] = useState(false);
  const monthDropdownOpacity = useRef(new Animated.Value(0)).current;
  const monthDropdownTranslateY = useRef(new Animated.Value(-10)).current;

  const router = useRouter();

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const shortMonthNames = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"];

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

    const monthMap = {};
    const statusMap = {};
    const monthsWithData = new Set();

    monthNames.forEach(month => {
      monthMap[month] = {
        present: 0,
        total: 0
      };
      
      statusMap[month] = {
        present: 0,
        absent: 0,
        leave: 0,
        total: 0
      };
    });

    records.forEach(record => {
      const date = new Date(record.date);
      const month = date.getMonth();
      const monthName = monthNames[month];
      monthsWithData.add(monthName);
      
      record.students.forEach(student => {
        monthMap[monthName].total++;
        statusMap[monthName].total++;
        
        if (student.status === 0) {
          monthMap[monthName].present++;
          statusMap[monthName].present++;
        } else if (student.status === 1) {
          statusMap[monthName].absent++;
        } else if (student.status === 2) {
          statusMap[monthName].leave++;
        }
      });
    });

    const months = Array.from(monthsWithData);
    const percentages = monthNames.map(month => {
      if (monthMap[month].total > 0) {
        const percentage = (monthMap[month].present / monthMap[month].total) * 100;
        return Math.round(percentage);
      }
      return 0;
    });

    setMonthlyAttendanceStatus(statusMap);
    const firstAvailableMonth = months.length > 0 ? monthNames.indexOf(months[0]) : new Date().getMonth();
    setSelectedMonth(firstAvailableMonth);
    updatePieData(statusMap[monthNames[firstAvailableMonth]]);
    setAvailableMonths(months);
    setMonthlyPresentPercentage(percentages);
  };
  
  const updatePieData = (monthData) => {
    if (!monthData || monthData.total === 0) {
      setPieData([
        { 
          name: 'Present (0%)', 
          population: 0, 
          color: '#4CAF50', 
          legendFontColor: colorScheme === "dark" ? "#ffffff" : "#000000", 
          legendFontSize: 12 
        },
        { 
          name: 'Absent (0%)', 
          population: 0, 
          color: '#F44336', 
          legendFontColor: colorScheme === "dark" ? "#ffffff" : "#000000", 
          legendFontSize: 12 
        },
        { 
          name: 'Leave (0%)', 
          population: 0, 
          color: '#FFC107', 
          legendFontColor: colorScheme === "dark" ? "#ffffff" : "#000000", 
          legendFontSize: 12 
        }
      ]);
      return;
    }
    
    const presentPercentage = (monthData.present / monthData.total) * 100;
    const absentPercentage = (monthData.absent / monthData.total) * 100;
    const leavePercentage = (monthData.leave / monthData.total) * 100;
    
    setPieData([
      { 
        name: `% Present`, 
        population: Math.round(presentPercentage), 
        color: '#28db71', 
        legendFontColor: colorScheme === "dark" ? "#ffffff" : "#000000", 
        legendFontSize: 12 
      },
      { 
        name: `% Absent`, 
        population: Math.round(absentPercentage), 
        color: '#ff6565', 
        legendFontColor: colorScheme === "dark" ? "#ffffff" : "#000000", 
        legendFontSize: 12 
      },
      { 
        name: `% Leave`, 
        population: Math.round(leavePercentage), 
        color: '#3290ff', 
        legendFontColor: colorScheme === "dark" ? "#ffffff" : "#000000", 
        legendFontSize: 12 
      }
    ]);
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

  const toggleMonthDropdown = () => {
    setMonthDropdownVisible(!monthDropdownVisible);
  };

  const selectMonth = (monthIndex) => {
    setSelectedMonth(monthIndex);
    updatePieData(monthlyAttendanceStatus[monthNames[monthIndex]]);
    setMonthDropdownVisible(false);
  };

  const totalAttendance = noAttendanceIssueCount + attendanceIssueCount;
  const noAttendanceIssuePercentage = totalAttendance > 0
    ? (noAttendanceIssueCount / totalAttendance) * 100
    : 0;

  const chartConfig = {
    backgroundGradientFrom: colorScheme === "dark" ? "#1e293b" : "#ffffff",
    backgroundGradientTo: colorScheme === "dark" ? "#1e293b" : "#ffffff",
    color: (opacity = 1) => `rgba(${colorScheme === "dark" ? "255, 255, 255" : "0, 0, 0"}, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
  };

  const monthlyData = {
    labels: shortMonthNames,
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
    
    if (monthDropdownVisible) {
      setMonthDropdownVisible(false);
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
    <View className={`flex-1 ${colorScheme === "dark" ? "bg-gray-900" : "bg-white"}`}>
      {/* Header with title and month dropdown */}
      <View className={`px-4 pt-4 ${colorScheme === "dark" ? "bg-gray-800" : "bg-white"}`}>
        <View className="flex-row items-center justify-between">
          <Text className={`text-lg font-semibold ${colorScheme === "dark" ? "text-gray-400" : "text-black"}`}>
            Attendance Distribution
          </Text>

          <View className="relative flex-1 ml-4">
            <TouchableOpacity
              className={`flex-row items-center justify-between border rounded-[10px] p-2 ${
                colorScheme === "dark" ? "border-gray-300" : "border-gray-300"
              }`}
              onPress={toggleMonthDropdown}
            >
              <Text
                style={{ color: colorScheme === "dark" ? "#D1D5DB" : "#000" }}
              >
                {monthNames[selectedMonth] || "Select Month"}
              </Text>
              <Ionicons
                name={monthDropdownVisible ? "chevron-up" : "chevron-down"}
                size={16}
                color={colorScheme === "dark" ? "#D1D5DB" : "#000"}
                className="ml-2"
              />
            </TouchableOpacity>
            {monthDropdownVisible && (
              <View
                className={`absolute top-12 left-0 right-0 border border-gray-200 rounded-[10px] ${
                  colorScheme === "dark" ? "bg-gray-700" : "bg-white"
                } max-h-48 z-10 shadow-md`}
              >
                <FlatList
                  data={availableMonths}
                  keyExtractor={(item) => item}
                  className="rounded-[10px] overflow-hidden"
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      className={`p-3 border-b ${
                        colorScheme === "dark"
                          ? "border-gray-500"
                          : "border-gray-200"
                      }`}
                      onPress={() => selectMonth(monthNames.indexOf(item))}
                    >
                      <Text
                        style={{
                          color: colorScheme === "dark" ? "#D1D5DB" : "#000",
                        }}
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Scrollable content */}
      <TouchableWithoutFeedback onPress={closeDropdown}>
        <ScrollView className="flex-1 px-4 py-2">
          {/* Pie Chart */}
          <View 
            className={`px-4 rounded-lg shadow-md items-center mb-6 ${colorScheme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}
          >
            <View style={{ height: 220, width: '100%', alignItems: 'center' }}>
              {pieData.length > 0 && (
                <PieChart
                  data={pieData}
                  width={screenWidth * 0.85}
                  height={200}
                  chartConfig={chartConfig}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  absolute
                />
              )}
            </View>
          </View>

          {/* Monthly Bar Chart */}
          <View className="flex-row justify-between items-center mb-2">
            <Text className={`text-lg font-semibold ${colorScheme === "dark" ? "text-gray-400" : "text-black"}`}>
              Monthly Present Percentage
            </Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View 
              className={`p-4 rounded-lg shadow-md items-center w-full ${colorScheme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}
            >
              <BarChart
                data={monthlyData}
                width={screenWidth * 1.5}
                height={220}
                yAxisSuffix="%"
                chartConfig={chartConfig}
                showValuesOnTopOfBars
                fromZero
                style={{ borderRadius: 16, alignSelf: "center" }}
              />
            </View>
          </ScrollView>

          <View style={{ flex: 1 }} />

          {/* Detailed Reports */}
          <View 
            className={`p-4 rounded-[10px] shadow-md w-full mt-5 ${colorScheme === "dark" ? "bg-gray-800" : "bg-purple-100"}`}
          >
            <View className="flex-row items-center justify-between">
              <Text className={`text-lg font-bold ${colorScheme === "dark" ? "text-gray-400" : "text-black"}`}>Detailed Reports</Text>
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
                  <Text className="text-black text-center">Daily Report</Text>
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
                  <Text className="text-black text-center">Monthly Report</Text>
                </TouchableOpacity>
              </Animated.View>
            )}
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </View>
  );
}