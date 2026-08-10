import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { RootNavigator } from './navigation';
import { settingsStorage } from './services/storageService';

export default function App() {
  useEffect(() => {
    // Initialize app
    const initializeApp = async () => {
      try {
        // Load settings or initialize with defaults
        const settings = await settingsStorage.get();
        console.log('✓ App initialized', settings.theme);
      } catch (error) {
        console.error('Error initializing app:', error);
      }
    };

    initializeApp();
  }, []);

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <RootNavigator />
    </>
  );
}
