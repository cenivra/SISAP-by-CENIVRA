# Historial de Cambios del Ciclo de Vida e Integración GitHub — SISAP

## Control Documental

| Campo | Valor |
|---|---|
| **Código documental** | `SISAP-LC-018` |
| **Título** | Registro de Cambios Vinculado a Requisitos, Riesgos, Pruebas y Commits (IEC 62304 §6, §8, §9) |
| **Versión** | `1.1.0-draft` |
| **Estado** | **En revisión** |
| **Fecha de creación** | 2026-11-23 |
| **Última actualización** | 2026-11-23 |
| **Autor / Responsable** | Equipo de Ingeniería y Configuración — SISAP by CENIVRA |
| **Revisor y aprobación** | **Pendiente de revisión formal** |
| **Documentos relacionados** | `SISAP-LC-003` · `SISAP-LC-004` · `SISAP-LC-014` · `SISAP-LC-015` · [`CHANGELOG.md`](../../../CHANGELOG.md) |

### Historial de Cambios

| Versión | Fecha | Descripción | Responsable |
|---|---|---|---|
| `1.1.0-draft` | 2026-11-23 | Trazabilidad histórica de los incrementos de `release/1.1.0` vinculando commits, requisitos, riesgos, pruebas y documentos actualizados. | Equipo de Ingeniería SISAP |

---

## 1. Línea Histórica Inmutable (`v1.0.0`)
- **`ea500b34d9db37ee7c7c3e3f9f0b0345f2f2da1f`** (`tag: v1.0.0`, rama `main`): Distribución pública inicial depurada Windows (Electron v45 + React 19 + Node.js SQLite WAL + auditoría WORM). Conservada sin alteraciones.

---

## 2. Registro Trazable de Cambios en Rama `release/1.1.0`

| Incremento / Commit | Objetivo / Solicitud | Requisitos Vinculados | Riesgos Relacionados | Pruebas Ejecutadas | Documentación Actualizada |
|---|---|---|---|---|---|
| **`4cb847b`** `feat(autoencoder): integrate verified TUS autoencoder engine and R/Node inference pipeline` | Integración del motor Autoencoder TUS auditado con SHA-256, compuerta `D-06` y visualizaciones `12D` / reconstrucción | `REQ-AE-001..008`, `REQ-INT-001`, `REQ-PRIV-002` | `RSK-002`, `RSK-004`, `RSK-009` | `AE-01..06`, `T1.1..T4.3` | `engines/autoencoder/documentation/*`, `SISAP-MOD-AE-001` |
| **`bb7078e`** `feat(intelligence): implement 5-motor intelligence architecture and longitudinal RCI/E1-E5 services` | Evolución a arquitectura de 5 motores con `RCI`, estado ONNX transparente, matriz multimodal y `E1–E5` | `REQ-CORE-004`, `REQ-LONG-001..002`, `REQ-NARR-001..002`, `REQ-MM-001`, `REQ-DSS-001` | `RSK-002`, `RSK-006`, `RSK-007`, `RSK-009` | `MOT-01`, `MOT-02` | `docs/19_.../*`, `SISAP-MOD-LONG/NARR/MM/DSS-001` |
| **`b9e94d7`** `feat(psychometrics): add Psychometric Evaluation Center, versioned catalog, and 3-level storage` | Captura digital de 6 escalas, exclusión `OCI-R`, motor 5 capas, 3 niveles inmutables y equivalencia `PSYC-09` | `REQ-PSYC-001..010`, `REQ-LONG-003`, `REQ-UX-001` | `RSK-001`, `RSK-002`, `RSK-005`, `RSK-006`, `RSK-010`, `RSK-012` | `PSYC-01..11` | `docs/20_.../*`, `SISAP-MOD-PSYC-001` |
| **`7bca47e`** `docs(release): prepare v1.1.0 changelog, release notes, and upgrade documentation` | Manifiestos `1.1.0`, `CHANGELOG.md`, `RELEASE_NOTES_v1.1.0.md` y guías de instalación/actualización | `REQ-CORE-004` | `RSK-011`, `RSK-012` | `npm test`, `npm run lint`, `npm run build`, BD limpia `health.js` | `CHANGELOG.md`, `README.md`, `RELEASE_NOTES_v1.1.0.md`, `GUIA_INSTALACION_LOCAL.md` |
| **Commit de ciclo de vida IEC 62304** *(en cierre en `release/1.1.0`)* | Implantación del sistema documental `docs/lifecycle/` + `docs/modules/` conforme a IEC 62304:2006 + AMD1:2015 | Todos (`SISAP-LC-003`) | Todos (`RSK-001..012`, especial énfasis `RSK-012`) | Re-ejecución `npm test`, `npm run lint`, verificación cero carpetas vacías | `SISAP-LC-000..018`, `SISAP-MOD-*`, notas SSOT en `docs/00..10`, `README.md`, `CHANGELOG.md` |
