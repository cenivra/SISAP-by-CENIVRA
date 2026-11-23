# 04 — Inspección de Modelos Binarios (.h5) y Validación de las 12 Dimensiones Latentes

**Fecha:** 24 de octubre de 2026  
**Proyecto:** Estratificación Funcional Transversal en TUS / SISAP-by-CENIVRA

## 1. Inventario e inspección en modo de solo lectura de los artefactos `.h5`

Se inspeccionaron directamente los bloques de configuración JSON (`model_config` de Keras 2.13.1 / TensorFlow) y los tensores binarios IEEE-754 `float32` dentro de los archivos HDF5:

| Artefacto | Tamaño (bytes) | SHA-256 (`[HECHO]`) | Arquitectura interna verificada (`[HECHO]`) | Tensores de pesos y sesgos extraídos |
| :--- | :---: | :--- | :--- | :--- |
| `shiny_app/data/encoder.h5` | `26,656` | `598313c683529d60f9e957ea521b97cb66f6cf391a7edaee106f0b65dc129cfe` | `Input(24) → Dense(32, selu) → Dropout(0.15) → Dense(24, selu) → Dropout(0.15) → Dense(12, linear)` | `encoder_1/kernel (24×32)`, `encoder_1/bias (32)`, `encoder_2/kernel (32×24)`, `encoder_2/bias (24)`, `bottleneck/kernel (24×12)`, `bottleneck/bias (12)` |
| `shiny_app/data/autoencoder_completo.h5` | `103,016` | `03e7423d3b48a683b7eb6483dda785c315dca8a7c3a94bb055e6f0c7632f2d9a` | `Input(24) → 32 → 24 → 12 → 24 → 32 → Output(24)` + pesos del optimizador Adam | Encoder + Decoder completo (reentrenado en L19077–19126) |
| `mfr_mejor_encoder_20260628_214641.h5` | `26,400` | `fc82dd7f7fbc87f3b45fd4455b2a8011cca5451c6f1eb64b82ddda005c77151f` | `Input(22) → Dense(32, selu) → Dropout(0.15) → Dense(24, selu) → Dropout(0.15) → Dense(12, linear)` | `encoder_1/kernel (22×32)`, `encoder_1/bias (32)`, `encoder_2/kernel (32×24)`, `encoder_2/bias (24)`, `bottleneck/kernel (24×12)`, `bottleneck/bias (12)` |
| `mfr_mejor_encoder_20260629_110511.h5` | `26,400` | `7c75cf793e578a92fa8752bcb7750c8b554faa242506f0925b01b3221cc84abd` | `Input(22) → Dense(32, selu) → Dropout(0.15) → Dense(24, selu) → Dropout(0.15) → Dense(12, linear)` | Modelo alternativo del barrido de Fase 2 |

## 2. Hallazgos forenses críticos sobre los pesos y las 12 dimensiones latentes

### 2.1. Demostración matemática del modelo que generó `representaciones_completas.csv`
- **`[HECHO]`:** Al ejecutar el pase hacia adelante de las 3 capas de `mfr_mejor_encoder_20260628_214641.h5` (`22 → 32 → 24 → 12`) sobre las 22 columnas de `datos_autoencoder_20260629_080356.csv` (excluyendo `STAXI_2STAXI_temperamento` y `compuesto_staxi`), se reproduce la matriz `representaciones_completas.csv` (`166 × 12`, idéntica a `representaciones_latentes_mejor_modelo.csv`) con **diferencia absoluta máxima de `1.79 × 10⁻⁷` (precisión `float32` exacta) y correlación `r = 1.000000` en las 12 dimensiones**.
- **`[HECHO]`:** En cambio, `shiny_app/data/encoder.h5` (`24 → 32 → 24 → 12`) fue generado por el bloque de reentrenamiento de las líneas 19049–19135 sobre las 24 variables sin semilla aleatoria fija, mientras que en las líneas 19158–19194 el script guardó en `shiny_app/data/representaciones_completas.csv` las representaciones latentes de `checkpoint_fase2.rds` (que provenían de `mfr_mejor_encoder_20260628_214641.h5`).

### 2.2. Demostración del origen de `ENCODER_PROJECTION_WEIGHTS` en SISAP TypeScript (Resolución de P1 / INC-07)
- **`[HECHO]`:** La matriz estática `ENCODER_PROJECTION_WEIGHTS` (`24 × 12`) codificada en `src/data/autoencoderData.ts` de SISAP **NO es una matriz de pesos de ninguna capa del autoencoder**.
- **`[HECHO]`:** Se demostró numéricamente que las 24 filas de `ENCODER_PROJECTION_WEIGHTS` son **las primeras 24 filas (participantes `ID = 1` a `ID = 24`) del archivo `representaciones_completas.csv` (`166 × 12`) redondeadas a 6 decimales** (diferencia absoluta máxima `9.986 × 10⁻⁷`):
  - Fila 1 de `ENCODER_PROJECTION_WEIGHTS`: `[-0.042835, 0.020386, 0.155471, 0.241570, -0.103431, -0.272852, -0.293686, -0.168534, -0.121268, -0.271115, -0.072456, -0.054666]`
  - Fila 1 de `representaciones_completas.csv` (`ID = 1`): `[-0.042836, 0.020387, 0.155471, 0.241570, -0.103432, -0.272853, -0.293687, -0.168535, -0.121269, -0.271116, -0.072456, -0.054666]`
- **`[HECHO]`:** Multiplicar un vector de 24 variables clínicas de un paciente por las coordenadas latentes de los primeros 24 pacientes de la cohorte carece de validez matemática y clínica. Por ello, la inferencia en el frontend TypeScript actual de SISAP (`autoencoderEngine.ts`) **no debe activarse** y debe sustituirse por el pipeline verificable de 3 capas (`22 → 32 → 24 → 12` o `24 → 32 → 24 → 12`) documentado en este trabajo.
