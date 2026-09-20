import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

// Bloco de conteúdo padrão do app. Vira um card clicável quando recebe onPress
// (e nesse caso exibe a seta de navegação à direita do título).
export default function Card({ title, subtitle, right, children, onPress, testID, style }) {
  const Container = onPress ? TouchableOpacity : View;
  const containerProps = onPress ? { onPress, activeOpacity: 0.8 } : {};

  return (
    <Container testID={testID} style={[styles.card, style]} {...containerProps}>
      {title || subtitle || right || onPress ? (
        <View style={styles.header}>
          <View style={styles.headerText}>
            {title ? <Text style={styles.title}>{title}</Text> : null}
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
          {right || (onPress ? <Text style={styles.arrow}>›</Text> : null)}
        </View>
      ) : null}
      {children}
    </Container>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerText: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  arrow: {
    color: colors.textMuted,
    fontSize: 20,
    marginLeft: 8,
  },
});
