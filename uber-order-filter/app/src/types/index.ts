// Order types
export interface UberOrder {
  id: string;
  price: number;
  distance: number;
  restaurant: string;
  pickupLocation: string;
  deliveryLocation: string;
  estimatedTime: number; // minutes
  timestamp: Date;
}

// Filter criteria
export interface FilterCriteria {
  id: string;
  name: string;
  minPrice: number;
  maxDistance: number;
  preferredRestaurants: string[];
  excludedRestaurants: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Driver decision (accepted/rejected)
export interface DriverDecision {
  id: string;
  orderId: string;
  action: 'accepted' | 'rejected';
  timestamp: Date;
  estimatedEarnings: number;
  reason?: string;
  filterId: string; // which filter was active
}

// Recommendation result
export interface FilterRecommendation {
  order: UberOrder;
  recommendation: 'good' | 'poor';
  score: number; // 0-100
  reasons: string[];
  matchedCriteria: {
    priceMatch: boolean;
    distanceMatch: boolean;
    restaurantMatch: boolean;
  };
}

// Settings
export interface AppSettings {
  enableAudio: boolean;
  audioVolume: number; // 0-100
  audioType: 'beep' | 'chime' | 'alert' | 'custom';
  enableVibration: boolean;
  theme: 'light' | 'dark' | 'auto';
  dataStorageMode: 'local' | 'cloud' | 'hybrid';
  privacyMode: boolean;
}

// Analytics
export interface DailyStats {
  date: string;
  totalOrders: number;
  acceptedOrders: number;
  rejectedOrders: number;
  totalEarnings: number;
  averageEarningsPerOrder: number;
  bestTime: string; // hour with best earnings
  worstTime: string;
}
