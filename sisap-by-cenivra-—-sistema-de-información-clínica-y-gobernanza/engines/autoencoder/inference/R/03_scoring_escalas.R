# ==============================================================================
# MÓDULO: R/03_scoring_escalas.R
# CAPA 2: PUNTUACIÓN DE INSTRUMENTOS PSICOMÉTRICOS (D-01)
# Proyecto: Estratificación Funcional Transversal en TUS / SISAP-by-CENIVRA
# Fecha: 24 de octubre de 2026
# ==============================================================================
# Responsabilidad (Requisitos 4, 4.1 y D-01):
#   - Mantener cada escala conceptualmente separada (BIS-11, BADS, EROS, GAD-7,
#     STAXI-2, BSL-23).
#   - Separar explícitamente en cada instrumento:
#       1. Respuestas crudas por ítem (items_raw)
#       2. Ítems invertidos o recodificados (items_scored)
#       3. Totales por instrumento (totales)
#       4. Subescalas (subescalas)
#   - Soportar de forma transparente y documentada tanto la reproducción exacta
#     de las fórmulas del Excel canónico (modo = "excel_canonico") como las reglas
#     de manual psicométrico desde ítems crudos (modo = "manual_estandar"),
#     documentando las discrepancias D-01 sin ocultarlas.
# ==============================================================================

#' Puntuar BIS-11 (30 ítems) preservando ítems crudos, invertidos, 6 subescalas de 1.er orden y 3 de 2.º orden
#' @param respuestas Vector numérico de 30 ítems
#' @param modo "excel_canonico" (celdas pre-orientadas como en la hoja 'BIS 11' y Atención=P6,9,11,20,28) o "manual_estandar" (invierte 11 ítems con 5-x y Atención=P5,9,11,20,28)
#' @param max_autocontrol_ref Valor de referencia para invertir Autocontrol (21.0 en la cohorte canónica de 166 sujetos)
puntuar_bis11_capa2 <- function(respuestas,
                                modo = c("excel_canonico", "manual_estandar"),
                                max_autocontrol_ref = 21.0) {
  modo <- match.arg(modo)
  raw <- as.numeric(respuestas)
  if (length(raw) != 30 || anyNA(raw)) {
    stop("[CAPA 2 BIS-11 ERROR] Se requieren 30 respuestas numéricas completas sin NA.")
  }

  reverse_idx_patton <- c(1L, 7L, 8L, 9L, 10L, 12L, 13L, 15L, 20L, 29L, 30L)
  scored <- raw
  if (modo == "manual_estandar") {
    scored[reverse_idx_patton] <- 5 - raw[reverse_idx_patton]
    idx_atencion <- c(5L, 9L, 11L, 20L, 28L)
  } else {
    # En la hoja 'BIS 11' del Excel canónico, las celdas P1..P30 ya están orientadas
    # y la fórmula de la columna AL (Atencion) suma P6, P9, P11, P20, P28
    idx_atencion <- c(6L, 9L, 11L, 20L, 28L)
  }

  idx_inestabilidad_cognitiva <- c(6L, 24L, 26L)
  idx_motor                   <- c(2L, 3L, 4L, 17L, 19L, 22L, 25L)
  idx_perseverancia           <- c(16L, 21L, 23L, 30L)
  idx_autocontrol             <- c(1L, 7L, 8L, 12L, 13L, 14L)
  idx_complejidad_cognitiva   <- c(10L, 15L, 18L, 27L, 29L)

  # Subescalas de segundo orden (fórmulas exactas de columnas AH, AI, AJ del Excel)
  idx_imp_cognitiva   <- c(4L, 7L, 10L, 13L, 16L, 19L, 24L, 27L)
  idx_imp_motora      <- c(2L, 6L, 9L, 12L, 15L, 18L, 21L, 23L, 26L, 29L)
  idx_imp_no_planeada <- c(1L, 3L, 5L, 8L, 11L, 14L, 17L, 20L, 22L, 25L, 28L, 30L)

  sub_atencion               <- sum(scored[idx_atencion])
  sub_inestabilidad_cognitiva <- sum(scored[idx_inestabilidad_cognitiva])
  sub_motor                  <- sum(scored[idx_motor])
  sub_perseverancia          <- sum(scored[idx_perseverancia])
  sub_autocontrol            <- sum(scored[idx_autocontrol])
  sub_complejidad_cognitiva  <- sum(scored[idx_complejidad_cognitiva])

  # En el script original (L549-553), bis_nonplanning es Autocontrol invertido por máximo observado (21.0)
  sub_autocontrol_invertido  <- max_autocontrol_ref - sub_autocontrol

  sub_imp_cognitiva   <- sum(scored[idx_imp_cognitiva])
  sub_imp_motora      <- sum(scored[idx_imp_motora])
  sub_imp_no_planeada <- sum(scored[idx_imp_no_planeada])
  total_bruto         <- sub_imp_cognitiva + sub_imp_motora + sub_imp_no_planeada

  list(
    instrumento = "BIS-11",
    modo_aplicado = modo,
    items_raw = setNames(raw, paste0("P", 1:30)),
    items_scored = setNames(scored, paste0("P", 1:30)),
    subescalas_primer_orden = list(
      attention = sub_atencion,
      cognitive_instability = sub_inestabilidad_cognitiva,
      motor = sub_motor,
      perseverance = sub_perseverancia,
      self_control = sub_autocontrol,
      self_control_inverted_nonplanning = sub_autocontrol_invertido,
      cognitive_complexity = sub_complejidad_cognitiva
    ),
    subescalas_segundo_orden = list(
      impulsividad_cognitiva = sub_imp_cognitiva,
      motor_impulsivity = sub_imp_motora,
      nonplanning_factor = sub_imp_no_planeada
    ),
    totales = list(
      total_bruto_30_items = total_bruto
    )
  )
}

#' Puntuar BADS (25 ítems) preservando ítems crudos, invertidos para el total y 4 subescalas directas
puntuar_bads_capa2 <- function(respuestas) {
  raw <- as.numeric(respuestas)
  if (length(raw) != 25 || anyNA(raw)) {
    stop("[CAPA 2 BADS ERROR] Se requieren 25 respuestas numéricas completas sin NA.")
  }

  idx_activation <- c(3L, 4L, 5L, 7L, 11L, 12L, 23L)
  idx_avoidance  <- c(8L, 9L, 10L, 13L, 14L, 15L, 24L, 25L)
  idx_work       <- c(1L, 2L, 6L, 21L, 22L)
  idx_social     <- c(16L, 17L, 18L, 19L, 20L)

  reverse_para_total <- c(1L, 2L, 6L, 8L, 9L, 10L, 13L, 14L, 15L, 16L, 17L, 18L, 19L, 20L, 21L, 22L, 24L, 25L)
  scored_total <- raw
  scored_total[reverse_para_total] <- 6 - raw[reverse_para_total]

  sub_act  <- sum(raw[idx_activation])
  sub_avoi <- sum(raw[idx_avoidance])
  sub_work <- sum(raw[idx_work])
  sub_soc  <- sum(raw[idx_social])

  list(
    instrumento = "BADS",
    items_raw = setNames(raw, paste0("P", 1:25)),
    items_scored_para_total = setNames(scored_total, paste0("P", 1:25)),
    subescalas = list(
      activation = sub_act,
      avoidance = sub_avoi,
      work = sub_work,
      social = sub_soc
    ),
    totales = list(
      total_bads_invertido = sum(scored_total),
      suma_directa_subescalas = sub_act + sub_avoi + sub_work + sub_soc
    )
  )
}

#' Puntuar EROS (10 ítems) de forma completamente independiente de tiempo_consumo
#' @param respuestas Vector numérico de 10 ítems
#' @param modo "excel_canonico" (suma directa =SUM(P1:P10) como en el Excel) o "manual_estandar" (invierte 2,5,6,7,9 con 5-x)
puntuar_eros_capa2 <- function(respuestas, modo = c("excel_canonico", "manual_estandar")) {
  modo <- match.arg(modo)
  raw <- as.numeric(respuestas)
  if (length(raw) != 10 || anyNA(raw)) {
    stop("[CAPA 2 EROS ERROR] Se requieren 10 respuestas numéricas completas sin NA.")
  }

  reverse_barraca <- c(2L, 5L, 6L, 7L, 9L)
  items_invertidos_manual <- raw
  items_invertidos_manual[reverse_barraca] <- 5 - raw[reverse_barraca]

  scored <- if (modo == "excel_canonico") raw else items_invertidos_manual

  list(
    instrumento = "EROS",
    modo_aplicado = modo,
    items_raw = setNames(raw, paste0("P", 1:10)),
    items_scored = setNames(scored, paste0("P", 1:10)),
    items_scored_manual_barraca = setNames(items_invertidos_manual, paste0("P", 1:10)),
    totales = list(
      eros_total_activo = sum(scored),
      eros_total_suma_directa_excel = sum(raw),
      eros_total_manual_invertido = sum(items_invertidos_manual)
    )
  )
}

#' Puntuar GAD-7 (7 ítems) conservando el total bruto separado de cualquier Z-score (D-02)
puntuar_gad7_capa2 <- function(respuestas) {
  raw <- as.numeric(respuestas)
  if (length(raw) != 7 || anyNA(raw)) {
    stop("[CAPA 2 GAD-7 ERROR] Se requieren 7 respuestas numéricas completas sin NA.")
  }
  total_bruto <- sum(raw)
  severidad <- if (total_bruto <= 4) "minima" else if (total_bruto <= 9) "leve" else if (total_bruto <= 14) "moderada" else "severa"

  list(
    instrumento = "GAD-7",
    items_raw = setNames(raw, paste0("P", 1:7)),
    items_scored = setNames(raw, paste0("P", 1:7)),
    totales = list(
      gad_total_bruto = total_bruto,
      severidad_clinica = severidad
    )
  )
}

#' Puntuar STAXI-2 (49 ítems en versión española del Excel canónico)
puntuar_staxi2_capa2 <- function(respuestas) {
  raw <- as.numeric(respuestas)
  if (length(raw) != 49 || anyNA(raw)) {
    stop("[CAPA 2 STAXI-2 ERROR] Se requieren 49 respuestas numéricas completas sin NA.")
  }

  idx_sent  <- c(1L, 2L, 3L, 5L, 7L)
  idx_expf  <- c(4L, 8L, 11L, 13L, 14L)
  idx_expv  <- c(6L, 9L, 10L, 12L, 15L)
  idx_temp  <- c(16L, 17L, 18L, 20L, 23L)
  idx_reacc <- c(19L, 21L, 22L, 24L, 25L)
  idx_eext  <- c(27L, 29L, 31L, 34L, 38L, 40L)
  idx_eint  <- c(28L, 32L, 35L, 37L, 39L, 42L)
  idx_cext  <- c(26L, 30L, 33L, 36L, 41L, 43L)
  idx_cint  <- c(44L, 45L, 46L, 47L, 48L, 49L)

  sent  <- sum(raw[idx_sent])
  expf  <- sum(raw[idx_expf])
  expv  <- sum(raw[idx_expv])
  temp  <- sum(raw[idx_temp])
  reacc <- sum(raw[idx_reacc])
  eext  <- sum(raw[idx_eext])
  eint  <- sum(raw[idx_eint])
  cext  <- sum(raw[idx_cext])
  cint  <- sum(raw[idx_cint])

  state_total <- sent + expf + expv
  trait_total <- temp + reacc
  iei         <- (eext + eint) - (cext + cint) + 36

  list(
    instrumento = "STAXI-2",
    items_raw = setNames(raw, paste0("P", 1:49)),
    items_scored = setNames(raw, paste0("P", 1:49)),
    subescalas = list(
      sentimiento = sent,
      expresion_fisica = expf,
      expresion_verbal = expv,
      temperamento = temp,
      reaccion = reacc,
      expresion_externa = eext,
      expresion_interna = eint,
      control_externo = cext,
      control_interno = cint
    ),
    totales = list(
      state_total = state_total,
      trait_total = trait_total,
      indice_expresion_ira_iei = iei
    )
  )
}

#' Puntuar BSL-23 (23 ítems nucleares + 11 ítems conductuales + campo GENERAL 0-1)
puntuar_bsl23_capa2 <- function(respuestas_nucleo,
                                respuestas_conductuales,
                                general_score_0_1) {
  raw_nuc <- as.numeric(respuestas_nucleo)
  raw_beh <- as.numeric(respuestas_conductuales)
  gen_val <- as.numeric(general_score_0_1)

  if (length(raw_nuc) != 23 || anyNA(raw_nuc)) {
    stop("[CAPA 2 BSL-23 ERROR] Se requieren 23 respuestas nucleares completas sin NA.")
  }
  if (length(raw_beh) != 11 || anyNA(raw_beh)) {
    stop("[CAPA 2 BSL-23 ERROR] Se requieren 11 respuestas conductuales completas sin NA.")
  }
  if (length(gen_val) != 1 || is.na(gen_val) || gen_val < 0 || gen_val > 1) {
    stop("[CAPA 2 BSL-23 ERROR] Se requiere 'general_score_0_1' numérico en el rango [0, 1].")
  }

  bsl_total_23      <- sum(raw_nuc)
  bsl_media_23      <- bsl_total_23 / 23.0
  bsl_conductual_11 <- sum(raw_beh)
  bsl_total_integrado <- bsl_total_23 + bsl_conductual_11

  list(
    instrumento = "BSL-23",
    items_raw_nucleo = setNames(raw_nuc, paste0("P", 1:23)),
    items_raw_conductuales = setNames(raw_beh, paste0("P", 1:11, "_2")),
    subescalas = list(
      bsl_general_col_AA = gen_val,
      bsl_media_23_items = bsl_media_23,
      bsl_conductual_11_items = bsl_conductual_11
    ),
    totales = list(
      bsl_23_total = bsl_total_23,
      bsl_total_integrado = bsl_total_integrado
    )
  )
}

#' Ejecutar Capa 2 completa para un registro validado de Capa 1
ejecutar_scoring_capa2 <- function(obj_capa1,
                                   modo_bis11 = "excel_canonico",
                                   modo_eros = "excel_canonico") {
  inst <- obj_capa1$instrumentos_raw

  # Permitir tanto cálculo desde ítems crudos como lectura directa de subescalas del Excel canónico
  res_bis <- if (!is.null(inst$bis11$subescalas_precalculadas)) {
    sp <- inst$bis11$subescalas_precalculadas
    list(
      instrumento = "BIS-11",
      modo_aplicado = "precalculado_excel",
      items_raw = inst$bis11$respuestas,
      subescalas_primer_orden = list(
        attention = sp$Atencion,
        cognitive_instability = sp$Inestabilidad_Cognitiva,
        motor = sp$Motor,
        perseverance = sp$Perseverancia,
        self_control = sp$Autocontrol,
        self_control_inverted_nonplanning = 21.0 - sp$Autocontrol,
        cognitive_complexity = sp$Complejidad_Cognitiva
      ),
      subescalas_segundo_orden = list(
        motor_impulsivity = sp$Impulsividad_Motora,
        nonplanning_factor = sp$Impulsividad_no_planeada
      ),
      totales = list(total_bruto_30_items = sp$Total)
    )
  } else {
    puntuar_bis11_capa2(inst$bis11$respuestas, modo = modo_bis11)
  }

  res_bads <- if (!is.null(inst$bads$subescalas_precalculadas)) {
    sp <- inst$bads$subescalas_precalculadas
    list(
      instrumento = "BADS",
      modo_aplicado = "precalculado_excel",
      items_raw = inst$bads$respuestas,
      subescalas = list(
        activation = sp$Activacion,
        avoidance = sp$Evitacion_Rumia,
        work = sp$Afectacion_trabajo,
        social = sp$Afectacion_social
      ),
      totales = list(suma_directa_subescalas = sp$Activacion + sp$Evitacion_Rumia + sp$Afectacion_trabajo + sp$Afectacion_social)
    )
  } else {
    puntuar_bads_capa2(inst$bads$respuestas)
  }

  res_eros <- if (!is.null(inst$eros$subescalas_precalculadas)) {
    sp <- inst$eros$subescalas_precalculadas
    list(
      instrumento = "EROS",
      modo_aplicado = "precalculado_excel",
      items_raw = inst$eros$respuestas,
      totales = list(eros_total_activo = sp$EROS_Total, eros_total_suma_directa_excel = sp$EROS_Total)
    )
  } else {
    puntuar_eros_capa2(inst$eros$respuestas, modo = modo_eros)
  }

  res_gad <- if (!is.null(inst$gad7$subescalas_precalculadas)) {
    sp <- inst$gad7$subescalas_precalculadas
    list(
      instrumento = "GAD-7",
      modo_aplicado = "precalculado_excel",
      items_raw = inst$gad7$respuestas,
      totales = list(gad_total_bruto = sp$GAD_Total)
    )
  } else {
    puntuar_gad7_capa2(inst$gad7$respuestas)
  }

  res_staxi <- if (!is.null(inst$staxi2$subescalas_precalculadas)) {
    sp <- inst$staxi2$subescalas_precalculadas
    list(
      instrumento = "STAXI-2",
      modo_aplicado = "precalculado_excel",
      items_raw = inst$staxi2$respuestas,
      subescalas = list(temperamento = sp$TEMP, sentimiento = sp$SENT),
      totales = list(state_total = sp$TOTAL_ESTADO, trait_total = sp$TOTAL_RASGO)
    )
  } else {
    puntuar_staxi2_capa2(inst$staxi2$respuestas)
  }

  res_bsl <- if (!is.null(inst$bsl23$subescalas_precalculadas)) {
    sp <- inst$bsl23$subescalas_precalculadas
    list(
      instrumento = "BSL-23",
      modo_aplicado = "precalculado_excel",
      items_raw_nucleo = inst$bsl23$respuestas,
      subescalas = list(bsl_general_col_AA = sp$GENERAL, bsl_conductual_11_items = sp$BSL_23_Conductual),
      totales = list(bsl_23_total = sp$BSL_23_Total, bsl_total_integrado = sp$Total_Integrado)
    )
  } else {
    puntuar_bsl23_capa2(inst$bsl23$respuestas, inst$bsl23$respuestas_conductuales, inst$bsl23$general_score_0_1)
  }

  list(
    capa = "CAPA_2_PUNTUACION_INSTRUMENTOS",
    id_registro = obj_capa1$id_registro,
    datos_crudos_preservados = obj_capa1,
    puntuaciones = list(
      bis11  = res_bis,
      bads   = res_bads,
      eros   = res_eros,
      gad7   = res_gad,
      staxi2 = res_staxi,
      bsl23  = res_bsl
    )
  )
}
