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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Receive Credential</Text>
      <Text style={styles.subtitle}>
        Scan QR code from issuer portal
      </Text>

      <TouchableOpacity style={styles.cameraBox} onPress={handleOpenCamera}>
        <Text style={styles.cameraIcon}>📷</Text>
        <Text style={styles.cameraText}>Tap to Scan QR</Text>
        <Text style={styles.cameraSubtext}>
          Point at QR code from issuer
        </Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
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

      <Text style={styles.info}>
        Ask the issuer to show the QR code from their portal
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  cameraBox: {
    width: 280,
    height: 280,
    borderWidth: 3,
    borderColor: '#007AFF',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    backgroundColor: '#f0f8ff',
    borderStyle: 'dashed'
  },
  cameraIcon: {
    fontSize: 60,
    marginBottom: 10
  },
  cameraText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF'
  },
  cameraSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 5
  },
  testButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20
  },
  testButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  info: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center'
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000'
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 50
  },
  cameraOverlayText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 20
  },
  cancelButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 15,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center'
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  }
});