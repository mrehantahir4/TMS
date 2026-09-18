/**
 * TMSshj - Authentication Storage
 *
 * Is file ka kaam:
 * 1. Login ke baad token save karna
 * 2. Logged-in user save karna
 * 3. Remember Me preference save karna
 * 4. App restart ke baad auth data read karna
 * 5. Logout ke waqt auth data remove karna
 *
 * React Native mein AsyncStorage ko Flutter ke
 * SharedPreferences ke basic concept ke qareeb
 * samajh sakte ho.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Storage keys ko central object mein rakh rahe hain.
 */
const STORAGE_KEYS = {
  TOKEN: '@TMSshj/auth_token',
  USER: '@TMSshj/auth_user',
  REMEMBER_ME: '@TMSshj/remember_me',
};

/**
 * Login session save karta hai.
 *
 * token      -> API authentication token
 * user       -> current logged-in user
 * rememberMe -> app restart ke baad session rakhna hai ya nahi
 */
const saveAuth = async (
  token,
  user = null,
  rememberMe = false,
) => {
  try {
    /**
     * Token save.
     */
    await AsyncStorage.setItem(
      STORAGE_KEYS.TOKEN,
      token,
    );

    /**
     * User available ho to save.
     */
    if (user) {
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER,
        JSON.stringify(user),
      );
    }

    /**
     * Remember Me preference save.
     *
     * AsyncStorage strings store karta hai,
     * isliye boolean ko string mein convert kar rahe hain.
     */
    await AsyncStorage.setItem(
      STORAGE_KEYS.REMEMBER_ME,
      String(Boolean(rememberMe)),
    );
  } catch (error) {
    console.error(
      'Failed to save authentication data:',
      error,
    );

    throw error;
  }
};

/**
 * Saved authentication token return karta hai.
 */
const getToken = async () => {
  try {
    return await AsyncStorage.getItem(
      STORAGE_KEYS.TOKEN,
    );
  } catch (error) {
    console.error(
      'Failed to get authentication token:',
      error,
    );

    return null;
  }
};

/**
 * Saved user return karta hai.
 */
const getUser = async () => {
  try {
    const userString = await AsyncStorage.getItem(
      STORAGE_KEYS.USER,
    );

    if (!userString) {
      return null;
    }

    return JSON.parse(userString);
  } catch (error) {
    console.error(
      'Failed to get stored user:',
      error,
    );

    return null;
  }
};

/**
 * Remember Me ki saved value return karta hai.
 *
 * Storage:
 * "true"  -> true
 * "false" -> false
 */
const getRememberMe = async () => {
  try {
    const rememberValue =
      await AsyncStorage.getItem(
        STORAGE_KEYS.REMEMBER_ME,
      );

    return rememberValue === 'true';
  } catch (error) {
    console.error(
      'Failed to get Remember Me preference:',
      error,
    );

    return false;
  }
};

/**
 * Check karta hai ke auth token available hai ya nahi.
 */
const isLoggedIn = async () => {
  const token = await getToken();

  return Boolean(token);
};

/**
 * Logout ke waqt tamam auth data remove karta hai.
 */
const clearAuth = async () => {
  try {
    /**
     * Token remove.
     */
    await AsyncStorage.removeItem(
      STORAGE_KEYS.TOKEN,
    );

    /**
     * User remove.
     */
    await AsyncStorage.removeItem(
      STORAGE_KEYS.USER,
    );

    /**
     * Remember Me preference bhi remove.
     */
    await AsyncStorage.removeItem(
      STORAGE_KEYS.REMEMBER_ME,
    );
  } catch (error) {
    console.error(
      'Failed to clear authentication data:',
      error,
    );

    throw error;
  }
};

/**
 * Authentication storage functions export.
 */
export {
  saveAuth,
  getToken,
  getUser,
  getRememberMe,
  isLoggedIn,
  clearAuth,
};