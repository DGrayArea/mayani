import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  StyleSheet,
} from "react-native";

const ChainSelector = ({ currentChain, switchChain, chainLogos }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const chains = [
    { name: "Solana", key: "SOL" },
    { name: "Ethereum", key: "ETH" },
  ];

  return (
    <View>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setModalVisible(true)}
      >
        <Image source={chainLogos[currentChain]} style={styles.chainLogo} />
        <Text style={styles.chainText}>
          {chains.find((c) => c.key === currentChain)?.name}
        </Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            {chains.map((chain) => (
              <TouchableOpacity
                key={chain.key}
                style={[
                  styles.chainOption,
                  currentChain === chain.key && styles.activeChainOption,
                ]}
                onPress={() => {
                  switchChain(chain.key);
                  setModalVisible(false);
                }}
              >
                <Image
                  source={chainLogos[chain.key]}
                  style={styles.chainLogo}
                />
                <Text style={styles.chainText}>{chain.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A231E",
    borderRadius: 10,
    padding: 10,
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#1A231E",
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 20,
  },
  chainOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
  },
  activeChainOption: {
    backgroundColor: "#2A3F33",
  },
  chainLogo: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  chainText: {
    color: "#8FA396",
    fontSize: 16,
  },
});

export default ChainSelector;
