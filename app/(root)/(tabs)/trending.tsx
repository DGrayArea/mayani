import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Modal,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";

const Trending = () => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [newToken, setNewToken] = useState({
    name: "",
    symbol: "",
    price: "",
    marketCap: "",
    description: "",
    website: "",
    contractAddress: "",
  });

  // Sample existing listings
  const [trendingTokens, setTrendingTokens] = useState([
    {
      id: "1",
      name: "Metaverse Token",
      symbol: "MVT",
      price: "$0.0543",
      marketCap: "$2.1M",
      change: "+15.4%",
      avatar: "/api/placeholder/40/40",
      description: "Leading metaverse gaming token",
      isSpotlight: true,
    },
    {
      id: "2",
      name: "DeFi Protocol",
      symbol: "DFP",
      price: "$1.23",
      marketCap: "$45M",
      change: "+5.2%",
      avatar: "/api/placeholder/40/40",
      description: "Decentralized finance protocol",
      isSpotlight: false,
    },
  ]);

  const handleSubmitToken = () => {
    // Validation
    if (!newToken.name || !newToken.symbol || !newToken.price || !newToken.contractAddress) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    // Add new token to the list
    const newTokenEntry = {
      id: String(trendingTokens.length + 1),
      name: newToken.name,
      symbol: newToken.symbol,
      price: `$${newToken.price}`,
      marketCap: `$${newToken.marketCap}`,
      change: "+0%",
      avatar: "/api/placeholder/40/40",
      description: newToken.description,
      isSpotlight: false,
    };

    setTrendingTokens([newTokenEntry, ...trendingTokens]);
    setModalVisible(false);
    setNewToken({
      name: "",
      symbol: "",
      price: "",
      marketCap: "",
      description: "",
      website: "",
      contractAddress: "",
    });
  };

  const renderTokenItem = ({ item }) => (
    <View style={[styles.tokenCard, item.isSpotlight && styles.spotlightCard]}>
      {item.isSpotlight && (
        <View style={styles.spotlightBadge}>
          <Text style={styles.spotlightText}>Spotlight</Text>
        </View>
      )}
      
      <View style={styles.tokenHeader}>
        <Image source={{ uri: item.avatar }} style={styles.tokenImage} />
        <View style={styles.tokenInfo}>
          <Text style={styles.tokenName}>{item.name}</Text>
          <Text style={styles.tokenSymbol}>{item.symbol}</Text>
        </View>
        <View style={styles.priceInfo}>
          <Text style={styles.tokenPrice}>{item.price}</Text>
          <Text style={[styles.changeText, 
            item.change.includes("+") ? styles.positiveChange : styles.negativeChange]}>
            {item.change}
          </Text>
        </View>
      </View>
      
      <View style={styles.tokenDetails}>
        <Text style={styles.marketCap}>Market Cap: {item.marketCap}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Trending Tokens</Text>
        <TouchableOpacity
          style={styles.listButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.listButtonText}>List Your Token</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={trendingTokens}
        renderItem={renderTokenItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>List Your Token</Text>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <TextInput
                style={styles.input}
                placeholder="Token Name *"
                placeholderTextColor="#666"
                value={newToken.name}
                onChangeText={(text) => setNewToken({...newToken, name: text})}
              />
              
              <TextInput
                style={styles.input}
                placeholder="Token Symbol *"
                placeholderTextColor="#666"
                value={newToken.symbol}
                onChangeText={(text) => setNewToken({...newToken, symbol: text})}
              />
              
              <TextInput
                style={styles.input}
                placeholder="Price (USD) *"
                placeholderTextColor="#666"
                keyboardType="decimal-pad"
                value={newToken.price}
                onChangeText={(text) => setNewToken({...newToken, price: text})}
              />
              
              <TextInput
                style={styles.input}
                placeholder="Market Cap (USD)"
                placeholderTextColor="#666"
                keyboardType="decimal-pad"
                value={newToken.marketCap}
                onChangeText={(text) => setNewToken({...newToken, marketCap: text})}
              />
              
              <TextInput
                style={[styles.input, styles.multilineInput]}
                placeholder="Description"
                placeholderTextColor="#666"
                multiline
                value={newToken.description}
                onChangeText={(text) => setNewToken({...newToken, description: text})}
              />
              
              <TextInput
                style={styles.input}
                placeholder="Website"
                placeholderTextColor="#666"
                value={newToken.website}
                onChangeText={(text) => setNewToken({...newToken, website: text})}
              />
              
              <TextInput
                style={styles.input}
                placeholder="Contract Address *"
                placeholderTextColor="#666"
                value={newToken.contractAddress}
                onChangeText={(text) => setNewToken({...newToken, contractAddress: text})}
              />
              
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.modalButton, styles.submitButton]}
                  onPress={handleSubmitToken}
                >
                  <Text style={styles.submitButtonText}>Submit</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  listButton: {
    backgroundColor: "#2196F3",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  listButtonText: {
    color: "white",
    fontWeight: "600",
  },
  listContainer: {
    paddingBottom: 20,
  },
  tokenCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  spotlightCard: {
    backgroundColor: "#FFF9C4",
    borderWidth: 1,
    borderColor: "#FFC107",
  },
  spotlightBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#FFC107",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  spotlightText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  tokenHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  tokenImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  tokenInfo: {
    flex: 1,
  },
  tokenName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  tokenSymbol: {
    fontSize: 14,
    color: "#666",
  },
  priceInfo: {
    alignItems: "flex-end",
  },
  tokenPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  changeText: {
    fontSize: 14,
    fontWeight: "500",
  },
  positiveChange: {
    color: "#4CAF50",
  },
  negativeChange: {
    color: "#F44336",
  },
  tokenDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  marketCap: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: "#444",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    padding: 16,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: "top",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: "#f5f5f5",
  },
  submitButton: {
    backgroundColor: "#2196F3",
  },
  cancelButtonText: {
    color: "#666",
    textAlign: "center",
    fontWeight: "600",
  },
  submitButtonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "600",
  },
});

export default Trending;