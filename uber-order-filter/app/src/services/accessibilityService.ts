/**
 * Accessibility Service for Android
 *
 * Reads order details from Uber app notifications using Android Accessibility API
 * This service listens to accessibility events and extracts order information
 *
 * IMPORTANT: This requires explicit user permission in Android Settings:
 * Settings > Accessibility > [App Name] > Enable
 */

import { UberOrder } from '../types';

interface AccessibilityEventData {
  eventType: string;
  source: string;
  text: string;
  packageName: string;
}

/**
 * Listen for accessibility events from Uber app
 */
export const setupAccessibilityListener = (
  onOrderDetected: (order: UberOrder) => void
) => {
  console.log('📱 Accessibility Service: Listening for Uber events...');

  // This would be implemented as a native module
  // For now, this is a placeholder that shows the concept

  return {
    start: () => {
      console.log('✓ Accessibility listener started');
      // In production: Connect to native AccessibilityService module
    },
    stop: () => {
      console.log('✓ Accessibility listener stopped');
    },
  };
};

/**
 * Parse order data from accessibility event text
 * Expects format like:
 * "Chipotle $12.50 2.1 mi 18 min pickup Downtown Mall delivery Riverside"
 */
export const parseOrderFromText = (text: string): Partial<UberOrder> | null => {
  try {
    // Example: Extract price using regex
    const priceMatch = text.match(/\$(\d+\.?\d*)/);
    const price = priceMatch ? parseFloat(priceMatch[1]) : 0;

    // Extract distance
    const distanceMatch = text.match(/(\d+\.?\d*)\s*mi/);
    const distance = distanceMatch ? parseFloat(distanceMatch[1]) : 0;

    // Extract time
    const timeMatch = text.match(/(\d+)\s*min/);
    const estimatedTime = timeMatch ? parseInt(timeMatch[1]) : 0;

    if (price === 0 || distance === 0) {
      return null;
    }

    return {
      price,
      distance,
      estimatedTime,
    };
  } catch (error) {
    console.error('Error parsing order from text:', error);
    return null;
  }
};

/**
 * Extract restaurant name from notification
 */
export const extractRestaurantName = (text: string): string => {
  // Simple heuristic: First line usually contains restaurant name
  const firstLine = text.split('\n')[0];
  return firstLine.trim().replace(/[💰📍⏱🚗]/g, '').trim();
};

/**
 * Check if text looks like an Uber order notification
 */
export const isUberOrderNotification = (text: string): boolean => {
  return (
    text.includes('$') &&
    text.includes('mi') &&
    (text.includes('min') || text.includes('minute'))
  );
};

/**
 * Full order extraction from notification
 */
export const extractOrderFromNotification = (
  notificationText: string,
  restaurantName: string = 'Unknown'
): Partial<UberOrder> | null => {
  if (!isUberOrderNotification(notificationText)) {
    return null;
  }

  const parsed = parseOrderFromText(notificationText);
  if (!parsed) return null;

  const restaurant = restaurantName || extractRestaurantName(notificationText);

  return {
    ...parsed,
    restaurant,
    id: `order_${Date.now()}`,
    timestamp: new Date(),
  };
};

/**
 * Format: For native module communication (React Native Bridge)
 */
export const AccessibilityServiceNative = {
  // These would be actual native methods exposed via NativeModules
  startListening: async (callback: (data: string) => void) => {
    // NativeModules.AccessibilityService.startListening(callback)
  },
  stopListening: async () => {
    // NativeModules.AccessibilityService.stopListening()
  },
  checkPermission: async (): Promise<boolean> => {
    // NativeModules.AccessibilityService.checkPermission()
    return false;
  },
  requestPermission: async () => {
    // NativeModules.AccessibilityService.requestPermission()
  },
};
