# Tribbu Onboarding QA Automation

Automatizacion del happy path de onboarding en Android usando Appium + TypeScript + Page Object Model.

## 1. Requisitos e Instrucciones De Ejecucion

### Prerrequisitos

- Sistema operativo Windows 10/11
- Node.js 18+
- npm 9+
- Android Studio instalado
- Android SDK + Platform Tools (adb) instalados
- Emulador Android creado y funcionando (ejemplo: `emulator-5554`)
- Appium 2 instalado globalmente
- Driver UiAutomator2 instalado en Appium
- Google Chrome instalado (para obtener DNI dinamico via Playwright)
- APK ubicado en `resources/tribbu.apk` (ver `resources/README.md`)

### Instalacion inicial

```bash
npm install
```

Instalar Appium y driver (si no estan ya instalados):

```bash
npm i -g appium
appium driver install uiautomator2
```

Verificar driver:

```bash
appium driver list --installed
```

### Configuracion del dispositivo

El flujo depende de ubicacion y zona horaria en Espana. El proyecto ya lo aplica por pre-hook en cada corrida:

- GPS: Madrid (`40.4168, -3.7038`)
- Timezone: `Europe/Madrid`

Si necesitas validar manualmente:

```bash
adb -s emulator-5554 shell getprop persist.sys.timezone
adb -s emulator-5554 shell date
```

### Comandos de ejecucion

### Como levantar Appium

Modo manual (recomendado para `npm test`):

1. Levantar Appium en una terminal:

```bash
appium --base-path /
```

2. Verificar que responde:

```bash
curl http://127.0.0.1:4723/status
```

3. En otra terminal, ejecutar los tests:

```bash
npm test
```

Notas:

- Si el puerto `4723` esta ocupado, cierra el proceso existente o usa otro puerto.
- Para detener Appium manual, usa `Ctrl + C` en su terminal.

Modo automatico con reportes:

- `npm run test:report` levanta Appium automaticamente en puerto `4725`, ejecuta pruebas y lo cierra al terminar.

### Pre-commit checks y convención de commits

El repositorio usa `husky` + `commitlint` para validar calidad antes de cada commit.

- Hook `pre-commit`: ejecuta `npm run lint`.
- Hook `commit-msg`: valida formato Conventional Commits (`feat:`, `fix:`, `chore:`, etc.).

Ejemplos validos:

- `feat: add friend code validation step`
- `fix: stabilize stale element on DNI page`
- `docs: improve execution instructions`

Ejemplo invalido:

- `update test`

Ejecucion smoke principal:

```bash
npm test
```

Probar solo obtencion de DNI dinamico:

```bash
npm run test:dni
```

Ejecucion con reportes completos (screenshots + html + appium log):

```bash
npm run test:report
```

## 2. Mini Plan De Pruebas

| Que se prueba | Nombre app | Entorno | Scenarios cubiertos | Pantallas cubiertas | Datos de prueba | Criterio de exito | Riesgos |
|---|---|---|---|---|---|---|---|
| Onboarding happy path end-to-end | HoopCarpool staging (`com.hoopcarpool.staging`) | QA | Preguntas iniciales, telefono, OTP, datos personales, bono energetico (DNI), codigo amigo, llegada a vista final | MainPage, VerifyPhonePage, OtpPage, NamePage, DNIPage, FriendCodePage, LandingPage | Telefono random ES (`6XXXXXXXX`), OTP `111111`, Nombre `Tomas`, Apellido `Fleiderman`, DNI dinamico desde web, codigo amigo `MARIOM-0956` | Se alcanza vista final con texto `Post your first ride and match with other people` | Ubicacion no Madrid, zona horaria no Madrid, elementos dinamicos/stale, latencia de UI |
| Verificacion de codigo amigo | HoopCarpool staging | QA | Ingreso y validacion de codigo amigo | FriendCodePage | `MARIOM-0956` | Aparece texto `Code successfully verified` | Toast/mensaje tarda en aparecer |
| Consistencia de precondiciones tecnicas | HoopCarpool staging | QA | Validacion de timezone y GPS previas a la corrida | Pre-hook ADB | Timezone `Europe/Madrid`, GPS Madrid | No falla OTP por timezone y app detecta Espana | Cambios manuales en emulador entre corridas |

## 3. Obtencion Dinamica Del DNI (Playwright)

Implementacion en `src/utils/dniProvider.ts`.

Flujo:

1. Busca ruta de Chrome local en rutas tipicas de Windows.
2. Lanza Chromium en modo headless usando `playwright-core`.
3. Navega a `https://generador-de-dni.es/dni/`.
4. Hace click en `#nif`.
5. Lee `#result_nif`.
6. Valida formato `^\\d{8}[A-Z]$`.
7. Devuelve ese NIF para usarlo en `DNIPage`.

Fallback:

- Si Chrome no existe o falla la web, usa generador local (`generateRandomDni`) para no romper la ejecucion.

## 4. Dependencias Y Stack Usado

### Stack

- TypeScript
- Node.js
- Appium 2 + UiAutomator2
- WebdriverIO (cliente de automatizacion)
- Mocha (runner)
- Playwright Core (DNI dinamico en web)

### Dependencias del proyecto

- `webdriverio`
- `mocha`
- `typescript`
- `ts-node`
- `playwright-core`
- `@types/node`
- `@types/mocha`

## 5. Page Object Model

Estructura POM en `src/pages/`:

- `BasePage.ts`: helpers comunes (`waitForText`, `waitAndTapText`, etc.)
- `MainPage.ts`: preguntas iniciales y entrada
- `VerifyPhonePage.ts`: telefono + TyC + next
- `OtpPage.ts`: ingreso OTP + next
- `NamePage.ts`: nombre/apellido + next
- `DNIPage.ts`: ingreso de DNI + activate
- `FriendCodePage.ts`: codigo amigo + verify + validacion
- `LandingPage.ts`: assert de vista final

Beneficios:

- Mantenibilidad por pantalla
- Reutilizacion de helpers comunes
- Menor acoplamiento entre test y locators

## 6. Reportes (Screenshots, Logs Appium, HTML)

### Carpeta de salida

Cada corrida genera carpeta unica en:

- `reports/run-YYYYMMDD-HHMMSS/`

Contenido esperado:

- `report.html`
- `screenshots/*.png` (timestamp + nombre del paso)
- `appium/appium.log`

### Como se genera

- Runner: `src/scripts/runWithReports.ts`
- Manager de reporte: `src/reporting/reportManager.ts`
- Test instrumentado en `src/tests/smoke-launch.spec.ts`

### Convencion de screenshot

Formato de nombre:

- `YYYYMMDD-HHMMSS-step-name.png`

Ejemplos:

- `20260312-223307-main-page-completed.png`
- `20260312-223322-dni-page-completed.png`

### Nota operativa

`test:report` levanta Appium en puerto dedicado (`4725`) para evitar conflictos con servidores Appium ya activos.

### Evidencia en video

Video de ejecucion:

- https://drive.google.com/file/d/1O5rrbi6SY3tmj4NjcnlxJEm-Ix0hdqC9/view?usp=sharing
