import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

// Campo de formulário padrão: rótulo + input + mensagem de erro.
export default function FormInput({
  label,
  error,
  testID,
  errorTestID,
  style,
  multiline = false,
  ...inputProps
}) {
  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        testID={testID}
        style={[styles.input, multiline && styles.multiline, !!error && styles.inputError, style]}
        placeholderTextColor={colors.textMuted}
        multiline={multiline}
        {...inputProps}
      />
      {error ? (
        <Text testID={errorTestID} style={styles.errorText}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 4,
  },
  label: {
    color: colors.textLabel,
    fontSize: 13,
    marginBottom: 6,
    marginTop: 4,
  },
  input: {
    borderWidth: 1.5,
    borderColor: colors.inputBorder,
    borderRadius: 6,
    backgroundColor: colors.inputBackground,
    color: colors.text,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 13,
    marginBottom: 4,
    letterSpacing: 1,
  },
  multiline: {
    minHeight: 70,
    textAlignVertical: 'top',
    letterSpacing: 0,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginBottom: 8,
  },
});
