import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CryptoExplorer = () => {
  const [selectedFilter, setSelectedFilter] = useState("all");

  const topGainers = [
    {
      id: "1",
      name: "MIRA",
      percentage: "317K%",
      avatar: "/api/placeholder/40/40",
      type: "other",
    },
    {
      id: "2",
      name: "RM9000",
      percentage: "67.4%",
      avatar: "/api/placeholder/40/40",
      type: "other",
    },
    {
      id: "3",
      name: "SOL",
      percentage: "12.4%",
      avatar: "/api/placeholder/40/40",
      type: "sol",
    },
    {
      id: "4",
      name: "ETH",
      percentage: "8.2%",
      avatar: "/api/placeholder/40/40",
      type: "eth",
    },
  ];

  const trending = [
    {
      id: "1",
      name: "MIRA",
      price: "$0.0177",
      marketCap: "$17.7M MKT CAP",
      change: "317K%",
      avatar: "/api/placeholder/40/40",
      type: "other",
    },
    {
      id: "2",
      name: "PENGU",
      price: "$0.0378",
      marketCap: "$3.4B MKT CAP",
      change: "2.93%",
      avatar: "/api/placeholder/40/40",
      type: "other",
    },
    {
      id: "3",
      name: "SOL",
      price: "$123.45",
      marketCap: "$52.8B MKT CAP",
      change: "5.67%",
      avatar: "/api/placeholder/40/40",
      type: "sol",
    },
    {
      id: "4",
      name: "ETH",
      price: "$3,245.90",
      marketCap: "$389.2B MKT CAP",
      change: "-2.28%",
      avatar: "/api/placeholder/40/40",
      type: "eth",
    },
    {
      id: "5",
      name: "Fartcoin",
      price: "$0.903",
      marketCap: "$903M MKT CAP",
      change: "-24.28%",
      avatar: "/api/placeholder/40/40",
      type: "other",
    },
  ];

  const filteredTopGainers = topGainers.filter(
    (item) => selectedFilter === "all" || item.type === selectedFilter
  );

  const filteredTrending = trending.filter(
    (item) => selectedFilter === "all" || item.type === selectedFilter
  );

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

  const renderTopGainers = ({ item }) => (
    <View style={styles.gainerCard}>
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.gainerContent}>
        <Text style={styles.gainerText}>{item.name}</Text>
        <Text style={styles.gainerPercentage}>{item.percentage}</Text>
      </View>
    </View>
  );

  const renderTrendingItem = ({ item }) => (
    <View style={styles.trendingItem}>
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.trendingInfo}>
        <Text style={styles.trendingName}>{item.name}</Text>
        <Text style={styles.marketCap}>{item.marketCap}</Text>
      </View>
      <View style={styles.trendingPriceInfo}>
        <Text style={styles.trendingPrice}>{item.price}</Text>
        <Text
          style={[
            styles.trendingChange,
            item.change.includes("-") ? styles.negative : styles.positive,
          ]}
        >
          {item.change}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Explore</Text>

      {renderFilterButtons()}

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
          data={filteredTrending}
          renderItem={renderTrendingItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
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
    // paddingTop: 20,
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
    marginTop: 20,
  },
  sectionTitle: {
    color: "#B8C3BC",
    fontSize: 20,
    marginBottom: 15,
    fontWeight: "600",
  },
  gainerCard: {
    backgroundColor: "#1A231E",
    borderRadius: 15,
    padding: 15,
    marginRight: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2A3F33",
    minWidth: 160,
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

export default CryptoExplorer;
