import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';
import WalletService from './src/services/WalletService';

// Screens
import OnboardingScreen from './src/screens/OnboardingScreen';
import WalletHomeScreen from './src/screens/WalletHomeScreen';
import ReceiveCredentialScreen from './src/screens/ReceiveCredentialScreen';
import ShowCredentialScreen from './src/screens/ShowCredentialScreen';
import CredentialDetailScreen from './src/screens/CredentialDetailScreen';

// Define navigation param types
export type RootStackParamList = {
  Onboarding: undefined;
  WalletHome: undefined;
  ReceiveCredential: undefined;
  ShowCredential: undefined;
  CredentialDetail: {
    credential: any;
    signature: string;
    receivedAt: string;
  };
};

// Navigation prop types for each screen
export type OnboardingScreenProps = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;
export type WalletHomeScreenProps = NativeStackScreenProps<RootStackParamList, 'WalletHome'>;
export type ReceiveCredentialScreenProps = NativeStackScreenProps<RootStackParamList, 'ReceiveCredential'>;
export type ShowCredentialScreenProps = NativeStackScreenProps<RootStackParamList, 'ShowCredential'>;
export type CredentialDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'CredentialDetail'>;

const Stack = createNativeStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  const [hasWallet, setHasWallet] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  useEffect(() => {
    checkWallet();
  }, []);
  
  const checkWallet = async (): Promise<void> => {
    try {
      const wallet = await WalletService.loadWallet();
      setHasWallet(!!wallet);
    } catch (error) {
      console.error('Error checking wallet:', error);
      setHasWallet(false);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isLoading) {
    return null; // Or a loading screen
  }
  
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName={hasWallet ? 'WalletHome' : 'Onboarding'}
        screenOptions={{
          headerStyle: {
            backgroundColor: '#007AFF'
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold'
          }
        }}
      >
        <Stack.Screen 
          name="Onboarding" 
          component={OnboardingScreen}
          options={{ 
            headerShown: false 
          }}
        />
        
        <Stack.Screen 
          name="WalletHome" 
          component={WalletHomeScreen}
          options={{ 
            title: 'SSI Wallet',
            headerLeft: () => null // Disable back button
          }}
        />
        
        <Stack.Screen 
          name="ReceiveCredential" 
          component={ReceiveCredentialScreen}
          options={{ 
            title: 'Scan QR Code',
            presentation: 'modal'
          }}
        />
        
        <Stack.Screen 
          name="ShowCredential" 
          component={ShowCredentialScreen}
          options={{ 
            title: 'Share Credentials',
            presentation: 'modal'
          }}
        />
        
        <Stack.Screen 
          name="CredentialDetail" 
          component={CredentialDetailScreen}
          options={{ 
            title: 'Credential Details'
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;