# Matriz de Controles de Calidad y Monitorización Soberana — SISAP v1.1.0

## Control Documental

| Campo | Valor |
|---|---|
| **Código documental** | `SISAP-QA-009` |
| **Título** | Matriz Unificada de Controles Preventivos, Detectivos, Correctivos y Monitorización Operativa |
| **Versión** | `1.1.0-draft` |
| **Estado** | **En revisión** |
| **Fecha de creación** | 2026-11-23 |
| **Autor / Responsable** | Equipo de Calidad, Seguridad y Operaciones — SISAP by CENIVRA |
| **Revisor y aprobación** | **Pendiente de revisión formal** |
| **Documentos relacionados** | `SISAP-QA-001..008` · `SISAP-LC-012` · `SISAP-LC-013` |

---

## 1. Arquitectura de Monitorización Soberana Implementada (Sin SaaS Externo)

### 1.1 Captura Global de Errores en Frontend (`src/services/telemetryService.ts` + `src/App.tsx`)
- `installGlobalErrorMonitoring()` registra listeners para `window.error` y `unhandledrejection` en el ciclo de montaje principal de `App.tsx` (limpieza segura en unmount).
- Todo mensaje de error y ruta atraviesa `sanitizeTelemetryString()` antes de registrarse en el buffer local y enviarse de forma no bloqueante vía `navigator.sendBeacon()` hacia `POST /api/monitoring/client-error`.
- **Reglas de privacidad LFPDPPP:** Redacción obligatoria de identificadores `TUS-XXXX`, `CURP`, cédulas `CED-PROF-*`, correos electrónicos, teléfonos de 10 dígitos, rutas locales Windows `C:\Users\<usuario>` y palabras clínicas restringidas (`diagnostico`, `craving`, `impulsividad`, `paciente`, `familiar`).

### 1.2 Telemetría Operativa y Recepción Segura en Backend (`monitoringService.js` + `routes/index.js`)
- **`GET /api/monitoring/metrics`:** Expone métricas agregadas y estado de salud local sin PHI (`phi_exported: false`):
  - `uptime_seconds`, `node_version`, `memory` (`rss_bytes`, `heap_used_bytes`, `heap_total_bytes`),
  - `database` (`ok`, `tables`, `migrations_applied`, `foreign_keys_enabled`),
  - `audit_worm` (`valid`, `total_events`),
  - `operational_counts_aggregate` (solo totales numéricos anónimos: `patients_total`, `psychometric_evaluations_total`, `model_runs_total`, `follow_ups_total`, `formulations_total`).
- **`POST /api/monitoring/client-error`:** Re-sanitiza la carga recibida con `sanitizeMonitoringText()`, emite advertencia estructurada al logger local redactado y registra traza mínima `monitoring.client_error` en la cadena append-only `audit_events` (`HTTP 202 Accepted`).

---

## 2. Matriz Completa de Controles de Calidad

| Dominio | Control | Momento | Bloqueante | Evidencia / Herramienta |
|---|---|---|---|---|
| **Higiene Git y Secretos** | `SEC-GIT-01`, `SEC-FB-01`, `SEC-SCAN-01` | Pre-commit / CI Paso 2 | Sí (`qa:audit`) | `scripts/qa-static-audit.mjs` |
| **Calidad Sintáctica y Tipos** | `tsc --noEmit` + ESLint `v9` + Prettier | Desarrollo / CI Pasos 2–3 | Sí (`lint` / ESLint CI) | `tsconfig.json`, `eslint.config.mjs`, `.prettierrc.json` |
| **SAST Profundo** | CodeQL (`security-extended,security-and-quality`) | Push / PR / Lunes semanal | Alertas Security tab | `.github/workflows/codeql.yml` |
| **Gobierno SOUP / CVEs** | Dependabot semanal (`SOUP-review`) + `npm audit` | Lunes semanal / CI Paso 7 | Revisión obligatoria sin auto-merge | `.github/dependabot.yml`, `SISAP-LC-016` |
| **Lógica Clínica y Motores** | `41` pruebas unitarias/integración + LCOV 30 módulos (`87.38%` líneas) | Local / CI Pasos 4–5 | Sí (`test:all` / `test:coverage`) | `backend/test/*`, `src/test/*`, `scripts/run-coverage.mjs` |
| **Flujos E2E y Persistencia Real** | 12 flujos en Chromium real + muerte/reinicio proceso backend SQLite WAL | Local / CI Paso 10 | Sí (`test:e2e`) | `e2e/run-chromium-e2e.mjs`, `e2e/sisap-flows.spec.ts` |
| **Integridad Modelos ML** | SHA-256 sobre 8 archivos `engines/autoencoder/` | Arranque / `qa:audit` / `AE-01` | Sí (`INT-AE-SHA`) | `model_registry.json` |
| **Quality Gate Consolidado** | SonarQube Cloud (*Clean as You Code*, `coverage/lcov.info`) | CI Paso 6 (con `SONAR_TOKEN`) | Sí cuando `SONAR_TOKEN` está activo | `sonar-project.properties` |
| **Observabilidad Post-Despliegue** | `/api/monitoring/metrics` + `client-error` por `sendBeacon` | Runtime local continuo | Registra y protege contra PHI | `monitoringService.js`, `telemetryService.ts` |
