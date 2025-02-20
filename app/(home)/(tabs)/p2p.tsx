import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const P2P = () => {
  const [animation] = useState(new Animated.Value(0));
  const [activeTab, setActiveTab] = useState("browse"); // 'browse' or 'myAds'
  const [showPostModal, setShowPostModal] = useState(false);
  const [newAd, setNewAd] = useState({
    type: "buy",
    crypto: "",
    price: "",
    amount: "",
    payment: "",
  });

  // Initial state with example orders
  const [p2pOrders, setP2pOrders] = useState([
    {
      id: "1",
      type: "buy",
      crypto: "ETH",
      price: 3240.0,
      amount: 0.5,
      payment: "Bank Transfer",
      user: "trader123",
      rating: "98%",
      isAd: true,
    },
    {
      id: "2",
      type: "sell",
      crypto: "SOL",
      price: 125.0,
      amount: 10,
      payment: "PayPal",
      user: "cryptoking",
      rating: "95%",
      isAd: false,
    },
    {
      id: "3",
      type: "buy",
      crypto: "BTC",
      price: 52000.0,
      amount: 0.25,
      payment: "Revolut",
      user: "btcfan",
      rating: "99%",
      isAd: true,
    },
    {
      id: "4",
      type: "sell",
      crypto: "USDT",
      price: 1.0,
      amount: 500,
      payment: "Wise",
      user: "stablecoin_lover",
      rating: "97%",
      isAd: true,
    },
    {
      id: "5",
      type: "sell",
      crypto: "ADA",
      price: 0.45,
      amount: 1000,
      payment: "Bank Transfer",
      user: "cardano_bull",
      rating: "96%",
      isAd: false,
    },
    {
      id: "6",
      type: "buy",
      crypto: "DOT",
      price: 7.25,
      amount: 50,
      payment: "Revolut",
      user: "polkadot_fan",
      rating: "93%",
      isAd: true,
    },
  ]);

  // Filter for my ads - in a real app, this would check against the logged-in user
  const myAds = p2pOrders.filter(order => order.isAd);
  
  const renderP2POrder = ({ item }) => (
    <View style={[styles.p2pOrder, item.isAd && styles.adHighlight]}>
      <View style={styles.p2pHeader}>
        <Text
          style={[
            styles.p2pType,
            item.type === "buy" ? styles.buyType : styles.sellType,
          ]}
        >
          {item.type.toUpperCase()}
        </Text>
        <Text style={styles.p2pCrypto}>{item.crypto}</Text>
        {item.isAd && <Text style={styles.adBadge}>AD</Text>}
      </View>

      <View style={styles.p2pDetails}>
        <View style={styles.p2pInfo}>
          <Text style={styles.p2pLabel}>Price:</Text>
          <Text style={styles.p2pValue}>${typeof item.price === 'string' ? parseFloat(item.price).toFixed(2) : item.price.toFixed(2)}</Text>
        </View>
        <View style={styles.p2pInfo}>
          <Text style={styles.p2pLabel}>Amount:</Text>
          <Text style={styles.p2pValue}>
            {item.amount} {item.crypto}
          </Text>
        </View>
        <View style={styles.p2pInfo}>
          <Text style={styles.p2pLabel}>Payment:</Text>
          <Text style={styles.p2pValue}>{item.payment}</Text>
        </View>
      </View>

      <View style={styles.p2pUser}>
        <Text style={styles.userName}>{item.user}</Text>
        <Text style={styles.userRating}>Rating: {item.rating}</Text>
      </View>

      {activeTab === "myAds" && (
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton}>
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const handlePostAd = () => {
    // Validate input (basic validation)
    if (!newAd.crypto || !newAd.price || !newAd.amount || !newAd.payment) {
      // In a real app, show an error message
      return;
    }

    // Create new ad with a unique ID
    const newAdObject = {
      ...newAd,
      id: Date.now().toString(),
      user: "currentUser", // In a real app, get from auth
      rating: "New",
      isAd: true,
      price: parseFloat(newAd.price),
      amount: parseFloat(newAd.amount),
    };

    // Add to orders
    setP2pOrders([newAdObject, ...p2pOrders]);
    
    // Reset form and close modal
    setNewAd({
      type: "buy",
      crypto: "",
      price: "",
      amount: "",
      payment: "",
    });
    setShowPostModal(false);
    
    // Switch to My Ads tab
    setActiveTab("myAds");
  };

  const renderTabContent = () => {
    const dataToShow = activeTab === "browse" ? p2pOrders : myAds;
    
    return (
      <FlatList
        data={dataToShow}
        renderItem={renderP2POrder}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.p2pContent}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Text style={styles.p2pTitle}>
              {activeTab === "browse" ? "Available Orders" : "My Posted Ads"}
            </Text>
            {activeTab === "myAds" && myAds.length === 0 && (
              <Text style={styles.emptyStateText}>
                You haven't posted any ads yet. Create your first ad to start trading!
              </Text>
            )}
          </View>
        }
        ListEmptyComponent={
          activeTab === "browse" && (
            <Text style={styles.emptyStateText}>
              No orders available at the moment. Check back later or post your own ad!
            </Text>
          )
        }
      />
    );
  };

  // Modal for posting new ads
  const renderPostModal = () => (
    <Modal
      visible={showPostModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowPostModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Post New Ad</Text>
          
          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                newAd.type === "buy" && styles.selectedTypeButton
              ]}
              onPress={() => setNewAd({...newAd, type: "buy"})}
            >
              <Text style={[
                styles.typeButtonText,
                newAd.type === "buy" && styles.selectedTypeText
              ]}>BUY</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeButton,
                newAd.type === "sell" && styles.selectedTypeButton
              ]}
              onPress={() => setNewAd({...newAd, type: "sell"})}
            >
              <Text style={[
                styles.typeButtonText,
                newAd.type === "sell" && styles.selectedTypeText
              ]}>SELL</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Cryptocurrency</Text>
            <TextInput
              style={styles.input}
              placeholder="BTC, ETH, SOL, etc."
              placeholderTextColor="#666"
              value={newAd.crypto}
              onChangeText={(text) => setNewAd({...newAd, crypto: text})}
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Price (USD)</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor="#666"
              keyboardType="decimal-pad"
              value={newAd.price}
              onChangeText={(text) => setNewAd({...newAd, price: text})}
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Amount</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor="#666"
              keyboardType="decimal-pad"
              value={newAd.amount}
              onChangeText={(text) => setNewAd({...newAd, amount: text})}
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Payment Method</Text>
            <TextInput
              style={styles.input}
              placeholder="Bank Transfer, PayPal, etc."
              placeholderTextColor="#666"
              value={newAd.payment}
              onChangeText={(text) => setNewAd({...newAd, payment: text})}
            />
          </View>
          
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowPostModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.postButton}
              onPress={handlePostAd}
            >
              <Text style={styles.postButtonText}>Post Ad</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "browse" && styles.activeTab]}
          onPress={() => setActiveTab("browse")}
        >
          <Text style={[styles.tabText, activeTab === "browse" && styles.activeTabText]}>
            Browse
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "myAds" && styles.activeTab]}
          onPress={() => setActiveTab("myAds")}
        >
          <Text style={[styles.tabText, activeTab === "myAds" && styles.activeTabText]}>
            My Ads
          </Text>
        </TouchableOpacity>
      </View>

      {renderTabContent()}
      
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => setShowPostModal(true)}
      >
        <Text style={styles.floatingButtonText}>+</Text>
      </TouchableOpacity>
      
      {renderPostModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0F0D",
  },
  tabBar: {
    flexDirection: "row",
    marginBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#2A3F33",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#4CAF50",
  },
  tabText: {
    color: "#8FA396",
    fontSize: 16,
    fontWeight: "500",
  },
  activeTabText: {
    color: "#8FA396",
    fontWeight: "700",
  },
  p2pContent: {
    paddingHorizontal: 16,
    paddingBottom: 80, // Space for floating button
  },
  listHeader: {
    marginBottom: 16,
  },
  p2pTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#8FA396",
  },
  p2pOrder: {
    borderWidth: 1,
    borderColor: "#2A3F33",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    backgroundColor: "#1A231E",
  },
  adHighlight: {
    borderColor: "#3A5F43",
    borderWidth: 2,
  },
  p2pHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  p2pType: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
    fontSize: 12,
    fontWeight: "bold",
  },
  buyType: {
    backgroundColor: "#E8F5E9",
    color: "#4CAF50",
  },
  sellType: {
    backgroundColor: "#FFEBEE",
    color: "#F44336",
  },
  adBadge: {
    marginLeft: "auto",
    backgroundColor: "#3A5F43",
    color: "#E8F5E9",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 10,
    fontWeight: "bold",
  },
  p2pCrypto: {
    fontSize: 16,
    fontWeight: "600",
    color: "#8FA396",
  },
  p2pDetails: {
    marginBottom: 12,
  },
  p2pInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  p2pLabel: {
    color: "#666",
    fontSize: 14,
  },
  p2pValue: {
    color: "#8FA396",
    fontWeight: "500",
    fontSize: 14,
  },
  p2pUser: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#2A3F33",
  },
  userName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8FA396",
  },
  userRating: {
    fontSize: 14,
    color: "#666",
  },
  floatingButton: {
    position: "absolute",
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  floatingButtonText: {
    fontSize: 24,
    color: "white",
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 24,
  },
  modalContent: {
    width: "100%",
    backgroundColor: "#1A231E",
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: "#2A3F33",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#8FA396",
    marginBottom: 24,
    textAlign: "center",
  },
  typeSelector: {
    flexDirection: "row",
    marginBottom: 24,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2A3F33",
  },
  selectedTypeButton: {
    backgroundColor: "#2A3F33",
  },
  typeButtonText: {
    color: "#8FA396",
    fontWeight: "bold",
  },
  selectedTypeText: {
    color: "#E8F5E9",
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    color: "#8FA396",
    marginBottom: 8,
    fontSize: 14,
  },
  input: {
    backgroundColor: "#0A0F0D",
    borderWidth: 1,
    borderColor: "#2A3F33",
    borderRadius: 8,
    padding: 12,
    color: "#8FA396",
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: "row",
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: "#2A3F33",
    borderRadius: 8,
    alignItems: "center",
    marginRight: 8,
  },
  cancelButtonText: {
    color: "#8FA396",
  },
  postButton: {
    flex: 1,
    padding: 12,
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    alignItems: "center",
    marginLeft: 8,
  },
  postButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  actionButtons: {
    flexDirection: "row",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#2A3F33",
  },
  editButton: {
    flex: 1,
    padding: 8,
    backgroundColor: "#2196F3",
    borderRadius: 4,
    alignItems: "center",
    marginRight: 6,
  },
  editButtonText: {
    color: "white",
    fontWeight: "500",
  },
  deleteButton: {
    flex: 1,
    padding: 8,
    backgroundColor: "#F44336",
    borderRadius: 4,
    alignItems: "center",
    marginLeft: 6,
  },
  deleteButtonText: {
    color: "white",
    fontWeight: "500",
  },
  emptyStateText: {
    color: "#666",
    textAlign: "center",
    marginVertical: 20,
    fontStyle: "italic",
  },
});

export default P2P;