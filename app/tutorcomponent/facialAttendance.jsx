//facialattendance.jsx

import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, FlatList, Alert } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useColorScheme } from "nativewind";
import Constants from "expo-constants";

const API_BASE_URL = Constants.expoConfig.extra.API_BASE_URL;
const CustomDropdown = ({
  selectedValue,
  onValueChange,
  options,
  isOpen,
  toggleOpen,
  icon,
  onCalendarClick,
  customStyles,
}) => {
  return (
    <View className="mb-4 relative">
      <TouchableOpacity
        className={`flex-row justify-between items-center ${customStyles.dropdownButton}`}
        onPress={toggleOpen}
      >
        <Text className={`text-lg ${customStyles.selectedText}`}>
          {selectedValue || "Select"}
        </Text>
        <FontAwesome5
          name={icon}
          size={20}
          color={customStyles.iconColor}
          onPress={onCalendarClick}
        />
      </TouchableOpacity>

      {/* Dropdown List (Floating Above) */}
      {isOpen && (
        <View className={`absolute bottom-full left-0 w-full ${customStyles.dropdownBgColor} border ${customStyles.borderColor} rounded-lg shadow-lg mb-2 z-10`}>
          <FlatList
            data={options}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="p-3 border-b border-gray-200"
                onPress={() => {
                  onValueChange(item);
                  toggleOpen(); // Close dropdown after selection
                }}
              >
                <Text className="text-black">{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
};

// Format time from Date object to string in 12-hour format (e.g., "10:00 AM")
const formatTime = (date) => {
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  
  hours = hours % 12;
  hours = hours ? hours : 12; // Convert 0 to 12
  
  return `${hours}:${minutes} ${ampm}`;
};

export default function FacialAttendance() {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(() => {
    const date = new Date();
    date.setHours(date.getHours() + 2); // Default end time is 2 hours after start time
    return date;
  });
  const [selectedTimeLimit, setSelectedTimeLimit] = useState("5 Minutes");
  const [selectedCoordinates, setSelectedCoordinates] = useState("");
  const [locationOptions, setLocationOptions] = useState([]);
  const [locationData, setLocationData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dropdownOpen, setDropdownOpen] = useState({
    date: false,
    startTime: false,
    endTime: false,
    coordinates: false,
    timeLimit: false,
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState({
    start: false,
    end: false
  });
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [isCreatingAttendance, setIsCreatingAttendance] = useState(false);
  
  // Get class_Id from route params
  const params = useLocalSearchParams();
  const [selectedClassId, setSelectedClassId] = useState(params.class_Id ? parseInt(params.class_Id) : 0);

  const router = useRouter();

  // Display class ID for debugging
  useEffect(() => {
    console.log("Received class_Id in FacialAttendance:", selectedClassId);
  }, [selectedClassId]);

  // Formatted time display string like "10:00 - 12:00 AM"
  const formattedTimeDisplay = () => {
    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
  };

  // Get time interval in proper format for API request
  const getTimeIntervalString = () => {
    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
  };

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/Locations`);
        if (!response.ok) {
          throw new Error('Failed to fetch locations');
        }
        const data = await response.json();
        const locationNames = data.map(location => location.locationName);
        setLocationOptions(locationNames);
        setLocationData(data); // Store the full location data
        if (locationNames.length > 0) {
          setSelectedCoordinates(locationNames[0]);
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
        Alert.alert("Error", "Failed to fetch locations. Please try again.");
      } finally {
        setLoadingLocations(false);
      }
    };

    fetchLocations();
  }, []);

  const toggleDropdown = (field) => {
    setDropdownOpen((prev) => ({
      date: false,
      startTime: false,
      endTime: false,
      coordinates: false,
      timeLimit: false,
      [field]: !prev[field],
    }));
  };

  const handleDateChange = (event, selectedDate) => {
    if (selectedDate) {
      setSelectedDate(selectedDate);
    }
    setShowDatePicker(false);
  };

  const handleStartTimeChange = (event, selectedTime) => {
    if (selectedTime) {
      setStartTime(selectedTime);
      
      // If end time is before the new start time, adjust it
      if (endTime < selectedTime) {
        const newEndTime = new Date(selectedTime);
        newEndTime.setHours(newEndTime.getHours() + 2);
        setEndTime(newEndTime);
      }
    }
    setShowTimePicker({...showTimePicker, start: false});
  };

  const handleEndTimeChange = (event, selectedTime) => {
    if (selectedTime) {
      // Ensure end time is not before start time
      if (selectedTime > startTime) {
        setEndTime(selectedTime);
      } else {
        // If selected end time is before start time, set it to start time + 30 min
        const newEndTime = new Date(startTime);
        newEndTime.setMinutes(newEndTime.getMinutes() + 30);
        setEndTime(newEndTime);
      }
    }
    setShowTimePicker({...showTimePicker, end: false});
  };

  // Find location ID based on selected location name
  const getLocationId = () => {
    const selectedLocation = locationData.find(
      location => location.locationName === selectedCoordinates
    );
    return selectedLocation ? selectedLocation.location_Id : 0;
  };

  // Parse time limit string to minutes
  const parseTimeLimit = (timeLimitString) => {
    // Extract the number from strings like "5 Minutes"
    const minutes = parseInt(timeLimitString.split(' ')[0], 10);
    return isNaN(minutes) ? 5 : minutes; // Default to 5 if parsing fails
  };

  // Handle creating a new attendance record
  const handleCreateAttendance = async () => {
    if (selectedClassId <= 0) {
      Alert.alert(
        "Error",
        "Invalid class ID. Please try again.",
        [{ text: "OK" }]
      );
      return;
    }
    
    setIsCreatingAttendance(true);
    
    try {
      const locationId = getLocationId();
      
      // Use the class ID passed from AttendanceDialog
      const classId = selectedClassId;
      
      // Extract time limit in minutes
      const timeLimitMinutes = parseTimeLimit(selectedTimeLimit);
      
      // Create attendance data object
      const attendanceData = {
        attendance_Id: 0, // API will assign the real ID
        date: selectedDate.toISOString(),
        time_Interval: getTimeIntervalString(),
        class_Id: classId,
        location_Id: locationId,
        isActive: true
      };
      
      console.log("Creating attendance with data:", attendanceData);
      
      const response = await fetch(`${API_BASE_URL}/AttendanceRecords`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(attendanceData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create attendance: ${errorText}`);
      }
      
      const result = await response.json();
      console.log("Attendance created successfully:", result);
      
      // Store the attendance ID and time limit in AsyncStorage for use in realTimeRecord
      try {
        const attendanceSession = {
          attendanceId: result.attendance_Id,
          timeLimitMinutes: timeLimitMinutes,
          startTime: new Date().toISOString(),
          timeInterval: getTimeIntervalString(),
          locationName: selectedCoordinates,
          endTime: endTime.toISOString(),
          expiryTime: new Date(Date.now() + timeLimitMinutes * 60 * 1000).toISOString(),
          classId: classId
        };
        
        // Instead of using AsyncStorage directly, we'll pass the data in router params
        router.push({
          pathname: "/tutorcomponent/realTimeRecord",
          params: { 
            attendanceData: JSON.stringify(attendanceSession) 
          }
        });
      } catch (storageError) {
        console.error("Error storing attendance session data:", storageError);
        // Still navigate but without the params
        router.push("/tutorcomponent/realTimeRecord");
      }
      
    } catch (error) {
      console.error("Error creating attendance:", error);
      Alert.alert(
        "Error",
        "Failed to create attendance record. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setIsCreatingAttendance(false);
    }
  };

  const customStyles = {
    selectedText: colorScheme === "dark" ? "text-gray-400" : "text-black",
    iconColor: colorScheme === "dark" ? "bg-gray-400" : "bg-black",
    dropdownBgColor: colorScheme === "dark" ? "bg-gray-300" : "bg-white",
  };

  return (
    <View
      className={`flex-1 p-6 justify-center items-center ${
        colorScheme === "dark" ? "bg-gray-400" : "bg-gray-100"
      }`}
    >
      <View
        className={`bg-white rounded-xl p-6 w-4/5 shadow-lg border-2 border-gray-300 ${
          colorScheme === "dark" ? "bg-gray-800" : "bg-white"
        }`}
      >
        {/* Title */}
        <Text
          className={`text-xl font-bold mb-7 text-center ${
            colorScheme === "dark" ? "text-gray-100" : "text-black"
          }`}
        >
          Attendance
        </Text>

        {/* Date Field */}
        <CustomDropdown
          selectedValue={selectedDate.toLocaleDateString()}
          onValueChange={setSelectedDate}
          toggleOpen={() => toggleDropdown("date")}
          icon="calendar-alt"
          onCalendarClick={() => setShowDatePicker(!showDatePicker)}
          customStyles={customStyles}
          isOpen={dropdownOpen.date}
        />

        {/* Time Field - Split into Start and End Time */}
        <View className="mb-4 relative">
          <Text className={`text-lg mb-1 ${colorScheme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
            Time Range
          </Text>
          <View className="flex-row justify-between items-center">
            <Text className={`text-lg ${colorScheme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              {formattedTimeDisplay()}
            </Text>
          </View>
          
          {/* Start Time Selection */}
          <View className="flex-row justify-between items-center mt-2">
            <Text className={`${customStyles.selectedText}`}>
              Start:
            </Text>
            <TouchableOpacity 
              className="flex-row items-center"
              onPress={() => setShowTimePicker({...showTimePicker, start: true})}
            >
              <Text className={`mr-2 ${customStyles.selectedText}`}>
                {formatTime(startTime)}
              </Text>
              <FontAwesome5
                name="clock"
                size={16}
                color={customStyles.iconColor}
              />
            </TouchableOpacity>
          </View>
          
          {/* End Time Selection */}
          <View className="flex-row justify-between items-center mt-2">
            <Text className={`${customStyles.selectedText}`}>
              End:
            </Text>
            <TouchableOpacity 
              className="flex-row items-center"
              onPress={() => setShowTimePicker({...showTimePicker, end: true})}
            >
              <Text className={`mr-2 ${customStyles.selectedText}`}>
                {formatTime(endTime)}
              </Text>
              <FontAwesome5
                name="clock"
                size={16}
                color={customStyles.iconColor}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Coordinates Field */}
        {!loadingLocations && (
          <CustomDropdown
            selectedValue={selectedCoordinates}
            onValueChange={setSelectedCoordinates}
            options={locationOptions}
            isOpen={dropdownOpen.coordinates}
            toggleOpen={() => toggleDropdown("coordinates")}
            icon="map-marker-alt"
            customStyles={customStyles}
          />
        )}

        {/* Time Limit Field */}
        <CustomDropdown
          selectedValue={selectedTimeLimit}
          onValueChange={setSelectedTimeLimit}
          options={["5 Minutes", "10 Minutes", "15 Minutes"]}
          isOpen={dropdownOpen.timeLimit}
          toggleOpen={() => toggleDropdown("timeLimit")}
          icon="hourglass-half"
          customStyles={customStyles}
        />

        {/* Selected Location and Class ID Display -- Use for debugging
        <View className="mb-2">
          <Text className={`text-sm ${colorScheme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
            Selected Location ID: {getLocationId()}
          </Text>
          <Text className={`text-sm ${colorScheme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
            Selected Class ID: {selectedClassId}
          </Text>
        </View> */}

        {/* Start Attendance Button */}
        <TouchableOpacity
          className={`py-3 rounded-[10px] shadow-md mt-6 ${
            colorScheme === "dark" ? "bg-primary" : "bg-primary"
          } ${isCreatingAttendance || selectedClassId <= 0 ? "opacity-50" : "opacity-100"}`}
          onPress={handleCreateAttendance}
          disabled={isCreatingAttendance || loadingLocations || selectedClassId <= 0}
        >
          <Text
            className={`text-center font-bold ${
              colorScheme === "dark" ? "text-white" : "text-white"
            }`}
          >
            {isCreatingAttendance ? "Creating..." : "Start Attendance"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Date Picker as Floating Element */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      {/* Start Time Picker */}
      {showTimePicker.start && (
        <DateTimePicker
          value={startTime}
          mode="time"
          display="default"
          onChange={handleStartTimeChange}
        />
      )}

      {/* End Time Picker */}
      {showTimePicker.end && (
        <DateTimePicker
          value={endTime}
          mode="time"
          display="default"
          onChange={handleEndTimeChange}
        />
      )}
    </View>
  );
}