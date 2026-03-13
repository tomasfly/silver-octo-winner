import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { ADB_PATH, DEVICE, TEST_DATA } from "../config/constants";

const execFileAsync = promisify(execFile);

export async function runAdb(
  args: string[],
  options: { allowFailure?: boolean } = {}
): Promise<string> {
  try {
    const { stdout, stderr } = await execFileAsync(ADB_PATH, [
      "-s",
      DEVICE.udid,
      ...args,
    ]);
    const output = `${stdout ?? ""}${stderr ?? ""}`.trim();
    return output;
  } catch (error: any) {
    if (options.allowFailure) {
      return (error?.stdout ?? error?.message ?? "").toString().trim();
    }
    throw error;
  }
}

export async function ensureDeviceOnline(): Promise<void> {
  const output = await runAdb(["get-state"], { allowFailure: true });
  if (!output.toLowerCase().includes("device")) {
    throw new Error(
      `El emulador ${DEVICE.udid} no esta online. Output adb: ${output}`
    );
  }
}

export async function configureSpainPreconditions(): Promise<void> {
  const { latitude, longitude } = TEST_DATA.madrid;

  await runAdb([
    "shell",
    "appops",
    "set",
    "com.android.shell",
    "android:mock_location",
    "allow",
  ]);

  await runAdb(["shell", "cmd", "location", "set-location-enabled", "true"]);

  await runAdb(
    [
      "shell",
      "cmd",
      "location",
      "providers",
      "add-test-provider",
      "gps",
      "--supportsAltitude",
      "--supportsSpeed",
      "--supportsBearing",
    ],
    { allowFailure: true }
  );

  await runAdb([
    "shell",
    "cmd",
    "location",
    "providers",
    "set-test-provider-enabled",
    "gps",
    "true",
  ]);

  await runAdb([
    "shell",
    "cmd",
    "location",
    "providers",
    "set-test-provider-location",
    "gps",
    "--location",
    `${latitude},${longitude}`,
    "--accuracy",
    "5",
  ]);

  // OTP validation in this app depends on Spain timezone.
  await runAdb([
    "shell",
    "settings",
    "put",
    "global",
    "auto_time_zone",
    "0",
  ]);
  await runAdb([
    "shell",
    "settings",
    "put",
    "global",
    "time_zone",
    TEST_DATA.timezone,
  ]);
  await runAdb([
    "shell",
    "cmd",
    "alarm",
    "set-timezone",
    TEST_DATA.timezone,
  ]);

  const currentTimezone = (
    await runAdb(["shell", "getprop", "persist.sys.timezone"], {
      allowFailure: true,
    })
  ).trim();

  if (currentTimezone !== TEST_DATA.timezone) {
    throw new Error(
      [
        `Zona horaria invalida para OTP. Actual: ${currentTimezone || "desconocida"}.`,
        `Configura manualmente el emulador en ${TEST_DATA.timezone} y vuelve a ejecutar.`,
        "Ruta sugerida: Settings > System > Date & time > Set time zone manually.",
      ].join(" ")
    );
  }
}
