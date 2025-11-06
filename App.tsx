import React, { use, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import messaging from '@react-native-firebase/messaging';
import { Alert } from 'react-native';

export default function App() {

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
      Alert.alert('FCM Token', fcmToken);
      console.log('Your Firebase Cloud Messaging Token is:', fcmToken);
    } else {
      Alert.alert('FCM Token', 'Failed to get FCM token');
      console.log('Failed to get FCM token');
    }
  }

  useEffect(() => {
    requestUserPermission();
    getFcmToken();
  }, []);

  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}
