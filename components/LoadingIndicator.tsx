import * as React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export function LoadingIndicator() {
  return (
    <View style={styles.fill}>
      <ActivityIndicator size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
