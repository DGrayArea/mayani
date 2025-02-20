import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  Modal, 
  SafeAreaView,
  StyleSheet,
  Dimensions,
  Platform,
  StatusBar
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;

const P2P = () => {
  const [activeTab, setActiveTab] = useState("browse");
  const [showPostModal, setShowPostModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState("All");
  const [selectedPayment, setSelectedPayment] = useState("All");
  
  const [newAd, setNewAd] = useState({
    type: "buy",
    crypto: "",
    price: "",
    amount: "",
    payment: "",
  });

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
      completedTrades: 156,
      available: true,
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
      completedTrades: 89,
      available: true,
      isAd: false,
    },
  ]);

  const cryptoOptions = ["All", "BTC", "ETH", "SOL", "USDT"];
  const paymentOptions = ["All", "Bank Transfer", "PayPal", "Credit Card", "Cash"];

  const filteredOrders = p2pOrders.filter(order => {
    if (selectedCrypto !== "All" && order.crypto !== selectedCrypto) return false;
    if (selectedPayment !== "All" && order.payment !== selectedPayment) return false;
    return true;
  });

  const myAds = p2pOrders.filter(order => order.isAd);

  const handlePostAd = () => {
    if (!newAd.crypto || !newAd.price || !newAd.amount || !newAd.payment) {
      // Add validation feedback here
      return;
    }

    const newAdObject = {
      ...newAd,
      id: Date.now().toString(),
      user: "currentUser",
      rating: "New",
      completedTrades: 0,
      available: true,
      isAd: true,
      price: parseFloat(newAd.price),
      amount: parseFloat(newAd.amount),
    };

    setP2pOrders([newAdObject, ...p2pOrders]);
    setNewAd({
      type: "buy",
      crypto: "",
      price: "",
      amount: "",
      payment: "",
    });
    setShowPostModal(false);
    setActiveTab("myAds");
  };

  const FilterButton = ({ title, isSelected, onPress }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        isSelected && styles.filterButtonSelected
      ]}
      onPress={onPress}
    >
      <Text style={[
        styles.filterButtonText,
        isSelected && styles.filterButtonTextSelected
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const P2POrder = ({ item }) => (
    <View style={[styles.orderCard, item.isAd && styles.adCard]}>
      <View style={styles.orderHeader}>
        <View style={[
          styles.orderTypeBadge,
          { backgroundColor: item.type === "buy" ? styles.colors.buyLight : styles.colors.sellLight }
        ]}>
          <Text style={[
            styles.orderTypeText,
            { color: item.type === "buy" ? styles.colors.buyDark : styles.colors.sellDark }
          ]}>
            {item.type.toUpperCase()}
          </Text>
        </View>
        
        <Text style={styles.cryptoText}>{item.crypto}</Text>
        
        {item.isAd && (
          <View style={styles.adBadge}>
            <Text style={styles.adBadgeText}>AD</Text>
          </View>
        )}
      </View>

      <View style={styles.orderDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Price:</Text>
          <Text style={styles.detailValue}>${item.price.toFixed(2)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Amount:</Text>
          <Text style={styles.detailValue}>{item.amount} {item.crypto}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Payment:</Text>
          <Text style={styles.detailValue}>{item.payment}</Text>
        </View>
      </View>

      <View style={styles.userInfo}>
        <View>
          <Text style={styles.username}>{item.user}</Text>
          <Text style={styles.trades}>{item.completedTrades} trades</Text>
        </View>
        <Text style={styles.rating}>Rating: {item.rating}</Text>
      </View>

      {activeTab === "myAds" && (
        <View style={styles.adControls}>
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.buttonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton}>
            <Text style={styles.buttonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const PostAdModal = () => (
    <Modal
      visible={showPostModal}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Post New Ad</Text>

          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                newAd.type === "buy" && styles.typeButtonSelected
              ]}
              onPress={() => setNewAd({ ...newAd, type: "buy" })}
            >
              <Text style={[
                styles.typeButtonText,
                newAd.type === "buy" && styles.typeButtonTextSelected
              ]}>
                BUY
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.typeButton,
                newAd.type === "sell" && styles.typeButtonSelected
              ]}
              onPress={() => setNewAd({ ...newAd, type: "sell" })}
            >
              <Text style={[
                styles.typeButtonText,
                newAd.type === "sell" && styles.typeButtonTextSelected
              ]}>
                SELL
              </Text>
            </TouchableOpacity>
          </View>

          <FormInput
            label="Cryptocurrency"
            placeholder="BTC, ETH, SOL, etc."
            value={newAd.crypto}
            onChangeText={(text) => setNewAd({ ...newAd, crypto: text })}
          />

          <FormInput
            label="Price (USD)"
            placeholder="0.00"
            keyboardType="decimal-pad"
            value={newAd.price}
            onChangeText={(text) => setNewAd({ ...newAd, price: text })}
          />

          <FormInput
            label="Amount"
            placeholder="0.00"
            keyboardType="decimal-pad"
            value={newAd.amount}
            onChangeText={(text) => setNewAd({ ...newAd, amount: text })}
          />

          <FormInput
            label="Payment Method"
            placeholder="Bank Transfer, PayPal, etc."
            value={newAd.payment}
            onChangeText={(text) => setNewAd({ ...newAd, payment: text })}
          />

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

  const FormInput = ({ label, ...props }) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholderTextColor={styles.colors.placeholderText}
        {...props}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.content}>
        <View style={styles.tabs}>
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

        <View style={styles.header}>
          <Text style={styles.title}>
            {activeTab === "browse" ? "Available Orders" : "My Posted Ads"}
          </Text>
          
          {activeTab === "browse" && (
            <TouchableOpacity
              style={styles.filterToggle}
              onPress={() => setShowFilters(!showFilters)}
            >
              <Text style={styles.filterToggleText}>
                {showFilters ? "Hide Filters" : "Show Filters"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {showFilters && activeTab === "browse" && (
          <View style={styles.filters}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>Crypto:</Text>
                {cryptoOptions.map((crypto) => (
                  <FilterButton
                    key={crypto}
                    title={crypto}
                    isSelected={selectedCrypto === crypto}
                    onPress={() => setSelectedCrypto(crypto)}
                  />
                ))}
              </View>
              
              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>Payment:</Text>
                {paymentOptions.map((payment) => (
                  <FilterButton
                    key={payment}
                    title={payment}
                    isSelected={selectedPayment === payment}
                    onPress={() => setSelectedPayment(payment)}
                  />
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        <ScrollView style={styles.orderList}>
          {(activeTab === "browse" ? filteredOrders : myAds).map((order) => (
            <P2POrder key={order.id} item={order} />
          ))}
        </ScrollView>

        <TouchableOpacity
          onPress={() => setShowPostModal(true)}
          style={styles.fab}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>

        <PostAdModal />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  colors: {
    background: "#0A0F0D",
    surface: "#1A231E",
    border: "#2A3F33",
    accent: "#4CAF50",
    text: "#8FA396",
    subtext: "#666666",
    buyLight: "#E8F5E9",
    buyDark: "#4CAF50",
    sellLight: "#FFEBEE",
    sellDark: "#F44336",
    placeholderText: "#666666"
  },
  
  container: {
    flex: 1,
    backgroundColor: "#0A0F0D",
  },
  
  content: {
    flex: 1,
    maxWidth: 600,
    alignSelf: "center",
    width: "100%",
    padding: 16,
  },

  tabs: {
    flexDirection: "row",
    marginBottom: 16,
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
    fontWeight: "700",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#8FA396",
  },

  filterToggle: {
    padding: 8,
  },
  
  filterToggleText: {
    color: "#4CAF50",
    fontWeight: "600",
  },

  filters: {
    marginBottom: 16,
  },
  
  filterGroup: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  
  filterLabel: {
    color: "#8FA396",
    marginRight: 8,
  },
  
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#1A231E",
    marginRight: 8,
  },
  
  filterButtonSelected: {
    backgroundColor: "#4CAF50",
  },
  
  filterButtonText: {
    color: "#8FA396",
    fontSize: 14,
  },
  
  filterButtonTextSelected: {
    color: "white",
  },

  orderList: {
    flex: 1,
  },

  orderCard: {
    backgroundColor: "#1A231E",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#2A3F33",
  },
  
  adCard: {
    borderWidth: 2,
    borderColor: "#3A5F43",
  },

  orderHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  orderTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },

  orderTypeText: {
    fontSize: 12,
    fontWeight: "bold",
  },

  cryptoText: {
    color: "#8FA396",
    fontWeight: "600",
  },

  adBadge: {
    marginLeft: "auto",
    backgroundColor: "#3A5F43",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },

  adBadgeText: {
    color: "#E8F5E9",
    fontSize: 10,
    fontWeight: "bold",
  },

  orderDetails: {
    marginBottom: 12,
  },

  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  detailLabel: {
    color: "#666666",
  },

  detailValue: {
    color: "#8FA396",
  },

  userInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#2A3F33",
  },

  username: {
    color: "#8FA396",
    fontWeight: "600",
  },

  trades: {
    color: "#666666",
    fontSize: 12,
    marginTop: 2,
  },

  rating: {
    color: "#666666",
  },

  adControls: {
    flexDirection: "row",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#2A3F33",
  },

  editButton: {
    flex: 1,
    backgroundColor: "#2196F3",
    padding: 8,
    borderRadius: 4,
    alignItems: "center",
    marginRight: 6,
  },

  deleteButton: {
    flex: 1,
    backgroundColor: "#F44336",
    padding: 8,
    borderRadius: 4,
    alignItems: "center",
    marginLeft: 6,
  },

  buttonText: {
    color: "white",
    fontWeight: "500",
  },

  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
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

  fabText: {
    fontSize: 24,
    color: "white",
    fontWeight: "bold",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  modalContent: {
    width: "100%",
    maxWidth: 400,
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

  typeButtonSelected: {
    backgroundColor: "#2A3F33",
  },

  typeButtonText: {
    color: "#8FA396",
    fontWeight: "bold",
  },

  typeButtonTextSelected: {
    color: "#E8F5E9",
  },

  inputContainer: {
    marginBottom: 16,
  },

  inputLabel: {
    color: "#8FA396",
    marginBottom: 8,
  },

  input: {
    backgroundColor: "#0A0F0D",
    borderWidth: 1,
    borderColor: "#2A3F33",
    borderRadius: 8,
    padding: 12,
    color: "#8FA396",
  },

  modalButtons: {
    flexDirection: "row",
    marginTop: 8,
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
});

export default P2P;