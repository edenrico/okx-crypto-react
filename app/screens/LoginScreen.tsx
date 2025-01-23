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

const BASE_URL = 'http://192.168.0.173:8080/api/users/login';

export default function LoginScreen({
  navigate,
  setWalletId,
}: {
  navigate: (screen: string) => void;
  setWalletId: (id: string) => void; // Recebe o setter para armazenar o walletId globalmente
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha o e-mail e a senha.');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(BASE_URL, { email, password });

      if (response.status === 200) {
        const { walletId, message } = response.data; // Captura o walletId e a mensagem do backend
        Alert.alert('Sucesso', message);
        setWalletId(walletId); // Armazena o walletId no estado global
        navigate('Home2'); // Navega para a tela Home2
      } else {
        Alert.alert('Erro', 'Credenciais inválidas.');
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Erro ao fazer login. Verifique suas credenciais.';
      Alert.alert('Erro', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Se nenhum campo estiver focado, mostra "Login". Caso contrário, "Enter your..."
  const getTitleMessage = () => {
    if (focusedField === 'email') return 'Enter your email';
    if (focusedField === 'password') return 'Enter your password';
    return 'Login';
  };

  // Botão desativado se email ou password estiverem vazios
  const isButtonDisabled = !email || !password;

  return (
    <View style={styles.container}>
      {/* Botão "X" para voltar */}
      <TouchableOpacity style={styles.closeButton} onPress={() => navigate('Home')}>
        <Text style={styles.closeButtonText}>X</Text>
      </TouchableOpacity>

      {/* Título Dinâmico */}
      <Text style={styles.dynamicTitle}>{getTitleMessage()}</Text>

      {/* Sessão de campos e botão */}
      <View style={styles.content}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite seu e-mail"
          placeholderTextColor="#888"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onFocus={() => setFocusedField('email')}
          onBlur={() => setFocusedField(null)}
          onChangeText={setEmail}
        />
        {focusedField === 'email' && (
          <Text style={styles.forgotText}>Forgot your email?</Text>
        )}

        <Text style={styles.label}>Senha</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite sua senha"
          placeholderTextColor="#888"
          secureTextEntry
          value={password}
          onFocus={() => setFocusedField('password')}
          onBlur={() => setFocusedField(null)}
          onChangeText={setPassword}
        />
        {focusedField === 'password' && (
          <Text style={styles.forgotText}>Forgot your password?</Text>
        )}

        <View style={[styles.buttonContainer, isButtonDisabled && styles.buttonContainerDisabled]}>
          {loading ? (
            <ActivityIndicator size="large" color="#00ff00" />
          ) : (
            <TouchableOpacity disabled={isButtonDisabled} onPress={handleLogin}>
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    left: 15,
    zIndex: 10,
    padding: 8,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 24,
  },
  dynamicTitle: {
    marginTop: 118,
    marginLeft: 25,
    fontSize: 20,
    color: '#fff',
    marginBottom: 52,
  },
  content: {
    paddingHorizontal: 16,
  },
  label: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 4,
    marginLeft: 10,
  },
  input: {
    height: 44,
    marginBottom: 8,
    borderColor: '#555',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#1C1C1C',
    color: '#fff',
  },
  forgotText: {
    fontSize: 14,
    color: '#1E90FF',
    marginBottom: 8,
    marginLeft: 10,
  },
  buttonContainer: {
    marginTop: 16,
    backgroundColor: '#1E90FF',
    borderRadius: 24,
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 40,
  },
  buttonContainerDisabled: {
    backgroundColor: '#383838',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});
