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
import * as ethers from "ethers";
import useWalletStore from "@/hooks/walletStore";
import { config } from "@/lib/appwrite";

const SendModal = ({ visible, onClose }: any) => {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const { getKeypair, currentChain, getEthWallet } = useWalletStore();

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

  const sendTransaction = async () => {
    try {
      if (!recipient || !amount) {
        Alert.alert("Error", "Please enter recipient and amount");
        return;
      }
      const isValidAddress =
        currentChain === "SOL"
          ? isValidSolAddress(recipient)
          : isValidEthAddress(recipient);

      if (!isValidAddress) {
        Alert.alert("Error", `Invalid ${currentChain} address`);
        return;
      }

      if (currentChain === "SOL") {
        const keypair = getKeypair();
        if (!keypair) {
          Alert.alert("Error", "Solana wallet not initialized");
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

        Alert.alert("Success", `SOL Transaction sent! Signature: ${signature}`);
      } else {
        // Ethereum transaction logic
        const wallet = getEthWallet();
        if (!wallet) {
          Alert.alert("Error", "Ethereum wallet not initialized");
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
          "Success",
          `ETH Transaction sent! Hash: ${receipt.transactionHash}`
        );
      }

      onClose();
    } catch (error: any) {
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
          <Text style={styles.modalTitle}>Send {currentChain}</Text>

          <TextInput
            style={styles.input}
            placeholder={`Recipient ${currentChain} Address`}
            placeholderTextColor="#666"
            value={recipient}
            onChangeText={setRecipient}
          />

          <TextInput
            style={styles.input}
            placeholder={`Amount (${currentChain})`}
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
