import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ScrollView,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const p2p = () => {
  const [animation] = useState(new Animated.Value(0));
  const [p2pOrders] = useState([
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
    {
      id: "3",
      type: "sell",
      crypto: "SOL",
      price: 125.0,
      amount: 10,
      payment: "PayPal",
      user: "cryptoking",
      rating: "95%",
    },
    {
      id: "4",
      type: "sell",
      crypto: "SOL",
      price: 125.0,
      amount: 10,
      payment: "PayPal",
      user: "cryptoking",
      rating: "95%",
    },
    {
      id: "5",
      type: "sell",
      crypto: "SOL",
      price: 125.0,
      amount: 10,
      payment: "PayPal",
      user: "cryptoking",
      rating: "95%",
    },
    {
      id: "6",
      type: "sell",
      crypto: "SOL",
      price: 125.0,
      amount: 10,
      payment: "PayPal",
      user: "cryptoking",
      rating: "95%",
    },
  ]);

  const renderP2POrder = ({ item }) => (
    <View style={styles.p2pOrder}>
      <View style={styles.p2pHeader}>
        <Text
          style={[
            styles.p2pType,
            item.type === "buy" ? styles.buyType : styles.sellType,
          ]}
        >
          {item.type.toUpperCase()}
        </Text>
        <Text style={styles.p2pCrypto}>{item.crypto}</Text>
      </View>

      <View style={styles.p2pDetails}>
        <View style={styles.p2pInfo}>
          <Text style={styles.p2pLabel}>Price:</Text>
          <Text style={styles.p2pValue}>${item.price.toFixed(2)}</Text>
        </View>
        <View style={styles.p2pInfo}>
          <Text style={styles.p2pLabel}>Amount:</Text>
          <Text style={styles.p2pValue}>
            {item.amount} {item.crypto}
          </Text>
        </View>
        <View style={styles.p2pInfo}>
          <Text style={styles.p2pLabel}>Payment:</Text>
          <Text style={styles.p2pValue}>{item.payment}</Text>
        </View>
      </View>

      <View style={styles.p2pUser}>
        <Text style={styles.userName}>{item.user}</Text>
        <Text style={styles.userRating}>Rating: {item.rating}</Text>
      </View>
    </View>
  );

  const toggleP2P = () => {
    Animated.timing(animation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={p2pOrders}
        renderItem={renderP2POrder}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.p2pContent}
        ListHeaderComponent={
          <Text style={styles.p2pTitle}>Available Orders</Text>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0F0D",
  },
  //   p2pContent: {
  //     padding: 16,
  //   },
  p2pContent: {
    backgroundColor: "#1A231E",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2A3F33",
    padding: 16,
  },
  p2pCrypto: {
    fontSize: 16,
    fontWeight: "600",
    color: "#8FA396",
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
    color: "#8FA396",
    fontWeight: "500",
  },
  p2pUser: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#2A3F33",
  },
  p2pButton: {
    backgroundColor: "#1A231E",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2A3F33",
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  p2pButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#8FA396",
  },
  p2pToggle: {
    fontSize: 18,
    color: "#666",
  },
  p2pContainer: {
    overflow: "hidden",
  },
  p2pTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#8FA396",
  },
  p2pOrder: {
    borderWidth: 1,
    borderColor: "#2A3F33",
    borderRadius: 12,
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
  userName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8FA396",
  },
  userRating: {
    fontSize: 14,
    color: "#666",
  },
});

export default p2p;
