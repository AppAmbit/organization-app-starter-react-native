# Organization App Starter — React Native

A production-ready **React Native** app powered by [AppAmbit](https://appambit.com). Clone it, point
it at your own AppAmbit organization, import a content set, and you have a working app: home feed,
article screens, auth, push notifications, analytics and theming already wired.

**The app has no hardcoded screens.** Every card, section and article comes from the CMS, so the same build ships as a blog, a movie catalog, a nonprofit app or a training app — see
[`samples/`](samples/). Content changes need no rebuild and no developer.

---

## Quick start

Five steps, ~15 minutes. Assumes the [React Native environment
setup](https://reactnative.dev/docs/set-up-your-environment) is done (Node >= 22.11, Xcode and/or
Android Studio, Ruby >= 2.6.10 for CocoaPods).

### 1. Install

```sh
git clone https://github.com/AppAmbit/organization-app-starter-react-native.git
cd organization-app-starter-react-native
npm install

# iOS only — first clone and after any native dependency change
cd ios && bundle install && bundle exec pod install && cd ..
```

### 2. Create your AppAmbit app and set the keys

Create an app in the [AppAmbit dashboard](https://appambit.com) (one per platform), then:

```sh
cp .env.example .env
```

```
APPAMBIT_APP_KEY_ANDROID=<your android app key>
APPAMBIT_APP_KEY_IOS=<your ios app key>
```

The keys are read via `@env` in [`App.tsx`](App.tsx) and selected per platform — nothing to edit in
code.

### 3. Import content

Without content the feed is empty. [`samples/`](samples/) ships an importable schema plus five
ready-made content sets:

```
samples/schema/content-types.json    ← the 4 content types, import once
samples/datasets/blog.json           ← or movies · nonprofit · fitness · starter-demo
```

**Fastest path — let the AppAmbit MCP server do steps 3 and 4 for you.** Connect it once, paste one
prompt, and content types, all entries with their relations resolved, the auth table and your
`.env` are configured automatically:
[**samples/AUTOMATED-SETUP.md**](samples/AUTOMATED-SETUP.md).

Doing it by hand or want to author your own set? Full walkthrough in
[`samples/README.md`](samples/README.md).

Images are left empty on purpose — the datasets tell you the exact ratio and size each card slot
wants, and `python3 samples/check-images.py <folder>` verifies your art before you upload it. See
[Images](samples/README.md#images).

### 4. Create the auth table

Login/register use AppAmbit's managed database ([`src/services/AuthDB.ts`](src/services/AuthDB.ts)).
One table, in the database linked to your app:

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

There is no separate sessions table — the session token (hashed) and its expiry live on the user
row, 30 days by default ([`SessionService.ts`](src/services/SessionService.ts)).

### 5. Run

```sh
npm start          # Metro, in one terminal
npm run ios        # or: npm run android
```

You should land on the login screen, register an account, and see your imported feed.

---

## Screenshots

Not committed — capture them from your own build so they show your content and branding:

```sh
./samples/screenshots/capture.sh ios home
```

See [`samples/screenshots/README.md`](samples/screenshots/README.md) for the set worth capturing.

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
- **`content_details`** — an ordered list of blocks for a detail screen.
- **`content_detail_items`** — the blocks: `text` (rich HTML), `image`, `video`, `button`.

The renderer table and authoring rules are in [`samples/README.md`](samples/README.md).

---

## What's included

| | |
| --- | --- |
| **CMS-driven feed** | [`HomeScreen`](src/screens/HomeScreen.tsx) + [`feedParser`](src/utils/feedParser.ts) turn `feed_carousel` into featured / large / small sections |
| **Article screens** | [`ItemDetailScreen`](src/screens/ItemDetailScreen.tsx) resolves ordered blocks — rich text, images, video, CTA buttons |
| **Auth** | Email/password over AppAmbit `db()`, hashed with `js-sha256`, 5-day sessions in Keychain ([`AuthContext`](src/context/AuthContext.tsx)) |
| **Push notifications** | Foreground / opened / background listeners, plus an iOS Notification Service Extension + App Group so notifications received while the app is killed are captured ([`NotificationsContext`](src/context/NotificationsContext.tsx)) |
| **Analytics** | `AppAmbit.trackEvent(...)` on content opens, resource opens, video plays, logins, notification opens |
| **Theming** | Light/dark palettes in [`src/theme/`](src/theme/), driven by `useColorScheme()` |
| **Navigation** | Animated bottom tab bar — Home, Categories, Resources, Notifications (unread badge), About, Profile |

> **Note:** `CategoriesScreen` and `ResourcesScreen` are intentionally empty — the tabs are wired
> up, the screens are yours to build.

---

## Make it yours

**Required to ship as your own app:**

- **App keys** — `.env` (step 2 above).
- **App name** — [`app.json`](app.json), `android/app/src/main/res/values/strings.xml` (`app_name`),
  `ios/OrganizationAppStarter/Info.plist` (`CFBundleDisplayName`).
- **Bundle id / package** — `android/app/build.gradle` (`namespace`, `applicationId`, currently
  `com.organizationappstarter`) and, in Xcode, the Bundle Identifier of both the app and the
  `NotificationServiceExtension` target.
- **Icons & splash** — `android/app/src/main/res/mipmap-*/` and
  `ios/OrganizationAppStarter/Images.xcassets/`.
- **Push** — your own `android/app/google-services.json` (Firebase) and iOS push certificates. See
  [Push notifications setup](#push-notifications-setup) below.
- **App Group id** (iOS, only if you keep killed-app notification capture) — `group.com.AppAmbit.TestAppSwift`
  appears in four places and all four must match:
  `ios/OrganizationAppStarter/AppGroupNotifications.swift`,
  `ios/NotificationServiceExtension/NotificationService.swift`, and both `.entitlements` files.

**Optional:**

- Org name, contact and links — `ORG_INFO` in [`AboutScreen.tsx`](src/screens/AboutScreen.tsx).
- Brand colors and type — [`src/theme/`](src/theme/) (`colors.ts`, `typography.ts`, `spacing.ts`).
- Tabs and screens — [`src/navigation/`](src/navigation/), [`src/screens/`](src/screens/).
- Auth fields or social login — [`src/screens/auth/`](src/screens/auth/),
  [`AuthContext.tsx`](src/context/AuthContext.tsx).

---

## Push notifications setup

The app runs fine without this — do it when you want to actually deliver notifications.

### Android

Firebase is the delivery channel, so Android needs a `google-services.json` from **your** Firebase
project. The repo ships a placeholder copy so you can see exactly what is expected and where it
goes:

```
android/app/google-services-example.json   ← reference only, fake values
android/app/google-services.json           ← put YOUR file here (same folder, this exact name)
```

1. [Firebase console](https://console.firebase.google.com/) → your project → **Project settings** →
   **Your apps** → add an Android app.
2. Use the same package name as `applicationId` in
   [`android/app/build.gradle`](android/app/build.gradle) — `com.organizationappstarter` unless you
   changed it. A mismatch here is the usual reason push silently never arrives.
3. Download `google-services.json` and drop it in `android/app/`, replacing the demo file.
4. Rebuild: `npm run android`. The Gradle plugin reads the file at build time, so a Metro reload is
   not enough.

Compare against `google-services-example.json` if the build complains — the `package_name` inside
the file must match your `applicationId`, and `project_id` / `mobilesdk_app_id` / `current_key` must
be your real Firebase values, not the placeholders.

> The file is per-project, not a secret in the password sense (the Android API key is a client
> identifier restricted by package name). Still, it is yours — keep your real one out of forks and
> pull requests.

### iOS

Upload your APNs key/certificate in the AppAmbit dashboard, enable **Push Notifications** and
**Background Modes → Remote notifications** on the app target in Xcode, and — if you keep the
killed-app capture feature — align the App Group id described in
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
samples/                 Importable CMS schema + 5 content sets
android/app/
└── google-services-example.json   Firebase placeholder — replace with your own google-services.json
```

---

## Commands

| Command | Does |
| --- | --- |
| `npm start` | Start Metro |
| `npm run ios` / `npm run android` | Build & run on simulator/device |
| `npm run lint` | ESLint (`@react-native` config) |
| `npm test` | Jest — single test: `npm test -- <pattern>` |
| `npx tsc --noEmit` | Typecheck (lint does not typecheck) |

---

## Troubleshooting

- **Feed is empty** — content not imported, or entries are `draft`; only `published` entries reach
  the SDK. See [`samples/README.md`](samples/README.md).
- **A section shows only one card** — `feed_carousel.carousel` is still a single relation. Switch it
  to a *many* relation in the dashboard.
- **iOS build fails after pulling** — re-run `cd ios && bundle exec pod install`.
- **Anything React Native** — [RN troubleshooting](https://reactnative.dev/docs/troubleshooting).

## Learn more

- [AppAmbit documentation](https://docs.appambit.com) — platform, CMS, SDKs
- [AppAmbit on GitHub](https://github.com/AppAmbit) — SDKs and open source projects
- [AppAmbit Discord](https://discord.com/invite/nJyetYue2s) — community and support
- [React Native docs](https://reactnative.dev)
