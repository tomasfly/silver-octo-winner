import { BasePage } from "./BasePage";

export class OtpPage extends BasePage {
  async completeOtpStep(): Promise<void> {
    const firstOtpInput = await this.driver.$("(//android.widget.EditText)[1]");

    await firstOtpInput.waitForDisplayed({
      timeout: 45000,
      timeoutMsg: "No se encontro visible el primer campo OTP.",
    });

    await firstOtpInput.click();

    // Type OTP using keyboard events after focusing the first input.
    await this.driver.keys("111111");

    await this.waitAndTapText("Next");
  }
}
