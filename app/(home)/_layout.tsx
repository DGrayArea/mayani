import "../../crypto-polyfill";
import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, StyleSheet, Platform } from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AppLayout() {
  const { user, isLoaded, isSignedIn } = useUser();

  if (!isLoaded) {
    return (
      <SafeAreaView className="bg-white h-full flex justify-center items-center">
        <ActivityIndicator className="text-primary-300" size="large" />
      </SafeAreaView>
    );
  }

  if (!isSignedIn) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <>
      {Platform.OS === "android" ? (
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
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
        </SafeAreaView>
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0A0F0D", // Match your gradient start color
    marginTop: 0,
    marginBottom: 0,
  },
  // ...rest of your styles
});
