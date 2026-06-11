const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);
// Permitir importar archivos .md como assets (pantallas de docs).
config.resolver.assetExts = [...config.resolver.assetExts, "md"];

module.exports = withNativeWind(config, { input: "./global.css" });
