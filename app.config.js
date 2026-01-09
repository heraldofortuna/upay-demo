/**
 * Configuración dinámica de Expo
 * Permite cambiar entre modos SDUI y OTA mediante variable de entorno
 */

module.exports = {
  expo: {
    name: "uPay Demo",
    slug: "upay-demo",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    updates: {
      enabled: true,
      checkAutomatically: "ON_LOAD",
      fallbackToCacheTimeout: 0
      // La URL se genera automáticamente con el projectId de EAS cuando ejecutas eas build:configure
    },
    runtimeVersion: {
      policy: "appVersion"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.upay.demo"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      package: "com.upay.demo",
      permissions: [
        "android.permission.NFC",
        "android.permission.READ_EXTERNAL_STORAGE"
      ],
      usesFeature: [
        "android.hardware.nfc"
      ]
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      eas: {
        projectId: "your-project-id"
      },
      // Inyectar APP_MODE como variable de entorno accesible
      appMode: process.env.EXPO_PUBLIC_APP_MODE || "sdui"
    }
  }
};
