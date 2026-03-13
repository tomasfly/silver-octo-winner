import fs from "node:fs";
import { remote } from "webdriverio";
import { APPIUM_SERVER, APP, DEVICE } from "../config/constants";
import { configureSpainPreconditions, ensureDeviceOnline } from "../utils/adb";
import { MainPage } from "../pages/MainPage";
import { VerifyPhonePage } from "../pages/VerifyPhonePage";
import { OtpPage } from "../pages/OtpPage";
import { NamePage } from "../pages/NamePage";
import { DNIPage } from "../pages/DNIPage";
import { getNifFromWebOrFallback } from "../utils/dniProvider";
import { FriendCodePage } from "../pages/FriendCodePage";
import { LandingPage } from "../pages/LandingPage";
import { ReportManager } from "../reporting/reportManager";

describe("Onboarding Smoke - Launch app", function () {
  this.timeout(240000);

  let driver: WebdriverIO.Browser;
  let mainPage: MainPage;
  let verifyPhonePage: VerifyPhonePage;
  let otpPage: OtpPage;
  let namePage: NamePage;
  let dniPage: DNIPage;
  let friendCodePage: FriendCodePage;
  let landingPage: LandingPage;
  let generatedNif: string;
  let reportManager: ReportManager;
  let testStatus: "passed" | "failed" = "passed";
  let testErrorMessage: string | undefined;

  before(async () => {
    reportManager = new ReportManager();

    if (!fs.existsSync(APP.apkPath)) {
      throw new Error(`No se encontro el APK en: ${APP.apkPath}`);
    }

    await ensureDeviceOnline();
    await configureSpainPreconditions();
    generatedNif = await getNifFromWebOrFallback();
    console.log(`[DNI] NIF usado en la ejecucion: ${generatedNif}`);

    driver = await remote({
      hostname: APPIUM_SERVER.hostname,
      port: APPIUM_SERVER.port,
      path: APPIUM_SERVER.path,
      capabilities: {
        platformName: "Android",
        "appium:automationName": "UiAutomator2",
        "appium:deviceName": DEVICE.udid,
        "appium:udid": DEVICE.udid,
        "appium:app": APP.apkPath,
        "appium:appPackage": APP.appPackage,
        "appium:appActivity": APP.appActivity,
        "appium:appWaitDuration": 120000,
        "appium:uiautomator2ServerInstallTimeout": 120000,
        "appium:uiautomator2ServerLaunchTimeout": 120000,
        "appium:androidInstallTimeout": 180000,
        "appium:adbExecTimeout": 120000,
        "appium:autoGrantPermissions": true,
        "appium:noReset": false,
        "appium:fullReset": true,
        "appium:newCommandTimeout": 300,
      },
    });

    mainPage = new MainPage(driver);
    verifyPhonePage = new VerifyPhonePage(driver);
    otpPage = new OtpPage(driver);
    namePage = new NamePage(driver);
    dniPage = new DNIPage(driver);
    friendCodePage = new FriendCodePage(driver);
    landingPage = new LandingPage(driver);
  });

  after(async () => {
    reportManager.writeHtmlReport(
      "Onboarding Smoke - Launch app",
      testStatus,
      testErrorMessage
    );

    if (driver) {
      await driver.deleteSession();
    }
  });

  it("should complete onboarding flow until final landing view", async () => {
    try {
      await driver.waitUntil(
        async () => (await driver.getCurrentPackage()) === APP.appPackage,
        {
          timeout: 45000,
          interval: 1000,
          timeoutMsg: "La app no quedo en foreground dentro del tiempo esperado.",
        }
      );
      await reportManager.captureStep(driver, "app-launched");

      await mainPage.completeInitialMainPageSteps();
      await reportManager.captureStep(driver, "main-page-completed");

      await verifyPhonePage.completeVerifyPhoneStep();
      await reportManager.captureStep(driver, "verify-phone-completed");

      await otpPage.completeOtpStep();
      await reportManager.captureStep(driver, "otp-completed");

      await namePage.completeNameStep();
      await reportManager.captureStep(driver, "name-page-completed");

      await dniPage.completeDniStep(generatedNif);
      await reportManager.captureStep(driver, "dni-page-completed", "passed", generatedNif);

      await friendCodePage.completeFriendCodeStep();
      await reportManager.captureStep(driver, "friend-code-completed");

      await landingPage.assertReachedPostFirstRideView();
      await reportManager.captureStep(driver, "landing-page-reached");

      testStatus = "passed";
    } catch (error: any) {
      testStatus = "failed";
      testErrorMessage = error?.message ?? String(error);
      if (driver) {
        await reportManager.captureStep(
          driver,
          "failure-state",
          "failed",
          testErrorMessage
        );
      }
      throw error;
    }
  });
});
