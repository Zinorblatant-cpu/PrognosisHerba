import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export default function AppLogo() {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <Text style={styles.icon}>🌿</Text>
      </View>
      <Text style={styles.logoText}>
        <Text style={styles.logoWhite}>Prognosis</Text>
        <Text style={styles.logoGreen}>Herba</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  iconWrapper: {
    marginRight: 8,
  },
  icon: {
    fontSize: 28,
  },
  logoText: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  logoWhite: {
    color: colors.text,
  },
  logoGreen: {
    color: colors.primary,
  },
});
