import "../../crypto-polyfill";
import React, { useEffect } from "react";
import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, StyleSheet, Platform, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import useWalletStore from "@/hooks/walletStore";

export default function AppLayout() {
  const { solWalletAddress, privateKey } = useWalletStore();
  const isWalletConnected = !!solWalletAddress && !!privateKey;

  // If no wallet is connected, redirect to sign in
  if (!isWalletConnected) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <>
      {Platform.OS === "android" ? (
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "slide_from_right",
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="tokens"
            options={{
              headerShown: false,
              presentation: "card",
            }}
          />
          <Stack.Screen
            name="promote"
            options={{
              headerShown: false,
              presentation: "card",
            }}
          />
          <Stack.Screen
            name="search"
            options={{
              headerShown: false,
              presentation: "card",
            }}
          />
        </Stack>
      ) : (
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "slide_from_right",
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="tokens"
            options={{
              headerShown: false,
              presentation: "card",
            }}
          />
        </Stack>
      )}
    </>
  );
}
