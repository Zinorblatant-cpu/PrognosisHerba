import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

// Retorno curto dentro de um formulário: validação, falha de envio ou
// confirmação de sucesso.
export default function InlineMessage({ type = 'info', text, testID }) {
  if (!text) return null;

  return (
    <Text testID={testID} style={[styles.base, styles[type]]}>
      {text}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    fontSize: 12,
    marginTop: 10,
    lineHeight: 17,
    textAlign: 'center',
    fontWeight: '600',
  },
  success: {
    color: colors.primary,
  },
  error: {
    color: colors.error,
  },
  info: {
    color: colors.textLabel,
  },
});
