/**
 * TMSshj - Application Navigator
 *
 * Application ki main navigation yahan define hoti hai.
 *
 * Employee flow:
 *
 * Login
 *   ↓
 * Employee Drawer
 *   ↓
 * Dashboard / My Tasks / EOD
 *
 * Admin flow:
 *
 * Login
 *   ↓
 * Home (temporary)
 */

import React from 'react';

import {
  NavigationContainer,
} from '@react-navigation/native';

import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import LoginScreen from '../screens/auth/LoginScreen';

import EmployeeDrawerNavigator from './EmployeeDrawerNavigator';

/**
 * Native Stack Navigator.
 */
const Stack = createNativeStackNavigator();

/**
 * Temporary Admin/Home screen.
 */
const HomeScreen = () => {
  return null;
};

/**
 * Main application navigator.
 */
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
        }}>

        {/* Login */}
        <Stack.Screen
          name="Login"
          component={LoginScreen}
        />

        {/* Employee Drawer */}
        <Stack.Screen
          name="EmployeeDashboard"
          component={EmployeeDrawerNavigator}
        />

        {/* Temporary Admin/Home */}
        <Stack.Screen
          name="Home"
          component={HomeScreen}
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;