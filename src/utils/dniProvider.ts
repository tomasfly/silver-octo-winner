import fs from "node:fs";
import { chromium } from "playwright-core";
import { generateRandomDni } from "./dataGenerators";

function getChromeExecutablePath(): string | null {
  const candidates = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`,
  ];

  for (const candidate of candidates) {
    if (candidate && fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
}

export async function getNifFromWebOrFallback(): Promise<string> {
  const chromePath = getChromeExecutablePath();

  if (!chromePath) {
    console.warn(
      "[DNI] Chrome no encontrado. Se usa fallback local de DNI random."
    );
    return generateRandomDni();
  }

  let browser: Awaited<ReturnType<typeof chromium.launch>> | null = null;

  try {
    browser = await chromium.launch({
      headless: true,
      executablePath: chromePath,
    });

    const page = await browser.newPage();
    await page.goto("https://generador-de-dni.es/dni/", {
      waitUntil: "domcontentloaded",
      timeout: 45000,
    });

    await page.locator("#nif").click({ timeout: 15000 });

    const resultLocator = page.locator("#result_nif");
    await resultLocator.waitFor({ state: "visible", timeout: 15000 });

    const generatedNif = (await resultLocator.textContent())?.trim() ?? "";

    if (!/^\d{8}[A-Z]$/.test(generatedNif)) {
      throw new Error(`NIF invalido obtenido de la web: ${generatedNif}`);
    }

    return generatedNif;
  } catch (error) {
    console.warn(
      `[DNI] Fallo obteniendo NIF de la web. Se usa fallback local. Motivo: ${String(
        error
      )}`
    );
    return generateRandomDni();
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
