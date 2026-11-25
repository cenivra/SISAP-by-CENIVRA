# 07 — Limitaciones, Incompatibilidades Abiertas y Decisiones Pendientes para Producción en SISAP

**Fecha:** 24 de octubre de 2026

**Proyecto:** Estratificación Funcional Transversal en TUS / SISAP-by-CENIVRA

## 1. Decisiones resueltas con evidencia en esta refactorización (`[HECHO]`)

1. **Fórmula y naturaleza de `tiempo_consumoEROS` (Sección 5):** Resuelto con evidencia directa del script R (L806, L1015–1048, L10824–10829). No es una interacción matemática con `EROS_Total`, sino la columna `Tiempo_consumo` de la hoja `EROS` que sobrevivió al merge por llamarse `tiempo_consumo_eros`.

2. **Exclusión accidental de `EROS_Total` en el modelo original:** Resuelto con evidencia (L10753 y L11891). Dos pasadas de `limpiar_nombres_psicometrico()` transformaron `EROS_eros_total` → `eros_total` → `total`, dejándola fuera del filtro regex `^EROS`.

3. **Origen exacto del `Z Score` de `GAD-7` (D-02):** Resuelto al inspeccionar las fórmulas de la hoja `GAD 7` (`M2 = (K2 - $X$1)/$Y$1`, donde `X1 = AVERAGE($K$2:$K$11) = 7.4` y `Y1 = STDEV.S($K$2:$K$11) = 5.853773711604051`).

4. **Origen de `ENCODER_PROJECTION_WEIGHTS` en SISAP TypeScript (INC-07 / P1):** Resuelto. Se demostró que la matriz `24 × 12` en `src/data/autoencoderData.ts` contiene las primeras 24 filas de pacientes de `representaciones_completas.csv` y **no** los pesos de ninguna capa del autoencoder.

5. **Identificación del encoder que generó `representaciones_completas.csv` (D-04):** Resuelto. `mfr_mejor_encoder_20260628_214641.h5` (`22 → 32 → 24 → 12`) reproduce `representaciones_completas.csv` con error `1.79 × 10⁻⁷` (`float32` exacto), mientras que `shiny_app/data/encoder.h5` (`24 → 32 → 24 → 12`) proviene de un reentrenamiento posterior sin semilla fija (L19049–19135).

## 2. Decisiones clínicas y de arquitectura que continúan abiertas (`[PENDIENTE]`)

| Código | Decisión pendiente | Por qué no debe resolverse arbitrariamente | Acción requerida del equipo clínico / técnico | 
| ----- | ----- | ----- | ----- | 
| **PEND-01 (D-04)** | **Elección oficial entre el encoder de 22 entradas (`mfr_mejor_encoder_20260628_214641.h5`) y el encoder de 24 entradas (`shiny_app/data/encoder.h5`)** | El primero (`22 → 32 → 24 → 12`) es el que produjo las representaciones latentes guardadas en `checkpoint_fase2.rds` y `representaciones_completas.csv` y las métricas de reconstrucción (`R² = 0.8336`). El segundo (`24 → 32 → 24 → 12`) fue copiado a `shiny_app/data/encoder.h5` tras un reentrenamiento sin semilla fija. | Ambos modelos están soportados y verificados por SHA-256 en `R/06_inferencia_latente.R`. El responsable científico debe firmar cuál de los dos `model_id` (`encoder_22_checkpoint_fase2` o `encoder_24_deployed`) será el canónico de producción. | 
| **PEND-02 (D-01)** | **Regla de puntuación para nuevos pacientes desde ítems crudos (`excel_canonico` vs `manual_estandar`)** | En el Excel histórico, las celdas `P1..P30` de `BIS-11` ya estaban orientadas, `Atencion` sumó `P6` en vez de `P5`, `Autocontrol` se invirtió restando de `21` (máximo muestral) en vez de `24` (máximo teórico), y `EROS` no invirtió los ítems `2, 5, 6, 7, 9`. Además, en `BSL-23` la columna `GENERAL` es una escala visual `0.0–1.0` independiente de los 23 ítems. | Si en SISAP el paciente responde ítems crudos Likert sin pre-orientar, debe usarse la inversión de ítems en `bis11` y decidir si el formulario de SISAP incluirá el deslizador `0.0–1.0` de estado general (`BSL_23BSL_general`). | 
| **PEND-03 (D-03)** | **Reconciliación del clustering GMM (`G = 2` vs `G = 3` vs `G = 4`)** | En Nivel 3B se entrenó un GMM de 4 clases sobre PCA; en el bloque final se guardaron tanto `gmm_model_2.rds` (`G = 2`) como `gmm_model_3.rds` / `gmm_model.rds` (`G = 3`). | Mantener el clustering desacoplado de las 12 dimensiones latentes hasta que se valide clínicamente una única solución de perfiles. | 
| **PEND-04 (D-05)** | **Elección del runtime de producción para SISAP y mantenimiento del Motor B desactivado** | SISAP es una SPA en React/TypeScript que actualmente multiplica por una matriz inválida (`ENCODER_PROJECTION_WEIGHTS`) y permite mutar pesos en `localStorage`. | Mantener el Motor B **desactivado** en SISAP hasta elegir entre un microservicio backend (R Plumber / Python FastAPI) que ejecute las 3 capas `Dense` con verificación SHA-256 en servidor, o una exportación auditada y bloqueada contra escritura en `localStorage`. | 
