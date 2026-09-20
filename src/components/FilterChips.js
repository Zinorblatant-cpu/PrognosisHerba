import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

// Barra de filtros por status. `options` = [{ id, label }].
export default function FilterChips({ options, value, onChange, testIDPrefix = 'filtro' }) {
  return (
    <View style={styles.row}>
      {options.map((option) => {
        const ativo = option.id === value;
        return (
          <TouchableOpacity
            key={option.id}
            testID={testIDPrefix + '-' + option.id}
            onPress={() => onChange(option.id)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityState={{ selected: ativo }}
            style={[styles.chip, ativo && styles.chipAtivo]}
          >
            <Text style={[styles.label, ativo && styles.labelAtivo]}>{option.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipAtivo: {
    backgroundColor: colors.primary,
  },
  label: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  labelAtivo: {
    color: colors.background,
  },
});
