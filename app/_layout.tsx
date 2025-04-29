import "../crypto-polyfill";
import React from "react";
import { Stack } from "expo-router";
import "./global.css";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { QueryClientProvider, focusManager } from "@tanstack/react-query";
import { queryClient } from "@/utils/query";
import { AppStateStatus, Platform, StyleSheet, View } from "react-native";
import { useAppState } from "@/hooks/useAppState";
import { useOnlineManager } from "@/hooks/useOnlineManager";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider } from "@/context/AuthContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useFonts } from "expo-font";
import { prefetchAppData } from "@/utils/prefetching";
import NetInfo from "@react-native-community/netinfo";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync().catch(() => {
  /* ignore error */
});

function onAppStateChange(status: AppStateStatus) {
  // React Query already supports in web browser refetch on window focus by default
  if (Platform.OS !== "web") {
    focusManager.setFocused(status === "active");
  }
}

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [initialDataFetched, setInitialDataFetched] = useState(false);
  const [fontsLoaded, fontError] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  // First pass - load fonts and essential resources
  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts, make any API calls you need to do here
        await Promise.all([]);
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    async function requestPermissions() {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== "granted") {
        const { status: newStatus } =
          await Notifications.requestPermissionsAsync();
        if (newStatus !== "granted") {
          console.warn("Notifications permission not granted!");
        }
      }
    }

    requestPermissions();
  }, []);

  // Second pass - prefetch data for better UX once the app is visible
  useEffect(() => {
    async function prefetchInitialData() {
      if (appIsReady && fontsLoaded) {
        try {
          // Check for internet connectivity before prefetching
          const netInfo = await NetInfo.fetch();

          if (netInfo.isConnected) {
            // Hide splash screen before prefetching to show the UI faster
            await SplashScreen.hideAsync().catch(() => {
              /* ignore error */
            });

            // Prefetch initial app data
            await prefetchAppData(queryClient);
          } else {
            console.warn("No internet connection, skipping prefetch");
          }
        } catch (e) {
          console.warn("Error prefetching data:", e);
        } finally {
          setInitialDataFetched(true);

          // Ensure splash screen is hidden even if prefetching fails
          await SplashScreen.hideAsync().catch(() => {
            /* ignore error */
          });
        }
      }
    }

    prefetchInitialData();
  }, [appIsReady, fontsLoaded]);

  useOnlineManager();
  useAppState(onAppStateChange);

  if (!appIsReady || !fontsLoaded) {
    return null;
  }

  if (fontError) {
    console.error("Font loading error:", fontError);
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <StatusBar style="light" />
            {Platform.OS === "android" ? (
              <SafeAreaView style={styles.safeArea} edges={["top"]}>
                <Stack
                  screenOptions={{
                    headerShown: false,
                    animation: "slide_from_right",
                    contentStyle: { backgroundColor: "#1A0E26" },
                  }}
                />
              </SafeAreaView>
            ) : (
              <Stack
                screenOptions={{
                  headerShown: false,
                  animation: "slide_from_right",
                  contentStyle: { backgroundColor: "#1A0E26" },
                }}
              />
            )}
          </AuthProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#1A0E26", // Match the LinearGradient background
  },
});
