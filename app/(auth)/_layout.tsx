import { Redirect, Stack } from "expo-router";
import { useAuth, useUser } from "@clerk/clerk-expo";

export default function AuthRoutesLayout() {
  const { user } = useUser();
  const { isSignedIn } = useAuth();

  // if (user || isSignedIn) {
  //   return <Redirect href={"/(home)/(tabs)/explore"} />;
  // }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
