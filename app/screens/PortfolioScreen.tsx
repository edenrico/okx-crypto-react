import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import axios from 'axios';

interface Cripto {
  idCripto?: string;
  nome: string;
  precoAtual: number;
  sigla?: string;
}

interface Wallet {
  keyId: string;
  bitcoinBalance: number;
  dogecoinBalance: number;
  usdBalance: number;
  xrpBalance: number;
  ethereumBalance: number; // Novo campo para Ethereum
  criptosCompradas: Cripto[];
}

interface PortfolioScreenProps {
  walletId: string | null;
  navigate: (screen: string, params?: any) => void;
}

export default function PortfolioScreen({ walletId, navigate }: PortfolioScreenProps) {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchWallet = async () => {
      if (!walletId) {
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get<Wallet>(`http://192.168.0.173:8080/api/wallet/balance/${walletId}`);
        console.log('Dados da carteira recebidos:', response.data);
        setWallet(response.data);
      } catch (error) {
        console.error('Erro ao buscar carteira:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchWallet();
  }, [walletId]);

  const renderItem = ({ item }: { item: Cripto }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemName}>{item.nome} ({item.sigla})</Text>
      <Text style={styles.itemDetails}>Preço: ${item.precoAtual.toFixed(2)}</Text>
    </View>
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#1E90FF" />;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={() => navigate('Home2')}>
        <Text style={styles.buttonText}>Voltar</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Portfólio</Text>
      {walletId ? (
        <Text style={styles.walletId}>Wallet ID: {walletId}</Text>
      ) : (
        <Text style={styles.walletId}>Nenhum Wallet ID disponível</Text>
      )}

      {wallet ? (
        <>
          <Text style={styles.balance}>Saldo USD: ${wallet.usdBalance.toFixed(2)}</Text>
       
          
          <Text style={styles.subtitle}>Criptomoedas Compradas:</Text>

          <Text style={styles.balance}>Bitcoin: {wallet.bitcoinBalance}</Text>
          <Text style={styles.balance}>Dogecoin: {wallet.dogecoinBalance}</Text>
          <Text style={styles.balance}>XRP: {wallet.xrpBalance}</Text>
          <Text style={styles.balance}>Ethereum: {wallet.ethereumBalance}</Text>
      
          
        </>
      ) : (
        <Text style={styles.emptyText}>Erro ao carregar dados da carteira.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 16,
  },
  title: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  walletId: {
    fontSize: 16,
    color: '#1E90FF',
    marginBottom: 16,
    textAlign: 'center',
  },
  balance: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 20,
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#ff4444',
    marginBottom: 16,
  },
  itemContainer: {
    backgroundColor: '#1E1E1E',
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
  },
  itemName: {
    fontSize: 18,
    color: '#FFD700',
  },
  itemDetails: {
    fontSize: 16,
    color: '#fff',
  },
  button: {
    backgroundColor: '#1E90FF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 16,
    alignSelf: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
  },
});
