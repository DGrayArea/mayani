import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import * as web3 from "@solana/web3.js";
import useWalletStore from "@/hooks/walletStore";

const SendModal = ({ visible, onClose }: any) => {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const { getKeypair } = useWalletStore();

  const sendTransaction = async () => {
    try {
      // Validate inputs
      if (!recipient || !amount) {
        Alert.alert("Error", "Please enter recipient and amount");
        return;
      }

      const keypair = getKeypair();
      if (!keypair) {
        Alert.alert("Error", "Wallet not initialized");
        return;
      }

      // Connect to Solana network (using devnet for testing)
      const connection = new web3.Connection(
        web3.clusterApiUrl("devnet"),
        "confirmed"
      );

      // Create transaction
      const transaction = new web3.Transaction().add(
        web3.SystemProgram.transfer({
          fromPubkey: keypair.publicKey,
          toPubkey: new web3.PublicKey(recipient),
          lamports: web3.LAMPORTS_PER_SOL * parseFloat(amount),
        })
      );

      // Sign and send transaction
      const signature = await web3.sendAndConfirmTransaction(
        connection,
        transaction,
        [keypair]
      );

      Alert.alert("Success", `Transaction sent! Signature: ${signature}`);
      onClose();
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Send SOL</Text>

          <TextInput
            style={styles.input}
            placeholder="Recipient Address"
            placeholderTextColor="#666"
            value={recipient}
            onChangeText={setRecipient}
          />

          <TextInput
            style={styles.input}
            placeholder="Amount (SOL)"
            placeholderTextColor="#666"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sendButton}
              onPress={sendTransaction}
            >
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#1A231E",
    borderRadius: 20,
    padding: 20,
    width: "85%",
  },
  modalTitle: {
    fontSize: 20,
    color: "#8FA396",
    marginBottom: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  input: {
    backgroundColor: "#2A3F33",
    color: "#8FA396",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelButton: {
    backgroundColor: "#2A3F33",
    padding: 15,
    borderRadius: 10,
    flex: 0.45,
    alignItems: "center",
  },
  sendButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 10,
    flex: 0.45,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#8FA396",
    fontWeight: "bold",
  },
  sendButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default SendModal;
