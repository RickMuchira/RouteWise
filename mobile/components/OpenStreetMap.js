import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

const OpenStreetMap = ({ 
  routePoints = [], 
  currentLocation = null, 
  studentPickups = [],
  region = null,
  showsUserLocation = true,
  onMessage = () => {}
}) => {
  // Prepare route points for the map
  const routeCoordinates = routePoints.map(point => [point.latitude, point.longitude]);
  
  // Prepare student pickup points
  const pickupMarkers = studentPickups.map(pickup => ({
    lat: pickup.latitude,
    lng: pickup.longitude,
    title: pickup.studentName || 'Student Pickup'
  }));

  // HTML content for the OpenStreetMap with Leaflet
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>OpenStreetMap</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    body, html {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
    #map {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 100%;
      height: 100%;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    // Initialize the map
    var map = L.map('map').setView([${region?.latitude || 37.78825}, ${region?.longitude || -122.4324}], ${region?.zoom || 13});

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);

    // Add route polyline if available
    ${routeCoordinates.length > 1 ? `
    var routeLine = L.polyline(${JSON.stringify(routeCoordinates)}, {
      color: 'red',
      weight: 4,
      opacity: 0.7
    }).addTo(map);
    
    // Fit bounds to show the entire route
    map.fitBounds(routeLine.getBounds());
    ` : ''}

    // Add route points as markers
    ${routeCoordinates.length > 0 ? `
    ${routeCoordinates.map((coord, index) => `
    L.marker([${coord[0]}, ${coord[1]}])
      .addTo(map)
      .bindPopup('Route Point ${index + 1}');
    `).join('')}
    ` : ''}

    // Add student pickup markers
    ${pickupMarkers.length > 0 ? `
    ${pickupMarkers.map(pickup => `
    L.marker([${pickup.lat}, ${pickup.lng}], { icon: L.divIcon({className: 'student-marker', html: '<div style="background-color: green; border: 2px solid white; border-radius: 50%; width: 16px; height: 16px;"></div>', iconSize: [16, 16]}) })
      .addTo(map)
      .bindPopup('${pickup.title}');
    `).join('')}
    ` : ''}

    // Add current location marker if available and showsUserLocation is true
    ${showsUserLocation && currentLocation ? `
    var currentLocationMarker = L.marker([${currentLocation.latitude}, ${currentLocation.longitude}], {
      icon: L.divIcon({
        className: 'current-location',
        html: '<div style="background-color: blue; border: 2px solid white; border-radius: 50%; width: 20px; height: 20px;"></div>',
        iconSize: [20, 20]
      })
    }).addTo(map);
    
    // Center map on current location
    map.setView([${currentLocation.latitude}, ${currentLocation.longitude}]);
    ` : ''}
    
    // Listen for messages from React Native
    document.addEventListener('message', function(e) {
      var data = JSON.parse(e.data);
      
      if(data.type === 'UPDATE_LOCATION') {
        // Update current location marker
        if(currentLocationMarker) {
          map.removeLayer(currentLocationMarker);
        }
        
        currentLocationMarker = L.marker([data.payload.latitude, data.payload.longitude], {
          icon: L.divIcon({
            className: 'current-location',
            html: '<div style="background-color: blue; border: 2px solid white; border-radius: 50%; width: 20px; height: 20px;"></div>',
            iconSize: [20, 20]
          })
        }).addTo(map);
        
        // Center map on new location
        map.setView([data.payload.latitude, data.payload.longitude]);
      }
      else if(data.type === 'ADD_ROUTE_POINT') {
        // Add a new point to the route
        var newPoint = [data.payload.latitude, data.payload.longitude];
        routeCoordinates.push(newPoint);
        
        // Redraw the route
        if(typeof routeLine !== 'undefined') {
          map.removeLayer(routeLine);
        }
        
        routeLine = L.polyline(routeCoordinates, {
          color: 'red',
          weight: 4,
          opacity: 0.7
        }).addTo(map);
      }
    });
  </script>
</body>
</html>
`;

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        scrollEnabled={false}
        onMessage={onMessage}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});

export default OpenStreetMap;