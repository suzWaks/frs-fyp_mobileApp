import React, { useState, useEffect } from "react";
import { View, Text, FlatList, Image, ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity} from "react-native";
import { useColorScheme } from "nativewind";
import Svg, { Circle } from "react-native-svg";
import { Dimensions } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import Constants from "expo-constants";
import { useLocalSearchParams, useRouter } from "expo-router";

const API_BASE_URL = Constants.expoConfig.extra.API_BASE_URL;
const screenWidth = Dimensions.get("window").width;

export default function RealTimeRecord() {
  const { colorScheme } = useColorScheme();
  const params = useLocalSearchParams();
  const attendanceId = params.attendanceId;
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [studentData, setStudentData] = useState([]);

  useEffect(() => {
    fetchAttendanceData();
  }, [attendanceId]);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/AttendanceRecords/${attendanceId}`);
      
      if (!response.ok) {
        throw new Error(`Error fetching attendance data: ${response.status}`);
      }
      
      const data = await response.json();
      setAttendanceData(data);
      
      // Transform student status data for the UI
      const formattedStudents = data.studentStatuses.map(item => ({
        id: item.studentId,
        name: item.student.name,
        avatar: item.student.profile_PictureURL || "https://academy.katalon.com/wp-content/themes/skillate/images/learner-stories/default-avatar.png",
        status: item.status === 0 ? "correct" : "wrong", // 0 = present (correct), 1 = absent (wrong)
      }));
      
      setStudentData(formattedStudents);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch attendance data:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  // Calculate attendance statistics
  const correctCount = studentData.filter((item) => item.status === "correct").length;
  const totalCount = studentData.length;
  const correctPercentage = totalCount > 0 ? correctCount / totalCount : 0;
  const strokeWidth = 15;
  const radius = 35;
  const circumference = 2 * Math.PI * radius;

  const renderItem = ({ item }) => (
    <View className="flex-row items-center p-3 border-b border-gray-300">
      <Image 
        source={{ uri: item.avatar }} 
        className="w-10 h-10 rounded-full"
        defaultSource="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4BDsJLJhqjQGKtsPXfkShT0An3rZdKtgwFA&s"
      />
      <View className="ml-3 flex-1">
        <Text
          className={`text-base font-bold ${
            colorScheme === "dark" ? "text-gray-500" : "text-black"
          }`}
        >
          {item.name}
        </Text>
      </View>
      <View className={`w-8 h-8 items-center justify-center rounded-md ${
        item.status === "correct" ? "bg-green-200" : "bg-red-500"
      }`}>
        {item.status === "correct" ? (
          <Ionicons name="checkmark" size={20} color="#28a745" />
        ) : (
          <Ionicons name="close" size={20} color="#FFFFFF" />
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-red-500 text-center">Error: {error}</Text>
      </View>
    );
  }

  // Format the date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  return (
    <ScrollView
      className={`flex-1 ${
        colorScheme === "dark" ? "bg-gray-900" : "bg-white"
      }`}
      contentContainerStyle={{ padding: 16 }}
    >
      <View>
        <Text
          className={`text-2xl font-bold text-center mb-2 mt-10 ${
            colorScheme === "dark" ? "text-gray-400" : "text-black"
          }`}
        >
          {attendanceData?.class?.module_Code}
        </Text>

        {/* Attendance Ring */}
        <View className="items-center relative">
          <Svg width={150} height={150} viewBox="0 0 100 100">
            {/* Background Circle */}
            <Circle
              cx="50"
              cy="50"
              r={radius}
              stroke="#E9D5FF"
              strokeWidth={strokeWidth}
              fill="none"
            />
            {/* Progress Circle */}
            <Circle
              cx="50"
              cy="50"
              r={radius}
              stroke="#7C3AED"
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={`${
                correctPercentage * circumference
              } ${circumference}`}
              strokeLinecap="round"
            />
          </Svg>

          {/* Attendance Count Text in Center */}
          <View
            className="absolute top-1/2 left-1/2"
            style={{ transform: [{ translateX: -20 }, { translateY: -10 }] }}
          >
            <Text
              className={`text-xl font-bold ${
                colorScheme === "dark" ? "text-gray-400" : "text-black"
              }`}
            >
              {correctCount}/{totalCount}
            </Text>
          </View>
        </View>

        <Text
          className={`text-lg text-center mb-1 ${
            colorScheme === "dark" ? "text-gray-500" : "text-black"
          }`}
        >
          {attendanceData?.time_Interval}
        </Text>
        <Text
          className={`text-lg text-center mb-6 ${
            colorScheme === "dark" ? "text-gray-500" : "text-black"
          }`}
        >
          {formatDate(attendanceData?.date)}
        </Text>
        <Text
          className={`text-xl font-bold mb-4 ${
            colorScheme === "dark" ? "text-gray-400" : "text-black"
          }`}
        >
          Real Time Record
        </Text>
      </View>

      {/* List of Members */}
      <View className="border border-gray-300 rounded-lg mb-5">
        <FlatList
          data={studentData}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false} // Disable FlatList's own scrolling
          nestedScrollEnabled={true}
          contentContainerStyle={{ paddingBottom: 0 }}
        />
      </View>

      {/* Attendance Summary */}
      <View
        className={`p-4 rounded-lg mb-6 ${
          colorScheme === "dark" ? "bg-gray-800" : "bg-gray-200"
        }`}
      >
        <View className="flex-row justify-between">
          <Text
            className={`text-base ${
              colorScheme === "dark" ? "text-gray-500" : "text-black"
            }`}
          >
            Total present:
          </Text>
          <Text
            className={`text-base font-bold ${
              colorScheme === "dark" ? "text-gray-400" : "text-black"
            }`}
          >
            {correctCount} members
          </Text>
        </View>
        <View className="flex-row justify-between mt-2">
          <Text
            className={`text-base ${
              colorScheme === "dark" ? "text-gray-500" : "text-black"
            }`}
          >
            Total absent:
          </Text>
          <Text
            className={`text-base font-bold ${
              colorScheme === "dark" ? "text-gray-400" : "text-black"
            }`}
          >
            {totalCount - correctCount} members
          </Text>
        </View>
        <View style={styles.buttonContainer}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => router.replace('/(tutor)/tutor')}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center', // center the button
    paddingVertical: 20,
  },
  doneButton: {
    backgroundColor: '#7647EB',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
