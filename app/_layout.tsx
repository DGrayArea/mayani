import "../crypto-polyfill";
import { Stack } from "expo-router";
import "./global.css";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import GlobalProvider from "@/lib/global-provider";
import { QueryClientProvider, focusManager } from "@tanstack/react-query";
import { queryClient } from "@/utils/query";
import { AppStateStatus, Platform, StyleSheet } from "react-native";
import { useAppState } from "@/hooks/useAppState";
import { useOnlineManager } from "@/hooks/useOnlineManager";
import { ClerkProvider, ClerkLoaded } from "@clerk/clerk-expo";
import { Slot } from "expo-router";
import { config } from "@/lib/appwrite";
import { tokenCache } from "@/cache";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import ErrorBoundary from "../components/ErrorBoundary";

function onAppStateChange(status: AppStateStatus) {
  // React Query already supports in web browser refetch on window focus by default
  if (Platform.OS !== "web") {
    focusManager.setFocused(status === "active");
  }
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  useOnlineManager();

  useAppState(onAppStateChange);

  const publishableKey = config.publishableKey;

  if (!publishableKey) {
    throw new Error("Add EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY to your .env file");
  }

  return (
    <ErrorBoundary>
      <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
        <ClerkLoaded>
          <QueryClientProvider client={queryClient}>
            <GlobalProvider>
              {Platform.OS === "android" ? (
                <SafeAreaView style={styles.safeArea} edges={["top"]}>
                  <StatusBar
                    style="light"
                    backgroundColor="transparent"
                    translucent
                  />
                  <Stack
                    screenOptions={{
                      headerShown: false,
                    }}
                  >
                    <Slot />
                  </Stack>
                </SafeAreaView>
              ) : (
                <>
                  <StatusBar
                    style="light"
                    backgroundColor="transparent"
                    translucent
                  />
                  <Stack
                    screenOptions={{
                      headerShown: false,
                    }}
                  >
                    <Slot />
                  </Stack>
                </>
              )}
            </GlobalProvider>
          </QueryClientProvider>
        </ClerkLoaded>
      </ClerkProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#005d4d", // Match your gradient start color
  },
  // ...rest of your styles
});
