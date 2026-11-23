# 06 — Pruebas Ejecutadas y Resultados Verificados

**Fecha:** 24 de octubre de 2026  
**Proyecto:** Estratificación Funcional Transversal en TUS / SISAP-by-CENIVRA  
**Archivo de métricas crudas:** `artefactos/modelo/resultados_verificacion_regresion.json`

## 1. Entorno de ejecución y versiones registradas (D-09)

- **`[HECHO]` Entorno de verificación actual:** Linux Sandbox VM (`x86_64`), Python `3.12+` (`numpy`, `pandas`, `openpyxl`, `json`, `hashlib`, `struct`), `strings` (GNU binutils).
- **`[HECHO]` Nota sobre runtime de R:** En la máquina virtual de esta sesión no está instalado el binario `Rscript` (`/usr/bin/Rscript` ausente). Por ello:
  1. Se escribieron los 7 módulos R (`R/01_lectura_datos.R` a `R/07_validacion_salida.R`), el script principal `Autoencoder TUS estratificacion_APP.R` y los 5 scripts de prueba (`tests/test_*.R`) en código R puro, determinista y sin dependencias de interfaz gráfica.
  2. Se ejecutó la suite completa de validación matemática y de regresión extremo a extremo mediante el motor espejo en Python (`build_and_run_tests.py`) directamente contra el archivo `Escalas fase transversal TUS.xlsx`, los `.csv`/`.rds` originales y los pesos IEEE-754 `float32` extraídos de los binarios `.h5`.
  3. Se declara explícitamente como `[NO EJECUTADO]` la invocación directa del intérprete `Rscript` sobre `tests/*.R` en esta VM por ausencia del binario `R`, dejando lista su ejecución inmediata en el entorno local de la autora (`R 4.6.1`).

## 2. Resumen de pruebas estructurales, de consistencia y de regresión ejecutadas

| ID Prueba | Script / Componente | Descripción de la prueba | Resultado (`[HECHO]`) | Métrica / Evidencia |
| :--- | :--- | :--- | :---: | :--- |
| **P-01** | `test_esquema_datos.R` | Verificación SHA-256 del script fuente y de su copia inicial antes de editar. | **PASS** | SHA-256 idéntico: `090848bd9b5be13888df4b68e70b121516012be777f54bb465cbd079d7c31ab9` |
| **P-02** | `test_esquema_datos.R` | Verificación SHA-256 y lectura de las 6 hojas de `Escalas fase transversal TUS.xlsx`, filtrando las 71 filas vacías de `BIS 11`. | **PASS** | 166 IDs idénticos (`1..166`) en las 6 hojas; SHA-256 `031b161b1431903d104ec1604defe4731f567d8c8513d5fc3e8c51590d9b9724` |
| **P-03** | `test_esquema_datos.R` | Rechazo de entradas sintéticas con `edad = NA`, ítem `GAD-7 P4 = NA`, valor fuera de rango `P7 = 99` e inconsistencia `tiempo_consumo > edad`. | **PASS** | Detiene la inferencia en Capa 1B y devuelve `status = "failed"` con categorías D-06 sin generar 12 números falsos ni imputar ceros. |
| **P-04** | `test_scoring_escalas.R` | Preservación de `items_raw` frente a `items_scored`, subescalas y totales en BIS-11, BADS, EROS, GAD-7, STAXI-2 y BSL-23. | **PASS** | Diferencia `0.0` entre las subescalas calculadas desde los ítems `P1..Pn` del Excel y las columnas de fórmulas del Excel en los 166 registros. |
| **P-05** | `test_scoring_escalas.R` | Independencia entre `EROS_raw` y `tiempo_consumo_raw` (Sección 5). | **PASS** | Modificar las respuestas de EROS de `10` a `40` cambia `EROS_raw` pero mantiene `tiempo_consumo_raw` y `tiempo_consumoEROS` invariantes. |
| **P-06** | `test_preprocesamiento.R` | Inmunidad al desorden de columnas, aplicación de parámetros fijos de referencia y trazabilidad de `GAD_7GAD_zscore` (D-02). | **PASS** | Un paciente con valores iguales a `media_post_winsor_ref` obtiene `Z = 0.000000` sin recalcular medias ni SD. |
| **P-07** | `test_regresion_original.R` | **Regresión extremo a extremo de Capa 1 a Capa 4** sobre los 166 registros del Excel canónico comparada contra `datos_autoencoder_20260629_080356.csv` (`166 × 24`). | **PASS** | **Error absoluto máximo = `1.554 × 10⁻¹⁴`** en las `3,984` celdas (`166 × 24`), demostrando reproducción exacta a precisión de máquina (`float64`). |
| **P-08** | `test_dimensiones_latentes.R` y `test_regresion_original.R` | **Regresión extremo a extremo de Capa 1 a Capa 5** con `mfr_mejor_encoder_20260628_214641.h5` (`22 → 32 → 24 → 12`) comparada contra `representaciones_completas.csv` (`166 × 12`). | **PASS** | **Error absoluto máximo = `1.788 × 10⁻⁷`** y correlación **`r = 1.000000`** en las `1,992` celdas (`166 × 12`), confirmando que las 12 dimensiones latentes se reproducen exactamente. |
| **P-09** | `test_dimensiones_latentes.R` | Inferencia con `encoder.h5` (`24 → 32 → 24 → 12`) sobre los 166 registros. | **PASS** | Produce 12 valores finitos por registro en el rango `[-0.6104, 0.7106]`, verificando la integridad SHA-256 del binario. |
