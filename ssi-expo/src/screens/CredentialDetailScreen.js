import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import WalletService from '../services/WalletService';

export default function CredentialDetailScreen({ route, navigation }) {
  const { credential, signature, receivedAt } = route.params;
  
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
        <Text style={styles.credentialType}>{getCredentialType()}</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>✓ Verified</Text>
        </View>
      </View>
      
      {/* Issuer Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Issued By</Text>
        <Text style={styles.issuerName}>
          {credential.issuerName || 'Unknown Issuer'}
        </Text>
        <Text style={styles.issuerDID} numberOfLines={1}>
          {credential.issuer}
        </Text>
      </View>
      
      {/* Credential Data */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Credential Information</Text>
        {renderCredentialData()}
      </View>
      
      {/* Metadata */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Details</Text>
        
        <View style={styles.metadataRow}>
          <Text style={styles.metadataLabel}>Credential ID:</Text>
          <Text style={styles.metadataValue} numberOfLines={1}>
            {credential.id}
          </Text>
        </View>
        
        <View style={styles.metadataRow}>
          <Text style={styles.metadataLabel}>Issued Date:</Text>
          <Text style={styles.metadataValue}>
            {new Date(credential.issuanceDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Text>
        </View>
        
        {credential.expirationDate && (
          <View style={styles.metadataRow}>
            <Text style={styles.metadataLabel}>Expires:</Text>
            <Text style={styles.metadataValue}>
              {new Date(credential.expirationDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
          </View>
        )}
        
        <View style={styles.metadataRow}>
          <Text style={styles.metadataLabel}>Received:</Text>
          <Text style={styles.metadataValue}>
            {new Date(receivedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Text>
        </View>
      </View>
      
      {/* Signature Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cryptographic Proof</Text>
        <Text style={styles.signatureLabel}>Digital Signature:</Text>
        <Text style={styles.signature} numberOfLines={3}>
          {signature}
        </Text>
        <Text style={styles.signatureNote}>
          This signature proves the credential was issued by the stated issuer and hasn't been tampered with.
        </Text>
      </View>
      
      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>🗑 Delete Credential</Text>
        </TouchableOpacity>
      </View>
      
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  credentialType: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1
  },
  statusBadge: {
    backgroundColor: '#34C759',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600'
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 10
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15
  },
  issuerName: {
    fontSize: 18,
    fontWeight: '500',
    color: '#000',
    marginBottom: 5
  },
  issuerDID: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace'
  },
  dataRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  dataLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    width: 140
  },
  dataValue: {
    fontSize: 14,
    color: '#000',
    flex: 1
  },
  metadataRow: {
    marginBottom: 12
  },
  metadataLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4
  },
  metadataValue: {
    fontSize: 14,
    color: '#000'
  },
  signatureLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8
  },
  signature: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#333',
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10
  },
  signatureNote: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic'
  },
  actions: {
    padding: 20
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center'
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  }
});