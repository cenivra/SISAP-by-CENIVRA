# 01 — Auditoría de Fuentes, Trazabilidad del Script Original y Esquema del Excel Canónico

**Fecha:** 24 de octubre de 2026  
**Proyecto:** Estratificación Funcional Transversal en TUS / SISAP-by-CENIVRA  
**Modalidad:** Auditoría forense en modo de solo lectura y refactorización sobre copia verificada.

## 1. Verificación y preservación del script fuente original

| Atributo | Evidencia verificada (`[HECHO]`) |
| :--- | :--- |
| **Ruta oficial (solo lectura)** | `C:\Users\saraq\Mi unidad\Estratificación Funcional Transversal en TUS\Analisis en R Fase Transversal\Script analisis\Autoencoder TUS estratificacion.R` |
| **Tamaño exacto** | `825,213` bytes (`19,520` líneas) |
| **SHA-256 original** | `090848bd9b5be13888df4b68e70b121516012be777f54bb465cbd079d7c31ab9` |
| **Copia inicial de trabajo** | `Analisis para la app/Autoencoder TUS estratificacion_APP.R` |
| **SHA-256 copia inicial** | `090848bd9b5be13888df4b68e70b121516012be777f54bb465cbd079d7c31ab9` (coincidencia 100% verificada antes de refactorizar) |
| **Semilla aleatoria en script** | `set.seed(123)` en línea 86 (Nivel 1); en `ejecutar_autoencoder_multiple()` (L15068) usa `seed_base + i`; en el bloque final de reentrenamiento de `encoder.h5` (L19049–19135) **no se fija semilla** antes de compilar/entrenar. |

## 2. Mapa de dependencias y estructura del script original (`Autoencoder TUS estratificacion.R`)

El archivo fuente contiene cinco niveles metodológicos encadenados a lo largo de 19,520 líneas:

| Bloque / Nivel | Líneas | Entradas leídas | Operaciones clave | Artefactos escritos |
| :--- | :--- | :--- | :--- | :--- |
| **Nivel 1 (Capas 1–9)** | 1–1743 | `Escalas fase transversal TUS.xlsx` (6 hojas) | Lectura de escalas, inversión de `Autocontrol` (`max - x`), cálculo de `bis_total_calculado`, consolidación de `clinical_vars` (prioridad BADS sobre EROS), dummies de `sustancia`, unión `merge_instrument_data()`, indicadores agregados (`severidad_multidominio`, `desregulacion_emocional_impulsiva`). | `output_nivel1/datos_integrados_nivel1.csv`, `output_nivel1/datos_red_nivel1.csv` |
| **Nivel 2A (Diagnóstico de red)** | 1744–2305 | `output_nivel1/datos_red_nivel1.csv` | Estimación de red EBICglasso, centralidad por nodo y por bloque, detección de pares con `|r| > 0.85` (`2A_variables_eliminadas.csv`). | `resultados_nivel2A/resultados_diagnostico_2A.rds` |
| **Nivel 2B (Preparación MCDL)** | 2306–2709 | `resultados_diagnostico_2A.rds`, `datos_red_nivel1.csv` | Eliminación de variables redundantes de Nivel 2A y creación de compuestos por bloque (`compuesto_bis`, `compuesto_staxi`, `compuesto_eros`, `compuesto_bsl`, `compuesto_total`, `compuesto_otros_2`) vía `rowMeans(scale(datos_bloque))`. | `resultados_nivel2B/dataset_preparado_mcdl.csv` (166 × 38) |
| **Nivel 3 (PCA y GMM preliminar)** | 2710–4315 | `dataset_preparado_mcdl.csv` | PCA exploratorio (`X_pc_1..4`) y GMM preliminar de 4 clases (`clase_latente_3B`, `probabilidad_clase_3B`, `incertidumbre_clase_3B`). | `resultados_nivel3/dataset_clasificado_3B.rds` (166 × 45) |
| **Nivel 4 y 5 (Clustering observable y checkpoint)** | 4316–10680 | `dataset_clasificado_3B.rds` | Evaluación de clustering jerárquico, k-means, PAM y difuso sobre variables observables. | `datos_preparados_nivel4.rds`, `resultados_nivel5/preparacion_mcdl.rds` |
| **Bloque Preprocesamiento MFR** | 10681–13505 | `resultados_nivel3/dataset_clasificado_3B.rds` | 1.ª pasada de `limpiar_nombres_psicometrico()`, imputación por mediana (L11591), winsorización cuantiles `[0.01, 0.99]` (L11676), guardado de `shiny_app/data/preproc_params.rds` (L11782), Z-score `scale()` (L11789), 2.ª pasada de `limpiar_nombres_psicometrico()` (L11891) y selección de 24 variables (L12884). | `datos_mfr_clean_[ts].csv` (166 × 45), `datos_autoencoder_[ts].csv` (166 × 24) |
| **Bloque Autoencoder MFR y Experimentos** | 13506–19047 | `datos_para_autoencoder` (166 × 24) | En `ejecutar_pipeline_autoencoder_mfr()` aplica `caret::findCorrelation(cutoff = 0.85)` (L16497–16508), que elimina `STAXI_2STAXI_temperamento` y `compuesto_staxi` (24 → 22 variables), y entrena el encoder `22 → 32 → 24 → 12`, guardando `checkpoint_fase2.rds`. | `mfr_mejor_encoder_20260628_214641.h5`, `checkpoint_fase2.rds` |
| **Reentrenamiento y exportación a Shiny** | 19048–19520 | `checkpoint_fase2.rds`, `datos_para_autoencoder` | Reentrena un autoencoder `24 → 32 → 24 → 12` directamente sobre las 24 variables sin `findCorrelation` y guarda `shiny_app/data/encoder.h5` (L19122), pero exporta `representaciones_completas.csv` desde `checkpoint_fase2$representaciones_latentes` (generadas por el modelo de 22 entradas, L19167–19194). | `shiny_app/data/encoder.h5`, `autoencoder_completo.h5`, `representaciones_completas.csv`, `gmm_model.rds`, `gmm_model_2.rds`, `gmm_model_3.rds` |

## 3. Auditoría de la fuente canónica (`Escalas fase transversal TUS.xlsx`)

- **Ruta canónica:** `C:\Users\saraq\Mi unidad\Estratificación Funcional Transversal en TUS\Analisis en R Fase Transversal\Datos Canonicos\01_FUENTES\DATOS_ORIGEN\Escalas fase transversal TUS.xlsx`
- **Tamaño:** `244,799` bytes
- **SHA-256:** `031b161b1431903d104ec1604defe4731f567d8c8513d5fc3e8c51590d9b9724`

### 3.1. Inventario de hojas, dimensiones, fórmulas e identificadores

| Hoja | Filas totales (sin cabecera) | Filas con datos reales | Columnas | Ítems crudos | Fórmulas en hoja Excel (`[HECHO]`) | Anomalías detectadas en datos origen (`[HECHO]`) |
| :--- | :---: | :---: | :---: | :--- | :--- | :--- |
| `BIS 11` | 237 | **166** (filas 167–237 vacías salvo `ID = ROW()-1`) | 43 | `P1`–`P30` (pre-orientados en Excel, rango 0–4) | `Impulsividad Cognitiva`, `Impulsividad Motora`, `Impulsividad no planeada`, `Total`, `Atencion`, `Inestabilidad Cognitiva`, `Motor`, `Perseverancia`, `Autocontrol`, `Complejidad Cognitiva ` | 71 filas finales vacías con fórmula `ID`; 1 celda con valor `15` en un ítem; `Atencion` suma `P6,P9,P11,P20,P28` (omite `P5` e incluye `P6`). |
| `BSL 23` | 166 | **166** | 46 | `P1`–`P23` (núcleo, 0–4) y `P1 -2` a `P11 - 2` (conductual, 0–4) | `BSL_23_Total = SUM(P1:P23)`, `Media BSL 23 = AM2/23`, `BSL_23_Conductual = SUM(AB2:AL2)`, `Total Integrado = AM2 + SUM(AB2:AL2)` | Fila 158 tiene `P1 = NA` (Excel `SUM` lo trata como 0); columna `GENERAL` (col AA) es un valor estático en `[0, 1]` distinto de `Media BSL 23` (`r = -0.248`). |
| `GAD 7` | 166 | **166** | 25 | `P1`–`P7` (0–3) | ` GAD_Total = SUM(P1:P7)`, `Z Score = (K2 - $X$1)/$Y$1`, `X1 = AVERAGE($K$2:$K$11) = 7.4`, `Y1 = STDEV.S($K$2:$K$11) = 5.8537737` | Fila 63 tiene `P7 = 99` (código de no respuesta no filtrado que infla `GAD_Total = 104`, luego recortado por winsorización en R); 9 columnas sin nombre (`O`–`W`). |
| `STAXI 2` | 166 | **166** | 64 | `P1`–`P49` (1–4) | `SENT.`, `EXP.F.`, `EXP.V.`, `TOTAL_ESTADO`, `TEMP.`, `REACC.`, `TOTAL_RASGO`, `E.EXT.`, `E.INT.`, `C.EXT.`, `C.INT.`, `IEI` | Filas 97 y 126 tienen dos espacios `'  '` en `P8`; fila 66 tiene `P26`–`P49` vacíos (`None`). |
| `BADS` | 166 | **166** | 40 | `P1`–`P25` (0–6) | `Activacion`, `Evitacion/Rumia`, `Afectacion del trabajo`, `Afectacion de la vida social` | Filas 156–166 (11 participantes) tienen `Tiempo_consumo = None` y `Trat_previos = None`; 5 columnas finales nulas. |
| `EROS` | 166 | **166** | 17 | `P1`–`P10` (0–4 en Excel) | `EROS_Total = SUM(P1:P10)` (suma directa sin inversión de ítems) | Filas 156–166 tienen `Tiempo_consumo = None` y `Trat_previos = None`; `Tiempo_consumo` difiere de la hoja `BADS` en 81 de los 166 registros. |

## 4. Resolución del caso específico: `EROS` y `tiempo_consumo` (`tiempo_consumoEROS`)

- **`[HECHO]` Procedencia exacta en el código:**
  1. En la línea 806 de `Autoencoder TUS estratificacion.R`, al leer la hoja `EROS` (que también incluye las columnas demográficas/clínicas `ID`, `Sexo`, `Edad`, `Tiempo_consumo`, `Sustancia`, `Trat_previos`), el autor creó el dataframe `eros_df` renombrando esas tres columnas con el sufijo `_eros`:
     ```r
     tiempo_consumo_eros = eros_data$Tiempo_consumo,
     sustancia_eros = eros_data$Sustancia,
     trat_previos_eros = eros_data$Trat_previos,
     eros_total = eros_total
     ```
  2. En la función `merge_instrument_data()` (líneas 1015–1025), la lista de exclusión de columnas demográficas duplicadas buscaba los nombres exactos `c("id", "sexo", "edad", "tiempo_consumo", "sustancia", "trat_previos", "fuente")`. Como en `eros_df` se llamaban `tiempo_consumo_eros` y `trat_previos_eros`, **no fueron excluidas** y se fusionaron en `integrated_data` con el prefijo `EROS_`: `EROS_tiempo_consumo_eros` y `EROS_trat_previos_eros`.
  3. En la función `limpiar_nombres_psicometrico()` (líneas 10753 y 10824–10829), la regla `"^EROS_" = ""` eliminó el prefijo `EROS_`, y la regla de sufijo convirtió `_eros` en `_EROS`, seguido de la segunda pasada (línea 11891) que colapsó el guion bajo, dando lugar a **`tiempo_consumoEROS`** (posición #23) y **`trat_previosEROS`** (posición #24).
  4. Al mismo tiempo, la verdadera puntuación de la escala EROS (`EROS_eros_total`) perdió `"^EROS_"` en la primera pasada (`eros_total`) y perdió `"^eros_"` en la segunda pasada, quedando renombrada simplemente como **`total`** en `datos_mfr_clean`. Por ello, el filtro por expresión regular `^EROS` de la línea 12003 no la encontró y la puntuación real de EROS quedó **excluida** de las 24 variables del autoencoder.
- **`[HECHO]` Consecuencia para la arquitectura refactorizada:**
  - `tiempo_consumoEROS` **NO es una multiplicación, división, razón ni interacción matemática** entre la escala EROS y el tiempo de consumo; es la columna `Tiempo_consumo` (en años) de la hoja `EROS`.
  - En el pipeline refactorizado (`R/03_scoring_escalas.R` y `R/04_variables_derivadas.R`), `EROS_raw`, `tiempo_consumo_raw` y `edad_raw` se mantienen completamente independientes. La aplicación SISAP solicita una única vez `tiempo_consumo` y las 10 respuestas de `EROS`, y el módulo `R/04_variables_derivadas.R` asigna determinísticamente `tiempo_consumoEROS` sin pedir al usuario una variable compuesta.
