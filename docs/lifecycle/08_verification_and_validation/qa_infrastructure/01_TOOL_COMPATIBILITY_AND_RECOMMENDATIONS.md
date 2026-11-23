# Diagnóstico de Compatibilidad de Herramientas QA y Recomendaciones — SISAP v1.1.0

## Control Documental

| Campo | Valor |
|---|---|
| **Código documental** | `SISAP-QA-001` |
| **Título** | Diagnóstico de Compatibilidad Tecnológica y Selección de Herramientas de Aseguramiento de Calidad |
| **Versión** | `1.1.0-draft` |
| **Estado** | **En revisión** |
| **Fecha de creación** | 2026-11-23 |
| **Autor / Responsable** | Equipo de Ingeniería y Calidad — SISAP by CENIVRA |
| **Revisor y aprobación** | **Pendiente de revisión formal** |
| **Documentos relacionados** | `SISAP-LC-000` · `SISAP-LC-008` · `SISAP-LC-016` · `SISAP-QA-002..010` |

---

## 1. Perfil Tecnológico Real del Sistema (`release/1.1.0`)

- **Directorio aplicativo principal:** `sisap-by-cenivra-—-sistema-de-información-clínica-y-gobernanza/`
- **Runtime principal:** Node.js `v24.22.1` (`engines.node: >=22.5.0`, con `node:sqlite`, `node:test`, `node:crypto` y `WebSocket` integrados).
- **Frontend:** React `19.3.1`, TypeScript `7.0.2`, Vite `8.3.4`, Tailwind CSS `4.3.3`, Recharts no usado (gráficos SVG/React nativos).
- **Backend local:** Node.js ESM sobre `127.0.0.1:8080` (`loopbackOnly`) con persistencia SQLite WAL (`15` tablas, `3` migraciones).
- **Contenedor de escritorio:** Electron `45.0.0` (`electron/main.cjs`, `sandbox: true`, `contextIsolation: true`).
- **Módulos científicos auxiliares:** R (`>=4.0`, probado en `R 4.6.1`) para verificación externa de paridad estadística (`engines/autoencoder/tests/*.R`).

---

## 2. Evaluación de Herramientas Candidatas y Decisión Técnica

| Herramienta | Categoría | Estado de Compatibilidad / Instalación | Decisión en `release/1.1.0` | Justificación Técnica y Normativa |
|---|---|---|---|---|
| **TypeScript (`tsc --noEmit`)** | Análisis estático de tipos | Instalado (`7.0.2`, local) | **Adoptado (Bloqueante)** | Detecta errores contractuales TS/JSX en `src/` sin generar artefactos (`exclude` aplicado a `e2e/` y `playwright.config.ts`). |
| **ESLint (`v9` Flat Config)** | Linter estático JS/MJS | Configurado (`eslint.config.mjs`); CLI disponible en CI vía `npx --yes eslint@9` | **Adoptado (Local parcial + Bloqueante en CI)** | Controla `no-eval`, `no-implied-eval`, `no-new-func`, `no-debugger`, `no-var`, `eqeqeq` en `backend/`, `engines/`, `scripts/` y `e2e/`. |
| **Prettier** | Formato de código | Configurado (`.prettierrc.json`, `.prettierignore`) | **Adoptado (Estándar documental/CI)** | Homologa formato de estilos en futuras ediciones sin alterar líneas históricas masivamente. |
| **Auditoría Estática Soberana (`qa-static-audit.mjs`)** | Higiene secretos / SAST ligero / SHA-256 | Nativo Node.js (`0` dependencias) | **Adoptado (Bloqueante Local + CI)** | Bloquea archivos sensibles rastreados (`SEC-GIT-01`), apiKeys/rutas locales (`SEC-SCAN-01`), `eval`/`debugger` (`SAST-SYNTAX-01`) e integridad de modelos (`INT-AE-SHA` 8/8). |
| **`node --test` + `tsx` + `--experimental-test-coverage`** | Pruebas unitarias, integración y cobertura | Nativo Node `v24.22.1` + `tsx` (`4.23.15` ya instalado) | **Adoptado (Bloqueante Local + CI)** | Elimina duplicidad de instalar Vitest como dependencia adicional cuando Node 24 + `tsx` ejecuta tests JS/TS y genera LCOV nativo estándar. |
| **Chromium CDP Runner (`e2e/run-chromium-e2e.mjs`) + Playwright Spec (`e2e/sisap-flows.spec.ts`)** | Pruebas End-to-End en navegador real | Chromium local detectado (`chrome.exe`); Playwright CLI en CI (`npx playwright`) | **Adoptado (Bloqueante Local + CI)** | Permite correr los 12 flujos en Chromium real localmente sin dependencias externas y usar `@playwright/test` en GitHub Actions CI. |
| **GitHub CodeQL** | SAST profundo (`javascript-typescript`) | Workflow `.github/workflows/codeql.yml` | **Adoptado (Remoto en GitHub)** | Aporta análisis de flujo de datos (`security-extended,security-and-quality`) para detección de inyecciones y fugas en cada PR/push y cron semanal. |
| **GitHub Dependabot** | Gobernanza SOUP / CVEs | Configurado (`.github/dependabot.yml`) | **Adoptado (Sin auto-merge)** | Monitorea dependencias `npm` y `github-actions` semanalmente bajo etiqueta `SOUP-review`, exigiendo revisión IEC 62304 antes de fusionar. |
| **SonarQube Cloud** | Quality Gate y deuda técnica | Configurado (`sonar-project.properties` + paso condicional en CI) | **Adoptado Condicional** | Consume `coverage/lcov.info`; se activa automáticamente cuando el repositorio tenga configurado el secreto `SONAR_TOKEN`. |
| **GitHub Actions** | Orquestación CI/CD | Configurado (`.github/workflows/ci-quality-gate.yml`) | **Adoptado (Sin auto-release)** | Ejecuta auditoría, TS, unit tests, LCOV, build y Chromium E2E en `ubuntu-latest`; **prohibido** publicar releases o sobrescribir `v1.0.0`. |
| **Monitorización Soberana (`/api/monitoring/*` + `telemetryService`)** | Observabilidad local anti-PHI | Implementado nativamente en backend/frontend | **Adoptado en reemplazo de Sentry Cloud** | Captura `error` y `unhandledrejection` sanitizados (`[REDACTED]`) por `sendBeacon` hacia SQLite/log local sin enviar datos clínicos ni contexto a terceros externos (LFPDPPP). |
| **Cloudflare** | CDN / WAF / Tunnel / Workers | Evaluado únicamente (`SISAP-QA-007`) | **No aplicable al runtime núcleo local** | SISAP es desktop local loopback (`127.0.0.1`); migrar datos/backend a nube implicaría salida de PHI fuera de control institucional. |

---

## 3. Declaración de Limitación Honesta respecto a Sentry y R

1. **Sustitución deliberada de Sentry:** No se instala `@sentry/browser` ni `@sentry/node` porque su modelo SaaS transmite volcados de memoria, breadcrumbs del DOM y trazas que representan alto riesgo de exposición incidental de PHI en formularios clínicos (`RSK-008`, LFPDPPP). En su lugar se implementa monitorización soberana 100 % local verificada (`MON-01`, `MON-02`, `E2E-11`).
2. **Coexistencia con Vitest:** La evaluación confirmó que instalar Vitest duplicaría cobertura ya cubierta de forma reproducible por `node:test` + `tsx` + `--experimental-test-coverage` (`87.38%` líneas en 30 módulos de lógica backend/motores/TS). En el futuro, si se agregan pruebas de componentes React en JSDOM extensivo, Vitest + Testing Library puede coexistir sin conflicto.
