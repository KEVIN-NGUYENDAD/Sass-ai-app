/**
 * OCR Service for iOS
 *
 * Captures screenshots and extracts text using Vision API (iOS)
 * This detects Uber order information from the screen
 *
 * IMPORTANT: This requires:
 * - Screenshot permission (in iOS 14+)
 * - Vision framework (Apple's ML text detection)
 */

import { UberOrder } from '../types';

interface OCRResult {
  text: string;
  confidence: number;
}

/**
 * Start screenshot monitoring
 * Detects when order notifications appear on screen
 */
export const startScreenshotMonitoring = (
  onOrderDetected: (order: UberOrder) => void
) => {
  console.log('📸 OCR Service: Monitoring screenshots...');

  return {
    start: () => {
      console.log('✓ Screenshot monitoring started');
      // In production: Hook into iOS screenshot notifications
    },
    stop: () => {
      console.log('✓ Screenshot monitoring stopped');
    },
  };
};

/**
 * Process screenshot and extract text via OCR
 * Uses Apple Vision framework for on-device ML text detection
 */
export const processScreenshot = async (
  imagePath: string
): Promise<OCRResult[]> => {
  try {
    console.log('🔍 Processing screenshot for OCR...');

    // In production: Call native Vision framework
    // NativeModules.OCRService.processImage(imagePath)

    return [
      {
        text: 'Sample order text',
        confidence: 0.95,
      },
    ];
  } catch (error) {
    console.error('Error processing screenshot:', error);
    return [];
  }
};

/**
 * Extract structured order data from OCR text
 */
export const extractOrderFromOCR = (
  ocrResults: OCRResult[]
): Partial<UberOrder> | null => {
  // Combine all text with highest confidence
  const fullText = ocrResults
    .filter(r => r.confidence > 0.7)
    .map(r => r.text)
    .join(' ');

  if (!fullText) return null;

  // Parse order details
  const priceMatch = fullText.match(/\$(\d+\.?\d*)/);
  const price = priceMatch ? parseFloat(priceMatch[1]) : 0;

  const distanceMatch = fullText.match(/(\d+\.?\d*)\s*mi(le)?/i);
  const distance = distanceMatch ? parseFloat(distanceMatch[1]) : 0;

  const timeMatch = fullText.match(/(\d+)\s*min(ute)?/i);
  const estimatedTime = timeMatch ? parseInt(timeMatch[1]) : 0;

  if (price === 0 || distance === 0) {
    return null;
  }

  // Extract restaurant name (usually first significant text)
  const lines = fullText.split('\n');
  let restaurant = 'Unknown';
  for (const line of lines) {
    const trimmed = line.trim().replace(/[💰📍⏱🚗$]/g, '').trim();
    if (trimmed.length > 2 && trimmed.length < 50) {
      restaurant = trimmed;
      break;
    }
  }

  return {
    id: `order_${Date.now()}`,
    price,
    distance,
    estimatedTime,
    restaurant,
    timestamp: new Date(),
  };
};

/**
 * Detect if screenshot contains Uber order information
 */
export const isOrderScreenshot = (ocrResults: OCRResult[]): boolean => {
  const text = ocrResults.map(r => r.text).join(' ');
  return (
    text.includes('$') &&
    (text.includes('mi') || text.includes('mile')) &&
    (text.includes('min') || text.includes('minute'))
  );
};

/**
 * Native module interface for iOS OCR
 */
export const OCRServiceNative = {
  // These would be actual native methods exposed via NativeModules
  captureScreenshot: async (): Promise<string> => {
    // NativeModules.OCRService.captureScreenshot()
    return '';
  },
  processImage: async (imagePath: string): Promise<OCRResult[]> => {
    // NativeModules.OCRService.processImage(imagePath)
    return [];
  },
  startMonitoring: async (callback: (imagePath: string) => void) => {
    // NativeModules.OCRService.startMonitoring(callback)
  },
  stopMonitoring: async () => {
    // NativeModules.OCRService.stopMonitoring()
  },
  checkPermission: async (): Promise<boolean> => {
    // NativeModules.OCRService.checkPermission()
    return false;
  },
};

/**
 * Unified order detection from OCR
 */
export const detectOrderFromScreenshot = async (
  imagePath: string
): Promise<UberOrder | null> => {
  const ocrResults = await processScreenshot(imagePath);

  if (!isOrderScreenshot(ocrResults)) {
    return null;
  }

  const partialOrder = extractOrderFromOCR(ocrResults);
  if (!partialOrder) return null;

  return {
    id: partialOrder.id || `order_${Date.now()}`,
    price: partialOrder.price || 0,
    distance: partialOrder.distance || 0,
    restaurant: partialOrder.restaurant || 'Unknown',
    pickupLocation: 'From order',
    deliveryLocation: 'To destination',
    estimatedTime: partialOrder.estimatedTime || 0,
    timestamp: partialOrder.timestamp || new Date(),
  };
};
