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

/**
 * RegisterScreen Component - Gerencia o registro de usuário via API.
 * 
 * @param {Object} props - Propriedades do componente
 * @param {Function} props.navigate - Função de navegação para mudar de tela
 * 
 * @description Este componente cria um formulário para registro de usuário,
 *              enviando os dados para um servidor backend via requisição POST.
 *              Gerencia o estado dos inputs do formulário e exibe estado de carregamento
 *              durante chamadas à API.
 */
export default function RegisterScreen({ navigate }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * Gerencia o processo de registro.
   * 
   * @async
   * @function
   * @throws {Error} Se ocorrer um erro durante o registro
   */
  const handleRegister = async () => {
    // Verifica se todos os campos estão preenchidos
    if (!name || !email || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    try {
      setLoading(true);

      const payload = { name, email, password };

      /**
       * Envia os dados do usuário para o servidor para registro.
       * 
       * @param {string} BASE_URL - Endpoint da API para registro de usuário
       * @param {Object} payload - Dados a serem enviados ao servidor
       * @param {Object} headers - Cabeçalhos HTTP para a requisição
       */
      const response = await axios.post(
        BASE_URL,
        payload,
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      if (response.status === 200) {
        Alert.alert('Sucesso', 'Usuário registrado com sucesso!');
        navigate('Login');
      } else {
        Alert.alert('Erro', 'O registro não foi concluído. Tente novamente.');
      }
    } catch (err) {
      const error = err as any; 
      console.error(error);
      const errorMessage = error.response?.data?.message || 'Não foi possível registrar o usuário. Verifique sua conexão ou o back-end.';
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

/**
 * Estilos para o componente RegisterScreen.
 * 
 * @type {Object}
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: 'center',
    color: '#fff', 
  },
  input: {
    height: 44,
    borderColor: '#555', 
    borderWidth: 1,
    marginBottom: 12,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#1C1C1C', 
    color: '#fff',
  },
});

// URL base para comunicação com a API
const BASE_URL = 'http://192.168.0.173:8080/api/users';
