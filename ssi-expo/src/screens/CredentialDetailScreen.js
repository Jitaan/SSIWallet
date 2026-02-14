import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import QRCode from 'react-qr-code';
import WalletService from '../services/WalletService';
import QRService from '../services/QRService';

export default function CredentialDetailScreen({ route, navigation }) {
  const { credential, signature, receivedAt } = route.params;

  // Generate QR data for this specific credential
  const credentialQRData = JSON.stringify({
    credential: credential,
    signature: signature,
    sharedAt: new Date().toISOString()
  });

  async function handleDelete() {
    Alert.alert(
      'Delete Credential',
      'Are you sure you want to delete this credential? This cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await WalletService.deleteCredential(credential.id);
              Alert.alert('Success', 'Credential deleted', [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
            } catch (error) {
              Alert.alert('Error', error.message);
            }
          }
        }
      ]
    );
  }

  function renderCredentialData() {
    const data = credential.credentialSubject;
    const entries = Object.entries(data).filter(([key]) => key !== 'id');

    return entries.map(([key, value]) => (
      <View key={key} style={styles.dataRow}>
        <Text style={styles.dataLabel}>{formatKey(key)}:</Text>
        <Text style={styles.dataValue}>{String(value)}</Text>
      </View>
    ));
  }

  function formatKey(key) {
    // Convert camelCase to Title Case
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());
  }

  function getCredentialType() {
    // credential.type is an array like ["VerifiableCredential", "BirthCertificate"]
    return Array.isArray(credential.type)
      ? credential.type[credential.type.length - 1]
      : credential.type;
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconCircle}>
            <Text style={styles.headerIcon}>{getCredentialIcon()}</Text>
          </View>
          <View>
            <Text style={styles.credentialType}>{getCredentialType()}</Text>
            <Text style={styles.headerSubtext}>Verifiable Credential</Text>
          </View>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>✓</Text>
        </View>
      </View>

      {/* QR Code Section */}
      <View style={styles.qrSection}>
        <Text style={styles.sectionTitle}>Share This Credential</Text>
        <Text style={styles.qrSubtitle}>Scan to verify offline</Text>
        <View style={styles.qrBox}>
          <QRCode
            value={credentialQRData}
            size={200}
            bgColor="#0a0a0a"
            fgColor="#ffffff"
          />
        </View>
        <Text style={styles.qrNote}>
          Contains only this credential with signature
        </Text>
      </View>

      {/* Issuer Info */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>ISSUED BY</Text>
        <Text style={styles.issuerName}>
          {credential.issuerName || 'Unknown Issuer'}
        </Text>
        <Text style={styles.issuerDID} numberOfLines={1}>
          {credential.issuer}
        </Text>
      </View>

      {/* Credential Data */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>CREDENTIAL INFORMATION</Text>
        <View style={styles.dataContainer}>
          {renderCredentialData()}
        </View>
      </View>

      {/* Metadata */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>DETAILS</Text>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Credential ID</Text>
          <Text style={styles.detailValue} numberOfLines={1}>
            {credential.id}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Issued Date</Text>
          <Text style={styles.detailValue}>
            {new Date(credential.issuanceDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Text>
        </View>

        {credential.expirationDate && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Expires</Text>
            <Text style={styles.detailValue}>
              {new Date(credential.expirationDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
          </View>
        )}

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Received</Text>
          <Text style={styles.detailValue}>
            {new Date(receivedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Text>
        </View>
      </View>

      {/* Signature Info */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>CRYPTOGRAPHIC PROOF</Text>
        <View style={styles.signatureBox}>
          <Text style={styles.signature} numberOfLines={4}>
            {signature}
          </Text>
        </View>
        <Text style={styles.signatureNote}>
          🔒 This signature proves the credential was issued by the stated issuer and hasn't been tampered with.
        </Text>
      </View>

      {/* Actions */}
      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <Text style={styles.deleteButtonText}>Delete Credential</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );

  // Helper function (add before return statement)
  function getCredentialIcon() {
    const type = getCredentialType();
    const icons = {
      'UniversityDegree': '🎓',
      'BirthCertificate': '👶',
      'RefugeeRegistration': '🆔',
      'VaccinationRecord': '💉',
      'EmploymentRecord': '💼',
      'default': '📄'
    };
    return icons[type] || icons.default;
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a'
  },
  header: {
    backgroundColor: '#1a1a1a',
    padding: 24,
    paddingTop: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a'
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  headerIcon: {
    fontSize: 24
  },
  credentialType: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 2
  },
  headerSubtext: {
    fontSize: 12,
    color: '#888888'
  },
  statusBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center'
  },
  statusText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  qrSection: {
    backgroundColor: '#1a1a1a',
    padding: 24,
    margin: 20,
    marginBottom: 10,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a2a'
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4
  },
  qrSubtitle: {
    fontSize: 13,
    color: '#888888',
    marginBottom: 20
  },
  qrBox: {
    padding: 20,
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#2a2a2a'
  },
  qrNote: {
    fontSize: 11,
    color: '#666666',
    textAlign: 'center',
    fontStyle: 'italic'
  },
  card: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a'
  },
  cardTitle: {
    fontSize: 11,
    color: '#888888',
    fontWeight: '600',
    marginBottom: 16,
    letterSpacing: 1
  },
  issuerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8
  },
  issuerDID: {
    fontSize: 11,
    color: '#666666',
    fontFamily: 'monospace'
  },
  dataContainer: {
    gap: 12
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a'
  },
  dataLabel: {
    fontSize: 13,
    color: '#888888',
    fontWeight: '500',
    flex: 1
  },
  dataValue: {
    fontSize: 14,
    color: '#ffffff',
    flex: 1,
    textAlign: 'right'
  },
  detailRow: {
    marginBottom: 16
  },
  detailLabel: {
    fontSize: 11,
    color: '#888888',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  detailValue: {
    fontSize: 14,
    color: '#ffffff',
    fontFamily: 'monospace'
  },
  signatureBox: {
    backgroundColor: '#0a0a0a',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a'
  },
  signature: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#888888',
    lineHeight: 16
  },
  signatureNote: {
    fontSize: 11,
    color: '#666666',
    lineHeight: 18
  },
  deleteButton: {
    backgroundColor: '#1a1a1a',
    marginHorizontal: 20,
    marginTop: 10,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ef4444'
  },
  deleteButtonText: {
    color: '#ef4444',
    fontSize: 15,
    fontWeight: '600'
  }
});