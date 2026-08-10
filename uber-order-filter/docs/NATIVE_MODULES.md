# Native Modules Implementation

This document explains how to implement the native modules required for order detection on Android and iOS.

## Overview

The app uses two different approaches to detect Uber orders:
- **Android**: Accessibility Service (native Android API)
- **iOS**: Vision Framework with OCR (native iOS API)

Both approaches require native code implementation since React Native doesn't have built-in APIs for these features.

---

## Android: Accessibility Service Implementation

### What It Does
Listens for notifications from the Uber app and extracts order details using Android's Accessibility API.

### Setup Steps

1. **Create Native Module**
```typescript
// android/app/src/main/java/com/uberfiler/AccessibilityService.java

import android.accessibilityservice.AccessibilityService;
import android.accessibilityservice.AccessibilityServiceInfo;
import android.view.accessibility.AccessibilityEvent;
import android.view.accessibility.AccessibilityNodeInfo;

public class UberAccessibilityService extends AccessibilityService {
  @Override
  protected void onServiceConnected() {
    AccessibilityServiceInfo info = new AccessibilityServiceInfo();
    info.flags = AccessibilityServiceInfo.DEFAULT;
    info.packageNames = new String[]{"com.ubercab"};
    info.eventTypes = AccessibilityEvent.TYPES_ALL_MASK;
    setServiceInfo(info);
  }

  @Override
  public void onAccessibilityEvent(AccessibilityEvent event) {
    if (event.getPackageName().toString().equals("com.ubercab")) {
      String text = getText(event);
      // Send to React Native bridge
      sendEventToReactNative(text);
    }
  }

  private String getText(AccessibilityEvent event) {
    StringBuilder sb = new StringBuilder();
    for (CharSequence s : event.getText()) {
      sb.append(s);
    }
    return sb.toString();
  }

  @Override
  public void onInterrupt() {}
}
```

2. **Register in AndroidManifest.xml**
```xml
<service
  android:name=".UberAccessibilityService"
  android:permission="android.permission.BIND_ACCESSIBILITY_SERVICE">
  <intent-filter>
    <action android:name="android.accessibilityservice.AccessibilityService" />
  </intent-filter>
  <meta-data
    android:name="android.accessibilityservice"
    android:resource="@xml/accessibility_service_config" />
</service>
```

3. **Create React Native Bridge**
```typescript
// android/app/src/main/java/com/uberfiler/AccessibilityServiceModule.java

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;

public class AccessibilityServiceModule extends ReactContextBaseJavaModule {
  public AccessibilityServiceModule(ReactApplicationContext context) {
    super(context);
  }

  @Override
  public String getName() {
    return "AccessibilityService";
  }

  @ReactMethod
  public void startListening(Callback callback) {
    // Start listening to accessibility events
    // Send events back via callback
  }

  @ReactMethod
  public void stopListening() {
    // Stop listening
  }

  @ReactMethod
  public void checkPermission(Promise promise) {
    boolean enabled = isAccessibilityServiceEnabled();
    promise.resolve(enabled);
  }
}
```

4. **Usage in React Native**
```typescript
import { NativeModules } from 'react-native';

const { AccessibilityService } = NativeModules;

// Check if enabled
const isEnabled = await AccessibilityService.checkPermission();

// Start listening for events
AccessibilityService.startListening((text: string) => {
  const order = parseOrderFromText(text);
  onOrderDetected(order);
});
```

---

## iOS: Vision Framework + OCR Implementation

### What It Does
Detects when Uber order notifications appear and extracts text using Apple's Vision framework for on-device ML text detection.

### Setup Steps

1. **Create Swift Native Module**
```swift
// ios/RCTOCRService.swift

import Vision
import Foundation
import React

@objc(RCTOCRService)
class RCTOCRService: NSObject {
  
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }
  
  @objc
  func processImage(_ imagePath: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    guard let image = UIImage(contentsOfFile: imagePath) else {
      reject("IMAGE_ERROR", "Could not load image", nil)
      return
    }
    
    guard let cgImage = image.cgImage else {
      reject("IMAGE_ERROR", "Could not get CGImage", nil)
      return
    }
    
    let requestHandler = VNImageRequestHandler(cgImage: cgImage)
    let request = VNRecognizeTextRequest { request, error in
      guard error == nil else {
        reject("OCR_ERROR", "Text recognition failed", error)
        return
      }
      
      var results: [[String: Any]] = []
      for observation in request.results as? [VNRecognizedTextObservation] ?? [] {
        let text = observation.topCandidates(1).first?.string ?? ""
        let confidence = observation.confidence
        results.append([
          "text": text,
          "confidence": confidence
        ])
      }
      
      resolve(results)
    }
    
    request.recognitionLanguages = ["en-US"]
    
    do {
      try requestHandler.perform([request])
    } catch {
      reject("OCR_ERROR", "Failed to perform text recognition", error)
    }
  }
  
  @objc
  func startMonitoring(_ callback: @escaping RCTResponseSenderBlock) {
    // Listen for screenshot notifications
    NotificationCenter.default.addObserver(
      forName: UIApplication.userDidTakeScreenshotNotification,
      object: nil,
      queue: .main) { _ in
        // Capture screenshot and process
        if let screenshot = self.captureScreenshot() {
          callback([screenshot])
        }
      }
  }
  
  @objc
  func stopMonitoring() {
    NotificationCenter.default.removeObserver(self)
  }
  
  func captureScreenshot() -> String? {
    guard let window = UIApplication.shared.windows.first else {
      return nil
    }
    
    let renderer = UIGraphicsImageRenderer(bounds: window.bounds)
    let image = renderer.image { _ in
      window.drawHierarchy(in: window.bounds, afterScreenUpdates: false)
    }
    
    guard let data = image.pngData() else {
      return nil
    }
    
    let tmpDirectory = FileManager.default.temporaryDirectory
    let imagePath = tmpDirectory.appendingPathComponent("screenshot.png")
    
    do {
      try data.write(to: imagePath)
      return imagePath.path
    } catch {
      return nil
    }
  }
}
```

2. **Register Module in Xcode**

In your `ios/ProjectName/RCTOCRService.m` bridge:

```objc
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(RCTOCRService, NSObject)

RCT_EXTERN_METHOD(
  processImage:(NSString *)imagePath
  resolve:(RCTPromiseResolveBlock)resolve
  reject:(RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  startMonitoring:(RCTResponseSenderBlock)callback
)

RCT_EXTERN_METHOD(stopMonitoring)

@end
```

3. **Usage in React Native**
```typescript
import { NativeModules } from 'react-native';

const { RCTOCRService } = NativeModules;

// Process an image
try {
  const results = await RCTOCRService.processImage('/path/to/image.png');
  console.log(results);
} catch (error) {
  console.error('OCR failed:', error);
}

// Start monitoring screenshots
RCTOCRService.startMonitoring((imagePath: string) => {
  RCTOCRService.processImage(imagePath).then(results => {
    const order = extractOrderFromOCR(results);
    onOrderDetected(order);
  });
});
```

---

## Platform-Specific Considerations

### Android
- **Permissions Required**:
  ```xml
  <uses-permission android:name="android.permission.BIND_ACCESSIBILITY_SERVICE" />
  ```
- **User Must Enable**: User must manually enable the accessibility service in Settings
- **Reliability**: Good, but depends on Uber app UI structure
- **Performance**: Minimal battery drain

### iOS
- **Frameworks Required**: Vision.framework
- **Permissions**: Screenshot detection requires notification monitoring
- **Reliability**: Very good, Vision API is reliable
- **Performance**: Uses on-device ML, minimal network traffic
- **Limitation**: Screenshots are only captured when user takes them or notification appears

---

## Testing

### Android
1. Enable USB Debugging
2. Use `adb` to test:
```bash
adb shell settings put secure enabled_accessibility_services com.uberfiler/com.uberfiler.UberAccessibilityService
```

3. Send test events:
```bash
adb shell input text "Chipotle $12.50 2.1 mi 18 min"
```

### iOS
1. Run in simulator or device
2. Take screenshot while app is running
3. Check console for OCR output

---

## Fallbacks

If native modules fail or aren't available:

1. **Fallback to Manual Input**
   ```typescript
   // User can manually enter order details
   const order = {
     price: 12.50,
     distance: 2.1,
     restaurant: "Chipotle",
     // etc.
   };
   ```

2. **Use Text Input**
   ```typescript
   <TextInput placeholder="Paste order details..." />
   ```

---

## Future Improvements

1. **Machine Learning**: Train ML model on order patterns
2. **Real-time Processing**: Process data stream instead of events
3. **Multi-Platform**: Extend to Web (server-side screenshot analysis)
4. **Privacy**: On-device processing only (no cloud upload)

---

## Resources

- [Android Accessibility Service API](https://developer.android.com/guide/topics/accessibility/accessibility-services)
- [iOS Vision Framework](https://developer.apple.com/documentation/vision)
- [React Native Native Modules](https://reactnative.dev/docs/native-modules-intro)
