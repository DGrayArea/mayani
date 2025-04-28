import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import useWalletStore from "@/hooks/walletStore";
import * as Clipboard from "expo-clipboard";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const PrivateKeyModal = ({ visible, onClose }: any) => {
  const {
    solWalletAddress,
    ethWalletAddress,
    currentChain,
    privateKey,
    solPrivateKey,
  } = useWalletStore();
  const [copied, setCopied] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  const currentAddress =
    currentChain === "SOL" ? solWalletAddress : ethWalletAddress;

  const copyAddress = async (key) => {
    if (currentAddress) {
      await Clipboard.setStringAsync(key);
      setCopied(true);
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(1500),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => setCopied(false));
    }
  };

  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.substring(0, 8)}...${address.substring(address.length - 8)}`;
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
          <LinearGradient
            colors={["#8C5BE6", "#5A2DA0"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.modalHeader}
          >
            <Text style={styles.modalTitle}>Save Private Keys</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </LinearGradient>

          {currentAddress ? (
            <View style={styles.contentContainer}>
              <Text style={styles.addressLabel}>Your ETH key</Text>

              <View style={styles.addressContainer}>
                <Text style={styles.addressText} numberOfLines={1}>
                  {privateKey}
                </Text>
                <TouchableOpacity
                  onPress={() => copyAddress(privateKey)}
                  style={styles.copyButton}
                >
                  <Ionicons name="copy-outline" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <Text style={styles.addressLabel}>Your SOL key</Text>

              <View style={styles.addressContainer}>
                <Text style={styles.addressText} numberOfLines={1}>
                  {solPrivateKey}
                </Text>
                <TouchableOpacity
                  onPress={() => copyAddress(solPrivateKey)}
                  style={styles.copyButton}
                >
                  <Ionicons name="copy-outline" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <Animated.View
                style={[styles.copiedNotification, { opacity: fadeAnim }]}
              >
                <Text style={styles.copiedText}>Key copied to clipboard!</Text>
              </Animated.View>

              <Text style={styles.infoText}>
                Save your ETH and SOL private key safely. before sending any
                assets to prevent permanent loss.
              </Text>
            </View>
          ) : (
            <View style={styles.errorContainer}>
              <Ionicons name="warning-outline" size={48} color="#FF5252" />
              <Text style={styles.noWalletText}>No wallet generated</Text>
              <Text style={styles.errorDesc}>
                There was a problem loading your wallet. Please try again later.
              </Text>
            </View>
          )}

          <TouchableOpacity onPress={onClose} style={styles.doneButton}>
            <Text style={styles.doneButtonText}>Done</Text>
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
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  modalContent: {
    backgroundColor: "#2E1A40",
    borderRadius: 20,
    width: "90%",
    maxWidth: 350,
    overflow: "hidden",
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
  contentContainer: {
    alignItems: "center",
    padding: 20,
  },
  qrContainer: {
    padding: 15,
    backgroundColor: "#2E1A40",
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(140, 91, 230, 0.3)",
  },
  addressLabel: {
    fontSize: 14,
    color: "#9B86B3",
    marginBottom: 8,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A0E26",
    borderRadius: 12,
    padding: 15,
    width: "100%",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "rgba(140, 91, 230, 0.3)",
  },
  addressText: {
    color: "#FFFFFF",
    flex: 1,
    marginRight: 10,
    fontSize: 16,
  },
  copyButton: {
    backgroundColor: "#8C5BE6",
    padding: 8,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  copiedNotification: {
    backgroundColor: "rgba(61, 213, 152, 0.2)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 15,
  },
  copiedText: {
    color: "#3DD598",
    fontSize: 14,
    fontWeight: "500",
  },
  infoText: {
    color: "#9B86B3",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 20,
  },
  errorContainer: {
    alignItems: "center",
    padding: 30,
  },
  noWalletText: {
    color: "#FF5252",
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
  },
  errorDesc: {
    color: "#9B86B3",
    textAlign: "center",
    marginTop: 10,
  },
  doneButton: {
    backgroundColor: "#8C5BE6",
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 20,
    alignItems: "center",
  },
  doneButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default PrivateKeyModal;
