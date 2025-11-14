import React, { useEffect } from 'react';
import { Platform, Alert } from 'react-native';

import messaging from '@react-native-firebase/messaging';
import {
  check,
  request,
  requestMultiple,
  PERMISSIONS,
  RESULTS
} from 'react-native-permissions';

import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { store } from './app/redux/store';
import Route from './app/navigation/Route';
import { UserProvider } from './app/context/UserContext';

export default function App() {

  // -----------------------------
  //  REQUEST LOCATION PERMISSIONS
  // -----------------------------
  const requestLocationPermission = async () => {
    if (Platform.OS === 'ios') {
      const result = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
      console.log("iOS location permission:", result);
      return;
    }

    const fine = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
    const coarse = await request(PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION);

    console.log("Fine:", fine, "Coarse:", coarse);

    // ❌ DO NOT request background automatically
    // Android will force open the settings page every time.
  };

  // -----------------------------
  //  REQUEST CAMERA & MEDIA PERMISSIONS
  // -----------------------------
  const requestCameraAndMedia = async () => {
    if (Platform.OS === "android") {
      await requestMultiple([
        PERMISSIONS.ANDROID.CAMERA,
        PERMISSIONS.ANDROID.READ_MEDIA_IMAGES,
      ]);
    } else {
      await request(PERMISSIONS.IOS.CAMERA);
      await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
    }
  };


  // -----------------------------
  //  REQUEST NOTIFICATION PERMISSION
  // -----------------------------
  async function requestNotificationPermission() {
    const status = await messaging().requestPermission();

    const enabled =
      status === messaging.AuthorizationStatus.AUTHORIZED ||
      status === messaging.AuthorizationStatus.PROVISIONAL;

    console.log("Notification permission:", enabled ? "enabled" : "disabled");
  }


  // -----------------------------
  //  ON APP START
  // -----------------------------
  useEffect(() => {
    requestLocationPermission();
    requestCameraAndMedia();
    requestNotificationPermission();
  }, []);


  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1 }}>
          <Provider store={store}>
            <UserProvider>
              <Route />
            </UserProvider>
          </Provider>
        </SafeAreaView>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
