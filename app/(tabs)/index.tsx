import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import RegisterScreen from '../screens/RegisterScreen';
import LoginScreen from '../screens/LoginScreen';
import Home2Screen from '../screens/Home2Screen'; // Tela após o login
import Deposit from '@/components/Deposit';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('Home');
  const [walletId, setWalletId] = useState<string | null>(null);

  // Função que renderiza a tela atual com base em "currentScreen"
  const renderScreen = () => {
    if (currentScreen === 'Home') {
      return <HomeScreen navigate={setCurrentScreen} />;
    } else if (currentScreen === 'Register') {
      return <RegisterScreen navigate={setCurrentScreen} />;
    } else if (currentScreen === 'Login') {
      return (
        <LoginScreen
          navigate={setCurrentScreen}
          setWalletId={setWalletId} // Atualiza o walletId global ao fazer login
        />
      );
    } else if (currentScreen === 'Home2') {
      return (
        <Home2Screen
          walletId={walletId}
          navigate={(screen, params) => {
            // Ao navegar para "Deposit", passamos o walletId e uma callback
            if (screen === 'Deposit') {
              setCurrentScreen('Deposit');
              setTimeout(() => {
                // Precisamos de um pequeno timeout para garantir a troca de tela.
                // Não é obrigatório, mas pode evitar warning de setState após unmount
                // Armazene os parâmetros de navegação de alguma forma global, ou passe localmente
                setDepositParams(params);
              }, 0);
            } else {
              // Para outras telas
              setCurrentScreen(screen);
            }
          }}
        />
      );
    } else if (currentScreen === 'Deposit') {
      // Renderizamos a tela de Depósito com base nos parâmetros armazenados
      return (
        <Deposit
          walletId={depositParams?.walletId || null}
          onDepositSuccess={() => {
            // Chama a função de atualizar o saldo
            depositParams?.onDepositSuccess();
            // Volta para Home2
            setCurrentScreen('Home2');
          }}
        />
      );
    }
    return null;
  };

  // Armazenamos parâmetros quando navegamos para o Deposit
  const [depositParams, setDepositParams] = useState<{
    walletId: string;
    onDepositSuccess: () => void;
  } | null>(null);

  return <View style={styles.container}>{renderScreen()}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

