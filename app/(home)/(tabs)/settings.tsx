import React, { useState } from "react";
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
  const [settings, setSettings] = useState({
    notifications: true,
    priceAlerts: true,
    biometricLogin: false,
    darkMode: false,
    hideBalance: false,
    tradingConfirmation: true,
  });

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
        onPress: () => console.log("Logout pressed"),
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

  const renderSection = (title) => (
    <Text style={styles.sectionTitle}>{title}</Text>
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
        trackColor={{ false: "#767577", true: "#2A3F33" }}
        thumbColor={settings[key] ? "#14201B" : "#f4f3f4"}
      />
    </View>
  );

  const renderSelectItem = (title, value, onPress) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <Text style={styles.settingTitle}>{title}</Text>
      <View style={styles.selectValue}>
        <Text style={styles.valueText}>{value}</Text>
        <Text style={styles.chevron}>›</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <Image
            source={{ uri: "/api/placeholder/80/80" }}
            style={styles.profileImage}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>John Doe</Text>
            <Text style={styles.profileEmail}>john.doe@example.com</Text>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* General Settings */}
        {renderSection("General")}
        {renderSelectItem("Currency", currency, () =>
          console.log("Currency pressed")
        )}
        {renderSelectItem("Language", language, () =>
          console.log("Language pressed")
        )}
        {renderSwitchItem("Dark Mode", "darkMode")}
        {renderSwitchItem("Hide Balance", "hideBalance")}

        {/* Security */}
        {renderSection("Security")}
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
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingTitle}>Change Password</Text>
        </TouchableOpacity>

        {/* Notifications */}
        {renderSection("Notifications")}
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

        {/* Support */}
        {renderSection("Support")}
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingTitle}>Help Center</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingTitle}>Contact Support</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingTitle}>Privacy Policy</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingTitle}>Terms of Service</Text>
        </TouchableOpacity>

        {/* Account Actions */}
        {renderSection("Account")}
        <TouchableOpacity
          style={[styles.settingItem, styles.logoutButton]}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.settingItem, styles.deleteButton]}
          onPress={handleDeleteAccount}
        >
          <Text style={styles.deleteText}>Delete Account</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};
// #E0E0E0
// #8FA396

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0F0D",
  },
  profileSection: {
    backgroundColor: "#1C2925", //121A17 1C2925 131A17
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#121A17",
  },
  profileInfo: {
    marginLeft: 15,
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#8FA396",
  },
  profileEmail: {
    fontSize: 14,
    color: "#E0E0E0",
    marginTop: 4,
  },
  editButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#3D5A48",
  },
  editButtonText: {
    color: "#3D5A48",
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#E0E0E0",
    marginTop: 20,
    marginBottom: 10,
    marginLeft: 20,
  },
  settingItem: {
    backgroundColor: "#1C2925",
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    justifyContent: "space-between",
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: "#8FA396",
  },
  settingDescription: {
    fontSize: 12,
    color: "#E0E0E0",
    marginTop: 4,
  },
  selectValue: {
    flexDirection: "row",
    alignItems: "center",
  },
  valueText: {
    fontSize: 16,
    color: "#E0E0E0",
    marginRight: 8,
  },
  chevron: {
    fontSize: 18,
    color: "#E0E0E0",
  },
  logoutButton: {
    marginTop: 20,
  },
  logoutText: {
    color: "#2196F3",
    fontSize: 16,
  },
  deleteButton: {
    marginTop: 0,
  },
  deleteText: {
    color: "#F44336",
    fontSize: 16,
  },
  version: {
    textAlign: "center",
    color: "#E0E0E0",
    fontSize: 14,
    marginVertical: 20,
  },
});

export default Settings;
