import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
  Alert,
  Animated,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const BuyModal = ({ symbol, price }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [buyAmount, setBuyAmount] = useState<string>("");
  const [limitPrice, setLimitPrice] = useState<string>("");
  const [calculatedTokens, setCalculatedTokens] = useState<number>(0);
  const [amountType, setAmountType] = useState<"SOL" | "USD">("SOL");
  const [orderType, setOrderType] = useState<"market" | "limit">("market");
  const [slideAnim] = useState(new Animated.Value(0));

  const calculateTokenAmount = useCallback(
    (inputAmount: string, priceToUse: number) => {
      const amount = parseFloat(inputAmount);
      if (isNaN(amount) || amount <= 0) {
        setCalculatedTokens(0);
        return;
      }

      const tokenAmount =
        amountType === "USD"
          ? amount / priceToUse
          : (amount * 150) / priceToUse; // Assuming 1 SOL = $150 USD

      setCalculatedTokens(tokenAmount);
    },
    [amountType]
  );

  useEffect(() => {
    if (orderType === "market") {
      calculateTokenAmount(buyAmount, price);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      const limitPriceValue = parseFloat(limitPrice) || price;
      calculateTokenAmount(buyAmount, limitPriceValue);
      Animated.timing(slideAnim, {
        toValue: width - 222,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [
    amountType,
    buyAmount,
    limitPrice,
    orderType,
    calculateTokenAmount,
    price,
    slideAnim,
    width,
  ]);

  const handlePurchase = () => {
    const amount = parseFloat(buyAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid amount");
      return;
    }

    if (orderType === "limit" && (!limitPrice || parseFloat(limitPrice) <= 0)) {
      Alert.alert("Invalid Limit Price", "Please enter a valid limit price");
      return;
    }

    Alert.alert(
      `Confirm ${orderType === "market" ? "Purchase" : "Limit Order"}`,
      `Are you sure you want to ${orderType === "market" ? "buy" : "place a limit order for"} ${calculatedTokens.toFixed(
        4
      )} ${symbol} for ${amount} ${amountType}? ${orderType === "limit" ? `\n\nLimit Price: ${limitPrice}` : ""}`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Confirm",
          onPress: () => {
            Alert.alert(
              "Success!",
              `Successfully ${orderType === "market" ? "purchased" : "placed a limit order for"} ${calculatedTokens.toFixed(
                4
              )} ${symbol} for ${amount} ${amountType} ${orderType === "limit" ? `at limit price ${limitPrice}` : ""}`,
              [
                {
                  text: "OK",
                  onPress: () => {
                    setIsModalVisible(false);
                    setBuyAmount("");
                    setLimitPrice("");
                    setCalculatedTokens(0);
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const resetFilters = useCallback(() => {
    setBuyAmount("");
    setLimitPrice("");
    setCalculatedTokens(0);
  }, []);

  const toggleModal = () => setIsModalVisible(!isModalVisible);
  const toggleClose = () => setIsModalVisible(false);

  const quickAmounts = [10, 50, 100, 200];

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggleModal} style={styles.actionButton2}>
        <Text style={styles.actionButtonText2}>Buy</Text>
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={toggleClose}
      >
        <TouchableWithoutFeedback onPress={toggleClose}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Buy {symbol}</Text>
                  <TouchableOpacity
                    onPress={toggleClose}
                    style={styles.closeButton}
                  >
                    <Ionicons name="close" size={24} color="#9B86B3" />
                  </TouchableOpacity>
                </View>

                <View style={styles.priceContainer}>
                  <Text style={styles.priceLabel}>Current Price</Text>
                  <Text style={styles.priceValue}>${price}</Text>
                </View>

                <View style={styles.tabContainer}>
                  <View style={styles.tabBackground}>
                    <Animated.View
                      style={[
                        styles.tabIndicator,
                        { transform: [{ translateX: slideAnim }] },
                      ]}
                    />
                  </View>
                  <TouchableOpacity
                    style={styles.tabButton}
                    onPress={() => setOrderType("market")}
                  >
                    <Text
                      style={[
                        styles.tabText,
                        orderType === "market" && styles.tabTextActive,
                      ]}
                    >
                      Market
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.tabButton}
                    onPress={() => setOrderType("limit")}
                  >
                    <Text
                      style={[
                        styles.tabText,
                        orderType === "limit" && styles.tabTextActive,
                      ]}
                    >
                      Limit
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Amount ({amountType})</Text>
                  <TextInput
                    style={styles.amountInput}
                    placeholder="0.00"
                    placeholderTextColor="#9B86B3"
                    keyboardType="decimal-pad"
                    value={buyAmount}
                    onChangeText={setBuyAmount}
                  />

                  <View style={styles.quickAmountContainer}>
                    {quickAmounts.map((amount) => (
                      <TouchableOpacity
                        key={amount}
                        style={styles.quickAmountButton}
                        onPress={() => setBuyAmount(amount.toString())}
                      >
                        <Text style={styles.quickAmountText}>{amount}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {orderType === "limit" && (
                    <View style={styles.limitPriceContainer}>
                      <Text style={styles.inputLabel}>Limit Price (USD)</Text>
                      <View style={styles.limitInputWrapper}>
                        <Text style={styles.currencySymbol}>$</Text>
                        <TextInput
                          style={styles.limitInput}
                          placeholder={price.toString()}
                          placeholderTextColor="#9B86B3"
                          keyboardType="decimal-pad"
                          value={limitPrice}
                          onChangeText={setLimitPrice}
                        />
                      </View>
                    </View>
                  )}
                </View>

                <View style={styles.calculationContainer}>
                  <View style={styles.currencyToggle}>
                    <TouchableOpacity
                      style={[
                        styles.currencyButton,
                        amountType === "SOL" && styles.currencyButtonActive,
                      ]}
                      onPress={() => setAmountType("SOL")}
                    >
                      <Text
                        style={[
                          styles.currencyText,
                          amountType === "SOL" && styles.currencyTextActive,
                        ]}
                      >
                        SOL
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.currencyButton,
                        amountType === "USD" && styles.currencyButtonActive,
                      ]}
                      onPress={() => setAmountType("USD")}
                    >
                      <Text
                        style={[
                          styles.currencyText,
                          amountType === "USD" && styles.currencyTextActive,
                        ]}
                      >
                        USD
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {calculatedTokens > 0 && (
                    <View style={styles.summaryContainer}>
                      <Text style={styles.summaryLabel}>You will receive:</Text>
                      <Text style={styles.summaryValue}>
                        {calculatedTokens.toLocaleString(undefined, {
                          maximumFractionDigits: 4,
                        })}{" "}
                        {symbol}
                      </Text>
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  style={[
                    styles.buyButton,
                    !calculatedTokens && styles.buyButtonDisabled,
                    orderType === "limit" && styles.limitOrderButton,
                  ]}
                  onPress={handlePurchase}
                  disabled={!calculatedTokens}
                >
                  <Text style={styles.buyButtonText}>
                    {orderType === "market" ? "Buy Now" : "Place Limit Order"}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 0,
    justifyContent: "flex-start",
    alignItems: "flex-start",
    marginTop: 0,
    marginBottom: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(10, 5, 15, 0.8)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#1A0E26",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingVertical: 24,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    color: "#E0E0E0",
    fontWeight: "bold",
  },
  closeButton: {
    padding: 4,
  },
  priceContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  priceLabel: {
    fontSize: 14,
    color: "#9B86B3",
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 24,
    color: "#E0E0E0",
    fontWeight: "bold",
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 20,
    height: 48,
    position: "relative",
    marginBottom: 24,
  },
  tabBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#2E1A40",
    borderRadius: 12,
    zIndex: 0,
  },
  tabIndicator: {
    position: "absolute",
    width: "50%",
    height: "100%",
    backgroundColor: "#5A2DA0",
    borderRadius: 12,
    zIndex: 1,
  },
  tabButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#9B86B3",
  },
  tabTextActive: {
    color: "#E0E0E0",
  },
  inputWrapper: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: "#9B86B3",
    marginBottom: 8,
  },
  amountInput: {
    backgroundColor: "#2E1A40",
    borderRadius: 12,
    padding: 16,
    color: "#E0E0E0",
    fontSize: 20,
    textAlign: "center",
    fontWeight: "bold",
    borderWidth: 1,
    borderColor: "#5A2DA0",
  },
  quickAmountContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  quickAmountButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#2E1A40",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#5A2DA0",
  },
  quickAmountText: {
    color: "#9B86B3",
    fontSize: 14,
  },
  limitPriceContainer: {
    marginTop: 16,
  },
  limitInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2E1A40",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#5A2DA0",
    paddingHorizontal: 16,
  },
  currencySymbol: {
    color: "#9B86B3",
    fontSize: 20,
    marginRight: 8,
  },
  limitInput: {
    flex: 1,
    padding: 16,
    color: "#E0E0E0",
    fontSize: 20,
    textAlign: "left",
    fontWeight: "bold",
  },
  calculationContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  currencyToggle: {
    flexDirection: "row",
    backgroundColor: "#2E1A40",
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  currencyButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  currencyButtonActive: {
    backgroundColor: "#5A2DA0",
  },
  currencyText: {
    color: "#9B86B3",
    fontSize: 16,
    fontWeight: "600",
  },
  currencyTextActive: {
    color: "#E0E0E0",
  },
  summaryContainer: {
    backgroundColor: "#2E1A40",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    color: "#9B86B3",
    fontSize: 14,
  },
  summaryValue: {
    color: "#E0E0E0",
    fontSize: 16,
    fontWeight: "bold",
  },
  buyButton: {
    backgroundColor: "#8C5BE6",
    borderRadius: 12,
    paddingVertical: 16,
    marginHorizontal: 20,
    alignItems: "center",
  },
  buyButtonDisabled: {
    opacity: 0.5,
  },
  limitOrderButton: {
    backgroundColor: "#5A2DA0",
  },
  buyButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  actionButton2: {
    marginTop: 20,
    backgroundColor: "#2E1A40",
    borderRadius: 12,
    borderWidth: 0.7,
    borderColor: "#8C5BE6",
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    width: "100%",
  },
  actionButtonText2: {
    color: "#9B86B3",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default BuyModal;
