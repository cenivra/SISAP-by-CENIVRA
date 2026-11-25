# Informe Final de Preparación QA para el Release candidato v1.1.0 — SISAP by CENIVRA

## Control Documental

| Campo | Valor |
|---|---|
| **Código documental** | `SISAP-QA-010` |
| **Título** | Dictamen Final de Calidad, Verificación y Preparación Operativa de `release/1.1.0` |
| **Versión** | `1.1.0-draft` |
| **Estado** | **En revisión — No liberado públicamente** |
| **Fecha de evaluación** | 2026-11-23 |
| **Autor / Responsable** | Equipo de Ingeniería y Aseguramiento de Calidad — SISAP by CENIVRA |
| **Revisor y aprobación** | **Pendiente de revisión clínica y directiva para autorizar `tag v1.1.0`** |
| **Documentos relacionados** | `SISAP-LC-000` · `SISAP-LC-008` · `SISAP-LC-011` · `SISAP-LC-015` · `SISAP-LC-017` · `SISAP-VV-RDY-110` · `SISAP-QA-001..009` |

---

## 1. Garantía de Preservación Histórica (`v1.0.0` y `main`)

- **Tag Git `v1.0.0` y rama `main`:** Permanecen apuntando exactamente al commit histórico original `ea500b34d9db37ee7c7c3e3f9f0b0345f2f2da1f`.
- **Release `v1.0.0` en GitHub:** Intacto sin eliminación, sin alteración de notas ni adjuntos.
- **Estado de publicación actual:** Toda la infraestructura QA se integró exclusivamente sobre `release/1.1.0` en local; **no se ha ejecutado `git push` ni creado la etiqueta `v1.1.0`**.

---

## 2. Evaluación Integral de Compuertas de Calidad (`v1.1.0`)

| Compuerta / Criterio QA | Estado Actual | Evidencia Verificada | Observación o Condición |
|---|---|---|---|
| **Análisis estático, higiene y SHA-256 (`qa:audit`)** | **PASS** | `0` archivos sensibles en `290` archivos Git, `0` secretos/rutas en `86` archivos código, `8/8` SHA-256 Autoencoder válidos. | Bloqueante en CI y local. |
| **Compilación TypeScript y Build limpio (`lint` + `build`)** | **PASS** | `tsc --noEmit` con `0` errores; `vite build` transforma `1718` módulos sin exigir `firebase-applet-config.json` (`PRB-007`). | Reproducible tras cada cambio. |
| **Pruebas unitarias e integración JS + TS (`test:all`)** | **PASS** | **`41/41 PASS`** (`0` fallos, `0` saltadas), incluyendo `T-04b` (`PRB-008`), `MON-01..02` y `FE-01..05`. | Cubre backend SQLite, Motores 1..5, Psicometría 6 escalas, WebCrypto y telemetría. |
| **Pruebas científicas en R** | **PASS (4/4) + 1 omisión controlada** | Suites unitarias R aprobadas (`SISAP-LC-007`); regresión histórica `N=166` requiere Excel confidencial local. | Paridad exacta R↔JS validada (`0.0000e+0`). |
| **Cobertura consolidada LCOV (`test:coverage`)** | **PASS** | **`87.38%` líneas (`6,902/7,899`)**, **`66.59%` ramas (`875/1,314`)**, **`82.43%` funciones (`305/370`)** en `30` módulos lógicos; `coverage/lcov.info` listo para SonarCloud. | `modelRunService.js` (`26.37%`) y `telemetryService.ts` DOM listeners identificados para ampliación en iteración menor. |
| **E2E Real en Chromium (`test:e2e`)** | **PASS** | **`12/12 PASS`** en `chrome.exe`, `0` errores de consola, `0` excepciones; incluye cierre inmutable `409`, `D-06`, monitorización anti-PHI y reinicio real de servidor SQLite WAL. | Detectó y permitió cerrar `PRB-008` antes de liberar `v1.1.0`. |
| **ESLint v9, CodeQL, Dependabot y CI Actions** | **Configurado / Verificación remota pendiente de push** | `eslint.config.mjs`, `.github/workflows/codeql.yml`, `ci-quality-gate.yml` y `.github/dependabot.yml` versionados. | Se activarán en GitHub en cuanto se autorice `push` de `release/1.1.0`. |
| **SonarQube Cloud** | **Configurado Condicional** | `sonar-project.properties` + `coverage/lcov.info` integrados. | Activar secreto `SONAR_TOKEN` en Settings de GitHub para reporte en nube. |
| **Monitorización Soberana Anti-PHI** | **PASS** | `installGlobalErrorMonitoring()` + `POST /api/monitoring/client-error` + `GET /api/monitoring/metrics` verificados por `MON-01..02` y `E2E-11`. | Reemplaza servicios SaaS externos (`Sentry`) evitando exposición de PHI. |
| **Instalador Windows NSIS (`dist:win`), aprobación formal y campo** | **Pendiente (Post-autorización)** | Manifiesto configurado; `release/1.1.0` no se etiqueta hasta firma documental y prueba de humo sobre `.exe`. | Declarado honestamente conforme a IEC 62304. |

---

## 3. Veredicto Técnico QA

1. **Veredicto técnico automatizado:** **`LISTO TÉCNICAMENTE PARA REVISIÓN Y PRUEBA DE INSTALADOR EN `release/1.1.0` (`APTO PARA BORRADOR DE RELEASE`)`**.
2. **Condiciones obligatorias antes de emitir `tag v1.1.0` definitivo en GitHub:**
   - Revisión humana formal de los documentos `SISAP-LC-000..018` y `SISAP-QA-001..010` (`En revisión → Aprobado`).
   - Ejecución de `npm run dist:win` (generación y arranque de `SISAP.by.CENIVRA.Setup.1.1.0.exe` sobre Windows).
   - Opcional recomendado tras `git push` de `release/1.1.0`: confirmar ejecución verde de `.github/workflows/ci-quality-gate.yml` y `codeql.yml` en GitHub Actions (y configurar `SONAR_TOKEN` si se conectará SonarQube Cloud).
