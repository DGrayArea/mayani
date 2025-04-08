import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ReceiveModal from "@/components/dialog/ReceiveModal";
import SendModal from "@/components/dialog/SendModal";
import useWalletStore from "@/hooks/walletStore";
import images from "@/constants/images";
import ChainSelector from "@/components/ChainSelector";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome } from "@expo/vector-icons";

const Wallet = () => {
  const [receiveModalVisible, setReceiveModalVisible] = useState(false);
  const [sendModalVisible, setSendModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [walletData, setWalletData] = useState({
    eth: {
      balance: 0,
      price: 2150.75,
      change: "+3.2%",
    },
    sol: {
      balance: 0,
      price: 152.43,
      change: "+5.7%",
    },
    usdt: {
      balance: 0,
      price: 1.00,
      change: "0.0%",
    }
  });
  const [transactions, setTransactions] = useState([]);

  const {
    solWalletAddress,
    ethWalletAddress,
    generateSolWallet,
    generateEthWallet,
    currentChain,
    switchChain,
  } = useWalletStore();

  useEffect(() => {
    if (!solWalletAddress) {
      generateSolWallet();
    }
    if (!ethWalletAddress) {
      generateEthWallet();
    }
    // Simulate fetching wallet data
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    // In a real app, we would fetch real balance data here
    // Simulating API call with timeout
    setRefreshing(true);
    
    setTimeout(() => {
      setWalletData({
        eth: {
          balance: 0,
          price: 2150.75,
          change: "+3.2%",
        },
        sol: {
          balance: 0,
          price: 152.43,
          change: "+5.7%",
        },
        usdt: {
          balance: 0,
          price: 1.00,
          change: "0.0%",
        }
      });
      setRefreshing(false);
    }, 1000);
  };

  const calculateTotalAssets = () => {
    const ethValue = walletData.eth.balance * walletData.eth.price;
    const solValue = walletData.sol.balance * walletData.sol.price;
    const usdtValue = walletData.usdt.balance * walletData.usdt.price;
    return (ethValue + solValue + usdtValue).toFixed(2);
  };

  const ActionButton = ({ icon, label, onPress, primary = false }) => (
    <TouchableOpacity
      style={[
        styles.actionButton,
        primary ? styles.primaryActionButton : styles.secondaryActionButton,
      ]}
      onPress={onPress}
    >
      <View style={styles.actionButtonContent}>
        <Image source={icon} style={styles.actionButtonIcon} />
        <Text style={styles.actionButtonText}>{label}</Text>
      </View>
    </TouchableOpacity>
  );

  const CryptoCard = ({ crypto, data }) => {
    let icon = null;
    let fullName = "";
    
    if (crypto === "eth") {
      icon = images.eth1;
      fullName = "Ethereum";
    } else if (crypto === "sol") {
      icon = images.sol1;
      fullName = "Solana";
    } else if (crypto === "usdt") {
      fullName = "Tether USD";
      // Using FontAwesome for USDT icon
      icon = null;
    }
    
    return (
      <TouchableOpacity style={styles.cryptoCard}>
        <View style={styles.cryptoHeader}>
          <View style={[
            styles.cryptoIconContainer, 
            crypto === "usdt" && { backgroundColor: "rgba(38, 161, 123, 0.2)" }
          ]}>
            {icon ? (
              <Image
                source={icon}
                style={styles.cryptoIcon}
              />
            ) : (
              <FontAwesome name="dollar" size={20} color="#26A17B" />
            )}
          </View>
          <View>
            <Text style={styles.cryptoName}>{crypto.toUpperCase()}</Text>
            <Text style={styles.cryptoFullName}>
              {fullName}
            </Text>
          </View>
        </View>

        <View style={styles.balanceContainer}>
          <Text style={styles.balanceAmount}>
            {data.balance.toFixed(4)} {crypto.toUpperCase()}
          </Text>
          <Text style={styles.balanceUsd}>
            ${(data.balance * data.price).toFixed(2)}
          </Text>
        </View>

        <View style={styles.priceInfo}>
          <Text style={styles.priceText}>${data.price.toFixed(2)}</Text>
          <Text
            style={[
              styles.changeText,
              data.change.includes("+")
                ? styles.positiveChange
                : data.change === "0.0%" 
                  ? styles.neutralChange
                  : styles.negativeChange,
            ]}
          >
            {data.change}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const TransactionItem = ({ transaction }) => {
    const isReceive = transaction.type === 'receive';
    return (
      <View style={styles.transactionItem}>
        <View style={[styles.transactionIconContainer, isReceive ? styles.receiveIcon : styles.sendIcon]}>
          <Text style={styles.transactionIconText}>{isReceive ? '+' : '-'}</Text>
        </View>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionTitle}>
            {isReceive ? 'Received' : 'Sent'} {transaction.symbol}
          </Text>
          <Text style={styles.transactionDate}>{transaction.date}</Text>
        </View>
        <View style={styles.transactionAmount}>
          <Text style={[styles.transactionAmountText, isReceive ? styles.receiveText : styles.sendText]}>
            {isReceive ? '+' : '-'}{transaction.amount} {transaction.symbol}
          </Text>
          <Text style={styles.transactionStatus}>{transaction.status}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchWalletData} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Ape It Wallet</Text>
          <ChainSelector
            chainLogos={{
              SOL: images.sol1,
              ETH: images.eth1,
            }}
            currentChain={currentChain}
            switchChain={switchChain}
          />
        </View>

        <LinearGradient
          colors={['#8C5BE6', '#5A2DA0']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.totalAssetsCard}
        >
          <Text style={styles.totalAssetsLabel}>Total Balance</Text>
          <Text style={styles.totalAssetsAmount}>
            ${calculateTotalAssets()}
          </Text>
          <View style={styles.walletAddressContainer}>
            <Text style={styles.walletAddressLabel}>
              {currentChain === "SOL" ? "SOL Address" : "ETH Address"}:
            </Text>
            <Text style={styles.walletAddress} numberOfLines={1}>
              {currentChain === "SOL" ? solWalletAddress : ethWalletAddress}
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.actionsContainer}>
          <ActionButton
            icon={currentChain === "SOL" ? images.sol1 : images.eth1}
            label="Receive"
            onPress={() => setReceiveModalVisible(true)}
          />
          <ActionButton
            icon={currentChain === "SOL" ? images.sol1 : images.eth1}
            label="Send"
            onPress={() => setSendModalVisible(true)}
            primary={true}
          />
        </View>

        <Text style={styles.sectionTitle}>Your Assets</Text>
        <View style={styles.cryptoContainer}>
          <CryptoCard crypto="eth" data={walletData.eth} />
          <CryptoCard crypto="sol" data={walletData.sol} />
          <CryptoCard crypto="usdt" data={walletData.usdt} />
        </View>

        <View style={styles.noTransactionsContainer}>
          <LinearGradient
            colors={['rgba(140, 91, 230, 0.1)', 'rgba(90, 45, 160, 0.1)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.noTransactionsGradient}
          >
            <Image 
              source={require('@/assets/icon.jpg')} 
              style={styles.noTransactionsImage} 
            />
            <Text style={styles.noTransactionsTitle}>Welcome to Ape It Wallet</Text>
            <Text style={styles.noTransactionsText}>
              Your transactions will appear here when you start using your wallet. 
              Send or receive tokens to get started!
            </Text>
          </LinearGradient>
        </View>

        <ReceiveModal
          visible={receiveModalVisible}
          onClose={() => setReceiveModalVisible(false)}
        />
        <SendModal
          visible={sendModalVisible}
          onClose={() => setSendModalVisible(false)}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A0E26",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#E0E0E0",
  },
  totalAssetsCard: {
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  totalAssetsLabel: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 16,
  },
  totalAssetsAmount: {
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: "bold",
    marginTop: 8,
  },
  walletAddressContainer: {
    marginTop: 12,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderRadius: 8,
    padding: 8,
  },
  walletAddressLabel: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 12,
  },
  walletAddress: {
    color: "#FFFFFF",
    fontSize: 13,
    marginTop: 4,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  actionButton: {
    borderRadius: 12,
    padding: 16,
    flex: 0.45,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryActionButton: {
    backgroundColor: "#8C5BE6",
  },
  secondaryActionButton: {
    backgroundColor: "#2E1A40",
    borderWidth: 1,
    borderColor: "#8C5BE6",
  },
  actionButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#E0E0E0",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  cryptoContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  cryptoCard: {
    backgroundColor: "#2E1A40",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(140, 91, 230, 0.3)",
  },
  cryptoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  cryptoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(140, 91, 230, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cryptoIcon: {
    width: 24,
    height: 24,
  },
  cryptoName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#E0E0E0",
  },
  cryptoFullName: {
    fontSize: 14,
    color: "#9B86B3",
  },
  balanceContainer: {
    marginBottom: 12,
  },
  balanceAmount: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#E0E0E0",
  },
  balanceUsd: {
    fontSize: 16,
    color: "#9B86B3",
    marginTop: 4,
  },
  priceInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(140, 91, 230, 0.2)",
  },
  priceText: {
    fontSize: 16,
    color: "#9B86B3",
  },
  changeText: {
    fontSize: 16,
    fontWeight: "bold",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  positiveChange: {
    color: "#3DD598",
    backgroundColor: "rgba(61, 213, 152, 0.1)",
  },
  negativeChange: {
    color: "#F56565",
    backgroundColor: "rgba(245, 101, 101, 0.1)",
  },
  neutralChange: {
    color: "#9B86B3",
    backgroundColor: "rgba(155, 134, 179, 0.1)",
  },
  transactionsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E1A40',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(140, 91, 230, 0.2)',
  },
  transactionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  receiveIcon: {
    backgroundColor: 'rgba(61, 213, 152, 0.2)',
  },
  sendIcon: {
    backgroundColor: 'rgba(245, 101, 101, 0.2)',
  },
  transactionIconText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E0E0E0',
  },
  transactionDate: {
    fontSize: 12,
    color: '#9B86B3',
    marginTop: 2,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  transactionAmountText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  receiveText: {
    color: '#3DD598',
  },
  sendText: {
    color: '#F56565',
  },
  transactionStatus: {
    fontSize: 12,
    color: '#9B86B3',
    marginTop: 2,
  },
  noTransactionsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  noTransactionsGradient: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(140, 91, 230, 0.3)',
  },
  noTransactionsImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#8C5BE6',
  },
  noTransactionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E0E0E0',
    marginBottom: 8,
    textAlign: 'center',
  },
  noTransactionsText: {
    fontSize: 14,
    color: '#9B86B3',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default Wallet;
