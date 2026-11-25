# 05 — Diccionario de Entrada y Salida para la Aplicación SISAP

**Fecha:** 24 de octubre de 2026  
**Proyecto:** Estratificación Funcional Transversal en TUS / SISAP-by-CENIVRA  
**Contratos asociados:** `config/contrato_entrada.json` y `config/contrato_salida.json`

## 1. Campos independientes de captura clínica y sociodemográfica

| Campo en `contrato_entrada.json` | Tipo | Obligatorio | Rango / Valores válidos | Unidad | Uso en el pipeline |
| :--- | :--- | :---: | :--- | :--- | :--- |
| `id_registro` | `string` / `integer` | Sí | Cadena no vacía (seudónimo interno) | — | Trazabilidad del registro (nunca entra al encoder; no usar nombre real del paciente). |
| `edad` | `number` | Sí | `[12, 100]` | Años cumplidos | Conservada como `edad_raw`; entra en la posición `#20` (24v) / `#18` (22v). |
| `tiempo_consumo` | `number` | Sí | `[0, 80]` y `<= edad` | Años | Conservada como `tiempo_consumo_raw` (posición `#21`); asignada determinísticamente a `tiempo_consumoEROS` (posición `#23`) para nuevos pacientes sin duplicar preguntas en UI. |
| `trat_previos` | `number` | Sí | `[0, 50]` | Conteo entero | Conservada como `trat_previos_raw` (posición `#22`); asignada determinísticamente a `trat_previosEROS` (posición `#24`). |
| `sustancia_principal` | `string` | No (default `"Desconocida"`) | `"Alcohol"`, `"Barbituricos"`, `"Bebidas_energeticas"`, `"Cannabis"`, `"Cocaina"`, `"Desconocida"`, `"Metanfetamina"` | Categoría nominal | Genera `sustancia_sustanciaCannabis` (`1` si `"Cannabis"`, `0` en otro caso), requerido para calcular `compuesto_bis`. |
| `sexo` | `string` | No | `"H"`, `"M"`, `"Otro"`, `"No especificado"` | Categoría | Se conserva en Capa 1 como metadato sociodemográfico; no entra al encoder. |

## 2. Instrumentos psicométricos capturados en la entrada

| Clave JSON | Instrumento | Número de ítems | Rango por ítem | Ítems invertidos (modo manual estándar) | Variables generadas que entran al encoder (24v) |
| :--- | :--- | :---: | :---: | :--- | :--- |
| `bis11` | BIS-11 | 30 (`P1`–`P30`) | `1..4` (manual) / `0..4` (Excel orientado) | `1, 7, 8, 9, 10, 12, 13, 15, 20, 29, 30` (`5 - x`); además `Autocontrol` se invierte con `21 - Autocontrol` | `#1 BIS_11BIS_motor`, `#2 BIS_11BIS_nonplanning`, `#3 BIS_11BIS_cognitive_instability`, `#4 BIS_11BIS_perseverance`, `#5 BIS_11BIS_motor_impulsivity`, `#6 BIS_11BIS_total_calculado`, `#7 compuesto_bis` |
| `staxi2` | STAXI-2 (versión española) | 49 (`P1`–`P49`) | `1..4` | Ninguno (el IEI usa signos algebraicos pero no entra al encoder) | `#8 STAXI_2STAXI_state`, `#9 STAXI_2STAXI_trait`, `#10 STAXI_2STAXI_temperamento` *(excluida en 22v)*, `#11 compuesto_staxi` *(excluida en 22v)* |
| `bsl23` | BSL-23 + Conductual + General | 23 nucleares + 11 conductuales + 1 escalar `general_score_0_1` | `0..4` (ítems) y `[0.0, 1.0]` (`general_score_0_1`) | Ninguno | `#12 BSL_23BSL_general`, `#13 BSL_23BSL_total_integrado`, `#14 compuesto_bsl` |
| `gad7` | GAD-7 | 7 (`P1`–`P7`) | `0..3` | Ninguno | `#15 GAD_7GAD_zscore` (calculado internamente desde la suma bruta de `P1`–`P7`) |
| `bads` | BADS | 25 (`P1`–`P25`) | `0..6` | Subescalas directas sin inversión; 18 ítems invertidos (`6 - x`) solo para el total BADS | `#16 BADS_bads_activation`, `#17 BADS_bads_avoidance`, `#18 BADS_bads_work`, `#19 BADS_bads_social` |
| `eros` | EROS | 10 (`P1`–`P10`) | `1..4` (manual) / `0..4` (Excel) | `2, 5, 6, 7, 9` (`5 - x` en modo manual; sin inversión en Excel canónico) | Se conserva `EROS_raw` y `EROS_total` en Capas 1–3; no entra al vector de 24 variables del encoder por la colisión histórica de nombres. |

## 3. Las 24 variables del contrato del encoder y sus parámetros fijos de referencia

| Pos. (24v) | Pos. (22v) | Nombre exacto en contrato (`ORDEN_CANONICO_24`) | Mediana ref. (cohorte) | Winsor `q01` ref. | Winsor `q99` ref. | Media post-winsor (`preproc_params.rds`) | SD post-winsor (`preproc_params.rds`) |
| :---: | :---: | :--- | :---: | :---: | :---: | :---: | :---: |
| 1 | 1 | `BIS_11BIS_motor` | `12.0000` | `0.0000` | `23.7000` | `12.225301` | `5.224275` |
| 2 | 2 | `BIS_11BIS_nonplanning` | `11.0000` | `0.6500` | `21.0000` | `10.586145` | `4.577821` |
| 3 | 3 | `BIS_11BIS_cognitive_instability` | `6.0000` | `0.0000` | `12.0000` | `6.114458` | `2.699972` |
| 4 | 4 | `BIS_11BIS_perseverance` | `8.0000` | `1.6500` | `15.0000` | `7.730723` | `2.907262` |
| 5 | 5 | `BIS_11BIS_motor_impulsivity` | `17.0000` | `3.6500` | `33.0000` | `16.869277` | `7.017989` |
| 6 | 6 | `BIS_11BIS_total_calculado` | `-0.0886` | `-3.3771` | `3.2254` | `0.005255` | `1.343070` |
| 7 | 7 | `compuesto_bis` | `-0.0384` | `-1.1795` | `1.3046` | `-0.003357` | `0.510117` |
| 8 | 8 | `STAXI_2STAXI_state` | `17.0000` | `15.0000` | `50.0500` | `20.392771` | `8.524407` |
| 9 | 9 | `STAXI_2STAXI_trait` | `16.0000` | `10.0000` | `38.7000` | `17.522289` | `7.347547` |
| 10 | — | `STAXI_2STAXI_temperamento` | `7.0000` | `5.0000` | `19.3500` | `8.114458` | `3.564833` |
| 11 | — | `compuesto_staxi` | `-0.3129` | `-0.9999` | `2.5029` | `-0.008452` | `0.891944` |
| 12 | 10 | `BSL_23BSL_general` | `0.7000` | `0.0000` | `1.0000` | `0.654096` | `0.221758` |
| 13 | 11 | `BSL_23BSL_total_integrado` | `19.5000` | `0.0000` | `96.9000` | `24.951205` | `24.049748` |
| 14 | 12 | `compuesto_bsl` | `0.0152` | `-1.6708` | `1.3411` | `-0.005364` | `0.580549` |
| 15 | 13 | `GAD_7GAD_zscore` | `0.1025` | `-1.2641` | `2.3233` | `0.116905` | `1.008350` |
| 16 | 14 | `BADS_bads_activation` | `28.0000` | `2.6500` | `42.0000` | `26.722892` | `10.251756` |
| 17 | 15 | `BADS_bads_avoidance` | `23.0000` | `0.0000` | `48.0000` | `22.885542` | `13.724304` |
| 18 | 16 | `BADS_bads_work` | `20.0000` | `1.3000` | `30.0000` | `19.644578` | `8.126287` |
| 19 | 17 | `BADS_bads_social` | `15.0000` | `0.0000` | `30.0000` | `15.307229` | `8.681339` |
| 20 | 18 | `edad` | `31.0000` | `18.0000` | `59.3500` | `33.377711` | `11.112691` |
| 21 | 19 | `tiempo_consumo` | `10.0000` | `1.0000` | `35.0500` | `11.250000` | `8.109437` |
| 22 | 20 | `trat_previos` | `1.0000` | `0.0000` | `10.7000` | `2.112651` | `2.257027` |
| 23 | 21 | `tiempo_consumoEROS` | `10.0000` | `0.6500` | `35.0500` | `11.219880` | `8.134565` |
| 24 | 22 | `trat_previosEROS` | `1.0000` | `0.0000` | `10.7000` | `2.112651` | `2.257027` |
