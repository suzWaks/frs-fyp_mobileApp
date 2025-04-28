import React, { useState } from "react";
import { View, Text, Modal, TouchableOpacity, TouchableWithoutFeedback } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from 'nativewind';
import { useRouter } from "expo-router";

const ATTENDANCE_MODES = {
  FACIAL: "Facial Recognition",
  HEADCOUNT: "Headcount",
};

const AttendanceDialog = ({ visible, onClose, class_Id }) => {
  const [selectedMode, setSelectedMode] = useState(ATTENDANCE_MODES.FACIAL);
  const router = useRouter();
  const { colorScheme } = useColorScheme();

  const handleDone = () => {
    console.log("Selected class_Id:", class_Id); // Verify class_Id is received
    
    if (selectedMode === ATTENDANCE_MODES.FACIAL) {
      router.push({
        pathname: "/tutorcomponent/facialAttendance",
        params: { class_Id } // Pass class_Id to facial recognition
      });
    } else {
      router.push({
        pathname: "/tutorcomponent/headcountscreen",
        params: { class_Id } // Pass class_Id to headcount
      });
    }
    onClose();
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 justify-end bg-black/50">
          <View className={`p-5 rounded-t-[20px] ${
            colorScheme === "dark" ? "bg-gray-800" : "bg-white"
          }`}>
            <View className="w-10 h-1.5 bg-gray-400 rounded-full self-center mb-5" />
            <Text className={`text-lg font-bold mb-5 ${
              colorScheme === "dark" ? "text-gray-400" : "text-black"
            }`}>
              Select attendance mode
            </Text>

            <View className="flex-row justify-between mb-5">
              {Object.values(ATTENDANCE_MODES).map((mode) => (
                <TouchableOpacity
                  key={mode}
                  className={`p-5 rounded-[10px] border-2 w-[45%] ${
                    selectedMode === mode 
                      ? "bg-primary border-primary" 
                      : "border-gray-300 dark:bg-gray-800"
                  }`}
                  onPress={() => setSelectedMode(mode)}
                >
                  <View className="items-center">
                    <Ionicons
                      name={mode === ATTENDANCE_MODES.FACIAL ? "videocam" : "person"}
                      size={40}
                      color={selectedMode === mode ? "#fff" : colorScheme === "dark" ? "white" : "black"}
                    />
                    <Text className={`mt-2 text-base ${
                      selectedMode === mode ? "text-white" : colorScheme === "dark" ? "text-white" : "text-black"
                    }`}>
                      {mode}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              className="bg-primary py-3 rounded-[10px] items-center"
              onPress={handleDone}
            >
              <Text className="text-white text-lg font-bold">Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default AttendanceDialog;