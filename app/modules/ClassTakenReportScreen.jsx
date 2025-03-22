import { View, Text, TouchableOpacity, StyleSheet, TextInput, useColorScheme } from 'react-native';
import React, { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const classTakenReport = [
  { date: '19-12-2024', time: '9:30 AM', totalStudents: 50, present: 45, absent: 5 },
];

export default function ClassTakenReportScreen() {
  const { code, name, instructor } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark');

  const toggleMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const textColor = isDarkMode ? '#a9b1d6' : '#000';
  const backgroundColor = isDarkMode ? '#1a1b26' : '#fff';
  const primaryColor = isDarkMode ? '#7aa2f7' : '#6B4EFF';

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: primaryColor }]}>
        <View>
          <Text style={[styles.headerTitle, { color: '#fff' }]}>{code} - {name}</Text>
          <Text style={[styles.headerSubtitle, { color: '#fff' }]}>{instructor}</Text>
        </View>
        <View style={styles.headerRight}>
          <Ionicons name="notifications-outline" size={24} color="#fff" />
          <TouchableOpacity onPress={toggleMode} style={styles.modeToggle}>
            <Ionicons name={isDarkMode ? "sunny-outline" : "moon-outline"} size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter */}
      <View style={styles.filterContainer}>
        <Text style={[styles.filterLabel, { color: textColor }]}>Filter by Date</Text>
        <View style={styles.dateInputRow}>
          <TextInput style={[styles.dateInput, { color: textColor, borderColor: textColor }]} placeholder="From" placeholderTextColor={textColor} />
          <Ionicons name="calendar-outline" size={20} color={primaryColor} />
          <TextInput style={[styles.dateInput, { color: textColor, borderColor: textColor }]} placeholder="To" placeholderTextColor={textColor} />
          <Ionicons name="calendar-outline" size={20} color={primaryColor} />
        </View>
        <TouchableOpacity style={[styles.applyFilterButton, { backgroundColor: primaryColor }]}>
          <Text style={styles.applyFilterButtonText}>Apply Filter</Text>
        </TouchableOpacity>
      </View>

      {/* Class Taken Trends */}
      <View style={styles.trendsContainer}>
        <Text style={[styles.trendsTitle, { color: textColor }]}>Class Taken Trends</Text>
        <View style={styles.trendsContent}>
          <View style={styles.pieChart}>
            <Text style={[styles.pieChartText, { color: textColor }]}>Class Taken</Text>
            <Text style={[styles.pieChartPercentage, { color: primaryColor }]}>94%</Text>
          </View>
          <View style={styles.pieChart}>
            <Text style={[styles.pieChartText, { color: textColor }]}>Class Not Taken</Text>
            <Text style={[styles.pieChartPercentage, { color: primaryColor }]}>6%</Text>
          </View>
        </View>
        <Text style={[styles.percentageTitle, { color: textColor }]}>Percentage of students Present</Text>
        <View style={styles.barChart}>
          <Text style={[styles.barChartLabel, { color: primaryColor }]}>Jan</Text>
          <Text style={[styles.barChartLabel, { color: primaryColor }]}>Feb</Text>
          <Text style={[styles.barChartLabel, { color: primaryColor }]}>Mar</Text>
          <Text style={[styles.barChartLabel, { color: primaryColor }]}>Apr</Text>
          <Text style={[styles.barChartLabel, { color: primaryColor }]}>May</Text>
          <Text style={[styles.barChartLabel, { color: primaryColor }]}>Jun</Text>
        </View>
      </View>

      {/* Class Taken Report */}
      <Text style={[styles.reportTitle, { color: textColor }]}>Class Taken Report</Text>
      <View style={[styles.reportTable, { borderColor: textColor }]}>
        {classTakenReport.map((item, index) => (
          <View key={index} style={[styles.reportRow, { borderBottomColor: textColor }]}>
            <Text style={[styles.reportCell, { color: textColor }]}>{item.date}</Text>
            <Text style={[styles.reportCell, { color: textColor }]}>{item.time}</Text>
            <Text style={[styles.reportCell, { color: textColor }]}>{item.totalStudents}</Text>
            <Text style={[styles.reportCell, { color: textColor }]}>{item.present}</Text>
            <Text style={[styles.reportCell, { color: textColor }]}>{item.absent}</Text>
          </View>
        ))}
      </View>

      {/* Actions */}
      <TouchableOpacity style={[styles.downloadButton, { borderColor: primaryColor }]}>
        <Text style={[styles.downloadButtonText, { color: primaryColor }]}>Download Report</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: 16,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modeToggle: {
    marginLeft: 16, // Add margin to create gap
  },
  filterContainer: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  dateInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  dateInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
  },
  applyFilterButton: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  applyFilterButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  trendsContainer: {
    marginBottom: 20,
  },
  trendsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  trendsContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  pieChart: {
    alignItems: 'center',
  },
  pieChartText: {
    fontSize: 14,
    fontWeight: '500',
  },
  pieChartPercentage: {
    fontSize: 24,
    fontWeight: '600',
  },
  percentageTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  barChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  barChartLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  reportTable: {
    borderWidth: 1,
    borderRadius: 5,
    overflow: 'hidden',
  },
  reportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
  },
  reportCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
  },
  downloadButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    marginTop: 20,
  },
  downloadButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});