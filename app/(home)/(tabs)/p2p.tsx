// @ts-nocheck
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Modal,
  SafeAreaView,
  StyleSheet,
  Dimensions,
  Platform,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import images from "@/constants/images";
import useWalletStore from "@/hooks/walletStore";

const SCREEN_WIDTH = Dimensions.get("window").width;

const Presale = () => {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [selected, setSelected] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Create presale form states
  const [formData, setFormData] = useState({
    name: "",
    symbol: "",
    description: "",
    price: "",
    saleStart: "",
    saleEnd: "",
    hardCap: "",
    softCap: ""
  });
  
  const { currentChain } = useWalletStore();

  const upcomingProjects = [
    {
      id: "1",
      name: "AI Oracle Network",
      symbol: "AION",
      image: "https://via.placeholder.com/64",
      description: "Decentralized AI-powered oracle solution for smart contracts",
      price: 0.025,
      startDate: "2023-10-05",
      category: "AI & Oracle",
      chainSupport: ["ETH", "SOL"],
      whitelistDeadline: "2023-10-01"
    },
    {
      id: "2",
      name: "Biodiversity NFT",
      symbol: "BNFT",
      image: "https://via.placeholder.com/64",
      description: "NFT collection funding rainforest preservation",
      price: 0.03,
      startDate: "2023-09-28",
      category: "NFT & Impact",
      chainSupport: ["ETH"],
      whitelistDeadline: "2023-09-25"
    },
    {
      id: "3",
      name: "MetaVerse Lands",
      symbol: "MVL",
      image: "https://via.placeholder.com/64",
      description: "Virtual real estate in the expanded metaverse ecosystem",
      price: 0.015,
      startDate: "2023-11-15",
      category: "Metaverse",
      chainSupport: ["ETH"],
      whitelistDeadline: "2023-11-10"
    },
    {
      id: "4",
      name: "SolRacer",
      symbol: "RACE",
      image: "https://via.placeholder.com/64",
      description: "Play-to-earn racing game on Solana with NFT vehicles",
      price: 0.008,
      startDate: "2023-10-30",
      category: "Gaming",
      chainSupport: ["SOL"],
      whitelistDeadline: "2023-10-25"
    }
  ];

  const handleBuyToken = () => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setModalVisible(false);
      setAmount("");
      alert("This feature will be available in upcoming versions. Stay tuned!");
    }, 1500);
  };

  const handleJoinWhitelist = (project) => {
    alert(`Whitelist registration for ${project.name} will be available in upcoming versions!`);
  };
  
  const handleCreatePresale = () => {
    // Validate the form
    if (!formData.name || !formData.symbol || !formData.price) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setCreateModalVisible(false);
      setFormData({
        name: "",
        symbol: "",
        description: "",
      price: "",
        saleStart: "",
        saleEnd: "",
        hardCap: "",
        softCap: ""
      });
      alert("Presale creation will be available in upcoming versions. Stay tuned!");
    }, 1500);
  };

  const renderProjectCard = (project) => {
    const isSupported = project.chainSupport.includes(currentChain);
    
    return (
    <TouchableOpacity
        key={project.id}
        style={[
          styles.projectCard,
          !isSupported && styles.unsupportedProjectCard
        ]}
        disabled={!isSupported}
      >
        <View style={styles.projectHeader}>
          <Image
            source={{ uri: project.image }}
            style={styles.projectImage}
          />
          <View style={styles.projectTitleContainer}>
            <Text style={styles.projectName}>{project.name}</Text>
            <View style={styles.symbolChainContainer}>
              <Text style={styles.projectSymbol}>${project.symbol}</Text>
              <View style={styles.chainSupportContainer}>
                {project.chainSupport.map(chain => (
                  <Image
                    key={chain}
                    source={chain === "ETH" ? images.eth1 : images.sol1}
                    style={styles.chainIcon}
                  />
                ))}
              </View>
        </View>
          </View>
        </View>
        
        <Text style={styles.projectDescription} numberOfLines={2}>
          {project.description}
          </Text>
        
        <View style={styles.presaleInfo}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Price</Text>
            <Text style={styles.infoValue}>${project.price}</Text>
        </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Starts</Text>
            <Text style={styles.infoValue}>{project.startDate}</Text>
      </View>
        </View>
        
            <TouchableOpacity
              style={[
            styles.whitelistButton,
            !isSupported && styles.disabledButton
          ]}
          onPress={() => isSupported && handleJoinWhitelist(project)}
          disabled={!isSupported}
        >
          <Text style={styles.whitelistButtonText}>Join Whitelist</Text>
        </TouchableOpacity>
            </TouchableOpacity>
    );
  };

  const renderCreateButton = () => (
            <TouchableOpacity
      style={styles.createPresaleButton}
      onPress={() => setCreateModalVisible(true)}
    >
      <Text style={styles.createPresaleButtonText}>Create New Presale</Text>
            </TouchableOpacity>
  );
  
  const renderCreatePresaleView = () => (
    <View style={styles.createContainer}>
      <Text style={styles.createDescription}>
        Launch your own token presale on Ape It Wallet. Create a presale to raise funds for your project and build your community.
      </Text>
      
      {renderCreateButton()}
      
      <View style={styles.createInfoContainer}>
        <View style={styles.createInfoItem}>
          <Text style={styles.createInfoTitle}>Community-Powered</Text>
          <Text style={styles.createInfoText}>Connect directly with your investors</Text>
        </View>
        
        <View style={styles.createInfoItem}>
          <Text style={styles.createInfoTitle}>Secure Fundraising</Text>
          <Text style={styles.createInfoText}>Smart contracts ensure fair distribution</Text>
        </View>
        
        <View style={styles.createInfoItem}>
          <Text style={styles.createInfoTitle}>Cross-Chain</Text>
          <Text style={styles.createInfoText}>Launch on Ethereum or Solana</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Token Presale</Text>
        </View>
        
        <LinearGradient
          colors={['#8C5BE6', '#5A2DA0']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.banner}
        >
          <Text style={styles.bannerTitle}>Ape It Wallet Presales</Text>
          <Text style={styles.bannerDescription}>
            Get early access to promising crypto projects before they launch
          </Text>
        </LinearGradient>
        
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "upcoming" && styles.activeTab]}
            onPress={() => setActiveTab("upcoming")}
          >
            <Text style={[styles.tabText, activeTab === "upcoming" && styles.activeTabText]}>
              Upcoming
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "create" && styles.activeTab]}
            onPress={() => setActiveTab("create")}
          >
            <Text style={[styles.tabText, activeTab === "create" && styles.activeTabText]}>
              Create Presale
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.projectsContainer}>
          {activeTab === "upcoming" && upcomingProjects.map(project => renderProjectCard(project))}
          {activeTab === "create" && renderCreatePresaleView()}
        </View>
      </ScrollView>
      
      {/* Create Presale Modal */}
      <Modal
        visible={createModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Presale</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setCreateModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              <Text style={styles.inputLabel}>Token Name*</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="Enter token name"
                value={formData.name}
                onChangeText={(text) => setFormData({...formData, name: text})}
                placeholderTextColor="#9B86B3"
              />
              
              <Text style={styles.inputLabel}>Token Symbol*</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="Enter token symbol (e.g., BTC)"
                value={formData.symbol}
                onChangeText={(text) => setFormData({...formData, symbol: text})}
                placeholderTextColor="#9B86B3"
              />
              
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.amountInput, {height: 80, textAlignVertical: 'top'}]}
                placeholder="Enter token description"
                value={formData.description}
                onChangeText={(text) => setFormData({...formData, description: text})}
                placeholderTextColor="#9B86B3"
                multiline={true}
                numberOfLines={3}
              />
              
              <Text style={styles.inputLabel}>Token Price (USD)*</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="Enter token price"
                value={formData.price}
                onChangeText={(text) => setFormData({...formData, price: text})}
                placeholderTextColor="#9B86B3"
                keyboardType="numeric"
              />
              
              <View style={styles.modalButtonsContainer}>
            <TouchableOpacity
                  style={[
                    styles.createButton,
                    loading && styles.loadingButton
                  ]}
                  onPress={handleCreatePresale}
                  disabled={loading}
                >
                  <Text style={styles.createButtonText}>
                    {loading ? "Processing..." : "Create Presale"}
                  </Text>
                </TouchableOpacity>
              </View>
              
              <Text style={styles.noticeText}>
                * Required fields. More features will be available in upcoming versions.
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
      
      {/* Join Whitelist Modal */}
      {selected && (
        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Join Whitelist: {selected.symbol}</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.modalContent}>
                <View style={styles.tokenInfoContainer}>
                  <Image
                    source={{ uri: selected.image }}
                    style={styles.modalTokenImage}
                  />
                  <View>
                    <Text style={styles.modalTokenName}>{selected.name}</Text>
                    <Text style={styles.modalTokenSymbol}>${selected.symbol}</Text>
                  </View>
                </View>
                
                <View style={styles.divider} />
                
                <View style={styles.modalInfoRow}>
                  <Text style={styles.modalInfoLabel}>Token Price:</Text>
                  <Text style={styles.modalInfoValue}>${selected.price}</Text>
                </View>
                
                <View style={styles.modalInfoRow}>
                  <Text style={styles.modalInfoLabel}>Sale Starts:</Text>
                  <Text style={styles.modalInfoValue}>{selected.startDate}</Text>
              </View>
                
                <View style={styles.modalInfoRow}>
                  <Text style={styles.modalInfoLabel}>Category:</Text>
                  <Text style={styles.modalInfoValue}>{selected.category}</Text>
          </View>
                
                <View style={styles.divider} />
                
                <Text style={styles.modalInfoLabel}>Email Address:</Text>
                <TextInput
                  style={styles.amountInput}
                  placeholder="Enter your email for updates"
                  placeholderTextColor="#9B86B3"
                />

        <TouchableOpacity
                  style={[
                    styles.buyButton,
                    loading && styles.loadingButton
                  ]}
                  onPress={() => handleJoinWhitelist(selected)}
                  disabled={loading}
                >
                  <Text style={styles.buyButtonText}>
                    {loading ? "Processing..." : "Join Whitelist"}
                  </Text>
        </TouchableOpacity>

                <Text style={styles.noticeText}>
                  You&apos;ll receive updates about this presale and be notified when it launches.
                </Text>
              </View>
            </View>
      </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A0E26",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: "#E0E0E0",
  },
  banner: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  bannerDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#2E1A40',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: '#5A2DA0',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9B86B3',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  projectsContainer: {
    paddingHorizontal: 16,
  },
  projectCard: {
    backgroundColor: '#2E1A40',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(140, 91, 230, 0.3)',
  },
  unsupportedProjectCard: {
    opacity: 0.7,
  },
  projectHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  projectImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: '#1A0E26',
  },
  projectTitleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  projectName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E0E0E0',
    marginBottom: 4,
  },
  symbolChainContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  projectSymbol: {
    fontSize: 14,
    color: '#9B86B3',
  },
  chainSupportContainer: {
    flexDirection: 'row',
  },
  chainIcon: {
    width: 16,
    height: 16,
    marginLeft: 4,
  },
  projectDescription: {
    fontSize: 14,
    color: '#A9A9A9',
    marginBottom: 16,
    lineHeight: 20,
  },
  presaleInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#9B86B3',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E0E0E0',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: 'rgba(140, 91, 230, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#8C5BE6',
  },
  progressText: {
    fontSize: 12,
    color: '#9B86B3',
    marginTop: 4,
    textAlign: 'right',
  },
  actionButton: {
    backgroundColor: '#8C5BE6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: '#5A2DA0',
    opacity: 0.7,
  },
  whitelistButton: {
    backgroundColor: '#2E1A40',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#8C5BE6',
  },
  whitelistButtonText: {
    color: '#8C5BE6',
    fontWeight: 'bold',
    fontSize: 16,
  },
  completedButton: {
    backgroundColor: '#2E1A40',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  completedButtonText: {
    color: '#9B86B3',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: SCREEN_WIDTH * 0.9,
    backgroundColor: '#2E1A40',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(140, 91, 230, 0.3)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E0E0E0',
  },
  closeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(140, 91, 230, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#E0E0E0',
    fontSize: 14,
  },
  modalContent: {
    padding: 16,
  },
  tokenInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTokenImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#1A0E26',
  },
  modalTokenName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E0E0E0',
  },
  modalTokenSymbol: {
    fontSize: 14,
    color: '#9B86B3',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(140, 91, 230, 0.3)',
    marginVertical: 16,
  },
  modalInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modalInfoLabel: {
    fontSize: 14,
    color: '#9B86B3',
  },
  modalInfoValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E0E0E0',
  },
  amountInput: {
    backgroundColor: 'rgba(26, 14, 38, 0.7)',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    marginBottom: 16,
    color: '#E0E0E0',
    borderWidth: 1,
    borderColor: 'rgba(140, 91, 230, 0.3)',
  },
  modalCalculation: {
    backgroundColor: 'rgba(26, 14, 38, 0.7)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  calculationText: {
    color: '#E0E0E0',
    fontSize: 16,
    textAlign: 'center',
  },
  buyButton: {
    backgroundColor: '#8C5BE6',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  buyButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingButton: {
    opacity: 0.7,
  },
  noticeText: {
    fontSize: 12,
    color: '#9B86B3',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  createPresaleButton: {
    backgroundColor: '#8C5BE6',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 24,
  },
  createPresaleButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  createContainer: {
    backgroundColor: '#2E1A40',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(140, 91, 230, 0.3)',
  },
  createDescription: {
    fontSize: 16,
    color: '#E0E0E0',
    lineHeight: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  createInfoContainer: {
    marginTop: 20,
  },
  createInfoItem: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: 'rgba(26, 14, 38, 0.7)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(140, 91, 230, 0.2)',
  },
  createInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E0E0E0',
    marginBottom: 4,
  },
  createInfoText: {
    fontSize: 14,
    color: '#9B86B3',
  },
  createButton: {
    backgroundColor: '#8C5BE6',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalButtonsContainer: {
    marginVertical: 8,
  },
  inputLabel: {
    fontSize: 14,
    color: '#9B86B3',
    marginBottom: 4,
  }
});

export default Presale;
