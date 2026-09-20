import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

// Cabeçalho padrão das telas internas: botão voltar + título + subtítulo
// opcional + slot à direita. Garante o mesmo espaçamento em todas as telas.
export default function ScreenHeader({ title, subtitle, onBack, right, testID }) {
  return (
    <View style={styles.container} testID={testID}>
      {onBack ? (
        <TouchableOpacity
          testID="back-button"
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="voltar"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.backArrow}>‹ Voltar</Text>
        </TouchableOpacity>
      ) : null}

      <View style={styles.titleRow}>
        <View style={styles.titleColumn}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {right ? <View style={styles.right}>{right}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  backArrow: {
    color: colors.primary,
    fontSize: 14,
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  titleColumn: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  right: {
    marginLeft: 12,
  },
});
