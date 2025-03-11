import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Modal,
  TextInput,
  Alert,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LineChart, LineChartProvider } from "react-native-wagmi-charts";
import { formatNumber, formatPrice } from "@/utils/numbers";
import BuyModal from "@/components/dialog/BuyModal";

export const unstable_settings = {
  headerShown: false,
};

const { width } = Dimensions.get("window");

// Dummy price data
const dummyPriceData = {
  current: 29850.27,
  change: 5.24,
  chartData: {
    "5M": [29750, 29800, 29600, 29900, 29850, 29950],
    "1H": [28500, 29000, 29200, 29600, 29800, 29850],
    "6H": [27000, 28000, 28500, 29000, 29500, 29850],
    "1D": [25000, 26000, 27000, 28000, 29000, 29850],
    // "1Y": [20000, 22000, 24000, 26000, 28000, 29850],
  },
};

// Dummy statistics
const dummyStats = {
  marketCap: "565.4B",
  volume24h: "32.1B",
  circulatingSupply: "19.5M",
  totalSupply: "21M",
  rank: "#1",
};

// fallback constants
const FALLBACK_DATA = {
  name: "Unknown Token",
  symbol: "???",
  logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Question_Mark.svg/1200px-Question_Mark.svg.png",
  price: 0,
  marketCap: 0,
  volume: Math.floor(Math.random() * 1000000), // Random volume up to 1M
  changePercentages: {
    m5: (Math.random() * 20 - 10).toFixed(2), // Random between -10 and +10
    h1: (Math.random() * 30 - 15).toFixed(2), // Random between -15 and +15
    h6: (Math.random() * 40 - 20).toFixed(2), // Random between -20 and +20
    h24: (Math.random() * 50 - 25).toFixed(2), // Random between -25 and +25
  },
};

const TokenDetails = () => {
  const { token } = useLocalSearchParams();
  const [buyModalVisible, setBuyModalVisible] = useState(false);

  const tokenData = React.useMemo(() => {
    try {
      return JSON.parse(token as string);
    } catch (e) {
      return null;
    }
  }, [token]);

  const tokenInfoData = React.useMemo(() => {
    return tokenData?.tokenInfo || null;
  }, [tokenData]);

  const isEth =
    tokenData?.relationships?.base_token?.data?.id?.startsWith("eth_") || false;

  const name = React.useMemo(() => {
    if (!tokenInfoData) return FALLBACK_DATA.name;
    return isEth
      ? tokenInfoData?.tokenName
      : tokenInfoData?.data?.name || FALLBACK_DATA.name;
  }, [tokenInfoData, isEth]);

  const symbol = React.useMemo(() => {
    if (!tokenInfoData) return FALLBACK_DATA.symbol;
    return isEth
      ? tokenInfoData?.tokenSymbol
      : tokenInfoData?.data?.symbol || FALLBACK_DATA.symbol;
  }, [tokenInfoData, isEth]);

  const price = React.useMemo(() => {
    return tokenData?.attributes?.base_token_price_usd || FALLBACK_DATA.price;
  }, [tokenData]);

  const logo = React.useMemo(() => {
    if (!tokenInfoData) return FALLBACK_DATA.logo;
    if (isEth) return tokenInfoData?.tokenLogo || FALLBACK_DATA.logo;
    return tokenInfoData?.type === "jupiter"
      ? tokenInfoData?.data?.logoURI
      : tokenInfoData?.type === "pool"
        ? tokenInfoData?.data?.logoURI
        : tokenInfoData?.data?.logo || FALLBACK_DATA.logo;
  }, [tokenInfoData, isEth]);

  const mCap = React.useMemo(() => {
    return tokenData?.attributes?.fdv_usd || FALLBACK_DATA.marketCap;
  }, [tokenData]);

  const volume = React.useMemo(() => {
    if (isEth) {
      return Math.floor(Math.random() * 10000000) + 1000000; // Random between 1M and 11M
    }
    return (
      tokenInfoData?.data?.daily_volume ||
      Math.floor(Math.random() * 10000000) + 1000000
    );
  }, [isEth, tokenInfoData]);

  const router = useRouter();
  const [selectedInterval, setSelectedInterval] =
    useState<keyof typeof dummyPriceData.chartData>("5M");

  const intervals = ["5M", "1H", "6H", "1D"];

  const chartData = useMemo(
    () =>
      dummyPriceData.chartData[selectedInterval].map((value, index) => ({
        timestamp:
          Date.now() -
          (dummyPriceData.chartData[selectedInterval].length - 1 - index) *
            60000,
        value,
      })),
    [selectedInterval]
  );

  const change = useMemo(() => {
    if (!tokenData?.attributes?.price_change_percentage) {
      return FALLBACK_DATA.changePercentages[
        selectedInterval.toLowerCase() as keyof typeof FALLBACK_DATA.changePercentages
      ];
    }

    switch (selectedInterval) {
      case "5M":
        return (
          tokenData.attributes.price_change_percentage.m5 ||
          FALLBACK_DATA.changePercentages.m5
        );
      case "1H":
        return (
          tokenData.attributes.price_change_percentage.h1 ||
          FALLBACK_DATA.changePercentages.h1
        );
      case "6H":
        return (
          tokenData.attributes.price_change_percentage.h6 ||
          FALLBACK_DATA.changePercentages.h6
        );
      case "1D":
        return (
          tokenData.attributes.price_change_percentage.h24 ||
          FALLBACK_DATA.changePercentages.h24
        );
      default:
        return FALLBACK_DATA.changePercentages.h24;
    }
  }, [selectedInterval, tokenData]);

  const [buyAmount, setBuyAmount] = useState<string>("");
  const [calculatedTokens, setCalculatedTokens] = useState<number>(0);
  const [amountType, setAmountType] = useState<"SOL" | "USD">("SOL");

  const calculateTokenAmount = (inputAmount: string) => {
    const amount = parseFloat(inputAmount);
    if (isNaN(amount) || amount <= 0) {
      setCalculatedTokens(0);
      return;
    }

    const tokenAmount =
      amountType === "USD" ? amount / price : (amount * 30) / price; // Assuming 1 SOL = $30 USD

    setCalculatedTokens(tokenAmount);
  };

  const handlePurchase = () => {
    const amount = parseFloat(buyAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid amount");
      return;
    }

    Alert.alert(
      "Confirm Purchase",
      `Are you sure you want to buy ${calculatedTokens.toFixed(
        4
      )} ${symbol} for ${amount} ${amountType}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Confirm",
          onPress: () => {
            Alert.alert(
              "Success!",
              `Successfully purchased ${calculatedTokens.toFixed(
                4
              )} ${symbol} for ${amount} ${amountType}`,
              [
                {
                  text: "OK",
                  onPress: () => {
                    setBuyModalVisible(false);
                    setBuyAmount("");
                    setCalculatedTokens(0);
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const BuuyModal = () => (
    <Modal
      visible={isBuyModalVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setIsBuyModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Buy {symbol}</Text>
            <TouchableOpacity onPress={() => setIsBuyModalVisible(false)}>
              <Ionicons name="close" size={24} color="#E0E0E0" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter amount"
              placeholderTextColor="#8FA396"
              keyboardType="decimal-pad"
              value={buyAmount}
              onChangeText={(text) => {
                setBuyAmount(text);
                calculateTokenAmount(text);
              }}
            />
            {calculatedTokens > 0 && (
              <Text style={styles.estimatedTokens}>
                ≈ {calculatedTokens.toFixed(4)} {symbol}
              </Text>
            )}
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  amountType === "SOL" && styles.toggleButtonActive,
                ]}
                onPress={() => {
                  setAmountType("SOL");
                  calculateTokenAmount(buyAmount);
                }}
              >
                <Text
                  style={[
                    styles.toggleText,
                    amountType === "SOL" && styles.toggleTextActive,
                  ]}
                >
                  SOL
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  amountType === "USD" && styles.toggleButtonActive,
                ]}
                onPress={() => {
                  setAmountType("USD");
                  calculateTokenAmount(buyAmount);
                }}
              >
                <Text
                  style={[
                    styles.toggleText,
                    amountType === "USD" && styles.toggleTextActive,
                  ]}
                >
                  USD
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.buyButton,
              !calculatedTokens && styles.buyButtonDisabled,
            ]}
            onPress={handlePurchase}
            disabled={!calculatedTokens}
          >
            <Text style={styles.buyButtonText}>Confirm Purchase</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={[styles.container, { paddingTop: 0 }]}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: 0 }]}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={28} color="#E0E0E0" />
          </TouchableOpacity>

          <View style={styles.tokenInfo}>
            <Image
              source={{
                uri: logo,
              }}
              style={styles.avatar}
            />
            <View style={styles.tokenTextInfo}>
              <Text style={styles.tokenName}>{name}</Text>
              <Text style={styles.tokenSymbol}>{symbol}</Text>
            </View>
          </View>
        </View>

        <View style={styles.priceSection}>
          <Text style={styles.currentPrice}>${formatPrice(price)}</Text>
          <Text
            style={[
              styles.priceChange,
              change < 0 ? styles.negative : styles.positive,
            ]}
          >
            {change > 0 ? "+" : ""}
            {change}%
          </Text>
        </View>

        <View style={styles.chartContainer}>
          <LineChartProvider data={chartData}>
            <LineChart
              width={width - 60}
              height={220}
              style={{
                backgroundColor: "#1A231E",
              }}
            >
              <LineChart.Path color="#4CAF50" width={2}>
                <LineChart.Gradient />
              </LineChart.Path>
              <LineChart.CursorCrosshair color="#4CAF50" />
            </LineChart>
          </LineChartProvider>

          <View style={styles.intervalContainer}>
            {intervals.map((interval) => (
              <TouchableOpacity
                key={interval}
                style={[
                  styles.intervalButton,
                  selectedInterval === interval && styles.intervalButtonActive,
                ]}
                onPress={() =>
                  setSelectedInterval(
                    interval as keyof typeof dummyPriceData.chartData
                  )
                }
              >
                <Text
                  style={[
                    styles.intervalText,
                    selectedInterval === interval && styles.intervalTextActive,
                  ]}
                >
                  {interval}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Market Cap</Text>
            <Text style={styles.statValue}>${formatNumber(mCap)}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>24h Volume</Text>
            <Text style={styles.statValue}>${formatNumber(volume)}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Circulating Supply</Text>
            <Text style={styles.statValue}>{dummyStats.circulatingSupply}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Total Supply</Text>
            <Text style={styles.statValue}>{dummyStats.totalSupply}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Rank</Text>
            <Text style={styles.statValue}>{dummyStats.rank}</Text>
          </View>
        </View>

        <BuyModal symbol={symbol} price={price} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    marginTop: 20,
    backgroundColor: "#1A231E",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2A3F33",
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  actionButtonText: {
    color: "#8FA396",
    fontSize: 16,
    fontWeight: "bold",
  },
  container: {
    flex: 1,
    backgroundColor: "#0A0F0D",
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  backButton: {
    position: "absolute",
    top: 0,
    left: 0,
    marginTop: 8,
    marginBottom: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 17,
  },
  tokenInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 40, // Adjusted to ensure the back button is not cropped
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 30,
    backgroundColor: "#2A3F33",
    marginRight: 5,
  },
  tokenTextInfo: {
    marginLeft: 10,
  },
  tokenName: {
    color: "#E0E0E0",
    fontSize: 20,
    fontWeight: "bold",
  },
  tokenSymbol: {
    color: "#8FA396",
    fontSize: 14,
  },
  priceSection: {
    marginBottom: 0,
  },
  currentPrice: {
    color: "#E0E0E0",
    fontSize: 30,
    fontWeight: "bold",
  },
  priceChange: {
    color: "#4CAF50",
    fontSize: 18,
    fontWeight: "600",
  },
  priceChangeNegative: {
    color: "#FF5252",
    fontSize: 18,
    fontWeight: "600",
  },
  chartContainer: {
    marginVertical: 20,
    backgroundColor: "#1A231E",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#2A3F33",
  },
  intervalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  intervalButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#1A231E",
  },
  intervalButtonActive: {
    backgroundColor: "#2A3F33",
  },
  intervalText: {
    color: "#8FA396",
    fontSize: 14,
    fontWeight: "600",
  },
  intervalTextActive: {
    color: "#E0E0E0",
  },
  statsContainer: {
    marginTop: 20,
    padding: 20,
    backgroundColor: "#1A231E",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#2A3F33",
  },
  statItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  statLabel: {
    color: "#8FA396",
    fontSize: 14,
  },
  statValue: {
    color: "#E0E0E0",
    fontSize: 14,
    fontWeight: "600",
  },
  positive: {
    color: "#4CAF50",
  },
  negative: {
    color: "#FF5252",
  },
  "statItem:last-child": {
    marginBottom: 0,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#1A231E",
    borderRadius: 16,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    color: "#E0E0E0",
    fontSize: 18,
    fontWeight: "bold",
  },
  inputContainer: {
    marginBottom: 20,
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#2A3F33",
    alignItems: "center",
    marginHorizontal: 5,
  },
  toggleButtonActive: {
    backgroundColor: "#4CAF50",
  },
  toggleText: {
    color: "#8FA396",
    fontSize: 14,
    fontWeight: "600",
  },
  toggleTextActive: {
    color: "#E0E0E0",
  },
  buyButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  buyButtonDisabled: {
    backgroundColor: "#2A3F33",
    opacity: 0.5,
  },
  input: {
    backgroundColor: "#2A3F33",
    borderRadius: 8,
    padding: 12,
    color: "#E0E0E0",
    fontSize: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  buyButtonText: {
    color: "#E0E0E0",
    fontSize: 16,
    fontWeight: "bold",
  },
  estimatedTokens: {
    color: "#8FA396",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 16,
  },
});

export default TokenDetails;
