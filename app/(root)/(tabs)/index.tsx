import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text className="font-bold text-5xl my-10 text-cyan-600">
        Welcome to Mayani
      </Text>
      <Link href="/sign-in">Sign In</Link>
      <Link href="/explore">Explore</Link>
      <Link href="/trending">Trending</Link>
      <Link href="/wallet">Wallet</Link>
      <Link href="/tokens/WETH">Token</Link>
    </View>
  );
}
