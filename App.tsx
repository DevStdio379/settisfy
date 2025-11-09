import React, { use, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import messaging from '@react-native-firebase/messaging';
import { Alert, Platform } from 'react-native';

import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { store } from './app/redux/store';
import Route from './app/navigation/Route';
import { UserProvider } from './app/context/UserContext';

export default function App() {

  const requestLocationPermission = async () => {
    const permission = Platform.OS === 'ios' ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

    const result = await check(permission);
    if (result === RESULTS.DENIED) {
      const requestResult = await request(permission);
      if (requestResult === RESULTS.GRANTED) {
      } else {
        // Alert.alert("Permission Denied", "Location permission is required to use this feature");
      }
    } else if (result === RESULTS.GRANTED) {
      // Alert.alert("Permission Granted", "Location permission is already granted");
    }
  };

  async function requestUserPermission() {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Authorization status:', authStatus);
    }
  }

  const getFcmToken = async () => {
    const fcmToken = await messaging().getToken();
    if (fcmToken) {
      console.log('Your Firebase Cloud Messaging Token is:', fcmToken);
    } else {
      Alert.alert('FCM Token', 'Failed to get FCM token');
      console.log('Failed to get FCM token');
    }
  }

  useEffect(() => {
    requestLocationPermission();
    requestUserPermission();
    getFcmToken();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1 }}>
          <Provider store={store}>
            <UserProvider>
              <Route/>
            </UserProvider>
          </Provider>
          </SafeAreaView>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
