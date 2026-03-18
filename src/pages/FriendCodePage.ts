import { BasePage } from "./BasePage";

export class FriendCodePage extends BasePage {
  async completeFriendCodeStep(): Promise<void> {
    const friendCodeInput = await this.driver.$("//android.widget.EditText");

    await friendCodeInput.waitForDisplayed({
      timeout: 45000,
      timeoutMsg: "No se encontro visible el campo de codigo de amigo.",
    });

    await friendCodeInput.click();
    // add a sleep of 3 seconds to ensure the keyboard is fully visible before typing
    await this.driver.pause(3000);
    await friendCodeInput.setValue("MARIOM-0956");
    await this.waitAndTapText("Verify");
    await this.waitForText("Code successfully verified");
  }
}
