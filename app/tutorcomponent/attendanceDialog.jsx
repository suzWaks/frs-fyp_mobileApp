import React, { useState } from "react";
import { View, Text, Modal, TouchableOpacity, TouchableWithoutFeedback, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { sendAttendanceData } from "../api/attendanceApi"; // Import the mock API function

const AttendanceDialog = ({ visible, onClose, userRole }) => {
  const [selectedMode, setSelectedMode] = useState("Facial Recognition");
  const router = useRouter();

  const handleDone = async () => {
    if (selectedMode === "Facial Recognition") {
      router.push("/tutorcomponent/facialAttendance");
    } else if (selectedMode === "Headcount") {
      // Send attendance data to the mock API
      const result = await sendAttendanceData(userRole, selectedMode);
      console.log(result.message);

      if (userRole === "student") {
        // Send student info to the headcount screen
        router.push({
          pathname: "/tutorcomponent/headcountscreen",
          params: { studentName: "student1" },
        });
      } else {
        router.push("/tutorcomponent/headcountscreen");
      }
    } else {
      // Send attendance data to the mock API
      const result = await sendAttendanceData(userRole, selectedMode);
      console.log(result.message);
    }

    onClose(); // Close the dialog without changing the UI of the ModuleReport screen
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Select attendance mode</Text>

            {/* Options */}
            <View style={styles.optionsContainer}>
              {/* Facial Recognition */}
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  selectedMode === "Facial Recognition" && styles.selectedOption,
                ]}
                onPress={() => setSelectedMode("Facial Recognition")}
              >
                <View style={styles.optionContent}>
                  <Ionicons
                    name="videocam"
                    size={40}
                    color={selectedMode === "Facial Recognition" ? "#fff" : "#000"}
                  />
                  <Text
                    style={[
                      styles.optionText,
                      selectedMode === "Facial Recognition" && styles.selectedOptionText,
                    ]}
                  >
                    Facial Recognition
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Headcount */}
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  selectedMode === "Headcount" && styles.selectedOption,
                ]}
                onPress={() => setSelectedMode("Headcount")}
              >
                <View style={styles.optionContent}>
                  <Ionicons
                    name="person"
                    size={40}
                    color={selectedMode === "Headcount" ? "#fff" : "#000"}
                  />
                  <Text
                    style={[
                      styles.optionText,
                      selectedMode === "Headcount" && styles.selectedOptionText,
                    ]}
                  >
                    Headcount
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Done Button */}
            <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 2.5,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  optionButton: {
    padding: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ccc',
    alignItems: 'center',
    width: '45%',
  },
  selectedOption: {
    backgroundColor: '#7647EB',
    borderColor: '#7647EB',
  },
  optionContent: {
    alignItems: 'center',
  },
  optionText: {
    marginTop: 10,
    fontSize: 16,
    color: '#000',
  },
  selectedOptionText: {
    color: '#fff',
  },
  doneButton: {
    backgroundColor: '#7647EB',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AttendanceDialog;
