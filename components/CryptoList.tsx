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
  FlatList,
  Alert,
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
  usdBalance: number; // Saldo USD vindo da Home2Screen
  onUpdateWallet: () => void;
}

export default function CryptoList({ walletId, usdBalance, onUpdateWallet }: CryptoListProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'favorites'>('all');
  const [cryptos, setCryptos] = useState<Cripto[]>([]);
  const [loadingAll, setLoadingAll] = useState<boolean>(true);
  const [walletData, setWalletData] = useState<Wallet | null>(null);
  const [loadingWallet, setLoadingWallet] = useState<boolean>(true);

  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedCrypto, setSelectedCrypto] = useState<Cripto | null>(null);
  const [quantityInput, setQuantityInput] = useState<string>('');
  const [action, setAction] = useState<'buy' | 'sell' | null>(null);

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

  useEffect(() => {
    if (!walletId) {
      setLoadingWallet(false);
      return;
    }
    const fetchWallet = async () => {
      try {
        const response = await axios.get<Wallet>(`http://192.168.0.173:8080/api/wallet/balance/${walletId}`);
        console.log('Dados da carteira recebidos:', response.data); // Log para depuração
        setWalletData(response.data);
      } catch (error) {
        console.error('Erro ao buscar carteira:', error);
      } finally {
        setLoadingWallet(false);
      }
    };
    fetchWallet();
  }, [walletId]);

  const getWalletFavorites = () => {
    if (!walletData) return [];
    const walletBalances = [
      { nome: 'Bitcoin', sigla: 'BTC', balance: walletData.bitcoinBalance },
      { nome: 'Dogecoin', sigla: 'DOGE', balance: walletData.dogecoinBalance },
      { nome: 'XRP', sigla: 'XRP', balance: walletData.xrpBalance },
    ];
    const favorites = walletBalances.map((balanceObj) => {
      const found = cryptos.find(c => c.nome.toLowerCase() === balanceObj.nome.toLowerCase());
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

  const dataToShow = activeTab === 'favorites' ? getWalletFavorites() : cryptos;

  function calculateTotalBalance() {
    return usdBalance;
  }

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
    <TouchableOpacity
      style={activeTab === 'favorites' ? styles.favoriteItemRow : styles.itemRow}
      onPress={() => {
        setSelectedCrypto(item);
        setModalVisible(true);
      }}
    >
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
    </TouchableOpacity>
  );

  async function confirmBuyCrypto(qtd: number) {
    if (!walletId || !selectedCrypto) {
      Alert.alert('Carteira ou criptomoeda não disponível.');
      return;
    }
    console.log("walletId:", walletId); // Verifique se o walletId é o valor real
    const totalCost = selectedCrypto.precoAtual * qtd;
    if (usdBalance < totalCost) {
      Alert.alert('Saldo insuficiente.');
      return;
    }
    try {
      const response = await axios.post(
        `http://192.168.0.173:8080/api/wallet/${walletId}/buy-crypto?criptoNome=${selectedCrypto.nome}&quantidade=${qtd}`
      );
      console.log('Resposta da API após compra:', response.data); // Log para verificar
      Alert.alert(`${selectedCrypto.nome} comprado com sucesso!`);
      onUpdateWallet();
      setModalVisible(false);
      setQuantityInput('');
    } catch (error) {
      console.error(`Erro ao comprar ${selectedCrypto.nome}:`, error);
      Alert.alert(`Erro ao comprar ${selectedCrypto.nome}.`);
    }
  }

  async function confirmSellCrypto(qtd: number) {
    if (!walletId || !selectedCrypto || !walletData) {
      Alert.alert('Carteira ou criptomoeda não disponível.');
      return;
    }
    let currentCryptoBalance = 0;
    if (selectedCrypto.nome === 'Bitcoin') currentCryptoBalance = walletData.bitcoinBalance;
    else if (selectedCrypto.nome === 'Dogecoin') currentCryptoBalance = walletData.dogecoinBalance;
    else if (selectedCrypto.nome === 'XRP') currentCryptoBalance = walletData.xrpBalance;
    else if (selectedCrypto.nome === 'Ethereum') {
      // Verifica se há Ethereum na lista criptosCompradas
      const hasEthereum = walletData.criptosCompradas.some(cripto => cripto.nome === 'Ethereum');
      if (!hasEthereum) {
        Alert.alert('Nenhum Ethereum disponível para venda.');
        return;
      }
      // Para simplificar, assumimos que a quantidade disponível é 1 (ou calcule a quantidade real)
      currentCryptoBalance = 1; // Ajuste conforme lógica real
    } else {
      Alert.alert('Criptomoeda não suportada para venda.');
      return;
    }
    if (currentCryptoBalance + 1e-8 < qtd) {
      Alert.alert('Saldo insuficiente para venda.');
      return;
    }
    try {
      await axios.post(
        `http://192.168.0.173:8080/api/wallet/${walletId}/sell-crypto?criptoNome=${selectedCrypto.nome}&quantidade=${qtd}`
      );
      Alert.alert(`${selectedCrypto.nome} vendido com sucesso!`);
      onUpdateWallet();
      setModalVisible(false);
      setQuantityInput('');
    } catch (error) {
      console.error(`Erro ao vender ${selectedCrypto.nome}:`, error);
      Alert.alert(`Erro ao vender ${selectedCrypto.nome}.`);
    }
  }

  function handleConfirmPress() {
    const qtd = parseFloat(quantityInput);
    if (isNaN(qtd) || qtd <= 0) {
      Alert.alert('Por favor, insira um valor válido.');
      return;
    }
    if (action === 'buy') confirmBuyCrypto(qtd);
    else if (action === 'sell') confirmSellCrypto(qtd);
  }

  function handleAction(actionType: 'buy' | 'sell') {
    setAction(actionType);
    setQuantityInput('');
  }

  function getCryptoBalance(cryptoName: string): number {
    if (!walletData) return 0;
    if (cryptoName === 'Bitcoin') return walletData.bitcoinBalance;
    if (cryptoName === 'Dogecoin') return walletData.dogecoinBalance;
    if (cryptoName === 'XRP') return walletData.xrpBalance;
    if (cryptoName === 'Ethereum') {
      // Para Ethereum, podemos contar a quantidade na lista criptosCompradas (simplificado)
      return walletData.criptosCompradas.filter(cripto => cripto.nome === 'Ethereum').length || 0;
    }
    return 0;
  }

  return (
    <View style={styles.container}>
      <View style={styles.tabsContainer}>
        <TouchableOpacity style={styles.tabButton} onPress={() => setActiveTab('favorites')}>
          <Text style={[styles.tabText, activeTab === 'favorites' && styles.activeTabText]}>
            Favorites
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabButton} onPress={() => setActiveTab('all')}>
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
            {selectedCrypto && (
              <>
                <Text style={styles.modalTitle}>
                  {action === 'buy' ? `Buy ${selectedCrypto.nome}` : `Sell ${selectedCrypto.nome}`}
                </Text>
                {action === 'sell' && (
                  <Text style={styles.balanceText}>
                    You have {getCryptoBalance(selectedCrypto.nome).toFixed(2)} {selectedCrypto.sigla}
                  </Text>
                )}
                <Text style={styles.balanceText}>
                  Total Balance: ${usdBalance.toFixed(2)}
                </Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder={action === 'buy' ? "Enter quantity to buy" : "Enter quantity to sell"}
                  keyboardType="numeric"
                  value={quantityInput}
                  onChangeText={setQuantityInput}
                />
                <View style={styles.modalButtonContainer}>
                  <TouchableOpacity style={styles.modalButton} onPress={() => handleAction('buy')}>
                    <Text style={styles.modalButtonText}>Buy</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalButton} onPress={() => handleAction('sell')}>
                    <Text style={styles.modalButtonText}>Sell</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalButton} onPress={handleConfirmPress}>
                    <Text style={styles.modalButtonText}>Confirm</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalCancelButton]}
                    onPress={() => {
                      setModalVisible(false);
                      setAction(null);
                      setQuantityInput('');
                    }}
                  >
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
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
    backgroundColor: '#1a1a1a',
  },
  favoriteItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
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
    color: '#000',
  },
  balanceText: {
    fontSize: 16,
    color: '#000',
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
    flexWrap: 'wrap',
  },
  modalButton: {
    backgroundColor: '#1E90FF',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginVertical: 5,
  },
  modalCancelButton: {
    backgroundColor: '#ff4444',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 14,
  },
});