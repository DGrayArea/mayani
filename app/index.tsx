import "../crypto-polyfill";
import React, { useEffect, useRef } from "react";
import { Link, Redirect } from "expo-router";
import {
  Text,
  View,
  Image,
  Pressable,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import useWalletStore from "@/hooks/walletStore";
import { FontAwesome5 } from "@expo/vector-icons";

const ANIMATION_DURATION = 1200;

const Home = () => {
  // Initialize animated values with useRef to prevent recreation
  const animations = useRef({
    fade: new Animated.Value(0),
    scale: new Animated.Value(0.9),
    slide: new Animated.Value(-50),
    logoRotate: new Animated.Value(0),
    buttonScale: new Animated.Value(1),
    memeFlip: new Animated.Value(0),
  }).current;

  useEffect(() => {
    // Enhanced entrance animations
    Animated.parallel([
      Animated.timing(animations.fade, {
        toValue: 1,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
      Animated.spring(animations.scale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(animations.slide, {
        toValue: 0,
        duration: ANIMATION_DURATION * 0.8,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(ANIMATION_DURATION * 0.5),
        Animated.spring(animations.logoRotate, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Start a repeating animation for the meme icon flip
    Animated.loop(
      Animated.sequence([
        Animated.timing(animations.memeFlip, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animations.memeFlip, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const { solWalletAddress } = useWalletStore();
  const isWalletConnected = !!solWalletAddress;

  // Redirect based on wallet connection status
  if (isWalletConnected) {
    return <Redirect href="/(home)/(tabs)/explore" />;
  }
  
  if (!isWalletConnected) {
    return <Redirect href="/sign-in" />;
  }

  const handlePressIn = () => {
    Animated.spring(animations.buttonScale, {
      toValue: 0.95,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(animations.buttonScale, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const spin = animations.logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const flip = animations.memeFlip.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={["#1A0E26", "#2E1A40", "#1A0E26"]} // Updated gradient to match purple theme
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          <Animated.View
            style={[
              styles.logoContainer,
              {
                opacity: animations.fade,
                transform: [{ scale: animations.scale }, { rotate: spin }],
              },
            ]}
          >
            <Image
              source={require("../assets/icon.jpg")}
              style={styles.logo}
              resizeMode="cover"
            />
            <View style={styles.logoOverlay} />
          </Animated.View>

          <Animated.Text
            style={[
              styles.title,
              {
                opacity: animations.fade,
                transform: [{ translateX: animations.slide }],
              },
            ]}
          >
            Welcome to Ape It
          </Animated.Text>

          <View style={styles.subtitleContainer}>
            <Animated.Text
              style={[
                styles.subtitle,
                {
                  opacity: animations.fade,
                  transform: [
                    { translateX: Animated.multiply(animations.slide, -1) },
                  ],
                },
              ]}
            >
              Your Gateway to Memes
            </Animated.Text>
            <Animated.View
              style={{
                transform: [{ rotateY: flip }],
                marginLeft: 8,
              }}
            >
              <FontAwesome5 name="laugh-squint" size={22} color="#FFD700" />
            </Animated.View>
          </View>

          <Animated.View
            style={[
              styles.buttonContainer,
              {
                opacity: animations.fade,
                transform: [{ scale: animations.buttonScale }],
              },
            ]}
          >
            <Link href="/(home)/(tabs)/explore" asChild>
              <Pressable
                style={styles.button}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                android_ripple={{ color: "rgba(255,255,255,0.2)" }}
              >
                <LinearGradient
                  colors={["#2E1A40", "#2E1A40"]} // Updated button background
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.buttonText}>Get Started</Text>
                </LinearGradient>
              </Pressable>
            </Link>
          </Animated.View>
        </View>

        <View style={styles.bgCircles}>
          {[styles.bgCircle1, styles.bgCircle2, styles.bgCircle3].map(
            (style, index) => (
              <View key={index} style={[styles.bgCircle, style]} />
            )
          )}
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const { width, height } = Dimensions.get("window");

// First, create platform-specific style constants
const platformStyles = {
  fonts: {
    title: Platform.select({
      ios: "System",
      android: "sans-serif-medium",
      default: "System",
    }),
    subtitle: Platform.select({
      ios: "System",
      android: "sans-serif-light",
      default: "System",
    }),
    button: Platform.select({
      ios: "System",
      android: "sans-serif-medium",
      default: "System",
    }),
  },
  shadows: {
    logo: Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.44,
        shadowRadius: 10.32,
      },
      android: {
        elevation: 16,
      },
      default: {},
    }),
    text: Platform.select({
      ios: {
        textShadowColor: "rgba(0, 0, 0, 0.3)",
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      default: {},
    }),
    button: Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
      },
      android: {
        elevation: 8,
      },
      default: {},
    }),
  },
};

// Update your StyleSheet to use the platform-specific styles
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#1A0E26",
    justifyContent: "center",
    alignItems: "center",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#1A0E26",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 24,
    zIndex: 1,
  },
  logoContainer: {
    marginBottom: 32,
    borderRadius: 75,
    overflow: "hidden",
    backgroundColor: "transparent",
    width: 150,
    height: 150,
    ...platformStyles.shadows.logo,
    borderWidth: 2,
    borderColor: "#8C5BE6",
  },
  logo: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  logoOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 75,
    backgroundColor: "rgba(122, 81, 224, 0.3)",
  },
  title: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 12,
    textAlign: "center",
    fontFamily: platformStyles.fonts.title,
    ...platformStyles.shadows.text,
  },
  subtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 48,
  },
  subtitle: {
    fontSize: 22,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    fontFamily: platformStyles.fonts.subtitle,
  },
  buttonContainer: {
    width: "85%",
    maxWidth: 320,
    ...platformStyles.shadows.button,
  },
  button: {
    width: "100%",
    overflow: "hidden",
    borderRadius: 30,
    borderWidth: 2, // Added border
    borderColor: "#8C5BE6", // Button Border and Text Glow
  },
  buttonGradient: {
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2E1A40", // Button Background
  },
  buttonText: {
    color: "#FFFFFF", // White text
    fontSize: 20,
    fontWeight: "600",
    letterSpacing: 1,
    fontFamily: platformStyles.fonts.button,
  },
  bgCircles: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  bgCircle: {
    position: "absolute",
    borderRadius: width * 2,
  },
  bgCircle1: {
    width: width * 1.8,
    height: width * 1.8,
    top: -width,
    right: -width * 0.5,
    backgroundColor: "#7B51E0", // Gradient Light Purple
  },
  bgCircle2: {
    width: width * 1.4,
    height: width * 1.4,
    bottom: -width * 0.6,
    left: -width * 0.3,
    backgroundColor: "#5A2DA0", // Gradient Dark Purple
  },
  bgCircle3: {
    width: width * 1.2,
    height: width * 1.2,
    top: height * 0.2,
    right: -width * 0.4,
    backgroundColor: "#8C5BE6", // Button Border and Text Glow
  },
});

export default Home;
