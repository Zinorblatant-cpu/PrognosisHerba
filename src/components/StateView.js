import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import PrimaryButton from './PrimaryButton';

// Estado não-feliz de uma tela: carregando, erro ou lista vazia.
// Centraliza a aparência desses três casos em todo o app.
export default function StateView({
  variant = 'loading',
  title,
  message,
  actionLabel,
  onAction,
  testID,
}) {
  const icone = { loading: null, error: '⚠️', empty: '📭' }[variant];

  return (
    <View style={styles.container} testID={testID}>
      {variant === 'loading' ? (
        <ActivityIndicator color={colors.primary} size="large" />
      ) : (
        <Text style={styles.icone}>{icone}</Text>
      )}

      {title ? (
        <Text style={[styles.title, variant === 'error' && styles.titleError]}>{title}</Text>
      ) : null}
      {message ? <Text style={styles.message}>{message}</Text> : null}

      {actionLabel && onAction ? (
        <PrimaryButton
          testID={testID ? testID + '-action' : 'state-action'}
          label={actionLabel}
          onPress={onAction}
          variant="secondary"
          style={styles.action}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 16,
  },
  icone: {
    fontSize: 34,
    marginBottom: 12,
  },
  title: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 12,
  },
  titleError: {
    color: colors.error,
  },
  message: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 19,
  },
  action: {
    marginTop: 20,
    paddingHorizontal: 28,
    alignSelf: 'center',
  },
});
