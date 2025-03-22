import React, { useState } from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from 'expo-router'; // Import useRouter

const CustomDropdown = ({ selectedValue, onValueChange, options, isOpen, toggleOpen, icon }) => {
  return (
    <View className="mb-4 relative">
      <TouchableOpacity className="flex-row justify-between items-center" onPress={toggleOpen}>
        <Text className="text-black text-lg">{selectedValue || "Select"}</Text>
        <FontAwesome5 name={icon} size={20} color="black" />
      </TouchableOpacity>

      {/* Dropdown List (Floating Above) */}
      {isOpen && (
        <View className="absolute bottom-full left-0 w-full bg-white border border-gray-300 rounded-lg shadow-lg mb-2 z-10">
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

export default function FacialAttendance() {
  const [selectedTime, setSelectedTime] = useState("10:00 - 12:00 AM");
  const [selectedTimeLimit, setSelectedTimeLimit] = useState("5 Minutes");
  const [selectedCoordinates, setSelectedCoordinates] = useState("CR-15");
  const [selectedDate, setSelectedDate] = useState("15-09-2024");

  const [dropdownOpen, setDropdownOpen] = useState({
    date: false,
    time: false,
    coordinates: false,
    timeLimit: false,
  });

  const router = useRouter(); // Use useRouter to get the router object

  const toggleDropdown = (field) => {
    setDropdownOpen((prev) => ({
      date: false,
      time: false,
      coordinates: false,
      timeLimit: false,
      [field]: !prev[field], // Toggle only the selected dropdown
    }));
  };

  return (
    <View className="flex-1 bg-gray-100 justify-center items-center p-6">
      <View className="bg-white rounded-xl p-6 w-4/5 shadow-lg border-2 border-gray-300">
        
        {/* Title */}
        <Text className="text-xl font-bold mb-6 text-center">
          Attendance
        </Text>

        {/* Date Field */}
        <View className="mb-4 relative">
          <Text className="text-purple-600 font-bold">Date</Text>
          <CustomDropdown
            selectedValue={selectedDate}
            onValueChange={setSelectedDate}
            options={["15-09-2024", "16-09-2024", "17-09-2024"]}
            isOpen={dropdownOpen.date}
            toggleOpen={() => toggleDropdown("date")}
            icon="calendar-alt"
          />
        </View>

        {/* Time Field */}
        <View className="mb-4 relative">
          <Text className="text-purple-600 font-bold">Time</Text>
          <CustomDropdown
            selectedValue={selectedTime}
            onValueChange={setSelectedTime}
            options={["10:00 - 12:00 AM", "12:00 - 2:00 PM", "2:00 - 4:00 PM"]}
            isOpen={dropdownOpen.time}
            toggleOpen={() => toggleDropdown("time")}
            icon="clock"
          />
        </View>

        {/* Coordinates Field */}
        <View className="mb-4 relative">
          <Text className="text-purple-600 font-bold">Coordinates</Text>
          <CustomDropdown
            selectedValue={selectedCoordinates}
            onValueChange={setSelectedCoordinates}
            options={["CR-15", "CR-16", "CR-17"]}
            isOpen={dropdownOpen.coordinates}
            toggleOpen={() => toggleDropdown("coordinates")}
            icon="map-marker-alt"
          />
        </View>

        {/* Time Limit Field */}
        <View className="mb-6 relative">
          <Text className="text-purple-600 font-bold">Time Limit</Text>
          <CustomDropdown
            selectedValue={selectedTimeLimit}
            onValueChange={setSelectedTimeLimit}
            options={["5 Minutes", "10 Minutes", "15 Minutes"]}
            isOpen={dropdownOpen.timeLimit}
            toggleOpen={() => toggleDropdown("timeLimit")}
            icon="hourglass-half"
          />
        </View>

        {/* Start Attendance Button */}
        <TouchableOpacity
          className="bg-purple-600 py-3 rounded-"
          onPress={() => router.push('/tutorcomponent/realTimeRecord')} // Navigate to RealTimeRecord screen
        >
          <Text className="text-center text-white font-bold">
            Start Attendance
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
