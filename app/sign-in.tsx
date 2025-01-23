import React, { useState, useEffect } from "react";
import {
  Alert,
  Image,
  ScrollView,
  TouchableOpacity,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
} from "react-native";
import { login } from "@/lib/appwrite";
import { useRouter, Redirect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useGlobalContext } from "@/lib/global-provider";
import icons from "@/constants/icons";
import images from "@/constants/images";
import { SafeAreaView } from "react-native-safe-area-context";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const router = useRouter();

  // Animation values
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(30);
  const buttonScaleAnim = new Animated.Value(1);

  useEffect(() => {
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

  const handleSubmit = () => {
    // Add email validation here later
    router.push("/explore");
  };

  const { refetch, loading, isLogged } = useGlobalContext();

  if (!loading && isLogged) return <Redirect href="/" />;

  const handleLogin = async () => {
    // const result = await login();
    // if (result) {
    //   refetch();
    // } else {
    //   Alert.alert("Error", "Failed to login");
    // }
    router.push("/explore");
  };

  return (
    <View style={styles.safeArea}>
      <LinearGradient
        colors={["#004d40", "#00796b", "#009688"]}
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
          <Animated.Text
            style={[
              styles.title,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            Sign In
          </Animated.Text>

          <Animated.View
            style={[
              styles.form,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor="rgba(0,0,0,0.5)"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View> */}

            <Animated.View
              style={[
                styles.buttonContainer,
                {
                  transform: [{ scale: buttonScaleAnim }],
                },
              ]}
            >
              <Text className="text-xl font-semibold font-rubik text-white text-center mt-16 mb-5">
                Login to Mayani with Google
              </Text>

              <TouchableOpacity
                onPress={handleLogin}
                className="bg-white shadow-md shadow-zinc-300 rounded-full w-full py-4 mt-5"
              >
                <View className="flex flex-row items-center justify-center">
                  <Image
                    source={icons.google}
                    className="w-5 h-5"
                    resizeMode="contain"
                  />
                  <Text className="text-lg font-rubik-medium text-black-300 ml-2">
                    Continue with Google
                  </Text>
                </View>
              </TouchableOpacity>
              {/* <Pressable
                onPress={handleSubmit}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={styles.button}
                android_ripple={{ color: "rgba(255,255,255,0.2)" }}
              >
                <LinearGradient
                  colors={["#00897b", "#00796b"]}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.buttonText}>Continue</Text>
                </LinearGradient>
              </Pressable> */}
            </Animated.View>
          </Animated.View>
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
  },
  content: {
    padding: 20,
    zIndex: 1,
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
  form: {
    gap: 20,
  },
  inputContainer: {
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4.65,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 15,
    fontSize: 16,
    color: "#333",
  },
  buttonContainer: {
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
    overflow: "hidden",
    borderRadius: 15,
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

export default SignIn;
