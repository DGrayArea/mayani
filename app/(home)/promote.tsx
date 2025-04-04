import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

const PromotePage = () => {
  const [days, setDays] = useState(1);
  const pricePerDay = 0.5; // SOL per day

  const handleIncrement = () => {
    setDays((prev) => Math.min(prev + 1, 30)); // Max 30 days
  };

  const handleDecrement = () => {
    setDays((prev) => Math.max(prev - 1, 1)); // Min 1 day
  };

  const handlePurchase = () => {
    Alert.alert(
      "Confirm Purchase",
      `Would you like to pay ${(days * pricePerDay).toFixed(
        1
      )} SOL for ${days} days of trending spot?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Pay Now",
          onPress: () => {
            // Here you would integrate with wallet payment
            Alert.alert(
              "Success!",
              "Your token will be trending for the next " + days + " days.",
              [{ text: "OK", onPress: () => router.back() }]
            );
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Promote Your Token</Text>

        <View style={styles.cardContainer}>
          <View style={styles.promotionCard}>
            <Text style={styles.cardTitle}>Trending Spot</Text>
            <Text style={styles.price}>
              {(days * pricePerDay).toFixed(1)} SOL
            </Text>

            <View style={styles.durationSelector}>
              <TouchableOpacity
                style={styles.durationButton}
                onPress={handleDecrement}
              >
                <Ionicons name="remove" size={24} color="#E0E0E0" />
              </TouchableOpacity>

              <TextInput
                style={styles.durationInput}
                value={days.toString()}
                onChangeText={(text) => {
                  const value = parseInt(text);
                  if (!isNaN(value) && value >= 1 && value <= 30) {
                    setDays(value);
                  }
                }}
                keyboardType="number-pad"
                maxLength={2}
              />

              <TouchableOpacity
                style={styles.durationButton}
                onPress={handleIncrement}
              >
                <Ionicons name="add" size={24} color="#E0E0E0" />
              </TouchableOpacity>
            </View>

            <Text style={styles.duration}>
              {days} {days === 1 ? "Day" : "Days"}
            </Text>

            <TouchableOpacity style={styles.buyButton} onPress={handlePurchase}>
              <Text style={styles.buyButtonText}>Purchase Spot</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#1A0E26",
  },
  container: {
    flex: 1,
    padding: 20,
  },
  backButton: {
    marginBottom: 20,
  },
  backButtonText: {
    color: "#9B86B3",
    fontSize: 16,
  },
  title: {
    color: "#E0E0E0",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 24,
  },
  cardContainer: {
    alignItems: "center",
  },
  promotionCard: {
    backgroundColor: "#2E1A40",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: "100%",
    borderWidth: 0.7,
    borderColor: "#8C5BE6",
    alignItems: "center", // Add this
  },
  cardTitle: {
    color: "#E0E0E0",
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
  },
  price: {
    color: "#8C5BE6",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center", // Add this
  },
  duration: {
    color: "#8C5BE6",
    fontSize: 16,
    marginBottom: 24,
    textAlign: "center",
  },
  buyButton: {
    backgroundColor: "#5A2DA0",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buyButtonText: {
    color: "#E0E0E0",
    fontSize: 16,
    fontWeight: "600",
  },
  durationSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 16,
  },
  durationButton: {
    width: 40,
    height: 40,
    backgroundColor: "#5A2DA0",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.7,
    borderColor: "#8C5BE6",
  },
  durationInput: {
    width: 60,
    height: 40,
    backgroundColor: "#5A2DA0",
    borderRadius: 8,
    marginHorizontal: 12,
    color: "#E0E0E0",
    fontSize: 18,
    textAlign: "center",
    borderWidth: 0.7,
    borderColor: "#8C5BE6",
  },
});

export default PromotePage;
