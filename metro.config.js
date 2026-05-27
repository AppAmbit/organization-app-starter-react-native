const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

const localSdkRoot = path.resolve(__dirname, '../appambit-sdk-react-native');
const pushPkg = path.join(localSdkRoot, 'push/appambit-push-notifications');
const config = {
  watchFolders: [pushPkg],
  resolver: {
    extraNodeModules: {
      'appambit-push-notifications': pushPkg,
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
