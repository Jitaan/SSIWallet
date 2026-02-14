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
      <Text style={styles.title}>Astitva</Text>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{wallet.credentials.length}</Text>
          <Text style={styles.statLabel}>Credentials</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{wallet.credentials.length}</Text>
          <Text style={styles.statLabel}>Verified</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>Today</Text>
          <Text style={styles.statLabel}>Last Activity</Text>
        </View>
      </View>

      {/* Trust Score Widget */}
      <View style={styles.trustScoreCard}>
        <Text style={styles.trustScoreTitle}>Trust Score</Text>
        <View style={styles.trustScoreContent}>
          <View style={[styles.trustScoreCircle, {
            borderColor: getTrustScoreColor(wallet.trustScore)
          }]}>
            <Text style={[styles.trustScoreValue, {
              color: getTrustScoreColor(wallet.trustScore)
            }]}>{wallet.trustScore}</Text>
            <Text style={styles.trustScoreMax}>/100</Text>
          </View>
          <View style={styles.trustScoreRight}>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, {
                width: `${wallet.trustScore}%`,
                backgroundColor: getTrustScoreColor(wallet.trustScore)
              }]} />
            </View>
            <Text style={styles.trustScoreSubtext}>
              {getTrustScoreLabel(wallet.trustScore)}
            </Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('ReceiveCredential')}
        >
          <View style={styles.buttonIcon}>
            <Text style={styles.buttonIconText}>📥</Text>
          </View>
          <Text style={styles.actionButtonText}>Receive</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('ShowCredential')}
        >
          <View style={styles.buttonIcon}>
            <Text style={styles.buttonIconText}>📤</Text>
          </View>
          <Text style={styles.actionButtonText}>Share</Text>
        </TouchableOpacity>
      </View>

      {/* Credentials Section */}
      <View style={styles.credentialsHeader}>
        <Text style={styles.credentialsTitle}>My Credentials</Text>
        <Text style={styles.credentialsCount}>{wallet.credentials.length}</Text>
      </View>

      {wallet.credentials.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🔐</Text>
          <Text style={styles.emptyText}>No credentials yet</Text>
          <Text style={styles.emptySubtext}>
            Tap Receive to add your first credential
          </Text>
        </View>
      ) : (
        <FlatList
          data={wallet.credentials}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.credentialCard}
              onPress={() => navigation.navigate('CredentialDetail', {
                credential: item.credential,
                signature: item.signature,
                receivedAt: item.receivedAt
              })}
            >
              <View style={styles.credentialIcon}>
                <Text style={styles.credentialIconText}>
                  {getCredentialIcon(item.credential.type)}
                </Text>
              </View>
              <View style={styles.credentialInfo}>
                <Text style={styles.credentialType}>
                  {getCredentialTypeName(item.credential.type)}
                </Text>
                <Text style={styles.credentialIssuer} numberOfLines={1}>
                  {item.credential.issuerName || 'Unknown Issuer'}
                </Text>
                <Text style={styles.credentialDate}>
                  {new Date(item.receivedAt).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.credentialBadge}>
                <Text style={styles.badgeText}>✓</Text>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.credentialsList}
        />
      )}

      {/* Reset Button */}
      <TouchableOpacity
        style={styles.resetButton}
        onPress={resetWallet}
      >
        <Text style={styles.resetButtonText}>Reset Wallet</Text>
      </TouchableOpacity>
    </View>
  );

  // Helper functions (add these above the return statement)
  function getTrustScoreColor(score) {
    if (score >= 80) return '#10b981'; // Green
    if (score >= 60) return '#3b82f6'; // Blue
    if (score >= 30) return '#f59e0b'; // Orange
    return '#ef4444'; // Red
  }

  function getTrustScoreLabel(score) {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 30) return 'Fair';
    return 'Building';
  }

  function getCredentialIcon(type) {
    const typeStr = Array.isArray(type) ? type[type.length - 1] : type;
    const icons = {
      'UniversityDegree': '🎓',
      'BirthCertificate': '👶',
      'RefugeeRegistration': '🆔',
      'VaccinationRecord': '💉',
      'EmploymentRecord': '💼',
      'default': '📄'
    };
    return icons[typeStr] || icons.default;
  }

  function getCredentialTypeName(type) {
    const typeStr = Array.isArray(type) ? type[type.length - 1] : type;
    return typeStr.replace(/([A-Z])/g, ' $1').trim();
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    padding: 20,
    paddingTop: 60
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 10
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a2a'
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4
  },
  statLabel: {
    fontSize: 11,
    color: '#888888',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  trustScoreCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5
  },
  trustScoreLabel: {
    fontSize: 13,
    color: '#ffffff',
    opacity: 0.9,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  trustScoreValue: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4
  },
  trustScoreSubtext: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.8,
    fontWeight: '600'
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a2a'
  },
  buttonIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12
  },
  buttonIconText: {
    fontSize: 24
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff'
  },
  credentialsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  credentialsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff'
  },
  credentialsCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#888888',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12
  },
  credentialsList: {
    paddingBottom: 20
  },
  credentialCard: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a2a'
  },
  credentialIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  credentialIconText: {
    fontSize: 24
  },
  credentialInfo: {
    flex: 1
  },
  credentialType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2
  },
  credentialIssuer: {
    fontSize: 13,
    color: '#888888',
    marginBottom: 2
  },
  credentialDate: {
    fontSize: 11,
    color: '#666666'
  },
  credentialBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center'
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold'
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
    opacity: 0.3
  },
  emptyText: {
    fontSize: 18,
    color: '#666666',
    marginBottom: 8,
    fontWeight: '600'
  },
  emptySubtext: {
    fontSize: 14,
    color: '#444444',
    textAlign: 'center',
    maxWidth: 250
  },
  didContainer: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a'
  },
  didLabel: {
    fontSize: 10,
    color: '#888888',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  did: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#ffffff',
    opacity: 0.7
  },
  resetButton: {
    backgroundColor: '#1a1a1a',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ef4444',
    marginBottom: 20
  },
  resetButtonText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600'
  },
  title : {
    fontSize: 38,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 20,
    marginTop: 10,
    textAlign: 'left'
  },
  // Update these styles
trustScoreCard: {
  backgroundColor: '#1a1a1a',
  padding: 24,
  borderRadius: 16,
  marginBottom: 20,
  borderWidth: 1,
  borderColor: '#2a2a2a'
},
trustScoreTitle: {
  fontSize: 20,
  color: '#ffffff',
  fontWeight: 'bold',
  marginBottom: 20
},
trustScoreContent: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 20
},
trustScoreCircle: {
  width: 100,
  height: 100,
  borderRadius: 50,
  borderWidth: 6,
  backgroundColor: '#0a0a0a',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'relative'
},
trustScoreValue: {
  fontSize: 36,
  fontWeight: 'bold'
},
trustScoreMax: {
  fontSize: 14,
  color: '#666666',
  marginTop: -4
},
trustScoreRight: {
  flex: 1,
  justifyContent: 'center'
},
progressBarContainer: {
  height: 8,
  backgroundColor: '#2a2a2a',
  borderRadius: 4,
  overflow: 'hidden',
  marginBottom: 12
},
progressBar: {
  height: '100%',
  borderRadius: 4
},
trustScoreSubtext: {
  fontSize: 16,
  color: '#ffffff',
  fontWeight: '500'
}
});