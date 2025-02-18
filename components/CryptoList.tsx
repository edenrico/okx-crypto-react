import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  FlatList
} from 'react-native';
import axios from 'axios';

export interface Cripto {
  nome: string;
  sigla: string;
  precoAtual: number;
  imageUrl: string;
}

interface Wallet {
  keyId: string;
  bitcoinBalance: number;
  dogecoinBalance: number;
  usdBalance: number;
  xrpBalance: number;
  criptosCompradas: Cripto[];
}

interface CryptoListProps {
  walletId: string | null;
  usdBalance: number;
  onUpdateWallet: () => void;
}

export default function CryptoList({ walletId, usdBalance, onUpdateWallet }: CryptoListProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'favorites'>('all');
  const [cryptos, setCryptos] = useState<Cripto[]>([]);
  const [loadingAll, setLoadingAll] = useState<boolean>(true);
  const [walletData, setWalletData] = useState<Wallet | null>(null);
  const [loadingWallet, setLoadingWallet] = useState<boolean>(true);

  // Modal de compra
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [quantityInput, setQuantityInput] = useState<string>('');
  const [selectedCrypto, setSelectedCrypto] = useState<Cripto | null>(null);

  // 1) Buscar todas as criptomoedas (13 criptos: 3 originais + 10 adicionais)
  useEffect(() => {
    const fetchAllCryptos = async () => {
      try {
        const response = await axios.get<Cripto[]>('http://192.168.0.173:8080/api/criptos/live-prices');
        const cryptosFetched = response.data.map((item) => {
          const lowerName = item.nome.toLowerCase();
          let imageUrl = '';
          let sigla = '';
          if (lowerName === 'bitcoin') {
            imageUrl = 'https://cryptologos.cc/logos/bitcoin-btc-logo.png';
            sigla = 'BTC';
          } else if (lowerName === 'dogecoin') {
            imageUrl = 'https://cryptologos.cc/logos/dogecoin-doge-logo.png';
            sigla = 'DOGE';
          } else if (lowerName === 'xrp') {
            imageUrl = 'https://cryptologos.cc/logos/xrp-xrp-logo.png';
            sigla = 'XRP';
          } else if (lowerName === 'ethereum') {
            imageUrl = 'https://cryptologos.cc/logos/ethereum-eth-logo.png';
            sigla = 'ETH';
          } else if (lowerName === 'litecoin') {
            imageUrl = 'https://cryptologos.cc/logos/litecoin-ltc-logo.png';
            sigla = 'LTC';
          } else if (lowerName === 'bitcoin cash') {
            imageUrl = 'https://cryptologos.cc/logos/bitcoin-cash-bch-logo.png';
            sigla = 'BCH';
          } else if (lowerName === 'eos') {
            imageUrl = 'https://cryptologos.cc/logos/eos-eos-logo.png';
            sigla = 'EOS';
          } else if (lowerName === 'binance coin') {
            imageUrl = 'https://cryptologos.cc/logos/binance-coin-bnb-logo.png';
            sigla = 'BNB';
          } else if (lowerName === 'cardano') {
            imageUrl = 'https://cryptologos.cc/logos/cardano-ada-logo.png';
            sigla = 'ADA';
          } else if (lowerName === 'polkadot') {
            imageUrl = 'https://cryptologos.cc/logos/polkadot-new-dot-logo.png';
            sigla = 'DOT';
          } else if (lowerName === 'chainlink') {
            imageUrl = 'https://cryptologos.cc/logos/chainlink-link-logo.png';
            sigla = 'LINK';
          } else if (lowerName === 'stellar') {
            imageUrl = 'https://cryptologos.cc/logos/stellar-xlm-logo.png';
            sigla = 'XLM';
          } else if (lowerName === 'tron') {
            imageUrl = 'https://cryptologos.cc/logos/tron-trx-logo.png';
            sigla = 'TRX';
          } else {
            imageUrl = 'https://via.placeholder.com/25';
            sigla = item.sigla || lowerName.toUpperCase();
          }
          return { ...item, imageUrl, sigla };
        });
        // Ordena o array de forma decrescente com base no preço atual
        cryptosFetched.sort((a, b) => b.precoAtual - a.precoAtual);
        setCryptos(cryptosFetched);
      } catch (error) {
        console.error('Erro ao buscar criptomoedas:', error);
      } finally {
        setLoadingAll(false);
      }
    };
    fetchAllCryptos();
  }, []);

  // 2) Buscar dados da carteira (para exibir Favorites)
  useEffect(() => {
    if (!walletId) {
      setLoadingWallet(false);
      return;
    }
    const fetchWallet = async () => {
      try {
        const response = await axios.get<Wallet>(`http://192.168.0.173:8080/api/wallet/balance/${walletId}`);
        setWalletData(response.data);
      } catch (error) {
        console.error('Erro ao buscar carteira:', error);
      } finally {
        setLoadingWallet(false);
      }
    };
    fetchWallet();
  }, [walletId]);

  // Função para obter os saldos reais da carteira e combinar com as informações das criptos (Favorites)
  const getWalletFavorites = () => {
    if (!walletData) return [];
    const walletBalances = [
      { nome: 'Bitcoin', sigla: 'BTC', balance: walletData.bitcoinBalance },
      { nome: 'Dogecoin', sigla: 'DOGE', balance: walletData.dogecoinBalance },
      { nome: 'XRP', sigla: 'XRP', balance: walletData.xrpBalance },
    ];
    const favorites = walletBalances.map((balanceObj) => {
      const found = cryptos.find(
        (c) => c.nome.toLowerCase() === balanceObj.nome.toLowerCase()
      );
      if (found) {
        return { ...found, quantidade: balanceObj.balance };
      } else {
        return {
          nome: balanceObj.nome,
          sigla: balanceObj.sigla,
          precoAtual: 0,
          imageUrl: 'https://via.placeholder.com/25',
          quantidade: balanceObj.balance,
        };
      }
    });
    return favorites.filter(item => item.quantidade > 0);
  };

  const dataToShow =
    activeTab === 'favorites'
      ? getWalletFavorites()
      : cryptos;

  if (loadingAll || loadingWallet) {
    return <ActivityIndicator size="large" color="#1E90FF" />;
  }

  if (dataToShow.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          {activeTab === 'favorites'
            ? 'Você não possui nenhuma criptomoeda ainda.'
            : 'Nenhuma cripto encontrada.'}
        </Text>
      </View>
    );
  }

  const renderCryptoItem = ({ item }: { item: Cripto & { quantidade?: number } }) => (
    <View style={activeTab === 'favorites' ? styles.favoriteItemRow : styles.itemRow}>
      <Image source={{ uri: item.imageUrl }} style={styles.cryptoImage} />
      <View style={styles.textContainer}>
        <Text style={activeTab === 'favorites' ? styles.favoriteCryptoSigla : styles.cryptoSigla}>
          {item.sigla}
        </Text>
        <Text style={activeTab === 'favorites' ? styles.favoriteCryptoName : styles.cryptoName}>
          {item.nome}
        </Text>
      </View>
      <View style={styles.priceContainer}>
        <Text style={styles.cryptoPrice}>${item.precoAtual.toFixed(2)}</Text>
      </View>
    </View>
  );

  async function confirmBuyCrypto(qtd: number) {
    if (!walletId || !selectedCrypto) {
      alert('Wallet ou criptomoeda não disponível.');
      return;
    }
    const custoTotal = selectedCrypto.precoAtual * qtd;
    if (usdBalance < custoTotal) {
      alert('Saldo insuficiente.');
      return;
    }
    try {
      await axios.post(
        `http://192.168.0.173:8080/api/wallet/${walletId}/buy-crypto?criptoNome=${selectedCrypto.nome}&quantidade=${qtd}`
      );
      alert(`${selectedCrypto.nome} comprado com sucesso!`);
      onUpdateWallet();
    } catch (error) {
      console.error(`Erro ao comprar ${selectedCrypto.nome}:`, error);
      alert(`Erro ao comprar ${selectedCrypto.nome}.`);
    }
  }

  function handleConfirmPress() {
    const qtd = parseFloat(quantityInput);
    if (isNaN(qtd) || qtd <= 0) {
      alert('Por favor, insira um valor válido.');
      return;
    }
    setModalVisible(false);
    setQuantityInput('');
    confirmBuyCrypto(qtd);
  }

  function handleBuyButtonPress(crypto: Cripto) {
    setSelectedCrypto(crypto);
    setModalVisible(true);
  }

  return (
    <View style={styles.container}>
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => setActiveTab('favorites')}
        >
          <Text style={[styles.tabText, activeTab === 'favorites' && styles.activeTabText]}>
            Favorites
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
            All crypto
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={dataToShow}
        keyExtractor={(item, index) => item.nome + index}
        renderItem={renderCryptoItem}
        contentContainerStyle={styles.listContainer}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              Quantos {selectedCrypto ? selectedCrypto.nome : 'crypto'} deseja comprar?
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Digite a quantidade"
              keyboardType="numeric"
              value={quantityInput}
              onChangeText={setQuantityInput}
            />
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity style={styles.modalButton} onPress={handleConfirmPress}>
                <Text style={styles.modalButtonText}>Confirmar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 26,
    backgroundColor: '#000',
    flex: 1,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    marginTop: 10,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 10,
    borderRadius: 10,
    backgroundColor: '#272626',
  },
  tabText: {
    fontSize: 16,
    color: '#fff',
  },
  activeTabText: {
    textDecorationLine: 'underline',
    fontWeight: 'bold',
  },
  listContainer: {
    paddingBottom: 20,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 10,
    borderRadius: 8,
  },
  favoriteItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 10,
    borderRadius: 8,
  },
  cryptoImage: {
    width: 25,
    height: 25,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  cryptoSigla: {
    color: '#ffffff',
    fontSize: 16,
  },
  favoriteCryptoSigla: {
    color: '#ffffff',
    fontSize: 16,
  },
  cryptoName: {
    fontSize: 14,
    color: '#797979',
  },
  favoriteCryptoName: {
    fontSize: 14,
    color: '#797979',
  },
  priceContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  cryptoPrice: {
    fontSize: 14,
    color: '#fff',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  modalButton: {
    backgroundColor: '#1E90FF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  modalCancelButton: {
    backgroundColor: '#ff4444',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});
