import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import WalletService from '../services/WalletService';
import QRService from '../services/QRService';

export default function ShowCredentialScreen() {
  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    prepareData();
  }, []);

  async function prepareData() {
    try {
      const data = await WalletService.prepareCredentialsForSharing();
      setWalletData(data);
    } catch (error) {
      console.error('Error preparing data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>

      <Text style={styles.title}>Your Identity</Text>
      <Text style={styles.subtitle}>Show this screen to the verifier</Text>

      {/* QR Placeholder */}
      <View style={styles.qrBox}>
        <Text style={styles.qrIcon}>▦</Text>
        <Text style={styles.qrLabel}>QR Code</Text>
      </View>

      {/* DID */}
      <View style={styles.infoBox}>
        <Text style={styles.infoLabel}>YOUR DID</Text>
        <Text style={styles.infoValue} numberOfLines={2}>
          {walletData?.did}
        </Text>
      </View>

      {/* Trust Score */}
      <View style={styles.infoBox}>
        <Text style={styles.infoLabel}>TRUST SCORE</Text>
        <Text style={styles.trustScore}>
          {walletData?.trustScore}
        </Text>
      </View>

      {/* Credentials count */}
      <View style={styles.infoBox}>
        <Text style={styles.infoLabel}>CREDENTIALS</Text>
        <Text style={styles.infoValue}>
          {walletData?.credentials?.length || 0} credential(s)
        </Text>
      </View>

      <Text style={styles.footer}>
        Verifier can verify this offline
      </Text>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 40
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
    marginBottom: 30
  },
  qrBox: {
    width: 200,
    height: 200,
    borderWidth: 3,
    borderColor: '#007AFF',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    backgroundColor: '#f0f8ff'
  },
  qrIcon: {
    fontSize: 100,
    color: '#007AFF'
  },
  qrLabel: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600'
  },
  infoBox: {
    width: '100%',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 15,
    marginBottom: 12
  },
  infoLabel: {
    fontSize: 11,
    color: '#999',
    fontWeight: '600',
    marginBottom: 5,
    letterSpacing: 1
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'monospace'
  },
  trustScore: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#34C759'
  },
  footer: {
    marginTop: 20,
    fontSize: 13,
    color: '#999'
  }
});