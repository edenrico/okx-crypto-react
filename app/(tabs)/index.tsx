import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import RegisterScreen from '../screens/RegisterScreen';
import LoginScreen from '../screens/LoginScreen';
import Home2Screen from '../screens/Home2Screen'; 
import PortfolioScreen from '../screens/PortfolioScreen';
import Deposit from '@/components/Deposit';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('Home');
  const [walletId, setWalletId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null); // 🔹 Estado para armazenar o nome

  const renderScreen = () => {
    if (currentScreen === 'Home') {
      return <HomeScreen navigate={setCurrentScreen} />;
    } else if (currentScreen === 'Register') {
      return <RegisterScreen navigate={setCurrentScreen} />;
    } else if (currentScreen === 'Login') {
      return (
        <LoginScreen
          navigate={setCurrentScreen}
          setWalletId={setWalletId}
          setUserName={setUserName} // 🔹 Passamos setUserName para armazenar o nome globalmente
        />
      );
    } else if (currentScreen === 'Home2') {
      return (
        <Home2Screen
          walletId={walletId}
          userName={userName} // 🔹 Passamos o nome do usuário para Home2Screen
          navigate={setCurrentScreen}
        />
      );
    } else if (currentScreen === 'Deposit') {
      return (
        <Deposit
          walletId={walletId}
          onDepositSuccess={() => {
            setCurrentScreen('Home2');
          }}
        />
      );
    } else if (currentScreen === 'Portfolio') {
      return (
        <PortfolioScreen 
          walletId={walletId}
          navigate={setCurrentScreen}
        />
      );
    }
    return null;
  };

  return <View style={styles.container}>{renderScreen()}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
