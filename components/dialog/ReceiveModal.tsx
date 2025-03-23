import React, { useState } from "react";
import { View, Text, Modal, StyleSheet, TouchableOpacity } from "react-native";
import QRCode from "react-native-qrcode-svg";
import useWalletStore from "@/hooks/walletStore";
import * as Clipboard from "expo-clipboard";

const ReceiveModal = ({ visible, onClose }: any) => {
  const { solWalletAddress, ethWalletAddress, currentChain } = useWalletStore();
  const [copied, setCopied] = useState(false);

  const currentAddress =
    currentChain === "SOL" ? solWalletAddress : ethWalletAddress;

  const copyAddress = async () => {
    if (currentAddress) {
      await Clipboard.setStringAsync(currentAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
          <Text style={styles.modalTitle}>Receive {currentChain}</Text>

          {currentAddress ? (
            <View className="flex w-full justify-center items-center">
              <QRCode
                value={currentAddress}
                size={250}
                backgroundColor="#2E1A40"
                color="#9B86B3"
              />
              <View style={styles.addressContainer}>
                <Text style={styles.addressText} numberOfLines={1}>
                  {currentAddress}
                </Text>
                <TouchableOpacity
                  onPress={copyAddress}
                  style={styles.copyButton}
                >
                  <Text style={styles.copyButtonText}>
                    {copied ? "Copied!" : "Copy"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <Text style={styles.noWalletText}>No wallet generated</Text>
          )}

          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // Styles remain the same as in your original component
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#2E1A40",
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
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    backgroundColor: "#5A2DA0",
    borderRadius: 10,
    padding: 10,
  },
  addressText: {
    color: "#9B86B3",
    flex: 1,
    marginRight: 10,
  },
  copyButton: {
    backgroundColor: "#8C5BE6",
    padding: 5,
    borderRadius: 5,
  },
  copyButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: "#5A2DA0",
    padding: 10,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  closeButtonText: {
    color: "#8FA396",
    fontWeight: "bold",
  },
  noWalletText: {
    color: "#F44336",
    marginVertical: 20,
  },
});

export default ReceiveModal;
