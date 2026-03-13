import fs from "node:fs";
import path from "node:path";

export type StepStatus = "passed" | "failed";

export type StepRecord = {
  stepName: string;
  timestamp: string;
  screenshotRelativePath: string;
  status: StepStatus;
  details?: string;
};

function sanitizeFileName(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function timestampForFile(date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(
    date.getDate()
  )}-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

function timestampIso(date = new Date()): string {
  return date.toISOString();
}

export class ReportManager {
  private readonly runDir: string;
  private readonly screenshotsDir: string;
  private readonly steps: StepRecord[] = [];

  constructor() {
    this.runDir =
      process.env.REPORT_RUN_DIR ??
      path.resolve(process.cwd(), "reports", `run-${timestampForFile()}`);
    this.screenshotsDir = path.join(this.runDir, "screenshots");

    fs.mkdirSync(this.screenshotsDir, { recursive: true });
  }

  getRunDir(): string {
    return this.runDir;
  }

  async captureStep(
    driver: WebdriverIO.Browser,
    stepName: string,
    status: StepStatus = "passed",
    details?: string
  ): Promise<void> {
    const now = new Date();
    const ts = timestampForFile(now);
    const name = sanitizeFileName(stepName);
    const fileName = `${ts}-${name}.png`;
    const absolutePath = path.join(this.screenshotsDir, fileName);
    const relativePath = path.join("screenshots", fileName);

    const base64Image = await driver.takeScreenshot();
    fs.writeFileSync(absolutePath, base64Image, "base64");

    this.steps.push({
      stepName,
      timestamp: timestampIso(now),
      screenshotRelativePath: relativePath,
      status,
      details,
    });
  }

  writeHtmlReport(testName: string, testStatus: StepStatus, errorMessage?: string): void {
    const htmlPath = path.join(this.runDir, "report.html");

    const rows = this.steps
      .map((step, index) => {
        return `<tr>
<td>${index + 1}</td>
<td>${step.stepName}</td>
<td>${step.timestamp}</td>
<td>${step.status}</td>
<td>${step.details ?? ""}</td>
<td><a href="${step.screenshotRelativePath}">open</a></td>
</tr>`;
      })
      .join("\n");

    const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Onboarding Execution Report</title>
<style>
body { font-family: Arial, sans-serif; margin: 24px; }
h1 { margin-bottom: 4px; }
.summary { margin-bottom: 20px; }
table { width: 100%; border-collapse: collapse; }
th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
th { background: #f3f3f3; }
.ok { color: #0b7a3b; font-weight: bold; }
.fail { color: #b00020; font-weight: bold; }
</style>
</head>
<body>
<h1>Onboarding Execution Report</h1>
<div class="summary">
<div><strong>Test:</strong> ${testName}</div>
<div><strong>Status:</strong> <span class="${
      testStatus === "passed" ? "ok" : "fail"
    }">${testStatus.toUpperCase()}</span></div>
<div><strong>Run directory:</strong> ${this.runDir}</div>
<div><strong>Appium log:</strong> appium/appium.log</div>
${errorMessage ? `<div><strong>Error:</strong> ${errorMessage}</div>` : ""}
</div>
<table>
<thead>
<tr>
<th>#</th>
<th>Step</th>
<th>Timestamp</th>
<th>Status</th>
<th>Details</th>
<th>Screenshot</th>
</tr>
</thead>
<tbody>
${rows}
</tbody>
</table>
</body>
</html>`;

    fs.writeFileSync(htmlPath, html, "utf8");
  }
}
