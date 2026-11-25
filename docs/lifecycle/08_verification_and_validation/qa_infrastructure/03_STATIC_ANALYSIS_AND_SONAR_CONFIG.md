# Análisis Estático, Linting, Formato y Configuración de SonarQube Cloud — SISAP v1.1.0

## Control Documental

| Campo | Valor |
|---|---|
| **Código documental** | `SISAP-QA-003` |
| **Título** | Especificación de Análisis Estático, ESLint v9, Prettier, TypeScript y SonarQube Cloud |
| **Versión** | `1.1.0-draft` |
| **Estado** | **En revisión** |
| **Fecha de creación** | 2026-11-23 |
| **Autor / Responsable** | Equipo de Calidad e Ingeniería — SISAP by CENIVRA |
| **Revisor y aprobación** | **Pendiente de revisión formal** |
| **Documentos relacionados** | `SISAP-QA-001` · `SISAP-QA-005` · `SISAP-QA-006` · `SISAP-QA-008` |

---

## 1. Capas de Análisis Estático Configuradas

### 1.1 TypeScript Compiler (`npm run lint` → `tsc --noEmit`)
- **Archivo de configuración:** [`tsconfig.json`](../../../../sisap-by-cenivra-%E2%80%94-sistema-de-informaci%C3%B3n-cl%C3%ADnica-y-gobernanza/tsconfig.json).
- **Ajuste de higiene verificado:** Se excluyen `node_modules`, `dist`, `dist-desktop`, `coverage`, `playwright-report`, `test-results`, `e2e` y `playwright.config.ts` para mantener verificación estricta sobre el código productivo `src/` sin requerir instalar `@playwright/test` en dependencias de producción del empaquetado Electron.
- **Resultado observado:** `0` errores TypeScript.

### 1.2 ESLint v9 Flat Config y Prettier
- **ESLint:** [`eslint.config.mjs`](../../../../sisap-by-cenivra-%E2%80%94-sistema-de-informaci%C3%B3n-cl%C3%ADnica-y-gobernanza/eslint.config.mjs) regula `backend/**/*.js`, `engines/**/*.js`, `scripts/**/*.mjs` y `e2e/**/*.mjs` (ECMAScript `2024`, ESM) bajo las reglas:
  - `'no-eval': 'error'`, `'no-implied-eval': 'error'`, `'no-new-func': 'error'` (prevención de ejecución dinámica de código).
  - `'no-debugger': 'error'`, `'no-var': 'error'`, `eqeqeq: ['error', 'always', { null: 'ignore' }]`.
  - `'prefer-const': 'warn'`, `'no-unused-vars': 'warn'` (patrón `_`).
- **Exclusiones:** Artefactos compilados, `coverage/`, matrices JSON masivas de pesos (`engines/autoencoder/models/**`, `preprocessing/**`, `evaluation/**`).
- **Prettier:** [`.prettierrc.json`](../../../../sisap-by-cenivra-%E2%80%94-sistema-de-informaci%C3%B3n-cl%C3%ADnica-y-gobernanza/.prettierrc.json) y [`.prettierignore`](../../../../sisap-by-cenivra-%E2%80%94-sistema-de-informaci%C3%B3n-cl%C3%ADnica-y-gobernanza/.prettierignore) fijan estilo uniforme (`printWidth: 100`, `singleQuote: true`, `semi: true`).

### 1.3 Auditor Estático Determinista Local (`npm run qa:audit`)
- **Implementación:** [`scripts/qa-static-audit.mjs`](../../../../sisap-by-cenivra-%E2%80%94-sistema-de-informaci%C3%B3n-cl%C3%ADnica-y-gobernanza/scripts/qa-static-audit.mjs).
- **Controles ejecutados determinísticamente offline:**
  1. `SEC-GIT-01`: Comprueba `git ls-files` buscando archivos prohibidos (`firebase-applet-config.json`, `.env`, `.sqlite3`, `.db`, llaves privadas). Resultado actual: `0` en `290` archivos Git.
  2. `SEC-FB-01`: Verifica que `firebase-applet-config.json.example` contenga solo placeholders seguros.
  3. `SEC-SCAN-01`: Escanea archivos de `src/`, `backend/src/` y `engines/` buscando claves (`AIzaSy...`, `ghp_...`, `-----BEGIN ... PRIVATE KEY-----`) o rutas locales de máquina (`C:\Users\...`). Resultado actual: `0` en `86` archivos revisados.
  4. `SAST-SYNTAX-01`: Detecta patrones peligrosos (`eval(`, `new Function(`, `debugger`) e integridad sintáctica JSON.
  5. `INT-AE-SHA`: Recalcula y compara los SHA-256 reales de los `8` artefactos de `engines/autoencoder/` contra `model_registry.json`.

---

## 2. Configuración de SonarQube Cloud (`sonar-project.properties`)

- **Archivo raíz:** [`sonar-project.properties`](../../../../sonar-project.properties).
- **Identificadores declarados:**
  - `sonar.projectKey=cenivra_SISAP-by-CENIVRA`
  - `sonar.organization=cenivra`
  - `sonar.projectName=SISAP by CENIVRA`
  - `sonar.projectVersion=1.1.0`
- **Alcance de fuentes (`sonar.sources`) y pruebas (`sonar.tests`):**
  - Fuentes analizadas: `src/`, `backend/src/`, `engines/autoencoder/inference/autoencoderInferenceEngine.js`, `engines/autoencoder/embeddings/latentSpaceAnalyzer.js`.
  - Cobertura conectada: `sonar.javascript.lcov.reportPaths=sisap-by-cenivra-—-sistema-de-información-clínica-y-gobernanza/coverage/lcov.info`.
  - Exclusiones de cobertura (`sonar.coverage.exclusions`): componentes JSX puramente visuales (`src/components/**`), puntos de entrada (`src/App.tsx`, `src/main.tsx`), utilidades CLI (`backend/src/cli/**`) y servidor HTTP de arranque (`backend/src/server.js`) — los flujos de interfaz y servidor quedan verificados mediante la suite E2E de Chromium.
- **Quality Gate documentado (*Clean as You Code*):**
  - Referencia en código nuevo respecto a `v1.0.0` / `release/1.1.0`: `0` bugs nuevos, `0` vulnerabilidades nuevas, `100%` Security Hotspots revisados, cobertura sobre código nuevo `>= 80%` y duplicación `<= 3%`.
- **Estado de ejecución remota:** El paso 6 de `.github/workflows/ci-quality-gate.yml` ejecuta `SonarSource/sonarqube-scan-action@v4` **de manera condicional** (`if: ${{ secrets.SONAR_TOKEN != '' }}`) para evitar falsos fallos mientras CENIVRA habilita la cuenta y el secreto del repositorio en GitHub.
