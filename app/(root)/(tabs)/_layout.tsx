import { View, Text, Image } from "react-native";
import React from "react";
import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Entypo from "@expo/vector-icons/Entypo";
import FontAwesome from "@expo/vector-icons/FontAwesome";

const TabIcon = ({
  focused,
  Icon,
  name,
  title,
}: {
  focused: boolean;
  Icon: any;
  name: string;
  title: string;
}) => (
  <View className="flex-1 mt-1.5 flex flex-col items-center">
    {/* <Image
      source={icon}
      tintColor={focused ? "#0061FF" : "#666876"}
      resizeMode="contain"
      className="size-6"
    /> */}
    <Icon name={name} size={25} color={`${focused ? "#86EEAC" : "#FFF"}`} />
    <Text
      className={`${
        focused ? "text-green-300" : "text-white"
      } text-xs w-full text-center mt-1`}
    >
      {title}
    </Text>
  </View>
);

const TabsLayout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "#0A0F0D",
          position: "absolute",
          borderTopColor: "#1A231E",
          borderTopWidth: 1,
          minHeight: 70,
        },
      }}
    >
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name="home"
              Icon={Ionicons}
              focused={focused}
              title="Home"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="newlistings"
        options={{
          title: "New",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name="wpexplorer"
              Icon={FontAwesome6}
              focused={focused}
              title="New Listings"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: "Wallet",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name="wallet"
              Icon={Entypo}
              focused={focused}
              title="Wallet"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="p2p"
        options={{
          title: "P2P",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name="people"
              Icon={Ionicons}
              focused={focused}
              title="P2P"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name="cog"
              Icon={FontAwesome}
              focused={focused}
              title="Settings"
            />
          ),
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;
