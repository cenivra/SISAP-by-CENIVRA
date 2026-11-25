# Especificación de Flujos CI/CD en GitHub Actions — SISAP v1.1.0

## Control Documental

| Campo | Valor |
|---|---|
| **Código documental** | `SISAP-QA-005` |
| **Título** | Documentación Técnica de Workflows de Calidad y Seguridad en GitHub Actions |
| **Versión** | `1.1.0-draft` |
| **Estado** | **En revisión** |
| **Fecha de creación** | 2026-11-23 |
| **Autor / Responsable** | Equipo de DevSecOps y Calidad — SISAP by CENIVRA |
| **Revisor y aprobación** | **Pendiente de revisión formal** |
| **Documentos relacionados** | `SISAP-LC-011` · `SISAP-QA-003` · `SISAP-QA-004` · `SISAP-QA-006` |

---

## 1. Workflow Principal: `.github/workflows/ci-quality-gate.yml`

- **Disparadores (`on`):** `push` y `pull_request` sobre `main` y `release/**`, más ejecución manual `workflow_dispatch`.
- **Principio de mínimo privilegio:** `permissions: contents: read`.
- **Política estricta de no autopublicación:** Este workflow **no genera tags**, **no modifica `v1.0.0`** ni **publica GitHub Releases automáticamente**. La emisión de un release requiere aprobación humana tras revisar evidencias (`SISAP-LC-011`, `SISAP-VV-RDY-110`).

### Secuencia de Pasos Bloqueantes (`quality_gate` en `ubuntu-latest`, Node `24`)

1. **Step 0 (`actions/checkout@v4` con `fetch-depth: 0`):** Clonado con historial completo necesario para SonarCloud y verificación Git.
2. **Step 1 / 1b (`actions/setup-node@v4`, `npm ci`):** Instalación reproducible de dependencias fijadas en `package-lock.json` dentro de `sisap-by-cenivra-—-sistema-de-información-clínica-y-gobernanza/`.
3. **Step 2 (`npm run qa:audit && npx --yes eslint@9 .`):** Bloqueo por secretos, rutas locales, archivos sensibles rastreados, corrupción JSON/Autoencoder SHA-256 y reglas ESLint.
4. **Step 3 (`npm run lint`):** Verificación estática TypeScript (`tsc --noEmit`).
5. **Step 4 (`npm run test:fe`):** Pruebas unitarias TypeScript frontend (`FE-01..05`).
6. **Step 5 (`npm run test:coverage` + ciclo BD limpia):** Ejecución de las 8 suites unificadas generando `coverage/lcov.info` y `coverage/summary.json`, seguida de creación/sembrado/salud sobre SQLite WAL limpio temporal (`init-db.js` → `seed-fixtures.js` → `health.js`).
7. **Step 6 (`SonarSource/sonarqube-scan-action@v4`, condicional `secrets.SONAR_TOKEN != ''`):** Análisis SonarQube Cloud con `-Dsonar.qualitygate.wait=true`.
8. **Step 7 (`npm audit --audit-level=high`, `continue-on-error: true`):** Inventario informativo de CVEs sin bloquear compilación ante avisos transitorios en dependencias build-time; complementado con Dependabot (`SISAP-QA-006`).
9. **Step 8 (`npm run build`):** Validación de empaquetado SPA limpio (sin requerir `firebase-applet-config.json` tras `PRB-007`).
10. **Step 9 / 10 (`npx --yes playwright install --with-deps chromium` + `npm run test:e2e`):** Pruebas de los 12 flujos reales en Chromium headless.
11. **Step 11 (`actions/upload-artifact@v4`, `if: always()`, retención `30` días):** Preserva `coverage/`, `playwright-report/` y `e2e/results.json` como evidencia auditable por ejecución.

---

## 2. Workflow SAST: `.github/workflows/codeql.yml`

- **Disparadores:** `push` y `pull_request` sobre `main` y `release/**`, más análisis programado semanal todos los lunes (`cron: "23 7 * * 1"` UTC).
- **Lenguaje analizado:** `javascript-typescript`.
- **Paquete de consultas:** `security-extended,security-and-quality` bajo `github/codeql-action/init@v3`, `autobuild@v3` y `analyze@v3`.
- **Permisos acotados:** `actions: read`, `contents: read`, `security-events: write`.

---

## 3. Declaración de Estado de Ejecución en Remoto

Los archivos `.github/workflows/ci-quality-gate.yml` y `.github/workflows/codeql.yml` se encuentran definidos y versionados en la rama local `release/1.1.0`. Su ejecución efectiva en servidores de GitHub ocurrirá cuando el responsable autorizado decida realizar `git push` de la rama o abrir un Pull Request en GitHub. Entretanto, todos los controles equivalentes locales (`qa:audit`, `lint`, `test:all`, `test:coverage`, `build`, ciclo limpio SQLite y `test:e2e` con 12 flujos en Chromium real) se han ejecutado y verificado localmente en esta máquina.
