# Testing Guide - Uber Order Filter

Step-by-step guide to test the app and verify all features work correctly.

---

## Part 1: Development Setup

### 1.1 Install Dependencies

```bash
cd app
npm install
```

### 1.2 Run on iOS Simulator

```bash
# Start Expo development server
npx expo start

# Press 'i' for iOS
# Or run directly:
npx react-native run-ios
```

### 1.3 Verify App Loads

You should see:
- Bottom tab navigation (Home, Filters, History, Settings)
- Home screen with "Order Queue"
- "No orders at the moment" message

---

## Part 2: Basic Flow Testing

### Test 1: Create a Filter

**Steps:**
1. Go to **Filters** tab
2. Tap "+ New Filter"
3. Enter:
   - Filter Name: "Test Filter"
   - Min Price: "$8"
   - Max Distance: "3 miles"
4. Tap "Create"

**Expected Result:**
- ✅ Filter appears in list
- ✅ Filter is marked as "Active"
- ✅ Green left border on active filter

---

### Test 2: View Demo Orders

**Steps:**
1. Go to **Home** tab
2. Notice sample orders in the queue:
   - Chipotle $12.50, 2.1 mi
   - McDonald's $5.50, 8.5 mi
   - Sushi Palace $18.00, 1.5 mi

**Expected Result:**
- ✅ Orders display with price, distance, restaurant
- ✅ Recommendation badges show (✓ Good / ✗ Poor)
- ✅ Score displayed (0-100)

---

### Test 3: Accept/Reject Orders

**Steps:**
1. On Home screen, tap "Accept" on Chipotle order
2. Notice order disappears
3. Tap "Reject" on remaining order

**Expected Result:**
- ✅ Orders removed from queue
- ✅ Decision logged to history

---

### Test 4: Check History

**Steps:**
1. Go to **History** tab
2. You should see:
   - "Today" tab: Today's decisions
   - "Weekly" tab: Weekly breakdown
   - "History" tab: All decisions

**Expected Result:**
- ✅ Stats show: Total Orders, Accepted, Rejected, Earnings
- ✅ Decision details appear with timestamps

---

### Test 5: Adjust Settings

**Steps:**
1. Go to **Settings** tab
2. Toggle "Enable Audio Alerts"
3. Change "Alert Volume" to 75%
4. Change "Alert Type" to "Chime"
5. Toggle "Vibration"

**Expected Result:**
- ✅ Settings update and persist
- ✅ No crashes on toggle

---

## Part 3: iOS OCR Testing

### Test 6: OCR Service Status

**Steps:**
1. Go to **Home** tab
2. Look at top-right corner for OCR status badge

**Expected Result:**
- 📸 Shows "📸 Listening" (green) if OCR is active
- 📸 Shows "Paused" (red) if OCR stopped

**Troubleshooting:**
- If shows error: "OCR Service not available"
  - Check iOS setup guide
  - Verify Vision.framework is linked
  - Rebuild with: `npx react-native run-ios --clean`

---

### Test 7: Screenshot Detection (Simulator)

**Steps:**
1. Ensure app is in foreground
2. Take simulator screenshot:
   - Mac: ⌘ + S
   - Or: Press Volume Up + Power (if simulating)
3. Look at app console for output

**Expected Output:**
```
📸 Screenshot detected
🔍 Processing screenshot with OCR...
📝 Recognized: 'Chipotle' (confidence: 0.98)
📝 Recognized: '$12.50' (confidence: 0.95)
...
Not an order screenshot, skipping
```

---

### Test 8: Screenshot Detection (Real Device)

**Steps:**
1. Deploy app to iPhone
2. Have Uber app open (or screenshot with order text)
3. Take screenshot (Volume Up + Power)
4. Return to our app
5. Check console

**Expected Result:**
- ✅ Order detected and added to queue
- ✅ Filter applied automatically
- ✅ Recommendation shown
- ✅ Audio alert plays (if enabled)

---

## Part 4: Filter Evaluation Testing

### Test 9: Order Recommendation Logic

**Create multiple filters and test:**

**Filter 1: High Standards**
- Min Price: $15
- Max Distance: 2 miles
- → McDonald's $5.50 = ❌ Poor (price too low)
- → Sushi $18 = ✅ Good

**Filter 2: Flexible**
- Min Price: $5
- Max Distance: 10 miles
- → McDonald's $5.50 = ✅ Good
- → Chipotle $12.50 = ✅ Good

**Expected Result:**
- ✅ Recommendations change based on active filter
- ✅ Poor orders show reasons in red box

---

### Test 10: Restaurant Preferences

**Steps:**
1. Create new filter
2. In advanced settings, add preferred restaurants
3. Notice how recommendations change

**Expected Result:**
- ✅ Preferred restaurants boost recommendation score
- ✅ Excluded restaurants lower score

---

## Part 5: Analytics Testing

### Test 11: Daily Stats

**Steps:**
1. Accept 3 orders
2. Reject 2 orders
3. Go to History → Today tab

**Expected Result:**
- ✅ Total Orders: 5
- ✅ Accepted: 3
- ✅ Rejected: 2
- ✅ Total Earnings: Sum of accepted prices
- ✅ Avg/Order: Earnings ÷ Accepted

---

### Test 12: Weekly View

**Steps:**
1. Go to History → Weekly tab
2. Scroll through multiple days

**Expected Result:**
- ✅ Each day shows breakdown
- ✅ Stats update as you add decisions
- ✅ Earnings calculated correctly

---

## Part 6: Edge Cases & Error Handling

### Test 13: Empty States

**Steps:**
1. Delete all filters (Settings → Clear All Data)
2. Return to Home screen

**Expected Result:**
- ✅ Warning message: "No active filter"
- ✅ Recommendations not shown
- ✅ No crash

---

### Test 14: No Orders

**Steps:**
1. Reject all orders in queue
2. Observe empty state

**Expected Result:**
- ✅ Shows "📭 No orders at the moment"
- ✅ App ready for new orders

---

### Test 15: Settings Clear All Data

**Steps:**
1. Create filters and decisions
2. Settings → "🗑 Clear All Data"
3. Tap "Clear"
4. Navigate through app

**Expected Result:**
- ✅ All data deleted
- ✅ App resets to initial state
- ✅ No errors or crashes

---

## Part 7: Performance Testing

### Test 16: Large Dataset

**Steps:**
1. Create 50+ decisions (manually or via debug)
2. Go to History → History tab
3. Scroll through entire list
4. Switch tabs rapidly

**Expected Result:**
- ✅ No lag or stuttering
- ✅ Smooth scrolling
- ✅ Tab switching is fast

---

### Test 17: Memory Usage

**Steps:**
1. Monitor app memory in Xcode
2. Add/remove orders repeatedly
3. Monitor Instruments (Allocations)

**Expected Result:**
- ✅ No memory leaks
- ✅ Memory stable at ~50-100MB

---

## Part 8: iOS-Specific Tests

### Test 18: Screenshot Permission

**Steps:**
1. Revoke screenshot permission
2. Try to capture screenshot
3. Grant permission
4. Try again

**Expected Result:**
- ✅ Shows error when no permission
- ✅ Works after granting

---

### Test 19: Background/Foreground

**Steps:**
1. App in foreground, take screenshot
2. Switch to another app
3. Take screenshot
4. Return to app

**Expected Result:**
- ✅ Screenshot detected only when app in foreground
- ✅ No crashes on app switching

---

### Test 20: Device Orientation

**Steps:**
1. Use app in Portrait
2. Rotate to Landscape
3. Take screenshot
4. Rotate back

**Expected Result:**
- ✅ UI adapts to orientation
- ✅ OCR still works
- ✅ No data loss

---

## Checklist for Release

### Critical Features
- [ ] Create filter works
- [ ] Order detection works (iOS)
- [ ] Filter evaluation accurate
- [ ] Audio alerts play
- [ ] History logs correctly
- [ ] Settings persist

### Performance
- [ ] App launches < 3 seconds
- [ ] Navigation smooth (60 FPS)
- [ ] No memory leaks
- [ ] Handles 100+ orders

### Quality
- [ ] No console errors
- [ ] Handles edge cases
- [ ] Clear all data works
- [ ] Proper error messages

### iOS Specific
- [ ] Vision framework linked
- [ ] Bridging header correct
- [ ] Screenshot detection works
- [ ] Permissions handled

---

## Debug Commands

### View Console Logs

```bash
# Real device
xcode-select --print-path
# Then in Xcode: Window > Devices & Simulators > Logs

# Simulator
xcrun simctl spawn booted log stream --level debug
```

### Clear Simulator Data

```bash
xcrun simctl erase all
```

### Reset Simulator Permissions

```bash
xcrun simctl privacy booted reset all
```

---

## Sample Test Data

### Test Orders (Demo)

```json
{
  "orders": [
    {
      "price": 12.50,
      "distance": 2.1,
      "restaurant": "Chipotle",
      "estimatedTime": 18
    },
    {
      "price": 5.50,
      "distance": 8.5,
      "restaurant": "McDonald's",
      "estimatedTime": 35
    },
    {
      "price": 18.00,
      "distance": 1.5,
      "restaurant": "Sushi Palace",
      "estimatedTime": 15
    }
  ]
}
```

### Test Filters

```json
{
  "filters": [
    {
      "name": "Strict",
      "minPrice": 15,
      "maxDistance": 2
    },
    {
      "name": "Flexible",
      "minPrice": 5,
      "maxDistance": 10
    }
  ]
}
```

---

## Known Issues & Workarounds

### Issue: OCR gives low confidence

**Workaround:** Increase screenshot quality or adjust lighting

### Issue: App crashes on filter delete

**Workaround:** Check that active filter isn't deleted

### Issue: Orders not appearing

**Workaround:** Verify filter is active and has criteria set

---

## Success Metrics

✅ **All tests pass**: Ready for beta  
✅ **No crashes**: Stable build  
✅ **Accurate OCR**: >90% order detection  
✅ **Smooth UI**: 60 FPS on all screens  

---

**Test Date:** [Your Date]  
**Tester:** [Your Name]  
**Result:** ✅ PASS / ⚠️ NEEDS FIXES
