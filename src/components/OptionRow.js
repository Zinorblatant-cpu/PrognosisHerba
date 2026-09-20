import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

// Linha de seleção única (turno, motivo, cenário de mock). Usa o mesmo
// contorno verde dos inputs para manter a identidade visual.
export default function OptionRow({ title, description, selected, onPress, testID, right }) {
  return (
    <TouchableOpacity
      testID={testID}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      style={[styles.container, selected && styles.containerSelected]}
    >
      <View style={styles.texts}>
        <Text style={[styles.title, selected && styles.titleSelected]}>{title}</Text>
        {description ? (
          <Text style={[styles.description, selected && styles.descriptionSelected]}>
            {description}
          </Text>
        ) : null}
      </View>
      {right ? <Text style={[styles.right, selected && styles.titleSelected]}>{right}</Text> : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  containerSelected: {
    backgroundColor: colors.primary,
  },
  texts: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  titleSelected: {
    color: colors.background,
  },
  description: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 3,
    lineHeight: 15,
  },
  descriptionSelected: {
    color: colors.background,
  },
  right: {
    color: colors.textLabel,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 10,
  },
});
