/**
 * TMSshj - Authentication Storage
 *
 * Is file ka kaam:
 * 1. Login ke baad token save karna
 * 2. Logged-in user save karna
 * 3. App restart ke baad token/user read karna
 * 4. Logout ke waqt auth data remove karna
 *
 * React Native mein AsyncStorage ko Flutter ke
 * SharedPreferences ke basic concept ke qareeb samajh sakte ho.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Storage keys ko ek central object mein rakh rahe hain.
 *
 * Is se spelling mistakes aur duplicate keys
 * ke chances kam ho jate hain.
 */
const STORAGE_KEYS = {
  TOKEN: '@TMSshj/auth_token',
  USER: '@TMSshj/auth_user',
};

/**
 * Login session save karta hai.
 *
 * token -> API authentication token
 * user  -> current logged-in employee
 */
const saveAuth = async (token, user = null) => {
  try {
    /**
     * Token ko local storage mein save kar rahe hain.
     */
    await AsyncStorage.setItem(
      STORAGE_KEYS.TOKEN,
      token,
    );

    /**
     * User available ho to usko JSON string mein
     * convert karke save karenge.
     */
    if (user) {
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER,
        JSON.stringify(user),
      );
    }
  } catch (error) {
    /**
     * Storage error ko silently ignore nahi karenge.
     */
    console.error(
      'Failed to save authentication data:',
      error,
    );

    throw error;
  }
};

/**
 * Saved authentication token return karta hai.
 *
 * Token nahi mila to null return hoga.
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
 *
 * Storage mein JSON string hoti hai,
 * isliye usko dobara object mein parse karna hota hai.
 */
const getUser = async () => {
  try {
    const userString = await AsyncStorage.getItem(
      STORAGE_KEYS.USER,
    );

    /**
     * Agar user save nahi hai to null return.
     */
    if (!userString) {
      return null;
    }

    /**
     * JSON string ko JavaScript object mein convert.
     */
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
 * Check karta hai ke user logged in hai ya nahi.
 *
 * Sirf token ke existence ko check kar rahe hain.
 */
const isLoggedIn = async () => {
  const token = await getToken();

  return Boolean(token);
};

/**
 * Logout ke waqt token aur user dono remove karta hai.
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
     * User data remove.
     */
    await AsyncStorage.removeItem(
      STORAGE_KEYS.USER,
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
 *
 * Doosri files in functions ko import karke
 * use kar sakti hain.
 */
export {
  saveAuth,
  getToken,
  getUser,
  isLoggedIn,
  clearAuth,
};