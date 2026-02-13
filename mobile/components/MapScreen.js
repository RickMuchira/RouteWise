import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Alert, 
  TouchableOpacity, 
  Modal,
  FlatList,
  SafeAreaView 
} from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { requestLocationPermissions, watchPosition } from '../utils/location';
import { routeService } from '../services/api';
import StudentPicker from './StudentPicker';

const MapScreen = () => {
  const [location, setLocation] = useState(null);
  const [routePoints, setRoutePoints] = useState([]);
  const [currentRoute, setCurrentRoute] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [students, setStudents] = useState([]);
  
  const mapRef = useRef(null);
  const locationSubscription = useRef(null);

  // Initialize location permissions and get students
  useEffect(() => {
    const initLocation = async () => {
      const perms = await requestLocationPermissions();
      if (!perms.success) {
        Alert.alert('Permission Error', perms.error);
        return;
      }
      
      // Get students list
      try {
        const response = await routeService.getStudents();
        setStudents(response.students);
      } catch (error) {
        console.error('Error fetching students:', error);
        Alert.alert('Error', 'Could not load students');
      }
    };

    initLocation();

    // Clean up on unmount
    return () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
    };
  }, []);

  // Start route tracking
  const startTracking = async () => {
    if (isTracking) return;

    // Get user input for route name and bus ID
    const routeName = prompt('Enter route name:');
    const busId = prompt('Enter bus ID:');

    if (!routeName || !busId) {
      Alert.alert('Error', 'Route name and bus ID are required');
      return;
    }

    try {
      // Start a new route via API
      const routeData = {
        name: routeName,
        bus_id: parseInt(busId),
      };

      const response = await routeService.startRoute(routeData);
      if (response.success) {
        setCurrentRoute(response.route);
        setRoutePoints([]);
        setIsTracking(true);

        // Start watching location
        locationSubscription.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 5000, // Update every 5 seconds
            distanceInterval: 5, // Minimum distance interval in meters
          },
          handleNewLocation
        );

        Alert.alert('Success', 'Route tracking started!');
      } else {
        Alert.alert('Error', 'Failed to start route');
      }
    } catch (error) {
      console.error('Error starting route:', error);
      Alert.alert('Error', 'Failed to start route');
    }
  };

  // Handle new location updates
  const handleNewLocation = (newLocation) => {
    const coords = {
      latitude: newLocation.coords.latitude,
      longitude: newLocation.coords.longitude,
      timestamp: newLocation.timestamp,
    };

    setLocation(coords);

    // Add to route points
    const newPoint = {
      id: Date.now().toString(),
      ...coords,
    };
    
    setRoutePoints(prev => [...prev, newPoint]);

    // Save location to backend
    if (currentRoute) {
      routeService.saveLocation({
        route_id: currentRoute.id,
        latitude: coords.latitude,
        longitude: coords.longitude,
      })
      .catch(error => {
        console.error('Error saving location:', error);
      });
    }
  };

  // Stop route tracking
  const stopTracking = async () => {
    if (!isTracking) return;

    try {
      // End the route via API
      await routeService.endRoute({ route_id: currentRoute.id });
      
      setIsTracking(false);
      setCurrentRoute(null);
      
      if (locationSubscription.current) {
        locationSubscription.current.remove();
        locationSubscription.current = null;
      }

      Alert.alert('Success', 'Route ended successfully!');
    } catch (error) {
      console.error('Error stopping route:', error);
      Alert.alert('Error', 'Failed to end route');
    }
  };

  // Mark student pickup
  const markPickup = () => {
    if (!currentRoute || routePoints.length === 0) {
      Alert.alert('Error', 'No active route or location available');
      return;
    }

    setModalVisible(true);
  };

  // Confirm student pickup
  const confirmPickup = async (student) => {
    if (!location) {
      Alert.alert('Error', 'Current location not available');
      return;
    }

    try {
      // First save the current location as a route point
      const pointResponse = await routeService.saveLocation({
        route_id: currentRoute.id,
        latitude: location.latitude,
        longitude: location.longitude,
      });

      // Then mark the student pickup
      await routeService.markPickup({
        route_id: currentRoute.id,
        student_id: student.id,
        point_id: pointResponse.point.id,
      });

      Alert.alert('Success', `${student.first_name} ${student.last_name} marked as picked up!`);
      setModalVisible(false);
      setSelectedStudent(null);
    } catch (error) {
      console.error('Error marking pickup:', error);
      Alert.alert('Error', 'Failed to mark student pickup');
    }
  };

  // Fit map to current route
  const fitToRoute = () => {
    if (routePoints.length === 0) return;

    const coordinates = routePoints.map(point => ({
      latitude: point.latitude,
      longitude: point.longitude,
    }));

    if (coordinates.length > 1) {
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    } else if (coordinates.length === 1 && location) {
      mapRef.current.animateToRegion({
        ...coordinates[0],
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: 37.78825, // Default to somewhere reasonable
          longitude: -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
        followsUserLocation={true}
      >
        {/* Current Location Marker */}
        {location && (
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title="Current Location"
            pinColor="blue"
          />
        )}

        {/* Route Polyline */}
        {routePoints.length > 1 && (
          <Polyline
            coordinates={routePoints.map(point => ({
              latitude: point.latitude,
              longitude: point.longitude,
            }))}
            strokeColor="#FF0000"
            strokeWidth={4}
          />
        )}

        {/* Route Points Markers */}
        {routePoints.map((point, index) => (
          <Marker
            key={point.id}
            coordinate={{
              latitude: point.latitude,
              longitude: point.longitude,
            }}
            title={`Point ${index + 1}`}
            pinColor={index === 0 ? '#00FF00' : index === routePoints.length - 1 ? '#0000FF' : '#FF0000'}
          />
        ))}
      </MapView>

      {/* Control Panel */}
      <View style={styles.controlPanel}>
        <TouchableOpacity
          style={[styles.button, isTracking ? styles.activeButton : styles.inactiveButton]}
          onPress={isTracking ? stopTracking : startTracking}
        >
          <Text style={styles.buttonText}>
            {isTracking ? 'Stop Tracking' : 'Start Tracking'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton, !isTracking && styles.disabledButton]}
          onPress={markPickup}
          disabled={!isTracking}
        >
          <Text style={[styles.buttonText, !isTracking && styles.disabledButtonText]}>
            Mark Pickup
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton, !isTracking && styles.disabledButton]}
          onPress={fitToRoute}
          disabled={!isTracking || routePoints.length === 0}
        >
          <Text style={[styles.buttonText, (!isTracking || routePoints.length === 0) && styles.disabledButtonText]}>
            Fit to Route
          </Text>
        </TouchableOpacity>
      </View>

      {/* Student Picker Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Student</Text>
            
            <FlatList
              data={students}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.studentItem}
                  onPress={() => confirmPickup(item)}
                >
                  <Text style={styles.studentName}>
                    {item.first_name} {item.last_name} ({item.grade})
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No students available</Text>
              }
            />

            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  map: {
    flex: 1,
  },
  controlPanel: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeButton: {
    backgroundColor: '#d32f2f',
  },
  inactiveButton: {
    backgroundColor: '#4caf50',
  },
  secondaryButton: {
    backgroundColor: '#2196f3',
  },
  cancelButton: {
    backgroundColor: '#f44336',
    marginTop: 15,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  disabledButtonText: {
    color: '#666666',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    maxHeight: '70%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  studentItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    width: '100%',
  },
  studentName: {
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    padding: 20,
    color: '#666',
  },
});

export default MapScreen;