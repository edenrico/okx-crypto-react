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

export default function LoginScreen({ navigate }: { navigate: (screen: string) => void }) {
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
        Alert.alert('Sucesso', 'Login realizado com sucesso!');
        navigate('Home');
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

  // Define o texto do título de acordo com o campo focado.
  // Se nenhum campo estiver focado, exibe "Login".
  const getTitleMessage = () => {
    if (focusedField === 'email') return 'Enter your email';
    if (focusedField === 'password') return 'Enter your password';
    return 'Login';
  };

  const isButtonDisabled = !email || !password;

  return (
    <View style={styles.container}>
      {/* Texto dinâmico baseado no campo ativo ou Login se nenhum campo estiver focado */}
      <Text style={styles.dynamicTitle}>{getTitleMessage()}</Text>

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

      <View style={[styles.buttonContainer, isButtonDisabled && styles.buttonContainerDisabled]}>
        {loading ? (
          <ActivityIndicator size="large" color="#00ff00" />
        ) : (
          <TouchableOpacity
            disabled={isButtonDisabled}
            onPress={handleLogin}
          >
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  dynamicTitle: {
    fontSize: 20,
    color: '#fff',
    textAlign: 'left',
    bottom: 180,
    marginBottom: 16,
    marginLeft: 10,
  },
  label: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 4,
    marginLeft: 10,
  },
  input: {
    height: 44,
    marginBottom: 16,
    borderColor: '#555',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#1C1C1C',
    color: '#fff',
  },
  buttonContainer: {
    marginTop: 20,
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
