# A · Informe Final de Comprobación del Proyecto Autoencoder

**Fecha de auditoría e integración:** 2026-11-23  
**Fuente auditada (solo lectura):** `C:\Users\saraq\Mi unidad (zarakaeldiosdelcaos@gmail.com)\Estratificación Funcional Transversal en TUS\Analisis para la app` y artefactos confirmatorios vinculados en `Analisis en R Fase Transversal\ENTRENAMIENTO_AUTOENCODER_2026-11-14\11_EVALUACION_FINAL_Y_PREPARACION_SISAP`  
**Destino de integración:** `sisap-by-cenivra-—-sistema-de-información-clínica-y-gobernanza/engines/autoencoder/`  

---

## 1. Veredicto por Componente (Clasificación Estricta)

| Componente | Arquitectura / Identificador | SHA-256 Fuente Verificado | Estado de Madurez | Evidencia Comprobada |
|---|---|---|---|---|
| Pipeline psicométrico de 5 capas (`R/01..R/07`) y paridad Node ESM | Capas 1..5 (`excel_canonico` + `manual_estandar`, D-01, D-02, D-06) | `autoencoderInferenceEngine.js` vs `Autoencoder_TUS_estratificacion_APP.R` | **Desarrollado y validado** | Regresión sobre `N = 166`: max diff preprocesamiento = `1.554e-14` (`< 1e-12`); paridad R vs Node.js `max_abs_diff = 0.0000e+0`. |
| Modelo productivo de 22 variables | `encoder_22_checkpoint_fase2` (`22→32→24→12→24→32→22`, SELU + Linear) | Encoder HDF5 `fc82dd7f7fbc87f3b45fd4455b2a8011cca5451c6f1eb64b82ddda005c77151f` · Full `.h5` `57d5aab9da932c5625da361a8710415abbae0870b135011856e5a5815a69a528` | **Desarrollado y validado (en reproducción matemática y cohorte canónica)** | Reproduce `representaciones_completas.csv` (`166x12`) con `max_abs_diff = 1.151e-07` (`< 1e-6`) en `test_regresion_original.R`. Excluye `STAXI_2STAXI_temperamento` y `compuesto_staxi`. |
| Modelo completo de 24 variables | `encoder_24_deployed` (`24→32→24→12→24→32→24`, SELU + Linear) | Encoder HDF5 `598313c683529d60f9e957ea521b97cb66f6cf391a7edaee106f0b65dc129cfe` · Full `.h5` `03e7423d3b48a683b7eb6483dda785c315dca8a7c3a94bb055e6f0c7632f2d9a` | **Desarrollado, pendiente de validación externa** | Pesos completos verificados; paridad R vs Node `0.0000e+0`. Reentrenado sin semilla fija en script fuente; sujeto a validación longitudinal externa. |
| Decoder de reconstrucción (22v / 24v) | Capas `decoder_1`, `decoder_2`, `output` extraídas desde HDF5 completos | Contenidos en `pesos_autoencoder_22_completo.json` y `pesos_autoencoder_24_completo.json` | **Desarrollado y validado (física y numéricamente)** | Calcula `Xhat_z`, `MSE_z`, `MAE_z`, `RMSE_z` y error cuadrático por variable `(X_z - Xhat_z)^2`. |
| Analizador geométrico y percentiles empíricos `N=166` | `latentSpaceAnalyzer.js` + `percentiles_referencia_12d.json` | `7dbbe884838b4c582c1684b9c12bed8a803e8919cbce01347f9385203e0b8efc` | **Desarrollado y validado** | Posiciona las 12 dimensiones opacas (`latent_01..12`) frente a `p05, p10, p25, p50, p75, p90, p95` y estima similitud L2 / coseno. |
| Prototipo confirmatorio `17→12` (`M3-k12`) | `ae_tus_17to12_m3k12` (`A_sem4_fold1.keras`, `17→24→12→24→17`) | Keras `05abc716d374a6de4f7d9cd943133d01d373dc6351ff3a1bcaf439bf50494fe3` · Preproc RDS `14137d7b6f367469fd7496704967d7c164fbea52f45b057085f1637bbb7e976f` | **Experimental / Confirmatorio aislado** | Evaluado por CV 5-fold × 3 semillas (`R²_orig = 0.847`, `MSE_orig = 10.76` vs baseline `PCA-12` `MSE_orig = 9.07`, `r_dist = 0.857`, congruencia de ejes individuales `0.141`). No habilitado para uso clínico autónomo. |
| Clustering GMM (`2 vs 3 clases`) y etiquetas nosológicas | `gmm_model_2.json` / `gmm_meta.json` (heredado de prototipo Dash) | N/A | **Excluido de inferencia clínica (D-03 / MOD-03)** | Sin validación longitudinal externa ni replicabilidad de clústeres individuales. Bloqueado en todos los motores productivos de SISAP. |

---

## 2. Hallazgos Críticos de Auditoría Técnica

1. **Integridad de Manifiesto y Ruta Real del Checkpoint `encoder_22`:**
   - De las 35 entradas de `Analisis para la app/manifest_sha256.csv`, 34 coincidieron byte a byte (`07_limitaciones_y_decisiones_pendientes.md` tuvo una edición menor de 4,503 a 4,516 bytes).
   - El checkpoint `mfr_mejor_encoder_20260628_214641.h5` se localizó en `Datos Canonicos/04_MODELO_22/RUN_CANONICO_6d7b20a7/` (subcarpeta `RUN_CANONICO_6d7b20a7`) con SHA-256 intacto `fc82dd7f...`, lo que permitió verificar y extraer también su contraparte completa `mfr_mejor_modelo_20260628_214641.h5` (`57d5aab9...`).
2. **Defecto Localizado y Resuelto en el Lote Histórico de Regresión (`166` sujetos):**
   - El archivo canónico `Escalas fase transversal TUS.xlsx` presenta celdas en blanco tratadas como `0` por `SUM()` de Excel en filas `66, 97, 126` (`STAXI 2`) y `158` (`BSL 23`), y valores `NA` históricos en `Tiempo_consumo` y `Trat_previos` en las filas `156–166` (que el script MFR histórico sustituyó con `10.0` y `2.0`).
   - En los archivos fuente de Drive (que permanecen intactos en modo solo lectura), la ejecución sin bandera de compatibilidad histórica fallaba en esas 11 filas; en la copia integrada dentro de `engines/autoencoder/inference/Autoencoder_TUS_estratificacion_APP.R`, se añadió el parámetro explícito `modo_regresion_historica_166 = TRUE` para reproducir la auditoría histórica (`max_diff_24 = 1.554e-14`), **manteniendo estricto rechazo `D-06` sin imputación para todo paciente nuevo en producción**.
3. **Discrepancias Críticas Previas Despejadas (D-01, D-02, Sección 5):**
   - `STAXI-2` en la aplicación requiere los **49 ítems** de la versión española (el frontend anterior mostraba erróneamente 44).
   - `EROS` utiliza escala `1–4` (o `0–4` en Excel) y su puntuación (`EROS_raw`) **no se multiplica ni divide** por `tiempo_consumo`; `tiempo_consumoEROS` del modelo proviene de una colisión de columnas en el merge histórico de hojas Excel y en nuevos registros clona determinísticamente `tiempo_consumo` manteniendo `EROS_raw` independiente.
   - `GAD-7` aplica exactamente `(GAD_Total - 7.4) / 5.853773711604051` en Capa 3 antes de Winsorización `[q01, q99]` + Z-score único en Capa 4 (sin doble normalización).
   - `BSL-23` requiere los **23 ítems nucleares + 11 ítems conductuales + campo `GENERAL` (`0.0–1.0`)**.

---

## 3. Verificaciones Ejecutadas tras Integración

- **Suite R 4.6.1 (5 archivos en `engines/autoencoder/tests/`):**
  - `test_esquema_datos.R`: **PASS** (T1.1–T1.5)
  - `test_scoring_escalas.R`: **PASS** (T2.1–T2.4)
  - `test_preprocesamiento.R`: **PASS** (T3.1–T3.4)
  - `test_dimensiones_latentes.R`: **PASS** (T4.1–T4.3)
  - `test_regresion_original.R` (cohorte `N=166`): **PASS** (`Max abs diff preprocesamiento 166x24: 1.554e-14`; `Max abs diff latentes 166x12: 1.151e-07`)
- **Paridad R ↔ Node.js ESM (`autoencoderInferenceEngine.js`):**
  - `encoder_22_checkpoint_fase2`: `max_abs_diff = 0.0000e+0`, `MSE_z = 0.077715`
  - `encoder_24_deployed`: `max_abs_diff = 0.0000e+0`, `MSE_z = 0.074076`
  - `ae_tus_17to12_m3k12`: `ACCEPTED`, `MSE_orig = 1.222848`
