import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import * as AppAmbit from 'appambit';
import * as PushNotifications from 'appambit-push-notifications';
import { NotificationsProvider } from './src/context/NotificationsContext';

function App(): React.JSX.Element {
  AppAmbit.start('eac66741-7659-45c2-aa29-be2d962fd902');
  PushNotifications.start();

  return (
    <SafeAreaProvider>
      <NotificationsProvider>
        <AppNavigator />
      </NotificationsProvider>
    </SafeAreaProvider>
  );
}

export default App;
