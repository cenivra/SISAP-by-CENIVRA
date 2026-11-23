# COMPARACIÓN CONFIRMATORIA DE CANDIDATAS — SEMILLAS 4–6
**Fecha:** 2026-11-15 · **Estado:** confirmatorio (una sola pasada; sin reajustes tras observar resultados).
**Fuentes:** `reconstruccion_confirmatoria_por_fold.csv`, `resumen_reconstruccion_confirmatoria.csv`, `bootstrap_por_participante.csv`, `../03_CONSERVACION_Y_ESTABILIDAD/*.csv`.

## 1. Reconstrucción (escala original, media sobre 3 semillas × 5 folds)

| Config | MSE original | DE entre folds/semillas | R² original | MSE z (espacio transformado) | Épocas |
|---|---|---|---|---|---|
| **PCA-12** | **9.07** [7.96–10.16]* | 1.32 | **0.87** (0.81–0.90) | 0.20 (aprox.) | — |
| **A (M3-k12)** | 10.76 [9.72–11.80]* | 2.94 | 0.847 | 0.172 | 438 |
| **B (C1_log1p)** | 15.58 [12.18–20.32]* | 6.91 | 0.784 | **0.124** | 524 |
| **C (M1-k12)** | 17.44 [15.97–19.01]* | 2.87 | 0.752 | 0.287 | 489 |

\* IC 95 % bootstrap por participante (2000 réplicas). **Lectura clave:** B es la mejor en espacio transformado (0.124) pero la segunda peor en escala original (15.58) — **la ventaja de log1p no sobrevive a la des-transformación**; el ranking en escala original es PCA < A < B < C.

## 2. Conservación de información por variable (R² escala original)

| Variable | A | B | C |
|---|---|---|---|
| staxi_estado | **0.993** | 0.979 | 0.987 |
| bsl_total | **0.959** | **0.674** ↓ | 0.901 |
| bsl_conductual | 0.951 | **0.974** | 0.867 |
| eros_total | 0.907 | **0.954** | 0.751 |
| bads_activacion | 0.804 | **0.903** | 0.571 |
| bis_motor | 0.874 | **0.926** | 0.811 |
| bis_impulsividad_no_planeada | 0.853 | **0.897** | 0.799 |
| bis_perseverancia | 0.831 | **0.895** | 0.706 |
| gad_total | 0.869 | **0.941** | 0.662 |
| bis_autocontrol | 0.816 | **0.874** | 0.634 |
| bis_impulsividad_motora | 0.824 | **0.853** | 0.686 |
| bads_evitacion_rumia | 0.775 | **0.789** | 0.703 |
| bis_inestabilidad_cognitiva | 0.752 | **0.830** | 0.601 |
| bis_atencion | 0.706 | **0.785** | 0.603 |
| bads_afectacion_trabajo | 0.694 | **0.700** | 0.540 |
| bads_afectacion_social | 0.650 | **0.673** | 0.556 |
| staxi_rasgo | 0.628 | **0.713** | 0.541 |

**Hallazgo específico de B:** log1p mejora 15/17 variables en escala original, pero **degrada `bsl_total` (0.959 → 0.674)**: la compresión de la cola alta hace que el error en valores altos, al des-transformar, se amplifique. Es un trade-off distribucional, no un defecto de implementación.

## 3. Estabilidad (OOF, semillas 4–6; procedimiento corregido)

| Config | Procrustes (concordancia) | Congruencia dims (Hungarian \|r\|) | r_dist | Jaccard5 |
|---|---|---|---|---|
| A | 0.203 | 0.141 | **0.857** | 0.103 |
| B | 0.112 | 0.118 | 0.761 | 0.096 |
| C | **−0.008** | **0.209** | 0.851 | **0.111** |

Control negativo (A vs filas permutadas): r_dist = −0.079; Jaccard5 = 0.030. **C pierde su ventaja exploratoria de Procrustes (0.397 → −0.008): no se replica.** La congruencia de ejes sigue siendo débil en todas (0.12–0.21). La geometría es reproducible en A (0.857) y C (0.851).

## 4. Generalización, sobreajuste y extremos

| Criterio | A | B | C |
|---|---|---|---|
| Brecha train–validación (z) | −0.073 | −0.045 | **+0.214** |
| Variabilidad entre folds/semillas (DE MSE orig.) | 2.94 | **6.91** | 2.87 |
| Error id 71 (extremo) | 10.0 | **7.1** | 20.9 |
| Error id 87 (anómalo) | 7.4 | **5.3** | 22.4 |

C sobreajusta y maneja peor los casos extremos; B es la más errática entre particiones (DE 6.9).

## 5. Veredicto comparativo

1. **PCA-12 es la referencia más fuerte en reconstrucción** (9.07; R² 0.87) y es determinista.
2. **A (M3-k12) es el mejor autoencoder**: segunda mejor reconstrucción, mejor geometría, manejo razonable de extremos, estable entre particiones → **único candidato AE**.
3. **B (C1_log1p) queda descartado como candidato**: su aparente ventaja era de escala; en escala original es peor que A y muy variable.
4. **C (M1-k12) queda descartado**: peor reconstrucción, sobreajuste y casos extremos; su supuesta estabilidad dimensional no se replicó.

**No se construye índice compuesto.** El orden anterior es un resumen descriptivo por criterio, no un ranking único: la decisión depende de prioridades declaradas por el investigador.
