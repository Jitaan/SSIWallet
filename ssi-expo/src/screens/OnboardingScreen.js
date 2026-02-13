import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import WalletService from '../services/WalletService';

export default function OnboardingScreen({ navigation }) {
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateWallet = async () => {
    setIsCreating(true);
    try {
      const wallet = await WalletService.createWallet();
      
      if (wallet && wallet.did) {
        // Navigate to WalletHome and prevent going back to onboarding
        navigation.replace('WalletHome');
      } else {
        Alert.alert('Error', 'Failed to create wallet. Please try again.');
      }
    } catch (error) {
      console.error('Error creating wallet:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to</Text>
        <Text style={styles.appName}>Identity Wallet</Text>
        <Text style={styles.subtitle}>
          Your secure, decentralized digital identity
        </Text>

        <View style={styles.features}>
          <Text style={styles.featureText}>🔐 Secure & Private</Text>
          <Text style={styles.featureText}>🆔 Self-Sovereign Identity</Text>
          <Text style={styles.featureText}>✅ Verifiable Credentials</Text>
        </View>

        <TouchableOpacity
          style={[styles.button, isCreating && styles.buttonDisabled]}
          onPress={handleCreateWallet}
          disabled={isCreating}
        >
          {isCreating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Create My Identity</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          Your identity is stored securely on your device
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    color: '#666',
    marginBottom: 8,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#0066cc',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  features: {
    marginBottom: 40,
  },
  featureText: {
    fontSize: 18,
    color: '#333',
    marginVertical: 8,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#0066cc',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 8,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#999',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disclaimer: {
    marginTop: 20,
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});