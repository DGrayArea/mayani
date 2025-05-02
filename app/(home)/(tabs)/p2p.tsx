// @ts-nocheck
import React, { useState, useEffect, useCallback } from "react";
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
  FlatList,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import images from "@/constants/images";
import useWalletStore from "@/hooks/walletStore";
import { useQuery } from "@tanstack/react-query";
import { fetchTrending } from "@/utils/query";
import { TrendingToken2 } from "@/types";
import { Ionicons, FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { formatNumber, formatPrice } from "@/utils/numbers";
import useFilterStore from "@/hooks/filterStore";
import { useRefreshOnFocus } from "@/hooks/useRefreshOnFocus";
import { useRefreshByUser } from "@/hooks/useRefreshByUser";
import { router } from "expo-router";

const SCREEN_WIDTH = Dimensions.get("window").width;

const SpotlightTokens = () => {
  const [activeTab, setActiveTab] = useState("trending");
  const [selectedToken, setSelectedToken] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  
  const { currentChain } = useWalletStore();
  const { filters } = useFilterStore();

  // Fetch trending tokens data
  const { isPending, error, data, refetch } = useQuery<
    { data: TrendingToken2[] } | undefined
  >({
    queryKey: ["trending"],
    queryFn: fetchTrending,
    refetchInterval: 20000,
    refetchIntervalInBackground: false,
    retry: 2,
    onError: (err) => {
      console.error("Error fetching trending tokens:", err);
      setConnectionError(true);
    },
    onSuccess: () => {
      setConnectionError(false);
    }
  });
  
  const { isRefetchingByUser, refetchByUser } = useRefreshByUser(refetch);
  useRefreshOnFocus(refetch);

  const handleBuyToken = () => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setModalVisible(false);
      setAmount("");
      Alert.alert("Transaction", "This feature will be available in upcoming versions. Stay tuned!");
    }, 1500);
  };

  const filteredTokens = React.useMemo(() => {
    if (!data || !data.data) return [];
    
    let filtered = [...data.data];
    
    // Apply chain filter
    if (activeTab === "sol") {
      filtered = filtered.filter(token => 
        token.relationships.base_token.data.id.startsWith("solana_")
      );
    } else if (activeTab === "eth") {
      filtered = filtered.filter(token => 
        token.relationships.base_token.data.id.startsWith("eth_")
      );
    }
    
    // Sort by market cap (largest first)
    filtered = filtered.sort((a, b) => {
      const marketCapA = parseFloat(a.attributes.fdv_usd);
      const marketCapB = parseFloat(b.attributes.fdv_usd);
      return marketCapB - marketCapA;
    });
    
    return filtered;
  }, [data, activeTab]);

  const renderEmptyState = useCallback(() => {
    if (connectionError) {
      return (
        <View style={styles.emptyStateContainer}>
          <MaterialIcons name="error-outline" size={50} color="#FF5252" />
          <Text style={styles.emptyStateTitle}>Connection Error</Text>
          <Text style={styles.emptyStateMessage}>
            We couldn't fetch the latest token data. Please check your internet connection and try again.
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={refetch}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    if (filteredTokens.length === 0 && !isPending && !isRefetchingByUser) {
      return (
        <View style={styles.emptyStateContainer}>
          <FontAwesome name="search" size={50} color="#8C5BE6" />
          <Text style={styles.emptyStateTitle}>No Tokens Found</Text>
          <Text style={styles.emptyStateMessage}>
            There are no spotlight tokens matching your current filter.
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => setActiveTab("trending")}>
            <Text style={styles.retryButtonText}>View All Tokens</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    return null;
  }, [connectionError, filteredTokens, isPending, isRefetchingByUser, refetch]);

  const renderTokenCard = useCallback((item) => {
    const isEth = item.relationships.base_token.data.id.startsWith("eth_");
    const tokenAddress = item.relationships.base_token.data.id.startsWith("solana_")
      ? item.relationships.base_token.data.id.slice(7)
      : item.relationships.base_token.data.id.startsWith("eth_")
        ? item.relationships.base_token.data.id.slice(4)
        : item.relationships.base_token.data.id;
    
    const tokenName = isEth
      ? item.tokenInfo?.tokenName
      : item.tokenInfo?.data?.name || "";
    
    const tokenImage = isEth
      ? item.tokenInfo?.tokenLogo
      : item.tokenInfo?.type === "jupiter"
        ? item.tokenInfo?.data?.logoURI
        : item.tokenInfo?.data?.logo || "/api/image/24";
    
    const marketCap = formatNumber(Number(item.attributes.fdv_usd));
    const price = formatPrice(Number(item.attributes.base_token_price_usd));
    const priceChange = item.attributes.price_change_percentage.h24;
    const isPriceUp = !priceChange.includes("-");
    
    return (
      <TouchableOpacity
        style={styles.tokenCard}
        onPress={() => {
          setSelectedToken(item);
          setModalVisible(true);
        }}
        activeOpacity={0.7}
      >
        <View style={styles.tokenHeader}>
          <Image
            source={{ uri: tokenImage }}
            style={styles.tokenImage}
            defaultSource={require('@/assets/images/token-placeholder.png')}
          />
          <View style={styles.tokenTitleContainer}>
            <Text style={styles.tokenName}>{tokenName}</Text>
            <View style={styles.symbolChainContainer}>
              <Text style={styles.tokenSymbol}>#{tokenAddress.substring(0, 6)}...</Text>
              <View style={styles.chainSupportContainer}>
                <Image
                  source={isEth ? images.eth1 : images.sol1}
                  style={styles.chainIcon}
                />
              </View>
            </View>
          </View>
        </View>
        
        <View style={styles.tokenMetrics}>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Price</Text>
            <Text style={styles.metricValue}>${price}</Text>
          </View>
          
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>24h Change</Text>
            <Text style={[styles.metricValue, isPriceUp ? styles.positive : styles.negative]}>
              {isPriceUp ? '+' : ''}{priceChange}%
            </Text>
          </View>
        
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Market Cap</Text>
            <Text style={styles.metricValue}>${marketCap}</Text>
          </View>
        </View>
        
        <TouchableOpacity
          style={styles.buyButton}
          onPress={() => {
            setSelectedToken(item);
            setModalVisible(true);
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.buyButtonText}>Buy Token</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }, []);

  const renderTabButtons = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tabButton, activeTab === "trending" && styles.activeTab]}
        onPress={() => setActiveTab("trending")}
        activeOpacity={0.8}
      >
        <Text style={[styles.tabText, activeTab === "trending" && styles.activeTabText]}>
          All Tokens
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tabButton, activeTab === "sol" && styles.activeTab]}
        onPress={() => setActiveTab("sol")}
        activeOpacity={0.8}
      >
        <Text style={[styles.tabText, activeTab === "sol" && styles.activeTabText]}>
          Solana
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tabButton, activeTab === "eth" && styles.activeTab]}
        onPress={() => setActiveTab("eth")}
        activeOpacity={0.8}
      >
        <Text style={[styles.tabText, activeTab === "eth" && styles.activeTabText]}>
          Ethereum
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderBuyModal = () => (
    <Modal
      visible={modalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setModalVisible(false)}
      statusBarTranslucent
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Buy Token</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {selectedToken && (
            <View style={styles.modalContent}>
              <View style={styles.tokenInfoContainer}>
                <Image
                  source={{
                    uri: selectedToken.relationships.base_token.data.id.startsWith("eth_")
                      ? selectedToken.tokenInfo?.tokenLogo
                      : selectedToken.tokenInfo?.type === "jupiter"
                        ? selectedToken.tokenInfo?.data?.logoURI
                        : selectedToken.tokenInfo?.data?.logo || "/api/image/24"
                  }}
                  style={styles.modalTokenImage}
                  defaultSource={require('@/assets/images/token-placeholder.png')}
                />
                <View>
                  <Text style={styles.modalTokenName}>
                    {selectedToken.relationships.base_token.data.id.startsWith("eth_")
                      ? selectedToken.tokenInfo?.tokenName
                      : selectedToken.tokenInfo?.data?.name || ""}
                  </Text>
                  <Text style={styles.modalTokenPrice}>
                    ${formatPrice(Number(selectedToken.attributes.base_token_price_usd))}
                  </Text>
                </View>
              </View>
                
              <Text style={styles.inputLabel}>Amount to Buy</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter amount"
                  placeholderTextColor="#9B86B3"
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={setAmount}
                />
              </View>

              <TouchableOpacity
                style={[styles.buyButtonLarge, loading && styles.loadingButton]}
                onPress={handleBuyToken}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator color="#FFFFFF" size="small" />
                    <Text style={styles.buyButtonLargeText}>Processing...</Text>
                  </View>
                ) : (
                  <Text style={styles.buyButtonLargeText}>Buy Now</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );

  const renderListHeader = useCallback(() => {
    if (isPending && !isRefetchingByUser) {
      return (
        <View style={styles.loadingView}>
          <ActivityIndicator size="large" color="#8C5BE6" />
          <Text style={styles.loadingText}>Loading spotlight tokens...</Text>
        </View>
      );
    }
    
    return null;
  }, [isPending, isRefetchingByUser]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={["#1A0E26", "#2A1240"]}
        style={styles.gradientBackground}
      >
        <View style={styles.headerContainer}>
          <Text style={styles.header}>Spotlight Tokens</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => router.push("/(home)/search")}
              activeOpacity={0.8}
            >
              <Ionicons name="search-outline" size={22} color="#F0F0F0" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.iconButton}
              activeOpacity={0.8}
            >
              <Ionicons name="notifications-outline" size={22} color="#F0F0F0" />
            </TouchableOpacity>
          </View>
        </View>

        {renderTabButtons()}
        
        <FlatList
          data={filteredTokens}
          renderItem={({ item }) => renderTokenCard(item)}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.tokenList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetchingByUser}
              onRefresh={refetchByUser}
              colors={["#8C5BE6"]}
              tintColor="#8C5BE6"
            />
          }
          ListHeaderComponent={renderListHeader}
          ListEmptyComponent={renderEmptyState}
        />
        
        {renderBuyModal()}
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
    paddingHorizontal: 16,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    marginTop: 8,
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  header: {
    color: "#F0F0F0",
    fontSize: 32,
    fontWeight: "bold",
    marginTop: 10,
    fontFamily: "System",
    letterSpacing: 0.5,
  },
  iconButton: {
    backgroundColor: "rgba(140, 91, 230, 0.2)",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    borderWidth: 1,
    borderColor: "rgba(140, 91, 230, 0.5)",
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: 24,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: "rgba(46, 26, 64, 0.8)",
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: "rgba(140, 91, 230, 0.5)",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  activeTab: {
    backgroundColor: '#5A2DA0',
    borderColor: "rgba(140, 91, 230, 0.8)",
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9B86B3',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  tokenList: {
    paddingBottom: 20,
  },
  tokenCard: {
    backgroundColor: '#2E1A40',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(140, 91, 230, 0.3)',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  tokenHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tokenImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: '#1A0E26',
  },
  tokenTitleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  tokenName: {
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
  tokenSymbol: {
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
  tokenMetrics: {
    flexDirection: 'row',
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  metric: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 12,
    color: '#9B86B3',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E0E0E0',
  },
  positive: {
    color: '#4CAF50',
  },
  negative: {
    color: '#FF5252',
  },
  buyButton: {
    backgroundColor: '#8C5BE6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  buyButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
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
    borderWidth: 1,
    borderColor: 'rgba(140, 91, 230, 0.3)',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E0E0E0',
    marginBottom: 4,
  },
  modalTokenPrice: {
    fontSize: 16,
    color: '#9B86B3',
  },
  inputLabel: {
    color: '#E0E0E0',
    fontSize: 16,
    marginBottom: 8,
  },
  inputContainer: {
    backgroundColor: 'rgba(26, 14, 38, 0.6)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(140, 91, 230, 0.3)',
    marginBottom: 16,
  },
  input: {
    color: '#E0E0E0',
    padding: 12,
    fontSize: 16,
  },
  buyButtonLarge: {
    backgroundColor: '#8C5BE6',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  buyButtonLargeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingButton: {
    opacity: 0.7,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingView: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#E0E0E0',
    marginTop: 12,
    fontSize: 14,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    marginTop: 30,
  },
  emptyStateTitle: {
    color: '#E0E0E0',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateMessage: {
    color: '#9B86B3',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#8C5BE6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default SpotlightTokens;

