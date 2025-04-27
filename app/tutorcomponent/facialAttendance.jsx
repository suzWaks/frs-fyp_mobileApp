import React, { useState } from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker"; // Import DateTimePicker
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind"; // For dark mode support

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

export default function FacialAttendance() {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const [selectedTime, setSelectedTime] = useState("10:00 - 12:00 AM");
  const [selectedTimeLimit, setSelectedTimeLimit] = useState("5 Minutes");
  const [selectedCoordinates, setSelectedCoordinates] = useState("CR-15");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dropdownOpen, setDropdownOpen] = useState({
    date: false,
    time: false,
    coordinates: false,
    timeLimit: false,
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  const router = useRouter();

  const toggleDropdown = (field) => {
    setDropdownOpen((prev) => ({
      date: false,
      time: false,
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

        {/* Time Field */}
        <CustomDropdown
          selectedValue={selectedTime}
          onValueChange={setSelectedTime}
          options={["10:00 - 12:00 AM", "12:00 - 2:00 PM", "2:00 - 4:00 PM"]}
          isOpen={dropdownOpen.time}
          toggleOpen={() => toggleDropdown("time")}
          icon="clock"
          customStyles={customStyles}
        />

        {/* Coordinates Field */}
        <CustomDropdown
          selectedValue={selectedCoordinates}
          onValueChange={setSelectedCoordinates}
          options={["CR-15", "CR-16", "CR-17"]}
          isOpen={dropdownOpen.coordinates}
          toggleOpen={() => toggleDropdown("coordinates")}
          icon="map-marker-alt"
          customStyles={customStyles}
        />

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

        {/* Start Attendance Button */}
        <TouchableOpacity
          className={`py-3 rounded-[10px] shadow-md mt-6 ${
            colorScheme === "dark" ? "bg-primary" : "bg-primary"
          }`}
          onPress={() => router.push("/tutorcomponent/realTimeRecord")}
        >
          <Text
            className={`text-center font-bold ${
              colorScheme === "dark" ? "text-white" : "text-white"
            }`}
          >
            Start Attendance
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
    </View>
  );
}
