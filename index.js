/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { BACKGROUND_NOTIFICATION_TASK } from 'appambit-push-notifications';
import { initDB, saveNotification } from './src/services/NotificationDB';

AppRegistry.registerComponent(appName, () => App);

// Android: handles notifications when the app is fully killed (HeadlessJS task)
AppRegistry.registerHeadlessTask(
  BACKGROUND_NOTIFICATION_TASK,
  () => async (payload) => {
    await initDB();
    saveNotification(payload, 'background');
  },
);
