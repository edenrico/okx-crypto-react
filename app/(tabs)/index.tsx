import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import RegisterScreen from '../screens/RegisterScreen';
import LoginScreen from '../screens/LoginScreen';
import Home2Screen from '../screens/Home2Screen'; // Tela após o login

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('Home');
  const [walletId, setWalletId] = useState<string | null>(null); // Armazena o walletId após login

  const renderScreen = () => {
    if (currentScreen === 'Home') {
      return <HomeScreen navigate={setCurrentScreen} />;
    } else if (currentScreen === 'Register') {
      return <RegisterScreen navigate={setCurrentScreen} />;
    } else if (currentScreen === 'Login') {
      return (
        <LoginScreen
          navigate={setCurrentScreen}
          setWalletId={setWalletId} // Passa a função para salvar o walletId
        />
      );
    } else if (currentScreen === 'Home2') {
      return <Home2Screen walletId={walletId} navigate={setCurrentScreen} />;
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
