import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

function quoteArg(arg: string): string {
  if (/[\s"]/g.test(arg)) {
    return `"${arg.replace(/"/g, '\\"')}"`;
  }
  return arg;
}

function spawnCommand(command: string, env: NodeJS.ProcessEnv) {
  if (process.platform === "win32") {
    return spawn("cmd.exe", ["/d", "/s", "/c", command], {
      cwd: process.cwd(),
      env,
      stdio: "inherit",
    });
  }

  return spawn("sh", ["-lc", command], {
    cwd: process.cwd(),
    env,
    stdio: "inherit",
  });
}

function formatRunTs(date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(
    date.getDate()
  )}-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForAppiumStatus(url: string, timeoutMs = 30000): Promise<void> {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        return;
      }
    } catch {
      // ignore retries
    }
    await wait(1000);
  }
  throw new Error(`Appium no respondio en ${url} dentro de ${timeoutMs}ms`);
}

async function main(): Promise<void> {
  const runDir = path.resolve(process.cwd(), "reports", `run-${formatRunTs()}`);
  const appiumDir = path.join(runDir, "appium");
  const appiumPort = "4725";

  fs.mkdirSync(appiumDir, { recursive: true });

  const appiumLogPath = path.join(appiumDir, "appium.log");
  const appiumCmd = [
    "appium",
    "--base-path",
    "/",
    "--port",
    appiumPort,
    "--log",
    quoteArg(appiumLogPath),
  ].join(" ");

  const appium = spawnCommand(appiumCmd, process.env);

  const appiumStartup = new Promise<void>((resolve, reject) => {
    appium.once("spawn", resolve);
    appium.once("error", (error) => {
      reject(
        new Error(
          `No se pudo iniciar Appium (appium). Verifica instalacion global y PATH. Causa: ${
            error instanceof Error ? error.message : String(error)
          }`
        )
      );
    });
  });

  try {
    await appiumStartup;
    await waitForAppiumStatus(`http://127.0.0.1:${appiumPort}/status`, 45000);

    const mocha = spawnCommand(
      "npx mocha -r ts-node/register src/tests/**/*.spec.ts --timeout 240000",
      {
        ...process.env,
        REPORT_RUN_DIR: runDir,
        APPIUM_PORT: appiumPort,
      }
    );

    const mochaExitCode: number = await new Promise((resolve, reject) => {
      mocha.on("error", reject);
      mocha.on("exit", (code) => resolve(code ?? 1));
    });

    process.exitCode = mochaExitCode;
  } finally {
    appium.kill("SIGTERM");
  }
}

main().catch((error) => {
  console.error("[REPORT RUNNER] Error:", error);
  process.exitCode = 1;
});
