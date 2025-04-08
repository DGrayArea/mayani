import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import * as web3 from "@solana/web3.js";
import * as ethers from "ethers";
import useWalletStore from "@/hooks/walletStore";
import { config } from "@/lib/appwrite";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const SendModal = ({ visible, onClose }: any) => {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { getSolKeypair, currentChain, getEthWallet } = useWalletStore();

  const isValidSolAddress = (address: string): boolean => {
    try {
      new web3.PublicKey(address);
      return true;
    } catch {
      return false;
    }
  };

  const isValidEthAddress = (address: string): boolean => {
    return ethers.isAddress(address);
  };

  const clearInputs = () => {
    setRecipient("");
    setAmount("");
  };

  const handleClose = () => {
    clearInputs();
    onClose();
  };

  const sendTransaction = async () => {
    try {
      if (!recipient.trim()) {
        Alert.alert("Error", "Please enter recipient address");
        return;
      }
      
      if (!amount.trim() || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        Alert.alert("Error", "Please enter a valid amount");
        return;
      }
      
      const isValidAddress =
        currentChain === "SOL"
          ? isValidSolAddress(recipient)
          : isValidEthAddress(recipient);

      if (!isValidAddress) {
        Alert.alert("Invalid Address", `Please enter a valid ${currentChain} address`);
        return;
      }

      setIsLoading(true);

      if (currentChain === "SOL") {
        const keypair = getSolKeypair();
        if (!keypair) {
          Alert.alert("Error", "Solana wallet not initialized");
          setIsLoading(false);
          return;
        }

        const connection = new web3.Connection(
          web3.clusterApiUrl("devnet"),
          "confirmed"
        );

        const transaction = new web3.Transaction().add(
          web3.SystemProgram.transfer({
            fromPubkey: keypair.publicKey,
            toPubkey: new web3.PublicKey(recipient),
            lamports: web3.LAMPORTS_PER_SOL * parseFloat(amount),
          })
        );

        const signature = await web3.sendAndConfirmTransaction(
          connection,
          transaction,
          [keypair]
        );

        Alert.alert(
          "Transaction Successful", 
          `Your ${currentChain} has been sent!`,
          [{ text: "View Explorer", onPress: () => console.log(`https://explorer.solana.com/tx/${signature}`) },
           { text: "Close", style: "cancel" }]
        );
      } else {
        // Ethereum transaction logic
        const wallet = getEthWallet();
        if (!wallet) {
          Alert.alert("Error", "Ethereum wallet not initialized");
          setIsLoading(false);
          return;
        }

        const provider = new ethers.JsonRpcProvider(
          `https://mainnet.infura.io/v3/${config.infuraId}`
        );
        const connectedWallet = wallet.connect(provider);

        const tx = await connectedWallet.sendTransaction({
          to: recipient,
          value: ethers.parseEther(amount),
        });

        const receipt = await tx.wait();

        Alert.alert(
          "Transaction Successful", 
          `Your ${currentChain} has been sent!`,
          [{ text: "View Explorer", onPress: () => console.log(`https://etherscan.io/tx/${receipt.transactionHash}`) },
           { text: "Close", style: "cancel" }]
        );
      }

      clearInputs();
      onClose();
    } catch (error: any) {
      Alert.alert("Transaction Failed", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotalUSDValue = () => {
    if (!amount || isNaN(parseFloat(amount))) return 0;
    
    // Placeholder prices - in a real app, these would come from an API
    const prices = {
      SOL: 152.43,
      ETH: 2150.75
    };
    
    return (parseFloat(amount) * prices[currentChain]).toFixed(2);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          <LinearGradient
            colors={['#8C5BE6', '#5A2DA0']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.modalHeader}
          >
            <Text style={styles.modalTitle}>Send {currentChain}</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </LinearGradient>

          <ScrollView style={styles.formContainer}>
            <Text style={styles.inputLabel}>Recipient Address</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder={`Enter ${currentChain} address`}
                placeholderTextColor="#9B86B3"
                value={recipient}
                onChangeText={setRecipient}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {recipient.length > 0 && (
                <TouchableOpacity 
                  style={styles.clearButton}
                  onPress={() => setRecipient("")}
                >
                  <Ionicons name="close-circle" size={20} color="#9B86B3" />
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.inputLabel}>Amount</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder={`Amount in ${currentChain}`}
                placeholderTextColor="#9B86B3"
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={setAmount}
              />
              <Text style={styles.currencyIndicator}>{currentChain}</Text>
            </View>
            
            {amount ? (
              <View style={styles.valueContainer}>
                <Text style={styles.valueText}>
                  ~${calculateTotalUSDValue()} USD
                </Text>
              </View>
            ) : null}

            <View style={styles.infoContainer}>
              <Ionicons name="information-circle-outline" size={20} color="#9B86B3" />
              <Text style={styles.infoText}>
                Make sure you're sending to the correct address. Crypto transactions cannot be reversed.
              </Text>
            </View>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={handleClose}
                disabled={isLoading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!amount || !recipient) && styles.disabledButton,
                  isLoading && styles.loadingButton
                ]}
                onPress={sendTransaction}
                disabled={!amount || !recipient || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.sendButtonText}>Send</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  modalContent: {
    backgroundColor: "#2E1A40",
    borderRadius: 20,
    width: "90%",
    maxWidth: 350,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  modalTitle: {
    fontSize: 20,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  formContainer: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: "#9B86B3",
    marginBottom: 8,
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A0E26",
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(140, 91, 230, 0.3)",
    overflow: "hidden",
  },
  input: {
    flex: 1,
    color: "#FFFFFF",
    padding: 15,
    fontSize: 16,
  },
  clearButton: {
    padding: 10,
  },
  currencyIndicator: {
    color: "#9B86B3",
    paddingRight: 15,
    fontSize: 16,
    fontWeight: "500",
  },
  valueContainer: {
    backgroundColor: "rgba(140, 91, 230, 0.1)",
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    alignItems: "center",
  },
  valueText: {
    color: "#9B86B3",
    fontSize: 14,
  },
  infoContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(26, 14, 38, 0.7)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(140, 91, 230, 0.1)",
  },
  infoText: {
    flex: 1,
    color: "#9B86B3",
    fontSize: 13,
    marginLeft: 10,
    lineHeight: 18,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelButton: {
    backgroundColor: "rgba(140, 91, 230, 0.1)",
    padding: 16,
    borderRadius: 12,
    flex: 0.48,
    alignItems: "center",
  },
  sendButton: {
    backgroundColor: "#8C5BE6",
    padding: 16,
    borderRadius: 12,
    flex: 0.48,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "rgba(140, 91, 230, 0.5)",
  },
  loadingButton: {
    backgroundColor: "#5A2DA0",
  },
  cancelButtonText: {
    color: "#9B86B3",
    fontWeight: "bold",
    fontSize: 16,
  },
  sendButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default SendModal;
