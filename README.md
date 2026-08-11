<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://assets.appambit.com/logo-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://assets.appambit.com/logo-light.svg">
    <img src="https://assets.appambit.com/logo-light.svg" alt="AppAmbit" width="280">
  </picture>
</p>

<h1 align="center">Organization App Starter - React Native</h1>

<p align="center">
  A production-ready React Native app powered by <a href="https://appambit.com">AppAmbit</a>.<br>
  Clone it, point it at your own AppAmbit organization, import a content set, and you have a working
  app: home feed, article screens, auth, push notifications, analytics and theming already wired.
</p>

<p align="center">
  <a href="https://reactnative.dev"><img alt="React Native" src="https://img.shields.io/badge/React_Native-0.85-61DAFB?logo=react&logoColor=white&labelColor=1a1a1a"></a>
  <a href="https://www.typescriptlang.org"><img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white&labelColor=1a1a1a"></a>
  <a href="samples/"><img alt="CMS-driven" src="https://img.shields.io/badge/content-CMS--driven-F59220?labelColor=1a1a1a"></a>
  <a href="https://docs.appambit.com"><img alt="AppAmbit Docs" src="https://img.shields.io/badge/AppAmbit-docs-26A7DF?labelColor=1a1a1a"></a>
  <a href="https://discord.com/invite/nJyetYue2s"><img alt="Discord" src="https://img.shields.io/badge/Discord-join-5865F2?logo=discord&logoColor=white&labelColor=1a1a1a"></a>
</p>

---

## What this is

**The app has no hardcoded screens.** Every card, section and article page comes from the CMS.

- One codebase in this repo as a blog, a cinema billboard, a nonprofit app or a training app.
- Changing content needs no rebuild and no developer.
- Five ready-made content sets are in [`samples/`](samples/) — import one and the app fills up.

<table>
  <tr>
    <td width="50%"><img alt="Home feed" src="samples/screenshots/movies/feed%20-%204.png"></td>
    <td width="50%"><img alt="Detail screen" src="samples/screenshots/movies/feed%20-%205.png"></td>
  </tr>
  <tr>
    <td align="center"><em>Home feed — hero carousel + genre rows</em></td>
    <td align="center"><em>Detail screen — image, rich text, CTA button</em></td>
  </tr>
</table>

Same build, different dataset. More captures in [`samples/screenshots/`](samples/screenshots/).

---

## Quick start

Five steps, about 15 minutes.

**Before you start**, have the [React Native environment
setup](https://reactnative.dev/docs/set-up-your-environment) done:

- Node >= 22.11
- Xcode (iOS) and/or Android Studio (Android)
- Ruby >= 2.6.10, for CocoaPods

### 1. Install

```sh
git clone https://github.com/AppAmbit/organization-app-starter-react-native.git
```

```sh
cd organization-app-starter-react-native && npm install
```

iOS only — on first clone, and after any native dependency change:

```sh
cd ios && bundle install && bundle exec pod install && cd ..
```

### 2. Set your app keys

1. Create an app in the [AppAmbit dashboard](https://appambit.com) — **one per platform**.
2. Copy the env template:

   ```sh
   cp .env.example .env
   ```

3. Paste your keys:

   ```
   APPAMBIT_APP_KEY_ANDROID=<your android app key>
   APPAMBIT_APP_KEY_IOS=<your ios app key>
   ```

The keys are read via `@env` in [`App.tsx`](App.tsx) and picked per platform. Nothing to edit in
code.

### 3. Import content

Without content the feed is empty. [`samples/`](samples/) has everything you need:

```
samples/schema/content-types.json    ← the 4 content types, import once
samples/datasets/movies.json         ← or blog · nonprofit · fitness · starter-demo
```

Two ways to load it:

| | What it is | Time |
| --- | --- | --- |
| ⚡ **[Automated](samples/AUTOMATED-SETUP.md)** | Connect the AppAmbit MCP server and paste one prompt. It creates the content types, every entry with its relations resolved, the auth table **and** your `.env` — steps 3 and 4 in one go. | ~5 min |
| ✋ **[Manual](samples/README.md#manual-import)** | Import through the dashboard yourself, step by step. | ~20 min |

> **Images are left empty on purpose.** Each dataset tells you the exact ratio and size every card
> slot wants — see [samples/README.md → Images](samples/README.md#images).

### 4. Create the auth table

Login and register use AppAmbit's managed database
([`src/services/AuthDB.ts`](src/services/AuthDB.ts)). Run this once, in the database linked to your
app:

```sql
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL,
  token TEXT,
  expires_at TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users (email);
```

There is no separate sessions table — the hashed session token and its expiry live on the user row,
30 days by default ([`SessionService.ts`](src/services/SessionService.ts)).

> The automated path in step 3 creates this table for you.

### 5. Run

```sh
npm start
```

```sh
npm run ios
```

You land on the login screen. Register an account and your imported feed appears.

---

## How content drives the UI

Four CMS content types, one relation chain:

```
feed_carousel ──carousel──> carousel_items ──content_detail──┐
      │                                                      ├──> content_details ──> content_detail_items
      └──────────────────────content─────────────────────────┘
```

- **`feed_carousel`** — the home feed sections. `card_type` (`featured` / `large` / `small`) plus
  `is_collection` decide whether a section renders as the hero carousel, a horizontal carousel, or a
  single full-width banner. `display_order` sorts them.
- **`carousel_items`** — the cards inside a section.
- **`content_details`** — an ordered list of blocks for one detail screen.
- **`content_detail_items`** — the blocks themselves: `text` (rich HTML), `image`, `video`, `button`.

Full renderer tables and the authoring rules are in [**samples/README.md**](samples/README.md#how-the-data-drives-the-ui).

---

## What's included

| | |
| --- | --- |
| **CMS-driven feed** | [`HomeScreen`](src/screens/HomeScreen.tsx) + [`feedParser`](src/utils/feedParser.ts) turn `feed_carousel` into featured / large / small sections |
| **Article screens** | [`ItemDetailScreen`](src/screens/ItemDetailScreen.tsx) resolves ordered blocks — rich text, images, video, CTA buttons |
| **Auth** | Email/password over AppAmbit `db`, hashed with `js-sha256`, 30-day sessions stored in the Keychain ([`AuthContext`](src/context/AuthContext.tsx)) |
| **Push notifications** | Foreground / opened / background listeners, plus an iOS Notification Service Extension + App Group so notifications that arrive while the app is killed are still captured ([`NotificationsContext`](src/context/NotificationsContext.tsx)) |
| **Analytics** | `AppAmbit.trackEvent(...)` on content opens, resource opens, video plays, logins, notification opens |
| **Theming** | Light/dark palettes in [`src/theme/`](src/theme/), driven by `useColorScheme()` |
| **Navigation** | Animated bottom tab bar — Home, Categories, Resources, Notifications (unread badge), About, Profile |

> **Note:** `CategoriesScreen` and `ResourcesScreen` are intentionally empty. The tabs are wired up the screens are yours to build.

---

## Make it yours

### Required to ship as your own app

- **App keys** — `.env` ([step 2](#2-set-your-app-keys)).
- **App name** — three files:
  - [`app.json`](app.json)
  - `android/app/src/main/res/values/strings.xml` → `app_name`
  - `ios/OrganizationAppStarter/Info.plist` → `CFBundleDisplayName`
- **Bundle id / package** — currently `com.organizationappstarter`:
  - `android/app/build.gradle` → `namespace` and `applicationId`
  - In Xcode, the Bundle Identifier of **both** the app and the `NotificationServiceExtension`
    target
- **Icons & splash**:
  - `android/app/src/main/res/mipmap-*/`
  - `ios/OrganizationAppStarter/Images.xcassets/`
- **Push credentials** — your own Firebase file and iOS certificates. See
  [Push notifications setup](#push-notifications-setup).
- **App Group id** — iOS only, and only if you keep killed-app notification capture. The id
  `group.com.AppAmbit.TestAppSwift` appears in **five** places and all five must match:
  - `ios/OrganizationAppStarter/OrganizationAppStarter.entitlements`
  - `ios/OrganizationAppStarter/Info.plist`
  - `ios/OrganizationAppStarter/AppGroupNotifications.swift`
  - `ios/NotificationServiceExtension/NotificationServiceExtension.entitlements`
  - `ios/NotificationServiceExtension/NotificationService.swift`

### Optional

- **Org name, contact and links** — `ORG_INFO` in [`AboutScreen.tsx`](src/screens/AboutScreen.tsx)
- **Brand colors and type** — [`src/theme/`](src/theme/) → `colors.ts`, `typography.ts`,
  `spacing.ts`
- **Tabs and screens** — [`src/navigation/`](src/navigation/), [`src/screens/`](src/screens/)
- **Auth fields or social login** — [`src/screens/auth/`](src/screens/auth/),
  [`AuthContext.tsx`](src/context/AuthContext.tsx)

---

## Push notifications setup

The app runs fine without this. Do it when you want to actually deliver notifications.

> See full documentation about Push Notifications in [docs](https://docs.appambit.com/push-notifications/)

### Android

Firebase is the delivery channel, so Android needs a `google-services.json` from **your** Firebase
project. The repo ships a placeholder so you can see exactly what is expected and where it goes:

```
android/app/google-services-example.json   ← reference only, fake values
android/app/google-services.json           ← put YOUR file here (same folder, this exact name)
```

Steps:

1. Open the [Firebase console](https://console.firebase.google.com/) → your project → **Project
   settings** → **Your apps** → add an Android app.
2. Use the same package name as `applicationId` in
   [`android/app/build.gradle`](android/app/build.gradle) — `com.organizationappstarter` unless you
   changed it. **A mismatch here is the usual reason push silently never arrives.**
3. Download `google-services.json` and drop it in `android/app/`, replacing the demo file.
4. Rebuild with `npm run android`. Gradle reads the file at build time, so a Metro reload is not
   enough.

If the build complains, compare against `google-services-example.json`:

- `package_name` inside the file must match your `applicationId`.
- `project_id`, `mobilesdk_app_id` and `current_key` must be your real Firebase values, not the placeholders.

> The file is per-project, not a secret in the password sense the Android API key is a client identifier restricted by package name. Still, it is yours: keep your real one out of forks and pull requests.

### iOS

1. Upload your APNs key or certificate in the AppAmbit dashboard.
2. In Xcode, enable **Push Notifications** and **Background Modes → Remote notifications** on the
   app target.
3. If you keep the killed-app capture feature, align the App Group id in all five files listed in
   [Make it yours](#make-it-yours).

---

## Project structure

```
App.tsx                  Providers: SafeArea > Auth > Notifications > Navigator
src/
├── screens/             Home, ItemDetail, Notifications, About, Profile, auth/
├── components/          Cards, carousels, ContentBlock, RichTextRenderer
├── navigation/          Stack + animated bottom tabs
├── context/             AuthContext, NotificationsContext
├── services/            AuthDB, SessionService, NotificationDB, AppGroupNotifications
├── utils/               feedParser, contentBlockParser, image, validation
├── models/              CMS data model
└── theme/               Colors, spacing, typography
samples/                 Importable CMS schema + 5 content sets + screenshots
android/app/
└── google-services-example.json   Firebase placeholder — replace with your own
```

---

## Commands

| Command | Does |
| --- | --- |
| `npm start` | Start Metro |
| `npm run ios` / `npm run android` | Build and run on simulator/device |
| `npm run lint` | ESLint (`@react-native` config) |
| `npm test` | Jest — single test: `npm test -- <pattern>` |
| `npx tsc --noEmit` | Typecheck (lint does not typecheck) |

---

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| **Feed is empty** | Content was not imported, or entries are `draft` — only `published` reaches the SDK. See [samples/README.md](samples/README.md). |
| **A section shows only one card** | `feed_carousel.carousel` is still a single relation. Switch it to a **many** relation in the dashboard. |
| **Cards render without images** | Expected on a fresh import. Upload art and set `image` / `banner_image` — [Images](samples/README.md#images). |
| **Push never arrives on Android** | The Firebase `package_name` does not match your `applicationId`. |
| **iOS build fails after pulling** | Re-run `cd ios && bundle exec pod install`. |
| **Anything else React Native** | [RN troubleshooting](https://reactnative.dev/docs/troubleshooting). |

---

## Learn more

- [**samples/README.md**](samples/README.md) — the data model, the datasets and the image slots
- [**samples/AUTOMATED-SETUP.md**](samples/AUTOMATED-SETUP.md) — configure the backend with one prompt
- [AppAmbit documentation](https://docs.appambit.com) — platform, CMS, SDKs
- [AppAmbit on GitHub](https://github.com/AppAmbit) — SDKs and open source projects
- [AppAmbit Discord](https://discord.com/invite/nJyetYue2s) — community and support
- [React Native docs](https://reactnative.dev)
