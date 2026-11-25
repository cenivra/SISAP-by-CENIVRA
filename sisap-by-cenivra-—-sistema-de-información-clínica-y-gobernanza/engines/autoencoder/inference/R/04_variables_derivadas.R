# ==============================================================================
# MÓDULO: R/04_variables_derivadas.R
# CAPA 3: VARIABLES DERIVADAS Y SEPARACIÓN EXPLÍCITA EROS / TIEMPO DE CONSUMO
# Proyecto: Estratificación Funcional Transversal en TUS / SISAP-by-CENIVRA
# Fecha: 24 de octubre de 2026
# ==============================================================================
# Responsabilidad (Requisitos 3, 4.2, 5 y D-02):
#   - Calcular de forma explícita y determinista las variables compuestas que
#     forman parte del pipeline original:
#       * BIS_11BIS_total_calculado
#       * compuesto_bis (Nivel 2B)
#       * compuesto_staxi (Nivel 2B)
#       * compuesto_bsl (Nivel 2B)
#       * GAD_7GAD_zscore_intermedio (fórmula Excel (GAD_Total - 7.4)/5.853773711604051)
#   - Implementar la separación semántica estricta de la Sección 5:
#       * EROS_raw: puntuación EROS original (conservada independientemente)
#       * tiempo_consumo_raw: años de consumo originales
#       * edad_raw: edad original en años
#       * EROS_tiempo_consumo_derivado: documentada explícitamente como colisión
#         de nombres en el script original (tiempo_consumo de la hoja EROS, NO
#         una multiplicación ni cociente con EROS_Total). Para nuevos registros
#         de SISAP se asigna determinísticamente desde tiempo_consumo_raw sin
#         pedir al usuario que ingrese dos veces el tiempo de consumo ni una
#         interacción inventada.
# ==============================================================================

#' Cargar parámetros de referencia para variables derivadas desde JSON
cargar_parametros_referencia <- function(ruta_json) {
  if (!file.exists(ruta_json)) {
    stop(sprintf("[CAPA 3 ERROR] Archivo de parámetros de referencia no encontrado: %s", ruta_json))
  }
  if (!requireNamespace("jsonlite", quietly = TRUE)) {
    stop("[CAPA 3 ERROR] Se requiere el paquete 'jsonlite'.")
  }
  jsonlite::fromJSON(ruta_json, simplifyVector = TRUE)
}

#' Calcular variables derivadas (Capa 3) sin sobrescribir las variables originales ni las puntuaciones de Capa 2
#' @param obj_capa2 Objeto devuelto por ejecutar_scoring_capa2()
#' @param ref_params Lista cargada desde artefactos/preprocesamiento/parametros_referencia_completos.json
ejecutar_variables_derivadas_capa3 <- function(obj_capa2, ref_params) {
  c1 <- obj_capa2$datos_crudos_preservados
  p2 <- obj_capa2$puntuaciones

  # 1. Variables independientes preservadas intactas (Requisito 4.2 y Sección 5)
  edad_raw           <- as.numeric(c1$sociodemograficos_raw$edad_raw)
  tiempo_consumo_raw <- as.numeric(c1$clinicos_consumo_raw$tiempo_consumo_raw)
  trat_previos_raw   <- as.numeric(c1$clinicos_consumo_raw$trat_previos_raw)
  EROS_raw           <- as.numeric(p2$eros$totales$eros_total_activo)

  # Indicador dummy de Cannabis (requerido por compuesto_bis en Nivel 2B del script original)
  sust_raw <- as.character(c1$clinicos_consumo_raw$sustancia_principal_raw)
  dummy_cannabis <- if (!is.na(sust_raw) && tolower(trimws(sust_raw)) == "cannabis") 1.0 else 0.0

  # 2. Caso específico Sección 5: tiempo_consumoEROS y trat_previosEROS
  # En el script original (L806, L1015-1048, L10824-10829), tiempo_consumoEROS NO es una
  # interacción matemática con EROS_Total, sino la columna Tiempo_consumo de la hoja EROS.
  # Si el registro proviene del Excel histórico y trae el valor de la hoja EROS, se usa ese valor;
  # si es un paciente nuevo de SISAP, se clona determinísticamente desde tiempo_consumo_raw.
  tc_hoja_eros <- c1$clinicos_consumo_raw$tiempo_consumo_hoja_eros_raw
  tp_hoja_eros <- c1$clinicos_consumo_raw$trat_previos_hoja_eros_raw

  EROS_tiempo_consumo_derivado <- if (!is.null(tc_hoja_eros) && !is.na(tc_hoja_eros)) {
    as.numeric(tc_hoja_eros)
  } else {
    tiempo_consumo_raw
  }

  EROS_trat_previos_derivado <- if (!is.null(tp_hoja_eros) && !is.na(tp_hoja_eros)) {
    as.numeric(tp_hoja_eros)
  } else {
    trat_previos_raw
  }

  # 3. Derivada intra-instrumento BIS-11: BIS_11BIS_total_calculado (L575-576)
  # Fórmula original: rowSums(scale(c(bis_attention, bis_motor, bis_nonplanning)))
  bis_p <- ref_params$bis_total_calculado_z_params$parametros_cohorte_166
  bis_att <- as.numeric(p2$bis11$subescalas_primer_orden$attention)
  bis_mot <- as.numeric(p2$bis11$subescalas_primer_orden$motor)
  bis_non <- as.numeric(p2$bis11$subescalas_primer_orden$self_control_inverted_nonplanning)
  bis_ci  <- as.numeric(p2$bis11$subescalas_primer_orden$cognitive_instability)
  bis_per <- as.numeric(p2$bis11$subescalas_primer_orden$perseverance)
  bis_mi  <- as.numeric(p2$bis11$subescalas_segundo_orden$motor_impulsivity)

  z_att <- (bis_att - bis_p$Atencion$mean) / bis_p$Atencion$sd
  z_mot <- (bis_mot - bis_p$Motor$mean) / bis_p$Motor$sd
  z_non <- (bis_non - bis_p$bis_nonplanning$mean) / bis_p$bis_nonplanning$sd
  bis_total_calculado <- z_att + z_mot + z_non

  # 4. Derivada Nivel 2B: compuesto_bis (L2438-2445)
  cb_p <- ref_params$compuestos_nivel_2B_z_params$compuesto_bis
  compuesto_bis <- mean(c(
    (bis_mot - cb_p$BIS.11_bis_motor$mean) / cb_p$BIS.11_bis_motor$sd,
    (bis_non - cb_p$BIS.11_bis_nonplanning$mean) / cb_p$BIS.11_bis_nonplanning$sd,
    (bis_ci  - cb_p$BIS.11_bis_cognitive_instability$mean) / cb_p$BIS.11_bis_cognitive_instability$sd,
    (bis_per - cb_p$BIS.11_bis_perseverance$mean) / cb_p$BIS.11_bis_perseverance$sd,
    (bis_mi  - cb_p$BIS.11_bis_motor_impulsivity$mean) / cb_p$BIS.11_bis_motor_impulsivity$sd,
    (bis_total_calculado - cb_p$BIS.11_bis_total_calculado$mean) / cb_p$BIS.11_bis_total_calculado$sd,
    (dummy_cannabis - cb_p$sustancia_sustanciaCannabis$mean) / cb_p$sustancia_sustanciaCannabis$sd
  ))

  # 5. Derivada Nivel 2B: compuesto_staxi (L2438-2445)
  staxi_state <- as.numeric(p2$staxi2$totales$state_total)
  staxi_trait <- as.numeric(p2$staxi2$totales$trait_total)
  staxi_temp  <- as.numeric(p2$staxi2$subescalas$temperamento)

  cs_p <- ref_params$compuestos_nivel_2B_z_params$compuesto_staxi
  compuesto_staxi <- mean(c(
    (staxi_state - cs_p$STAXI.2_staxi_state$mean) / cs_p$STAXI.2_staxi_state$sd,
    (staxi_trait - cs_p$STAXI.2_staxi_trait$mean) / cs_p$STAXI.2_staxi_trait$sd,
    (staxi_temp  - cs_p$STAXI.2_staxi_temperamento$mean) / cs_p$STAXI.2_staxi_temperamento$sd
  ))

  # 6. Derivada Nivel 2B: compuesto_bsl (L2438-2445)
  bsl_gen <- as.numeric(p2$bsl23$subescalas$bsl_general_col_AA)
  bsl_ti  <- as.numeric(p2$bsl23$totales$bsl_total_integrado)

  cbsl_p <- ref_params$compuestos_nivel_2B_z_params$compuesto_bsl
  compuesto_bsl <- mean(c(
    (bsl_gen - cbsl_p$BSL.23_bsl_general$mean) / cbsl_p$BSL.23_bsl_general$sd,
    (bsl_ti  - cbsl_p$BSL.23_bsl_total_integrado$mean) / cbsl_p$BSL.23_bsl_total_integrado$sd
  ))

  # 7. Derivada GAD-7 Z-score de hoja Excel (D-02: L650)
  gad_tot <- as.numeric(p2$gad7$totales$gad_total_bruto)
  gad_p   <- ref_params$gad7_zscore_excel_params
  gad_zscore_excel <- (gad_tot - gad_p$mean_X1_ref) / gad_p$sd_Y1_ref

  list(
    capa = "CAPA_3_VARIABLES_DERIVADAS",
    id_registro = obj_capa2$id_registro,
    capa2_preservada = obj_capa2,
    separacion_eros_tiempo_consumo = list(
      EROS_raw = EROS_raw,
      tiempo_consumo_raw = tiempo_consumo_raw,
      edad_raw = edad_raw,
      EROS_tiempo_consumo_derivado = EROS_tiempo_consumo_derivado,
      EROS_trat_previos_derivado = EROS_trat_previos_derivado,
      naturaleza_operacion = "Colisión de nombres en merge_instrument_data() (L1015-1048): representa Tiempo_consumo de la hoja EROS, NO una multiplicación ni razón con EROS_Total."
    ),
    variables_derivadas = list(
      BIS_11BIS_total_calculado = bis_total_calculado,
      compuesto_bis = compuesto_bis,
      compuesto_staxi = compuesto_staxi,
      compuesto_bsl = compuesto_bsl,
      GAD_7GAD_zscore_intermedio = gad_zscore_excel,
      sustancia_sustanciaCannabis = dummy_cannabis
    ),
    vector_pre_normalizacion_24 = c(
      BIS_11BIS_motor                 = bis_mot,
      BIS_11BIS_nonplanning           = bis_non,
      BIS_11BIS_cognitive_instability = bis_ci,
      BIS_11BIS_perseverance          = bis_per,
      BIS_11BIS_motor_impulsivity     = bis_mi,
      BIS_11BIS_total_calculado       = bis_total_calculado,
      compuesto_bis                   = compuesto_bis,
      STAXI_2STAXI_state              = staxi_state,
      STAXI_2STAXI_trait              = staxi_trait,
      STAXI_2STAXI_temperamento       = staxi_temp,
      compuesto_staxi                 = compuesto_staxi,
      BSL_23BSL_general               = bsl_gen,
      BSL_23BSL_total_integrado       = bsl_ti,
      compuesto_bsl                   = compuesto_bsl,
      GAD_7GAD_zscore                 = gad_zscore_excel,
      BADS_bads_activation            = as.numeric(p2$bads$subescalas$activation),
      BADS_bads_avoidance             = as.numeric(p2$bads$subescalas$avoidance),
      BADS_bads_work                  = as.numeric(p2$bads$subescalas$work),
      BADS_bads_social                = as.numeric(p2$bads$subescalas$social),
      edad                            = edad_raw,
      tiempo_consumo                  = tiempo_consumo_raw,
      trat_previos                    = trat_previos_raw,
      tiempo_consumoEROS              = EROS_tiempo_consumo_derivado,
      trat_previosEROS                = EROS_trat_previos_derivado
    )
  )
}
