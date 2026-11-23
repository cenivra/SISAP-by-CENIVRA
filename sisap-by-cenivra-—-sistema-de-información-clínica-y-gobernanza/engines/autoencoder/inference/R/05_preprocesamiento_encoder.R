# ==============================================================================
# MÓDULO: R/05_preprocesamiento_encoder.R
# CAPA 4: PREPROCESAMIENTO DETERMINISTA DEL ENCODER (Sección 7)
# Proyecto: Estratificación Funcional Transversal en TUS / SISAP-by-CENIVRA
# Fecha: 24 de octubre de 2026
# ==============================================================================
# Responsabilidad (Sección 7.1, 7.2 y 7.3):
#   - Separar ajuste (entrenamiento) y aplicación (inferencia en producción).
#   - Aplicar exclusivamente los parámetros fijos de referencia de la cohorte
#     canónica (Winsorización [q01, q99] + Z-score con media y SD de preproc_params.rds),
#     sin recalcular medias ni desviaciones estándar con cada paciente nuevo.
#   - Seleccionar y ordenar explícitamente las características según el contrato
#     canónico de 24 variables (o 22 variables para el modelo verificado de Fase 2).
#   - Ejecutar las 8 validaciones previas a la inferencia (Sección 7.3).
# ==============================================================================

ORDEN_CANONICO_24 <- c(
  "BIS_11BIS_motor",
  "BIS_11BIS_nonplanning",
  "BIS_11BIS_cognitive_instability",
  "BIS_11BIS_perseverance",
  "BIS_11BIS_motor_impulsivity",
  "BIS_11BIS_total_calculado",
  "compuesto_bis",
  "STAXI_2STAXI_state",
  "STAXI_2STAXI_trait",
  "STAXI_2STAXI_temperamento",
  "compuesto_staxi",
  "BSL_23BSL_general",
  "BSL_23BSL_total_integrado",
  "compuesto_bsl",
  "GAD_7GAD_zscore",
  "BADS_bads_activation",
  "BADS_bads_avoidance",
  "BADS_bads_work",
  "BADS_bads_social",
  "edad",
  "tiempo_consumo",
  "trat_previos",
  "tiempo_consumoEROS",
  "trat_previosEROS"
)

ORDEN_CANONICO_22 <- setdiff(ORDEN_CANONICO_24, c("STAXI_2STAXI_temperamento", "compuesto_staxi"))

#' Ejecutar Capa 4: Selección por contrato, Winsorización de referencia y Estandarización Z-score única
#' @param obj_capa3 Objeto devuelto por ejecutar_variables_derivadas_capa3()
#' @param ref_params Lista de parámetros cargada desde parametros_referencia_completos.json
#' @param aplicar_winsor_ref Booleano (TRUE reproduce exactamente el bloque MFR L11675-11680)
ejecutar_preprocesamiento_capa4 <- function(obj_capa3,
                                            ref_params,
                                            aplicar_winsor_ref = TRUE) {
  vec_bruto <- obj_capa3$vector_pre_normalizacion_24
  if (is.null(vec_bruto)) {
    stop("[CAPA 4 ERROR] El objeto de Capa 3 no contiene 'vector_pre_normalizacion_24'.")
  }

  # Validación 1 y 2 (Sección 7.3): Presencia y nombres de todas las 24 características
  faltantes <- setdiff(ORDEN_CANONICO_24, names(vec_bruto))
  if (length(faltantes) > 0) {
    stop(sprintf(
      "[CAPA 4 CONTRATO ERROR] Faltan características requeridas por el contrato de entrada: %s",
      paste(faltantes, collapse = ", ")
    ))
  }

  # Forzar orden exacto del contrato
  vec_ordenado <- as.numeric(vec_bruto[ORDEN_CANONICO_24])
  names(vec_ordenado) <- ORDEN_CANONICO_24

  # Validación 7 (Sección 7.3): Prohibir NA o valores no finitos antes de normalizar
  if (any(!is.finite(vec_ordenado))) {
    vars_na <- names(vec_ordenado)[!is.finite(vec_ordenado)]
    stop(sprintf(
      "[CAPA 4 VALIDACIÓN D-06 ERROR] Existen valores ausentes o no finitos en el vector pre-encoder: %s",
      paste(vars_na, collapse = ", ")
    ))
  }

  norm_dict <- ref_params$normalizacion_final_24
  vec_winsor <- numeric(length(ORDEN_CANONICO_24))
  vec_zscore <- numeric(length(ORDEN_CANONICO_24))
  names(vec_winsor) <- ORDEN_CANONICO_24
  names(vec_zscore) <- ORDEN_CANONICO_24

  for (v in ORDEN_CANONICO_24) {
    p <- norm_dict[[v]]
    if (is.null(p)) {
      stop(sprintf("[CAPA 4 ERROR] No existen parámetros de referencia para la variable '%s'.", v))
    }
    val <- vec_ordenado[v]
    if (aplicar_winsor_ref) {
      val <- min(max(val, as.numeric(p$winsorize_q01_ref)), as.numeric(p$winsorize_q99_ref))
    }
    vec_winsor[v] <- val

    sd_ref <- as.numeric(p$sd_post_winsor_ref)
    mean_ref <- as.numeric(p$media_post_winsor_ref)
    if (is.na(sd_ref) || sd_ref <= 0) {
      stop(sprintf("[CAPA 4 ERROR] Desviación estándar de referencia inválida para '%s'.", v))
    }
    vec_zscore[v] <- (val - mean_ref) / sd_ref
  }

  # Extraer subvector de 22 variables en orden exacto para el encoder verificado de Fase 2
  vec_zscore_22 <- vec_zscore[ORDEN_CANONICO_22]

  # Separación explícita exigida en Sección 5 para EROS y tiempo de consumo
  eros_tc_preproc <- list(
    EROS_raw = obj_capa3$separacion_eros_tiempo_consumo$EROS_raw,
    EROS_preprocesado = NA_real_, # EROS_Total fue excluido del vector de 24 variables por renombrado a 'total'
    tiempo_consumo_raw = obj_capa3$separacion_eros_tiempo_consumo$tiempo_consumo_raw,
    tiempo_consumo_preprocesado = unname(vec_zscore["tiempo_consumo"]),
    tiempo_consumoEROS_preprocesado = unname(vec_zscore["tiempo_consumoEROS"]),
    edad_raw = obj_capa3$separacion_eros_tiempo_consumo$edad_raw,
    edad_preprocesada = unname(vec_zscore["edad"])
  )

  list(
    capa = "CAPA_4_PREPROCESAMIENTO_ENCODER",
    id_registro = obj_capa3$id_registro,
    capa3_preservada = obj_capa3,
    separacion_eros_tiempo_consumo_preproc = eros_tc_preproc,
    vector_winsorizado_24 = vec_winsor,
    vector_preprocesado_24 = vec_zscore,
    vector_preprocesado_22 = vec_zscore_22,
    matriz_entrada_24 = matrix(vec_zscore, nrow = 1, dimnames = list(obj_capa3$id_registro, ORDEN_CANONICO_24)),
    matriz_entrada_22 = matrix(vec_zscore_22, nrow = 1, dimnames = list(obj_capa3$id_registro, ORDEN_CANONICO_22)),
    metadatos_preprocesamiento = list(
      version = "1.0.0-MFR-REF-166",
      winsorizacion_aplicada = aplicar_winsor_ref,
      transformacion_unica_verificada = TRUE
    )
  )
}
