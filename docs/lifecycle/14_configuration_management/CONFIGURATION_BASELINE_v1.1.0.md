# Línea Base y Estado de Configuración — SISAP by CENIVRA v1.1.0

## Control Documental

| Campo | Valor |
|---|---|
| **Código documental** | `SISAP-LC-014` |
| **Título** | Inventario de Línea Base y Estado de Configuración `v1.1.0` (IEC 62304 §8) |
| **Versión** | `1.1.0-draft` |
| **Estado** | **En revisión** |
| **Fecha de creación** | 2026-11-23 |
| **Última actualización** | 2026-11-23 |
| **Autor / Responsable** | Responsable de Configuración — SISAP by CENIVRA |
| **Revisor y aprobación** | **Pendiente de revisión formal** |
| **Documentos relacionados** | `SISAP-LC-002` · `SISAP-LC-011` · `SISAP-LC-016` · `SISAP-LC-018` |

### Historial de Cambios

| Versión | Fecha | Descripción | Responsable |
|---|---|---|---|
| `1.1.0-draft` | 2026-11-23 | Registro exacto de commits base, versiones de código, hashes SHA-256 de pesos/parámetros, migraciones y exclusiones Git en `release/1.1.0`. | Equipo de Ingeniería SISAP |

---

## 1. Control de Versiones y Ramas Git

| Elemento | Identificador / Referencia Exacta | Estado |
|---|---|---|
| **Tag histórico preservado** | `v1.0.0` → `ea500b34d9db37ee7c7c3e3f9f0b0345f2f2da1f` (`main`) | Inmutable / Publicado |
| **Rama de evolución** | `release/1.1.0` | Activa (local) |
| **Commit 1 (`feat(autoencoder)`)** | `4cb847b` — Integración de `engines/autoencoder/`, pipeline R/JS y visualizaciones 12D | Registrado |
| **Commit 2 (`feat(intelligence)`)** | `bb7078e` — Migración `002`, servicios Motores 2–5 e `IntelligenceEcosystemView` | Registrado |
| **Commit 3 (`feat(psychometrics)`)** | `b9e94d7` — Catálogo `catalog_v1.json`, motor 5 capas, migración `003` y `PsychometricCenterView` | Registrado |
| **Commit 4 (`docs(release)`)** | `7bca47e` — Manifiestos `1.1.0`, `CHANGELOG.md`, `RELEASE_NOTES_v1.1.0.md` y guías | Registrado |
| **Commit 5 (`docs(lifecycle)`)** | *(Pendiente al cierre de esta actividad IEC 62304 en `release/1.1.0`)* | En preparación |
| **Tag propuesto tras aprobación** | `v1.1.0` *(aún NO creado ni publicado)* | Pendiente de aprobación |

---

## 2. Elementos de Configuración Controlados

### 2.1 Manifiestos y Esquemas de Datos
- **Aplicación Principal (`package.json`):** `version: "1.1.0"`, `appId: "org.cenivra.sisap"`, `main: "electron/main.cjs"`, `build.files` incluye `engines/**/*`.
- **Backend Local (`backend/package.json`):** `version: "1.1.0"`, `type: "module"`, `engines.node: ">=22.5.0"`.
- **Migraciones SQLite (`backend/migrations/`):**
  - `001_initial_schema.sql` (10 tablas núcleo + triggers WORM `audit_events`)
  - `002_intelligence_engines.sql` (`follow_up_evaluations`, `clinical_formulations`)
  - `003_psychometric_center.sql` (`psychometric_evaluations`, `psychometric_item_responses`, `psychometric_results`)
- **Catálogo Psicométrico (`engines/psychometrics/catalog_v1.json`):** `catalogVersion: "1.0.0"`, 6 instrumentos activos + exclusión explícita `OCI-R`.

### 2.2 Artefactos Científicos Verificados por SHA-256 (`engines/autoencoder/models/model_registry.json`)
`registry_version: "1.0.0-20261123"`, `canonical_reference_cohort_n: 166`, `default_production_model_id: "encoder_22_checkpoint_fase2"`:

| Archivo Relativo (`engines/autoencoder/`) | SHA-256 Verificado (`AE-01`) |
|---|---|
| `models/pesos_encoder_22_h5.json` | `ee507679c44dd439dd4e85e47749f52548076a0d7b0c241f252712c2d009e3f3` |
| `models/pesos_encoder_24_h5.json` | `184d4b88c6b5b00a8cbbdb74c6a28d9be2e81d227ead2f037c4d1b5dd6dc112c` |
| `models/pesos_autoencoder_22_completo.json` | `313dcd2d8f7c136222eaff1c56583b02af332c259ff0aee85b02f349b93c3d9e` |
| `models/pesos_autoencoder_24_completo.json` | `46d44a7ad05eabadc1caf70488bf2f9d6e513cb7486bdeed9d3e4bf3808694c6` |
| `models/pesos_candidato_17_m3k12.json` | `28b3a56666c1feb6712e9f4c3bdd1fa16f010bc80b76b6dddc540fdeffd31a44` |
| `models/percentiles_referencia_12d.json` | `7dbbe884838b4c582c1684b9c12bed8a803e8919cbce01347f9385203e0b8efc` |
| `models/percentiles_referencia_12d.csv` | `a3afdf1cf18948fcb16cd03ab575be151d08c490fd4480f041f2222101d805c2` |
| `preprocessing/parametros_referencia_completos.json` | `bb067e40ab3a14225e6f45745986dff2b0b33305bb9e9bbed42b7f00b6833879` |

### 2.3 Datos de Prueba y Exclusiones de Privacidad (`.gitignore`)
- Datos de prueba sintéticos generados determinísticamente por `backend/src/cli/seed-fixtures.js` y fixtures sintéticos en `backend/test/*.test.js`.
- Excluidos del repositorio mediante `.gitignore`: bases `.sqlite3`/`.db`, archivos `.env`, archivos clínicos `.xlsx`, instaladores `.exe`/`.blockmap` y carpetas de build `dist/`, `dist-electron/`.
