import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import MapScreen from './components/MapScreen';
import { View, Text, StyleSheet } from 'react-native';

const Stack = createStackNavigator();

export default function App() {
  const [locationPermission, setLocationPermission] = useState(null);
  const [backgroundLocationPermission, setBackgroundLocationPermission] = useState(null);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Map">
        <Stack.Screen 
          name="Map" 
          component={MapScreen} 
          options={{ title: 'School Bus Tracker' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});