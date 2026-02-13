import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import WalletService from '../services/WalletService';
import TrustScoreBadge from '../components/TrustScoreBadge';
import CredentialCard from '../components/CredentialCard';

export default function WalletHomeScreen({ navigation }) {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWallet();
    const unsubscribe = navigation.addListener('focus', loadWallet);
    return unsubscribe;
  }, [navigation]);

  async function loadWallet() {
    const w = await WalletService.loadWallet();
    setWallet(w);
    setLoading(false);
  }

  async function resetWallet() {
    Alert.alert(
      'Reset Wallet',
      'This will delete your wallet. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await SecureStore.deleteItemAsync('wallet');
            navigation.replace('Onboarding');
          }
        }
      ]
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Identity</Text>
        <TrustScoreBadge score={wallet.trustScore} />
      </View>

      {/* DID Display */}
      <View style={styles.didContainer}>
        <Text style={styles.didLabel}>Your DID:</Text>
        <Text style={styles.did} numberOfLines={1}>
          {wallet.did}
        </Text>
      </View>

      {/* Credentials List */}
      <Text style={styles.sectionTitle}>
        My Credentials ({wallet.credentials.length})
      </Text>

      {wallet.credentials.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No credentials yet</Text>
          <Text style={styles.emptySubtext}>
            Scan a QR code to receive your first credential
          </Text>
        </View>
      ) : (
        <FlatList
          data={wallet.credentials}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <CredentialCard
              credential={item.credential}
              onPress={() => navigation.navigate('CredentialDetail', {
                credential: item.credential,
                signature: item.signature,
                receivedAt: item.receivedAt
              })}
            />
          )}
        />
      )}

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('ReceiveCredential')}
        >
          <Text style={styles.buttonText}>📥 Receive Credential</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('ShowCredential')}
        >
          <Text style={styles.buttonText}>📤 Show My Credentials</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.resetButton}
          onPress={resetWallet}
        >
          <Text style={styles.buttonText}>🔄 Reset Wallet</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold'
  },
  didContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20
  },
  didLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 5
  },
  did: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#333'
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginBottom: 5
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center'
  },
  actions: {
    marginTop: 20
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10
  },
  secondaryButton: {
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10
  },
  resetButton: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  }
});