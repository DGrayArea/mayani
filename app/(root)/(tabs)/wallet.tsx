import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Wallet = () => {
  const [showP2P, setShowP2P] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  // Sample wallet data
  const walletData = {
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
  };

  // Sample P2P orders
  const p2pOrders = [
    {
      id: "1",
      type: "buy",
      crypto: "ETH",
      price: 3240.0,
      amount: 0.5,
      payment: "Bank Transfer",
      user: "trader123",
      rating: "98%",
    },
    {
      id: "2",
      type: "sell",
      crypto: "SOL",
      price: 125.0,
      amount: 10,
      payment: "PayPal",
      user: "cryptoking",
      rating: "95%",
    },
  ];

  const toggleP2P = () => {
    Animated.timing(animation, {
      toValue: showP2P ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setShowP2P(!showP2P);
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

  const renderP2POrder = (order) => (
    <View style={styles.p2pOrder} key={order.id}>
      <View style={styles.p2pHeader}>
        <Text
          style={[
            styles.p2pType,
            order.type === "buy" ? styles.buyType : styles.sellType,
          ]}
        >
          {order.type.toUpperCase()}
        </Text>
        <Text style={styles.p2pCrypto}>{order.crypto}</Text>
      </View>

      <View style={styles.p2pDetails}>
        <View style={styles.p2pInfo}>
          <Text style={styles.p2pLabel}>Price:</Text>
          <Text style={styles.p2pValue}>${order.price.toFixed(2)}</Text>
        </View>
        <View style={styles.p2pInfo}>
          <Text style={styles.p2pLabel}>Amount:</Text>
          <Text style={styles.p2pValue}>
            {order.amount} {order.crypto}
          </Text>
        </View>
        <View style={styles.p2pInfo}>
          <Text style={styles.p2pLabel}>Payment:</Text>
          <Text style={styles.p2pValue}>{order.payment}</Text>
        </View>
      </View>

      <View style={styles.p2pUser}>
        <Text style={styles.userName}>{order.user}</Text>
        <Text style={styles.userRating}>Rating: {order.rating}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView>
      <ScrollView style={styles.container}>
        <View style={styles.totalAssetsCard}>
          <Text style={styles.totalAssetsLabel}>Total Assets</Text>
          <Text style={styles.totalAssetsAmount}>
            ${calculateTotalAssets()}
          </Text>
        </View>

        <View style={styles.cryptoContainer}>
          {renderCryptoCard("eth", walletData.eth)}
          {renderCryptoCard("sol", walletData.sol)}
        </View>

        <TouchableOpacity style={styles.p2pButton} onPress={toggleP2P}>
          <Text style={styles.p2pButtonText}>P2P Trading</Text>
          <Text style={styles.p2pToggle}>{showP2P ? "▼" : "▶"}</Text>
        </TouchableOpacity>

        <Animated.View
          style={[
            styles.p2pContainer,
            {
              maxHeight: animation.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1000],
              }),
              opacity: animation,
            },
          ]}
        >
          <View style={styles.p2pContent}>
            <Text style={styles.p2pTitle}>Available Orders</Text>
            {p2pOrders.map((order) => renderP2POrder(order))}
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  totalAssetsCard: {
    backgroundColor: "#2196F3",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  totalAssetsLabel: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 16,
  },
  totalAssetsAmount: {
    color: "#ffffff",
    fontSize: 32,
    fontWeight: "bold",
    marginTop: 8,
  },
  cryptoContainer: {
    marginBottom: 16,
  },
  cryptoCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
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
  },
  cryptoName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  balanceContainer: {
    marginBottom: 12,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a1a1a",
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
    color: "#1a1a1a",
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
  p2pButton: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  p2pButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  p2pToggle: {
    fontSize: 18,
    color: "#666",
  },
  p2pContainer: {
    overflow: "hidden",
  },
  p2pContent: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
  },
  p2pTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#1a1a1a",
  },
  p2pOrder: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  p2pHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  p2pType: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
    fontSize: 12,
    fontWeight: "bold",
  },
  buyType: {
    backgroundColor: "#E8F5E9",
    color: "#4CAF50",
  },
  sellType: {
    backgroundColor: "#FFEBEE",
    color: "#F44336",
  },
  p2pCrypto: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  p2pDetails: {
    marginBottom: 12,
  },
  p2pInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  p2pLabel: {
    color: "#666",
  },
  p2pValue: {
    color: "#1a1a1a",
    fontWeight: "500",
  },
  p2pUser: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  userName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  userRating: {
    fontSize: 14,
    color: "#666",
  },
});

export default Wallet;
