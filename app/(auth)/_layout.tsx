import React from "react";
import { Stack } from "expo-router";
import useWalletStore from "@/hooks/walletStore";

export default function AuthRoutesLayout() {
  // We keep the routes accessible without redirects
  // Let the sign-in screen handle wallet validation

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
