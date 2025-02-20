import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchTrending } from "@/utils/query";
import { Ionicons } from "@expo/vector-icons";
import { TrendingToken2 } from "@/types";
import { formatNumber, formatPrice } from "@/utils/numbers";

export default function Search() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data } = useQuery<{ data: TrendingToken2[] }>({
    queryKey: ["trending"],
    queryFn: fetchTrending,
  });

  const filteredTokens = useMemo(() => {
    if (!data?.data || !searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase().trim();
    return data.data.filter((token) => {
      const name = token.tokenInfo?.data?.name?.toLowerCase() || "";
      const symbol = token.tokenInfo?.data?.symbol?.toLowerCase() || "";
      const address = token.relationships.base_token.data.id.toLowerCase();

      return (
        name.includes(query) ||
        symbol.includes(query) ||
        address.includes(query)
      );
    });
  }, [data, searchQuery]);

  const renderToken = ({ item }: { item: TrendingToken2 }) => {
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
        style={styles.tokenItem}
        onPress={() => {
          router.push({
            pathname: "/tokens/[id]",
            params: { id: tokenAddress, token: JSON.stringify(item) },
          });
        }}
      >
        <Image
          source={{
            uri: isEth
              ? //@ts-ignore
                item.tokenInfo?.tokenLogo
              : item.tokenInfo?.type === "jupiter"
              ? item.tokenInfo?.data?.logoURI
              : item.tokenInfo?.data?.logo || "/api/image/24",
          }}
          style={styles.tokenLogo}
        />
        <View style={styles.tokenInfo}>
          <Text style={styles.tokenName}>
            {isEth
              ? //@ts-ignore
                item.tokenInfo?.tokenName
              : item.tokenInfo?.data?.name || ""}
          </Text>
          <Text style={styles.tokenSymbol}>
            {item.tokenInfo?.data?.symbol || ""}
          </Text>
        </View>
        <View style={styles.tokenMetrics}>
          <Text style={styles.tokenPrice}>
            ${formatPrice(Number(item.attributes.base_token_price_usd))}
          </Text>
          <Text
            style={[
              styles.tokenChange,
              item.attributes.price_change_percentage.h24.includes("-")
                ? styles.negative
                : styles.positive,
            ]}
          >
            {item.attributes.price_change_percentage.h24}%
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#E0E0E0" />
          </TouchableOpacity>
          <View style={styles.searchContainer}>
            <Ionicons
              name="search-outline"
              size={20}
              color="#8FA396"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name, symbol, or address"
              placeholderTextColor="#8FA396"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
          </View>
        </View>

        <FlatList
          data={filteredTokens}
          renderItem={renderToken}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchQuery.trim()
                  ? "No tokens found"
                  : "Start typing to search tokens"}
              </Text>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0A0F0D",
  },
  container: {
    flex: 1,
    backgroundColor: "#0A0F0D",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1A231E",
  },
  backButton: {
    marginRight: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A231E",
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: "#E0E0E0",
    fontSize: 16,
  },
  listContainer: {
    padding: 16,
  },
  tokenItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#1A231E",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#2A3F33",
  },
  tokenLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2A3F33",
  },
  tokenInfo: {
    flex: 1,
    marginLeft: 12,
  },
  tokenName: {
    color: "#E0E0E0",
    fontSize: 16,
    fontWeight: "600",
  },
  tokenSymbol: {
    color: "#8FA396",
    fontSize: 14,
    marginTop: 2,
  },
  tokenMetrics: {
    alignItems: "flex-end",
  },
  tokenPrice: {
    color: "#E0E0E0",
    fontSize: 16,
    fontWeight: "600",
  },
  tokenChange: {
    fontSize: 14,
    marginTop: 2,
  },
  positive: {
    color: "#4CAF50",
  },
  negative: {
    color: "#FF5252",
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    color: "#8FA396",
    fontSize: 16,
  },
});
