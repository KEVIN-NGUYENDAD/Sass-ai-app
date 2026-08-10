import { useCallback, useEffect, useState } from 'react';
import { NativeModules, Platform } from 'react-native';
import { UberOrder } from '../types';
import {
  extractOrderFromOCR,
  isOrderScreenshot,
} from '../services/ocrService';

const { OCRService } = NativeModules;

interface OCRResult {
  text: string;
  confidence: number;
}

/**
 * Hook to integrate native iOS OCR service
 * Listens for screenshots and extracts order information
 */
export const useOCRService = (
  onOrderDetected: (order: UberOrder) => void
) => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [lastScreenshot, setLastScreenshot] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Start monitoring for screenshots
  const startMonitoring = useCallback(async () => {
    if (Platform.OS !== 'ios') {
      setError('OCR Service only available on iOS');
      return;
    }

    if (!OCRService) {
      setError('OCR Service not available');
      return;
    }

    try {
      // Start listening for screenshots
      OCRService.startMonitoring((imagePath: string) => {
        console.log('📸 Screenshot detected:', imagePath);
        setLastScreenshot(imagePath);

        // Process immediately
        processScreenshot(imagePath);
      });

      setIsMonitoring(true);
      console.log('✓ OCR monitoring started');
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to start monitoring';
      setError(errorMsg);
      console.error('❌ Failed to start OCR monitoring:', err);
    }
  }, []);

  // Stop monitoring
  const stopMonitoring = useCallback(async () => {
    if (!OCRService) return;

    try {
      await OCRService.stopMonitoring();
      setIsMonitoring(false);
      console.log('✓ OCR monitoring stopped');
    } catch (err: any) {
      console.error('Error stopping monitoring:', err);
    }
  }, []);

  // Capture screenshot manually
  const captureScreenshot = useCallback(async (): Promise<string | null> => {
    if (!OCRService) {
      setError('OCR Service not available');
      return null;
    }

    try {
      const imagePath = await OCRService.captureScreenshot();
      setLastScreenshot(imagePath);
      return imagePath;
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to capture screenshot';
      setError(errorMsg);
      console.error('Error capturing screenshot:', err);
      return null;
    }
  }, []);

  // Process screenshot with OCR
  const processScreenshot = useCallback(
    async (imagePath: string): Promise<UberOrder | null> => {
      if (!OCRService) {
        setError('OCR Service not available');
        return null;
      }

      try {
        console.log('🔍 Processing screenshot with OCR:', imagePath);

        // Call native OCR service
        const ocrResults: OCRResult[] = await OCRService.processImage(
          imagePath
        );

        console.log('📝 OCR Results:', ocrResults);

        // Check if it's an order screenshot
        if (!isOrderScreenshot(ocrResults)) {
          console.log('Not an order screenshot, skipping');
          return null;
        }

        // Extract order data
        const partialOrder = extractOrderFromOCR(ocrResults);
        if (!partialOrder) {
          console.log('Could not extract order from OCR results');
          return null;
        }

        // Create full order object
        const order: UberOrder = {
          id: partialOrder.id || `order_${Date.now()}`,
          price: partialOrder.price || 0,
          distance: partialOrder.distance || 0,
          restaurant: partialOrder.restaurant || 'Unknown',
          pickupLocation: 'From Uber',
          deliveryLocation: 'To destination',
          estimatedTime: partialOrder.estimatedTime || 0,
          timestamp: new Date(),
        };

        console.log('✓ Order detected:', order);

        // Call callback
        onOrderDetected(order);

        return order;
      } catch (err: any) {
        const errorMsg = err.message || 'OCR processing failed';
        setError(errorMsg);
        console.error('❌ Error processing screenshot:', err);
        return null;
      }
    },
    [onOrderDetected]
  );

  // Auto-start monitoring on mount
  useEffect(() => {
    if (Platform.OS === 'ios') {
      startMonitoring();

      return () => {
        stopMonitoring();
      };
    }
  }, [startMonitoring, stopMonitoring]);

  return {
    isMonitoring,
    lastScreenshot,
    error,
    startMonitoring,
    stopMonitoring,
    captureScreenshot,
    processScreenshot,
  };
};
