import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import axios from 'axios';
import CryptoList from '@/components/CryptoList'; // Certifique-se de que o caminho está correto

export default function Home2Screen({
  walletId,
  navigate,
}: {
  walletId: string | null;
  navigate: (screen: string, params?: any) => void;
}) {
  interface BalanceResponse {
    usdBalance: number;
  }

  const [usdBalance, setUsdBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!walletId) {
        setUsdBalance(null);
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get<BalanceResponse>(
          `http://192.168.0.173:8080/api/wallet/balance/${walletId}`
        );
        setUsdBalance(response.data.usdBalance || 0);
      } catch (error) {
        console.error('Erro ao buscar saldo:', error);
        setUsdBalance(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, [walletId]);

  const handleDepositSuccess = (newBalance: number) => {
    setUsdBalance(newBalance);
  };

  const handleWalletUpdate = () => {
    // Atualiza o saldo após comprar uma criptomoeda
    if (walletId) {
      setLoading(true);
      axios
  .get<BalanceResponse>(`http://192.168.0.173:8080/api/wallet/balance/${walletId}`)
  .then((response) => {
    setUsdBalance(response.data.usdBalance || 0);
  })
  .catch((error) => {
    console.error('Erro ao atualizar saldo:', error);
  })
  .then(() => {
    setLoading(false);
  });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vindo à Home2</Text>
      {walletId ? (
        <Text style={styles.walletId}>Wallet ID: {walletId}</Text>
      ) : (
        <Text style={styles.walletId}>Nenhum Wallet ID disponível</Text>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#1E90FF" />
      ) : usdBalance !== null ? (
        <Text style={styles.balance}>Saldo em USD: ${usdBalance.toFixed(2)}</Text>
      ) : (
        <Text style={styles.balance}>Erro ao carregar saldo.</Text>
      )}

      <TouchableOpacity
        style={styles.depositButton}
        onPress={() =>
          navigate('Deposit', {
            walletId,
            onDepositSuccess: handleDepositSuccess,
          })
        }
      >
        <Text style={styles.depositButtonText}>Fazer Depósito</Text>
      </TouchableOpacity>

      {/* Componente de Lista de Criptomoedas */}
      <CryptoList
        walletId={walletId}
        usdBalance={usdBalance || 0}
        onUpdateWallet={handleWalletUpdate}
      />
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
    marginBottom: 16,
  },
  balance: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 16,
  },
  depositButton: {
    backgroundColor: '#1E90FF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 16,
  },
  depositButtonText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
});
