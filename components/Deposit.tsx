import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';

interface DepositProps {
  walletId: string | null;
  onDepositSuccess: (newBalance: number) => void; // Função para atualizar Home2Screen
}

export default function Deposit({ walletId, onDepositSuccess }: DepositProps) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDeposit = async () => {
    if (!walletId) {
      Alert.alert('Erro', 'Nenhum Wallet ID encontrado.');
      return;
    }

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      Alert.alert('Erro', 'Por favor, insira uma quantia válida.');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post<{ usdBalance: number }>(
        `http://192.168.0.173:8080/api/wallet/add-funds/${walletId}`,
        null,
        {
          params: {
            amount: parseFloat(amount),
            currency: 'USD',
          },
        }
      );

      if (response.status === 200) {
        const updatedBalance = response.data.usdBalance; // Saldo atualizado
        Alert.alert('Sucesso', `Depósito realizado com sucesso! Novo saldo: $${updatedBalance.toFixed(2)}`);
        setAmount('');
        onDepositSuccess(updatedBalance); // Envia o saldo atualizado para a `Home2Screen`
      } else {
        Alert.alert('Erro', 'Não foi possível realizar o depósito.');
      }
    } catch (error: any) {
      Alert.alert('Erro', 'Ocorreu um erro ao processar o depósito.');
      console.error('Erro no depósito:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Depositar USD</Text>
      <Text style={styles.subtitle}>Wallet ID: {walletId || 'N/A'}</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite a quantia"
        placeholderTextColor="#888"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />
      {loading ? (
        <ActivityIndicator size="large" color="#1E90FF" />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleDeposit}>
          <Text style={styles.buttonText}>Confirmar Depósito</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#1E90FF',
    marginBottom: 16,
  },
  input: {
    width: '80%',
    height: 44,
    borderColor: '#555',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#1C1C1C',
    color: '#fff',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#1E90FF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});
