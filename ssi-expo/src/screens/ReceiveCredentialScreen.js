import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import WalletService from '../services/WalletService';
import QRService from '../services/QRService';

export default function ReceiveCredentialScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  async function handleScan({ data }) {
    if (scanned || loading) return;
    setScanned(true);
    setShowCamera(false);
    await handleQRData(data);
  }

  async function handleQRData(rawData) {
    setLoading(true);
    try {
      const qrData = QRService.parseQRData(rawData);

      if (!QRService.isValidCredentialQR(qrData)) {
        throw new Error('Invalid credential format');
      }

      const wallet = await WalletService.addCredential(qrData);

      Alert.alert(
        '✅ Success!',
        `Credential added!\nTrust Score: ${wallet.trustScore}`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert(
        '❌ Error',
        error.message,
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
      setScanned(false);
    }
  }

  async function handleOpenCamera() {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert(
          'Permission Required',
          'Camera access is needed to scan QR codes.',
          [{ text: 'OK' }]
        );
        return;
      }
    }
    setShowCamera(true);
  }

  async function testWithBackendCredential() {
    const testCredential = JSON.stringify({
      credential: {
        id: 'cred-' + Date.now(),
        type: 'RefugeeRegistration',
        issuer: 'did:key:issuer123',
        issuanceDate: new Date().toISOString(),
        credentialSubject: {
          id: 'did:key:recipient456',
          name: 'Amara',
          registrationNumber: 'REF-2025-001234'
        }
      },
      signature: 'mock-signature-from-backend'
    });

    await handleQRData(testCredential);
  }

  if (showCamera) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={handleScan}
        />
        <View style={styles.cameraOverlay}>
          <Text style={styles.cameraOverlayText}>
            Point at QR code from issuer
          </Text>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setShowCamera(false)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  return showCamera ? (
    <View style={styles.cameraContainer}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={handleScan}
      />
      <View style={styles.cameraOverlay}>
        <View style={styles.scanFrame} />
        <Text style={styles.cameraOverlayText}>
          Point camera at QR code
        </Text>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => setShowCamera(false)}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  ) : (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Receive Credential</Text>
        <Text style={styles.subtitle}>
          Scan QR code from issuer to add to your wallet
        </Text>
      </View>

      <TouchableOpacity style={styles.scanCard} onPress={handleOpenCamera}>
        <View style={styles.scanIcon}>
          <Text style={styles.scanIconText}>📷</Text>
        </View>
        <Text style={styles.scanText}>Tap to Scan QR Code</Text>
        <Text style={styles.scanSubtext}>
          Point at credential QR from issuer
        </Text>
      </TouchableOpacity>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Processing credential...</Text>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.testButton}
          onPress={testWithBackendCredential}
        >
          <Text style={styles.testButtonText}>
            🧪 Test with Sample Credential
          </Text>
        </TouchableOpacity>
      )}

      <View style={styles.infoCard}>
        <Text style={styles.infoIcon}>ℹ️</Text>
        <Text style={styles.infoText}>
          Ask the issuer to display their credential QR code, then scan it to add to your wallet
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    padding: 20,
    paddingTop: 60
  },
  header: {
    marginBottom: 40,
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
    maxWidth: 300
  },
  scanCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#2a2a2a',
    borderStyle: 'dashed'
  },
  scanIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  scanIconText: {
    fontSize: 50
  },
  scanText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8
  },
  scanSubtext: {
    fontSize: 13,
    color: '#888888',
    textAlign: 'center'
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20
  },
  loadingText: {
    fontSize: 14,
    color: '#888888',
    marginTop: 12
  },
  testButton: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#3b82f6'
  },
  testButtonText: {
    color: '#3b82f6',
    fontSize: 15,
    fontWeight: '600'
  },
  infoCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#2a2a2a'
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#888888',
    lineHeight: 20
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000'
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 3,
    borderColor: '#ffffff',
    borderRadius: 20,
    marginBottom: 40
  },
  cameraOverlayText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 40,
    textAlign: 'center'
  },
  cancelButton: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ef4444'
  },
  cancelButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600'
  }
});