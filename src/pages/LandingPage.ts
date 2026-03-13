import { BasePage } from "./BasePage";

export class LandingPage extends BasePage {
  async assertReachedPostFirstRideView(): Promise<void> {
    await this.waitForText("Post your first ride and match with other people");
  }
}
