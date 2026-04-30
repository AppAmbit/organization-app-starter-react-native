import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';

import * as AppAmbit from 'appambit'
import * as PushNotifications from "appambit-push-notifications";

function App(): React.JSX.Element {
  AppAmbit.start("9e113758-b443-4896-b1f0-8fde8f2696ff");
  PushNotifications.start();
  return (
    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>
  );
}

export default App;
