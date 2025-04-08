import FilterModal from "@/components/FilterModal";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  FlatList,
  RefreshControl,
  Alert,
  TextInput,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import SkeletonLoader from "@/components/SkeletonLoader";
import { useRefreshByUser } from "@/hooks/useRefreshByUser";
import { useRefreshOnFocus } from "@/hooks/useRefreshOnFocus";
import { useQuery } from "@tanstack/react-query";
import { fetchPumpShots } from "@/utils/query";
import { JupiterToken, PumpShot } from "@/types";
import { getRelativeTime } from "@/utils/numbers";
import axios from "axios";
import { Link, router } from "expo-router";

const NewListings = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [isTokenInfoLoading, setIsTokenInfoLoading] = useState(true);
  const [tokenMetadata, setTokenMetadata] = useState<Record<string, string>>(
    {}
  );
  const [metadataLoading, setMetadataLoading] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [selectedToken, setSelectedToken] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");
  const [isLimitOrder, setIsLimitOrder] = useState(false);

  const { isPending, error, data, refetch } = useQuery<{ data: PumpShot[] }>({
    queryKey: ["newListings"],
    queryFn: fetchPumpShots,
    refetchInterval: 20000,
    refetchIntervalInBackground: false,
  });
  const { isRefetchingByUser, refetchByUser } = useRefreshByUser(refetch);
  useRefreshOnFocus(refetch);

  const tokens = [
    {
      id: "1",
      name: "RocketMoon",
      symbol: "RMOON",
      price: "$0.00004523",
      change: "+425%",
      marketCap: "$1.2M",
      volume: "$890K",
      category: "pumpfun",
      launchTime: "2 hours ago",
      holders: 342,
    },
    {
      id: "2",
      name: "SafeGalaxy",
      symbol: "SGXY",
      price: "$0.0000234",
      change: "+892%",
      marketCap: "$3.4M",
      volume: "$2.1M",
      category: "moonshot",
      launchTime: "5 hours ago",
      holders: 1205,
    },
  ];

  const dethroneTokens = [
    {
      id: "1",
      name: "MegaShiba",
      symbol: "MSHIB",
      achievement: "Surpassed SHIB in 24h volume",
      price: "$0.00000789",
      change: "+1256%",
      volume: "$45M",
      marketCap: "$68.2M",
      category: "moonshot",
      launchTime: "19 hours ago",
      holders: 9864,
    },
    {
      id: "2",
      name: "UltraDoge",
      symbol: "UDOGE",
      achievement: "Reached DOGE market cap",
      price: "$0.0000234",
      change: "+567%",
      volume: "$28M",
      marketCap: "$4.9M",
      category: "pumpfun",
      launchTime: "7 hours ago",
      holders: 572,
    },
  ];

  const FALLBACK_IMAGE = "https://via.placeholder.com/40";

  const filterTokens = () => {
    if (selectedCategory === "all") return tokens;
    return tokens.filter((token) => token.category === selectedCategory);
  };

  const fetchMetadata = async (uri: string) => {
    try {
      const response = await axios.get(uri);
      return response.data.image;
    } catch (error) {
      // console.error("Error fetching metadata:", error);
      return FALLBACK_IMAGE;
    }
  };

  useEffect(() => {
    const fetchAllMetadata = async () => {
      if (data?.data) {
        setMetadataLoading(true);
        const metadata: Record<string, string> = {};

        try {
          await Promise.all(
            data.data.slice(0, 30).map(async (token) => {
              if (token.uri) {
                const imageUrl = await fetchMetadata(token.uri);
                metadata[token.mintAddress] = imageUrl;
              }
            })
          );

          setTokenMetadata(metadata);
        } catch (error) {
          // console.error("Error fetching metadata:", error);
        } finally {
          setMetadataLoading(false);
        }
      }
    };

    fetchAllMetadata();
  }, [data]);

  const getFilteredTokens = () => {
    if (!data?.data) return [];

    switch (selectedCategory) {
      case "pumpfun":
        return data.data.filter((token) => token.platform === "pumpfun");
      case "moonshot":
        return data.data.filter((token) => token.platform === "moonshot");
      default:
        return data.data;
    }
  };

  const renderTokenCard = ({ item }: { item: PumpShot }) => (
    <View style={styles.tokenCard}>
      <View style={styles.tokenHeader}>
        <View style={styles.tokenIdentity}>
          <Image
            source={{
              uri: tokenMetadata[item.mintAddress] || FALLBACK_IMAGE,
            }}
            style={styles.tokenIcon}
            onError={() => {
              setTokenMetadata((prev) => ({
                ...prev,
                [item.mintAddress]: FALLBACK_IMAGE,
              }));
            }}
          />
          <View>
            <Text style={styles.tokenName}>{item.name}</Text>
            <Text style={styles.tokenSymbol}>{item.symbol}</Text>
          </View>
        </View>
        <View style={styles.categoryTag}>
          <Text style={styles.categoryText}>
            {item.platform === "pumpfun" ? "🚀 PumpFun" : "🌙 Moonshot"}
          </Text>
        </View>
      </View>

      <View style={styles.tokenMetrics}>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Price</Text>
          <Text style={styles.metricValue}>
            ${item.price ? item.price : 0.04}
          </Text>
        </View>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Change</Text>
          <Text style={[styles.metricValue, styles.changePositive]}>
            {item.change ? item.change : "+425%"}
          </Text>
        </View>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>MCap</Text>
          <Text style={styles.metricValue}>
            ${item.marketCap ? item.marketCap : "1.2M"}
          </Text>
        </View>
      </View>

      <View style={styles.tokenFooter}>
        <Text style={styles.launchTime}>
          Listed {getRelativeTime(item.deployedAt)}
        </Text>
        <Text style={styles.holders}>{item.holders} holders</Text>
      </View>

      <TouchableOpacity 
        style={styles.buyButton}
        onPress={() => {
          setSelectedToken(item);
          setShowBuyModal(true);
        }}
      >
        <Text style={styles.buyButtonText}>Trade Now</Text>
      </TouchableOpacity>
    </View>
  );

  const renderDethroneCard = ({ item }: { item: PumpShot | any }) => (
    <View style={styles.dethroneCard}>
      <View style={styles.dethroneHeader}>
        <View style={styles.tokenIdentity}>
          <Image
            source={{
              uri: item.uri ? item.uri : FALLBACK_IMAGE,
            }}
            style={styles.dethroneIcon}
          />
          <View>
            <Text style={styles.dethroneName}>{item.name}</Text>
            <Text style={styles.dethroneAchievement}>{item.achievement}</Text>
          </View>
        </View>
        <View style={styles.dethroneCategoryTag}>
          <Text style={styles.dethroneCategoryText}>
            {item.category === "pumpfun" ? "🚀 PumpFun" : "🌙 Moonshot"}
          </Text>
        </View>
      </View>

      <View style={styles.tokenMetrics}>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Price</Text>
          <Text style={styles.metricValue}>{item.price}</Text>
        </View>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Change</Text>
          <Text style={[styles.metricValue, styles.changePositive]}>
            {item.change}
          </Text>
        </View>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>MCap</Text>
          <Text style={styles.metricValue}>{item.marketCap}</Text>
        </View>
      </View>

      <View style={styles.tokenFooter}>
        <Text style={styles.launchTime}>Listed {item.launchTime}</Text>
        <Text style={styles.holders}>{item.holders} holders</Text>
      </View>
      <TouchableOpacity 
        style={styles.dethroneButton}
        onPress={() => {
          router.push({
            pathname: "/tokens/[id]",
            params: { id: item.id, token: JSON.stringify(item) },
          });
        }}
      >
        <Text style={styles.dethroneButtonText}>Trade Now</Text>
      </TouchableOpacity>
    </View>
  );

  const renderMoonshotCard = ({ item }: { item: PumpShot }) => (
    <View style={styles.dethroneCard}>
      <View style={styles.dethroneHeader}>
        <View style={styles.tokenIdentity}>
          <Image
            source={{
              uri: tokenMetadata[item.mintAddress] || FALLBACK_IMAGE,
            }}
            style={styles.dethroneIcon}
            onError={() => {
              setTokenMetadata((prev) => ({
                ...prev,
                [item.mintAddress]: FALLBACK_IMAGE,
              }));
            }}
          />
          <View>
            <Text style={styles.dethroneName}>
              {String(item.name).length > 8
                ? item.name.slice(0, 8) + "..."
                : item.name}
            </Text>
            <Text style={styles.dethroneAchievement}>{item.symbol}</Text>
          </View>
        </View>
        <View style={styles.dethroneCategoryTag}>
          <Text style={styles.dethroneCategoryText}>🌙 Moonshot</Text>
        </View>
      </View>

      <View style={styles.tokenMetrics}>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Price</Text>
          <Text style={styles.metricValue}>
            ${item.price ? item.price : 0.04}
          </Text>
        </View>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Change</Text>
          <Text style={[styles.metricValue, styles.changePositive]}>
            {item.change ? item.change : "+425%"}
          </Text>
        </View>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>MCap</Text>
          <Text style={styles.metricValue}>
            ${item.marketCap ? item.marketCap : "1.2M"}
          </Text>
        </View>
      </View>

      <View style={styles.tokenFooter}>
        <Text style={styles.launchTime}>
          Listed {getRelativeTime(item.deployedAt)}
        </Text>
        <Text style={styles.holders}>{item.holders} holders</Text>
      </View>

      <TouchableOpacity 
        style={styles.dethroneButton}
        onPress={() => {
          router.push({
            pathname: "/tokens/[id]",
            params: { id: item.mintAddress, token: JSON.stringify(item) },
          });
        }}
      >
        <Text style={styles.dethroneButtonText}>Trade Now</Text>
      </TouchableOpacity>
    </View>
  );

  const handleBuy = () => {
    if (!amount || !price) {
      Alert.alert("Error", "Please enter amount and price");
      return;
    }

    if (isLimitOrder) {
      if (!stopLoss || !takeProfit) {
        Alert.alert("Error", "Please set stop loss and take profit levels");
        return;
      }
      
      // Validate stop loss and take profit levels
      const stopLossValue = parseFloat(stopLoss);
      const takeProfitValue = parseFloat(takeProfit);
      const priceValue = parseFloat(price);
      
      if (stopLossValue >= priceValue) {
        Alert.alert("Error", "Stop loss must be below the entry price");
        return;
      }
      
      if (takeProfitValue <= priceValue) {
        Alert.alert("Error", "Take profit must be above the entry price");
        return;
      }
    }

    // Handle buy logic here
    Alert.alert("Success", "Order placed successfully");
    setShowBuyModal(false);
    setAmount("");
    setPrice("");
    setStopLoss("");
    setTakeProfit("");
  };

  if (isPending || metadataLoading) {
    return <LoadingIndicator />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 70 }}>
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedCategory === "all" && styles.filterActive,
            ]}
            onPress={() => setSelectedCategory("all")}
          >
            <Text
              style={[
                styles.filterText,
                selectedCategory === "all" && styles.filterTextActive,
              ]}
            >
              All New
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedCategory === "pumpfun" && styles.filterActive,
            ]}
            onPress={() => setSelectedCategory("pumpfun")}
          >
            <Text
              style={[
                styles.filterText,
                selectedCategory === "pumpfun" && styles.filterTextActive,
              ]}
            >
              🚀 PumpFun
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedCategory === "moonshot" && styles.filterActive,
            ]}
            onPress={() => setSelectedCategory("moonshot")}
          >
            <Text
              style={[
                styles.filterText,
                selectedCategory === "moonshot" && styles.filterTextActive,
              ]}
            >
              🌙 Moonshot
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sortContainer}>
          <Text style={styles.sortLabel}>Sort by:</Text>
          <TouchableOpacity
            style={[
              styles.sortButton,
              sortBy === "newest" && styles.sortActive,
            ]}
            onPress={() => setSortBy("newest")}
          >
            <Text style={styles.sortText}>Newest</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.sortButton,
              sortBy === "trending" && styles.sortActive,
            ]}
            onPress={() => setSortBy("trending")}
          >
            <Text style={styles.sortText}>Trending</Text>
          </TouchableOpacity>
        </View>

        <FilterModal />
        <Text style={styles.sectionTitle}>New Listings</Text>
        <FlatList
          data={getFilteredTokens().slice(0, 30)}
          renderItem={({ item }) =>
            item.platform === "moonshot"
              ? renderMoonshotCard({ item })
              : renderTokenCard({ item })
          }
          keyExtractor={(item) => item.mintAddress}
          scrollEnabled={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetchingByUser}
              onRefresh={refetchByUser}
            />
          }
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No tokens found</Text>
            </View>
          )}
        />

        <Text style={styles.sectionTitle}>Dethrone Kings 👑</Text>
        <FlatList
          data={dethroneTokens}
          renderItem={renderDethroneCard}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      </ScrollView>

      {showBuyModal && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={showBuyModal}
          onRequestClose={() => setShowBuyModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Buy {selectedToken?.name}</Text>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Amount</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter amount"
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Price</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter price"
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.orderTypeContainer}>
                <TouchableOpacity
                  style={[styles.orderTypeButton, !isLimitOrder && styles.activeOrderType]}
                  onPress={() => setIsLimitOrder(false)}
                >
                  <Text style={[styles.orderTypeText, !isLimitOrder && styles.activeOrderTypeText]}>
                    Market
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.orderTypeButton, isLimitOrder && styles.activeOrderType]}
                  onPress={() => setIsLimitOrder(true)}
                >
                  <Text style={[styles.orderTypeText, isLimitOrder && styles.activeOrderTypeText]}>
                    Limit
                  </Text>
                </TouchableOpacity>
              </View>

              {isLimitOrder && (
                <>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Stop Loss</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter stop loss price"
                      value={stopLoss}
                      onChangeText={setStopLoss}
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Take Profit</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter take profit price"
                      value={takeProfit}
                      onChangeText={setTakeProfit}
                      keyboardType="numeric"
                    />
                  </View>
                </>
              )}

              <TouchableOpacity style={styles.buyButton} onPress={handleBuy}>
                <Text style={styles.buyButtonText}>Buy Now</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowBuyModal(false)}
              >
                <Text style={styles.closeButtonText}>Cancel</Text>
              </TouchableOpacity>
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
    backgroundColor: "#1A0E26", //f5f5f5
    padding: 16,
    paddingHorizontal: 12,
  },
  filterContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: "#2E1A40",
    borderWidth: 0.7,
    borderColor: "#8C5BE6",
  },
  filterActive: {
    backgroundColor: "#8C5BE6",
    borderColor: "#8C5BE6",
  },
  filterText: {
    color: "#9B86B3",
    fontSize: 14,
    fontWeight: "600",
  },
  filterTextActive: {
    color: "#E0E0E0",
  },
  sortContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  sortLabel: {
    color: "#E0E0E0",
    marginRight: 8,
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#2E1A40",
    marginRight: 8,
  },
  sortActive: {
    backgroundColor: "#8C5BE6",
  },
  sortText: {
    color: "#FFFFFF",
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 20,
    color: "#B8C3BC",
    fontWeight: "bold",
    marginBottom: 16,
    marginTop: 10,
  },
  tokenCard: {
    backgroundColor: "#2E1A40",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#8C5BE6",
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buyButton: {
    backgroundColor: "#8C5BE6", //#3BAF74
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  dethroneCard: {
    backgroundColor: "#2E1A40",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#8C5BE6",
  },
  dethroneButton: {
    backgroundColor: "#8C5BE6",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  tokenHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  tokenIdentity: {
    flexDirection: "row",
    alignItems: "center",
  },
  tokenIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: "#1A0E26",
  },
  dethroneIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: "#1A0E26",
  },
  tokenName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#E0E0E0",
  },
  tokenSymbol: {
    color: "#9B86B3",
  },
  categoryTag: {
    backgroundColor: "#1A231E",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2A3F33",
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  categoryText: {
    color: "#E0E0E0",
    fontSize: 12,
    fontWeight: "600",
  },
  dethroneCategoryTag: {
    backgroundColor: "#2E281A",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#3F372A",
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  dethroneCategoryText: {
    color: "#E0E0E0",
    fontSize: 12,
    fontWeight: "600",
  },
  tokenMetrics: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  metricItem: {
    alignItems: "flex-start",
  },
  metricLabel: {
    color: "#9B86B3",
    fontSize: 12,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#E0E0E0",
  },
  changePositive: {
    color: "#4CAF50",
  },
  tokenFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  launchTime: {
    color: "#9B86B3",
    fontSize: 12,
  },
  holders: {
    color: "#9B86B3",
    fontSize: 12,
  },
  buyButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  dethroneHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  dethroneInfo: {
    flex: 1,
    marginLeft: 8,
  },
  dethroneName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#E0E0E0",
  },
  dethroneAchievement: {
    color: "#9B86B3",
    fontSize: 12,
  },
  dethroneMetrics: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  dethronePrice: {
    fontSize: 16,
    fontWeight: "600",
    color: "#E0E0E0",
  },
  dethroneChange: {
    fontSize: 16,
    fontWeight: "600",
  },
  dethroneButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    color: "#9B86B3",
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 20,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    color: "#FFFFFF",
    marginBottom: 5,
  },
  input: {
    backgroundColor: "#2A2A2A",
    borderRadius: 8,
    padding: 12,
    color: "#FFFFFF",
  },
  orderTypeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  orderTypeButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#2A2A2A",
    marginHorizontal: 5,
  },
  activeOrderType: {
    backgroundColor: "#007AFF",
  },
  orderTypeText: {
    color: "#FFFFFF",
    textAlign: "center",
  },
  activeOrderTypeText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  buyButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginTop: 10,
  },
  buyButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  closeButton: {
    marginTop: 15,
    padding: 10,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#FFFFFF",
  },
});

export default NewListings;
