import React, { useState } from "react";
import { View, Text, Modal, StyleSheet, TouchableOpacity } from "react-native";
import QRCode from "react-native-qrcode-svg";
import useWalletStore from "@/hooks/walletStore";
import * as Clipboard from "expo-clipboard";

const ReceiveModal = ({ visible, onClose }: any) => {
  const { walletAddress } = useWalletStore();
  const [copied, setCopied] = useState(false);

  const copyAddress = async () => {
    if (walletAddress) {
      await Clipboard.setStringAsync(walletAddress);
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
          <Text style={styles.modalTitle}>Receive SOL</Text>

          {walletAddress ? (
            <View className="flex w-full justify-center items-center">
              <QRCode
                value={walletAddress}
                size={250}
                backgroundColor="#1A231E"
                color="#8FA396"
              />

              <View style={styles.addressContainer}>
                <Text style={styles.addressText} numberOfLines={1}>
                  {walletAddress}
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
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    backgroundColor: "#2A3F33",
    borderRadius: 10,
    padding: 10,
  },
  addressText: {
    color: "#8FA396",
    flex: 1,
    marginRight: 10,
  },
  copyButton: {
    backgroundColor: "#4CAF50",
    padding: 5,
    borderRadius: 5,
  },
  copyButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: "#2A3F33",
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
