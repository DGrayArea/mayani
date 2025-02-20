import "../crypto-polyfill";
import React, { useEffect, useRef } from "react";
import { Link } from "expo-router";
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
import { useUser } from "@clerk/clerk-expo";
import { SafeAreaView } from "react-native-safe-area-context";
import { Redirect } from "expo-router";

const ANIMATION_DURATION = 1200;

const Home = () => {
  // Initialize animated values with useRef to prevent recreation
  const animations = useRef({
    fade: new Animated.Value(0),
    scale: new Animated.Value(0.9),
    slide: new Animated.Value(-50),
    logoRotate: new Animated.Value(0),
    buttonScale: new Animated.Value(1),
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
  }, []);

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

  const { user, isLoaded, isSignedIn } = useUser();

  if (!isLoaded) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color="#00897b" />
      </SafeAreaView>
    );
  }

  if (user) {
    return <Redirect href="/(home)/(tabs)/explore" />;
  }

  const spin = animations.logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={["#004d40", "#00796b", "#009688"]}
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
                transform: [
                  { scale: animations.scale },
                  { rotate: spin }
                ],
              },
            ]}
          >
            <Image
              source={require("../assets/renner.jpeg")}
              style={styles.logo}
              resizeMode="cover"
            />
            <LinearGradient
              colors={["rgba(0,77,64,0.3)", "rgba(0,121,107,0.3)"]}
              style={styles.logoOverlay}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
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
            Welcome to Mayani
          </Animated.Text>
          
          <Animated.Text
            style={[
              styles.subtitle,
              {
                opacity: animations.fade,
                transform: [{ translateX: Animated.multiply(animations.slide, -1) }],
              },
            ]}
          >
            Your Gateway to  Safer degen 
          </Animated.Text>

          <Animated.View
            style={[
              styles.buttonContainer,
              {
                opacity: animations.fade,
                transform: [{ scale: animations.buttonScale }],
              },
            ]}
          >
            <Link href="/(auth)/sign-in" asChild>
              <Pressable
                style={styles.button}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                android_ripple={{ color: "rgba(255,255,255,0.2)" }}
              >
                <LinearGradient
                  colors={["#00897b", "#00796b"]}
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
          {[styles.bgCircle1, styles.bgCircle2, styles.bgCircle3].map((style, index) => (
            <View key={index} style={[styles.bgCircle, style]} />
          ))}
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const { width, height } = Dimensions.get("window");
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#004d40",
    justifyContent: "center",
    alignItems: "center",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#004d40",
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
  },
  title: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 12,
    textAlign: "center",
    fontFamily: Platform.select({ ios: "System", android: "sans-serif-medium" }),
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
  subtitle: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 48,
    textAlign: "center",
    fontFamily: Platform.select({ ios: "System", android: "sans-serif-light" }),
  },
  buttonContainer: {
    width: "85%",
    maxWidth: 320,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  button: {
    width: "100%",
    overflow: "hidden",
    borderRadius: 30,
  },
  buttonGradient: {
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "600",
    letterSpacing: 1,
    fontFamily: Platform.select({ ios: "System", android: "sans-serif-medium" }),
  },
  bgCircles: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  bgCircle: {
    position: "absolute",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: width * 2,
  },
  bgCircle1: {
    width: width * 1.8,
    height: width * 1.8,
    top: -width,
    right: -width * 0.5,
  },
  bgCircle2: {
    width: width * 1.4,
    height: width * 1.4,
    bottom: -width * 0.6,
    left: -width * 0.3,
  },
  bgCircle3: {
    width: width * 1.2,
    height: width * 1.2,
    top: height * 0.2,
    right: -width * 0.4,
  },
});

export default Home;