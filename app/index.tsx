import React, { useEffect } from "react";
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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Constants from "expo-constants";
import { SafeAreaView } from "react-native-safe-area-context";

const Home = () => {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.9);
  const slideAnim = new Animated.Value(-50);
  const buttonScaleAnim = new Animated.Value(1);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(buttonScaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.safeArea}>
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
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <Image
              source={require("../assets/renner.jpeg")}
              style={styles.logo}
            />
            <LinearGradient
              colors={["rgba(0,77,64,0.2)", "rgba(0,121,107,0.2)"]}
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
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            Welcome to Mayani
          </Animated.Text>

          <Animated.View
            style={[
              styles.buttonContainer,
              {
                opacity: fadeAnim,
                transform: [{ scale: buttonScaleAnim }],
              },
            ]}
          >
            <Link href="/sign-in" asChild>
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
                  <Text style={styles.buttonText}>Sign In</Text>
                </LinearGradient>
              </Pressable>
            </Link>
          </Animated.View>
        </View>

        <View style={styles.bgCircles}>
          <View style={[styles.bgCircle, styles.bgCircle1]} />
          <View style={[styles.bgCircle, styles.bgCircle2]} />
          <View style={[styles.bgCircle, styles.bgCircle3]} />
        </View>
      </LinearGradient>
    </View>
  );
};

const { width } = Dimensions.get("window");
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    // paddingTop: Constants.statusBarHeight,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 20,
    zIndex: 1,
  },
  logoContainer: {
    marginBottom: 30,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 8,
        },
        shadowOpacity: 0.44,
        shadowRadius: 10.32,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  logo: {
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  logoOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 70,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 40,
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
  buttonContainer: {
    width: "80%",
    maxWidth: 300,
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
  button: {
    width: "100%",
    overflow: "hidden",
    borderRadius: 30,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 1,
  },
  bgCircles: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  bgCircle: {
    position: "absolute",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: width,
  },
  bgCircle1: {
    width: width * 1.4,
    height: width * 1.4,
    top: -width * 0.8,
    right: -width * 0.5,
  },
  bgCircle2: {
    width: width * 1.2,
    height: width * 1.2,
    bottom: -width * 0.6,
    left: -width * 0.3,
  },
  bgCircle3: {
    width: width,
    height: width,
    top: width * 0.2,
    right: -width * 0.3,
  },
});

export default Home;
