//RealTimeRecord.jsx
import React, { useState, useEffect, useRef } from "react";
import * as signalR from '@microsoft/signalr';
import { 
  View, 
  Text,  
  TouchableOpacity, 
  FlatList, 
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  StatusBar
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { useRouter, useLocalSearchParams } from "expo-router";
import Constants from "expo-constants";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const API_BASE_URL = Constants.expoConfig.extra.API_BASE_URL;

const RealTimeRecord = () => {
  const { colorScheme } = useColorScheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  
  // State for attendance session data
  const [attendanceSession, setAttendanceSession] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0); 
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [marked, setMarked] = useState({});
  const timerRef = useRef(null);
  const [classDetails, setClassDetails] = useState(null);
  const [connection, setConnection] = useState(null);
  const [realTimeMarked, setRealTimeMarked] = useState({});

useEffect(() => {
    if (!attendanceSession?.attendanceId) return;

    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${API_BASE_URL}/attendanceHub`)
      .withAutomaticReconnect()
      .build();

    // Handle initial attendance status
    newConnection.on("InitialAttendanceStatus", (initialStatus) => {
      const initialStatusMap = initialStatus.reduce((acc, status) => {
        acc[status.studentId] = status.status;
        return acc;
      }, {});
      setRealTimeMarked(initialStatusMap);
    });

    // Handle real-time updates
    newConnection.on("StudentAttendanceUpdated", (update) => {
      setRealTimeMarked(prev => ({
        ...prev,
        [update.studentId]: update.status
      }));
    });

    // Handle errors
    newConnection.on("AttendanceError", (errorMessage) => {
      Alert.alert("Attendance Error", errorMessage);
    });

    // Start connection and join attendance session group
    newConnection.start()
      .then(() => {
        newConnection.invoke("JoinAttendanceSession", attendanceSession.attendanceId);
        setConnection(newConnection);
      })
      .catch(error => {
        console.error("SignalR connection error:", error);
      });

    // Cleanup on unmount
    return () => {
      if (newConnection) {
        newConnection.invoke("LeaveAttendanceSession", attendanceSession.attendanceId);
        newConnection.stop();
      }
    };
  }, [attendanceSession?.attendanceId]);

  // Try to parse attendance data from params
  useEffect(() => {
    const parseAttendanceData = () => {
      try {
        if (params.attendanceData) {
          const sessionData = JSON.parse(params.attendanceData);
          setAttendanceSession(sessionData);
          
          // Calculate initial time left
          const expiryTime = new Date(sessionData.expiryTime).getTime();
          const now = new Date().getTime();
          const timeLeftMs = Math.max(0, expiryTime - now);
          setTimeLeft(Math.floor(timeLeftMs / 1000));
        } else {
          console.log("No attendance data found in params");
          Alert.alert(
            "Warning", 
            "No attendance session data found. Some features may not work correctly.",
            [{ text: "OK" }]
          );
        }
      } catch (error) {
        console.error("Error parsing attendance data:", error);
      }
    };

    parseAttendanceData();
  }, [params.attendanceData]);

  // Setup countdown timer
  useEffect(() => {
    let timer = null;
    
    if (timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [timeLeft]);

  // Format remaining time as MM:SS
  const formatTimeLeft = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Helper function to get dummy students (used when API fails)
  const getDummyStudents = () => {
    return [
      { student_Id: 1, name: "John Doe", matriculation_Number: "A12345" },
      { student_Id: 2, name: "Jane Smith", matriculation_Number: "A12346" },
      { student_Id: 3, name: "Bob Johnson", matriculation_Number: "A12347" }
    ];
  };

  // Fetch students who should be in this class
  const fetchStudents = async () => {
    if (!attendanceSession?.attendanceId) return;
    
    setLoading(true);
    try {
      const classId = attendanceSession?.classId;
      const response = await fetch(`${API_BASE_URL}/Classes/${classId}/students`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }
      
      const data = await response.json();
      setStudents(data.length > 0 ? data : getDummyStudents());
    } catch (error) {
      console.error("Error fetching students:", error);
      Alert.alert("Error", "Failed to fetch students. Using placeholder data.");
      setStudents(getDummyStudents());
    } finally {
      setLoading(false);
    }
  };

  // Call fetchStudents when attendanceSession changes
  useEffect(() => {
    let isMounted = true;

    if (attendanceSession?.attendanceId && isMounted) {
      fetchStudents();
    }

    return () => {
      isMounted = false;
    };
  }, [attendanceSession?.attendanceId]);

  // Mark a student as present
  const markStudent = async (studentId, status = "Present") => {
    if (!connection) return;

    try {
      // Local optimistic update
      setMarked(prev => ({
        ...prev,
        [studentId]: status
      }));

      // Send via SignalR
      await connection.invoke("MarkStudentAttendance", 
        attendanceSession.attendanceId,
        studentId, 
        status
      );
    } catch (error) {
      console.error("Error marking student:", error);
      // Revert local state on failure
      setMarked(prev => {
        const newState = {...prev};
        delete newState[studentId];
        return newState;
      });
    }
  };

  const combinedMarked = { ...marked, ...realTimeMarked };

const handleSessionEnd = async () => {
    // Update attendance to set isActive to false
    try {
      const response = await fetch(`${API_BASE_URL}/AttendanceRecords/flag/${attendanceSession.attendanceId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          isActive: false
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to end session: ${errorText}`);
      }

      console.log("Session marked as inactive");

      // Show the session end alert
      Alert.alert(
        "Session Ended",
        "The attendance session has ended. Would you like to view the summary?",
        [
          {
            text: "View Summary",
            onPress: () => {
              // Navigate to summary page, passing the attendance ID
              router.push({
                pathname: "/tutorcomponent/attendanceSummary",
                params: { attendanceId: attendanceSession?.attendanceId }
              });
            }
          },
          {
            text: "Close",
            onPress: () =>  router.replace('(tutor)/tutor'),
            style: "cancel"
          }
        ]
      );
    } catch (error) {
      console.error("Error ending session:", error);
      Alert.alert("Error", "Failed to end the session.");
      return;
    }
  };

  // End session early
  const endSessionEarly = () => {
    Alert.alert(
      "End Session",
      "Are you sure you want to end this attendance session early?",
      [
        {
          text: "Yes",
          onPress: () => {
            clearInterval(timerRef.current);
            setTimeLeft(0);
            handleSessionEnd();
          }
        },
        {
          text: "No",
          style: "cancel"
        }
      ]
    );
  };

  useEffect(() => {
  const fetchClassDetails = async () => {
    if (!attendanceSession?.classId) return;

    try {
      const response = await fetch(`${API_BASE_URL}/Classes/${attendanceSession.classId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch class details");
      }

      const data = await response.json();
      setClassDetails(data);
    } catch (error) {
      console.error("Error fetching class details:", error);
    }
  };

  fetchClassDetails();
}, [attendanceSession?.classId]);


  // Render item for student list
  const renderStudentItem = ({ item }) => {
    const isMarked = marked[item.student_Id];
    
    return (
      <View className={`flex-row justify-between items-center p-4 border-b ${
        colorScheme === "dark" ? "border-gray-700" : "border-gray-200"
      }`}>
        <View className="flex-1">
          <Text className={`font-semibold ${
            colorScheme === "dark" ? "text-white" : "text-black"
          }`}>
            {item.name}
          </Text>
          <Text className={
            colorScheme === "dark" ? "text-gray-400" : "text-gray-600"
          }>
            Std.Id: {item.student_Id}
          </Text>
        </View>
        
        <View className="flex-row">
          <TouchableOpacity 
            className={`px-3 py-2 rounded-lg mr-2 ${
              isMarked === "Present" 
                ? "bg-green-500" 
                : colorScheme === "dark" 
                  ? "bg-gray-700" 
                  : "bg-gray-200"
            }`}
            onPress={() => markStudent(item.student_Id, "Present")}
            disabled={timeLeft === 0}
          >
            <FontAwesome5 name="check" size={16} color={
              isMarked === "Present" ? "white" : "gray"
            } />
          </TouchableOpacity>
          
          <TouchableOpacity 
            className={`px-3 py-2 rounded-lg ${
              isMarked === "Absent" 
                ? "bg-red-500" 
                : colorScheme === "dark" 
                  ? "bg-gray-700" 
                  : "bg-gray-200"
            }`}
            onPress={() => markStudent(item.student_Id, "Absent")}
            disabled={timeLeft === 0}
          >
            <FontAwesome5 name="times" size={16} color={
              isMarked === "Absent" ? "white" : "gray"
            } />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Show alert when time runs out
  useEffect(() => {
    if (timeLeft === 0 && attendanceSession) {
      handleSessionEnd();
    }
  }, [timeLeft, attendanceSession]);

  // Create a style object for safe area insets
  const containerStyle = {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    paddingBottom: insets.bottom,
    paddingLeft: insets.left,
    paddingRight: insets.right,
    backgroundColor: colorScheme === "dark" ? "#111827" : "#f3f4f6"
  };

  return (
    <SafeAreaView style={containerStyle}>
      {/* Header with attendance info */}
      <View className={`p-4 ${
        colorScheme === "dark" ? "bg-gray-800" : "bg-white"
      }`}>
        <Text className={`text-xl font-bold ${
          colorScheme === "dark" ? "text-white" : "text-black"
        }`}>
          Real-Time Attendance
        </Text>
        
        {attendanceSession ? (
          <>
            <View className="flex-row justify-between items-center mt-2">
              <Text className={colorScheme === "dark" ? "text-primary-300" : "text-primary"}>
                {classDetails?.class_Name || "Loading..."}
              </Text>
              <Text className={
                colorScheme === "dark" ? "text-gray-300" : "text-gray-700"
              }>
                {attendanceSession.locationName}
              </Text>

            </View>
            <View className="flex-row justify-between items-center mt-2">
              
                            <Text className={colorScheme === "dark" ? "text-primary-300" : "text-primary"}>
                {classDetails?.module_Code || ""}
              </Text>
              <Text className={
                colorScheme === "dark" ? "text-gray-300" : "text-gray-700"
              }>
                {attendanceSession.timeInterval}
              </Text>
            </View>
            
            <View className="flex-row justify-between items-center mt-2">
              <Text className={`text-lg font-semibold ${
                timeLeft === 0 
                  ? "text-red-500" 
                  : timeLeft < 60 
                    ? "text-orange-500" 
                    : colorScheme === "dark" 
                      ? "text-green-400" 
                      : "text-green-600"
              }`}>
                Time Left: {formatTimeLeft()}
              </Text>
              
              <TouchableOpacity 
                className={`px-3 py-1 rounded-lg ${
                  colorScheme === "dark" ? "bg-red-800" : "bg-red-500"
                }`}
                onPress={endSessionEarly}
              >
                <Text className="text-white font-medium">End Session</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <Text className={`mt-2 ${
            colorScheme === "dark" ? "text-gray-400" : "text-gray-600"
          }`}>
            Loading session data...
          </Text>
        )}
      </View>
      
      {/* Student List */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator 
            size="large" 
            color={colorScheme === "dark" ? "#ffffff" : "#000000"} 
          />
          <Text className={`mt-4 ${
            colorScheme === "dark" ? "text-gray-300" : "text-gray-700"
          }`}>
            Loading students...
          </Text>
        </View>
      ) : (
        <FlatList
          data={students}
          renderItem={renderStudentItem}
          keyExtractor={item => item.student_Id.toString()}
          contentContainerStyle={{flexGrow: 1}}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center p-10">
              <Text className={`text-center text-lg ${
                colorScheme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}>
                No students found for this class.
              </Text>
            </View>
          }
        />
      )}
      
      {/* Status bar */}
      <View className={`p-4 flex-row justify-between items-center ${
        colorScheme === "dark" ? "bg-gray-800" : "bg-white"
      }`}>
        <Text className={
          colorScheme === "dark" ? "text-gray-300" : "text-gray-700"
        }>
          Total: {students.length}
        </Text>
        <Text className={
          colorScheme === "dark" ? "text-green-400" : "text-green-600"
        }>
          Marked: {Object.keys(marked).length}
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default RealTimeRecord;