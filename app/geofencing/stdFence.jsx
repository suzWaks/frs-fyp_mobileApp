import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Platform,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import * as Location from 'expo-location';
import Constants from 'expo-constants';
import * as signalR from '@microsoft/signalr';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';


const API_BASE_URL = Constants.expoConfig.extra.API_BASE_URL;
const LOCATIONS_API = `${API_BASE_URL}/Locations`;
const DEFAULT_RADIUS = 50;



export default function MarkAttendanceScreen() {
  const [loading, setLoading] = useState(false);
  const [activeAttendance, setActiveAttendance] = useState(null);
  const [locations, setLocations] = useState([]);
  const [connection, setConnection] = useState(null);
  const [userId, setUserId] = useState(null);
  const router = useRouter();

    useEffect(() => {
    const getUserDetails = async () => {
      try {
      const userData = await AsyncStorage.getItem('userData');
      if (!userData) {
        throw new Error('User data not found');
      }
        const user = JSON.parse(userData);
        setUserId(user.studentId);
        console.log("User ID std fence:", userId);
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };
    getUserDetails();
  }, []);

  useEffect(() => {
    let isMounted = true;
    let connectionInstance = null;

    const initSignalR = async () => {
      const conn = new signalR.HubConnectionBuilder()
        .withUrl(`${API_BASE_URL}/attendanceHub`)
        .withAutomaticReconnect()
        .build();

      connectionInstance = conn;

      conn.on("StudentAttendanceUpdated", (update) => {
        if (isMounted && update.studentId === activeAttendance?.student?.student_Id) {
          Alert.alert("Success", `Attendance marked as ${update.status}`);
        }
      });

      conn.on("AttendanceError", (msg) => {
        if (isMounted) Alert.alert("Error", msg || "Failed to mark attendance.");
      });

      try {
        await conn.start();
        console.log("SignalR connected");
        if (isMounted) setConnection(conn);
      } catch (err) {
        console.error("Connection error:", err);
        if (isMounted) Alert.alert("Error", "Could not connect to attendance service.");
      }
    };

    initSignalR();

    return () => {
      isMounted = false;
      if (connectionInstance) connectionInstance.stop();
    };
  }, []);

  useEffect(() => {
    fetchActiveAttendance();
    fetchLocations();
  }, []);

  useEffect(() => {
    if (connection && connection.state === 'Connected' && activeAttendance?.attendance_Id) {
      connection.invoke("JoinAttendanceSession", activeAttendance.attendance_Id)
        .then(() => console.log(`Joined session: ${activeAttendance.attendance_Id}`))
        .catch(console.error);
    }
  }, [connection?.state, activeAttendance?.attendance_Id]);

  const fetchActiveAttendance = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/AttendanceRecords/active`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setActiveAttendance(data?.[0] || null);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not load attendance session.");
    }
  };

  const fetchLocations = async () => {
    try {
      const res = await fetch(LOCATIONS_API);
      const data = await res.json();
      setLocations(data);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to load locations");
    }
  };

  const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = deg => (deg * Math.PI) / 180;
    const R = 6371000;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const handleMarkAttendance = async () => {
    if (!activeAttendance?.locationData) {
      Alert.alert("No Active Session", "No active session available.");
      return;
    }

    if (!connection || connection.state !== "Connected") {
      Alert.alert("Connection Error", "Not connected to server.");
      return;
    }

    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") throw new Error("Location permission denied");

      const enabled = await Location.hasServicesEnabledAsync();
      if (!enabled) throw new Error("Enable location services");

      const { coords } = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = coords;
      const { latitude: targetLat, longitude: targetLon } = activeAttendance.locationData;

      const distance = haversineDistance(latitude, longitude, parseFloat(targetLat), parseFloat(targetLon));
      if (distance > DEFAULT_RADIUS) {
        Alert.alert("Out of Range", `You're ${distance.toFixed(1)}m away. Max allowed is ${DEFAULT_RADIUS}m.`);
        return;
      }

      // || 1

      await connection.invoke("MarkStudentAttendance",
        activeAttendance.attendance_Id,
        // activeAttendance.student?.student_Id || 1,
        userId,
        "Present"
      );

      Alert.alert(
        "Success",
        "Location Verified! | Attendance marked successfully!",
        [
          {
            text: "OK",
            onPress: () => router.replace('/(students)/student')
          }
        ]
      );
    } catch (err) {
      console.error(err);
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Mark Your Location</Text>
          <Text style={styles.subtitle}>Ensure location services are turned on</Text>
        </View>

        <View style={styles.cardContainer}>
          <Text style={styles.cardTitle}>
            {activeAttendance ? "Active Attendance Session" : "No Active Attendance"}
          </Text>
          {activeAttendance ? (
            <>
              <Text><Text style={{ fontWeight: "bold" }}>Date:</Text> {new Date(activeAttendance.date).toLocaleDateString()}</Text>
              <Text><Text style={{ fontWeight: "bold" }}>Time:</Text> {activeAttendance.time_Interval}</Text>
              <Text><Text style={{ fontWeight: "bold" }}>Class:</Text> {activeAttendance.class?.class_Name}</Text>
              <Text><Text style={{ fontWeight: "bold" }}>Module:</Text> {activeAttendance.class?.module_Code}</Text>
              <Text><Text style={{ fontWeight: "bold" }}>Location:</Text> {activeAttendance.locationData?.locationName}</Text>
              <Text><Text style={{ fontWeight: "bold" }}>Latitude:</Text> {activeAttendance.locationData?.latitude}</Text>
              <Text><Text style={{ fontWeight: "bold" }}>Longitude:</Text> {activeAttendance.locationData?.longitude}</Text>
            </>
          ) : (
            <Text>No session available now.</Text>
          )}
        </View>

        <View style={styles.cardContainer}>
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            disabled={loading || !connection || connection.state !== 'Connected'}
            onPress={handleMarkAttendance}
          >
            {loading
              ? <ActivityIndicator size="small" color="#FFF" />
              : <Text style={styles.buttonText}>Mark Location</Text>}
          </TouchableOpacity>
          {connection && connection.state !== "Connected" && (
            <Text style={styles.connectionWarning}>Reconnecting to server...</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f5f5' },
  scrollContainer: { flexGrow: 1, padding: 20 },
  headerContainer: { marginVertical: 16, alignItems: 'center' },
  title: { fontSize: 32, fontWeight: '700', color: '#333' },
  subtitle: { fontSize: 18, color: '#666', marginTop: 8 },
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginVertical: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  cardTitle: { fontSize: 20, fontWeight: '600', marginBottom: 16, color: '#333' },
  button: {
    backgroundColor: '#7647EB',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: { backgroundColor: '#aaa' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  connectionWarning: { color: '#ff6b6b', textAlign: 'center', marginTop: 8 },
});
