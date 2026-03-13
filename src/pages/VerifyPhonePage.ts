import { BasePage } from "./BasePage";
import { generateRandomSpanishMobileNumber } from "../utils/dataGenerators";

export class VerifyPhonePage extends BasePage {
  async completeVerifyPhoneStep(): Promise<void> {
    await this.waitForText("Verify your phone number");
    await this.waitAndTypeByClass(
      "android.widget.EditText",
      generateRandomSpanishMobileNumber()
    );
    await this.waitAndTapByClass("android.widget.CheckBox");
    await this.waitAndTapText("Next");
  }
}
