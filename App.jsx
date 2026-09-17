/**
 * TMSshj - Root Application
 *
 * Ye file application ka main entry UI layer hai.
 * Yahan hum:
 * 1. SafeAreaProvider provide karte hain.
 * 2. Status bar configure karte hain.
 * 3. Main AppNavigator render karte hain.
 */

import React from 'react';
import {StatusBar, useColorScheme} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import AppNavigator from './src/navigation/AppNavigator';

function App() {
  /**
   * Device ka current color scheme check karta hai.
   *
   * true  -> Dark mode
   * false -> Light mode
   */
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      {/**
       * Android/iOS status bar ka text/icon color
       * light/dark theme ke according set hota hai.
       */}
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
      />

      {/**
       * Application ki tamam navigation yahan se start hogi.
       */}
      <AppNavigator />
    </SafeAreaProvider>
  );
}

export default App;