import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

let isWeb = false;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const RN = require('react-native');
  isWeb = RN?.Platform?.OS === 'web';
} catch {
  isWeb = typeof window !== 'undefined';
}

export const storage = {
  // Non-sensitive storage (AsyncStorage)
  async getItem<T = string>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      if (!value) return null;
      try {
        return JSON.parse(value) as T;
      } catch {
        return value as unknown as T;
      }
    } catch (error) {
      console.warn(`Error reading AsyncStorage key "${key}":`, error);
      return null;
    }
  },

  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      await AsyncStorage.setItem(key, stringValue);
    } catch (error) {
      console.warn(`Error setting AsyncStorage key "${key}":`, error);
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.warn(`Error removing AsyncStorage key "${key}":`, error);
    }
  },

  // Sensitive secure storage (SecureStore on iOS/Android, safe fallback on Web)
  async getSecureItem(key: string): Promise<string | null> {
    try {
      if (isWeb) {
        return await AsyncStorage.getItem(`__sec_${key}`);
      }
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.warn(`Error reading SecureStore key "${key}":`, error);
      return null;
    }
  },

  async setSecureItem(key: string, value: string): Promise<void> {
    try {
      if (isWeb) {
        await AsyncStorage.setItem(`__sec_${key}`, value);
      } else {
        await SecureStore.setItemAsync(key, value);
      }
    } catch (error) {
      console.warn(`Error writing SecureStore key "${key}":`, error);
    }
  },

  async removeSecureItem(key: string): Promise<void> {
    try {
      if (isWeb) {
        await AsyncStorage.removeItem(`__sec_${key}`);
      } else {
        await SecureStore.deleteItemAsync(key);
      }
    } catch (error) {
      console.warn(`Error deleting SecureStore key "${key}":`, error);
    }
  },
};
