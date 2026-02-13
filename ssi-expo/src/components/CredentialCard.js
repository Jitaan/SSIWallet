import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function CredentialCard({ credential, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={styles.type}>{credential.type}</Text>
      <Text style={styles.issuer} numberOfLines={1}>
        Issued by: {credential.issuer.substring(8, 28)}...
      </Text>
      <Text style={styles.date}>
        {new Date(credential.issuanceDate).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2
  },
  type: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5
  },
  issuer: {
    fontSize: 12,
    color: '#666',
    marginBottom: 3
  },
  date: {
    fontSize: 12,
    color: '#999'
  }
});