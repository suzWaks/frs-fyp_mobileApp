import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  FlatList, 
  Dimensions,
  ScrollView,
  Platform
} from 'react-native';
import React, { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 375;

const attendanceReport = [
  { id: '1', name: 'Nima Yozer', class: 'CTE411', date: '19-12-2024', time: '9:30 AM', status: 'Present' },
  { id: '2', name: 'Suzal Wakhlrey', class: 'CTE411', date: '19-12-2024', time: '9:30 AM', status: 'Absent' },
  { id: '3', name: 'Dechen Pelden', class: 'CTE411', date: '19-12-2024', time: '9:30 AM', status: 'Leave' },
  { id: '4', name: 'Sonam Tenzin', class: 'CTE411', date: '19-12-2024', time: '9:30 AM', status: 'Leave' },
];

export default function ReportScreen() {
  const { code, name } = useLocalSearchParams();
  const router = useRouter();
  const { colorScheme, setColorScheme } = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  
  // Primary color and its variations
  const PRIMARY_COLOR = '#7647EB';
  const PRIMARY_LIGHT = '#9D7AFF';
  const PRIMARY_DARK = '#5B2DCF';

  // State for date picker
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState(null); // 'from' or 'to'
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [fromDateText, setFromDateText] = useState('From');
  const [toDateText, setToDateText] = useState('To');
  const [filteredData, setFilteredData] = useState(attendanceReport);

  const toggleMode = () => {
    setColorScheme(isDarkMode ? 'light' : 'dark');
  };

  const handleBackPress = () => {
    router.back();
  };

  const showDatePicker = (mode) => {
    setPickerMode(mode);
    setShowPicker(true);
  };

  const handleDateChange = (event, selectedDate) => {
    setShowPicker(false);
    
    if (event.type === 'dismissed') {
      return; // User cancelled the picker
    }

    const currentDate = selectedDate || (pickerMode === 'from' ? fromDate : toDate);
    const formattedDate = currentDate.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    if (pickerMode === 'from') {
      setFromDate(currentDate);
      setFromDateText(formattedDate);
    } else {
      setToDate(currentDate);
      setToDateText(formattedDate);
    }
  };

  const applyFilter = () => {
    // Filter implementation would go here
    setFilteredData(attendanceReport); // For now, just show all data
  };

  // Color variables
  const textColor = isDarkMode ? '#E2E2E2' : '#000';
  const backgroundColor = isDarkMode ? '#121212' : '#fff';
  const headerBg = isDarkMode ? '#1E1E1E' : '#F5F5F5';
  const cardBg = isDarkMode ? '#1E1E1E' : '#fff';
  const borderColor = isDarkMode ? '#3b3b3b' : '#e5e5e5';

  // Responsive font size
  const responsiveFontSize = (size) => isSmallScreen ? size * 0.9 : size;

  const downloadReport = async () => {
    try {
      // Create CSV header
      let csvContent = "ID,Name,Class,Date,Time,Status\n";
      
      // Add each attendance record to CSV
      filteredData.forEach(item => {
        csvContent += `${item.id},${item.name},${item.class},${item.date},${item.time},${item.status}\n`;
      });
  
      // Define file path with timestamp
      const fileName = `attendance_report_${new Date().getTime()}.csv`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      // Write the CSV file
      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });
  
      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Sharing not available on this device');
        return;
      }
  
      // Share the file (this will allow user to save/download it)
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/csv',
        dialogTitle: 'Save Attendance Report',
        UTI: 'public.comma-separated-values-text',
      });
  
    } catch (error) {
      console.error('Error downloading report:', error);
      Alert.alert('Error', 'Failed to download report. Please try again.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Header - Kept neutral as requested */}
      <View style={[styles.header, { backgroundColor: headerBg }]}>
        <View style={styles.leftHeader}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text 
              style={[styles.headerTitle, { 
                fontSize: responsiveFontSize(18),
                color: textColor 
              }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {code} - {name}
            </Text>
            <Text 
              style={[styles.headerSubtitle, { 
                fontSize: responsiveFontSize(14),
                color: textColor 
              }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              19th Nov, 2024 - 20th Dec, 2024
            </Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <Ionicons 
            name="notifications-outline" 
            size={responsiveFontSize(24)} 
            color={textColor} 
          />
          <TouchableOpacity onPress={toggleMode} style={styles.modeToggle}>
            <Ionicons 
              name={isDarkMode ? "sunny-outline" : "moon-outline"} 
              size={responsiveFontSize(24)} 
              color={textColor} 
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Filter Section - Using primary color */}
        <View style={styles.filterContainer}>
          <Text style={[styles.filterLabel, { 
            color: textColor, 
            fontSize: responsiveFontSize(16) 
          }]}>
            Filter by Date
          </Text>
          <View style={styles.dateInputRow}>
            <TouchableOpacity 
              style={[styles.dateInput, { 
                borderColor, 
                backgroundColor: cardBg 
              }]}
              onPress={() => showDatePicker('from')}
            >
              <Text style={{ color: textColor }}>{fromDateText}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => showDatePicker('from')}>
              <Ionicons 
                name="calendar-outline" 
                size={responsiveFontSize(20)} 
                color={PRIMARY_COLOR} 
              />
            </TouchableOpacity>
            <Text style={{ color: textColor, marginHorizontal: 5 }}></Text>
            <TouchableOpacity 
              style={[styles.dateInput, { 
                borderColor, 
                backgroundColor: cardBg 
              }]}
              onPress={() => showDatePicker('to')}
            >
              <Text style={{ color: textColor }}>{toDateText}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => showDatePicker('to')}>
              <Ionicons 
                name="calendar-outline" 
                size={responsiveFontSize(20)} 
                color={PRIMARY_COLOR} 
              />
            </TouchableOpacity>
          </View>
          
          {/* Date Picker */}
          {showPicker && (
            <DateTimePicker
              value={pickerMode === 'from' ? fromDate : toDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
            />
          )}

          <TouchableOpacity 
            style={[styles.applyFilterButton, { 
              backgroundColor: PRIMARY_COLOR 
            }]}
            onPress={applyFilter}
          >
            <Text style={styles.applyFilterButtonText}>Apply Filter</Text>
          </TouchableOpacity>
        </View>

        {/* Attendance Report */}
        <Text style={[styles.attendanceReportTitle, { 
          color: textColor, 
          fontSize: responsiveFontSize(16) 
        }]}>
          Attendance Report
        </Text>
        
        {/* Attendance List */}
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View style={[styles.reportCard, { 
              backgroundColor: cardBg,
              borderColor: borderColor,
              borderWidth: 1
            }]}>
              <Text style={[styles.reportText, { 
                color: textColor, 
                fontSize: responsiveFontSize(14) 
              }]}>
                {item.name}
              </Text>
              <Text style={[styles.reportText, { 
                color: textColor, 
                fontSize: responsiveFontSize(14) 
              }]}>
                {item.class}
              </Text>
              <Text style={[styles.reportText, { 
                color: textColor, 
                fontSize: responsiveFontSize(14) 
              }]}>
                {item.date}
              </Text>
              <Text style={[styles.reportText, { 
                color: textColor, 
                fontSize: responsiveFontSize(14) 
              }]}>
                {item.time}
              </Text>
              <Text style={[
                styles.reportText, 
                styles[item.status.toLowerCase()], 
                { fontSize: responsiveFontSize(14) }
              ]}>
                {item.status}
              </Text>
            </View>
          )}
        />

        {/* Actions - Using primary color */}
        <View style={styles.actions}>
          <TouchableOpacity 
            style={[styles.editButton, { 
              backgroundColor: PRIMARY_COLOR 
            }]}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.downloadButton, { 
              borderColor: PRIMARY_COLOR 
            }]}
            onPress={downloadReport}
          >
            <Text style={[styles.downloadButtonText, { 
              color: PRIMARY_COLOR 
            }]}>
              Download Report
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 15,
    paddingBottom: 30,
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
    flex: 1,
  },
  backButton: {
    marginRight: 15,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontWeight: '600',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontWeight: '400',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modeToggle: {
    marginLeft: 15,
  },
  filterContainer: {
    marginBottom: 20,
  },
  filterLabel: {
    fontWeight: '600',
    marginBottom: 10,
  },
  dateInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  dateInput: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    flex: 1,
    marginRight: 5,
  },
  applyFilterButton: {
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  applyFilterButtonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 16,
  },
  attendanceReportTitle: {
    fontWeight: '600',
    marginBottom: 10,
  },
  reportCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  reportText: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '400',
  },
  present: {
    color: '#28a745',
    fontWeight: '500',
  },
  absent: {
    color: '#dc3545',
    fontWeight: '500',
  },
  leave: {
    color: '#ffc107',
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  editButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 16,
  },
  downloadButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  downloadButtonText: {
    fontWeight: '500',
    fontSize: 16,
  },
});