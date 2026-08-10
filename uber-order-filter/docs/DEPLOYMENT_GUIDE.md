# Deployment Guide - Uber Order Filter iOS

Complete step-by-step guide to deploy the app to App Store and TestFlight.

---

## 📋 Pre-Deployment Checklist

### Code Quality
- [ ] All TypeScript files compile without errors
- [ ] No ESLint warnings
- [ ] All unit tests pass
- [ ] No console.errors in production
- [ ] Git history is clean

### iOS Setup
- [ ] Vision.framework linked
- [ ] Bridging header configured
- [ ] Info.plist permissions set
- [ ] Signing certificates valid
- [ ] Provisioning profiles created

### Testing Complete
- [ ] All 20 test scenarios pass
- [ ] OCR accuracy verified (90%+)
- [ ] Performance tested (< 3s launch)
- [ ] Battery impact acceptable
- [ ] Memory usage < 100MB

### Documentation
- [ ] README.md updated
- [ ] iOS_SETUP.md complete
- [ ] TESTING_GUIDE.md verified
- [ ] Release notes prepared
- [ ] Privacy policy reviewed

---

## Phase 1: Pre-Build Validation (30 min)

### Step 1.1: Verify TypeScript Compilation

```bash
cd app

# Check dependencies
npm install

# Compile TypeScript (dry run)
npx tsc --noEmit

# Expected: No errors
```

**If errors occur:**
- Fix type issues in `app/src/`
- Re-run tsc
- Commit fixes

### Step 1.2: Lint Code

```bash
# Run ESLint
npm run lint

# Fix auto-fixable issues
npx eslint . --fix

# Review remaining warnings
```

### Step 1.3: Validate Configuration

```bash
# Check app.json
cat app.json | jq '.expo'

# Verify iOS settings
cat app.json | jq '.expo.ios'

# Expected output:
# {
#   "supportsTabletMode": true,
#   "infoPlist": { ... }
# }
```

### Step 1.4: Check Dependencies

```bash
# List installed packages
npm list

# Check for security vulnerabilities
npm audit

# Expected: No vulnerabilities (or only low-risk)
```

---

## Phase 2: Build Preparation (1 hour)

### Step 2.1: Create App Store Connect Account

**Prerequisites:**
- Apple Developer Account ($99/year)
- Xcode 13+
- macOS 12+

**Steps:**
1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Sign in with Apple ID
3. Click "Agreements, Tax, and Banking"
4. Accept iOS Developer Agreement
5. Complete banking/tax info

### Step 2.2: Create App ID in App Store Connect

```
1. Go to https://appstoreconnect.apple.com
2. Click "Apps" → "+"
3. Select "New App"
4. Fill in:
   - Platform: iOS
   - Name: "Uber Order Filter"
   - Primary Language: English
   - Bundle ID: com.uberfiler.app (or your domain)
   - SKU: UBERFILER-001
   - Category: Productivity
5. Click "Create"
```

### Step 2.3: Configure Signing Certificates

**In Xcode:**
```
1. Open Xcode
2. Xcode → Preferences → Accounts
3. Add your Apple ID
4. Click "Manage Certificates..."
5. Click "+" → "iOS Development"
6. Create certificate
7. Also create "iOS Distribution" certificate
```

### Step 2.4: Create Provisioning Profiles

**Steps:**
1. Go to [Developer.apple.com](https://developer.apple.com)
2. Click "Certificates, Identifiers & Profiles"
3. Select "Identifiers"
4. Click "+"
5. Register App ID: `com.uberfiler.app`
6. Enable required capabilities:
   - Push Notifications (optional)
   - Health Kit (if needed)
7. Create Provisioning Profile for Distribution

### Step 2.5: Update Bundle ID in Xcode

```bash
# Edit app.json
cat > app/app.json << 'EOF'
{
  "expo": {
    "name": "Uber Order Filter",
    "slug": "uber-order-filter",
    "version": "0.1.0",
    "ios": {
      "bundleIdentifier": "com.uberfiler.app"
    }
  }
}
EOF
```

---

## Phase 3: Build for iOS (2 hours)

### Step 3.1: Build with EAS (Easiest Method)

**Install EAS CLI:**
```bash
npm install -g eas-cli

# Login with Expo account
eas login

# Or with Apple ID
eas whoami
```

**Build for TestFlight:**
```bash
cd app

# Build iOS app
eas build --platform ios

# Select:
# - Build type: "App Store"
# - Simulator: No (for real device)
# - Provisioning profile: (select your profile)

# This will:
# ✓ Build the app
# ✓ Sign with certificate
# ✓ Create .ipa file
# ✓ Upload to Apple
```

**Wait for build:** 10-15 minutes

**Expected output:**
```
✓ Build finished
✓ IPA file created
✓ Ready for TestFlight
```

### Step 3.2: Build Locally with Xcode (Alternative)

**Prepare:**
```bash
cd app

# Install dependencies
npm install

# Generate Xcode project
npx expo prebuild --platform ios

# This creates:
# ios/UberOrderFilter.xcworkspace
```

**In Xcode:**
```
1. Open ios/UberOrderFilter.xcworkspace
2. Select Product → Scheme → Release
3. Select Product → Destination → Generic iOS Device
4. Product → Archive
5. Wait for archive to complete
6. Organizer window opens
7. Select your archive → Distribute App
8. Select "App Store Connect"
```

### Step 3.3: Verify Build

```bash
# Check build status
eas build:list

# Expected output:
# Build ID: abc123...
# Platform: iOS
# Status: Finished ✓
# Type: App Store
```

---

## Phase 4: Upload to TestFlight (30 min)

### Step 4.1: Automatic Upload (via EAS)

If using EAS, build automatically uploads to App Store Connect.

**Verify:**
1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Select your app → "TestFlight"
3. Scroll to "iOS Builds"
4. Your build should appear as "Processing"

### Step 4.2: Manual Upload (if needed)

**Using Xcode Organizer:**
```
1. Xcode → Window → Organizer
2. Select your archive
3. Click "Distribute App"
4. Select "App Store Connect"
5. Select team (if multiple)
6. Review and click "Upload"
```

### Step 4.3: Wait for Processing

TestFlight will:
- ✓ Scan for issues
- ✓ Verify certificate
- ✓ Process build (~5-30 min)
- ✓ Make available for testing

**Check status:**
1. App Store Connect → Your App → TestFlight
2. Look for "iOS Builds" section
3. Wait until status is "Ready to Test"

---

## Phase 5: TestFlight Beta Testing (1-2 weeks)

### Step 5.1: Add Testers

**In App Store Connect:**
```
1. Select your app → TestFlight
2. Click "Testers" tab
3. Click "+" → "Internal Testers"
4. Add your team members' email addresses
5. Send invitations
```

### Step 5.2: Distribute Build to Testers

```
1. TestFlight → iOS Builds
2. Select your build
3. Click "TestFlight" section
4. Toggle "Internal Testers" ON
5. Testers will receive TestFlight link
```

### Step 5.3: Gather Feedback

**Ask testers to verify:**
- [ ] App installs and launches
- [ ] All 4 tabs work (Home, Filters, History, Settings)
- [ ] OCR detects orders (iOS)
- [ ] Filter evaluation is accurate
- [ ] Audio alerts work
- [ ] Settings persist
- [ ] No crashes during use
- [ ] Performance is acceptable

**Feedback channels:**
- Email: tamngankevin@gmail.com
- GitHub Issues: Report bugs
- TestFlight Feedback button

### Step 5.4: Fix Issues

If testers find bugs:
1. Fix in code
2. Re-build and upload
3. Increment build number
4. Re-test

---

## Phase 6: App Store Submission (1-2 hours)

### Step 6.1: Prepare App Store Page

**In App Store Connect:**

**1. App Information:**
```
- Name: "Uber Order Filter"
- Subtitle: "Smart order recommendations for drivers"
- Description (up to 4000 chars):
  "Uber Order Filter helps drivers make better decisions.
   
   Features:
   • Smart order recommendations
   • Real-time filtering
   • Audio alerts
   • Decision history & analytics
   
   How it works:
   1. Set your filter criteria (price, distance)
   2. Take screenshot of Uber order
   3. App analyzes and recommends
   4. You decide to accept or reject
   
   Why drivers love it:
   • Saves time making decisions
   • Helps optimize earnings
   • No automation - you stay in control
   • Privacy-first (local data only)"
```

**2. Keywords:**
```
- Uber
- Driver
- Orders
- Recommendations
- Productivity
- Time management
```

**3. Category:**
```
- Primary: Productivity
- Secondary: Business
```

### Step 6.2: Add Screenshots

**Requirements:**
- iPhone 6.7" (largest)
- iPhone 5.5" (fallback)
- 3-10 screenshots per language
- PNG or JPEG

**Screenshots to include:**
1. Home screen with orders
2. Filter setup screen
3. Recommendation (good order)
4. Recommendation (poor order)
5. History/analytics screen
6. Settings screen

**Tools to create:**
```bash
# Use Simulator to capture
# Or create mockups with Figma/Sketch

# Naming: 1_home.png, 2_filters.png, etc.
```

### Step 6.3: Add Preview Video

**Optional but recommended:**
- 15-30 second video
- Show key features
- MP4 format

### Step 6.4: Set Pricing

```
Price Tier: Free
IAP (In-App Purchases): None
Availability: Worldwide
```

### Step 6.5: Privacy Policy

**Required:**
1. Create privacy policy at:
   - https://www.privacypolicygenerator.info/
   
2. Key points:
   - No personal data collection
   - Data stored locally
   - No tracking
   - GDPR compliant

3. Host at: https://yourwebsite.com/privacy

4. Add URL in App Store Connect:
   - App Privacy → Privacy Policy URL

### Step 6.6: Build Submission

```
1. App Store Connect → Your App
2. Scroll to "Build"
3. Click "+" next to "TestFlight Build"
4. Select your build from TestFlight
5. Click "Done"
```

### Step 6.7: Review Information

```
1. Click "Add for Review"
2. Fill out:
   - Export Compliance: No encryption
   - Content Rights: Original content
   - Advertising: No ads
   - Age Rating: 4+ (general audience)
3. Review all information
4. Click "Submit for Review"
```

---

## Phase 7: App Store Review (3-5 days)

### Step 7.1: Monitor Review Status

```
App Store Connect → Your App → Activity

Statuses you'll see:
• Waiting for Review (1-2 days)
• In Review (2-3 days)
• Ready for Sale ✓ (approved!)
• Rejected (if issues)
```

### Step 7.2: Handle Rejection (if needed)

**Common reasons:**
- Missing privacy policy → Add URL
- Unclear purpose → Update description
- Technical issues → Fix and re-submit
- Policy violation → Review Apple guidelines

**If rejected:**
1. Read rejection reason
2. Fix issue
3. Increment build number
4. Re-submit

---

## Phase 8: Launch on App Store (Automatic)

### Step 8.1: Release Strategy

**Option A: Automatic Release**
```
App Store Connect → Your App → General
Select: "Automatically release on approval"
```

**Option B: Manual Release**
```
Wait for approval → Click "Release This Version"
Good for coordinated launch
```

### Step 8.2: Verify Live App

Once approved:
```
1. Open App Store on iOS device
2. Search: "Uber Order Filter"
3. Tap "Get"
4. Verify:
   - ✓ App downloads
   - ✓ App launches
   - ✓ All features work
   - ✓ Screenshots match
   - ✓ Description is accurate
```

### Step 8.3: Monitor Reviews

```
App Store Connect → Your App → Reviews

Respond to:
- 5-star reviews: Thank them
- 1-star reviews: Apologize & fix
- Bug reports: Address in next update
```

---

## Quick Deployment Timeline

| Phase | Duration | Steps |
|-------|----------|-------|
| **Pre-Build** | 30 min | Validate code, check deps |
| **Preparation** | 1 hour | Certificates, provisioning |
| **Build** | 2 hours | Compile & sign |
| **TestFlight** | 30 min | Upload & test |
| **Beta Test** | 1-2 weeks | Gather feedback, fix bugs |
| **App Store** | 1-2 hours | Complete metadata |
| **Review** | 3-5 days | Apple review |
| **Launch** | Automatic | Live on App Store |
| **Total** | **~2 weeks** | End-to-end |

---

## Commands Cheat Sheet

```bash
# Setup
npm install
eas login
eas whoami

# Build
eas build --platform ios

# Check status
eas build:list

# Prebuild locally
npx expo prebuild --platform ios

# Lint
npm run lint

# Type check
npx tsc --noEmit
```

---

## Troubleshooting

### Build Fails: "No signing certificate"
**Solution:**
```bash
# Create certificate
eas build --platform ios --interactive

# Or in Xcode:
Xcode → Preferences → Accounts → Manage Certificates
```

### Build Fails: "Invalid provisioning profile"
**Solution:**
1. Delete old profile
2. Create new one in Developer Account
3. Refresh in Xcode

### App Rejected: "Needs privacy policy"
**Solution:**
1. Create privacy policy
2. Host online
3. Add URL in App Store Connect
4. Re-submit

### OCR not working in TestFlight
**Solution:**
1. Check Vision.framework linked
2. Verify Info.plist permissions
3. Check bridging header path
4. Rebuild and re-test

---

## Post-Launch

### Phase 1: Monitor (1st week)
- [ ] Check crash reports daily
- [ ] Respond to reviews
- [ ] Monitor ratings
- [ ] Fix critical bugs

### Phase 2: Optimize (2nd-4th week)
- [ ] Analyze user feedback
- [ ] Improve OCR accuracy
- [ ] Add missing features
- [ ] Performance tune

### Phase 3: Update
- [ ] Release v0.1.1 (bug fixes)
- [ ] Release v0.2.0 (new features)
- [ ] Keep momentum
- [ ] Build community

---

## Submission Checklist

```
Code:
  ☐ TypeScript compiles without errors
  ☐ No ESLint warnings
  ☐ All tests pass
  ☐ Vision.framework linked
  ☐ Bridging header configured

iOS Configuration:
  ☐ Bundle ID set correctly
  ☐ App icons added (all sizes)
  ☐ Launch screen configured
  ☐ Signing certificates valid
  ☐ Provisioning profiles active

Store Page:
  ☐ App description complete
  ☐ Screenshots uploaded (6-10)
  ☐ Keywords set
  ☐ Category selected
  ☐ Privacy policy added

Review:
  ☐ Export compliance filled
  ☐ Content rights verified
  ☐ Age rating set
  ☐ All info reviewed
  ☐ Ready for submission
```

---

**🚀 Ready to Deploy!**

Follow these steps and your app will be on the App Store in ~2 weeks.

**Questions?** Check TESTING_GUIDE.md or iOS_SETUP.md

---

**Status:** ✅ READY FOR DEPLOYMENT
**Last Updated:** 2026-08-10
