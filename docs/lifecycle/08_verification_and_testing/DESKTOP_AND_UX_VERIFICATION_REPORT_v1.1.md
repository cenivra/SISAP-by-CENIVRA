# Reporte Consolidado de Verificación Desktop, Gobernanza y UX/UI — SISAP v1.1.0

## Control Documental

| Campo | Valor |
|---|---|
| **Código documental** | `SISAP-LC-008-DESK` |
| **Rama verificada** | `release/1.1.0` |
| **Fecha de ejecución** | 2026-11-23 |
| **Estado** | **Aprobado en verificación local integral (sin publicar a GitHub)** |

---

## 1. Resumen de Ejecuciones Automatizadas (Post-Última Edición de Código)

| Suite / Herramienta | Comando | Resultado Observado | Alcance |
|---|---|---|---|
| **Auditoría estática y SHA-256** | `npm run qa:audit` | **PASS** (`0` errores, `0` advertencias, `5/5` checks) | Secretos, rutas locales, patrones inseguros y `8/8` artefactos Autoencoder |
| **Compilación TypeScript** | `npm run lint` (`tsc --noEmit`) | **PASS** (`exit 0`) | Todo el frontend React/TS |
| **Pruebas unitarias e integración** | `npm run test:all` | **PASS** (`43/43`: `37` backend + `6` frontend, `0` fallos, `0` omitidas) | Gobernanza `AE-06..07`, SQLite `T-01..10`, Motores `MOT-01..02`, Psicométrico `PSYC-01..11`, Monitorización `MON-01..02`, Seguridad, Frontend `FE-01..06` |
| **Build de producción SPA** | `npm run build` (`vite build`) | **PASS** | Bundle cliente en `dist/` |
| **Pruebas E2E Chromium reales** | `npm run test:e2e` | **PASS** (`12/12` flujos `E2E-01`..`E2E-12`) | Incluye `E2E-10` con headers RBAC (`admin` autorizado en `24v`, `psicologo` bloqueado con `403` en override y cambio de modelo, verificación de 8 campos en `model_runs`) |
| **Empaquetado Windows x64** | `npm run dist:win` | **PASS** | `SISAP-by-CENIVRA-Setup-1.1.0-x64.exe` y `SISAP-by-CENIVRA-Portable-1.1.0-x64.exe` |
| **Instalación limpia Windows** | `verify_windows_installer.mjs` | **PASS** (`10/10` pasos) | Instalación NSIS silenciosa, accesos directos, SQLite en `%APPDATA%`, cierre sin huérfanos, reapertura, actualización sin pérdida de BD, fallback puerto `8081`, desinstalación preservando BD |
| **Validación visual multi-viewport** | `capture_visual_evidence.mjs` | **PASS** (`8/8` PNGs inspeccionados) | `1440×900` y `1280×800` sobre vistas clave |

---

## 2. Verificación de Preservación de `v1.0.0` y `main`

- Tag `v1.0.0`: `defbfc4e42f9e7cc78fe334bffbf56d68e5a7945` (intacto).
- Rama `main`: `ea500b34d9db37ee7c7c3e3f9f0b0345f2f2da1f` (intacta).
- Rama activa de trabajo: `release/1.1.0` (sin `git push` ni publicación de release hasta aprobación directa del usuario).
