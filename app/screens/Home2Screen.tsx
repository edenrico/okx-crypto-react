import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Home2Screen({
  walletId,
}: {
  walletId: string | null;
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vindo à Home2</Text>
      {walletId ? (
        <Text style={styles.walletId}>Wallet ID: {walletId}</Text>
      ) : (
        <Text style={styles.walletId}>Nenhum Wallet ID disponível</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  title: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 16,
  },
  walletId: {
    fontSize: 16,
    color: '#1E90FF',
  },
});
