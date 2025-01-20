import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';


const BASE_URL = 'http://192.168.0.173:8080/api/users';

export default function RegisterScreen({ navigate }: { navigate: (screen: string) => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    try {
      setLoading(true);

      // Dados do usuário a serem enviados
      const payload = { name, email, password };

      // Requisição POST para o back-end
      const response = await axios.post(BASE_URL, payload);

      if (response.status === 200) {
        Alert.alert('Sucesso', 'Usuário registrado com sucesso!');
        // Redireciona para a tela inicial
        navigate('Home');
      } else {
        Alert.alert('Erro', 'O registro não foi concluído. Tente novamente.');
      }
    } catch (err) {
      // Tipagem explícita de error
      const error = err as any; // ou AxiosError se usar @types/axios
      console.error(error);
      const errorMessage =
        error.response?.data?.message ||
        'Não foi possível registrar o usuário. Verifique sua conexão ou o back-end.';
      Alert.alert('Erro', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registro de Usuário</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome"
        placeholderTextColor="#888"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="E-mail"
        placeholderTextColor="#888"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Senha"
        placeholderTextColor="#888"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#00ff00" />
      ) : (
        <Button title="Registrar" onPress={handleRegister} color="#1E90FF" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    backgroundColor: '#000', // Fundo preto
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: 'center',
    color: '#fff', // Texto branco
  },
  input: {
    height: 44,
    borderColor: '#555', // Borda mais escura
    borderWidth: 1,
    marginBottom: 12,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#1C1C1C', // Fundo cinza escuro
    color: '#fff', // Texto branco no campo
  },
});
