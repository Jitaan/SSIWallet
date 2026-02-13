import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function TrustScoreBadge({ score }) {

  const getColor = () => {
    if (score < 10) return '#FF3B30'; // red
    if (score < 20) return '#FF9500'; // orange
    if (score < 40) return '#FFCC00'; // yellow
    return '#34C759';                 // green
  };

  const getLevel = () => {
    if (score < 10) return 'Unverified';
    if (score < 20) return 'Basic';
    if (score < 40) return 'Established';
    return 'Strong';
  };

  return (
    <View style={[styles.badge, { backgroundColor: getColor() }]}>
      <Text style={styles.score}>{score}</Text>
      <Text style={styles.level}>{getLevel()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignItems: 'center'
  },
  score: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff'
  },
  level: {
    fontSize: 10,
    color: '#fff',
    marginTop: 2
  }
});