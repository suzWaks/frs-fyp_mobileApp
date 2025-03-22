import React, { Component } from 'react';
import { StyleSheet, View, ScrollView, Text, TouchableOpacity, Alert } from 'react-native';
import { Table, Row } from 'react-native-table-component';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Icon for download
import { Share } from 'react-native';
import RNPickerSelect from 'react-native-picker-select'; // Import RNPickerSelect

export default class MonthWiseReport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tableHead: ['Student ID', 'Student Name', 'Present', 'Absent'],
      widthArr: [100, 150, 80, 80],
      selectedMonth: 'June', // Set default selected month to 'June'
    };
  }

  // Function to handle month change
  handleMonthChange = (month) => {
    this.setState({ selectedMonth: month });
  };

  // Dummy function to simulate downloading
  handleDownload = () => {
    const { tableHead } = this.state;
    const tableData = this.generateTableData();

    // Convert tableData to CSV format
    const csvData = this.convertToCSV(tableHead, tableData);
    
    // Trigger file sharing (this simulates download without dependencies)
    this.triggerDownload(csvData);
  };

  // Convert data into CSV format
  convertToCSV = (header, data) => {
    const headerRow = header.join(',') + '\n';
    const dataRows = data.map(row => row.join(',')).join('\n');
    return headerRow + dataRows;
  };

  // Generate dummy table data
  generateTableData = () => {
    const tableData = [];
    const names = [
      'Elvis Moren', 'Oscar Chu', 'Lauren Garsier'
    ];

    for (let i = 0; i < 30; i += 1) {
      const rowData = [];
      rowData.push(`${i + 2210182}`); // Student ID
      rowData.push(names[i % names.length]); // Random name
      rowData.push(Math.floor(Math.random() * 10)); // Random Present number
      rowData.push(Math.floor(Math.random() * 10)); // Random Absent number
      tableData.push(rowData);
    }

    return tableData;
  };

  // Trigger file sharing to simulate a download (you can export it to any app that supports file handling)
  triggerDownload = (csvData) => {
    const options = {
      message: 'Attendance Data', // Optional message
      url: `data:text/csv;charset=utf-8,${encodeURIComponent(csvData)}`, // CSV data as URI
      title: 'Export Attendance Data',
    };

    Share.share(options).catch((error) => Alert.alert('Error', 'Unable to download the file.'));
  };

  render() {
    const { tableHead, widthArr, selectedMonth } = this.state;
    const tableData = this.generateTableData();

    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Student Report</Text>
          <Icon name="notifications" size={24} color="#000" />
        </View>

        <View style={styles.dateTimePicker}>
          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Month</Text>
            <RNPickerSelect
              onValueChange={this.handleMonthChange}
              items={[
                { label: 'All', value: 'All' }, // Added 'All' option
                { label: 'January', value: 'January' },
                { label: 'February', value: 'February' },
                { label: 'March', value: 'March' },
                { label: 'April', value: 'April' },
                { label: 'May', value: 'May' },
                { label: 'June', value: 'June' },
              ]}
              value={selectedMonth} // Set the selected month value
              style={pickerSelectStyles} // Custom styles for the picker
              useNativeAndroidPickerStyle={false} // Use custom styles for Android
              placeholder={{ label: 'Select a month', value: null }} // Placeholder text
            />
          </View>
          <TouchableOpacity onPress={this.handleDownload} style={styles.downloadButton}>
            <Icon name="download" size={30} color="#000" />
          </TouchableOpacity>
        </View>

        <ScrollView horizontal={true}>
          <View>
            <Table borderStyle={{ borderWidth: 1, borderColor: '#C1C0B9' }}>
              <Row data={tableHead} widthArr={widthArr} style={styles.header} textStyle={styles.text} />
            </Table>
            <ScrollView style={styles.dataWrapper}>
              <Table borderStyle={{ borderWidth: 1, borderColor: '#C1C0B9' }}>
                {tableData.map((rowData, index) => (
                  <Row
                    key={index}
                    data={rowData}
                    widthArr={widthArr}
                    style={styles.row}
                    textStyle={styles.text}
                  />
                ))}
              </Table>
            </ScrollView>
          </View>
        </ScrollView>

        <View style={styles.pagination}>
          <TouchableOpacity style={styles.pageButton}>
            <Text style={styles.pageButtonText}>{'<'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.pageButton}>
            <Text style={styles.pageButtonText}>1</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.pageButton}>
            <Text style={styles.pageButtonText}>2</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.pageButton}>
            <Text style={styles.pageButtonText}>{'>'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

// Styles for RNPickerSelect
const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    backgroundColor: '#7647EB',
    padding: 12,
    borderRadius: 8,
    color: 'white',
    fontSize: 16,
    marginRight: 10,
  },
  inputAndroid: {
    borderRadius: 8,
    color: 'white',
    fontSize: 16,
    marginRight: 10,
  },
});

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 30, backgroundColor: '#fff' },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7647EB',
  },
  dateTimePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7647EB',
    marginRight: 10,
  },
  downloadButton: {
    padding: 5,
  },
  header: { height: 50, backgroundColor: '#7647EB' }, // Purple background for header
  text: { textAlign: 'center', fontWeight: '100', color: '#000' },
  dataWrapper: { marginTop: -1 },
  row: { height: 40, backgroundColor: '#fff' }, // White background for cells
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  pageButton: {
    marginHorizontal: 5,
    padding: 10,
    backgroundColor: '#7647EB',
    borderRadius: 5,
  },
  pageButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});