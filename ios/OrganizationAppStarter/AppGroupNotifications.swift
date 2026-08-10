import Foundation
import React

/// Reads notifications the NotificationServiceExtension stashed in shared
/// App Group storage while the app was killed/backgrounded, so the JS
/// notification history can include them (mirrors Android's headless-JS
/// AsyncStorage write path).
@objc(AppGroupNotifications)
class AppGroupNotifications: NSObject {

  private let appGroupID = "group.com.AppAmbit.TestAppSwift"
  private let storageKey = "com.appambit.pendingNotifications"

  @objc static func requiresMainQueueSetup() -> Bool {
    return false
  }

  @objc(getAndClear:rejecter:)
  func getAndClear(_ resolve: @escaping RCTPromiseResolveBlock,
                   rejecter reject: @escaping RCTPromiseRejectBlock) {
    guard let defaults = UserDefaults(suiteName: appGroupID) else {
      resolve("[]")
      return
    }

    let list = (defaults.array(forKey: storageKey) as? [[String: Any]]) ?? []
    if !list.isEmpty {
      defaults.removeObject(forKey: storageKey)
      defaults.synchronize()
    }

    guard let jsonData = try? JSONSerialization.data(withJSONObject: list),
          let json = String(data: jsonData, encoding: .utf8) else {
      resolve("[]")
      return
    }
    resolve(json)
  }
}
