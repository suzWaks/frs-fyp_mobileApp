import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  FlatList, 
  Image,
  Dimensions
} from 'react-native';
import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 375;

const students = [
  { id: '1', name: 'Suzal Wakhlrey', status: 'Present', image: 'https://via.placeholder.com/40' },
  { id: '2', name: 'Nima Yozer', status: 'Absent', image: 'https://via.placeholder.com/40' },
  { id: '3', name: 'Dechen Pelden', status: 'Leave', image: 'https://via.placeholder.com/40' },
  { id: '4', name: 'Sonam Tenzin', status: 'Leave', image: 'https://via.placeholder.com/40' },
];

export default function AttendanceDetailScreen() {
  const { date, time } = useLocalSearchParams();
  const router = useRouter();
  const { colorScheme, setColorScheme } = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  // Primary color and its variations
  const PRIMARY_COLOR = '#7647EB';
  const PRIMARY_LIGHT = '#9D7AFF';
  const PRIMARY_DARK = '#5B2DCF';

  const toggleMode = () => {
    setColorScheme(isDarkMode ? 'light' : 'dark');
  };

  const handleBackPress = () => {
    router.back();
  };

  // Responsive font size
  const responsiveFontSize = (size) => isSmallScreen ? size * 0.9 : size;

  // Color variables
  const textColor = isDarkMode ? '#E2E2E2' : '#000';
  const backgroundColor = isDarkMode ? '#121212' : '#fff';
  const headerBg = isDarkMode ? '#1E1E1E' : '#F5F5F5';
  const cardBg = isDarkMode ? '#1E1E1E' : '#fff';
  const borderColor = isDarkMode ? '#3b3b3b' : '#e5e5e5';

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Header - Kept neutral as requested */}
      <View style={[styles.header, { backgroundColor: headerBg }]}>
        <View style={styles.leftHeader}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { 
            color: textColor,
            fontSize: responsiveFontSize(20)
          }]}>
            Period-wise report
          </Text>
        </View>
        <TouchableOpacity onPress={toggleMode} style={styles.modeToggle}>
          <Ionicons 
            name={isDarkMode ? "sunny-outline" : "moon-outline"} 
            size={24} 
            color={textColor} 
          />
        </TouchableOpacity>
      </View>

      {/* Module Details - Using primary color */}
      <View style={[styles.moduleDetails, { backgroundColor: PRIMARY_COLOR }]}>
        <Text style={[styles.moduleCode, { 
          color: '#fff',
          fontSize: responsiveFontSize(18)
        }]}>
          CTE411 - Artificial Intelligence
        </Text>
        <View style={styles.dateTimeRow}>
          <Text style={[styles.moduleDate, { 
            color: '#fff',
            fontSize: responsiveFontSize(16)
          }]}>
            {date}
          </Text>
          <Text style={[styles.moduleTime, { 
            color: '#fff',
            fontSize: responsiveFontSize(16)
          }]}>
            {time}
          </Text>
        </View>
      </View>

      {/* Students List */}
      <FlatList
        data={students}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push(`/modules/IndividualReportScreen?name=${item.name}&id=${item.id}&image=${item.image}`)}
          >
            <View style={[styles.studentCard, { 
              backgroundColor: cardBg,
              borderBottomColor: borderColor 
            }]}>
              <Image source={{ uri: item.image }} style={styles.studentImage} />
              <View style={styles.studentInfo}>
                <Text style={[styles.studentName, { 
                  color: textColor,
                  fontSize: responsiveFontSize(16)
                }]}>
                  {item.name}
                </Text>
                <Text style={[styles.studentDetails, { 
                  color: isDarkMode ? '#E2E2E280' : '#888',
                  fontSize: responsiveFontSize(14)
                }]}>
                  0210228, 4IT
                </Text>
              </View>
              <Text style={[
                styles.studentStatus, 
                styles[item.status.toLowerCase()],
                { 
                  backgroundColor: isDarkMode ? 
                    (item.status === 'Present' ? '#155724' : 
                     item.status === 'Absent' ? '#721C24' : '#856404') : 
                    (item.status === 'Present' ? '#D4EDDA' : 
                     item.status === 'Absent' ? '#F8D7DA' : '#FFF3CD'),
                  color: isDarkMode ? '#fff' : 
                    (item.status === 'Present' ? '#155724' : 
                     item.status === 'Absent' ? '#721C24' : '#856404'),
                  fontSize: responsiveFontSize(14)
                }
              ]}>
                {item.status}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Actions - Using primary color */}
      <View style={styles.actions}>
        <TouchableOpacity 
          style={[styles.editButton, { 
            backgroundColor: PRIMARY_COLOR,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 3,
          }]}
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.downloadButton, { 
            borderColor: PRIMARY_COLOR,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 3,
          }]}
        >
          <Text style={[styles.downloadButtonText, { 
            color: PRIMARY_COLOR,
          }]}>
            Download Report
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  leftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontWeight: '600',
  },
  modeToggle: {
    marginLeft: 15,
  },
  moduleDetails: {
    padding: 15,
    borderRadius: 10,
    margin: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  moduleCode: {
    fontWeight: '600',
    marginBottom: 10,
  },
  dateTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
  },
  studentImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontWeight: '600',
  },
  studentDetails: {
    fontWeight: '400',
  },
  studentStatus: {
    fontWeight: '600',
    padding: 5,
    borderRadius: 5,
    textAlign: 'center',
    width: 70,
  },
  present: {},
  absent: {},
  leave: {},
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 15,
    marginTop: 20,
  },
  editButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  downloadButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
    borderWidth: 1,
  },
  downloadButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});