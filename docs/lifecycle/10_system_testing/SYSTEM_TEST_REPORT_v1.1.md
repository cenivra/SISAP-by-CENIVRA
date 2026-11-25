# Informe de Pruebas del Sistema y Compilación — SISAP v1.1

## Control Documental

| Campo | Valor |
|---|---|
| **Código documental** | `SISAP-LC-010` |
| **Título** | Informe de Pruebas del Sistema, Compilación e Instalación Limpia (IEC 62304 §5.7) |
| **Versión** | `1.1.0-draft` |
| **Estado** | **En revisión** |
| **Fecha de creación** | 2026-11-23 |
| **Última actualización** | 2026-11-23 |
| **Autor / Responsable** | Equipo de Verificación e Ingeniería — SISAP by CENIVRA |
| **Revisor y aprobación** | **Pendiente de revisión formal** |
| **Documentos relacionados** | `SISAP-LC-002` · `SISAP-LC-008` · `SISAP-LC-009` · `SISAP-LC-011` |

### Historial de Cambios

| Versión | Fecha | Descripción | Responsable |
|---|---|---|---|
| `1.1.0-draft` | 2026-11-23 | Registro de pruebas de sistema: verificación estática TS, build Vite, ciclo limpio SQLite en directorio aislado, higiene de repositorio y verificación de suites R. | Equipo de Ingeniería SISAP |

---

## 1. Resumen de Verificaciones de Sistema Ejecutadas

| Prueba de Sistema | Comando / Procedimiento | Resultado Observado | Fecha / Estado |
|---|---|---|---|
| **Verificación estática TypeScript** | `npm run lint` (`tsc --noEmit`) | `0` errores de compilación ni discrepancias de tipos en `src/`. | **PASS** (2026-11-23) |
| **Empaquetado Frontend SPA** | `npm run build` (`vite build`) | **`1718 modules transformed`**, compilación completada en **`2.93s`**, `0` errores. | **PASS** (2026-11-23) |
| **Instalación limpia SQLite y Migraciones** | `SISAP_DB_DIR=<temp>` → `node backend/src/cli/init-db.js` → `seed-fixtures.js` → `health.js` → limpieza temporal | `migrationsApplied: 3` (`001_initial_schema`, `002_intelligence_engines`, `003_psychometric_center`), `tables: 15`, `missingTables: []`, `foreignKeysEnabled: true`, `ok: true`. | **PASS** (2026-11-23) |
| **Resolución de dependencias SOUP** | `npm ls --depth=0` | Árbol de dependencias resuelto limpiamente sin conflictos ni paquetes faltantes. | **PASS** (2026-11-23) |
| **Suite científica R** | `Rscript.exe` sobre los 5 scripts en `engines/autoencoder/tests/` | `test_dimensiones_latentes.R`, `test_esquema_datos.R`, `test_preprocesamiento.R`, `test_scoring_escalas.R` → **PASS**; `test_regresion_original.R` → omisión controlada `[INFO] Defina SISAP_EXCEL_CANONICO...` en entorno público. | **PASS** (4/4 unitarias R + 1 controlada) |
| **Higiene de secretos, rutas y datos PHI** | `rg -n "C:\\\\Users|ZARAKA|AIzaSy" src backend engines` + inspección `git diff --name-only main..release/1.1.0` | `NO_PATHS_OR_SECRETS_FOUND`; cero `.sqlite3`, `.db`, `.env`, `.exe`, `.msi`, `.blockmap` o `.xlsx` en el diff. | **PASS** (2026-11-23) |

---

## 2. Verificación Comparativa Independiente `v1.0.0` vs `v1.1.0` (Expediente `SISAP-VV-*`)

Se ejecutó instalación limpia aislada en entornos independientes para el tag histórico `v1.0.0` (`127.0.0.1:18081`) y la candidata `release/1.1.0` (`127.0.0.1:18082`), además de migración y reversión sobre copia aislada en Entorno C:
- [`v1.0.0_installation_test.md`](version_comparison_v1.0.0_vs_v1.1.0/v1.0.0_installation_test.md) (`SISAP-VV-INST-100`) — `15/15 PASS`, `1706` módulos en `2.31s` (con observación `PRB-007`).
- [`new_release_installation_test.md`](version_comparison_v1.0.0_vs_v1.1.0/new_release_installation_test.md) (`SISAP-VV-INST-110`) — `33/33 PASS`, `1717` módulos sin `.json` en `2.27s` (`1718` en árbol completo en `2.15s`).
- [`version_comparison_report.md`](version_comparison_v1.0.0_vs_v1.1.0/version_comparison_report.md) (`SISAP-VV-CMP-001`) — Matriz de 13 dimensiones, benchmark de 50 iteraciones, migración `1 → 3` (`10 → 15` tablas) y reversión confirmada.
- [`regression_test_report.md`](version_comparison_v1.0.0_vs_v1.1.0/regression_test_report.md) (`SISAP-VV-REG-110`) — `0` funciones rotas.
- [`new_features_test_report.md`](version_comparison_v1.0.0_vs_v1.1.0/new_features_test_report.md) (`SISAP-VV-NEW-110`) — Verificación funcional Autoencoder + 6 escalas + Motores 2–5.
- [`known_issues.md`](version_comparison_v1.0.0_vs_v1.1.0/known_issues.md) (`SISAP-VV-ISS-110`) — Defectos cerrados (`PRB-001..007`) y limitaciones abiertas (`OPEN-01..06`).
- [`release_readiness_report.md`](version_comparison_v1.0.0_vs_v1.1.0/release_readiness_report.md) (`SISAP-VV-RDY-110`) — Evaluación de los 10 criterios de autorización.

---

## 3. Pruebas de Sistema Pendientes Antes de Liberación Pública Definitiva

1. **Generación y prueba de humo del instalador Windows (`npm run dist:win`):** pendiente de ejecución sobre entorno de empaquetado final cuando el responsable autorice liberar `v1.1.0`.
2. **Evaluación de usabilidad clínica con usuarios previstos (`PsychometricCenterView.tsx` y `IntelligenceEcosystemView.tsx`):** pendiente de protocolo observado con personal clínico en computadora y tableta (`OPEN-04`).
