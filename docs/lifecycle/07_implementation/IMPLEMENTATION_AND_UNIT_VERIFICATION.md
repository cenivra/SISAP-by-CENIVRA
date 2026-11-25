# Registro de Implementación y Verificación de Unidades — SISAP v1.1

## Control Documental

| Campo | Valor |
|---|---|
| **Código documental** | `SISAP-LC-007` |
| **Título** | Registro de Implementación y Verificación de Unidades de Software (IEC 62304 §5.5) |
| **Versión** | `1.1.0-draft` |
| **Estado** | **En revisión** |
| **Fecha de creación** | 2026-11-23 |
| **Última actualización** | 2026-11-23 |
| **Autor / Responsable** | Equipo de Ingeniería y Calidad — SISAP by CENIVRA |
| **Revisor y aprobación** | **Pendiente de revisión formal** |
| **Documentos relacionados** | `SISAP-LC-002` · `SISAP-LC-006` · `SISAP-LC-008` · `SISAP-LC-015` |

### Historial de Cambios

| Versión | Fecha | Descripción | Responsable |
|---|---|---|---|
| `1.1.0-draft` | 2026-11-23 | Inventario de unidades de software implementadas en `v1.1.0`, estándares de codificación verificados y evidencia de pruebas unitarias automatizadas. | Equipo de Ingeniería SISAP |

---

## 1. Estándares y Criterios de Implementación Verificados
1. **Tipado estático y compilación (`TypeScript 7.0.2`):** Validación estricta mediante `tsc --noEmit` con **0 errores** en `src/`.
2. **Backend modular ESM (`Node.js >=22.5.0`):** Uso exclusivo de consultas SQL parametrizadas, rutas relativas derivadas vía `import.meta.url` (cero rutas locales de máquina de desarrollo) y manejo de errores tipados (`errors.js`).
3. **Separación de responsabilidades:** Reglas psicométricas aisladas en `engines/psychometrics/catalog_v1.json`; pesos de modelos aislados en `engines/autoencoder/models/*.json` verificados por SHA-256.

---

## 2. Pruebas Unitarias Automatizadas (`node --test` y `Rscript`)

| Prueba | Unidad Bajo Prueba | Procedimiento / Alcance | Resultado | Fecha / Entorno |
|---|---|---|---|---|
| `AE-01` | `autoencoderInferenceEngine.js` | Verifica hashes SHA-256 de los 8 archivos en `model_registry.json`. | **PASS** | 2026-11-23 · Node `v24.22.1` Windows x64 |
| `AE-02` | `autoencoderInferenceEngine.js`, `latentSpaceAnalyzer.js` | Pipeline 5 capas (`22v` y `24v`), 12 dimensiones finitas, reconstrucción `MSE_z` y opacidad `MOD-03`. | **PASS** | 2026-11-23 · Node `v24.22.1` |
| `AE-03` | `autoencoderInferenceEngine.js` | Compuerta `D-06` rechaza faltantes/no finitos sin imputación silenciosa. | **PASS** | 2026-11-23 · Node `v24.22.1` |
| `AE-04` | `autoencoderInferenceEngine.js` | Separación semántica `EROS` vs `tiempo_consumo` sin alterar latentes 12D. | **PASS** | 2026-11-23 · Node `v24.22.1` |
| `AE-05` | `autoencoderInferenceEngine.js` | Prototipo `ae_tus_17to12_m3k12`: infiere vector 17v y rechaza incompletos. | **PASS** | 2026-11-23 · Node `v24.22.1` |
| `PSYC-02..07` | `scoringEngine.js` / `instrumentCatalog.js` | Scoring, inversiones `5-x` y subescalas de `BIS-11 (30)`, `BSL-23 (23+compl)`, `GAD-7 (7)`, `EROS (10+9)`, `BADS (22/25)`, `STAXI-2 (49/57)`. | **PASS** | 2026-11-23 · Node `v24.22.1` |
| `PSYC-08` | `scoringEngine.js` | Rechazo estricto de omisiones y fuera de rango sin imputación. | **PASS** | 2026-11-23 · Node `v24.22.1` |
| `PSYC-09` | `scoringEngine.js` | Paridad matemática captura digital vs secuencia numérica en los 6 instrumentos activos. | **PASS** | 2026-11-23 · Node `v24.22.1` |
| `T-04, T-06, T-06b, T-08, T-09` | `patientService.js` | Búsqueda parametrizada, anti-SQLi, prevención de duplicados y rollback atómico. | **PASS** | 2026-11-23 · Node `v24.22.1` |
| `T-10, rateLimit, verifyOrigin, audit, logger` | `security.js`, `auditService.js`, `logger.js` | Loopback, rate limiting, Origin check, cadena WORM SHA-256 y redacción `[REDACTED]`. | **PASS** | 2026-11-23 · Node `v24.22.1` |
| `T1.1..T4.3` | `engines/autoencoder/tests/*.R` (4 suites) | Esquema datos (`T1.1–1.5`), scoring (`T2.1–2.4`), preprocesamiento (`T3.1–3.4`) y dimensiones latentes (`T4.1–4.3`). | **PASS** | 2026-11-23 · `Rscript.exe` |
| `test_regresion_original.R` | Regresión histórica `N=166` vs Excel | Ejecución completa validada en auditoría Drive (`1.554e-14` preproc, `1.788e-7`/`1.151e-7` latentes); en repo público sin `SISAP_EXCEL_CANONICO` omite de forma controlada (`[INFO]`). | **PASS histórico / Omitida controlada en entorno sin PHI** | 2026-11-23 · `Rscript.exe` |
