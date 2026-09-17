/**
 * TMSshj - Active Now Modal
 *
 * Is modal ka purpose:
 * 1. Employee ko active hone ke liye force karna.
 * 2. "Active Now" button press hone par backend status = 1 bhejna.
 * 3. API successful hone ke baad modal close karna.
 *
 * IMPORTANT:
 * Is modal ko outside tap ya Android back button se close
 * nahi kiya ja sakta.
 */

import React, {useState} from 'react';

import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {setEmployeeStatus} from '../services/authService';

/**
 * ActiveNowModal
 *
 * Props:
 * token
 * -> Logged-in employee ka authentication token.
 *
 * onActivated
 * -> Status successfully active hone ke baad callback.
 */
const ActiveNowModal = ({token, onActivated}) => {
  /**
   * Active status API request chal rahi hai ya nahi.
   */
  const [isLoading, setIsLoading] = useState(false);

  /**
   * API error message.
   */
  const [errorMessage, setErrorMessage] = useState('');

  /**
   * Employee ko active karne ka function.
   */
  const handleActivate = async () => {
    /**
     * Previous error clear.
     */
    setErrorMessage('');

    try {
      /**
       * Loading start.
       */
      setIsLoading(true);

      /**
       * Backend par employee ko active/online mark karna.
       *
       * status = 1
       */
      await setEmployeeStatus(token, 1);

      /**
       * Backend successful response ke baad
       * parent screen ko inform karenge.
       *
       * Parent yahan se Dashboard open karega.
       */
      onActivated();
    } catch (error) {
      /**
       * Actual error console mein.
       */
      console.error(
        'Failed to activate employee:',
        error,
      );

      /**
       * User-friendly message.
       */
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(
          'Unable to activate your status. Please try again.',
        );
      }
    } finally {
      /**
       * Loading stop.
       */
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={true}
      transparent
      animationType="fade"
      statusBarTranslucent
      /**
       * Android back button se modal close nahi hoga.
       *
       * IMPORTANT:
       * onRequestClose intentionally empty hai.
       */
      onRequestClose={() => {}}>
      
      <View style={styles.overlay}>
        
        <View style={styles.modalCard}>
          
          {/* Modal heading */}
          <Text style={styles.title}>
            Active Now
          </Text>

          {/* Description */}
          <Text style={styles.description}>
            You are currently inactive. Please become active
            to continue using the TMS application.
          </Text>

          {/* Error */}
          {errorMessage ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>
                {errorMessage}
              </Text>
            </View>
          ) : null}

          {/* Active Now Button */}
          <Pressable
            onPress={handleActivate}
            disabled={isLoading}
            style={({pressed}) => [
              styles.button,

              pressed && !isLoading
                ? styles.buttonPressed
                : null,

              isLoading
                ? styles.buttonDisabled
                : null,
            ]}>
            
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>
                Active Now
              </Text>
            )}
          </Pressable>

        </View>
      </View>
    </Modal>
  );
};

/**
 * Responsive modal styles.
 *
 * Modal card ki width percentage mein hai taake
 * different mobile screen sizes par overflow na ho.
 */
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },

  modalCard: {
    width: '100%',
    maxWidth: 420,
    paddingHorizontal: 24,
    paddingVertical: 28,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: '#111827',
  },

  description: {
    marginTop: 12,
    marginBottom: 24,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    color: '#6B7280',
  },

  errorBox: {
    marginBottom: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
  },

  errorText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    color: '#B91C1C',
  },

  button: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#111827',
  },

  buttonPressed: {
    opacity: 0.8,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default ActiveNowModal;