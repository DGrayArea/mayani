import "../crypto-polyfill";
import { Stack } from "expo-router";
import "./global.css";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import GlobalProvider from "@/lib/global-provider";

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <GlobalProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </GlobalProvider>
  );
}
