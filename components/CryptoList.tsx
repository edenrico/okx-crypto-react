import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import axios from 'axios';

interface CryptoListProps {
  walletId: string | null;
  usdBalance: number;
  onUpdateWallet: () => void;
}

interface Cripto {
  nome: string;
  precoAtual: number;
}

export default function CryptoList({ walletId, usdBalance, onUpdateWallet }: CryptoListProps) {
  const [bitcoin, setBitcoin] = useState<Cripto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchBitcoin = async () => {
      try {
        const response = await axios.get<{ bitcoin: { usd: number } }>(
          'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd'
        );
        const bitcoinData = response.data.bitcoin;
        setBitcoin({ nome: 'Bitcoin', precoAtual: bitcoinData.usd });
      } catch (error) {
        console.error('Erro ao buscar Bitcoin:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBitcoin();
  }, []);

  const handleBuyBitcoin = async () => {
    if (!walletId || !bitcoin) {
      alert('Wallet ou Bitcoin não disponível.');
      return;
    }

    const quantidade = 0.001; // Quantidade fixa para teste
    const custoTotal = bitcoin.precoAtual * quantidade;

    if (usdBalance < custoTotal) {
      alert('Saldo insuficiente.');
      return;
    }

    try {
      await axios.post(`http://192.168.0.173:8080/api/wallet/${walletId}/buy-crypto`, {
        criptoNome: 'Bitcoin',
        quantidade,
      });
      alert('Bitcoin comprado com sucesso!');
      onUpdateWallet();
    } catch (error) {
      console.error('Erro ao comprar Bitcoin:', error);
      alert('Erro ao comprar Bitcoin.');
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#1E90FF" />;
  }

  if (!bitcoin) {
    return <Text style={styles.errorText}>Erro ao carregar informações do Bitcoin.</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Criptomoeda Disponível</Text>
      <View style={styles.cryptoCard}>
        <Text style={styles.cryptoName}>{bitcoin.nome}</Text>
        <Text style={styles.cryptoPrice}>Preço Atual: ${bitcoin.precoAtual.toFixed(2)}</Text>
        <TouchableOpacity style={styles.buyButton} onPress={handleBuyBitcoin}>
          <Text style={styles.buyButtonText}>Comprar Bitcoin</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  title: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 8,
  },
  cryptoCard: {
    backgroundColor: '#1E1E1E',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  cryptoName: {
    fontSize: 20,
    color: '#FFD700',
    marginBottom: 8,
  },
  cryptoPrice: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 16,
  },
  buyButton: {
    backgroundColor: '#1E90FF',
    paddingVertical: 8,
    borderRadius: 8,
  },
  buyButtonText: {
    textAlign: 'center',
    color: '#fff',
    fontSize: 16,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 16,
  },
});
