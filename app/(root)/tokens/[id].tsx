import { Text } from "react-native";
import React from "react";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

const Token = () => {
  const { id } = useLocalSearchParams;
  return (
    <SafeAreaProvider>
      <Text>Token {id}</Text>
    </SafeAreaProvider>
  );
};

export default Token;
