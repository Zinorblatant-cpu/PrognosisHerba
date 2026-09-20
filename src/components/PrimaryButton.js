import React from 'react';
import { Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

// Botão padrão do app em três variantes. Durante o carregamento o toque é
// bloqueado para impedir envio duplicado, sem mudar a altura do botão.
export default function PrimaryButton({
  label,
  onPress,
  testID,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
}) {
  const inativo = loading || disabled;

  return (
    <TouchableOpacity
      testID={testID}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={inativo}
      accessibilityRole="button"
      accessibilityState={{ disabled: inativo, busy: loading }}
      style={[styles.base, styles[variant], inativo && styles.inativo, style]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? colors.background : colors.primary}
          size="small"
        />
      ) : (
        <Text style={[styles.label, styles[`${variant}Label`]]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  danger: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.error,
  },
  inativo: {
    opacity: 0.6,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 13,
    letterSpacing: 1,
  },
  primaryLabel: {
    color: colors.background,
  },
  secondaryLabel: {
    color: colors.primary,
  },
  dangerLabel: {
    color: colors.error,
  },
});
