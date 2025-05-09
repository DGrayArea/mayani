import FilterModal from "@/components/FilterModal";
import React, { useState, useEffect, useMemo } from "react";
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
import { useRefreshByUser } from "@/hooks/useRefreshByUser";
import { useRefreshOnFocus } from "@/hooks/useRefreshOnFocus";
import { useQuery } from "@tanstack/react-query";
import { fetchNew } from "@/utils/query";
import { PumpShot, BirdEyeNewListing, DexBirdeye } from "@/types";
import { formatNumber, getRelativeTime } from "@/utils/numbers";
import axios from "axios";
// import { Link, router } from "expo-router";
// import { config } from "@/lib/appwrite";
import { fetchDexDataMain } from "@/utils/token-tools";

const NewListings = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [selectedToken, setSelectedToken] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");
  const [isLimitOrder, setIsLimitOrder] = useState(false);
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

  const { isPending, error, data, refetch } = useQuery<{
    data: BirdEyeNewListing[];
  }>({
    queryKey: ["newlyCreated"],
    queryFn: fetchNew,
    refetchInterval: 50000,
    refetchIntervalInBackground: false,
  });
  const { isRefetchingByUser, refetchByUser } = useRefreshByUser(refetch);
  useRefreshOnFocus(refetch);

  const [tokenData, setTokenData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const FALLBACK_IMAGE = "https://via.placeholder.com/40";

  const fetchMetadata = async (uri: string) => {
    try {
      const response = await axios.get(uri);
      return response.data.image;
    } catch (error) {
      // console.error("Error fetching metadata:", error);
      return FALLBACK_IMAGE;
    }
  };

  const getFilteredTokens = useMemo(() => {
    if (data) {
      switch (selectedCategory) {
        case "pumpfun":
          return data.data.filter((token) => token.source === "pump_dot_fun");
        case "moonshot":
          return data.data.filter((token) => token.source !== "pump_dot_fun");
        default:
          return data.data;
      }
    } else {
      return [];
    }
  }, [data]);

  // const handleSubmitOrder = useCallback(async () => {
  //   const tokenAddress = token.relationships.base_token.data.id.startsWith(
  //     "solana_"
  //   )
  //     ? token.relationships.base_token.data.id.slice(7)
  //     : token.relationships.base_token.data.id.startsWith("eth_")
  //       ? token.relationships.base_token.data.id.slice(4)
  //       : token.relationships.base_token.data.id;

  //   if (!amount || parseFloat(amount) <= 0) {
  //     Alert.alert("Error", "Please enter a valid amount");
  //     return;
  //   }

  //   setLoading(true);
  //   try {
  //     if (token.isEth) {
  //       if (Number(getBalance("eth")) > Number(nativeEquivalent.native)) {
  //         const txid = await get0xPermit2Swap(
  //           "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
  //           tokenAddress,
  //           Number(amount) * 10 ** Number(token.decimals),
  //           ethWalletAddress,
  //           privateKey!
  //         );
  //         // Show success message
  //         Alert.alert(
  //           "Success",
  //           `Swap completed successfully: https://etherscan.io/tx/${txid?.hash}`
  //         );
  //       } else {
  //         Alert.alert(
  //           "Error",
  //           "Insufficient balance for the swap amount or no swap route found"
  //         );
  //       }
  //     } else {
  //       if (Number(getBalance("sol")) > Number(nativeEquivalent.native)) {
  //         const txid = await swapWithJupiter(
  //new Connection(config.heliusUrl),
  // new Connection("https://api.mainnet-beta.solana.com"),
  //           "So11111111111111111111111111111111111111112",
  //           tokenAddress,
  //           String(Number(amount) * 10 ** Number(token.decimals)),
  //           solPrivateKey!
  //         );
  //         Alert.alert(
  //           `Success", "Swap completed successfully https://solscan.io/tx/${txid}`
  //         );
  //       } else {
  //         Alert.alert(
  //           "Error",
  //           "Insufficient balance for the swap amount or no swap route found"
  //         );
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Swap error:", error);
  //     Alert.alert(
  //       "Error",
  //       "Failed to complete swap due to insufficient gas or allowance"
  //     );
  //   } finally {
  //     setLoading(false);
  //     resetForm();
  //     onClose();
  //   }
  // }, [
  //   amount,
  //   privateKey,
  //   solPrivateKey,
  //   solWalletAddress,
  //   ethWalletAddress,
  //   nativeEquivalent,
  //   config,
  //   price,
  //   orderType,
  //   token,
  //   enableStopLoss,
  //   enableTakeProfit,
  //   stopLossPrice,
  //   takeProfitPrice,
  // ]);
  const RenderTokenCard = React.memo(
    ({ item, loading }: { item: DexBirdeye; loading: boolean }) => {
      if (loading) {
        return (
          <View className="p-4 rounded-2xl bg-[#2E1A40] animate-pulse mb-6">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-[#7B51E0]" />
              <View className="ml-3">
                <View className="w-24 h-4 bg-[#7B51E0] rounded-md" />
                <View className="w-16 h-3 bg-[#7B51E0] rounded-md mt-2" />
              </View>
            </View>

            <View className="mt-4 space-y-2 flex flex-row justify-between">
              {Array.from({ length: 3 }).map((_, i) => (
                <View key={i} className="w-20 h-5 bg-[#7B51E0] rounded-md" />
              ))}
            </View>

            <View className="w-24 h-4 bg-[#7B51E0] rounded-md mt-5" />
            <View className="w-full h-10 bg-[#7B51E0] rounded-full mt-3" />
          </View>
        );
      } else {
        return (
          <View style={styles.tokenCard}>
            <View style={styles.tokenHeader}>
              <View style={styles.tokenIdentity}>
                <Image
                  source={{
                    uri: item?.logoURI || FALLBACK_IMAGE,
                    cache: "reload",
                  }}
                  style={styles.tokenIcon}
                />
                <View>
                  <Text style={styles.tokenName}>{item.name}</Text>
                  <Text style={styles.tokenSymbol}>{item.symbol}</Text>
                </View>
              </View>
              <View style={styles.categoryTag}>
                <Text style={styles.categoryText}>
                  {item?.source === "pump_dot_fun"
                    ? "🚀 PumpFun"
                    : `🔁 ${item?.source?.replace(/_/g, " ")}`}
                </Text>
              </View>
            </View>

            <View style={styles.tokenMetrics}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Price</Text>
                <Text style={styles.metricValue}>
                  $ {item?.dex?.priceUsd ? item?.dex?.priceUsd : 0.0}
                </Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Change</Text>
                <Text
                  style={[
                    styles.metricValue,
                    item?.dex?.priceChange.m5 > 0
                      ? styles.changePositive
                      : styles.changeNegative,
                  ]}
                >
                  {item?.dex?.priceChange?.m5 > 0 ? "+" : ""}
                  {item?.dex?.priceChange?.m5
                    ? item?.dex?.priceChange.m5.toLocaleString()
                    : "0.00%"}
                </Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Liquidity</Text>
                <Text style={styles.metricValue}>
                  $
                  {item?.dex?.liquidity?.usd
                    ? item?.dex?.liquidity.usd.toLocaleString()
                    : "0.00"}
                </Text>
              </View>
            </View>

            <View style={styles.tokenFooter}>
              <Text style={styles.launchTime}>
                Listed {getRelativeTime(item.liquidityAddedAt)}
              </Text>
              {/* <Text style={styles.holders}>{item.holders} holders</Text> */}
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
      }
    }
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
          setSelectedToken(item);
          setShowBuyModal(true);
        }}
      >
        <Text style={styles.dethroneButtonText}>Trade Now</Text>
      </TouchableOpacity>
    </View>
  );

  const RenderMoonshotCard = React.memo(
    ({ item, loading }: { item: DexBirdeye; loading: boolean }) => {
      if (loading) {
        return (
          <>
            <View style={styles.dethroneCard}>
              <View style={styles.dethroneHeader}>
                <View style={styles.tokenIdentity}>
                  <Image
                    source={{
                      uri: item?.logoURI?.startsWith("https://ipfs.io/ipfs/")
                        ? item?.logoURI?.replace(
                            "https://ipfs.io/ipfs/",
                            "https://pump.mypinata.cloud/ipfs/"
                          )
                        : item?.logoURI || FALLBACK_IMAGE,
                      cache: "reload",
                    }}
                    style={styles.tokenIcon}
                  />
                  <View>
                    <Text style={styles.dethroneName}>
                      {String(item?.name)?.length > 20
                        ? item?.name.slice(0, 20) + "..."
                        : item?.name}
                    </Text>
                    <Text style={styles.dethroneAchievement}>
                      {item.symbol}
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    item.source === "pump_dot_fun"
                      ? styles.categoryTag
                      : styles.dethroneCategoryTag,
                  ]}
                >
                  <Text style={styles.dethroneCategoryText}>
                    {item.source === "pump_dot_fun"
                      ? "🚀 PumpFun"
                      : `🔁 ${item?.source?.replace(/_/g, " ")}`}
                  </Text>
                </View>
              </View>

              <View style={styles.tokenMetrics}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Price</Text>
                  <View className="w-24 h-4 bg-[#7B51E0] rounded-md animate-pulse" />
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Change</Text>
                  <View className="w-24 h-4 bg-[#7B51E0] rounded-md animate-pulse" />
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Mcap</Text>
                  <View className="w-24 h-4 bg-[#7B51E0] rounded-md animate-pulse" />
                </View>
              </View>

              <View style={styles.tokenFooter}>
                <Text style={styles.launchTime}>
                  Listed {getRelativeTime(item.liquidityAddedAt)}
                </Text>
                {/* <Text style={styles.holders}>{item.holders} holders</Text> */}
              </View>

              <TouchableOpacity
                style={styles.dethroneButton}
                onPress={() => {
                  setSelectedToken(item);
                  setShowBuyModal(true);
                }}
              >
                <Text style={styles.dethroneButtonText}>Trade Now</Text>
              </TouchableOpacity>
            </View>
          </>
        );
      } else {
        return (
          <View style={styles.dethroneCard}>
            <View style={styles.dethroneHeader}>
              <View style={styles.tokenIdentity}>
                <Image
                  source={{
                    uri: item?.logoURI?.startsWith("https://ipfs.io/ipfs/")
                      ? item?.logoURI?.replace(
                          "https://ipfs.io/ipfs/",
                          "https://pump.mypinata.cloud/ipfs/"
                        )
                      : item?.logoURI || FALLBACK_IMAGE,
                    cache: "reload",
                  }}
                  style={styles.tokenIcon}
                />
                <View>
                  <Text style={styles.dethroneName}>
                    {String(item.name).length > 20
                      ? item.name.slice(0, 20) + "..."
                      : item.name}
                  </Text>
                  <Text style={styles.dethroneAchievement}>{item.symbol}</Text>
                </View>
              </View>
              <View
                style={[
                  item.source === "pump_dot_fun"
                    ? styles.categoryTag
                    : styles.dethroneCategoryTag,
                ]}
              >
                <Text style={styles.dethroneCategoryText}>
                  {item.source === "pump_dot_fun"
                    ? "🚀 PumpFun"
                    : `🔁 ${item?.source?.replace(/_/g, " ")}`}
                </Text>
              </View>
            </View>

            <View style={styles.tokenMetrics}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Price</Text>
                <Text style={styles.metricValue}>
                  $ {item?.dex?.priceUsd ? item?.dex?.priceUsd : 0.0}
                </Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Change</Text>
                <Text
                  style={[
                    styles.metricValue,
                    item?.dex?.priceChange.m5 > 0
                      ? styles.changePositive
                      : styles.changeNegative,
                  ]}
                >
                  {item?.dex?.priceChange?.m5 > 0 ? "+" : "-"}
                  {item?.dex?.priceChange?.m5
                    ? item?.dex?.priceChange.m5.toLocaleString()
                    : "0.00%"}
                </Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Mcap</Text>
                <Text style={styles.metricValue}>
                  ${item?.dex?.fdv ? formatNumber(item?.dex?.fdv) : "0.00"}
                </Text>
              </View>
            </View>

            <View style={styles.tokenFooter}>
              <Text style={styles.launchTime}>
                Listed {getRelativeTime(item.liquidityAddedAt)}
              </Text>
              {/* <Text style={styles.holders}>{item.holders} holders</Text> */}
            </View>

            <TouchableOpacity
              style={styles.dethroneButton}
              onPress={() => {
                setSelectedToken(item);
                setShowBuyModal(true);
              }}
            >
              <Text style={styles.dethroneButtonText}>Trade Now</Text>
            </TouchableOpacity>
          </View>
        );
      }
    }
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

  const nativeEquivalent = useMemo(() => {
    if (!selectedToken) return { native: 0, usd: 0 };

    const tokenPriceInUsd = Number(selectedToken.price) || 0;
    const tokenAmount = Number(amount) || 0;

    const totalUsd = tokenPriceInUsd * tokenAmount;

    const ethPriceInUsd = Number(prices.eth) || 1;
    const solPriceInUsd = Number(prices.sol) || 1;
    const native = (totalUsd / solPriceInUsd).toFixed(4);

    return {
      native: Number(native),
      usd: Number(totalUsd.toFixed(2)),
    };
  }, []);

  useEffect(() => {
    if (getFilteredTokens && getFilteredTokens.length > 0) {
      const getNew = async () => {
        setLoading(true);
        const dexPairs = await fetchDexDataMain(getFilteredTokens);
        const dataMap: Record<string, any> = {};
        for (const pair of Object.values(dexPairs)) {
          const baseAddr = (
            pair as {
              baseToken?: { address?: string };
              quoteToken?: { address?: string };
            }
          )?.baseToken?.address;
          const quoteAddr = (
            pair as {
              baseToken?: { address?: string };
              quoteToken?: { address?: string };
            }
          )?.quoteToken?.address;
          if (baseAddr) dataMap[baseAddr] = pair;
          if (quoteAddr) dataMap[quoteAddr] = pair;
        }
        const orderedData = getFilteredTokens.map((t) => ({
          ...t,
          dex: dataMap[t.address] || null,
        }));
        const filt = orderedData.filter((order) => order.dex !== null);
        setTokenData(filt);
        setLoading(false);
      };

      getNew();
    }
  }, [getFilteredTokens]);
  // console.log(JSON.stringify(tokenData[0], null, 2));
  // tokenData?.map((token) => console.log(JSON.stringify(token.dex, null, 2)));
  if (isPending) {
    return <LoadingIndicator />;
  }
  // console.log(tokenData);
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
              🔁 Other Dexs
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
        {getFilteredTokens?.length > 0 ? (
          <FlatList
            data={getFilteredTokens.slice(0, 30)}
            renderItem={({ item }) => {
              const enriched = tokenData.find(
                (t) => t.address === item.address
              );
              const mergedItem = enriched || item;
              const isLoading = !enriched;

              return (
                <RenderMoonshotCard item={mergedItem} loading={isLoading} />
              );
            }}
            keyExtractor={(item) =>
              `${item.source}-${item.symbol}-${item.address}`
            }
            scrollEnabled={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefetchingByUser}
                onRefresh={refetchByUser}
              />
            }
            ListEmptyComponent={() => (
              <View className="p-4 rounded-2xl bg-[#2E1A40]  animate-pulse mb-6">
                <View className="flex-row items-center">
                  <View className="w-10 h-10 rounded-full bg-[#7B51E0]" />
                  <View className="ml-3">
                    <View className="w-24 h-4 bg-[#7B51E0] rounded-md" />
                    <View className="w-16 h-3 bg-[#7B51E0] rounded-md mt-2" />
                  </View>
                </View>

                <View className="mt-4 space-y-2 flex flex-row justify-between">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <View
                      key={i}
                      className="w-20 h-5 bg-[#7B51E0] rounded-md"
                    />
                  ))}
                </View>

                <View className="w-24 h-4 bg-[#7B51E0] rounded-md mt-5" />
                <View className="w-full h-10 bg-[#7B51E0] rounded-full mt-3" />
              </View>
            )}
          />
        ) : null}

        {/* <Text style={styles.sectionTitle}>Dethrone Kings 👑</Text> */}
        {/* <FlatList
          data={dethroneTokens}
          renderItem={renderDethroneCard}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        /> */}
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

              {/* <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Price</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter price"
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="numeric"
                />
              </View> */}

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Total Amount</Text>
                <View style={styles.input}>
                  <Text className="text-white">
                    {nativeEquivalent.native} {true ? "ETH" : "SOL"}
                  </Text>
                </View>
              </View>
              <Text
                style={{ color: "#E0E0E0", fontSize: 18, marginBottom: 10 }}
              >
                ≃${nativeEquivalent.usd.toFixed(2)}
              </Text>

              <View style={styles.orderTypeContainer}>
                <TouchableOpacity
                  style={[
                    styles.orderTypeButton,
                    !isLimitOrder && styles.activeOrderType,
                  ]}
                  onPress={() => setIsLimitOrder(false)}
                >
                  <Text
                    style={[
                      styles.orderTypeText,
                      !isLimitOrder && styles.activeOrderTypeText,
                    ]}
                  >
                    Market
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.orderTypeButton,
                    isLimitOrder && styles.activeOrderType,
                  ]}
                  onPress={() => setIsLimitOrder(true)}
                  disabled={true}
                >
                  <Text
                    style={[
                      styles.orderTypeText,
                      isLimitOrder && styles.activeOrderTypeText,
                    ]}
                  >
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
    textTransform: "capitalize",
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
  changeNegative: {
    color: "#FF5252",
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
