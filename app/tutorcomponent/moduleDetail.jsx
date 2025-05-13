import React, { useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TouchableWithoutFeedback,
  TextInput,
  Image,
  StyleSheet,
} from "react-native";
import { useColorScheme } from "nativewind";
import { useRouter } from "expo-router";
import { useLocalSearchParams } from "expo-router";
import Constants from "expo-constants";

export default function ModuleDetails() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const { class_Id } = useLocalSearchParams();
  const [enrollKey, setEnrollKey] = useState("");
  const [moduleCode, setModuleCode] = useState("");
  const [moduleDetails, setModuleDetails] = useState(null);
  const [students, setStudents] = useState([]);
  const API_BASE_URL = Constants.expoConfig.extra.API_BASE_URL;

  useEffect(() => {
    const fetchEnrollmentKey = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/Classes/${class_Id}`);
        const data = await response.json();
        setEnrollKey(data.enrollKey);
        setModuleCode(data.module_Code);
        setModuleDetails(data);
      } catch (error) {
        console.error("Error fetching enrollment key:", error);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to fetch class details",
          position: "bottom",
        });
      }
    };

    const fetchStudents = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/Classes/${class_Id}/students`
        );
        const data = await response.json();
        setStudents(data);
      } catch (error) {
        console.error("Error fetching students:", error);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to fetch student list",
          position: "bottom",
        });
      }
    };

    if (class_Id) {
      fetchEnrollmentKey();
      fetchStudents();
    }
  }, [class_Id]);

  const handleUpdateEnrollKey = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/Classes/${class_Id}`);
      if (!response.ok) throw new Error("Failed to fetch class data");

      const currentData = await response.json();

      const updatedClass = {
        class_Id: currentData.class_Id,
        class_Name: currentData.class_Name,
        module_Code: currentData.module_Code,
        enrollKey: enrollKey,
        yearLevel: currentData.yearLevel,
      };

      const updateResponse = await fetch(
        `${API_BASE_URL}/Classes/${class_Id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedClass),
        }
      );

      if (!updateResponse.ok) throw new Error("Update failed");

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Enrollment key updated successfully",
        position: "bottom",
        visibilityTime: 2000,
      });
    } catch (error) {
      console.error("Error updating enrollment key:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to update enrollment key",
        position: "bottom",
        visibilityTime: 3000,
      });
    }
  };

  return (
    <>
      <TouchableWithoutFeedback>
        <ScrollView
          className={`flex-1 p-4 ${
            colorScheme === "dark" ? "bg-gray-900" : "bg-white"
          }`}
        >
          <View className="items-center mb-3">
            <Text
              className={`text-lg font-bold mb-2 ${
                colorScheme === "dark" ? "text-gray-400" : "text-black"
              }`}
            >
              {"Module Details"}
            </Text>
          </View>

          {/* Module Card*/}
          {moduleDetails && (
            <View
              className={`mb-4 rounded-lg overflow-hidden ${
                colorScheme === "dark" ? "bg-gray-800" : "bg-white"
              }`}
              style={{
                shadowColor: colorScheme === "dark" ? "#fff" : "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <View
                className="p-4"
                style={{
                  backgroundColor: "#7647eb",
                }}
              >
                <View className="flex-row justify-between items-center">
                  <View>
                    <Text className="text-white font-bold text-lg">
                      {moduleDetails.module_Code}
                    </Text>
                    <Text className="text-white opacity-80">
                      {moduleDetails.class_Name}
                    </Text>
                  </View>
                </View>
              </View>
              <View
                className={`p-4 ${
                  colorScheme === "dark" ? "bg-gray-800" : "bg-white"
                }`}
              >
                <View className="flex-row justify-between mb-2">
                  <Text
                    className={`${
                      colorScheme === "dark" ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    Enrollment Key:
                  </Text>
                </View>
                <View className="flex-row items-center mb-4 space-x-4">
                  <TextInput
                    className={`flex-1 border ${
                      colorScheme === "dark"
                        ? "border-gray-600"
                        : "border-gray-300"
                    } rounded-[10px] p-2 ${
                      colorScheme === "dark" ? "text-white" : "text-black"
                    }`}
                    value={enrollKey}
                    onChangeText={(text) => setEnrollKey(text)}
                    editable={true}
                  />
                  <TouchableOpacity
                    className="bg-primary rounded-[10px] p-3 py-2"
                    onPress={handleUpdateEnrollKey}
                  >
                    <Text className="text-white font-bold">Update</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* Students List */}
          <View
            className={`mb-4 rounded-lg overflow-hidden p-4 ${
              colorScheme === "dark" ? "bg-gray-800" : "bg-white"
            }`}
            style={{
              shadowColor: colorScheme === "dark" ? "#fff" : "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <View className="flex-row justify-between items-center mb-4">
              <Text
                className={`text-lg font-bold ${
                  colorScheme === "dark" ? "text-gray-300" : "text-gray-800"
                }`}
              >
                Students
              </Text>
              <Text
                className={`${
                  colorScheme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Total: {students.length}
              </Text>
            </View>

            {students.map((student) => (
              <View
                key={student.student_Id}
                className={`flex-row items-center p-3 mb-2 rounded-lg ${
                  colorScheme === "dark" ? "bg-gray-700" : "bg-gray-100"
                }`}
              >
                <Image
                  source={{ uri: student.profile_PictureURL }}
                  style={styles.profileImage}
                />
                <View className="ml-3 flex-1">
                  <Text
                    className={`font-medium ${
                      colorScheme === "dark" ? "text-gray-300" : "text-gray-800"
                    }`}
                  >
                    {student.name}
                  </Text>
                  <Text
                    className={`text-sm ${
                      colorScheme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    ID: {student.student_Id}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
      <Toast />
    </>
  );
}

const styles = StyleSheet.create({
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
});