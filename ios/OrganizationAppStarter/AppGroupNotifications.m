#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(AppGroupNotifications, NSObject)

RCT_EXTERN_METHOD(getAndClear:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
