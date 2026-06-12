import AppAmbitPushNotificationsExtension
import UserNotifications

/// Persists incoming push payloads to shared App Group storage so the main
/// app's JS layer can list them in the Notifications tab even when the push
/// arrived while the app was killed/backgrounded (mirrors the Android
/// behaviour where the headless JS task writes straight to AsyncStorage).
final class NotificationService: AppAmbitNotificationService {

    private let appGroupID = "group.com.AppAmbit.TestAppSwift"
    private let storageKey = "com.appambit.pendingNotifications"
    private let maxStored = 50

    override func handlePayload(_ notification: AppAmbitNotification,
                                 content: UNMutableNotificationContent) {
        guard let defaults = UserDefaults(suiteName: appGroupID) else { return }

        var entry: [String: Any] = [
            "receivedAt": ISO8601DateFormatter().string(from: Date()),
            "data": stringifyData(notification.data),
        ]
        if let title = notification.title { entry["title"] = title }
        if let body = notification.body { entry["body"] = body }
        if let imageUrl = notification.imageUrl { entry["imageUrl"] = imageUrl }

        var list = (defaults.array(forKey: storageKey) as? [[String: Any]]) ?? []
        list.insert(entry, at: 0)
        if list.count > maxStored {
            list = Array(list.prefix(maxStored))
        }
        defaults.set(list, forKey: storageKey)
        defaults.synchronize()
    }

    private func stringifyData(_ data: [AnyHashable: Any]) -> [String: String] {
        var result: [String: String] = [:]
        for (key, value) in data {
            guard let key = key as? String, key != "aps" else { continue }
            result[key] = (value as? String) ?? String(describing: value)
        }
        return result
    }
}
