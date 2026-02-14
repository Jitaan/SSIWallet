import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import QRCode from 'react-qr-code';
import WalletService from '../services/WalletService';
import QRService from '../services/QRService';

export default function ShowCredentialScreen() {
  const [walletData, setWalletData] = useState(null);
  const [qrData, setQrData] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    prepareData();
  }, []);

  async function prepareData() {
    try {
      const data = await WalletService.prepareCredentialsForSharing();
      setWalletData(data);
      
      const qrString = QRService.prepareWalletQR(
        data.credentials || [],
        data.did,
        data.trustScore
      );
      setQrData(qrString);
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
    {/* Header */}
    <View style={styles.header}>
      <Text style={styles.title}>Your Identity</Text>
      <Text style={styles.subtitle}>Show this to verifier for offline verification</Text>
    </View>

    {/* QR Code Card */}
    <View style={styles.qrCard}>
      <Text style={styles.qrCardTitle}>Scan to Verify</Text>
      <View style={styles.qrBox}>
        {qrData ? (
          <QRCode
            value={qrData}
            size={220}
            bgColor="#0a0a0a"
            fgColor="#ffffff"
          />
        ) : (
          <View style={styles.qrPlaceholder}>
            <Text style={styles.qrIcon}>▦</Text>
            <Text style={styles.qrLabel}>No data</Text>
          </View>
        )}
      </View>
      <Text style={styles.qrNote}>
        Contains all your verified credentials
      </Text>
    </View>

    {/* Info Cards Grid */}
    <View style={styles.infoGrid}>
      {/* Trust Score Card */}
      <View style={styles.infoCard}>
        <Text style={styles.infoLabel}>TRUST SCORE</Text>
        <Text style={[styles.trustScore, {
          color: getTrustScoreColor(walletData?.trustScore || 0)
        }]}>
          {walletData?.trustScore || 0}
        </Text>
        <Text style={styles.infoSubtext}>
          {getTrustScoreLabel(walletData?.trustScore || 0)}
        </Text>
      </View>

      {/* Credentials Count Card */}
      <View style={styles.infoCard}>
        <Text style={styles.infoLabel}>CREDENTIALS</Text>
        <Text style={styles.credentialCount}>
          {walletData?.credentials?.length || 0}
        </Text>
        <Text style={styles.infoSubtext}>
          Verified docs
        </Text>
      </View>
    </View>

    {/* DID Card */}
    <View style={styles.didCard}>
      <Text style={styles.didLabel}>YOUR DECENTRALIZED ID</Text>
      <Text style={styles.didValue} numberOfLines={2}>
        {walletData?.did || 'N/A'}
      </Text>
      <Text style={styles.didNote}>
        This is your unique identity on the network
      </Text>
    </View>

    {/* Footer */}
    <View style={styles.footer}>
      <Text style={styles.footerText}>
        All verifications happen offline using cryptographic signatures
      </Text>
    </View>
  </ScrollView>
);

// Helper functions (add these before the return statement)
}

function getTrustScoreColor(score) {
  if (score >= 80) return '#10b981'; // Green
  if (score >= 60) return '#3b82f6'; // Blue
  if (score >= 40) return '#f59e0b'; // Orange
  return '#ef4444'; // Red
}

function getTrustScoreLabel(score) {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Building';
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#0a0a0a',
    padding: 20,
    paddingTop: 60
  },
  header: {
    marginBottom: 30,
    alignItems: 'center'
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
    maxWidth: 280
  },
  qrCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a2a'
  },
  qrCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 20
  },
  qrBox: {
    padding: 20,
    backgroundColor: '#0a0a0a',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#2a2a2a'
  },
  qrPlaceholder: {
    width: 220,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center'
  },
  qrIcon: {
    fontSize: 80,
    color: '#2a2a2a',
    marginBottom: 10
  },
  qrLabel: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '600'
  },
  qrNote: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center'
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a2a'
  },
  infoLabel: {
    fontSize: 10,
    color: '#888888',
    fontWeight: '600',
    marginBottom: 12,
    letterSpacing: 1,
    textTransform: 'uppercase'
  },
  trustScore: {
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 4
  },
  credentialCount: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 4
  },
  infoSubtext: {
    fontSize: 12,
    color: '#666666'
  },
  didCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2a2a2a'
  },
  didLabel: {
    fontSize: 10,
    color: '#888888',
    fontWeight: '600',
    marginBottom: 10,
    letterSpacing: 1,
    textTransform: 'uppercase'
  },
  didValue: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#ffffff',
    marginBottom: 12,
    lineHeight: 18
  },
  didNote: {
    fontSize: 11,
    color: '#666666',
    fontStyle: 'italic'
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20
  },
  footerIcon: {
    fontSize: 32,
    marginBottom: 12,
    opacity: 0.5
  },
  footerText: {
    fontSize: 13,
    color: '#666666',
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 20
  }
});