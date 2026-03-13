import { getNifFromWebOrFallback } from "../utils/dniProvider";

async function main(): Promise<void> {
  const nif = await getNifFromWebOrFallback();
  console.log(`[DNI TEST] NIF obtenido: ${nif}`);
}

main().catch((error) => {
  console.error("[DNI TEST] Error ejecutando prueba de DNI:", error);
  process.exitCode = 1;
});
