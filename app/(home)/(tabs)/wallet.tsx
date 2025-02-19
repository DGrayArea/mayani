import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ReceiveModal from "@/components/dialog/ReceiveModal";
import SendModal from "@/components/dialog/SendModal";
import useWalletStore from "@/hooks/walletStore";
import images from "@/constants/images";
import ChainSelector from "@/components/ChainSelector";

const Wallet = () => {
  const [receiveModalVisible, setReceiveModalVisible] = useState(false);
  const [sendModalVisible, setSendModalVisible] = useState(false);
  const [walletData, setWalletData] = useState({
    eth: {
      balance: 1.234,
      price: 3245.67,
      change: "+5.2%",
    },
    sol: {
      balance: 15.67,
      price: 123.45,
      change: "+3.8%",
    },
  });

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
  }, []);

  const CHAIN_LOGOS = {
    SOL: images.sol1,
    ETH: images.eth1,
  };

  const calculateTotalAssets = () => {
    const ethValue = walletData.eth.balance * walletData.eth.price;
    const solValue = walletData.sol.balance * walletData.sol.price;
    return (ethValue + solValue).toFixed(2);
  };

  const renderCryptoCard = (crypto, data) => (
    <View style={styles.cryptoCard}>
      <View style={styles.cryptoHeader}>
        <Image
          source={{ uri: `/api/placeholder/32/32` }}
          style={styles.cryptoIcon}
        />
        <Text style={styles.cryptoName}>{crypto.toUpperCase()}</Text>
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
              : styles.negativeChange,
          ]}
        >
          {data.change}
        </Text>
      </View>
    </View>
  );

  const renderChainSelector = () => (
    <View style={styles.chainSelector}>
      <TouchableOpacity
        style={[
          styles.chainButton,
          currentChain === "SOL" && styles.activeChainButton,
        ]}
        onPress={() => switchChain("SOL")}
      >
        <Image source={CHAIN_LOGOS.SOL} style={styles.chainLogo} />
        <Text style={styles.chainText}>Solana</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.chainButton,
          currentChain === "ETH" && styles.activeChainButton,
        ]}
        onPress={() => switchChain("ETH")}
      >
        <Image source={CHAIN_LOGOS.ETH} style={styles.chainLogo} />
        <Text style={styles.chainText}>Ethereum</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {renderChainSelector()}
        {/* <ChainSelector
          chainLogos={CHAIN_LOGOS}
          currentChain={currentChain}
          switchChain={switchChain}
        /> */}
        <View style={styles.headerContainer}>
          <View style={styles.totalAssetsCard}>
            <Text style={styles.totalAssetsLabel}>Total Assets</Text>
            <Text style={styles.totalAssetsAmount}>
              ${calculateTotalAssets()}
            </Text>
          </View>

          <View style={styles.walletActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setReceiveModalVisible(true)}
            >
              <Text style={styles.actionButtonText}>Receive</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setSendModalVisible(true)}
            >
              <Text style={styles.actionButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.cryptoContainer}>
          {renderCryptoCard("eth", walletData.eth)}
          {renderCryptoCard("sol", walletData.sol)}
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
    backgroundColor: "#0A0F0D", //f5f5f5
    padding: 16,
  },
  totalAssetsCard: {
    // backgroundColor: "#21F36A", //2196F3
    backgroundColor: "#1A231E",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2A3F33",
    padding: 20,
    marginBottom: 16,
  },
  totalAssetsLabel: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 16,
  },
  totalAssetsAmount: {
    color: "#E0E0E0",
    fontSize: 32,
    fontWeight: "bold",
    marginTop: 8,
  },
  cryptoContainer: {
    marginBottom: 16,
  },
  cryptoCard: {
    backgroundColor: "#1A231E",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2A3F33",
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cryptoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  cryptoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: "#2A3F33",
  },
  cryptoName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#8FA396",
  },
  balanceContainer: {
    marginBottom: 12,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#8FA396",
  },
  balanceUsd: {
    fontSize: 16,
    color: "#666",
    marginTop: 4,
  },
  priceInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceText: {
    fontSize: 16,
    color: "#8FA396",
  },
  changeText: {
    fontSize: 16,
    fontWeight: "500",
  },
  positiveChange: {
    color: "#4CAF50",
  },
  negativeChange: {
    color: "#F44336",
  },
  userName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8FA396",
  },
  userRating: {
    fontSize: 14,
    color: "#666",
  },
  headerContainer: {
    marginBottom: 16,
  },
  walletActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  actionButton: {
    backgroundColor: "#1A231E",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2A3F33",
    padding: 16,
    flex: 0.48,
    alignItems: "center",
  },
  actionButtonText: {
    color: "#8FA396",
    fontSize: 16,
    fontWeight: "bold",
  },
  chainSelector: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
  },
  chainButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 8,
    backgroundColor: "#1A231E",
  },
  activeChainButton: {
    borderWidth: 2,
    borderColor: "#2A3F33",
  },
  chainLogo: {
    width: 28,
    height: 28,
    marginRight: 8,
  },
  chainText: {
    color: "#8FA396",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default Wallet;
