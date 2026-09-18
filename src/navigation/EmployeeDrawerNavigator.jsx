/**
 * TMSshj - Employee Drawer Navigator
 *
 * Employee Dashboard ke liye side navigation.
 *
 * Current items:
 *
 * Dashboard
 * All Tasks
 * EOD
 * Logout
 */

import React, { useEffect, useState } from 'react';

import {
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';

import EmployeeDashboardScreen from '../screens/employee/EmployeeDashboardScreen';

import AllTask from '../screens/employee/AllTask';
import EODList from '../screens/employee/EODList';
import { getUser } from '../services/authStorage';

/**
 * Drawer Navigator.
 */
const Drawer = createDrawerNavigator();


/**
 * Custom Drawer Content.
 */
const CustomDrawerContent = props => {
  /**
   * Safe area insets.
   *
   * Status bar aur bottom navigation ke
   * safe area ko manually handle karenge.
   */
  const insets = useSafeAreaInsets();

  /**
   * Logged-in employee.
   */
  const [user, setUser] = useState(null);

  /**
   * Load real user.
   */
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await getUser();

        setUser(storedUser);
      } catch (error) {
        console.error(
          'Failed to load drawer user:',
          error,
        );
      }
    };

    loadUser();
  }, []);

  /**
   * Real employee name.
   */
  const employeeName =
    user?.name ||
    [user?.firstname, user?.lastname]
      .filter(Boolean)
      .join(' ') ||
    'Employee';

  /**
   * Logout.
   *
   * Actual logout API baad mein connect karenge.
   */
  const handleLogout = () => {
    console.log('Logout pressed');
  };

  return (
    <>
      {/* Android Status Bar */}
      <StatusBar
        translucent={false}
        backgroundColor="#FFFFFF"
        barStyle="dark-content"
      />

      <View style={styles.drawerRoot}>

        {/*
          White area for status bar.
          Is area mein sidebar ka dark color nahi hoga.
        */}
        <View
          style={[
            styles.statusBarSpace,
            {
              height: insets.top,
            },
          ]}
        />

        {/* Actual Drawer */}
        <View
          style={[
            styles.drawerContainer,
            {
              paddingBottom: insets.bottom,
            },
          ]}>

          {/*
            Layered background.
            Actual gradient package use nahi ho raha.
          */}

          <View
            pointerEvents="none"
            style={styles.gradientBase}
          />

          <View
            pointerEvents="none"
            style={styles.gradientTopGlow}
          />

          <View
            pointerEvents="none"
            style={styles.gradientMiddleGlow}
          />

          <View
            pointerEvents="none"
            style={styles.gradientBottomGlow}
          />

          {/* Drawer Content */}
          <DrawerContentScrollView
            {...props}
            contentContainerStyle={
              styles.drawerContent
            }
            showsVerticalScrollIndicator={false}>

            {/* Drawer Header */}
            <View style={styles.drawerHeader}>

              <View style={styles.logoRow}>

                <View style={styles.logoBox}>
                  <Text style={styles.logoIcon}>
                    ✣
                  </Text>
                </View>

                <Text style={styles.appName}>
                  TMS
                </Text>

              </View>

              {/* Real Employee Name */}
              <Text style={styles.userName}>
                {employeeName}
              </Text>

              <Text style={styles.userRole}>
                Employee
              </Text>

            </View>

            {/* Navigation Title */}
            <Text style={styles.navigationTitle}>
              CORE NAVIGATION
            </Text>

            {/* Navigation Items */}
            <View style={styles.drawerItems}>
              <DrawerItemList {...props} />
            </View>

          </DrawerContentScrollView>

          {/* Logout */}
          <View style={styles.logoutSection}>

            <Pressable
              onPress={handleLogout}
              style={({ pressed }) => [
                styles.logoutButton,
                pressed
                  ? styles.logoutButtonPressed
                  : null,
              ]}>

              <Text style={styles.logoutText}>
                Logout
              </Text>

            </Pressable>

          </View>

        </View>
      </View>
    </>
  );
};

/**
 * Employee Drawer Navigator.
 */
const EmployeeDrawerNavigator = () => {
  return (
    <Drawer.Navigator
      initialRouteName="Dashboard"
      drawerContent={props => (
        <CustomDrawerContent {...props} />
      )}
      screenOptions={{
        headerShown: true,

        headerTitleAlign: 'left',

        headerStyle: {
          backgroundColor: '#FFFFFF',
        },

        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '700',
          color: '#111827',
        },

        drawerStyle: {
          width: 310,
          backgroundColor: 'transparent',
        },

        drawerType: 'front',

        drawerActiveTintColor: '#63E3D1',

        drawerInactiveTintColor: '#B7C1D1',

        drawerActiveBackgroundColor:
          'rgba(15, 157, 154, 0.22)',

        drawerItemStyle: {
          marginHorizontal: 10,
          marginVertical: 2,
          borderRadius: 9,
        },

        drawerLabelStyle: {
          marginLeft: -4,
          fontSize: 13,
          fontWeight: '600',
        },
      }}>

      {/* Dashboard */}
      <Drawer.Screen
        name="Dashboard"
        component={EmployeeDashboardScreen}
        options={{
          title: 'Dashboard',
        }}
      />

      {/* All Tasks */}
      <Drawer.Screen
        name="AllTasks"
        component={AllTask}
        options={{
          title: 'All Tasks',
        }}
      />

      <Drawer.Screen
  name="EOD"
  component={EODList}
  options={{
    title: 'EOD List',
  }}
/>

    </Drawer.Navigator>
  );
};

/**
 * Styles.
 */
const styles = StyleSheet.create({
  /**
   * Root white rakha hai taake status bar area
   * white nazar aaye.
   */
  drawerRoot: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  /**
   * Status bar ka area.
   */
  statusBarSpace: {
    width: '100%',
    backgroundColor: '#FFFFFF',
  },

  /**
   * Actual sidebar body.
   */
  drawerContainer: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#0D1828',
  },

  /**
   * Base dark navy.
   */
  gradientBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0D1828',
  },

  /**
   * Top teal glow.
   */
  gradientTopGlow: {
    position: 'absolute',
    top: -80,
    left: -90,
    width: 360,
    height: 300,
    borderRadius: 180,
    backgroundColor:
      'rgba(0, 128, 128, 0.22)',
  },

  /**
   * Middle soft blue/teal glow.
   */
  gradientMiddleGlow: {
    position: 'absolute',
    top: 180,
    right: -130,
    width: 260,
    height: 260,
    borderRadius: 150,
    backgroundColor:
      'rgba(20, 93, 113, 0.14)',
  },

  /**
   * Bottom subtle dark layer.
   */
  gradientBottomGlow: {
    position: 'absolute',
    bottom: -80,
    left: -80,
    width: 300,
    height: 220,
    borderRadius: 140,
    backgroundColor:
      'rgba(3, 11, 25, 0.36)',
  },

  drawerContent: {
    paddingTop: 0,
    paddingBottom: 20,
  },

  /**
   * Drawer header.
   */
  drawerHeader: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor:
      'rgba(148, 163, 184, 0.12)',
    backgroundColor:
      'rgba(7, 20, 35, 0.34)',
  },

  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  logoBox: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor:
      'rgba(15, 157, 154, 0.24)',
  },

  logoIcon: {
    fontSize: 19,
    fontWeight: '700',
    color: '#5DE2D0',
  },

  appName: {
    marginLeft: 10,
    fontSize: 21,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  userName: {
    marginTop: 17,
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  userRole: {
    marginTop: 3,
    fontSize: 11,
    color: '#9EABBD',
  },

  navigationTitle: {
    marginTop: 20,
    marginLeft: 20,
    marginBottom: 6,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#718096',
  },

  drawerItems: {
    flex: 1,
  },

  logoutSection: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor:
      'rgba(148, 163, 184, 0.12)',
    backgroundColor:
      'rgba(7, 20, 35, 0.28)',
  },

  logoutButton: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
    backgroundColor:
      'rgba(255, 255, 255, 0.06)',
  },

  logoutButtonPressed: {
    opacity: 0.65,
  },

  logoutText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FCA5A5',
  },

 
});

export default EmployeeDrawerNavigator;