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
      {/* Hero Section */}
      <View style={styles.hero}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoIcon}>🔐</Text>
        </View>
        <Text style={styles.title}>Welcome to</Text>
        <Text style={styles.appName}>Astitva</Text>
        <Text style={styles.subtitle}>
          Identity Without Limits
        </Text>
      </View>

      {/* Features */}
      <View style={styles.features}>
        <View style={styles.featureCard}>
          <Text style={styles.featureIcon}>🔒</Text>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Secure & Private</Text>
            <Text style={styles.featureDesc}>Your keys, your identity</Text>
          </View>
        </View>

        <View style={styles.featureCard}>
          <Text style={styles.featureIcon}>🌐</Text>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Self-Sovereign</Text>
            <Text style={styles.featureDesc}>You own your data</Text>
          </View>
        </View>

        <View style={styles.featureCard}>
          <Text style={styles.featureIcon}>✅</Text>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Verifiable</Text>
            <Text style={styles.featureDesc}>Cryptographically proven</Text>
          </View>
        </View>

        <View style={styles.featureCard}>
          <Text style={styles.featureIcon}>📡</Text>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Offline First</Text>
            <Text style={styles.featureDesc}>Works without internet</Text>
          </View>
        </View>
      </View>

      {/* CTA Button */}
      <TouchableOpacity
        style={[styles.button, isCreating && styles.buttonDisabled]}
        onPress={handleCreateWallet}
        disabled={isCreating}
      >
        {isCreating ? (
          <View style={styles.buttonContent}>
            <ActivityIndicator color="#ffffff" size="small" />
            <Text style={styles.buttonText}>Creating...</Text>
          </View>
        ) : (
          <Text style={styles.buttonText}>Create My Identity</Text>
        )}
      </TouchableOpacity>

      {/* Disclaimer */}
      <View style={styles.disclaimerCard}>
        <Text style={styles.disclaimer}>
          🔐 Your identity is stored securely on your device. You are in full control.
        </Text>
      </View>
    </View>
  </View>
);
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a'
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    paddingTop: 60
  },
  hero: {
    alignItems: 'center',
    marginBottom: 40
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#2a2a2a'
  },
  logoIcon: {
    fontSize: 50
  },
  title: {
    fontSize: 18,
    color: '#888888',
    marginBottom: 8
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12
  },
  subtitle: {
    fontSize: 15,
    color: '#888888',
    textAlign: 'center',
    maxWidth: 320,
    lineHeight: 22
  },
  features: {
    marginBottom: 40,
    gap: 12
  },
  featureCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a2a'
  },
  featureIcon: {
    fontSize: 28,
    marginRight: 16
  },
  featureContent: {
    flex: 1
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2
  },
  featureDesc: {
    fontSize: 13,
    color: '#888888'
  },
  button: {
    backgroundColor: '#3b82f6',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5
  },
  buttonDisabled: {
    backgroundColor: '#2a2a2a',
    shadowOpacity: 0
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold'
  },
  disclaimerCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a'
  },
  disclaimer: {
    fontSize: 12,
    color: '#888888',
    textAlign: 'center',
    lineHeight: 18
  }
});