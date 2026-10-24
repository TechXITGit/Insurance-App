import React, { useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useAuthStore } from './src/store/authStore';
import { useSavedPlansStore } from './src/store/savedPlansStore';
import { useKycStore } from './src/store/kycStore';
import { useInsuredProfileStore } from './src/store/insuredProfileStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  const { initAuth } = useAuthStore();
  const { loadSavedPlans } = useSavedPlansStore();
  const { initKyc } = useKycStore();
  const { loadProfile } = useInsuredProfileStore();

  useEffect(() => {
    initAuth();
    loadSavedPlans();
    initKyc();
    loadProfile();
  }, []);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <View style={styles.outerContainer}>
          <View style={styles.appContainer}>
            <NavigationContainer>
              <StatusBar style="dark" />
              <RootNavigator />
            </NavigationContainer>
          </View>
        </View>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: Platform.OS === 'web' ? '#EDF2F7' : 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appContainer: {
    flex: 1,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 480 : undefined,
    backgroundColor: '#FFFFFF',
    ...(Platform.OS === 'web'
      ? {
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
          borderLeftWidth: 1,
          borderRightWidth: 1,
          borderColor: '#E2E8F0',
        }
      : {}),
  },
});

