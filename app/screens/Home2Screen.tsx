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

/*
  Aqui, defino o formato (interface) da Cripto que vem do back-end:
  - nome: Nome da moeda, tipo "Bitcoin"
  - precoAtual: Preço atual (número)
  - imageUrl: URL da imagem pra exibir na listagem
*/
interface Cripto {
  nome: string;
  precoAtual: number;
  imageUrl: string;
}

/*
  Componente principal: Home2Screen
  Props que chegam:
    - walletId: ID da carteira (pra buscar saldo em USD)
    - userName: nome do usuário (pra exibir na tela)
    - navigate: função de navegação
*/
export default function Home2Screen({
  walletId,
  userName,
  navigate,
}: {
  userName: string | null;
  walletId: string | null;
  navigate: (screen: string, params?: any) => void;
}) {
  // Tipo da resposta que vem do back-end quando busco o saldo em USD
  interface BalanceResponse {
    usdBalance: number;
  }

  // Estado pra guardar o saldo em USD
  const [usdBalance, setUsdBalance] = useState<number | null>(null);
  // Indica se estou carregando informações (ex: spinner na tela)
  const [loading, setLoading] = useState<boolean>(true);

  // Estado para o texto da busca
  const [searchQuery, setSearchQuery] = useState<string>('');
  // Lista completa de criptos (recebida do back-end)
  const [allCryptos, setAllCryptos] = useState<Cripto[]>([]);
  // Lista filtrada de criptos, com base no searchQuery
  const [filteredCryptos, setFilteredCryptos] = useState<Cripto[]>([]);

  /*
    useEffect #1:
      - Busca o saldo em USD do usuário (usando walletId)
      - Também busca a lista de criptos disponíveis (live-prices).
  */
  useEffect(() => {
    // Função pra buscar o saldo em USD
    const fetchBalance = () => {
      if (!walletId) {
        // Se não tem walletId, não pode buscar
        setUsdBalance(null);
        setLoading(false);
        return;
      }
      axios
        .get<BalanceResponse>(
          `http://192.168.0.173:8080/api/wallet/balance/${walletId}`
        )
        .then((response) => {
          // Se veio dado, guardo no estado, se não, zero
          setUsdBalance(response.data.usdBalance || 0);
        })
        .catch((error) => {
          console.error('Erro ao buscar saldo:', error);
          setUsdBalance(null);
        })
        .then(() => {
          // Ao final, loading = false
          setLoading(false);
        });
    };

    fetchBalance();

    // Função pra buscar todas as criptos do backend
    const fetchAllCryptos = async () => {
      try {
        const response = await axios.get<Cripto[]>(
          'http://192.168.0.173:8080/api/criptos/live-prices'
        );
        const cryptosFetched: Cripto[] = response.data.map((item) => {
          /*
            Ajusto a imageUrl baseado no nome da cripto, 
            pois o backend não está enviando esse link.
          */
          let imageUrl = '';
          if (item.nome.toLowerCase() === 'bitcoin') {
            imageUrl = 'https://cryptologos.cc/logos/bitcoin-btc-logo.png';
          } else if (item.nome.toLowerCase() === 'dogecoin') {
            imageUrl = 'https://cryptologos.cc/logos/dogecoin-doge-logo.png';
          } else if (item.nome.toLowerCase() === 'xrp') {
            imageUrl = 'https://cryptologos.cc/logos/xrp-xrp-logo.png';
          }
          // Retorna objeto com nome, precoAtual e imageUrl
          return { ...item, imageUrl };
        });
        // Salvo as criptos no estado
        setAllCryptos(cryptosFetched);
        // Por enquanto, filteredCryptos = allCryptos
        setFilteredCryptos(cryptosFetched);
      } catch (error) {
        console.error('Erro ao buscar preços das criptomoedas:', error);
      }
    };
    fetchAllCryptos();
  }, [walletId]);

  /*
    useEffect #2:
      - Sempre que searchQuery mudar, filtra a lista allCryptos
        pra ver quais contém o texto digitado (ignora maiúsculas/minúsculas)
  */
  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      // Se não digitei nada, tudo volta a ser exibido
      setFilteredCryptos(allCryptos);
    } else {
      const lowerQuery = searchQuery.toLowerCase();
      // Faz o filtro e retorna somente os nomes que contêm o que foi buscado
      const filtered = allCryptos.filter((crypto) =>
        crypto.nome.toLowerCase().includes(lowerQuery)
      );
      setFilteredCryptos(filtered);
    }
  }, [searchQuery, allCryptos]);

  /*
    handleDepositSuccess: função chamada quando o depósito ocorre 
    (na tela Deposit), atualizando o saldo aqui (usdBalance).
  */
  const handleDepositSuccess = (newBalance: number) => {
    setUsdBalance(newBalance);
  };

  /*
    handleWalletUpdate:
      - Se tenho walletId, faço outra requisição GET pra atualizar o saldo
      - Deixo loading=true enquanto busca
  */
  const handleWalletUpdate = () => {
    if (walletId) {
      setLoading(true);
      axios
        .get<BalanceResponse>(
          `http://192.168.0.173:8080/api/wallet/balance/${walletId}`
        )
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

  /*
    renderSearchedCrypto:
      - Como o FlatList de cryptos filtradas chama essa função pra desenhar cada item.
      - Exibe imagem + nome + preço.
  */
  const renderSearchedCrypto = ({ item }: { item: Cripto }) => (
    <View style={styles.searchItem}>
      <Image source={{ uri: item.imageUrl }} style={styles.searchItemImage} />
      <View style={styles.searchItemTextContainer}>
        <Text style={styles.searchItemName}>{item.nome}</Text>
        <Text style={styles.searchItemPrice}>${item.precoAtual.toFixed(2)}</Text>
      </View>
    </View>
  );

  /*
    Layout principal da Home2Screen, usando ScrollView e algumas Views:
      - topBar com 3 componentes (dotsSquare, exchangeButton e o giftEmoji)
      - navBar com o campo de busca (🔍 e TextInput)
      - Lista de criptos filtradas, se o campo de busca não estiver vazio
      - Exibição do nome do usuário, saldo, botões de depósito e portfólio
      - Componente CryptoList, que mostra as criptos com possibilidade de comprar/vender
  */
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Top bar com botões + emoji */}
      <View style={styles.topBar}>
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

        <TouchableOpacity style={styles.exchangeButton}>
          <Text style={styles.exchangeButtonText}>Exchange</Text>
        </TouchableOpacity>

        <Text style={styles.giftEmoji}>🎁</Text>
      </View>

      {/* Barra de busca (icone 🔍 + input) */}
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

      {/* Se tenho resultados ao buscar, exibo a lista filtrada */}
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

      {/* Exibe o nome do usuário + saldo em USD ou erro se não tiver */}
      <View style={styles.userDataContainer}>
        <View style={styles.userNameContainer}>
          <Text style={styles.userName}>
            Welcome back, KING {userName ? userName : 'Usuário'}!
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

      {/* Botões de Depósito e Portfólio */}
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

/* 
  Estilos do componente. Uso cores escuras pra manter o layout dark.
*/
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#000',
    alignItems: 'flex-start',
    paddingHorizontal: 26,
    paddingVertical: 16,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 16,
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
  searchResultContainer: {
    width: '100%',
    marginBottom: 10,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
  },
  searchResultList: {
    maxHeight: 200,
  },
  searchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  searchItemImage: {
    width: 24,
    height: 24,
    marginRight: 8,
    resizeMode: 'contain',
  },
  searchItemTextContainer: {
    flex: 1,
  },
  searchItemName: {
    color: '#fff',
    fontSize: 14,
  },
  searchItemPrice: {
    color: '#aaa',
    fontSize: 12,
  },
  userDataContainer: {
    width: '100%',
    marginBottom: 16,
  },
  userNameContainer: {
    width: '100%',
    alignItems: 'center',   
    marginTop: 15,    
    marginBottom: 20,
  },
  userName: {
    color: '#FFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
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
