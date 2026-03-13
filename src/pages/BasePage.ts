export class BasePage {
  constructor(protected readonly driver: WebdriverIO.Browser) {}

  protected byVisibleText(text: string): string {
    return `//*[@text="${text}" or @content-desc="${text}"]`;
  }

  protected async waitAndTapText(text: string, timeout = 45000): Promise<void> {
    const selector = this.byVisibleText(text);
    const element = await this.driver.$(selector);

    await element.waitForDisplayed({
      timeout,
      timeoutMsg: `No se encontro visible el texto: ${text}`,
    });

    await element.click();
  }

  protected async waitForText(text: string, timeout = 45000): Promise<void> {
    const selector = this.byVisibleText(text);
    const element = await this.driver.$(selector);

    await element.waitForDisplayed({
      timeout,
      timeoutMsg: `No se encontro visible el texto: ${text}`,
    });
  }

  protected async waitAndTypeByClass(
    className: string,
    value: string,
    timeout = 45000
  ): Promise<void> {
    const selector = `//${className}`;
    const element = await this.driver.$(selector);

    await element.waitForDisplayed({
      timeout,
      timeoutMsg: `No se encontro visible el elemento con clase: ${className}`,
    });

    await element.setValue(value);
  }

  protected async waitAndTapByClass(
    className: string,
    timeout = 45000
  ): Promise<void> {
    const selector = `//${className}`;
    const element = await this.driver.$(selector);

    await element.waitForDisplayed({
      timeout,
      timeoutMsg: `No se encontro visible el elemento con clase: ${className}`,
    });

    await element.click();
  }
}
