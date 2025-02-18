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
  precoAtual: number;
  imageUrl: string;
}

interface CryptoListProps {
  walletId: string | null;
  usdBalance: number;
  onUpdateWallet: () => void;
}

export default function CryptoList({ walletId, usdBalance, onUpdateWallet }: CryptoListProps) {
  const [cryptos, setCryptos] = useState<Cripto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [quantityInput, setQuantityInput] = useState<string>(''); // Quantidade informada
  const [selectedCrypto, setSelectedCrypto] = useState<Cripto | null>(null);

  useEffect(() => {
    const fetchCryptos = async () => {
      try {

        // CONTROLLER CRYPTOCURRENCY
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
          return {
            ...item,
            imageUrl,
          };
        });
        setCryptos(cryptosFetched);
      } catch (error) {
        console.error('Erro ao buscar preços das criptomoedas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCryptos();
  }, []);

  const confirmBuyCrypto = async (quantidade: number) => {
    if (!walletId || !selectedCrypto) {
      alert('Wallet ou criptomoeda não disponível.');
      return;
    }

    const custoTotal = selectedCrypto.precoAtual * quantidade;
    if (usdBalance < custoTotal) {
      alert('Saldo insuficiente.');
      return;
    }

    try {

      // WALLET CONTROLLER
      await axios.post(`http://192.168.0.173:8080/api/wallet/${walletId}/buy-crypto?criptoNome=${selectedCrypto.nome}&quantidade=${quantidade}`);
      alert(`${selectedCrypto.nome} comprado com sucesso!`);
      onUpdateWallet();
    } catch (error) {
      console.error(`Erro ao comprar ${selectedCrypto.nome}:`, error);
      alert(`Erro ao comprar ${selectedCrypto.nome}.`);
    }
  };


  const handleBuyButtonPress = (crypto: Cripto) => {
    setSelectedCrypto(crypto);
    setModalVisible(true);
  };

 
  const handleConfirmPress = () => {
    const quantidade = parseFloat(quantityInput);
    if (isNaN(quantidade) || quantidade <= 0) {
      alert('Por favor, insira um valor válido.');
      return;
    }
    setModalVisible(false);
    setQuantityInput('');
    confirmBuyCrypto(quantidade);
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#1E90FF" />;
  }

  if (cryptos.length === 0) {
    return <Text style={styles.errorText}>Erro ao carregar informações das criptomoedas.</Text>;
  }


  const renderCryptoItem = ({ item }: { item: Cripto }) => (
    <View style={styles.itemRow}>
      <Image 
        source={{ uri: item.imageUrl }} 
        style={styles.cryptoImage}
      />
      <View style={styles.textContainer}>
        <Text style={styles.cryptoName}>{item.nome}</Text>
        <Text style={styles.cryptoPrice}>${item.precoAtual.toFixed(2)}</Text>
      </View>
      <TouchableOpacity style={styles.buyButton} onPress={() => handleBuyButtonPress(item)}>
        <Text style={styles.buyButtonText}>Comprar</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Criptomoedas Disponíveis</Text>
      <FlatList 
        data={cryptos}
        keyExtractor={(item) => item.nome}
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
              <TouchableOpacity style={[styles.modalButton, styles.modalCancelButton]} onPress={() => setModalVisible(false)}>
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
    marginTop: 20,
    paddingHorizontal: 16,
  },
  listContainer: {
    paddingBottom: 20,
  },
  title: {
    fontSize: 20,
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },

  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cryptoImage: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  cryptoName: {
    fontSize: 16,
    color: '#FFD700',
  },
  cryptoPrice: {
    fontSize: 14,
    color: '#fff',
  },
  buyButton: {
    backgroundColor: '#1E90FF',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  buyButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 16,
    textAlign: 'center',
  },


  // modal
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
