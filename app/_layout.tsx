import "../crypto-polyfill";
import { Stack } from "expo-router";
import "./global.css";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import GlobalProvider from "@/lib/global-provider";
import { QueryClientProvider, focusManager } from "@tanstack/react-query";
import { queryClient } from "@/utils/query";
import { AppStateStatus, Platform } from "react-native";
import { useAppState } from "@/hooks/useAppState";
import { useOnlineManager } from "@/hooks/useOnlineManager";

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

  return (
    <QueryClientProvider client={queryClient}>
      <GlobalProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
      </GlobalProvider>
    </QueryClientProvider>
  );
}
