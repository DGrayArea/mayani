import FilterModal from "@/components/FilterModal";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import SkeletonLoader from "@/components/SkeletonLoader";
import { useRefreshByUser } from "@/hooks/useRefreshByUser";
import { useRefreshOnFocus } from "@/hooks/useRefreshOnFocus";
import { formatNumber, formatPrice } from "@/utils/numbers";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";
import { TrendingToken2 } from "@/types";
import { fetchTrending } from "@/utils/query";

const Explore = () => {
  const [selectedFilter, setSelectedFilter] = useState("all");

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

  const mergedData = useMemo(() => {
    if (data) {
      const filteredData = data.data.filter((item) => {
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
        return false;
      });

      return filteredData.sort(
        (a, b) =>
          parseFloat(b.attributes.price_change_percentage.h24) -
          parseFloat(a.attributes.price_change_percentage.h24)
      );
    }
    return [];
  }, [data, selectedFilter]);

  const filteredTopGainers = useMemo(() => {
    return mergedData.filter(
      (item) => parseFloat(item.attributes.price_change_percentage.h24) > 0
    );
  }, [mergedData]);

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
    </View>
  );

  const renderTopGainers = ({ item }: any) => {
    const isEth = item.relationships.base_token.data.id.startsWith("eth_");
    const tokenAddress = item.relationships.base_token.data.id.startsWith(
      "solana_"
    )
      ? item.relationships.base_token.data.id.slice(7)
      : item.relationships.base_token.data.id.startsWith("eth_")
      ? item.relationships.base_token.data.id.slice(4)
      : item.relationships.base_token.data.id;

    return (
      <TouchableOpacity style={styles.TouchableGainerCard}>
        <Link
          href={{
            pathname: "/tokens/[id]",
            params: { id: tokenAddress, token: JSON.stringify(item) },
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
                    : item.tokenInfo?.data?.name || ""}
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
        </Link>
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
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Explore</Text>

      {renderFilterButtons()}
      <FilterModal />
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top Gainers</Text>
        <FlatList
          data={filteredTopGainers}
          renderItem={renderTopGainers}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Trending</Text>
        <FlatList
          data={mergedData}
          renderItem={renderTrendingItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetchingByUser}
              onRefresh={refetchByUser}
            />
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0F0D",
    paddingHorizontal: 20,
    paddingBottom: 40, // Add padding to the bottom
  },
  header: {
    color: "#E0E0E0",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },
  filterContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: "#1A231E",
    borderWidth: 1,
    borderColor: "#2A3F33",
  },
  filterButtonActive: {
    backgroundColor: "#2A3F33",
    borderColor: "#3A5F43",
  },
  filterText: {
    color: "#8FA396",
    fontSize: 14,
    fontWeight: "600",
  },
  filterTextActive: {
    color: "#E0E0E0",
  },
  section: {
    marginTop: 5,
  },
  sectionTitle: {
    color: "#B8C3BC",
    fontSize: 20,
    marginBottom: 15,
    fontWeight: "600",
  },
  gainerCard: {
    backgroundColor: "#1A231E",
    // borderRadius: 15,
    // padding: 15,
    // marginRight: 12,
    flexDirection: "row",
    alignItems: "center",
    // borderWidth: 1,
    // borderColor: "#2A3F33",
    minWidth: 160,
  },
  TouchableGainerCard: {
    backgroundColor: "#1A231E",
    borderRadius: 15,
    padding: 15,
    marginRight: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2A3F33",
    minWidth: 180,
  },
  gainerContent: {
    flex: 1,
    marginLeft: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2A3F33",
  },
  gainerText: {
    color: "#E0E0E0",
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
    backgroundColor: "#1A231E",
    // borderRadius: 15,
    // padding: 15,
    // marginBottom: 12,
    // borderWidth: 1,
    // borderColor: "#2A3F33",
  },
  touchableTrendingItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A231E",
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#2A3F33",
  },
  trendingInfo: {
    flex: 1,
    marginLeft: 12,
  },
  trendingName: {
    color: "#E0E0E0",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  marketCap: {
    color: "#8FA396",
    fontSize: 13,
  },
  trendingPriceInfo: {
    alignItems: "flex-end",
  },
  trendingPrice: {
    color: "#E0E0E0",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  trendingChange: {
    fontSize: 14,
    fontWeight: "500",
  },
  positive: {
    color: "#4CAF50",
  },
  negative: {
    color: "#FF5252",
  },
});

export default Explore;
