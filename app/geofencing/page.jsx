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
  TextInput,
  FlatList,
  Pressable
} from 'react-native';
import * as Location from 'expo-location';
import { ScrollView } from 'react-native';
import Constants from 'expo-constants';

import { Picker } from '@react-native-picker/picker';
const API_BASE_URL = Constants.expoConfig.extra.API_BASE_URL;

const API_ENDPOINT = 'https://your-backend.com/api/attendance';
const LOCATIONS_API = `${API_BASE_URL}/Locations`;
const DEFAULT_RADIUS = 50;

export default function AttendanceScreen() {
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [locations, setLocations] = useState([]);
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [geofenceCenter, setGeofenceCenter] = useState(null);
  const [fetchingLocations, setFetchingLocations] = useState(true);
  const [showLocationList, setShowLocationList] = useState(false);
  const [fetchingCurrentLocation, setFetchingCurrentLocation] = useState(false);

  const [newLocationName, setNewLocationName] = useState('');
  const [newLatitude, setNewLatitude] = useState('');
  const [newLongitude, setNewLongitude] = useState('');

  // Fetch locations
  useEffect(() => {
    const fetchLocations = async () => {
      setFetchingLocations(true);
      try {
        const res = await fetch(LOCATIONS_API);
        const data = await res.json();
        setLocations(data);
      } catch (err) {
        Alert.alert('Error', 'Failed to load locations');
        console.error(err);
      } finally {
        setFetchingLocations(false);
      }
    };
    fetchLocations();
  }, []);

  // Update geofence
  useEffect(() => {
    if (selectedLocationId && locations.length > 0) {
      const selected = locations.find(
        (loc) => loc.location_Id.toString() === selectedLocationId
      );
      if (selected) {
        setSelectedLocation(selected);
        const lat = parseFloat(selected.latitude);
        const lon = parseFloat(selected.longitude);
        if (!isNaN(lat) && !isNaN(lon)) {
          setGeofenceCenter({ latitude: lat, longitude: lon, radius: DEFAULT_RADIUS });
        } else {
          Alert.alert('Invalid Coordinates', 'Selected location has invalid coordinates.');
        }
      }
    }
  }, [selectedLocationId]);

  const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (deg) => (deg * Math.PI) / 180;
    const R = 6371000;  // Radius of Earth in meters
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const processAttendance = async (latitude, longitude) => {
    if (!geofenceCenter) {
      Alert.alert('Select Location', 'Please select a location first.');
      return;
    }

    const distance = haversineDistance(
      latitude,
      longitude,
      geofenceCenter.latitude,
      geofenceCenter.longitude
    );

    if (distance > geofenceCenter.radius) {
      Alert.alert(
        'Out of Range',
        `You're ${distance.toFixed(1)}m from the allowed area. Max allowed is ${DEFAULT_RADIUS}m.`
      );
      return;
    }

    try {
      const res = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude,
          longitude,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!res.ok) {
        const error = await res.text();
        Alert.alert('Server Error', error || 'Could not mark attendance.');
      } else {
        Alert.alert('Success', 'Attendance marked successfully!');
      }
    } catch (err) {
      console.error('Error processing attendance:', err);
      Alert.alert('Error', 'Failed to process attendance.');
    }
  };

  const handleMarkAttendance = async () => {
    if (!geofenceCenter) {
      Alert.alert('Select Location', 'Please select a location.');
      return;
    }

    setLoading(true);

    try {
      if (Platform.OS === 'web') {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const { latitude, longitude } = pos.coords;
            setLocation({ latitude, longitude });
            await processAttendance(latitude, longitude);
            setLoading(false);
          },
          (err) => {
            console.error('Web geolocation error:', err);
            Alert.alert('Error', 'Location access denied on web.');
            setLoading(false);
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to mark attendance.');
        setLoading(false);
        return;
      }

      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        Alert.alert('Location Off', 'Please enable location services to continue.');
        setLoading(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = loc.coords;
      setLocation({ latitude, longitude });
      await processAttendance(latitude, longitude);
    } catch (err) {
      console.error('Error:', err);
      Alert.alert('Error', 'Failed to get current location.');
    }

    setLoading(false);
  };

  const handleSelectLocation = (id) => {
    setSelectedLocationId(id);
    setShowLocationList(false);
  };

  const handleUseCurrentLocation = async () => {
    // Set fetching state to true to show spinner
    setFetchingCurrentLocation(true);
    
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required.');
        return;
      }

      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        Alert.alert('Location Off', 'Please enable location services.');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = loc.coords;
      
      // Update the text input values with the current coordinates
      setNewLatitude(latitude.toString());
      setNewLongitude(longitude.toString());
      
    } catch (err) {
      console.error('Error getting current location:', err);
      Alert.alert('Error', 'Could not retrieve current location.');
    } finally {
      // Make sure to set fetching state back to false when done
      setFetchingCurrentLocation(false);
    }
  };

  const handleAddLocation = async () => {
    if (!newLocationName || !newLatitude || !newLongitude) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    try {
      const res = await fetch(LOCATIONS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationName: newLocationName,
          latitude: newLatitude,
          longitude: newLongitude,
        }),
      });

      if (res.ok) {
        Alert.alert('Success', 'Location added successfully!');
        setNewLocationName('');
        setNewLatitude('');
        setNewLongitude('');

        const updated = await fetch(LOCATIONS_API);
        const data = await updated.json();
        setLocations(data);
      } else {
        const error = await res.text();
        Alert.alert('Error', error || 'Failed to add location.');
      }
    } catch (err) {
      console.error('Add Location Error:', err);
      Alert.alert('Error', 'Unable to add location.');
    }
  };

  const renderLocationItem = ({ item }) => (
    <Pressable
      style={styles.locationItem}
      onPress={() => handleSelectLocation(item.location_Id.toString())}
    >
      <Text style={styles.locationItemText}>{item.locationName}</Text>
    </Pressable>
  );

  console.log("Fetched locations:", locations);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Mark Your Attendance</Text>
          <Text style={styles.subtitle}>Select your location and mark attendance</Text>
        </View>

        {/* Location Selection */}
<View style={styles.cardContainer}>
  <Text style={styles.cardTitle}>Location Selection</Text>

  <View style={styles.pickerContainer}>
    <Picker
      selectedValue={selectedLocationId}
      onValueChange={(itemValue) => {
        console.log("Selected location ID:", itemValue);
        setSelectedLocationId(itemValue);
      }}
      mode="dropdown" 
      itemStyle={{ 
        color: 'black', 
        fontSize: 17 
      }}
    >
      <Picker.Item label="Select a location" value="" />
      {locations && locations.length > 0 ? (
        locations.map((loc) => (
          <Picker.Item
            key={loc.location_Id}
            label={loc.locationName}
            value={loc.location_Id.toString()}
          />
        ))
      ) : (
        <Picker.Item label="No locations available" value="" enabled={false} />
      )}
    </Picker>
  </View>

    <TouchableOpacity
      style={[styles.button, !selectedLocationId && styles.buttonDisabled]}
      disabled={!selectedLocationId || loading}
      onPress={handleMarkAttendance}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <Text style={styles.buttonText}>Mark Attendance</Text>
      )}
    </TouchableOpacity>
  </View>

        {/* Add New Location */}
        <View style={styles.cardContainer}>
          <Text style={styles.cardTitle}>Add New Location</Text>

          <TextInput
            style={styles.input}
            placeholder="Location Name"
            value={newLocationName}
            onChangeText={setNewLocationName}
          />
          <TextInput
            style={styles.input}
            placeholder="Latitude"
            keyboardType="decimal-pad"
            value={newLatitude}
            onChangeText={setNewLatitude}
          />
          <TextInput
            style={styles.input}
            placeholder="Longitude"
            keyboardType="decimal-pad"
            value={newLongitude}
            onChangeText={setNewLongitude}
          />

          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#4CAF50', marginBottom: 10 }]}
            onPress={handleUseCurrentLocation}
            disabled={fetchingCurrentLocation}
          >
            {fetchingCurrentLocation ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Use Current Location</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleAddLocation}>
            <Text style={styles.buttonText}>Add Location</Text>
          </TouchableOpacity>
        </View>

        {showLocationList && (
          <View style={styles.locationsList}>
            {fetchingLocations ? (
              <ActivityIndicator size="small" color="#4CAF50" style={styles.loadingIndicator} />
            ) : (
              <FlatList
                data={locations}
                renderItem={renderLocationItem}
                keyExtractor={(item) => item.location_Id.toString()}
                contentContainerStyle={styles.listContent}
              />
            )}
          </View>
        )}
        </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    marginVertical: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
  },
  input: {
    height: 50,
    paddingHorizontal: 16,
    fontSize: 16,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#7647EB',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#C8E6C9',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  locationsList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    maxHeight: 200,
  },
  loadingIndicator: {
    padding: 16,
  },
  listContent: {
    paddingVertical: 8,
  },
  locationItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  locationItemText: {
    fontSize: 16,
    color: '#333',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
});