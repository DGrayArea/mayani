import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Animated,
  Dimensions,
  Platform,
  ScrollView,
  Image,
  KeyboardAvoidingView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Clipboard from "expo-clipboard";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import useWalletStore from "@/hooks/walletStore";
import * as web3 from "@solana/web3.js";
import { ethers } from "ethers";

const SignIn = () => {
  const [privateKey, setPrivateKey] = useState("");
  const [isPrivateKeyVisible, setIsPrivateKeyVisible] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(1));
  const [mode, setMode] = useState<'import'|'generate'|'main'>('main');
  const [copied, setCopied] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Animation values
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(30);
  const buttonScaleAnim = new Animated.Value(1);
  const logoAnim = useRef(new Animated.Value(0)).current;

  const { 
    generateSolWallet,
    solWalletAddress,
    privateKey: walletPrivateKey,
    clearSolWallet,
    generateEthWallet,
    getSolKeypair,
    getEthWallet,
  } = useWalletStore();

  useEffect(() => {
    // Start regular animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Start logo bounce animation
    startLogoAnimation();
  }, []);

  const startLogoAnimation = () => {
    // Reset animation value
    logoAnim.setValue(0);
    
    // Create bouncing animation sequence
    Animated.sequence([
      // Initial bounce up
      Animated.spring(logoAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
      // Slight bounce down
      Animated.spring(logoAnim, {
        toValue: 0.8,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
      // Final position
      Animated.spring(logoAnim, {
        toValue: 0.9,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      })
    ]).start();
  };

  const logoScale = logoAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1]
  });

  const logoTranslateY = logoAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0]
  });

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handleGenerateWallet = async () => {
    try {
      setIsGenerating(true);
      // Generate both Solana and Ethereum wallets
      await generateSolWallet();
      await generateEthWallet();
      // Navigate to homepage after successful wallet generation
      router.push("/");
    } catch (error) {
      console.error("Wallet generation error:", error);
      Alert.alert("Error", "Failed to generate wallet. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImportWallet = async () => {
    try {
      if (!privateKey) {
        Alert.alert("Error", "Please enter a private key");
        return;
      }
      // Try to import as Solana wallet first
      try {
        const solKeypair = web3.Keypair.fromSecretKey(Buffer.from(privateKey, "base64"));
        // Set Solana wallet
        await generateSolWallet();
        // Set Ethereum wallet
        await generateEthWallet();
      } catch (solError) {
        // If not a Solana key, try as Ethereum wallet
        try {
          const ethWallet = new ethers.Wallet(privateKey);
          // Set Ethereum wallet
          await generateEthWallet();
        } catch (ethError) {
          throw new Error("Invalid private key format");
        }
      }
      // Navigate to homepage after successful import
      router.push("/");
    } catch (error) {
      console.error("Wallet import error:", error);
      Alert.alert("Error", "Failed to import wallet. Please check your private key and try again.");
    }
  };

  const copyToClipboard = async () => {
    if (walletPrivateKey) {
      await Clipboard.setStringAsync(walletPrivateKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const saveGeneratedKey = async () => {
    try {
      // The key is already stored in the walletStore
      // Just redirect to the main app
      Alert.alert(
        "Important",
        "Make sure you have saved your private key in a secure location. You will need it to access your wallet.",
        [
          { 
            text: "I've Saved It", 
            onPress: () => router.replace("/(home)/(tabs)/explore") 
          }
        ]
      );
    } catch (error) {
      console.error("Save key error:", error);
      Alert.alert("Error", "Failed to save private key");
    }
  };

  const renderMainView = () => (
    <Animated.View
      style={[
        styles.form,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Text style={styles.loginText}>Welcome to Ape It Wallet</Text>
      <Text style={styles.subtitle}>Choose how to access your wallet</Text>

      <View style={styles.buttonGroup}>
        <TouchableOpacity
          onPress={() => setMode('import')}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={styles.button}
        >
          <View style={styles.buttonContent}>
            <FontAwesome name="key" size={18} color="#FFFFFF" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Import Private Key</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.orText}>OR</Text>

        <TouchableOpacity
          onPress={handleGenerateWallet}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={styles.button}
          disabled={isGenerating}
        >
          <View style={styles.buttonContent}>
            <FontAwesome name="plus-circle" size={18} color="#FFFFFF" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>
              {isGenerating ? "Generating..." : "Generate New Wallet"}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderImportView = () => (
    <Animated.View
      style={[
        styles.form,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Text style={styles.loginText}>Import Wallet</Text>
      <Text style={styles.subtitle}>Enter your private key to access your wallet</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter your private key"
          placeholderTextColor="#9B86B3"
          value={privateKey}
          onChangeText={setPrivateKey}
          secureTextEntry={!isPrivateKeyVisible}
          multiline={isPrivateKeyVisible}
          numberOfLines={isPrivateKeyVisible ? 3 : 1}
        />
        <TouchableOpacity 
          style={styles.visibilityToggle}
          onPress={() => setIsPrivateKeyVisible(!isPrivateKeyVisible)}
        >
          <FontAwesome name={isPrivateKeyVisible ? "eye-slash" : "eye"} size={18} color="#9B86B3" />
        </TouchableOpacity>
      </View>

      <View style={styles.buttonGroup}>
        <TouchableOpacity
          onPress={handleImportWallet}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={styles.button}
        >
          <View style={styles.buttonContent}>
            <FontAwesome name="check" size={18} color="#FFFFFF" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Import and Continue</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setMode('main')}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderGenerateView = () => (
    <Animated.View
      style={[
        styles.form,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Text style={styles.loginText}>Wallet Generated</Text>
      <Text style={styles.subtitle}>Save your private key in a secure location</Text>

      <View style={styles.keyInfoContainer}>
        <View style={styles.walletInfoRow}>
          <Text style={styles.walletInfoLabel}>Wallet Address:</Text>
          <Text style={styles.walletInfoValue}>{solWalletAddress ? `${solWalletAddress.substring(0, 10)}...${solWalletAddress.substring(solWalletAddress.length - 10)}` : 'Loading...'}</Text>
        </View>

        <Text style={styles.privateKeyLabel}>Private Key:</Text>
        <View style={styles.privateKeyContainer}>
          <ScrollView style={styles.privateKeyScroll}>
            <Text style={styles.privateKeyText}>{walletPrivateKey || 'Loading...'}</Text>
          </ScrollView>
          <TouchableOpacity 
            style={styles.copyButton} 
            onPress={copyToClipboard}
          >
            <FontAwesome name={copied ? "check" : "copy"} size={18} color="#FFFFFF" />
            <Text style={styles.copyButtonText}>{copied ? "Copied!" : "Copy"}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.buttonGroup}>
        <TouchableOpacity
          onPress={saveGeneratedKey}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={styles.button}
        >
          <View style={styles.buttonContent}>
            <FontAwesome name="check" size={18} color="#FFFFFF" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>I&apos;ve Saved My Key</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setMode('main')}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={["#1A0E26", "#2A1240"]}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.bgCircles}>
          <View style={[styles.bgCircle, styles.bgCircle1]} />
          <View style={[styles.bgCircle, styles.bgCircle2]} />
          <View style={[styles.bgCircle, styles.bgCircle3]} />
        </View>

        <View style={styles.content}>
          {/* Animated Logo */}
          <Animated.View
            style={[
              styles.logoWrapper,
              {
                transform: [
                  { scale: logoScale },
                  { translateY: logoTranslateY }
                ],
                opacity: fadeAnim
              }
            ]}
          >
            <Image
              source={require("../../assets/icon.jpg")}
              style={styles.logoImage}
              resizeMode="cover"
            />
            <LinearGradient
              colors={["rgba(140, 91, 230, 0.3)", "rgba(90, 45, 160, 0.3)"]}
              style={styles.logoOverlay}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          </Animated.View>

          <Animated.Text
            style={[
              styles.title,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            Ape It Wallet
          </Animated.Text>

          {mode === 'main' && renderMainView()}
          {mode === 'import' && renderImportView()}
          {mode === 'generate' && renderGenerateView()}
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
  },
  content: {
    padding: 20,
    zIndex: 1,
  },
  logoWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: "hidden",
    alignSelf: "center",
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#8C5BE6",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.44,
        shadowRadius: 10.32,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  logoImage: {
    width: "100%",
    height: "100%",
    borderRadius: 60,
  },
  logoOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 60,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 30,
    textAlign: "center",
    ...Platform.select({
      ios: {
        textShadowColor: "rgba(0, 0, 0, 0.3)",
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  form: {
    gap: 20,
  },
  loginText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#A990C9",
    textAlign: "center",
    marginBottom: 20,
  },
  buttonGroup: {
    gap: 15,
    alignItems: "center",
    marginTop: 10,
  },
  button: {
    backgroundColor: "#2E1A40",
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#8C5BE6",
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  orText: {
    color: "#A990C9",
    fontSize: 16,
    fontWeight: "500",
    marginVertical: 10,
  },
  inputContainer: {
    position: "relative",
    marginVertical: 10,
    width: "100%",
  },
  input: {
    backgroundColor: "rgba(46, 26, 64, 0.6)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#8C5BE6",
    padding: 15,
    color: "#FFFFFF",
    fontSize: 16,
    width: "100%",
    textAlignVertical: 'top',
  },
  visibilityToggle: {
    position: "absolute",
    right: 15,
    top: 15,
  },
  backButton: {
    paddingVertical: 10,
  },
  backButtonText: {
    color: "#A990C9",
    fontSize: 16,
    fontWeight: "500",
    textDecorationLine: "underline",
  },
  keyInfoContainer: {
    backgroundColor: "rgba(46, 26, 64, 0.6)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#8C5BE6",
    padding: 15,
    marginVertical: 15,
  },
  walletInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
    flexWrap: "wrap",
  },
  walletInfoLabel: {
    color: "#A990C9",
    fontSize: 14,
    fontWeight: "600",
  },
  walletInfoValue: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  privateKeyLabel: {
    color: "#A990C9",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 5,
  },
  privateKeyContainer: {
    backgroundColor: "rgba(26, 14, 38, 0.8)",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  privateKeyScroll: {
    maxHeight: 100,
  },
  privateKeyText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginBottom: 10,
  },
  copyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#5A2DA0",
    borderRadius: 5,
    padding: 8,
    alignSelf: "flex-end",
  },
  copyButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 5,
  },
  bgCircles: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  bgCircle: {
    position: "absolute",
    borderRadius: width,
  },
  bgCircle1: {
    width: width * 1.4,
    height: width * 1.4,
    top: -width * 0.8,
    right: -width * 0.5,
    backgroundColor: "#7B51E0",
  },
  bgCircle2: {
    width: width * 1.2,
    height: width * 1.2,
    bottom: -width * 0.6,
    left: -width * 0.3,
    backgroundColor: "#5A2DA0",
  },
  bgCircle3: {
    width: width * 0.8,
    height: width * 0.8,
    bottom: -width * 0.4,
    right: -width * 0.4,
    backgroundColor: "#3D1D6B",
    opacity: 0.7,
  },
});

export default SignIn;
