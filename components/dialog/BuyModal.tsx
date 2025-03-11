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
} from "react-native";

const BuyModal = ({ symbol, price }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [buyAmount, setBuyAmount] = useState<string>("");
  const [calculatedTokens, setCalculatedTokens] = useState<number>(0);
  const [amountType, setAmountType] = useState<"SOL" | "USD">("SOL");

  const calculateTokenAmount = useCallback(
    (inputAmount: string) => {
      const amount = parseFloat(inputAmount);
      if (isNaN(amount) || amount <= 0) {
        setCalculatedTokens(0);
        return;
      }

      const tokenAmount =
        amountType === "USD" ? amount / price : (amount * 30) / price; // Assuming 1 SOL = $30 USD

      setCalculatedTokens(tokenAmount);
    },
    [amountType, price]
  );

  useEffect(() => {
    calculateTokenAmount(buyAmount);
  }, [amountType, buyAmount, calculateTokenAmount]);

  const handlePurchase = () => {
    const amount = parseFloat(buyAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid amount");
      return;
    }

    Alert.alert(
      "Confirm Purchase",
      `Are you sure you want to buy ${calculatedTokens.toFixed(
        4
      )} ${symbol} for ${amount} ${amountType}?`,
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
              `Successfully purchased ${calculatedTokens.toFixed(
                4
              )} ${symbol} for ${amount} ${amountType}`,
              [
                {
                  text: "OK",
                  onPress: () => {
                    setIsModalVisible(false);
                    setBuyAmount("");
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
    setBuyAmount("0");
    setCalculatedTokens(0);
  }, []);

  const toggleModal = () => setIsModalVisible(!isModalVisible);
  const toggleClose = () => setIsModalVisible(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggleModal} style={styles.actionButton2}>
        <Text style={styles.actionButtonText2}>Buy</Text>
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={toggleModal}
      >
        <TouchableWithoutFeedback onPress={toggleModal}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Buy</Text>
                  <TouchableOpacity onPress={resetFilters}>
                    <Text style={styles.resetText}>Reset</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter amount"
                    placeholderTextColor="#8FA396"
                    keyboardType="decimal-pad"
                    value={buyAmount}
                    onChangeText={(text) => {
                      setBuyAmount(text);
                      calculateTokenAmount(text);
                    }}
                  />
                  {calculatedTokens > 0 && (
                    <Text style={styles.estimatedTokens}>
                      ≈ {calculatedTokens.toLocaleString()} {symbol}
                    </Text>
                  )}
                  <View style={styles.toggleContainer}>
                    <TouchableOpacity
                      style={[
                        styles.toggleButton,
                        amountType === "SOL" && styles.toggleButtonActive,
                      ]}
                      onPress={() => setAmountType("SOL")}
                    >
                      <Text
                        style={[
                          styles.toggleText,
                          amountType === "SOL" && styles.toggleTextActive,
                        ]}
                      >
                        SOL
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.toggleButton,
                        amountType === "USD" && styles.toggleButtonActive,
                      ]}
                      onPress={() => setAmountType("USD")}
                    >
                      <Text
                        style={[
                          styles.toggleText,
                          amountType === "USD" && styles.toggleTextActive,
                        ]}
                      >
                        USD
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={toggleClose}
                  >
                    <Text style={styles.actionButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handlePurchase}
                    disabled={!calculatedTokens}
                  >
                    <Text style={styles.actionButtonText}>Buy</Text>
                  </TouchableOpacity>
                </View>
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
  filterButton: {
    backgroundColor: "#1A231E",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2A3F33",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  filterButtonText: {
    color: "#8FA396",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#0A0F0D",
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    color: "#8FA396",
    fontWeight: "bold",
  },
  resetText: {
    color: "#8FA396",
    fontSize: 16,
    fontWeight: "bold",
  },
  filterSection: {
    marginBottom: 16,
  },
  filterOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#2A3F33",
  },
  filterOptionText: {
    color: "#8FA396",
    fontSize: 16,
  },
  sectionTitle: {
    color: "#8FA396",
    marginVertical: 12,
    fontSize: 16,
    fontWeight: "bold",
  },
  rangeInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  actionButton2: {
    marginTop: 20,
    backgroundColor: "#1A231E",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2A3F33",
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    width: "100%",
  },
  actionButtonText2: {
    color: "#8FA396",
    fontSize: 16,
    fontWeight: "bold",
  },
  actionButton: {
    backgroundColor: "#1A231E",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2A3F33",
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  actionButtonText: {
    color: "#8FA396",
    fontSize: 16,
    fontWeight: "bold",
  },
  inputContainer: {
    marginBottom: 20,
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#2A3F33",
    alignItems: "center",
    marginHorizontal: 5,
  },
  toggleButtonActive: {
    backgroundColor: "#4CAF50",
  },
  toggleText: {
    color: "#8FA396",
    fontSize: 14,
    fontWeight: "600",
  },
  toggleTextActive: {
    color: "#E0E0E0",
  },
  buyButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  buyButtonDisabled: {
    backgroundColor: "#2A3F33",
    opacity: 0.5,
  },
  input: {
    backgroundColor: "#2A3F33",
    borderRadius: 8,
    padding: 12,
    color: "#E0E0E0",
    fontSize: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  buyButtonText: {
    color: "#E0E0E0",
    fontSize: 16,
    fontWeight: "bold",
  },
  estimatedTokens: {
    color: "#8FA396",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 16,
  },
});

export default BuyModal;
