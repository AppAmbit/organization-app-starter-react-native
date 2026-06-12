# AppAmbit
# Organization-app-starter-react-native

A production-ready **React Native** starter app powered by the [AppAmbit](https://appambit.com) platform. It is meant to be cloned and customized: connect it to your own AppAmbit organization, point it at your own CMS content, and you have a fully working content-driven mobile app — feed, content details, notifications, analytics, and theming all wired up from day one.

## Why this starter

Almost all screen content is driven by a remote CMS instead of being hardcoded. UI components are generic renderers for CMS-shaped data, so non-developers can manage the app's content (sections, cards, articles, images, videos, buttons) directly from the AppAmbit dashboard without shipping a new app build. Use this repo as the foundation for your own organization's app — rebrand it, connect your CMS collections, and extend the screens you need.

## Features

- **CMS-driven home feed** (`src/screens/HomeScreen.tsx`): the `feed_carousel` collection defines featured, large, and small card sections, rendered dynamically as horizontal carousels and collections.
- **Rich content detail screens** (`src/screens/ItemDetailScreen.tsx`): resolves `content_details` / `content_detail_items` into ordered blocks — text (rich HTML), images, videos, and call-to-action buttons (`src/components/common/ContentBlock.tsx`).
- **Push notifications** (`appambit-push-notifications`): foreground, opened, and background listeners; on iOS, includes a Notification Service Extension + App Group support so notifications received while the app is killed/backgrounded are captured and surfaced (`src/context/NotificationsContext.tsx`, `src/services/`).
- **Analytics out of the box** (`appambit`): `AppAmbit.trackEvent(...)` tracks key user actions (category selection, content opens, resource opens, video plays, notification opens) automatically across the app.
- **Bottom tab navigation** with a custom animated tab bar (`src/navigation/`): Home, Categories, Resources, Notifications (with unread badge), and About.
- **Resilient CMS data parsing** (`src/utils/contentBlockParser.ts`): normalizers that handle the CMS's loosely-typed responses (fields as strings, arrays, or `{value/key/name/...}` objects; relations as ids, stubs, or fully-expanded objects).

## Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

### Step 1: Connect your AppAmbit organization

This app expects content from your own [AppAmbit](https://appambit.com) organization. Set up your AppAmbit app/CMS collections (`feed_carousel`, `carousel_items`, `content_details`, `content_detail_items`) and configure your app key/credentials so `AppAmbit.start(...)` and `PushNotifications.start()` (in `App.tsx`) point at your organization.

### Step 2: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

### Step 3: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

#### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

#### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

### Step 4: Make it yours

Now that you have the app running, start customizing:

- Update branding, copy, and links in `src/screens/AboutScreen.tsx`.
- Adjust colors and typography in `src/theme/`.
- Populate your AppAmbit CMS collections to control the home feed and content details — no app rebuild required for content changes.
- Extend or add screens under `src/screens/` and wire them up in `src/navigation/`.

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Commands

- `npm start` — start Metro bundler
- `npm run ios` / `npm run android` — build & run on simulator/device (equivalent to `npx react-native run-ios` / `npx react-native run-android`)
- `npm run lint` — eslint (`@react-native` config)
- `npm test` — jest (`@react-native/jest-preset`); single test: `npm test -- <pattern>`

For full documentation on the AppAmbit platform, CMS, and SDKs, see [https://docs.appambit.com](https://docs.appambit.com).

## Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

## Learn More

- [AppAmbit Documentation](https://docs.appambit.com) - learn more about the AppAmbit platform, CMS, and SDKs.
- [AppAmbit on GitHub](https://github.com/AppAmbit) - SDKs and other open source projects.
- [AppAmbit Discord](https://discord.com/invite/nJyetYue2s) - community and support.
- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
