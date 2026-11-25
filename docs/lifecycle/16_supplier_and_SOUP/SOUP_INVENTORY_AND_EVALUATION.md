# Inventario y Evaluación de Componentes de Terceros (SOUP) — SISAP v1.1

## Control Documental

| Campo | Valor |
|---|---|
| **Código documental** | `SISAP-LC-016` |
| **Título** | Inventario y Gestión de Riesgos de SOUP y Dependencias Externas (IEC 62304 §8.1.2) |
| **Versión** | `1.1.0-draft` |
| **Estado** | **En revisión** |
| **Fecha de creación** | 2026-11-23 |
| **Última actualización** | 2026-11-23 |
| **Autor / Responsable** | Equipo de Ingeniería y Configuración — SISAP by CENIVRA |
| **Revisor y aprobación** | **Pendiente de revisión formal** |
| **Documentos relacionados** | `SISAP-LC-004` (`RSK-011`) · `SISAP-LC-014` · [`package-lock.json`](../../../sisap-by-cenivra-%E2%80%94-sistema-de-informaci%C3%B3n-cl%C3%ADnica-y-gobernanza/package-lock.json) |

### Historial de Cambios

| Versión | Fecha | Descripción | Responsable |
|---|---|---|---|
| `1.1.0-draft` | 2026-11-23 | Inventario completo y evaluado de runtimes, bases de datos y dependencias npm/R verificadas directamente en el entorno y `package-lock.json` de `release/1.1.0`. | Equipo de Ingeniería SISAP |

---

## 1. Inventario Evaluado de SOUP (10 Atributos Obligatorios)

| Nombre y Proveedor | Versión Exacta Verificada | Finalidad en SISAP | Licencia | Dependencias Relevantes | Riesgos Conocidos | Vulnerabilidades Relevantes | Estrategia de Actualización | Pruebas de Compatibilidad | Justificación de Uso |
|---|---|---|---|---|---|---|---|---|---|
| **Node.js Runtime** (OpenJS Foundation) | `v24.22.1` (`>=22.5.0` requerido) | Ejecución del backend HTTP loopback, CLI de BD, tests y motor JS del Autoencoder | MIT / OpenJS | `node:sqlite`, `node:http`, `node:crypto`, `node:test` | Cambios experimentales en módulos nativos entre ramas mayores | Seguimiento de avisos de seguridad Node LTS | Fijación `>=22.5.0` en `package.json`; actualización controlada por parche menor | `npm test` `33/33 PASS` y CLI `init-db/health` | Elimina módulos C++ externos (`better-sqlite3`) usando `node:sqlite` integrado y criptografía nativa |
| **SQLite (vía `node:sqlite`)** (Hwaci / SQLite Consortium) | Integrada en Node `v24.22.1` | Persistencia relacional local WAL de las 15 tablas y triggers WORM | Dominio Público | Ninguna externa | Bloqueo de archivo si proceso muere abruptamente sin WAL; desactivación accidental de FKs | Revisión de avisos SQLite vía parches de Node.js | Actualizado junto con runtime Node.js; `PRAGMA foreign_keys = ON` forzado al abrir conexión | `T-01`, `T-02`, `T-09`, `T-10`, `health.js` | Base local autónoma sin servidor externo, ideal para privacidad *local-first* y transacciones atómicas |
| **Electron** (OpenJS Foundation / Electron) | `45.0.0` (dev/packaging desktop) | Contenedor nativo de escritorio Windows con aislamiento de contexto | MIT | Chromium, Node integrado | Exposición RCE si se habilita `nodeIntegration` o navegación externa | Boletines Chromium/Electron | Fijado en `package-lock.json`; `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true` en `main.cjs` | Revisión de `main.cjs` + build SPA | Permite distribuir aplicación offline independiente del navegador del sistema |
| **React / React DOM** (Meta Platforms, Inc.) | `19.3.1` | Renderizado modular de interfaz clínica, Centro Psicométrico y visualizaciones | MIT | `react-dom` `19.3.1` | Incompatibilidad de hooks si coexisten versiones múltiples | Avisos menores de XSS solo ante `dangerouslySetInnerHTML` (evitado) | Bloqueado vía `package-lock.json`; actualización verificada con `tsc` y `vite build` | `tsc --noEmit` + `vite build` (`1718` módulos) | Estándar maduro tipado para formularios clínicos complejos y gráficas SVG/HTML |
| **Express** (OpenJS Foundation) | `4.22.3` | Soporte/tipado de capa HTTP auxiliar en dependencias de la app | MIT | `body-parser`, etc. (`package-lock`) | Exposición si se configura sin CORS/loopback en red abierta | Seguimiento de CVEs Express 4.x | Mantenimiento dentro de `4.22.x` mediante `npm ci` reproducible | `npm ls --depth=0`, `security.test.js` | Compatibilidad estándar de infraestructura HTTP |
| **`@google/genai`** (Google LLC) | `2.30.0` | Conector opcional para capacidades generativas externas configurables por el usuario (desactivado sin clave local) | Apache-2.0 | SDK JS oficial Gemini | Envío accidental de PHI si se invocara con datos identificables | Riesgos de fugas por mal uso de API keys externas | Uso estrictamente opt-in sin credenciales embebidas (`NO_PATHS_OR_SECRETS_FOUND` en `rg`) | `npm ls --depth=0`, `vite build` | Dependencia declarada en plantilla; nunca se envían datos de pacientes desde motores clínicos `1..5` |
| **`firebase`** (Google LLC) | `13.0.0` | Conector opcional heredado de autenticación/servicios nube (inactivo en modo local SQLite) | Apache-2.0 | Módulos Firebase JS | Dependencia pesada de red si se activa en entorno offline | Revisión periódica de advisories Firebase | Mantenido fijo en `package-lock.json`; la persistencia oficial `v1.1` corre offline sobre SQLite | `vite build`, `npm ls` | Conservado por retrocompatibilidad de módulos opcionales sin interferir en operación local |
| **Vite / `@vitejs/plugin-react` / `@tailwindcss/vite`** | `8.3.4` / `6.1.2` / `4.3.3` | Empaquetado de compilación frontend y CSS (solo build-time) | MIT | `esbuild` `0.28.2`, `tailwindcss` `4.3.3`, `autoprefixer` `10.6.1` | Incompatibilidad de plugins durante upgrades mayores | Solo build-time; no corre en cliente final | Bloqueado en `package-lock.json` | `npm run build` (`2.93s`) | Compilación rápida y determinista del bundle SPA |
| **TypeScript / `tsx`** | `7.0.2` / `4.23.15` | Verificación estática de tipos en frontend (`tsc --noEmit`) | Apache-2.0 / MIT | `@types/node` `22.20.5`, `@types/react` `19.3.0`, `@types/express` `4.17.25` | Falsos positivos/negativos entre versión de tipos y runtime | Sin riesgo en runtime de producción | Actualización conjunta con definiciones `@types/*` | `npm run lint` (`0` errores) | Detecta incompatibilidades contractuales antes de compilar |
| **`lucide-react` / `motion` / `dotenv`** | `0.546.0` / `12.43.0` / `17.4.2` | Iconografía UI, transiciones y lectura de `.env` local (excluido de Git) | ISC / MIT / BSD-2-Clause | Ninguna crítica | Carga de `.env` con secretos si no se excluye en `.gitignore` | Ninguna relevante observada | Bloqueado en `package-lock.json`; `.gitignore` bloquea `.env*` | `npm run build`, `git status` | Ligereza y soporte estándar en interfaz y configuración |
| **`electron-builder` / `electron-packager`** | `26.18.0` / `17.1.2` | Generación de instaladores Windows NSIS (`.exe`) en tiempo de distribución | MIT / BSD-2-Clause | Herramientas NSIS Windows | Inclusión accidental de artefactos o datos locales si `build.files` es amplio | Solo build-time | Listado explícito de carpetas permitidas en `package.json` (`dist`, `electron`, `backend`, `engines`, `assets`) | Configuración revisada en `package.json` | Empaquetado estándar reproducible para Windows x64 |
| **R + paquete `jsonlite`** (R Foundation / CRAN) | `R >= 4.0` (probado en `R 4.6.1`) | Reproducibilidad científica externa y auditoría de paridad del Autoencoder (`engines/autoencoder/tests/*.R`) | GPL-2/3 / MIT | Base R | Diferencias numéricas menores `float32` vs `float64` si cambian versiones | Sin exposición de red | R no es obligatorio para el runtime Node/Electron; la paridad se prueba ante cambios en `R/01..07` | `4/4` suites unitarias R `PASS` + regresión | Mantiene vínculo auditable con el entorno estadístico original de la investigación CENIVRA |
| **Artefacto externo NLP `bsc-bio-ehr-es` (`modelo.onnx`)** | Parcial (`1.38 MB`) | Placeholder de artefacto Transformer biomédico en español (Motor 3) | Dependiente de origen público HuggingFace/BSC | Requeriría `onnxruntime-node` (NO instalado) | **Riesgo mitigado:** archivo incompleto (<20 MB) no contiene pesos completos | Inoperable para inferencia neuronal directa | Deshabilitada su inferencia (`inference_ready: false`); no asumido como operativo | `MOT-02`, `getNarrativeEngineRuntimeStatus()` | Se conserva trazabilidad transparente sin simular capacidades NLP neuronales no instaladas |
