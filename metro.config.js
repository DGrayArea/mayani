const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules.crypto = require.resolve("expo-crypto");

module.exports = withNativeWind(config, { input: "./app/global.css" });
