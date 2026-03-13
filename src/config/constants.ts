import path from "node:path";

export const APPIUM_SERVER = {
  hostname: process.env.APPIUM_HOST ?? "127.0.0.1",
  port: Number(process.env.APPIUM_PORT ?? 4723),
  path: process.env.APPIUM_PATH ?? "/",
};

export const DEVICE = {
  udid: process.env.ANDROID_UDID ?? "emulator-5554",
};

export const APP = {
  apkPath:
    process.env.APK_PATH ??
    path.resolve(process.cwd(), "resources", "tribbu.apk"),
  appPackage: process.env.APP_PACKAGE ?? "com.hoopcarpool.staging",
  appActivity:
    process.env.APP_ACTIVITY ??
    "com.hoopcarpool.core.features.main.MainHoopActivity",
};

export const TEST_DATA = {
  madrid: { latitude: 40.4168, longitude: -3.7038 },
  timezone: "Europe/Madrid",
};

export const ADB_PATH =
  process.env.ADB_PATH ??
  "C:\\Users\\tomas\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Google.PlatformTools_Microsoft.Winget.Source_8wekyb3d8bbwe\\platform-tools\\adb.exe";
