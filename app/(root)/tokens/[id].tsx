import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LineChart } from "react-native-chart-kit";
import { formatNumber, formatPrice } from "@/utils/numbers";

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

// Update the chartData object
const chartData = {
  labels: ["5M", "1H", "6H", "1D"],
  datasets: [
    {
      data: dummyPriceData.chartData["5M"],
      color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
      strokeWidth: 2,
    },
  ],
};

const TokenDetails = () => {
  const { token, tokenInfo } = useLocalSearchParams();
  //@ts-ignore
  const tokenData = JSON.parse(token);
  //@ts-ignore
  const tokenInfoData = JSON.parse(tokenInfo);

  const isEth = tokenData.relationships.base_token.data.id.startsWith("eth_");
  const name = isEth
    ? tokenInfoData?.tokenName
    : tokenInfoData?.data.name || "";
  const symbol = isEth
    ? tokenInfoData?.tokenSymbol
    : tokenInfoData?.data.symbol || "";
  const price = tokenData.attributes.base_token_price_usd;
  const logo = isEth
    ? tokenInfoData?.tokenLogo
    : tokenInfoData?.type === "jupiter"
    ? tokenInfoData?.data.logoURI
    : tokenInfoData?.data.logo || "";
  const mCap = tokenData.attributes.fdv_usd;
  //@ts-ignore
  const volume = isEth ? 0 : tokenInfo.data.daily_volume;

  const router = useRouter();
  const [selectedInterval, setSelectedInterval] =
    useState<keyof typeof dummyPriceData.chartData>("5M");

  const intervals = ["5M", "1H", "6H", "1D"];

  const change = useMemo(() => {
    if (selectedInterval === "5M")
      return tokenData.attributes.price_change_percentage.m5;
    else if (selectedInterval === "1H")
      return tokenData.attributes.price_change_percentage.h1;
    else if (selectedInterval === "6H")
      return tokenData.attributes.price_change_percentage.h6;
    else if (selectedInterval === "1D")
      return tokenData.attributes.price_change_percentage.h24;
  }, [selectedInterval]);

  return (
    <SafeAreaView style={styles.container}>
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
        <LineChart
          data={{
            ...chartData,
            datasets: [
              {
                ...chartData.datasets[0],
                data: dummyPriceData.chartData[selectedInterval],
              },
            ],
          }}
          width={width - 40}
          height={220}
          chartConfig={{
            backgroundColor: "#1A231E",
            backgroundGradientFrom: "#1A231E",
            backgroundGradientTo: "#1A231E",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(229, 229, 229, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(229, 229, 229, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: "4",
              strokeWidth: "2",
              stroke: "#4CAF50",
            },
          }}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
        />

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

      <TouchableOpacity style={styles.actionButton}>
        <Text style={styles.actionButtonText}>Buy</Text>
      </TouchableOpacity>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  backButton: {
    position: "absolute",
    top: 0,
    left: -34,
    marginTop: 8,
    marginBottom: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 17,
    marginLeft: 20,
  },
  tokenInfo: {
    flexDirection: "row",
    alignItems: "center",
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
});

export default TokenDetails;
