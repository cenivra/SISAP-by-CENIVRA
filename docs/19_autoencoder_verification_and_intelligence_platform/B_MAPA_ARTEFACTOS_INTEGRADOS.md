# B · Mapa de Artefactos Integrados y Trazabilidad

Todos los artefactos listados se ubican bajo `sisap-by-cenivra-—-sistema-de-información-clínica-y-gobernanza/engines/autoencoder/` y se resuelven mediante rutas relativas (`import.meta.url` en Node/TS y `SISAP_ENGINE_DIR` o detección relativa en R). **No existen rutas absolutas de Windows ni copias de datos clínicos identificables.**

---

## 1. Inventario Modular en `engines/autoencoder/`

| Subdirectorio | Archivo Integrado | Bytes | Procedencia Original / Propósito |
|---|---|---|---|
| `models/` | `model_registry.json` | 3,122 | Registro oficial de versiones, cohort `N=166` y diccionario `artifacts_sha256`. |
| `models/` | `pesos_autoencoder_22_completo.json` | 107,562 | Encoder+Decoder completos (`22→32→24→12→24→32→22`) extraídos de `mfr_mejor_modelo_20260628_214641.h5`. |
| `models/` | `pesos_autoencoder_24_completo.json` | 111,325 | Encoder+Decoder completos (`24→32→24→12→24→32→24`) extraídos de `autoencoder_completo.h5`. |
| `models/` | `pesos_candidato_17_m3k12.json` | 44,603 | Prototipo confirmatorio `17→24→12→24→17` (`A_sem4_fold1.keras`) con centros/escalas robustas (`n_train=132`). |
| `models/` | `pesos_encoder_22_h5.json` | 52,253 | Pesos Encoder-only verificados por scripts R (`R/06_inferencia_latente.R`). |
| `models/` | `pesos_encoder_24_h5.json` | 54,069 | Pesos Encoder-only de 24 variables para paridad R. |
| `models/` | `percentiles_referencia_12d.json` / `.csv` | 4,772 / 2,735 | Cuantiles empíricos (`min, p05, p10, p25, p50, p75, p90, p95, max, mean, sd`) de `Dim1..Dim12` en `N=166`. |
| `models/` | `resultados_verificacion_regresion.json` | 608 | Registro histórico de tolerancias numéricas en `N=166`. |
| `preprocessing/` | `parametros_referencia_completos.json` | 18,290 | Parámetros fijos: inversión `BIS`, Z `GAD-7`, compuestos Nivel 2B, y Winsorización/Z `normalizacion_final_24`. |
| `preprocessing/` | `parametros_normalizacion_24_verificados.csv` | 5,576 | Tabla CSV equivalente para auditoría y R. |
| `inference/` | `autoencoderInferenceEngine.js` | 40,422 | Motor Node.js ESM de 5 capas con verificación SHA-256, paridad exacta R y reconstrucción Decoder. |
| `inference/` | `Autoencoder_TUS_estratificacion_APP.R` | 10,812 | Orquestador R parametrizado sin rutas de Windows. |
| `inference/R/` | `01_lectura_datos.R` .. `07_validacion_salida.R` | 53,950 (total) | Módulos atómicos de ingesta, validación D-06, scoring, derivadas, preprocesamiento e inferencia. |
| `embeddings/` | `latentSpaceAnalyzer.js` | 9,223 | Norma L2, distancia a mediana `p50`, interpolación de percentiles, similitud coseno y top residuos. |
| `schemas/` | `contrato_entrada.json`, `contrato_salida.json`, `contrato_*_17v_confirmatorio.json` | 17,594 (total) | Contratos JSON de entrada/salida para modelos `22v/24v` y candidato `17v`. |
| `evaluation/` | `02_mapa_variables_y_transformaciones.csv`, `metricas_validacion_confirmatoria_17v.csv`, `estabilidad_confirmatoria_17v.csv` | 26,276 (total) | Auditoría variable por variable y métricas confirmatorias del candidato `17v`. |
| `documentation/` | `README.md`, `01..07_*.md`, `COMPARACION_CONFIRMATORIA_CANDIDATAS.md`, `LIMITACIONES_CANDIDATO_17V.md` | 52,072 (total) | Documentación científica y limitaciones de origen conservadas íntegramente. |
| `tests/` | `test_esquema_datos.R`, `test_scoring_escalas.R`, `test_preprocesamiento.R`, `test_dimensiones_latentes.R`, `test_regresion_original.R` | 17,864 (total) | Suite de verificación independiente en R 4.6.1. |

---

## 2. Integración en Aplicación Web y Backend SQLite

- **Backend SQLite + Node (`backend/`):**
  - Migración no destructiva [`002_intelligence_engines.sql`](file:///c:/Users/saraq/Mi%20unidad%20(zarakaeldiosdelcaos@gmail.com)/GITHUB_REPOS/SISAP-by-CENIVRA/sisap-by-cenivra-%E2%80%94-sistema-de-informaci%C3%B3n-cl%C3%ADnica-y-gobernanza/backend/migrations/002_intelligence_engines.sql) (`follow_up_evaluations`, `clinical_formulations`).
  - Servicios: `autoencoderService.js`, `analyticalService.js`, `narrativeService.js`, `multimodalService.js`, `decisionSupportService.js`.
  - Endpoints bajo `/api/engines/*`, `/api/follow-ups`, `/api/patients/:id/follow-ups`, `/api/patients/:id/intelligence`, `/api/patients/:id/formulations`.
- **Frontend React/TypeScript (`src/`):**
  - Parámetros e importación estática verificada: `src/data/autoencoderData.ts`.
  - Scoring y compuerta D-06: `src/services/scalesEngine.ts`.
  - Motor cliente SELU + reconstrucción + percentiles reales: `src/services/autoencoderEngine.ts`.
  - Visualizaciones y consola 5 motores: `LatentIntervalChart.tsx`, `ReconstructionBarsChart.tsx`, `IntelligenceEcosystemView.tsx`.

---

## 3. Qué se Excluyó Deliberadamente

- Archivos originales `.xlsx` y `.csv` con registros de la cohorte (`Escalas fase transversal TUS.xlsx`, `representaciones_completas.csv`, `datos_autoencoder_20260628_140517.csv`), por gobernanza de privacidad y no duplicación de datos clínicos.
- Binarios HDF5 redundantes en tiempo de ejecución JS: los tensores de pesos fueron verificados mediante SHA-256 y serializados a JSON determinista con bit-exactitud comprobada.
- Artefactos heredados del prototipo previo en raíz `data/modelo/` (como `gmm_model_2.json`), que se mantienen sin alterar para no romper referencias históricas pero desconectados de la inferencia activa por `D-03`.
