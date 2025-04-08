//@ts-nocheck
import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import useWalletStore from "@/hooks/walletStore";

const Settings = () => {
  const { clearSolWallet, clearEthWallet, solWalletAddress } = useWalletStore();
  
  const [settings, setSettings] = useState({
    notifications: true,
    priceAlerts: true,
    biometricLogin: false,
    darkMode: true,
    hideBalance: false,
    tradingConfirmation: true,
  });

  const handleSignOut = useCallback(async () => {
    try {
      // Clear wallet data
      clearSolWallet();
      clearEthWallet();
      
      // Navigate to sign-in screen
      router.replace("/(auth)/sign-in");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }, [clearSolWallet, clearEthWallet, router]);

  const [currency, setCurrency] = useState("USD");
  const [language, setLanguage] = useState("English");

  const toggleSetting = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => handleSignOut(),
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            clearSolWallet();
            clearEthWallet();
            router.replace("/(auth)/sign-in");
          },
        },
      ]
    );
  };

  const renderSectionHeader = (title, icon) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionDivider} />
    </View>
  );

  const renderSwitchItem = (title, key, description) => (
    <View style={styles.settingItem}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>{title}</Text>
        {description && (
          <Text style={styles.settingDescription}>{description}</Text>
        )}
      </View>
      <Switch
        value={settings[key]}
        onValueChange={() => toggleSetting(key)}
        thumbColor={settings[key] ? "#007AFF" : "#767577"}
        trackColor={{ false: "#1A0E26", true: "#0055CC" }}
        ios_backgroundColor="#1A0E26"
        style={styles.switch}
      />
    </View>
  );

  const renderSelectItem = (title, value, onPress) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.settingTitle}>{title}</Text>
      <View style={styles.selectValue}>
        <Text style={styles.valueText}>{value}</Text>
        <Text style={styles.chevron}>›</Text>
      </View>
    </TouchableOpacity>
  );

  const renderActionItem = (title, onPress, textStyle = {}) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.settingTitle, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <Image
              source={{ uri: "/api/placeholder/80/80" }}
              style={styles.profileImage}
            />
            <View style={styles.statusIndicator} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {solWalletAddress ? 
                `${solWalletAddress.substring(0, 6)}...${solWalletAddress.substring(solWalletAddress.length - 4)}` : 
                "Wallet"}
            </Text>
            <Text style={styles.profileEmail}>
              Solana Wallet
            </Text>
          </View>
          <TouchableOpacity style={styles.editButton} activeOpacity={0.7}>
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.settingsContainer}>
          {/* General Settings */}
          {renderSectionHeader("General", "")}
          {renderSelectItem("Currency", currency, () =>
            console.log("Currency pressed")
          )}
          {renderSelectItem("Language", language, () =>
            console.log("Language pressed")
          )}
          {renderSwitchItem("Dark Mode", "darkMode", "")}
          {renderSwitchItem("Hide Balance", "hideBalance", "")}

          {/* Security */}
          {renderSectionHeader("Security", "")}
          {renderSwitchItem(
            "Biometric Login",
            "biometricLogin",
            "Use fingerprint or Face ID to login"
          )}
          {renderSwitchItem(
            "Trading Confirmation",
            "tradingConfirmation",
            "Require confirmation for all trades"
          )}
          {/* {renderActionItem("Change Password", () =>
            console.log("Change password")
          )}
          {renderActionItem("Two-Factor Authentication", () =>
            console.log("2FA")
          )} */}
          {/* Notifications */}
          {renderSectionHeader("Notifications", "")}
          {renderSwitchItem(
            "Push Notifications",
            "notifications",
            "Receive important updates and news"
          )}
          {renderSwitchItem(
            "Price Alerts",
            "priceAlerts",
            "Get notified about significant price changes"
          )}
          {renderActionItem("Notification Preferences", () =>
            console.log("Notification prefs")
          )}

          {/* Support */}
          {renderSectionHeader("Support", "")}
          {renderActionItem("Help Center", () => console.log("Help center"))}
          {renderActionItem("Contact Support", () =>
            console.log("Contact support")
          )}
          {renderActionItem("Privacy Policy", () => console.log("Privacy"))}
          {renderActionItem("Terms of Service", () => console.log("Terms"))}

          {/* Account Actions */}
          {renderSectionHeader("Account", "")}
          <TouchableOpacity
            style={[styles.actionButton, styles.logoutButton]}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDeleteAccount}
            activeOpacity={0.7}
          >
            <Text style={styles.deleteText}>Delete Account</Text>
          </TouchableOpacity>

          <Text style={styles.version}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A0E26",
  },
  settingsContainer: {
    padding: 16,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#2A1240",
    marginBottom: 16,
    borderRadius: 12,
  },
  profileImageContainer: {
    position: "relative",
    marginRight: 12,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#3A1F5A",
  },
  statusIndicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#00FF00",
    borderWidth: 2,
    borderColor: "#1A0E26",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: "#9B86B3",
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#3A1F5A",
    borderRadius: 8,
  },
  editButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  sectionHeader: {
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#9B86B3",
    marginBottom: 8,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: "#3A1F5A",
    marginBottom: 8,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#2A1240",
    borderRadius: 12,
    marginBottom: 8,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: "#9B86B3",
  },
  switch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  selectValue: {
    flexDirection: "row",
    alignItems: "center",
  },
  valueText: {
    fontSize: 16,
    color: "#9B86B3",
    marginRight: 8,
  },
  chevron: {
    fontSize: 20,
    color: "#9B86B3",
  },
  actionButton: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  logoutButton: {
    backgroundColor: "#3A1F5A",
  },
  deleteButton: {
    backgroundColor: "#4A1F5A",
  },
  logoutText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  deleteText: {
    color: "#FF3B30",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  version: {
    fontSize: 14,
    color: "#9B86B3",
    textAlign: "center",
    marginTop: 24,
    marginBottom: 16,
  },
});

export default Settings;
