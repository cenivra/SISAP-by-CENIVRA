# SISAP by CENIVRA — Sistema de Información Clínica y Gobernanza

**Versión Canónica:** 1.0.0  
**Arquitectura:** React 19 + TypeScript + Tailwind CSS (Frontend) / Node.js + SQLite WAL (Backend Local) / Electron v45 (Escritorio Windows).  
**Entorno de Distribución:** Local-First, soberano, sin fuga de datos a la nube.

---

## 1. Requisitos del Sistema

| Componente | Requisito Mínimo | Versión Recomendada | Propósito / Verificación |
| :--- | :--- | :--- | :--- |
| **Node.js** | `>= 22.5.0` | `24.x LTS` | Soporte nativo para `node:sqlite` sin dependencias de compiladores C++ (`node-gyp`). Comprobar con `node -v`. |
| **npm** | `>= 10.0.0` | `11.x` | Resolución determinista de dependencias de empaquetado. Comprobar con `npm -v`. |
| **SO** | Windows 10/11 (64-bit) | Windows 11 x64 | Compatible con Linux y macOS para desarrollo y ejecución web. |
| **Conectividad** | Local-First | Autónomo | No requiere conexión a internet para su operación clínica local ordinaria. |

> [!IMPORTANT]
> Si la versión de Node.js es inferior a `22.5.0`, el backend local no podrá iniciar debido a que el módulo nativo `node:sqlite` fue introducido oficialmente en Node.js v22.5.0.

---

## 2. Instalación Rápida con un Solo Clic (Windows)

Para instalar y arrancar la aplicación de forma completamente automática en Windows:

1. Haz doble clic en el archivo:
   ```cmd
   instalar_y_ejecutar.bat
   ```
2. El script verificará automáticamente la versión de Node.js, instalará las dependencias si faltan, inicializará la base de datos local SQLite (`data/local/sisap_test.sqlite3`), levantará el microservicio backend en segundo plano (`127.0.0.1:8080`) y abrirá automáticamente tu navegador en `http://localhost:3000`.

---

## 3. Instalación y Ejecución Manual Paso a Paso

Si prefieres ejecutar los comandos de forma manual desde la terminal:

### Paso 1: Configuración Inicial de la Aplicación

SISAP opera de forma 100% autónoma y local (soberanía de datos sin requerir servicios en la nube). La integración con Google Drive / Firebase es estrictamente opcional. Sin embargo, para que el empaquetador Vite resuelva los módulos en tiempo de compilación y desarrollo, debe existir el archivo de configuración local a partir de la plantilla provista:

- **En Windows (PowerShell):**
  ```powershell
  if (-not (Test-Path firebase-applet-config.json)) { Copy-Item firebase-applet-config.json.example firebase-applet-config.json }
  ```
- **En Windows (CMD):**
  ```cmd
  if not exist firebase-applet-config.json copy firebase-applet-config.json.example firebase-applet-config.json
  ```
- **En Linux / macOS (Bash):**
  ```bash
  cp -n firebase-applet-config.json.example firebase-applet-config.json
  ```

*(No es necesario modificar los valores de ejemplo; el sistema detecta valores ficticios y opera automáticamente en modo local soberano).*

### Paso 2: Instalación Determinista de Dependencias

Para entornos de auditoría, integración continua o clonaciones limpias, utilice `npm ci`:

```bash
npm ci
```

*(En desarrollo activo puede utilizar `npm install`. La compatibilidad de dependencias entre Vite v8.3 y esbuild v0.28 está completamente sincronizada en `package-lock.json`, por lo que no se requieren banderas `--force` ni `--legacy-peer-deps`).*

### Paso 3: Verificación Técnica y Pruebas Automatizadas

Antes de arrancar la aplicación, se puede validar la integridad del backend y la compilación:

```bash
# Ejecutar suite de pruebas unitarias y de integración backend (15 pruebas con node:sqlite):
npm test
```
*Resultado verificado:* 15/15 pruebas pasadas (100% PASS) en ~1 segundo, verificando esquema relacional, migraciones idempotentes, búsquedas parametrizadas seguras ante inyección SQL y restricciones WORM.

```bash
# Validar compilación estática de producción:
npm run build
```
*Resultado verificado:* Compilación exitosa en `dist/` (1706 módulos transformados sin errores).

> [!NOTE]
> Las pruebas automatizadas verifican la integridad estructural, la consistencia del esquema y el aislamiento del proceso. No atribuyen validez diagnóstica clínica ni certifican la idoneidad para entornos médicos de producción sin una homologación institucional previa.

### Paso 4: Inicialización de la Base de Datos SQLite (Backend)

El backend almacena los registros clínicos locales en SQLite con modo WAL y bitácora inmutable WORM en `data/local/sisap_test.sqlite3`:

```bash
node backend/src/cli/init-db.js
```

Para sembrar perfiles de prueba sintéticos claramente etiquetados para evaluación técnica:
```bash
node backend/src/cli/seed-fixtures.js
```

### Paso 5: Puesta en Marcha del Backend y Frontend

1. **Backend Local (Terminal 1):**  
   El backend escucha exclusivamente en loopback local (`127.0.0.1:8080`) sin exponer puertos a la red externa:
   ```bash
   npm run backend
   ```
   Para comprobar su estado de salud:
   ```bash
   node backend/src/cli/health.js
   ```

2. **Frontend Vite (Terminal 2):**  
   ```bash
   npm run dev
   ```
   Abre tu navegador en `http://localhost:3000`.

*O de forma unificada en Windows:*
```cmd
iniciar_sisap.bat
```

---

## 4. Ejecución en Modo Escritorio (Electron)

SISAP incluye empaquetado para escritorio en Windows mediante Electron:

```bash
# Compila la interfaz y abre la ventana nativa de escritorio:
npm run desktop
```

O haciendo doble clic en:
```cmd
iniciar_escritorio.bat
```

Para generar el instalador de Windows (NSIS) en `dist-electron/`:
```bash
npm run dist:win
```

---

## 5. Cuentas de Acceso y Modo Demostración

La aplicación cuenta con usuarios sintéticos preconfigurados **exclusivamente para pruebas técnicas y evaluación de roles de acceso**. Todas las credenciales son ficticias y no corresponden a datos reales de usuarios ni pacientes:

| Rol Clínico / Perfil | Usuario Demo | Contraseña Demo | Segundo Factor (MFA) | Capacidades Demostrativas |
| :--- | :--- | :--- | :--- | :--- |
| **Psicólogo Clínico** | `psicologo` | `demo-clinico` | `123456` o `999111` | Captura de 6 escalas, notas de evolución, análisis dimensional. |
| **Director Clínico** | `director` | `demo-director` | `123456` o `999111` | Supervisión de casos, reidentificación auditada, reportes. |
| **Superadministrador** | `superadmin` | `demo-super` | `123456` o `999111` | Control total, bitácora de auditoría WORM, capa blindada. |
| **Administración** | `admin` | `demo-admin` | `123456` o `999111` | Gestión de cuentas e infraestructura (sin acceso a datos clínicos). |
| **Medicina / Psiquiatría** | `medicina` | `demo-medicina` | `123456` o `999111` | Desintoxicación, psicofarmacología, signos vitales. |
| **Trabajo Social** | `trabajador` | `demo-social` | `123456` o `999111` | Estudio socioeconómico y entrevistas familiares. |
| **Auditoría Externa** | `lectura` | `demo-lectura` | `123456` o `999111` | Inspección de calidad (CECAJ/COFEPRIS). Solo datos ciegos. |

*(El segundo factor MFA acepta los códigos maestros de evaluación `123456` o `999111`, así como el código TOTP dinámico visible en pantalla según la NOM-024-SSA3-2012).*

---

## 6. Delimitación del Módulo Autoencoder (Modo Sintético)

- **Modo Demostrativo:** En esta distribución pública, el módulo de autoencoder opera en modo `SYNTHETIC_DEMO`. La matriz de proyección (`DCT_WEIGHTS_24x12`) fue generada determinísticamente desde cero mediante bases ortonormales discretas (Transformada de Coseno Discreto Tipo II, DCT-II).
- **Transparencia Científica:** Los pesos de demostración permiten verificar el flujo de la interfaz, el cálculo dimensional y la visualización en radar, pero **NO poseen validez diagnóstica ni predictiva real**.
- **Desacoplamiento Ético:** Los modelos entrenados con cohortes clínicas reservadas de CENIVRA no forman parte de este repositorio público por motivos de confidencialidad y protección de datos sensibles.

---

## 7. Solución de Problemas Frecuentes

1. **Error: `Cannot find module 'node:sqlite'` o fallo al iniciar backend:**
   - *Causa:* Se está ejecutando una versión de Node.js inferior a la 22.5.0.
   - *Solución:* Descarga e instala Node.js >= 22.5.0 desde [nodejs.org](https://nodejs.org/). Comprueba con `node -v`.

2. **Error: `[UNRESOLVED_IMPORT] Could not resolve firebase-applet-config.json`:**
   - *Causa:* No se ha generado el archivo de configuración local a partir de la plantilla.
   - *Solución:* Copia `firebase-applet-config.json.example` a `firebase-applet-config.json` siguiendo el Paso 1 de la instalación manual.

3. **Ventana en blanco en Electron o error al servir archivos:**
   - *Causa:* No se ha generado la compilación estática en `dist/`.
   - *Solución:* Ejecuta `npm run build` antes de iniciar Electron, o utiliza `iniciar_escritorio.bat`, el cual compila automáticamente si detecta la ausencia de `dist/`.

4. **Conflicto de puertos (8080 o 3000 en uso):**
   - *Solución:* Verifica que no existan instancias previas huérfanas de `node.exe` en el Administrador de Tareas de Windows.
