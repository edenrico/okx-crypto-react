import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Image,
  FlatList,
} from 'react-native';
import axios from 'axios';
import CryptoList from '@/components/CryptoList';

interface Cripto {
  nome: string;
  precoAtual: number;
  imageUrl: string;
}

export default function Home2Screen({
  walletId,
  userName,
  navigate,
}: {
  userName: string | null;
  walletId: string | null;
  navigate: (screen: string, params?: any) => void;
}) {
  interface BalanceResponse {
    usdBalance: number;
  }

  const [usdBalance, setUsdBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Campo de busca e lista completa de cryptos
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [allCryptos, setAllCryptos] = useState<Cripto[]>([]);
  const [filteredCryptos, setFilteredCryptos] = useState<Cripto[]>([]);

  useEffect(() => {
    // Busca o saldo da carteira
    const fetchBalance = () => {
      if (!walletId) {
        setUsdBalance(null);
        setLoading(false);
        return;
      }
      axios
        .get<BalanceResponse>(`http://192.168.0.173:8080/api/wallet/balance/${walletId}`)
        .then((response) => {
          setUsdBalance(response.data.usdBalance || 0);
        })
        .catch((error) => {
          console.error('Erro ao buscar saldo:', error);
          setUsdBalance(null);
        })
        .then(() => {
          setLoading(false);
        });
    };

    fetchBalance();

    // Busca a lista completa de cryptos
    const fetchAllCryptos = async () => {
      try {
        const response = await axios.get<Cripto[]>('http://192.168.0.173:8080/api/criptos/live-prices');
        const cryptosFetched: Cripto[] = response.data.map((item) => {
          let imageUrl = '';
          if (item.nome.toLowerCase() === 'bitcoin') {
            imageUrl = 'https://cryptologos.cc/logos/bitcoin-btc-logo.png';
          } else if (item.nome.toLowerCase() === 'dogecoin') {
            imageUrl = 'https://cryptologos.cc/logos/dogecoin-doge-logo.png';
          } else if (item.nome.toLowerCase() === 'xrp') {
            imageUrl = 'https://cryptologos.cc/logos/xrp-xrp-logo.png';
          }
          return { ...item, imageUrl };
        });
        setAllCryptos(cryptosFetched);
        setFilteredCryptos(cryptosFetched);
      } catch (error) {
        console.error('Erro ao buscar preços das criptomoedas:', error);
      }
    };
    fetchAllCryptos();
  }, [walletId]);

  // Filtro para a lista de busca
  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setFilteredCryptos(allCryptos);
    } else {
      const lowerQuery = searchQuery.toLowerCase();
      const filtered = allCryptos.filter((crypto) =>
        crypto.nome.toLowerCase().includes(lowerQuery)
      );
      setFilteredCryptos(filtered);
    }
  }, [searchQuery, allCryptos]);

  const handleDepositSuccess = (newBalance: number) => {
    setUsdBalance(newBalance);
  };

  const handleWalletUpdate = () => {
    if (walletId) {
      setLoading(true);
      axios
        .get<BalanceResponse>(`http://192.168.0.173:8080/api/wallet/balance/${walletId}`)
        .then((response) => {
          setUsdBalance(response.data.usdBalance || 0);
        })
        .catch((error) => {
          console.error('Erro ao atualizar saldo:', error);
        })
        .then(() => {
          setLoading(false);
        });
    }
  };

  // Renderiza cada item filtrado (lista de busca)
  const renderSearchedCrypto = ({ item }: { item: Cripto }) => (
    <View style={styles.searchItem}>
      <Image source={{ uri: item.imageUrl }} style={styles.searchItemImage} />
      <View style={styles.searchItemTextContainer}>
        <Text style={styles.searchItemName}>{item.nome}</Text>
        <Text style={styles.searchItemPrice}>${item.precoAtual.toFixed(2)}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Barra no topo: 
          [Quadrado de pontinhos (esquerda), 
           Botão "Exchange" (centro), 
           Emoji Presente (direita)] */}
      <View style={styles.topBar}>
        
        {/* Quadrado com 3x3 bolinhas */}
        <TouchableOpacity style={styles.dotsSquare}>
          <View style={styles.dotsRow}>
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
          <View style={styles.dotsRow}>
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
          <View style={styles.dotsRow}>
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </TouchableOpacity>

        {/* Botão Exchange */}
        <TouchableOpacity style={styles.exchangeButton}>
          <Text style={styles.exchangeButtonText}>Exchange</Text>
        </TouchableOpacity>

        {/* Emoji de Presente à direita */}
        <Text style={styles.giftEmoji}>🎁</Text>
      </View>

      {/* Barra de busca (com lupa) */}
      <View style={styles.navBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search a crypto"
          placeholderTextColor="#858585"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Lista de resultados da busca */}
      {filteredCryptos.length > 0 && searchQuery.trim().length > 0 && (
        <View style={styles.searchResultContainer}>
          <FlatList
            data={filteredCryptos}
            keyExtractor={(item) => item.nome}
            renderItem={renderSearchedCrypto}
            style={styles.searchResultList}
          />
        </View>
      )}

<View style={styles.userDataContainer}>
  <View style={styles.userNameContainer}>
    <Text style={styles.userName}>
    Welcome back, KING  {userName ? userName : 'Usuário'}!
    </Text>
  </View>

  <Text style={styles.value}>Est total value o</Text>
  {loading ? (
    <ActivityIndicator size="large" color="#1E90FF" />
  ) : usdBalance !== null ? (
    <View style={styles.usdBalance}>
      <Text style={styles.balance}>{usdBalance.toFixed(2)}</Text>
      <Text style={styles.balanceText}>USD</Text>
    </View>
  ) : (
    <Text style={styles.balance}>Erro ao carregar saldo.</Text>
  )}
</View>

<View style={styles.buttonsContainer}>
  <TouchableOpacity
    style={styles.depositButton}
    onPress={() =>
      navigate('Deposit', {
        walletId,
        onDepositSuccess: handleDepositSuccess,
      })
    }
  >
    <Text style={styles.depositButtonText}>Deposit</Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={styles.portfolioButton}
    onPress={() => navigate('Portfolio', { walletId })}
  >
    <Text style={styles.portfolioButtonText}>Portfolio</Text>
  </TouchableOpacity>
</View>



      {/* Lista de Criptomoedas (com funcionalidades de compra) */}
      <CryptoList
        walletId={walletId}
        usdBalance={usdBalance || 0}
        onUpdateWallet={handleWalletUpdate}
        searchQuery=""
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#000',
    alignItems: 'flex-start',  // Alinha todos os elementos à esquerda
    paddingHorizontal: 26,     // Recuo horizontal consistente para todos os elementos
    paddingVertical: 16,
  },
  // Barra superior: ocupa toda a largura
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',               // Garante que a barra ocupe toda a largura
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 16,
    // Remova ou ajuste paddingHorizontal se necessário
  },
  dotsSquare: {
    width: 34,
    height: 34,
    backgroundColor: '#272626',
    borderRadius: 8,
    padding: 6,
    justifyContent: 'space-between',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#fff',
  },
  exchangeButton: {
    backgroundColor: '#272626',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  exchangeButtonText: {
    fontSize: 14,
    color: '#fff',
  },
  giftEmoji: {
    fontSize: 20,
    marginLeft: 8,
    backgroundColor: '#272626',
    borderRadius: 8,
    padding: 6,
  },
  // Barra de busca: também ocupa toda a largura
  navBar: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    width: '100%',
    paddingVertical: 8,
    paddingHorizontal: 25,
    borderRadius: 30,
    marginBottom: 16,
  },
  searchIcon: {
    paddingRight: 10,
    fontSize: 16,
    color: '#fff',
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
  },
  // User data container: ocupa toda a largura
  userDataContainer: {
    width: '100%',
    marginBottom: 16,
  },
  // Container exclusivo para o username centralizado
  userNameContainer: {
    width: '100%',
    alignItems: 'center',   
    marginTop: 15,    // Centraliza o conteúdo deste container
    marginBottom: 20,
  },
  userName: {
    color: '#FFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',        // Centraliza o texto
  },
  value: {
    color: '#858585',
    marginBottom: 8,
  },
  usdBalance: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balance: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 16,
  },
  balanceText: {
    color: '#fff',
    fontSize: 14,
    paddingLeft: 10,
    paddingBottom: 12,
  },
  // Container para os botões lado a lado
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginVertical: 20,
  },
  depositButton: {
    flex: 1,
    backgroundColor: '#d080ff',
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginRight: 10,
    alignItems: 'center',
  },
  depositButtonText: {
    fontSize: 12,
    color: '#000000',
    textAlign: 'center',
  },
  portfolioButton: {
    flex: 1,
    backgroundColor: '#d080ff',
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  portfolioButtonText: {
    fontSize: 12,
    color: '#000000',
    textAlign: 'center',
  },
});



