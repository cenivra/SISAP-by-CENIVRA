# Expediente Técnico y Científico — Motor 1: Autoencoder Funcional TUS

## Control Documental

| Campo | Valor |
|---|---|
| **Código documental** | `SISAP-MOD-AE-001` |
| **Título** | Expediente Técnico y Científico del Autoencoder Funcional TUS (IEC 62304 §5.4, §7) |
| **Versión** | `1.1.0-draft` |
| **Estado** | **En revisión** |
| **Fecha de creación** | 2026-11-23 |
| **Última actualización** | 2026-11-23 |
| **Autor / Responsable** | Equipo de Modelado Científico e Ingeniería — SISAP by CENIVRA |
| **Revisor y aprobación** | **Pendiente de revisión científica independiente** |
| **Documentos relacionados** | `SISAP-LC-001` · `SISAP-LC-003` (`REQ-AE-*`) · `SISAP-LC-004` (`RSK-002`, `RSK-004`, `RSK-009`) · [`A_INFORME_COMPROBACION_AUTOENCODER.md`](../../19_autoencoder_verification_and_intelligence_platform/A_INFORME_COMPROBACION_AUTOENCODER.md) |

### Historial de Cambios

| Versión | Fecha | Descripción | Responsable |
|---|---|---|---|
| `1.1.0-draft` | 2026-11-23 | Consolidación IEC 62304 del expediente científico y técnico de `engines/autoencoder/` (Sección 7 obligatoria), diferenciando explícitamente artefactos verificados, reconstruidos, reproducidos y pendientes. | Equipo de Ingeniería SISAP |

---

## 1. Objetivo, Uso Previsto y Restricción Epistemológica
- **Objetivo técnico:** Proyectar un vector basal estandarizado de variables psicométricas y sociodemográficas (`22v`, `24v` o prototipo confirmatorio `17v`) hacia un espacio latente continuo de **12 dimensiones (`latent_01..12`)**, midiendo su error de reconstrucción (`MSE_z`, `MAE_z`, `RMSE_z`) y su posición relativa frente a cuantiles empíricos de la cohorte de referencia ($N=166$).
- **Uso previsto:** Exploración dimensional cuantitativa de apoyo bajo supervisión profesional (`E4_latent_hypothesis`).
- **Prohibición estricta (`D-03`, `MOD-03`):** Los embeddings `12D` son **dimensiones opacas sin etiquetas clínicas ni validez diagnóstica autónoma**. El agrupamiento **GMM (`gmm_model_2.json`) permanece excluido y bloqueado** del flujo operativo.

---

## 2. Procedencia de Datos, Criterios de Inclusión/Exclusión y Diccionario de Variables
- **Cohorte de referencia canónica:** $N=166$ participantes con evaluación basal transversal en TUS (`Escalas fase transversal TUS.xlsx`, fuera del repositorio público por privacidad).
- **Criterios de inclusión en inferencia productiva (`D-06`):** Batería completa de 6 escalas activas (`BIS-11` 30 ítems, `BSL-23` 23+11+`GENERAL`, `GAD-7` 7 ítems, `STAXI-2` 49 ítems TEA, `BADS` 25/22 ítems y `EROS` + variables clínicas `edad`, `tiempo_consumo`, `trat_previos`, `sustancia`), sin valores ausentes ni fuera de rango.
- **Criterios de exclusión:**
  - `OCI-R`: excluido del sistema e inferencia.
  - En el modelo productivo `encoder_22_checkpoint_fase2`: se excluyen `STAXI_2STAXI_temperamento` (posición `#10`) y `compuesto_staxi` (posición `#11`) conforme al filtro `findCorrelation(0.85)` del pipeline original.
  - En producción: rechazo estricto de registros con datos faltantes (`D-06`), sin imputación por mediana. *(Únicamente en modo offline `modo_regresion_historica_166 = TRUE` en R se emula el tratamiento histórico de las filas `156–166` para auditoría matemática).*
- **Diccionario completo (`24` / `22` variables):** Trazado en [`02_mapa_variables_y_transformaciones.csv`](../../../sisap-by-cenivra-%E2%80%94-sistema-de-informaci%C3%B3n-cl%C3%ADnica-y-gobernanza/engines/autoencoder/evaluation/02_mapa_variables_y_transformaciones.csv) y contratos JSON en [`schemas/`](../../../sisap-by-cenivra-%E2%80%94-sistema-de-informaci%C3%B3n-cl%C3%ADnica-y-gobernanza/engines/autoencoder/schemas/contrato_entrada.json):
  - `#1..5` BIS-11: `bis_motor`, `bis_nonplanning` (`21 - Autocontrol`), `bis_cognitive_instability`, `bis_perseverance`, `bis_motor_impulsivity`.
  - `#6..7` Derivados BIS: `bis_total_calculado` (suma de 3 Z-scores), `compuesto_bis` (media de 7 Z-scores incluyendo dummy `sustanciaCannabis`).
  - `#8..11` STAXI-2: `staxi_state` (`P1..P15`), `staxi_trait` (`P16..P25`), `staxi_temperamento` *(solo `24v`)*, `compuesto_staxi` *(solo `24v`)*.
  - `#12..14` BSL-23: `bsl_general` (`0.0–1.0`), `bsl_total_integrado` (`Nuclear + Conductual`, max `136`), `compuesto_bsl`.
  - `#15` GAD-7: `gad_zscore = (GAD_Total - 7.4) / 5.853773711604051` *(en Capa 3 antes de Capa 4)*.
  - `#16..19` BADS: `bads_activation`, `bads_avoidance`, `bads_work`, `bads_social`.
  - `#20..24` Clínicas/colisión histórica documentada: `edad`, `tiempo_consumo`, `trat_previos`, `tiempo_consumoEROS` *(clon determinista de `tiempo_consumo` manteniendo `EROS_raw` independiente, `AE-04`)*, `trat_previosEROS` *(clon de `trat_previos`)*.

---

## 3. Preprocesamiento (5 Capas) y Tratamiento de Faltantes
Implementado con bit-exactitud entre [`engines/autoencoder/inference/R/01..07`](../../../sisap-by-cenivra-%E2%80%94-sistema-de-informaci%C3%B3n-cl%C3%ADnica-y-gobernanza/engines/autoencoder/inference/Autoencoder_TUS_estratificacion_APP.R) y [`autoencoderInferenceEngine.js`](../../../sisap-by-cenivra-%E2%80%94-sistema-de-informaci%C3%B3n-cl%C3%ADnica-y-gobernanza/engines/autoencoder/inference/autoencoderInferenceEngine.js):
1. **Capa 1 (`raw_items`):** Validación estructural de dominio y rango por escala; compuerta `D-06` rechaza faltantes/no finitos (`HTTP 422`).
2. **Capa 2 (Scoring de escalas):** Modos explícitos `manual_estandar` vs `excel_canonico` (`AE-02`).
3. **Capa 3 (Derivados Nivel 2B y transformación GAD-7):** Cómputo de `bis_total_calculado`, `compuesto_bis`, `compuesto_bsl`, `compuesto_staxi` y `gad_zscore` usando medias/SD fijas de `N=166` en `parametros_referencia_completos.json`.
4. **Capa 4 (Winsorización + Z-score único):** Recorte al rango `[q01, q99]` y estandarización `(x - mean) / sd` según `parametros_normalizacion_24_verificados.csv`.
5. **Capa 5 (Pase hacia adelante):** Multiplicación matricial y activación `SELU(z) = λ * (z si z > 0 else α * (e^z - 1))` (`λ = 1.0507009873554804934193349852946`, `α = 1.6732632423543772848170429916717`) en capas ocultas y activación `linear` en cuello de botella (`12D`) y salida. *(Dropout `0.15` solo aplica en entrenamiento, inactivo en inferencia).*

---

## 4. Arquitecturas, Hiperparámetros, Pérdida, Semillas y Pesos SHA-256

| Identificador | Arquitectura | Entradas | Función de Pérdida / Activación | Condiciones / Semillas | SHA-256 Fuente y JSON Integrado |
|---|---|---|---|---|---|
| **`encoder_22_checkpoint_fase2`** *(Productivo defecto)* | `22 → 32 → 24 → 12 → 24 → 32 → 22` | `22` (`X` sin `#10,#11`) | MSE · `SELU` ocultas, `linear` cuello/salida (`Dropout 0.15` en train) | Checkpoint canónico Fase 2 (`RUN_CANONICO_6d7b20a7`); pesos extraídos de HDF5 IEEE-754 `float32`. | Encoder `.h5`: `fc82dd7f7fbc87f3b45fd4455b2a8011cca5451c6f1eb64b82ddda005c77151f`<br>Full `.h5`: `57d5aab9da932c5625da361a8710415abbae0870b135011856e5a5815a69a528`<br>JSON completo: `313dcd2d8f7c136222eaff1c56583b02af332c259ff0aee85b02f349b93c3d9e` |
| **`encoder_24_deployed`** | `24 → 32 → 24 → 12 → 24 → 32 → 24` | `24` completas | MSE · `SELU` ocultas, `linear` cuello/salida | **Limitación documentada:** script original L19077-19122 reentrenó sin semilla fija; pendiente de validación longitudinal externa. | Encoder `.h5`: `598313c683529d60f9e957ea521b97cb66f6cf391a7edaee106f0b65dc129cfe`<br>Full `.h5`: `03e7423d3b48a683b7eb6483dda785c315dca8a7c3a94bb055e6f0c7632f2d9a`<br>JSON completo: `46d44a7ad05eabadc1caf70488bf2f9d6e513cb7486bdeed9d3e4bf3808694c6` |
| **`ae_tus_17to12_m3k12`** *(Confirmatorio experimental)* | `17 → 24 → 12 → 24 → 17` | `17` subescalas/totales | MSE · Escala robusta (`n_train=132`) | CV 5-fold × 3 semillas (`4, 5, 6`); pesos empaquetados de `A_sem4_fold1.keras`. | Keras: `05abc716d374a6de4f7d9cd943133d01d373dc6351ff3a1bcaf439bf50494fe3`<br>JSON: `28b3a56666c1feb6712e9f4c3bdd1fa16f010bc80b76b6dddc540fdeffd31a44` |

---

## 5. Métricas, Estabilidad, Formato de Embeddings y Procedimiento de Inferencia
- **Regresión histórica sobre `N=166` (`test_regresion_original.R`):**
  - Preprocesamiento Capa 1–4 (`166 × 24`): `max_abs_diff = 1.554e-14` (`< 1e-12`).
  - Representación latente `encoder_22` (`166 × 12` vs `representaciones_completas.csv`): `max_abs_diff = 1.788e-7` en R (`1.151e-7` reportado por tolerancia `float32`), correlación `r = 1.000000`.
- **Paridad R ↔ Node.js (`AE-02`):** `max_abs_diff = 0.0000e+0` en `encoder_22_checkpoint_fase2` (`MSE_z = 0.077715`) y `encoder_24_deployed` (`MSE_z = 0.074076`).
- **Estabilidad confirmatoria `17→12` (`A / M3-k12`, 5-fold × semillas 4–6):** `R²_orig = 0.847`, `MSE_orig = 10.76` (vs baseline lineal `PCA-12`: `MSE_orig = 9.07`, `R² = 0.87`), `r_dist = 0.857`, Procrustes `0.203`, congruencia individual de ejes `0.141`, `Jaccard5 = 0.103`.
- **Formato de embeddings:** objeto JSON con `latent_vector` (12 reales IEEE-754 finitos), diccionario `dimensions.latent_01..latent_12`, ubicación porcentual empírica (`p05, p10, p25, p50, p75, p90, p95`), distancia L2 al centro mediano $N=166$, `MSE_z`, `MAE_z`, `RMSE_z` y residuos por variable `(X_z - Xhat_z)^2`.

---

## 6. Distinción Estricta de Estado de Evidencia y Reproducibilidad

| Categoría | Elementos / Resultados Específicos | Evidencia Verificada |
|---|---|---|
| **Artefactos existentes originales verificados** | `model_registry.json`, `percentiles_referencia_12d.json/.csv`, `parametros_referencia_completos.json`, pesos `.h5` originales verificados por SHA-256 (34/35 coincidencia byte a byte en auditoría Drive). | `AE-01`, `manifest_sha256.csv` |
| **Artefactos reconstruidos / serializados desde origen** | `pesos_autoencoder_22_completo.json`, `pesos_autoencoder_24_completo.json`, `pesos_encoder_22_h5.json`, `pesos_encoder_24_h5.json`, `pesos_candidato_17_m3k12.json` extraídos determinísticamente a JSON + pipeline JS ESM `autoencoderInferenceEngine.js`. | `AE-01`, `AE-02` (`max_abs_diff = 0.0000e+0` vs R) |
| **Resultados reproducidos** | Regresión `N=166` Capa 1–4 (`1.554e-14`), latentes `22v` (`1.788e-7`, `r=1.000000`), inferencia R (`T1.1..T4.3` PASS) y Node (`AE-01..06` PASS). | Logs R 4.6.1 + `node --test` `33/33 PASS` |
| **Resultados / Validaciones pendientes** | Validación clínica longitudinal externa prospectiva de `encoder_24_deployed` y `ae_tus_17to12_m3k12`; ejecución de `test_regresion_original.R` en repositorios sin variable `SISAP_EXCEL_CANONICO` (omisión controlada). | `SISAP-LC-004` (`RSK-009`), `07_limitaciones_y_decisiones_pendientes.md` |
