import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  FlatList,
  Animated,
} from 'react-native';

const NewListings = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Sample data for new listings
  const tokens = [
    {
      id: '1',
      name: 'RocketMoon',
      symbol: 'RMOON',
      price: '$0.00004523',
      change: '+425%',
      marketCap: '$1.2M',
      volume: '$890K',
      category: 'pumpfun',
      launchTime: '2 hours ago',
      holders: 342,
    },
    {
      id: '2',
      name: 'SafeGalaxy',
      symbol: 'SGXY',
      price: '$0.0000234',
      change: '+892%',
      marketCap: '$3.4M',
      volume: '$2.1M',
      category: 'moonshot',
      launchTime: '5 hours ago',
      holders: 1205,
    },
  ];

  // Sample data for dethrone tokens
  const dethroneTokens = [
    {
      id: '1',
      name: 'MegaShiba',
      symbol: 'MSHIB',
      achievement: 'Surpassed SHIB in 24h volume',
      price: '$0.00000789',
      change: '+1256%',
      volume: '$45M',
    },
    {
      id: '2',
      name: 'UltraDoge',
      symbol: 'UDOGE',
      achievement: 'Reached DOGE market cap',
      price: '$0.0000234',
      change: '+567%',
      volume: '$28M',
    },
  ];

  const filterTokens = () => {
    if (selectedCategory === 'all') return tokens;
    return tokens.filter(token => token.category === selectedCategory);
  };

  const renderTokenCard = ({ item }) => (
    <View style={styles.tokenCard}>
      <View style={styles.tokenHeader}>
        <View style={styles.tokenIdentity}>
          <Image 
            source={{ uri: "/api/placeholder/40/40" }}
            style={styles.tokenIcon}
          />
          <View>
            <Text style={styles.tokenName}>{item.name}</Text>
            <Text style={styles.tokenSymbol}>{item.symbol}</Text>
          </View>
        </View>
        <View style={styles.categoryTag}>
          <Text style={styles.categoryText}>
            {item.category === 'pumpfun' ? '🚀 PumpFun' : '🌙 Moonshot'}
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

      <TouchableOpacity style={styles.buyButton}>
        <Text style={styles.buyButtonText}>Buy Now</Text>
      </TouchableOpacity>
    </View>
  );

  const renderDethroneCard = ({ item }) => (
    <View style={styles.dethroneCard}>
      <View style={styles.dethroneHeader}>
        <Image 
          source={{ uri: "/api/placeholder/40/40" }}
          style={styles.tokenIcon}
        />
        <View style={styles.dethroneInfo}>
          <Text style={styles.dethroneName}>{item.name}</Text>
          <Text style={styles.dethroneAchievement}>{item.achievement}</Text>
        </View>
      </View>

      <View style={styles.dethroneMetrics}>
        <Text style={styles.dethronePrice}>{item.price}</Text>
        <Text style={[styles.dethroneChange, styles.changePositive]}>
          {item.change}
        </Text>
      </View>

      <TouchableOpacity style={styles.dethroneButton}>
        <Text style={styles.dethroneButtonText}>Trade Now</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Category Filter */}
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[styles.filterButton, selectedCategory === 'all' && styles.filterActive]}
          onPress={() => setSelectedCategory('all')}
        >
          <Text style={[styles.filterText, selectedCategory === 'all' && styles.filterTextActive]}>
            All New
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, selectedCategory === 'pumpfun' && styles.filterActive]}
          onPress={() => setSelectedCategory('pumpfun')}
        >
          <Text style={[styles.filterText, selectedCategory === 'pumpfun' && styles.filterTextActive]}>
            🚀 PumpFun
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, selectedCategory === 'moonshot' && styles.filterActive]}
          onPress={() => setSelectedCategory('moonshot')}
        >
          <Text style={[styles.filterText, selectedCategory === 'moonshot' && styles.filterTextActive]}>
            🌙 Moonshot
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sort Options */}
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        <TouchableOpacity 
          style={[styles.sortButton, sortBy === 'newest' && styles.sortActive]}
          onPress={() => setSortBy('newest')}
        >
          <Text style={styles.sortText}>Newest</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.sortButton, sortBy === 'trending' && styles.sortActive]}
          onPress={() => setSortBy('trending')}
        >
          <Text style={styles.sortText}>Trending</Text>
        </TouchableOpacity>
      </View>

      {/* New Listings Section */}
      <Text style={styles.sectionTitle}>New Listings</Text>
      <FlatList
        data={filterTokens()}
        renderItem={renderTokenCard}
        keyExtractor={item => item.id}
        scrollEnabled={false}
      />

      {/* Dethrone Section */}
      <Text style={styles.sectionTitle}>Dethrone Kings 👑</Text>
      <FlatList
        data={dethroneTokens}
        renderItem={renderDethroneCard}
        keyExtractor={item => item.id}
        scrollEnabled={false}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  filterText: {
    color: '#666',
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#fff',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sortLabel: {
    color: '#666',
    marginRight: 8,
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#fff',
    marginRight: 8,
  },
  sortActive: {
    backgroundColor: '#e3f2fd',
  },
  sortText: {
    color: '#2196F3',
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 8,
  },
  tokenCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tokenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tokenIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tokenIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  tokenName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  tokenSymbol: {
    color: '#666',
  },
  categoryTag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    color: '#2196F3',
    fontSize: 12,
    fontWeight: '600',
  },
  tokenMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricLabel: {
    color: '#666',
    fontSize: 12,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  changePositive: {
    color: '#4CAF50',
  },
  tokenFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  launchTime: {
    color: '#666',
    fontSize: 12,
  },
  holders: {
    color: '#666',
    fontSize: 12,
  },
  buyButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buyButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  dethroneCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  dethroneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dethroneInfo: {
    flex: 1,
    marginLeft: 8,
  },
  dethroneName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  dethroneAchievement: {
    color: '#666',
    fontSize: 12,
  },
  dethroneMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dethronePrice: {
    fontSize: 16,
    fontWeight: '600',
  },
  dethroneChange: {
    fontSize: 16,
    fontWeight: '600',
  },
  dethroneButton: {
    backgroundColor: '#FFD700',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  dethroneButtonText: {
    color: '#000',
    fontWeight: '600',
  },
});

export default NewListings;