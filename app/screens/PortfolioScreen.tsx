import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList
} from 'react-native';
import axios from 'axios';

/*
  Aqui eu defini as interfaces que descrevem os dados vindos do backend:
  - Cripto: cada moeda comprada tem um nome e um preço atual
  - Wallet: é a carteira completa, com saldos de BTC, DOGE, XRP, etc.
*/
interface Cripto {
  idCripto?: string;
  nome: string;
  precoAtual: number;
}

interface Wallet {
  keyId: string;
  bitcoinBalance: number;
  dogecoinBalance: number;
  usdBalance: number;
  xrpBalance: number;
  criptosCompradas: Cripto[];
}

/*
  PortfolioScreenProps: props que chegam no componente,
  incluindo o walletId (identificador da carteira)
  e a função navigate para trocar de tela.
*/
interface PortfolioScreenProps {
  walletId: string | null;
  navigate: (screen: string, params?: any) => void;
}

/*
  Componente principal: PortfolioScreen.
  Objetivo: Buscar dados de uma carteira via GET em /wallet/balance/{walletId}
  e mostrar saldos + criptos compradas.
*/
export default function PortfolioScreen({ walletId, navigate }: PortfolioScreenProps) {
  // Armazena o objeto da carteira que vem do backend
  const [wallet, setWallet] = useState<Wallet | null>(null);
  // Indica se estamos carregando (exibindo spinner) ou não
  const [loading, setLoading] = useState<boolean>(true);

  /*
    useEffect dispara quando a tela monta ou se walletId muda.
    Se há um walletId, faz a requisição GET para o backend.
  */
  useEffect(() => {
    const fetchWallet = async () => {
      // Se não tiver ID, não faz requisição e para o loading
      if (!walletId) {
        setLoading(false);
        return;
      }
      try {
        // Aqui faz a chamada GET pra pegar os dados da carteira
        const response = await axios.get<Wallet>(
          `http://192.168.0.173:8080/api/wallet/balance/${walletId}`
        );
        // Se deu certo, guardo os dados em wallet
        setWallet(response.data);
      } catch (error) {
        // Se deu erro, mostra no console (pode botar Alerta na UI se quiser)
        console.error('Erro ao buscar carteira:', error);
      } finally {
        // Independe de sucesso ou erro, para o loading
        setLoading(false);
      }
    };
    fetchWallet();
  }, [walletId]);

  /*
    Função que desenha cada item da lista "criptosCompradas" (Renderização).
    Só exibe o nome e o preço atual de cada cripto.
  */
  const renderItem = ({ item }: { item: Cripto }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemName}>{item.nome}</Text>
      <Text style={styles.itemDetails}>Preço: ${item.precoAtual.toFixed(2)}</Text>
    </View>
  );

  // Se ainda está carregando, mostra o ActivityIndicator
  if (loading) {
    return <ActivityIndicator size="large" color="#1E90FF" />;
  }

  /*
    Se terminou de carregar, mostra a tela principal:
    - Botão "Voltar" para navegar a Home2
    - Título "Portfólio"
    - Mostra ID da carteira, se existir
    - Se wallet veio do servidor, mostra saldos e a lista de criptos
    - Se não veio, mostra "Erro ao carregar dados..."
  */
  return (
    <View style={styles.container}>
      {/* Botão pra voltar pra tela Home2 */}
      <TouchableOpacity style={styles.button} onPress={() => navigate('Home2')}>
        <Text style={styles.buttonText}>Voltar</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Portfólio</Text>
      {walletId ? (
        <Text style={styles.walletId}>Wallet ID: {walletId}</Text>
      ) : (
        <Text style={styles.walletId}>Nenhum Wallet ID disponível</Text>
      )}

      {wallet ? (
        <>
          <Text style={styles.balance}>Saldo USD: ${wallet.usdBalance.toFixed(2)}</Text>
          <Text style={styles.balance}>Bitcoin: {wallet.bitcoinBalance}</Text>
          <Text style={styles.balance}>Dogecoin: {wallet.dogecoinBalance}</Text>
          <Text style={styles.balance}>XRP: {wallet.xrpBalance}</Text>

          <Text style={styles.subtitle}>Criptomoedas Compradas:</Text>
          {wallet.criptosCompradas && wallet.criptosCompradas.length > 0 ? (
            // Se há moedas compradas, uso FlatList para renderizar
            <FlatList
              data={wallet.criptosCompradas}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderItem}
            />
          ) : (
            <Text style={styles.emptyText}>Nenhuma criptomoeda comprada.</Text>
          )}
        </>
      ) : (
        <Text style={styles.emptyText}>Erro ao carregar dados da carteira.</Text>
      )}
    </View>
  );
}

/*
  Estilos básicos. Fundo preto, textos claros, etc.
*/
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 16,
  },
  title: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  walletId: {
    fontSize: 16,
    color: '#1E90FF',
    marginBottom: 16,
    textAlign: 'center',
  },
  balance: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 20,
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#ff4444',
    marginBottom: 16,
  },
  itemContainer: {
    backgroundColor: '#1E1E1E',
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
  },
  itemName: {
    fontSize: 18,
    color: '#FFD700',
  },
  itemDetails: {
    fontSize: 16,
    color: '#fff',
  },
  button: {
    backgroundColor: '#1E90FF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 16,
    alignSelf: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
  },
});
