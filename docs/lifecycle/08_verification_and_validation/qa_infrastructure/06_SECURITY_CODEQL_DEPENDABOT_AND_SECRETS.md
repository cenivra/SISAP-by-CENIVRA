# Seguridad Estática, CodeQL, Dependabot y Gobernanza de Secretos — SISAP v1.1.0

## Control Documental

| Campo | Valor |
|---|---|
| **Código documental** | `SISAP-QA-006` |
| **Título** | Controles de Seguridad en Ciclo de Desarrollo: CodeQL, Dependabot, Secret Scanning e Higiene Git |
| **Versión** | `1.1.0-draft` |
| **Estado** | **En revisión** |
| **Fecha de creación** | 2026-11-23 |
| **Autor / Responsable** | Equipo de Ciberseguridad y Calidad — SISAP by CENIVRA |
| **Revisor y aprobación** | **Pendiente de revisión formal** |
| **Documentos relacionados** | `SISAP-LC-004` (`RSK-008`, `RSK-011`) · `SISAP-LC-016` · `SISAP-QA-003` · `SISAP-QA-005` |

---

## 1. Análisis SAST Profundo con GitHub CodeQL

- **Archivo:** [`.github/workflows/codeql.yml`](../../../../.github/workflows/codeql.yml).
- **Alcance:** `languages: ["javascript-typescript"]`, paquete `queries: security-extended,security-and-quality`.
- **Riesgos mitigados:** Inyección SQL (validando que las rutas `backend/src/` mantengan sentencias parametrizadas SQLite), XSS en componentes React (`src/components/`), traversal de rutas en `serveStatic` (`backend/src/server.js`), desbordamiento o regex inseguros y fugas de información en errores HTTP.
- **Cadencia:** Automática en `push` / `pull_request` sobre `main` y `release/**` y semanal (`cron: "23 7 * * 1"`).

---

## 2. Gobierno de Dependencias SOUP con Dependabot (`.github/dependabot.yml`)

- **Archivo:** [`.github/dependabot.yml`](../../../../.github/dependabot.yml).
- **Ecosistemas monitoreados:**
  1. `npm` en `/sisap-by-cenivra-—-sistema-de-información-clínica-y-gobernanza` (lunes `08:00` `America/Mexico_City`, límite máximo `5` PRs abiertos, agrupación para `react*`/`vite*`/`@tailwindcss/*` y `development`).
  2. `github-actions` en `/` (lunes `08:30` `America/Mexico_City`, límite máximo `3` PRs abiertos).
- **Política IEC 62304 §8.1.2 (SOUP):** Todos los PRs llevan etiqueta `SOUP-review` y **prohíben fusión automática (*auto-merge*)**. Cada actualización debe superar `ci-quality-gate.yml` (incluidos `test:all` + `test:e2e`) y actualizar el inventario `SISAP-LC-016` antes de aceptarse.

---

## 3. Política de Secretos, Archivos Prohibidos e Higiene del Repositorio

| Control | Mecanismo Implementado | Alcance Verificado |
|---|---|---|
| **Exclusión Git (`.gitignore`)** | Bloquea `.sqlite3`/`.db`, `.env*` (salvo `.example`), `firebase-applet-config.json`, `coverage/`, `playwright-report/`, `test-results/`, `e2e/results.json`, `dist/`, `dist-electron/`, `.xlsx`. | `SEC-GIT-01`: `0` archivos sensibles rastreados entre `290` archivos Git. |
| **Plantilla Segura Firebase** | `firebase-applet-config.json` no se rastrea ni es requerido en build (`PRB-007`); `firebase-applet-config.json.example` validado sin claves reales. | `SEC-FB-01` PASS (`placeholder` `YOUR_...`). |
| **Detección de Secretos y Rutas** | Regex verificadores para claves `AIzaSy...`, `gh[pousr]_...`, cabeceras `PRIVATE KEY` y rutas Windows locales (`C:\Users\...`). | `SEC-SCAN-01`: `0` hallazgos en `86` archivos revisados. |
| **Protección Runtime Back-to-Front** | `loopbackOnly` (`127.0.0.1`), `applyCors` y `verifyOrigin` estrictos, `rateLimit`, redacción `[REDACTED]` en `logger.js` y triggers WORM SHA-256 en `audit_events`. | `security.test.js` + `T-10` PASS; bitácora validada tras reinicio en `E2E-12`. |
