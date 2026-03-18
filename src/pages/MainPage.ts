import { BasePage } from "./BasePage";

export class MainPage extends BasePage {
  async completeInitialMainPageSteps(): Promise<void> {
    // await this.waitAndTapText("Share Location");
    await this.waitAndTapText("Driver");
    await this.waitAndTapText("I already have companions");
    await this.waitAndTapText("Enter");
  }
}
