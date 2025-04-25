import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  TextInput,
  Dimensions,
  ScrollView
} from 'react-native';
import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 375;

const classTakenReport = [
  { date: '19-12-2024', time: '9:30 AM', totalStudents: 50, present: 45, absent: 5 },
  { date: '20-12-2024', time: '10:30 AM', totalStudents: 50, present: 48, absent: 2 },
  { date: '21-12-2024', time: '11:30 AM', totalStudents: 50, present: 42, absent: 8 },
];

export default function ClassTakenReportScreen() {
  const { code, name, instructor } = useLocalSearchParams();
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
          <View style={styles.headerTextContainer}>
            <Text style={[styles.headerTitle, { 
              color: textColor,
              fontSize: responsiveFontSize(18)
            }]}>
              {code} - {name}
            </Text>
            <Text style={[styles.headerSubtitle, { 
              color: textColor,
              fontSize: responsiveFontSize(14)
            }]}>
              {instructor}
            </Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <Ionicons 
            name="notifications-outline" 
            size={24} 
            color={textColor} 
          />
          <TouchableOpacity onPress={toggleMode} style={styles.modeToggle}>
            <Ionicons 
              name={isDarkMode ? "sunny-outline" : "moon-outline"} 
              size={24} 
              color={textColor} 
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Filter Section - Using primary color */}
        <View style={[styles.filterContainer, { 
          backgroundColor: cardBg,
          borderColor: borderColor,
          borderWidth: 1
        }]}>
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
            >
              <Text style={{ color: textColor }}>From</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Ionicons 
                name="calendar-outline" 
                size={20} 
                color={PRIMARY_COLOR} 
              />
            </TouchableOpacity>
            <Text style={{ color: textColor, marginHorizontal: 5 }}>to</Text>
            <TouchableOpacity 
              style={[styles.dateInput, { 
                borderColor,
                backgroundColor: cardBg
              }]}
            >
              <Text style={{ color: textColor }}>To</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Ionicons 
                name="calendar-outline" 
                size={20} 
                color={PRIMARY_COLOR} 
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity 
            style={[styles.applyFilterButton, { 
              backgroundColor: PRIMARY_COLOR 
            }]}
          >
            <Text style={styles.applyFilterButtonText}>Apply Filter</Text>
          </TouchableOpacity>
        </View>

        {/* Class Taken Trends - Using primary color */}
        <Text style={[styles.trendsTitle, { 
          color: textColor,
          fontSize: responsiveFontSize(16)
        }]}>
          Class Taken Trends
        </Text>
        <View style={[styles.trendsContent, { 
          backgroundColor: cardBg,
          borderColor: borderColor,
          borderWidth: 1
        }]}>
          <View style={styles.pieChart}>
            <Text style={[styles.pieChartText, { 
              color: textColor,
              fontSize: responsiveFontSize(14)
            }]}>
              Class Taken
            </Text>
            <Text style={[styles.pieChartPercentage, { 
              color: PRIMARY_COLOR,
              fontSize: responsiveFontSize(24)
            }]}>
              94%
            </Text>
          </View>
          <View style={styles.pieChart}>
            <Text style={[styles.pieChartText, { 
              color: textColor,
              fontSize: responsiveFontSize(14)
            }]}>
              Class Not Taken
            </Text>
            <Text style={[styles.pieChartPercentage, { 
              color: PRIMARY_COLOR,
              fontSize: responsiveFontSize(24)
            }]}>
              6%
            </Text>
          </View>
        </View>

        {/* Class Taken Report */}
        <Text style={[styles.reportTitle, { 
          color: textColor,
          fontSize: responsiveFontSize(16)
        }]}>
          Class Taken Report
        </Text>
        <View style={[styles.reportTable, { 
          backgroundColor: cardBg,
          borderColor: borderColor,
          borderWidth: 1
        }]}>
          <View style={[styles.reportHeader, { 
            borderBottomColor: borderColor 
          }]}>
            <Text style={[styles.reportHeaderText, { 
              color: textColor,
              fontSize: responsiveFontSize(12)
            }]}>
              Date
            </Text>
            <Text style={[styles.reportHeaderText, { 
              color: textColor,
              fontSize: responsiveFontSize(12)
            }]}>
              Time
            </Text>
            <Text style={[styles.reportHeaderText, { 
              color: textColor,
              fontSize: responsiveFontSize(12)
            }]}>
              Total
            </Text>
            <Text style={[styles.reportHeaderText, { 
              color: textColor,
              fontSize: responsiveFontSize(12)
            }]}>
              Present
            </Text>
            <Text style={[styles.reportHeaderText, { 
              color: textColor,
              fontSize: responsiveFontSize(12)
            }]}>
              Absent
            </Text>
          </View>
          {classTakenReport.map((item, index) => (
            <View 
              key={index} 
              style={[styles.reportRow, { 
                borderBottomColor: borderColor 
              }]}
            >
              <Text style={[styles.reportCell, { 
                color: textColor,
                fontSize: responsiveFontSize(12)
              }]}>
                {item.date}
              </Text>
              <Text style={[styles.reportCell, { 
                color: textColor,
                fontSize: responsiveFontSize(12)
              }]}>
                {item.time}
              </Text>
              <Text style={[styles.reportCell, { 
                color: textColor,
                fontSize: responsiveFontSize(12)
              }]}>
                {item.totalStudents}
              </Text>
              <Text style={[styles.reportCell, { 
                color: textColor,
                fontSize: responsiveFontSize(12)
              }]}>
                {item.present}
              </Text>
              <Text style={[styles.reportCell, { 
                color: textColor,
                fontSize: responsiveFontSize(12)
              }]}>
                {item.absent}
              </Text>
            </View>
          ))}
        </View>

        {/* Download Button - Using primary color */}
        <TouchableOpacity 
          style={[styles.downloadButton, { 
            borderColor: PRIMARY_COLOR,
            backgroundColor: PRIMARY_COLOR
          }]}
        >
          <Text style={[styles.downloadButtonText, { 
            color: '#fff',
            fontSize: responsiveFontSize(16)
          }]}>
            Download Report
          </Text>
        </TouchableOpacity>
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
    padding: 15,
    borderRadius: 10,
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
  trendsTitle: {
    fontWeight: '600',
    marginBottom: 10,
  },
  trendsContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  pieChart: {
    alignItems: 'center',
    flex: 1,
  },
  pieChartText: {
    fontWeight: '500',
  },
  pieChartPercentage: {
    fontWeight: '600',
    marginTop: 5,
  },
  reportTitle: {
    fontWeight: '600',
    marginBottom: 10,
  },
  reportTable: {
    borderRadius: 10,
    marginBottom: 20,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
  },
  reportHeaderText: {
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
  },
  reportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
  },
  reportCell: {
    textAlign: 'center',
    flex: 1,
  },
  downloadButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  downloadButtonText: {
    fontWeight: '500',
  },
});