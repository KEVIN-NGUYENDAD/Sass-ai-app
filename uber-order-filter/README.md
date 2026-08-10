# 🚗 Uber Order Filter - Manual Decision Support System

A React Native mobile application that helps Uber drivers make better order decisions by providing real-time recommendations based on personalized filter criteria.

## ✨ Features

- **Smart Order Filtering** - Automatically evaluate orders based on your criteria (price, distance, restaurant)
- **Real-Time Recommendations** - Get instant feedback: ✅ Good or ❌ Poor
- **Audio Alerts** - Sound notifications for low-quality orders
- **Decision History** - Track all accepted/rejected orders
- **Analytics Dashboard** - View earning patterns and optimize filters
- **Local Data Storage** - All data stored on your device

## 🏗️ Project Structure

```
uber-order-filter/
├── app/                          # React Native app (Expo)
│   ├── src/
│   │   ├── screens/             # App screens (Home, Filters, etc)
│   │   ├── components/          # Reusable UI components
│   │   ├── services/            # Business logic (filter, storage)
│   │   ├── hooks/               # Custom React hooks
│   │   ├── types/               # TypeScript interfaces
│   │   ├── utils/               # Helper functions
│   │   └── navigation/          # App navigation
│   ├── package.json
│   ├── app.json
│   └── tsconfig.json
│
├── backend/                      # Node.js Express backend
│   ├── src/
│   │   ├── routes/              # API endpoints
│   │   ├── services/            # Business logic
│   │   ├── controllers/         # Request handlers
│   │   ├── models/              # Data models
│   │   └── utils/               # Helper functions
│   ├── package.json
│   └── tsconfig.json
│
└── docs/                         # Documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator

### Mobile App Setup

```bash
cd app
npm install
npm start

# For iOS
npm run ios

# For Android
npm run android
```

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

## 📋 Development

### Create a New Filter

1. Open the **Filters** tab
2. Tap **+ New Filter**
3. Set your criteria:
   - **Filter Name**: e.g., "Rush Hour"
   - **Min Price**: $8
   - **Max Distance**: 3 miles
4. Tap **Create**

### Monitor Orders

- New orders appear in the **Home** tab
- Each order shows:
  - 💰 Price
  - 📍 Distance & Restaurant
  - 📊 Recommendation (✅ Good / ❌ Poor)
  - 📝 Reasons if marked Poor

### Review History

- Go to **History** tab to see all decisions
- View daily/weekly stats
- Export data for analysis

## 🔧 Tech Stack

### Frontend
- **React Native** + **Expo** - Cross-platform mobile app
- **TypeScript** - Type safety
- **AsyncStorage** - Local data persistence

### Backend
- **Node.js** + **Express** - REST API
- **TypeScript** - Type safety
- **Firebase/Supabase** (optional) - Cloud sync

### Data Reading
- **Accessibility API** (Android) - Read order details from notifications
- **OCR** (iOS) - Extract text from screenshots

## 📊 How It Works

```
Uber App (Driver receives order)
    ↓
Our App reads order details via Accessibility/OCR
    ↓
Filter Logic: Evaluate against criteria
    ↓
Recommendation: ✅ Good or ❌ Poor
    ↓
Audio Alert: Notify driver if poor
    ↓
Driver decides: Accept/Reject on Uber App
    ↓
Log Decision: Save for analytics
```

## ⚙️ Configuration

### Filter Criteria

```typescript
interface FilterCriteria {
  minPrice: number;              // Minimum order amount ($)
  maxDistance: number;           // Maximum delivery distance (miles)
  preferredRestaurants: string[]; // Preferred restaurant names
  excludedRestaurants: string[];  // Excluded restaurant names
}
```

### Settings

```typescript
interface AppSettings {
  enableAudio: boolean;           // Enable/disable alerts
  audioVolume: number;            // 0-100
  audioType: 'beep' | 'chime' | 'alert';
  enableVibration: boolean;       // Vibration feedback
  theme: 'light' | 'dark' | 'auto';
  dataStorageMode: 'local' | 'cloud' | 'hybrid';
  privacyMode: boolean;           // Disable cloud sync
}
```

## 📈 Analytics

The app automatically tracks:
- Total orders received
- Accepted vs. rejected
- Estimated earnings
- Best time for orders (hour of day)
- Top performing restaurants
- Optimal filter criteria

## 🔐 Privacy & Data

- ✅ All data stored locally on your device
- ✅ Optional cloud backup (Supabase/Firebase)
- ✅ No login required
- ✅ No personal data collection
- ✅ Full data export/delete anytime

## ⚖️ Legal & ToS

**This is a decision-support tool, NOT automation.**

- ✅ Driver always makes final decision
- ✅ No automatic order acceptance/rejection
- ✅ Supports (not violates) Uber's Terms of Service
- ✅ Passive monitoring only

## 🛠️ API Endpoints

### Analytics
```
GET /api/analytics/daily       - Daily earnings stats
GET /api/analytics/weekly      - Weekly performance
POST /api/analytics/export     - Export data
```

### Filters
```
POST /api/filters/optimize     - Suggest optimal criteria
GET /api/filters/recommended   - Get recommendations
```

## 📝 Notes

- Recommendations are suggestions only; driver makes final decisions
- Filter optimization based on your historical decisions
- Data is synced locally; cloud sync is optional
- Audio alerts require notification permissions

## 🤝 Contributing

Found a bug? Want to suggest a feature? [Open an issue]()

## 📜 License

MIT

## 📞 Support

- Check [Project Plan](../docs/project-plan.html) for architecture details
- Review [Development Procedures](../development-procedures/) for setup

---

**Status:** 🚀 In Development  
**Version:** 0.1.0  
**Last Updated:** 2026-08-10
