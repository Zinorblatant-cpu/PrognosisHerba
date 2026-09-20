import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

// Selo colorido usado para status de vegetação, nível de previsão de IA e
// status da agenda. Mantém o mesmo formato visual em todas as telas.
export default function StatusBadge({ label, color, testID, style }) {
  return (
    <Text testID={testID} style={[styles.badge, { backgroundColor: color }, style]}>
      {label}
    </Text>
  );
}

const styles = StyleSheet.create({
  badge: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '600',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    overflow: 'hidden',
  },
});
