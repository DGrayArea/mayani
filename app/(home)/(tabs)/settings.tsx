//@ts-nocheck
import { useAuth, useClerk, useUser } from "@clerk/clerk-expo";
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

const Settings = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const { isLoaded } = useAuth();
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
      if (!isLoaded) {
        return;
      }

      await signOut();
      router.push("/(auth)/sign-in");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }, [isLoaded, signOut, router]);

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
          onPress: () => console.log("Delete account pressed"),
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
        trackColor={{ false: "#181F1C", true: "#2A5A38" }}
        thumbColor={settings[key] ? "#4CAF50" : "#767577"}
        ios_backgroundColor="#181F1C"
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
              source={{ uri: user?.imageUrl ?? "/api/placeholder/80/80" }}
              style={styles.profileImage}
            />
            <View style={styles.statusIndicator} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.fullName}</Text>
            <Text style={styles.profileEmail}>
              {user?.emailAddresses[0].emailAddress}
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
    backgroundColor: "#0A0F0D",
  },
  settingsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  profileSection: {
    backgroundColor: "#14201B",
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#2A3F33",
  },
  profileImageContainer: {
    position: "relative",
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#121A17",
    borderWidth: 2,
    borderColor: "#2A3F33",
  },
  statusIndicator: {
    position: "absolute",
    width: 14,
    height: 14,
    backgroundColor: "#4CAF50",
    borderRadius: 7,
    bottom: 5,
    right: 5,
    borderWidth: 2,
    borderColor: "#14201B",
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#8FA396",
    letterSpacing: 0.3,
  },
  profileEmail: {
    fontSize: 14,
    color: "#8FA396",
    marginTop: 4,
    opacity: 0.7,
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#3D5A48",
    backgroundColor: "#1A231E",
  },
  editButtonText: {
    color: "#4CAF50",
    fontSize: 14,
    fontWeight: "500",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#8FA396",
    marginRight: 12,
  },
  sectionDivider: {
    flex: 1,
    height: 1,
    backgroundColor: "#2A3F33",
  },
  settingItem: {
    backgroundColor: "#14201B",
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#1C2925",
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: "#8FA396",
    fontWeight: "500",
  },
  settingDescription: {
    fontSize: 12,
    color: "#8FA396",
    marginTop: 4,
    opacity: 0.7,
  },
  selectValue: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0A0F0D",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  valueText: {
    fontSize: 14,
    color: "#8FA396",
    marginRight: 8,
  },
  chevron: {
    fontSize: 18,
    color: "#4CAF50",
    fontWeight: "600",
  },
  switch: {
    transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
  },
  actionButton: {
    backgroundColor: "#14201B",
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    alignItems: "center",
    borderWidth: 1,
  },
  logoutButton: {
    borderColor: "rgba(33, 150, 243, 0.3)",
    marginTop: 16,
  },
  logoutText: {
    color: "#2196F3",
    fontSize: 16,
    fontWeight: "600",
  },
  deleteButton: {
    borderColor: "rgba(244, 67, 54, 0.3)",
    marginTop: 12,
  },
  deleteText: {
    color: "#F44336",
    fontSize: 16,
    fontWeight: "600",
  },
  version: {
    textAlign: "center",
    color: "#8FA396",
    fontSize: 14,
    marginTop: 30,
    opacity: 0.6,
  },
});

export default Settings;
