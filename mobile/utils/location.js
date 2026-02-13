import { Platform } from 'react-native';
import * as Location from 'expo-location';

// Function to get location permissions
export const requestLocationPermissions = async () => {
  try {
    // Request foreground location permission
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    
    if (foregroundStatus !== 'granted') {
      console.error('Foreground location permission not granted');
      return { success: false, error: 'Foreground location permission not granted' };
    }

    // Request background location permission (iOS only)
    let backgroundStatus = null;
    if (Platform.OS === 'ios') {
      const bgResult = await Location.requestBackgroundPermissionsAsync();
      backgroundStatus = bgResult.status;
      
      if (backgroundStatus !== 'granted') {
        console.warn('Background location permission not granted (iOS)');
      }
    }

    return { 
      success: true, 
      foregroundGranted: foregroundStatus === 'granted',
      backgroundGranted: Platform.OS === 'ios' ? backgroundStatus === 'granted' : true
    };
  } catch (error) {
    console.error('Error requesting location permissions:', error);
    return { success: false, error: error.message };
  }
};

// Function to get current location
export const getCurrentLocation = async () => {
  try {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
      timeInterval: 5000, // Update every 5 seconds
      distanceInterval: 5, // Minimum distance interval in meters
    });
    
    return {
      success: true,
      location: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: location.timestamp,
      }
    };
  } catch (error) {
    console.error('Error getting current location:', error);
    return { success: false, error: error.message };
  }
};

// Function to watch position (for continuous tracking)
export const watchPosition = async (callback) => {
  try {
    const subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000, // Update every 5 seconds
        distanceInterval: 5, // Minimum distance interval in meters
      },
      callback
    );
    
    return subscription;
  } catch (error) {
    console.error('Error watching position:', error);
    return null;
  }
};

// Calculate distance between two points (Haversine formula)
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
};