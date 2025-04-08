import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  StyleSheet,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const ChainSelector = ({ currentChain, switchChain, chainLogos }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(1));

  const chains = [
    { name: "Solana", key: "SOL" },
    { name: "Ethereum", key: "ETH" },
  ];

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.animatedContainer,
          { transform: [{ scale: scaleAnim }] }
        ]}
      >
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          <LinearGradient
            colors={['rgba(140, 91, 230, 0.15)', 'rgba(90, 45, 160, 0.3)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            <View style={styles.iconContainer}>
              <Image source={chainLogos[currentChain]} style={styles.chainLogo} />
            </View>
            <Text style={styles.chainText}>
              {chains.find((c) => c.key === currentChain)?.name}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#9B86B3" />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      <Modal
        animationType="fade"
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
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Blockchain</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.chainsContainer}>
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
                  <View style={[
                    styles.chainIconContainer,
                    currentChain === chain.key && styles.activeChainIconContainer
                  ]}>
                    <Image
                      source={chainLogos[chain.key]}
                      style={styles.chainOptionLogo}
                    />
                  </View>
                  
                  <Text style={[
                    styles.chainOptionText,
                    currentChain === chain.key && styles.activeChainOptionText
                  ]}>
                    {chain.name}
                  </Text>
                  
                  {currentChain === chain.key && (
                    <View style={styles.selectedIndicator}>
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  animatedContainer: {
    borderRadius: 50,
    overflow: "hidden",
  },
  dropdownButton: {
    alignItems: "center",
    borderRadius: 50,
  },
  gradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 50,
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    backgroundColor: "rgba(26, 14, 38, 0.6)",
  },
  chainLogo: {
    width: 18,
    height: 18,
  },
  chainText: {
    color: "#E0E0E0",
    fontSize: 14,
    fontWeight: "600",
    marginRight: 6,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  modalContent: {
    backgroundColor: "#2E1A40",
    borderRadius: 16,
    width: "80%",
    maxWidth: 300,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  modalTitle: {
    color: "#E0E0E0",
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(140, 91, 230, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  chainsContainer: {
    padding: 12,
  },
  chainOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginVertical: 4,
  },
  activeChainOption: {
    backgroundColor: "rgba(140, 91, 230, 0.15)",
  },
  chainIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    backgroundColor: "rgba(26, 14, 38, 0.6)",
  },
  activeChainIconContainer: {
    backgroundColor: "rgba(140, 91, 230, 0.3)",
  },
  chainOptionLogo: {
    width: 24,
    height: 24,
  },
  chainOptionText: {
    color: "#9B86B3",
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
  },
  activeChainOptionText: {
    color: "#E0E0E0",
    fontWeight: "600",
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#8C5BE6",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ChainSelector;
