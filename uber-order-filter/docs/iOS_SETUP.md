# iOS Setup Guide - OCR Native Module

Complete guide to integrate the native OCR service with the React Native app.

## Overview

The iOS implementation uses Apple's **Vision Framework** for on-device optical character recognition (OCR). This allows the app to detect Uber orders by analyzing screenshots.

### Key Features
- ✅ On-device processing (no cloud required)
- ✅ Automatic screenshot detection
- ✅ ML-based text recognition
- ✅ Real-time order extraction
- ✅ Privacy-first approach

---

## Prerequisites

- Xcode 13+ (for Vision framework support)
- iOS 15+ target
- CocoaPods or native Swift integration
- React Native 0.71+

---

## Step 1: Add Swift Files to Xcode

### 1.1 Create Swift Module

In Xcode:
1. File → New → File...
2. Select "Swift File"
3. Name it: `OCRService.swift`
4. Add to target: `[your-app-name]`
5. Choose "Create Bridging Header" if prompted

### 1.2 Copy Swift Code

Replace the content with the implementation from:
```
uber-order-filter/ios/UberOrderFilter/OCRService.swift
```

The file includes:
- `OCRService` - Main service class
- `OCRServiceBridge` - React Native bridge

### 1.3 Add Bridging Header

If not created automatically:
1. File → New → File...
2. Select "Header File"
3. Name it: `UberOrderFilter-Bridging-Header.h`

Copy content from:
```
uber-order-filter/ios/UberOrderFilter/UberOrderFilter-Bridging-Header.h
```

---

## Step 2: Configure Xcode Build Settings

### 2.1 Update Bridging Header Path

In Xcode project settings:
1. Select project → Build Settings
2. Search for "Bridging Header"
3. Set value to: `UberOrderFilter/UberOrderFilter-Bridging-Header.h`

### 2.2 Enable Vision Framework

1. Select target → Build Phases
2. Link Binary with Libraries
3. Click "+"
4. Add: `Vision.framework`
5. Make sure it's marked as "Required"

### 2.3 Update Swift Language Version

1. Build Settings → Search "Swift Language"
2. Set to: "Swift 5.8" or higher

---

## Step 3: Update package.json Dependencies

Make sure these are installed:

```bash
cd app
npm install @react-native-camera/camera react-native-permissions
npm install
```

---

## Step 4: Add iOS Permissions

### 4.1 Update Info.plist

Add these keys to `ios/[ProjectName]/Info.plist`:

```xml
<key>NSPhotoLibraryUsageDescription</key>
<string>We need access to your photos to process order screenshots</string>

<key>NSCameraUsageDescription</key>
<string>We need camera access to detect Uber orders</string>

<key>NSLocalNetworkUsageDescription</key>
<string>Used to communicate with Uber for order detection</string>

<key>NSBonjourServiceTypes</key>
<array>
  <string>_http._tcp</string>
  <string>_ws._tcp</string>
</array>
```

---

## Step 5: Test Integration

### 5.1 Build and Run

```bash
cd app
npx react-native run-ios
```

### 5.2 Verify Native Module

In React Native console, you should see:
```
✓ App initialized
✓ OCR monitoring started
📸 Monitoring screenshots...
```

### 5.3 Test Screenshot Detection

1. Open the app on your iPhone
2. Open Uber driver app (or a screenshot with order-like text)
3. Take a screenshot (Volume Up + Power buttons)
4. Check app console:
   ```
   📸 Screenshot detected
   🔍 Processing screenshot with OCR...
   📝 Recognized: '[Order text]'
   ✓ Order detected: { price: 12.50, distance: 2.1, ... }
   ```

---

## Step 6: Verify in App UI

### Home Screen Status

You should see an OCR status badge in the top-right:
- 🟢 **📸 Listening** - OCR service is active
- 🔴 **Paused** - OCR service stopped

### Live Order Detection

When a screenshot is detected:
1. Order appears in "Order Queue"
2. Filter is applied (if active)
3. Recommendation is shown (✅ Good / ❌ Poor)
4. Audio alert plays (if poor)

---

## Step 7: Permissions & User Setup

### User Must Enable Screenshots

Users need to:
1. Open Settings → Privacy & Security
2. Check if app has access to screenshots
3. Grant permission if prompted

### Troubleshooting Permissions

If permissions fail:
```bash
# Reset permissions
xcrun simctl io booted terminate app.notification
xcrun simctl privacy booted reset all com.uberfiler
```

---

## API Reference

### NativeModules.OCRService

#### processImage(imagePath: string): Promise<OCRResult[]>

Process a single image and extract text.

```typescript
const results = await NativeModules.OCRService.processImage('/path/to/image.png');
// Returns: [
//   { text: "Chipotle", confidence: 0.98 },
//   { text: "$12.50", confidence: 0.95 },
//   { text: "2.1 mi", confidence: 0.94 }
// ]
```

#### startMonitoring(callback: (imagePath: string) => void): Promise<void>

Start listening for screenshots.

```typescript
await NativeModules.OCRService.startMonitoring((imagePath) => {
  console.log('Screenshot captured:', imagePath);
});
```

#### stopMonitoring(): Promise<void>

Stop listening for screenshots.

```typescript
await NativeModules.OCRService.stopMonitoring();
```

#### captureScreenshot(): Promise<string>

Manually capture current screen.

```typescript
const imagePath = await NativeModules.OCRService.captureScreenshot();
console.log('Screenshot saved to:', imagePath);
```

---

## useOCRService Hook

Custom React hook to manage OCR lifecycle.

```typescript
import { useOCRService } from './hooks/useOCRService';

export const MyComponent = () => {
  const {
    isMonitoring,        // boolean - is OCR active
    lastScreenshot,      // string | null - last screenshot path
    error,              // string | null - error message
    startMonitoring,    // () => Promise<void>
    stopMonitoring,     // () => Promise<void>
    captureScreenshot,  // () => Promise<string | null>
    processScreenshot,  // (path: string) => Promise<UberOrder | null>
  } = useOCRService((order) => {
    console.log('Order detected:', order);
  });

  return (
    <View>
      <Text>{isMonitoring ? '📸 Listening' : 'Paused'}</Text>
      {error && <Text>Error: {error}</Text>}
    </View>
  );
};
```

---

## Troubleshooting

### Issue: "OCR Service not available"

**Solution:**
1. Verify `Vision.framework` is linked in Build Phases
2. Check Bridging Header path in Build Settings
3. Rebuild: `npx react-native run-ios --clean`

### Issue: Screenshots not detected

**Solution:**
1. Grant screenshot permission in Settings
2. Verify app is in foreground when taking screenshot
3. Check console for errors

### Issue: Text not recognized

**Common Causes:**
- Low quality screenshot
- Text too small
- Different language (app is configured for English)

**Solution:**
- Take clear screenshots
- Ensure Uber text is visible and readable
- Check OCR confidence scores

### Issue: App crashes on OCRService call

**Solution:**
1. Verify NativeModules import is correct
2. Check that methods are @objc annotated in Swift
3. Verify method signatures match React Native expectations

---

## Advanced Configuration

### Custom Language Recognition

To add multiple languages:

In `OCRService.swift`, update:

```swift
recognizeTextRequest.recognitionLanguages = ["en-US", "es", "fr"]
```

### Confidence Threshold

To filter low-confidence results:

In `ocrService.ts`, update:

```typescript
const results = ocrResults.filter(r => r.confidence > 0.85);
```

### Performance Optimization

For better performance:

```swift
// Reduce image resolution before processing
let scaledImage = image.scaled(toSize: CGSize(width: 640, height: 480))
```

---

## Data Flow Diagram

```
Uber App
    ↓
User takes screenshot
    ↓
iOS Screenshot Notification
    ↓
useOCRService Hook
    ↓
OCRServiceBridge (React Native)
    ↓
OCRService.swift (Vision Framework)
    ↓
VNRecognizeTextRequest (ML text detection)
    ↓
OCR Results { text, confidence }
    ↓
parseOrderFromOCR()
    ↓
UberOrder { price, distance, restaurant, ... }
    ↓
HomeScreen - Add to queue + Evaluate filter
    ↓
Audio Alert + Recommendation shown
```

---

## Security & Privacy

✅ **All processing is local**
- No cloud storage
- No API calls to external services
- No data collection

✅ **Screenshot privacy**
- Screenshots are deleted after processing
- Stored only in temp directory
- Never sent to Uber or third parties

---

## Next Steps

1. ✅ Native module setup complete
2. 🔄 Test with real Uber app
3. 📊 Gather feedback on order detection accuracy
4. 🚀 Beta testing with driver community

---

## Support & Debugging

### Enable Debug Logging

```typescript
// In app/src/App.tsx
import { enableDebugLogging } from './services/ocrService';
enableDebugLogging(true);
```

### Check Native Logs

```bash
# iOS device logs
xcrun simctl spawn booted log stream --predicate 'process == "[app-name]"' --level debug
```

### Report Issues

Include:
1. iOS version
2. App version
3. Console output
4. Screenshot that failed to process

---

**Status:** ✅ Ready for Beta  
**Updated:** 2026-08-10  
**iOS Target:** iOS 15+
