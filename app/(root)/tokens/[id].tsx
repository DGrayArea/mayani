import { View, Text } from "react-native";
import React from "react";
import { useLocalSearchParams } from "expo-router";

const Token = () => {
  const { id } = useLocalSearchParams;
  return (
    <View>
      <Text>Token {id}</Text>
    </View>
  );
};

export default Token;
