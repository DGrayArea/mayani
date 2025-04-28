import FilterModal from "@/components/FilterModal";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import SkeletonLoader from "@/components/SkeletonLoader";
import { useRefreshByUser } from "@/hooks/useRefreshByUser";
import { useRefreshOnFocus } from "@/hooks/useRefreshOnFocus";
import { formatNumber, formatPrice } from "@/utils/numbers";
import { useQuery } from "@tanstack/react-query";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  Modal,
  TextInput,
  Switch,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, router } from "expo-router";
import { TrendingToken2 } from "@/types";
import { fetchTrending } from "@/utils/query";
import { useSharedValue } from "react-native-reanimated";
import { Ionicons, FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import useWalletStore from "@/hooks/walletStore";
import useFilterStore from "@/hooks/filterStore";
import { RefreshControl } from "react-native";
import {
  ScrollView,
  TouchableOpacity,
  FlatList,
} from "react-native-gesture-handler";
import axios from "axios";
import { get0xPermit2Swap } from "@/utils/transaction";
import { config } from "@/lib/appwrite";
import { Connection } from "@solana/web3.js";
import { swapWithJupiter } from "@/utils/trade";

const { width } = Dimensions.get("window");

// BuyModal Component to handle buying with order types
const BuyModal = ({ visible, onClose, token }) => {
  const [orderType, setOrderType] = useState("market"); // market, limit, stop
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");
  const [stopLossPrice, setStopLossPrice] = useState("");
  const [takeProfitPrice, setTakeProfitPrice] = useState("");
  const [enableStopLoss, setEnableStopLoss] = useState(false);
  const [enableTakeProfit, setEnableTakeProfit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [prices, setPrices] = useState<any>({
    eth: 0,
    sol: 0,
  });

  useEffect(() => {
    const getPrices = async () => {
      const ethPrice = await axios.get(
        "https://api.geckoterminal.com/api/v2/networks/eth/tokens/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
      );
      const solPrice = await axios.get(
        "https://api.geckoterminal.com/api/v2/networks/solana/tokens/So11111111111111111111111111111111111111112"
      );
      setPrices({
        eth: ethPrice.data.data.attributes.price_usd,
        sol: solPrice.data.data.attributes.price_usd,
      });
    };
    getPrices();
  }, []);

  useEffect(() => {
    if (visible && token) {
      // Set initial price to current token price when modal opens
      setPrice(token.attributes?.base_token_price_usd?.toString() || "0");
    }
  }, [visible, token]);

  const {
    getBalance,
    solPrivateKey,
    privateKey,
    ethWalletAddress,
    solWalletAddress,
  } = useWalletStore();
  const resetForm = () => {
    setOrderType("market");
    setAmount("");
    setPrice("");
    setStopLossPrice("");
    setTakeProfitPrice("");
    setEnableStopLoss(false);
    setEnableTakeProfit(false);
  };

  const renderOrderTypeSelector = () => (
    <View style={styles.orderTypeContainer}>
      <TouchableOpacity
        style={[
          styles.orderTypeButton,
          orderType === "market" && styles.activeOrderType,
        ]}
        onPress={() => setOrderType("market")}
      >
        <Text
          style={[
            styles.orderTypeText,
            orderType === "market" && styles.activeOrderTypeText,
          ]}
        >
          Market
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.orderTypeButton,
          orderType === "limit" && styles.activeOrderType,
        ]}
        onPress={() => setOrderType("limit")}
        disabled
      >
        <Text
          style={[
            styles.orderTypeText,
            orderType === "limit" && styles.activeOrderTypeText,
          ]}
        >
          Limit
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.orderTypeButton,
          orderType === "stop" && styles.activeOrderType,
        ]}
        onPress={() => setOrderType("stop")}
        disabled
      >
        <Text
          style={[
            styles.orderTypeText,
            orderType === "stop" && styles.activeOrderTypeText,
          ]}
        >
          Stop
        </Text>
      </TouchableOpacity>
    </View>
  );

  const getProtocolText = (chain, fromToken, toToken) => {
    if (chain === "ETH") {
      return `Using Uniswap protocol for ${fromToken} ↔ ${toToken}`;
    } else if (chain === "SOL") {
      return `Using Jupiter protocol for ${fromToken} ↔ ${toToken}`;
    }
    return "Using optimal DEX routing";
  };

  const nativeEquivalent = useMemo(() => {
    if (!token) return { native: 0, usd: 0 };

    const tokenPriceInUsd = Number(price) || 0;
    const tokenAmount = Number(amount) || 0;

    const totalUsd = tokenPriceInUsd * tokenAmount;

    const ethPriceInUsd = Number(prices.eth) || 1;
    const solPriceInUsd = Number(prices.sol) || 1;
    const native = token.isEth
      ? (totalUsd / ethPriceInUsd).toFixed(4)
      : (totalUsd / solPriceInUsd).toFixed(4);

    return {
      native: Number(native),
      usd: Number(totalUsd.toFixed(2)),
    };
  }, [token, amount, price, prices]);

  const handleSubmitOrder = useCallback(async () => {
    const tokenAddress = token.relationships.base_token.data.id.startsWith(
      "solana_"
    )
      ? token.relationships.base_token.data.id.slice(7)
      : token.relationships.base_token.data.id.startsWith("eth_")
        ? token.relationships.base_token.data.id.slice(4)
        : token.relationships.base_token.data.id;

    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }
    // if (orderType !== "market" && (!price || parseFloat(price) <= 0)) {
    //   Alert.alert("Error", "Please enter a valid price");
    //   return;
    // }
    // if (enableStopLoss && (!stopLossPrice || parseFloat(stopLossPrice) <= 0)) {
    //   Alert.alert("Error", "Please enter a valid stop loss price");
    //   return;
    // }
    // if (
    //   enableTakeProfit &&
    //   (!takeProfitPrice || parseFloat(takeProfitPrice) <= 0)
    // ) {
    //   Alert.alert("Error", "Please enter a valid take profit price");
    //   return;
    // }
    // if (
    //   enableTakeProfit &&
    //   (!takeProfitPrice || parseFloat(takeProfitPrice) <= 0)
    // ) {
    //   Alert.alert("Error", "Please enter a valid take profit price");
    //   return;
    // }

    setLoading(true);
    try {
      if (token.isEth) {
        if (Number(getBalance("eth")) > Number(nativeEquivalent.native)) {
          const txid = await get0xPermit2Swap(
            "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
            tokenAddress,
            Number(amount) * 10 ** Number(token.decimals),
            ethWalletAddress,
            privateKey!
          );
          // Show success message
          Alert.alert(
            "Success",
            `Swap completed successfully: https://etherscan.io/tx/${txid?.hash}`
          );
        } else {
          Alert.alert(
            "Error",
            "Insufficient balance for the swap amount or no swap route found"
          );
        }
      } else {
        if (Number(getBalance("sol")) > Number(nativeEquivalent.native)) {
          const txid = await swapWithJupiter(
            new Connection(config.heliusUrl),
            "So11111111111111111111111111111111111111112",
            tokenAddress,
            String(Number(amount) * 10 ** Number(token.decimals)),
            solPrivateKey!
          );
          Alert.alert(
            `Success", "Swap completed successfully https://solscan.io/tx/${txid}`
          );
        } else {
          Alert.alert(
            "Error",
            "Insufficient balance for the swap amount or no swap route found"
          );
        }
      }
    } catch (error) {
      console.error("Swap error:", error);
      Alert.alert(
        "Error",
        "Failed to complete swap due to insufficient gas or allowance"
      );
    } finally {
      setLoading(false);
      resetForm();
      onClose();
    }
    // setTimeout(() => {
    // setLoading(false);

    //   // Format order details for the alert
    //   let orderDetails = `Order Type: ${orderType.toUpperCase()}\nAmount: ${amount}`;

    //   if (orderType !== "market") {
    //     orderDetails += `\nPrice: $${price}`;
    //   }

    //   if (enableStopLoss) {
    //     orderDetails += `\nStop Loss: $${stopLossPrice}`;
    //   }

    //   if (enableTakeProfit) {
    //     orderDetails += `\nTake Profit: $${takeProfitPrice}`;
    //   }

    //   Alert.alert(
    //     "Order Submitted",
    //     `Your order has been submitted successfully!\n\n${orderDetails}`,
    //     [
    //       {
    //         text: "OK",
    //         onPress: () => {
    //           // Reset form and close modal
    //           resetForm();
    //           onClose();
    //         },
    //       },
    //     ]
    //   );
    // }, 1500);
  }, [
    amount,
    privateKey,
    solPrivateKey,
    solWalletAddress,
    ethWalletAddress,
    nativeEquivalent,
    config,
    price,
    orderType,
    token,
    enableStopLoss,
    enableTakeProfit,
    stopLossPrice,
    takeProfitPrice,
  ]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {orderType === "market"
                ? "Market Order"
                : orderType === "limit"
                  ? "Limit Order"
                  : "Stop Order"}
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <MaterialIcons name="close" size={22} color="#E0E0E0" />
            </TouchableOpacity>
          </View>

          {token && (
            <View style={styles.tokenInfoContainer}>
              <Image
                source={{
                  uri: token.relationships?.base_token?.data?.id?.startsWith(
                    "eth_"
                  )
                    ? token.tokenInfo?.tokenLogo
                    : token.tokenInfo?.type === "jupiter"
                      ? token.tokenInfo?.data?.logoURI
                      : token.tokenInfo?.data?.logo || "/api/image/24",
                }}
                style={styles.modalTokenImage}
              />
              <View>
                <Text style={styles.modalTokenName}>
                  {token.relationships?.base_token?.data?.id?.startsWith("eth_")
                    ? token.tokenInfo?.tokenName
                    : token.tokenInfo?.data?.name || ""}
                </Text>
                <Text style={styles.modalTokenPrice}>
                  ${formatPrice(Number(token.attributes?.base_token_price_usd))}
                </Text>
              </View>
            </View>
          )}

          <ScrollView style={styles.modalContent}>
            {renderOrderTypeSelector()}

            <Text style={styles.inputLabel}>Amount</Text>
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

            {orderType !== "market" && (
              <>
                <Text style={styles.inputLabel}>
                  {orderType === "limit" ? "Limit Price" : "Stop Price"}
                </Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder={`Enter ${orderType === "limit" ? "limit" : "stop"} price`}
                    placeholderTextColor="#9B86B3"
                    keyboardType="numeric"
                    value={price}
                    onChangeText={setPrice}
                  />
                  <Text style={styles.inputPrefix}>$</Text>
                </View>
              </>
            )}
            <>
              <Text style={styles.inputLabel}>Total Amount</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.inputPrefix}>$</Text>
                <View style={styles.swapOutputContainer}>
                  <Text style={styles.estimatedAmountText}>
                    {nativeEquivalent.native} {token?.isEth ? "ETH" : "SOL"}
                  </Text>
                </View>
              </View>
              <Text style={{ color: "#E0E0E0", fontSize: 18 }}>
                ≃${nativeEquivalent.usd.toFixed(2)}
              </Text>
            </>
            <View style={styles.divider} />

            <View style={styles.toggleContainer}>
              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>Stop Loss</Text>
                <Switch
                  value={enableStopLoss}
                  onValueChange={setEnableStopLoss}
                  trackColor={{ false: "#2E1A40", true: "#8C5BE6" }}
                  thumbColor={enableStopLoss ? "#FFFFFF" : "#9B86B3"}
                  disabled={true}
                />
              </View>

              {enableStopLoss && (
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter stop loss price"
                    placeholderTextColor="#9B86B3"
                    keyboardType="numeric"
                    value={stopLossPrice}
                    onChangeText={setStopLossPrice}
                  />
                  <Text style={styles.inputPrefix}>$</Text>
                </View>
              )}
            </View>

            <View style={styles.toggleContainer}>
              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>Take Profit</Text>
                <Switch
                  value={enableTakeProfit}
                  onValueChange={setEnableTakeProfit}
                  trackColor={{ false: "#2E1A40", true: "#8C5BE6" }}
                  thumbColor={enableTakeProfit ? "#FFFFFF" : "#9B86B3"}
                  disabled={true}
                />
              </View>

              {enableTakeProfit && (
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter take profit price"
                    placeholderTextColor="#9B86B3"
                    keyboardType="numeric"
                    value={takeProfitPrice}
                    onChangeText={setTakeProfitPrice}
                  />
                  <Text style={styles.inputPrefix}>$</Text>
                </View>
              )}
            </View>
            <View style={styles.swapProtocolContainer}>
              <Text style={styles.swapProtocolText}>
                {getProtocolText(
                  token?.isEth ? "ETH" : "SOL",
                  token?.isEth ? "ETH" : "SOL",
                  token?.symbol!
                )}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.loadingButton]}
              onPress={handleSubmitOrder}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>
                {loading ? "Processing..." : "Place Order"}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const AutoScrollingTrendingBar = ({ data }: { data: TrendingToken2[] }) => {
  const scrollX = useSharedValue(0);
  const [contentWidth, setContentWidth] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    let scrollTimer: NodeJS.Timeout;

    if (contentWidth > 0) {
      const scroll = () => {
        if (flatListRef.current) {
          scrollX.value += 1;

          if (scrollX.value >= contentWidth / 3) {
            scrollX.value = 0;
            flatListRef.current.scrollToOffset({ offset: 0, animated: false });
          } else {
            flatListRef.current.scrollToOffset({
              offset: scrollX.value,
              animated: false,
            });
          }
        }
      };

      scrollTimer = setInterval(scroll, 50);
    }

    return () => {
      if (scrollTimer) {
        clearInterval(scrollTimer);
      }
    };
  }, [contentWidth]);

  const renderTrendingItem = ({
    item,
    index,
  }: {
    item: TrendingToken2;
    index: number;
  }) => {
    const isEth = item.relationships.base_token.data.id.startsWith("eth_");
    const tokenAddress = item.relationships.base_token.data.id.startsWith(
      "solana_"
    )
      ? item.relationships.base_token.data.id.slice(7)
      : item.relationships.base_token.data.id.startsWith("eth_")
        ? item.relationships.base_token.data.id.slice(4)
        : item.relationships.base_token.data.id;

    return (
      <TouchableOpacity>
        <Link
          href={{
            pathname: "/tokens/[id]",
            params: { id: tokenAddress, token: JSON.stringify(item) },
          }}
          asChild
        >
          <View style={styles.trendingBarItem}>
            <View style={styles.trendingBarLeftContent}>
              <Text style={styles.trendingBarIndex}>#{index + 1}</Text>
              <Image
                source={{
                  uri:
                    item.tokenInfo?.type === "jupiter"
                      ? item.tokenInfo?.data?.logoURI
                      : item.tokenInfo?.data?.logo || "/api/image/24",
                }}
                style={styles.trendingBarAvatar}
              />
              <View style={styles.trendingBarInfo}>
                <Text style={styles.trendingBarSymbol}>
                  {isEth
                    ? //@ts-ignore
                      item.tokenInfo?.tokenName
                    : item.tokenInfo?.data?.name || ""}
                </Text>
                <Text
                  style={[
                    styles.trendingBarChange,
                    item.attributes.price_change_percentage.h24.includes("-")
                      ? styles.negative
                      : styles.positive,
                  ]}
                >
                  {item.attributes.price_change_percentage.h24}%
                </Text>
              </View>
            </View>
          </View>
        </Link>
      </TouchableOpacity>
    );
  };

  // Triple the data for smooth infinite scroll
  //const duplicatedData = [...data, ...data, ...data];

  return (
    <FlatList
      ref={flatListRef}
      data={data}
      renderItem={renderTrendingItem}
      horizontal
      showsHorizontalScrollIndicator={false}
      scrollEnabled={false}
      style={styles.trendingBarContainer}
      contentContainerStyle={styles.trendingBarContent}
      onContentSizeChange={(width) => setContentWidth(width)}
      keyExtractor={(item, index) => `${item.attributes.address}-${index}`}
    />
  );
};

const Explore = () => {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const { generateSolWallet, generateEthWallet, solWallet, ethWallet } =
    useWalletStore();
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [selectedToken, setSelectedToken] = useState<any>(null);
  const [sortedData, setSortedData] = useState<any>([]);

  const { isPending, error, data, refetch } = useQuery<
    { data: TrendingToken2[] } | undefined
  >({
    queryKey: ["trending"],
    queryFn: fetchTrending,
    refetchInterval: 20000,
    refetchIntervalInBackground: false,
  });
  const { isRefetchingByUser, refetchByUser } = useRefreshByUser(refetch);
  useRefreshOnFocus(refetch);

  const handleBuyPress = async (token: any, isEth: boolean) => {
    setSelectedToken({ ...token, isEth });
    setShowBuyModal(true);
    // router.push("/");
  };

  const renderFilterButtons = () => (
    <View style={styles.filterContainer}>
      <TouchableOpacity
        style={[
          styles.filterButton,
          selectedFilter === "all" && styles.filterButtonActive,
        ]}
        onPress={() => setSelectedFilter("all")}
      >
        <Text
          style={[
            styles.filterText,
            selectedFilter === "all" && styles.filterTextActive,
          ]}
        >
          All
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.filterButton,
          selectedFilter === "sol" && styles.filterButtonActive,
        ]}
        onPress={() => setSelectedFilter("sol")}
      >
        <Text
          style={[
            styles.filterText,
            selectedFilter === "sol" && styles.filterTextActive,
          ]}
        >
          SOL
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.filterButton,
          selectedFilter === "eth" && styles.filterButtonActive,
        ]}
        onPress={() => setSelectedFilter("eth")}
      >
        <Text
          style={[
            styles.filterText,
            selectedFilter === "eth" && styles.filterTextActive,
          ]}
        >
          ETH
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.filterButton,
          selectedFilter === "usdt" && styles.filterButtonActive,
        ]}
        onPress={() => setSelectedFilter("usdt")}
      >
        <Text
          style={[
            styles.filterText,
            selectedFilter === "usdt" && styles.filterTextActive,
          ]}
        >
          USDT
        </Text>
      </TouchableOpacity>
    </View>
  );

  const mergedData = useMemo(() => {
    if (!data || !data.data) return [];

    const filterState = useFilterStore.getState();
    const { filters } = filterState;

    // First filter by chain
    const chainFiltered = data.data.filter((item) => {
      if (selectedFilter === "all") return true;
      if (
        selectedFilter === "sol" &&
        item.relationships.base_token.data.id.startsWith("solana_")
      )
        return true;
      if (
        selectedFilter === "eth" &&
        item.relationships.base_token.data.id.startsWith("eth_")
      )
        return true;
      if (
        selectedFilter === "usdt" &&
        item.relationships.base_token.data.id.includes("usdt")
      )
        return true;
      return false;
    });

    // Apply additional filters
    const filtered = chainFiltered.filter((item) => {
      // Skip additional filtering if no filters are active
      if (filters.withSocial === true && filterState.activeFilterCount <= 1) {
        return true;
      }

      // Market cap filters
      const marketCap = parseFloat(item.attributes.fdv_usd);
      if (
        filters.marketCapFrom &&
        marketCap < parseFloat(filters.marketCapFrom)
      ) {
        return false;
      }
      if (filters.marketCapTo && marketCap > parseFloat(filters.marketCapTo)) {
        return false;
      }

      // Volume filters would go here if available in the data

      // Filter by social presence if required
      if (filters.withSocial && !item.tokenInfo?.data?.logo) {
        return false;
      }

      return true;
    });

    // Sort the data
    return filtered.sort((a, b) => {
      const sortDir = filters.sortDirection === "asc" ? 1 : -1;

      switch (filters.sortBy) {
        case "priceChange":
          return (
            sortDir *
            (parseFloat(b.attributes.price_change_percentage.h24) -
              parseFloat(a.attributes.price_change_percentage.h24))
          );

        case "marketCap":
          return (
            sortDir *
            (parseFloat(b.attributes.fdv_usd) -
              parseFloat(a.attributes.fdv_usd))
          );

        case "price":
          return (
            sortDir *
            (parseFloat(b.attributes.base_token_price_usd) -
              parseFloat(a.attributes.base_token_price_usd))
          );

        // Default to volume/trending sort
        default:
          return (
            sortDir *
            (parseFloat(b.attributes.price_change_percentage.h24) -
              parseFloat(a.attributes.price_change_percentage.h24))
          );
      }
    });
  }, [data, selectedFilter]);

  const filteredTopGainers = useMemo(() => {
    return mergedData?.filter(
      (item) => parseFloat(item.attributes.price_change_percentage.h24) > 0
    );
  }, [mergedData]);

  useEffect(() => {
    if (mergedData) {
      setSortedData(
        mergedData
          ?.slice()
          .sort(() => Math.random() - 0.5)
          .slice(0, 10)
      );
    }
  }, [mergedData]);

  const TopGainer = ({ item }: any) => {
    const isEth = item.relationships.base_token.data.id.startsWith("eth_");
    const tokenAddress = item.relationships.base_token.data.id.startsWith(
      "solana_"
    )
      ? item.relationships.base_token.data.id.slice(7)
      : item.relationships.base_token.data.id.startsWith("eth_")
        ? item.relationships.base_token.data.id.slice(4)
        : item.relationships.base_token.data.id;

    return (
      <TouchableOpacity
        style={styles.TouchableGainerCard}
        activeOpacity={0.2}
        onPress={() => {
          handleBuyPress(item, isEth);
        }}
      >
        <View style={styles.gainerCard}>
          <Image
            source={{
              uri: isEth
                ? //@ts-ignore
                  item.tokenInfo?.tokenLogo
                : item.tokenInfo?.type === "jupiter"
                  ? item.tokenInfo?.data?.logoURI
                  : item.tokenInfo?.data?.logo || "/api/image/24",
            }}
            style={styles.avatar}
          />
          <View style={styles.gainerContent}>
            {isPending ? (
              <SkeletonLoader />
            ) : (
              <Text style={styles.gainerText}>
                {isEth
                  ? //@ts-ignore
                    item.tokenInfo?.tokenName
                  : item.tokenInfo?.data?.name.length > 12
                    ? item.tokenInfo?.data?.name.slice(0, 12)
                    : item.tokenInfo?.data?.name || "Unkown"}
              </Text>
            )}
            <Text
              style={[
                styles.trendingChange,
                item.attributes.price_change_percentage.h24.includes("-")
                  ? styles.negative
                  : styles.positive,
              ]}
            >
              {item.attributes.price_change_percentage.h24}%
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  const MergedItem = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity
        key={item.attributes.address}
        style={styles.touchableTrendingItem}
        activeOpacity={0.2}
        onPress={() =>
          handleBuyPress(
            item,
            item.relationships.base_token.data.id.startsWith("eth_")
          )
        }
      >
        <View style={styles.trendingItem}>
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri: item.relationships.base_token.data.id.startsWith("eth_")
                  ? //@ts-ignore
                    item.tokenInfo?.tokenLogo
                  : item.tokenInfo?.type === "jupiter"
                    ? item.tokenInfo?.data.logoURI
                    : item.tokenInfo?.data.logo || "/api/image/24",
              }}
              style={styles.avatar}
            />
          </View>
          <View style={styles.trendingInfo}>
            {isPending ? (
              <SkeletonLoader />
            ) : (
              <Text style={styles.trendingName}>
                {item.relationships.base_token.data.id.startsWith("eth_")
                  ? //@ts-ignore
                    item.tokenInfo?.tokenName
                  : item.tokenInfo?.data.name || ""}
              </Text>
            )}
            <Text style={styles.marketCap}>
              ${formatNumber(Number(item.attributes.fdv_usd))} MKT CAP
            </Text>
          </View>
          <View style={styles.trendingPriceInfo}>
            <Text style={styles.trendingPrice}>
              ${formatPrice(Number(item.attributes.base_token_price_usd))}
            </Text>
            <View
              style={[
                styles.changeContainer,
                item.attributes.price_change_percentage.h24.includes("-")
                  ? styles.negativeContainer
                  : styles.positiveContainer,
              ]}
            >
              <Text
                style={[
                  styles.trendingChange,
                  item.attributes.price_change_percentage.h24.includes("-")
                    ? styles.negative
                    : styles.positive,
                ]}
              >
                {item.attributes.price_change_percentage.h24.includes("-")
                  ? ""
                  : "+"}
                {item.attributes.price_change_percentage.h24}%
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  const renderTrendingItem = ({ item }: { item: TrendingToken2 }) => {
    const isEth = item.relationships.base_token.data.id.startsWith("eth_");
    const tokenAddress = item.relationships.base_token.data.id.startsWith(
      "solana_"
    )
      ? item.relationships.base_token.data.id.slice(7)
      : item.relationships.base_token.data.id.startsWith("eth_")
        ? item.relationships.base_token.data.id.slice(4)
        : item.relationships.base_token.data.id;

    // const tokenInfo = tokenInfoMap[tokenAddress];

    return (
      <TouchableOpacity style={styles.touchableTrendingItem}>
        <Link
          href={{
            pathname: "/tokens/[id]",
            params: { id: tokenAddress, token: JSON.stringify(item) },
          }}
        >
          <View style={styles.trendingItem}>
            <Image
              source={{
                uri: isEth
                  ? //@ts-ignore
                    item.tokenInfo?.tokenLogo
                  : item.tokenInfo?.type === "jupiter"
                    ? item.tokenInfo?.data.logoURI
                    : item.tokenInfo?.data.logo || "/api/image/24",
              }}
              style={styles.avatar}
            />
            <View style={styles.trendingInfo}>
              {isPending ? (
                <SkeletonLoader />
              ) : (
                <Text style={styles.trendingName}>
                  {isEth
                    ? //@ts-ignore
                      item.tokenInfo?.tokenName
                    : item.tokenInfo?.data.name || ""}
                </Text>
              )}
              <Text style={styles.marketCap}>
                ${formatNumber(Number(item.attributes.fdv_usd))} MKT CAP
              </Text>
            </View>
            <View style={styles.trendingPriceInfo}>
              <Text style={styles.trendingPrice}>
                ${formatPrice(Number(item.attributes.base_token_price_usd))}
              </Text>
              <Text
                style={[
                  styles.trendingChange,
                  item.attributes.price_change_percentage.h24.includes("-")
                    ? styles.negative
                    : styles.positive,
                ]}
              >
                {item.attributes.price_change_percentage.h24}%
              </Text>
            </View>
          </View>
        </Link>
      </TouchableOpacity>
    );
  };

  if (isPending || isRefetchingByUser) return <LoadingIndicator />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={["#1A0E26", "#2A1240"]}
        style={styles.gradientBackground}
      >
        <View style={styles.container}>
          <View style={styles.headerContainer}>
            <Text style={styles.header}>Explore</Text>
            <View style={styles.headerButtons}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => router.push("/(home)/search")}
              >
                <Ionicons name="search-outline" size={22} color="#F0F0F0" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons
                  name="notifications-outline"
                  size={22}
                  color="#F0F0F0"
                />
              </TouchableOpacity>
            </View>
          </View>

          {renderFilterButtons()}
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 20 }}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          // bounces={false}
          // directionalLockEnabled={true}
          // alwaysBounceVertical={false}
          // keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={isRefetchingByUser}
              onRefresh={refetchByUser}
              colors={["#8C5BE6"]}
              tintColor="#8C5BE6"
            />
          }
        >
          <View style={styles.container}>
            <View style={styles.sectionWrapper}>
              <View style={styles.trendingHeader}>
                <View style={styles.sectionTitleContainer}>
                  <FontAwesome
                    name="line-chart"
                    size={18}
                    color="#8C5BE6"
                    style={styles.sectionIcon}
                  />
                  <Text style={styles.sectionTitle}>Trending</Text>
                </View>
                <TouchableOpacity
                  style={styles.promoteButton}
                  onPress={() => router.push("/(home)/promote")}
                >
                  <Text style={styles.promoteButtonText}>🚀 Promote</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.trendingBarWrapper}>
                <AutoScrollingTrendingBar data={sortedData} />
              </View>
              <FilterModal />
            </View>

            <View style={styles.sectionWrapper}>
              <View style={styles.sectionTitleContainer}>
                <FontAwesome
                  name="arrow-up"
                  size={18}
                  color="#4CAF50"
                  style={styles.sectionIcon}
                />
                <Text style={styles.sectionTitle}>Top Gainers</Text>
              </View>
              <FlatList
                data={filteredTopGainers}
                renderItem={TopGainer}
                keyExtractor={(item) => item.attributes.address}
                horizontal={true}
                scrollEnabled={true}
                showsHorizontalScrollIndicator={false}
                nestedScrollEnabled={true}
                contentContainerStyle={{
                  paddingHorizontal: 2,
                  paddingVertical: 8,
                }}
                style={{ flexGrow: 0, width: "100%" }}
              />
            </View>

            <View style={styles.sectionWrapper}>
              <View style={styles.sectionTitleContainer}>
                <FontAwesome
                  name="star"
                  size={18}
                  color="#F9A825"
                  style={styles.sectionIcon}
                />
                <Text style={styles.sectionTitle}>Spotlight</Text>
              </View>

              {mergedData.map((item) => (
                <MergedItem key={item.attributes.address} item={item} />
              ))}
            </View>
          </View>
        </ScrollView>

        <BuyModal
          visible={showBuyModal}
          onClose={() => setShowBuyModal(false)}
          token={selectedToken}
        />
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  swapProtocolContainer: {
    marginBottom: 20,
  },
  swapProtocolText: {
    color: "#9B86B3",
    fontSize: 14,
    textAlign: "center",
  },
  swapOutputContainer: {
    flexDirection: "row",
    backgroundColor: "#1A0E26",
    borderRadius: 12,
    overflow: "hidden",
  },
  estimatedAmountText: {
    flex: 1,
    color: "#E0E0E0",
    fontSize: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  safeArea: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  container: {
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
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
    borderWidth: 1,
    borderColor: "rgba(140, 91, 230, 0.5)",
  },
  filterContainer: {
    flexDirection: "row",
    marginBottom: 24,
    paddingVertical: 4,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: "rgba(46, 26, 64, 0.8)",
    borderWidth: 1,
    borderColor: "rgba(140, 91, 230, 0.5)",
  },
  filterButtonActive: {
    backgroundColor: "rgba(140, 91, 230, 0.9)",
    borderColor: "#8C5BE6",
  },
  filterText: {
    color: "#A990C9",
    fontSize: 14,
    fontWeight: "600",
  },
  filterTextActive: {
    color: "#FFFFFF",
  },
  sectionWrapper: {
    marginBottom: 25,
    width: "100%",
    backgroundColor: "rgba(34, 17, 51, 0.8)",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    borderWidth: 1,
    borderColor: "rgba(140, 91, 230, 0.3)",
  },
  trendingBarWrapper: {
    backgroundColor: "rgba(46, 26, 64, 0.6)",
    borderRadius: 12,
    padding: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(140, 91, 230, 0.15)",
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  gainerCard: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 170,
    maxWidth: 400,
  },
  TouchableGainerCard: {
    backgroundColor: "rgba(46, 26, 64, 0.8)",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginRight: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(140, 91, 230, 0.5)",
    minWidth: 170,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  gainerContent: {
    flex: 1,
    marginLeft: 12,
  },
  avatarContainer: {
    borderRadius: 20,
    padding: 2,
    backgroundColor: "rgba(140, 91, 230, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(140, 91, 230, 0.3)",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1A0E26",
  },
  gainerText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  gainerPercentage: {
    color: "#4CAF50",
    fontWeight: "bold",
    fontSize: 14,
  },
  trendingItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(46, 26, 64, 0)",
    paddingVertical: 4,
  },
  touchableTrendingItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(46, 26, 64, 0.8)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(140, 91, 230, 0.5)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  trendingBarInfo: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginLeft: 4,
    paddingLeft: 0,
  },
  trendingInfo: {
    flex: 1,
    marginLeft: 12,
  },
  trendingName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  marketCap: {
    color: "#A990C9",
    fontSize: 13,
  },
  trendingPriceInfo: {
    alignItems: "flex-end",
  },
  trendingPrice: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
  },
  changeContainer: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  positiveContainer: {
    backgroundColor: "rgba(76, 175, 80, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(76, 175, 80, 0.3)",
  },
  negativeContainer: {
    backgroundColor: "rgba(255, 82, 82, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(255, 82, 82, 0.3)",
  },
  trendingChange: {
    fontSize: 14,
    fontWeight: "600",
  },
  positive: {
    color: "#4CAF50",
  },
  negative: {
    color: "#FF5252",
  },
  trendingBarContainer: {
    height: 32,
    marginBottom: 8,
    borderRadius: 8,
    overflow: "hidden",
    width: "100%",
  },
  trendingBarContent: {
    display: "flex",
    paddingHorizontal: 6,
    alignItems: "center",
    height: "100%",
  },
  trendingBarLeftContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  trendingBarIndex: {
    color: "#A990C9",
    fontSize: 12,
    fontWeight: "700",
    marginRight: 6,
  },
  trendingBarItem: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginHorizontal: 3,
    backgroundColor: "rgba(46, 26, 64, 0.9)",
    borderRadius: 8,
    height: 26,
    color: "white",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "rgba(140, 91, 230, 0.2)",
  },
  trendingBarAvatar: {
    width: 18,
    height: 18,
    borderRadius: 9,
    marginRight: 4,
    backgroundColor: "#1A0E26",
    borderWidth: 1,
    borderColor: "rgba(140, 91, 230, 0.3)",
  },
  trendingBarSymbol: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    marginRight: 5,
  },
  trendingBarChange: {
    fontSize: 11,
    fontWeight: "600",
  },
  trendingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  promoteButton: {
    backgroundColor: "rgba(46, 26, 64, 0.8)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(140, 91, 230, 0.6)",
    alignSelf: "center",
  },
  promoteButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  // Buy Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: width * 0.9,
    maxHeight: "80%",
    backgroundColor: "#221133",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(140, 91, 230, 0.5)",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "rgba(46, 26, 64, 0.9)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(140, 91, 230, 0.3)",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#E0E0E0",
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(140, 91, 230, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    padding: 16,
  },
  tokenInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(140, 91, 230, 0.3)",
    backgroundColor: "rgba(26, 14, 38, 0.6)",
  },
  modalTokenImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: "#1A0E26",
  },
  modalTokenName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#E0E0E0",
    marginBottom: 4,
  },
  modalTokenPrice: {
    fontSize: 16,
    color: "#9B86B3",
  },
  orderTypeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    backgroundColor: "rgba(26, 14, 38, 0.6)",
    borderRadius: 12,
    padding: 4,
  },
  orderTypeButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  activeOrderType: {
    backgroundColor: "#8C5BE6",
    paddingHorizontal: 10,
  },
  orderTypeText: {
    color: "#9B86B3",
    fontSize: 14,
    fontWeight: "600",
  },
  activeOrderTypeText: {
    color: "#FFFFFF",
  },
  inputLabel: {
    color: "#E0E0E0",
    fontSize: 16,
    marginBottom: 8,
    marginTop: 12,
  },
  inputContainer: {
    backgroundColor: "rgba(26, 14, 38, 0.6)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(140, 91, 230, 0.3)",
    marginBottom: 16,
    position: "relative",
  },
  input: {
    color: "#E0E0E0",
    padding: 12,
    fontSize: 16,
  },
  inputPrefix: {
    position: "absolute",
    left: 12,
    top: 12,
    color: "#9B86B3",
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(140, 91, 230, 0.3)",
    marginVertical: 16,
  },
  toggleContainer: {
    marginBottom: 16,
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  toggleLabel: {
    color: "#E0E0E0",
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: "#8C5BE6",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingButton: {
    opacity: 0.7,
  },
});

export default Explore;
