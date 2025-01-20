import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import RegisterScreen from '../screens/RegisterScreen';
import LoginScreen from '../screens/LoginScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('Home');

  const renderScreen = () => {
    if (currentScreen === 'Home') {
      return <HomeScreen navigate={setCurrentScreen} />;
    } else if (currentScreen === 'Register') {
      return <RegisterScreen navigate={setCurrentScreen} />;
    } else if ( currentScreen === 'Login') {
      return <LoginScreen navigate={setCurrentScreen} />;
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
