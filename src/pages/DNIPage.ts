import { BasePage } from "./BasePage";

export class DNIPage extends BasePage {
  async completeDniStep(dni: string): Promise<void> {
    const dniInput = await this.driver.$("(//android.widget.EditText)[2]");

    await dniInput.waitForDisplayed({
      timeout: 45000,
      timeoutMsg: "No se encontro visible el campo DNI (segundo EditText).",
    });

    await dniInput.click();
    await dniInput.setValue(dni);
    await this.waitAndTapText("Activate");
  }
}
