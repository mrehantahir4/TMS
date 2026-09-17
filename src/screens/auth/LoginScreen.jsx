/**
 * TMSshj - Login Screen
 *
 * Login Screen:
 * 1. Employee/Admin select
 * 2. Email
 * 3. Password
 * 4. Show/Hide password
 * 5. Remember Me
 * 6. Login API
 * 7. Auth data save
 * 8. Employee -> Employee Dashboard
 * 9. Admin -> Home
 */

import React, { useState } from 'react';

import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import LinearGradient from 'react-native-linear-gradient';

import { MaterialIcons } from '@react-native-vector-icons/material-icons';

import {
  loginEmployee,
  loginAdmin,
} from '../../services/authService';

import { saveAuth } from '../../services/authStorage';

import logo from '../../../assets/logo.png';

/**
 * Login Screen
 */
const LoginScreen = ({ navigation }) => {
  /**
   * Selected login type.
   *
   * employee = login_type 0
   * admin    = login_type 2
   */
  const [loginType, setLoginType] = useState('employee');

  /**
   * Login type dropdown.
   */
  const [showLoginTypeMenu, setShowLoginTypeMenu] =
    useState(false);

  /**
   * Email.
   */
  const [email, setEmail] = useState('');

  /**
   * Password.
   */
  const [password, setPassword] = useState('');

  /**
   * Password visibility.
   */
  const [showPassword, setShowPassword] = useState(false);

  /**
   * Remember Me.
   */
  const [rememberMe, setRememberMe] = useState(false);

  /**
   * Login loading.
   */
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Error message.
   */
  const [errorMessage, setErrorMessage] = useState('');

  /**
   * Login handler.
   */
  const handleLogin = async () => {
    setErrorMessage('');
    setShowLoginTypeMenu(false);

    const cleanEmail = email.trim();

    /**
     * Basic validation.
     */
    if (!cleanEmail) {
      setErrorMessage('Please enter your email.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    try {
      setIsLoading(true);

      /**
       * Employee:
       * login_type = 0
       *
       * Admin:
       * login_type = 2
       */
      const response =
        loginType === 'employee'
          ? await loginEmployee(
            cleanEmail,
            password,
          )
          : await loginAdmin(
            cleanEmail,
            password,
          );

      /**
       * Validate backend response.
       */
      if (
        !response?.ok ||
        !response?.data?.token ||
        !response?.data?.user
      ) {
        setErrorMessage(
          'Login failed. Please check your email and password.',
        );

        return;
      }

      /**
       * Save token + real backend user.
       */
      await saveAuth(
        response.data.token,
        response.data.user,
      );

      /**
       * Remember Me currently logged for
       * future persistence flow.
       */
      console.log(
        'Remember Me:',
        rememberMe,
      );

      /**
       * Employee -> Employee Dashboard
       *
       * Active Now popup dashboard ke andar
       * render hota hai.
       */
      if (loginType === 'employee') {
        navigation.replace('EmployeeDashboard');
        return;
      }

      /**
       * Admin -> temporary Home.
       */
      navigation.replace('Home');
    } catch (error) {
      console.error(
        'Login error:',
        error,
      );

      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(
          'Something went wrong. Please try again.',
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Current role label.
   */
  const loginTypeLabel =
    loginType === 'employee'
      ? 'Employee'
      : 'Admin';

  return (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <LinearGradient
        colors={[
          '#11182C',
          '#123A48',
          '#08716F',
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}>

        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={
            Platform.OS === 'ios'
              ? 'padding'
              : undefined
          }>

          <ScrollView
            contentContainerStyle={
              styles.scrollContent
            }
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>

            <View style={styles.content}>

              {/* Login Card */}
              <View style={styles.card}>

                {/* Logo */}
                <View style={styles.logoContainer}>
                  <Image
                    source={logo}
                    style={styles.logo}
                    resizeMode="contain"
                  />
                </View>

                {/* Heading */}
                <Text style={styles.heading}>
                  Welcome Back
                </Text>

                <Text style={styles.description}>
                  Sign in to your account
                </Text>

                {/* Email */}
                <View style={styles.inputGroup}>

                  <Text style={styles.label}>
                    Email Address
                  </Text>

                  <View style={styles.inputContainer}>

                    <MaterialIcons
                      name="email"
                      size={17}
                      color="#718096"
                    />

                    <TextInput
                      value={email}
                      onChangeText={text => {
                        setEmail(text);
                        setErrorMessage('');
                      }}
                      placeholder="Enter your email"
                      placeholderTextColor="#718096"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!isLoading}
                      style={styles.input}
                    />

                  </View>
                </View>

                {/* Password */}
                <View style={styles.inputGroup}>

                  <Text style={styles.label}>
                    Password
                  </Text>

                  <View style={styles.inputContainer}>

                    <MaterialIcons
                      name="lock"
                      size={17}
                      color="#718096"
                    />

                    <TextInput
                      value={password}
                      onChangeText={text => {
                        setPassword(text);
                        setErrorMessage('');
                      }}
                      placeholder="Enter your password"
                      placeholderTextColor="#718096"
                      secureTextEntry={
                        !showPassword
                      }
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!isLoading}
                      style={styles.input}
                    />

                    <Pressable
                      onPress={() =>
                        setShowPassword(
                          previous => !previous,
                        )
                      }
                      disabled={isLoading}
                      hitSlop={10}
                      style={
                        styles.eyeButton
                      }>

                      <MaterialIcons
                        name={
                          showPassword
                            ? 'visibility'
                            : 'visibility-off'
                        }
                        size={18}
                        color="#718096"
                      />

                    </Pressable>

                  </View>
                </View>

                {/* Login As */}
                <View style={styles.inputGroup}>

                  <Text style={styles.label}>
                    Login As
                  </Text>

                  <Pressable
                    disabled={isLoading}
                    onPress={() =>
                      setShowLoginTypeMenu(
                        previous => !previous,
                      )
                    }
                    style={styles.selectContainer}>

                    <View
                      style={
                        styles.selectLeft
                      }>

                      <MaterialIcons
                        name="person"
                        size={17}
                        color="#718096"
                      />

                      <Text
                        style={
                          styles.selectText
                        }>
                        {loginTypeLabel}
                      </Text>

                    </View>

                    <MaterialIcons
                      name={
                        showLoginTypeMenu
                          ? 'keyboard-arrow-up'
                          : 'keyboard-arrow-down'
                      }
                      size={20}
                      color="#718096"
                    />

                  </Pressable>

                  {/* Login Type Menu */}
                  {showLoginTypeMenu ? (
                    <View
                      style={
                        styles.loginTypeMenu
                      }>

                      <Pressable
                        onPress={() => {
                          setLoginType(
                            'employee',
                          );
                          setShowLoginTypeMenu(
                            false,
                          );
                          setErrorMessage('');
                        }}
                        style={[
                          styles.menuOption,
                          loginType ===
                            'employee'
                            ? styles.menuOptionSelected
                            : null,
                        ]}>

                        <Text
                          style={[
                            styles.menuOptionText,
                            loginType ===
                              'employee'
                              ? styles.menuOptionTextSelected
                              : null,
                          ]}>
                          Employee
                        </Text>

                      </Pressable>

                      <Pressable
                        onPress={() => {
                          setLoginType('admin');
                          setShowLoginTypeMenu(
                            false,
                          );
                          setErrorMessage('');
                        }}
                        style={[
                          styles.menuOption,
                          loginType === 'admin'
                            ? styles.menuOptionSelected
                            : null,
                        ]}>

                        <Text
                          style={[
                            styles.menuOptionText,
                            loginType === 'admin'
                              ? styles.menuOptionTextSelected
                              : null,
                          ]}>
                          Admin
                        </Text>

                      </Pressable>

                    </View>
                  ) : null}

                </View>

                {/* Remember Me */}
                <Pressable
                  disabled={isLoading}
                  onPress={() =>
                    setRememberMe(
                      previous => !previous,
                    )
                  }
                  style={
                    styles.rememberContainer
                  }>

                  <View
                    style={[
                      styles.checkbox,
                      rememberMe
                        ? styles.checkboxSelected
                        : styles.checkboxUnselected,
                    ]}>

                    {rememberMe ? (
                      <MaterialIcons
                        name="check"
                        size={15}
                        color="#FFFFFF"
                      />
                    ) : null}

                  </View>

                  <Text
                    style={
                      styles.rememberText
                    }>
                    Remember me
                  </Text>

                </Pressable>

                {/* Error */}
                {errorMessage ? (
                  <View
                    style={
                      styles.errorBox
                    }>

                    <Text
                      style={
                        styles.errorText
                      }>
                      {errorMessage}
                    </Text>

                  </View>
                ) : null}

                {/* Sign In */}
                <Pressable
                  onPress={handleLogin}
                  disabled={isLoading}
                  style={({ pressed }) => [
                    styles.loginButton,
                    pressed &&
                      !isLoading
                      ? styles.loginButtonPressed
                      : null,
                    isLoading
                      ? styles.loginButtonDisabled
                      : null,
                  ]}>

                  {isLoading ? (
                    <ActivityIndicator
                      size="small"
                      color="#FFFFFF"
                    />
                  ) : (
                    <Text
                      style={
                        styles.loginButtonText
                      }>
                      Sign In
                    </Text>
                  )}

                </Pressable>

              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </>
  );
};

/**
 * Styles.
 *
 * Dark navy + teal visual theme.
 */
const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },

  keyboardContainer: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    minHeight: '100%',
  },

  content: {
    flex: 1,
    minHeight: 620,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 32,
  },

  card: {
    width: '100%',
    maxWidth: 390,
    paddingHorizontal: 18,
    paddingTop: 24,
    paddingBottom: 22,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.20)',
    borderRadius: 18,
    backgroundColor: 'rgba(17, 28, 49, 0.94)',
  },

  logoContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },

  logo: {
    width: 54,
    height: 54,
  },

  heading: {
    fontSize: 21,
    fontWeight: '800',
    textAlign: 'center',
    color: '#FFFFFF',
  },

  description: {
    marginTop: 4,
    marginBottom: 22,
    fontSize: 12,
    textAlign: 'center',
    color: '#9CA3AF',
  },

  inputGroup: {
    position: 'relative',
    width: '100%',
    marginBottom: 13,
  },

  label: {
    marginBottom: 6,
    fontSize: 10,
    fontWeight: '600',
    color: '#D1D5DB',
  },

  inputContainer: {
    width: '100%',
    minHeight: 41,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.16)',
    borderRadius: 8,
    backgroundColor: '#222D43',
  },

  input: {
    flex: 1,
    minHeight: 39,
    marginLeft: 8,
    paddingHorizontal: 0,
    paddingVertical: 0,
    fontSize: 11,
    color: '#FFFFFF',
  },

  eyeButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },

  selectContainer: {
    width: '100%',
    minHeight: 41,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 11,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.16)',
    borderRadius: 8,
    backgroundColor: '#222D43',
  },

  selectLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  selectText: {
    marginLeft: 8,
    fontSize: 11,
    color: '#FFFFFF',
  },

  loginTypeMenu: {
    position: 'absolute',
    top: 61,
    left: 0,
    right: 0,
    zIndex: 100,
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#1E293B',
    elevation: 8,
  },

  menuOption: {
    minHeight: 42,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },

  menuOptionSelected: {
    backgroundColor: '#0F9D9A',
  },

  menuOptionText: {
    fontSize: 12,
    color: '#E5E7EB',
  },

  menuOptionTextSelected: {
    fontWeight: '700',
    color: '#FFFFFF',
  },

  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 2,
    marginBottom: 16,
  },

  checkbox: {
    width: 15,
    height: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 2,
    borderWidth: 1,
    marginRight: 7,
  },

  checkboxSelected: {
    backgroundColor: '#0F9D9A',
    borderColor: '#0F9D9A',
  },

  checkboxUnselected: {
    backgroundColor: 'transparent',
    borderColor: '#94A3B8',
  },

  rememberText: {
    fontSize: 11,
    color: '#CBD5E1',
  },

  errorBox: {
    marginBottom: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 7,
    backgroundColor: 'rgba(185, 28, 28, 0.16)',
  },

  errorText: {
    fontSize: 10,
    lineHeight: 15,
    color: '#FCA5A5',
  },

  loginButton: {
    width: '100%',
    minHeight: 43,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#0F9D9A',
  },

  loginButtonPressed: {
    opacity: 0.8,
  },

  loginButtonDisabled: {
    opacity: 0.55,
  },

  loginButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

export default LoginScreen;