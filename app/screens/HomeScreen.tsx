import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function HomeScreen({ navigate }: { navigate: (screen: string) => void }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vindo à Tela Inicial</Text>
      <Button title="Registro" onPress={() => navigate('Register')} />
      <Button title="Login" onPress={() => navigate('Login')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
  },
});
