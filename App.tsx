import React from 'react';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { APPAMBIT_APP_KEY_ANDROID, APPAMBIT_APP_KEY_IOS } from '@env';
import { AppNavigator } from './src/navigation/AppNavigator';
import * as AppAmbit from 'appambit';
import * as PushNotifications from 'appambit-push-notifications';
import { NotificationsProvider } from './src/context/NotificationsContext';
import { AuthProvider } from './src/context/AuthContext';

const APP_KEY = Platform.OS === 'ios' ? APPAMBIT_APP_KEY_IOS : APPAMBIT_APP_KEY_ANDROID;

function App(): React.JSX.Element {
  AppAmbit.start(APP_KEY);
  PushNotifications.start();

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NotificationsProvider>
          <AppNavigator />
        </NotificationsProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

export default App;
