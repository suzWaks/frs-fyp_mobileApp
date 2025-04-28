import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Modal } from "react-native";
import { useColorScheme } from "nativewind";

const notifications = [
  { id: "1", name: "Anthony Stevens", time: "5 mins ago" },
  { id: "2", name: "Karma", time: "2 hrs ago" },
  { id: "3", name: "Pema Lhaden", time: "2 hrs ago" },
  { id: "4", name: "Karma Sonam", time: "2 hrs ago" },
];

const NotificationsScreen = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const { colorScheme, toggleColorScheme } = useColorScheme();

  return (
    <View 
    className={`flex-1 bg-white p-2 ${
      colorScheme === "dark" ? "bg-gray-800" : "bg-white"
    }`}>
      {/* Notification List */}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
          className={`bg-white p-4 border-b border-gray-200 ${
            colorScheme === "dark" ? "bg-gray-800" : "bg-white"
          }`}
          >
            <Text className="text-primary text-xs self-end">{item.time}</Text>
            <Text 
            className={`text-lg ${
              colorScheme === "dark" ? "text-gray-400" : "text-black"
            }`}
           >{item.name} request for verification</Text>
            <TouchableOpacity
              className="bg-primary px-4 py-1 rounded-full self-end mt-1"
              onPress={() => setModalVisible(true)}
            >
              <Text className="text-white">Accept</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Modal for Alert */}
      <Modal 
      visible={modalVisible} transparent animationType="slide">
        <View 
        className="flex-1 justify-center items-center bg-black/50">
          <View 
           className={`bg-white p-6 rounded-lg w-80 items-center ${
            colorScheme === "dark" ? "bg-gray-800" : "bg-white"
          }`}>
            <Text 
            className={`text-lg font-bold ${
              colorScheme === "dark" ? "text-gray-400" : "text-black"
            }`}>Encountered Problem while</Text>
            <Text className={`text-lg font-bold ${
              colorScheme === "dark" ? "text-gray-400" : "text-black"
            }`}>Marking Attendance!</Text>
            <Text 
            className={`text-gray-500 text-lg mt-2 ${
              colorScheme === "dark" ? "text-gray-400" : "text-black"
            }`}
           >Are you sure you want to accept?</Text>

            <View className="flex-row mt-5 space-x-4">
              <TouchableOpacity
                className="bg-green-500 px-4 py-2 rounded-[10px]"
                onPress={() => setModalVisible(false)}
              >
                <Text className="text-white font-bold">Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-red-500 px-4 py-2 rounded-[10px]"
                onPress={() => setModalVisible(false)}
              >
                <Text className="text-white font-bold">Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default NotificationsScreen;
