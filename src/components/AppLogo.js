import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

export default function AppLogo() {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/logoPrognosisherba.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 200,
    height: 80,
  },
});
