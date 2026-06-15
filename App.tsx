import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import * as AppAmbit from 'appambit';
import * as PushNotifications from 'appambit-push-notifications';
import { NotificationsProvider } from './src/context/NotificationsContext';
import { AuthProvider } from './src/context/AuthContext';

function App(): React.JSX.Element {
  AppAmbit.start('<YOUR-APPKEY>');
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
