import { BasePage } from "./BasePage";

export class NamePage extends BasePage {
  async completeNameStep(): Promise<void> {
    await this.waitForText("We need to get to know you...");

    const firstNameInput = await this.driver.$("(//android.widget.EditText)[1]");
    await firstNameInput.waitForDisplayed({
      timeout: 45000,
      timeoutMsg: "No se encontro visible el campo de nombre.",
    });
    await firstNameInput.setValue("Tomas");

    const lastNameInput = await this.driver.$("(//android.widget.EditText)[2]");
    await lastNameInput.waitForDisplayed({
      timeout: 45000,
      timeoutMsg: "No se encontro visible el campo de apellido.",
    });
    await lastNameInput.setValue("Fleiderman");

    await this.waitAndTapText("Next");
  }
}
