# ==============================================================================
# SCRIPT: inference/Autoencoder_TUS_estratificacion_APP.R
# PROYECTO: Estratificación Funcional Transversal en TUS / SISAP-by-CENIVRA
# VERSIÓN INTEGRADA: 1.0.1-SISAP-ENGINES (sin rutas absolutas de Windows)
# ==============================================================================
# TRAZABILIDAD CON EL SCRIPT FUENTE ORIGINAL (SOLO LECTURA):
#   - Archivo fuente: Autoencoder TUS estratificacion.R
#   - Tamaño original: 825,213 bytes (19,520 líneas)
#   - SHA-256 original: 090848bd9b5be13888df4b68e70b121516012be777f54bb465cbd079d7c31ab9
#   - Fuente canónica de datos: Escalas fase transversal TUS.xlsx
#   - SHA-256 Excel canónico: 031b161b1431903d104ec1604defe4731f567d8c8513d5fc3e8c51590d9b9724
# ==============================================================================

obtener_directorio_base_app <- function() {
  dir_env <- Sys.getenv("SISAP_ENGINE_DIR", unset = "")
  if (!nzchar(dir_env)) {
    dir_env <- Sys.getenv("SISAP_ANALISIS_APP_DIR", unset = "")
  }
  if (nzchar(dir_env) && dir.exists(dir_env)) {
    return(normalizePath(dir_env, winslash = "/", mustWork = TRUE))
  }
  if (file.exists("inference/R/01_lectura_datos.R")) {
    return(normalizePath(".", winslash = "/", mustWork = TRUE))
  }
  if (file.exists("engines/autoencoder/inference/R/01_lectura_datos.R")) {
    return(normalizePath("engines/autoencoder", winslash = "/", mustWork = TRUE))
  }
  if (file.exists("../inference/R/01_lectura_datos.R")) {
    return(normalizePath("..", winslash = "/", mustWork = TRUE))
  }
  if (file.exists("R/01_lectura_datos.R")) {
    return(normalizePath(".", winslash = "/", mustWork = TRUE))
  }
  stop("Defina SISAP_ENGINE_DIR o ejecute desde 'engines/autoencoder'.")
}

resolver_ruta_artefacto <- function(base_dir, ruta_engine, ruta_legacy = NULL) {
  p1 <- file.path(base_dir, ruta_engine)
  if (file.exists(p1)) return(p1)
  if (!is.null(ruta_legacy)) {
    p2 <- file.path(base_dir, ruta_legacy)
    if (file.exists(p2)) return(p2)
  }
  stop(sprintf("Artefacto requerido no encontrado: %s", p1))
}

cargar_modulos_pipeline_app <- function(base_dir = obtener_directorio_base_app()) {
  sub_prefix <- if (dir.exists(file.path(base_dir, "inference/R"))) "inference/R" else "R"
  modulos <- c(
    "01_lectura_datos.R",
    "02_validacion_esquema.R",
    "03_scoring_escalas.R",
    "04_variables_derivadas.R",
    "05_preprocesamiento_encoder.R",
    "06_inferencia_latente.R",
    "07_validacion_salida.R"
  )
  for (m in modulos) {
    ruta_m <- file.path(base_dir, sub_prefix, m)
    if (!file.exists(ruta_m)) {
      stop(sprintf("Módulo requerido no encontrado: %s", ruta_m))
    }
    source(ruta_m, local = FALSE, encoding = "UTF-8")
  }
  invisible(TRUE)
}

#' Ejecutar el pipeline completo de 5 capas para un registro individual de SISAP
#' Rechaza estrictamente cualquier ausencia o inconsistencia (D-06, sin imputación).
ejecutar_pipeline_registro_sisap <- function(payload,
                                             base_dir = obtener_directorio_base_app(),
                                             modelo_objetivo = c("encoder_22_checkpoint_fase2", "encoder_24_deployed"),
                                             modo_scoring = c("excel_canonico", "manual_estandar")) {
  modelo_objetivo <- match.arg(modelo_objetivo)
  modo_scoring    <- match.arg(modo_scoring)
  cargar_modulos_pipeline_app(base_dir)

  c1 <- leer_registro_app_capa1(payload)
  v1 <- validar_registro_capa1(c1)
  if (!v1$valido) {
    return(list(
      status = "failed",
      stage_failed = "CAPA_1_VALIDACION_ESQUEMA",
      registro_id = c1$id_registro,
      timestamp_utc = format(Sys.time(), "%Y-%m-%dT%H:%M:%SZ", tz = "UTC"),
      validation_summary = v1,
      dimensions = setNames(as.list(rep(NA_real_, 12)), sprintf("latent_%02d", 1:12))
    ))
  }

  c2 <- ejecutar_scoring_capa2(c1, modo_bis11 = modo_scoring, modo_eros = modo_scoring)

  ruta_ref <- resolver_ruta_artefacto(
    base_dir,
    "preprocessing/parametros_referencia_completos.json",
    "artefactos/preprocesamiento/parametros_referencia_completos.json"
  )
  ref_params <- cargar_parametros_referencia(ruta_ref)
  c3 <- ejecutar_variables_derivadas_capa3(c2, ref_params)
  c4 <- ejecutar_preprocesamiento_capa4(c3, ref_params, aplicar_winsor_ref = TRUE)

  archivo_pesos <- if (modelo_objetivo == "encoder_24_deployed") {
    resolver_ruta_artefacto(base_dir, "models/pesos_encoder_24_h5.json", "artefactos/modelo/pesos_encoder_24_h5.json")
  } else {
    resolver_ruta_artefacto(base_dir, "models/pesos_encoder_22_h5.json", "artefactos/modelo/pesos_encoder_22_h5.json")
  }
  encoder_verificado <- cargar_encoder_verificado(archivo_pesos)
  c5 <- ejecutar_inferencia_capa5(c4, encoder_verificado)
  salida_contrato <- validar_y_formatear_salida_capa5(c5)

  list(
    contrato_salida = salida_contrato,
    trazabilidad_capas = list(
      capa_1_crudos = c1,
      capa_1b_validacion = v1,
      capa_2_scoring = c2,
      capa_3_derivadas = c3,
      capa_4_preprocesamiento = c4,
      capa_5_inferencia = c5
    )
  )
}

#' Ejecutar el pipeline por lotes sobre las 166 observaciones del Excel canónico
#' (para regresión científica histórica reproducible).
#' @param modo_regresion_historica_166 Si TRUE, replica exactamente la semántica
#'   histórica del Excel (celdas en blanco tratadas como 0 por SUM() en BSL P1 fila 158
#'   y STAXI P8/P26..49 filas 66,97,126) y las medianas MFR para filas 156-166
#'   (tiempo_consumo=10.0, trat_previos=2.0). Nunca usar en inferencia individual.
ejecutar_pipeline_lote_excel_canonico <- function(ruta_excel,
                                                  base_dir = obtener_directorio_base_app(),
                                                  modelo_objetivo = c("encoder_22_checkpoint_fase2", "encoder_24_deployed"),
                                                  usar_items_crudos = TRUE,
                                                  modo_regresion_historica_166 = TRUE) {
  modelo_objetivo <- match.arg(modelo_objetivo)
  cargar_modulos_pipeline_app(base_dir)

  lote_c1 <- leer_excel_canonico_capa1(ruta_excel, verificar_hash = TRUE, restringir_cohorte_166 = TRUE)
  hojas   <- lote_c1$hojas_crudas
  n_obs   <- lote_c1$n_participantes_comunes

  ruta_ref <- resolver_ruta_artefacto(
    base_dir,
    "preprocessing/parametros_referencia_completos.json",
    "artefactos/preprocesamiento/parametros_referencia_completos.json"
  )
  ref_params <- cargar_parametros_referencia(ruta_ref)
  archivo_pesos <- if (modelo_objetivo == "encoder_24_deployed") {
    resolver_ruta_artefacto(base_dir, "models/pesos_encoder_24_h5.json", "artefactos/modelo/pesos_encoder_24_h5.json")
  } else {
    resolver_ruta_artefacto(base_dir, "models/pesos_encoder_22_h5.json", "artefactos/modelo/pesos_encoder_22_h5.json")
  }
  encoder_verificado <- cargar_encoder_verificado(archivo_pesos)

  mat_preproc_24 <- matrix(NA_real_, nrow = n_obs, ncol = 24L,
                           dimnames = list(paste0("ID_", seq_len(n_obs)), ORDEN_CANONICO_24))
  mat_latentes_12 <- matrix(NA_real_, nrow = n_obs, ncol = 12L,
                            dimnames = list(paste0("ID_", seq_len(n_obs)), sprintf("latent_%02d", 1:12)))

  limpiar_celda_num <- function(v, fallback = 0) {
    num <- suppressWarnings(as.numeric(v))
    if (modo_regresion_historica_166) {
      num[is.na(num)] <- fallback
    }
    num
  }

  for (i in seq_len(n_obs)) {
    r_bis   <- hojas[["BIS 11"]][i, ]
    r_bsl   <- hojas[["BSL 23"]][i, ]
    r_gad   <- hojas[["GAD 7"]][i, ]
    r_staxi <- hojas[["STAXI 2"]][i, ]
    r_bads  <- hojas[["BADS"]][i, ]
    r_eros  <- hojas[["EROS"]][i, ]

    items_bis   <- limpiar_celda_num(unlist(r_bis[, paste0("P", 1:30)], use.names = FALSE), 0)
    items_bsl   <- limpiar_celda_num(unlist(r_bsl[, paste0("P", 1:23)], use.names = FALSE), 0)
    cols_beh    <- grep("^P\\d+\\s*-\\s*2$", colnames(r_bsl), value = TRUE)
    items_bsl_b <- limpiar_celda_num(unlist(r_bsl[, cols_beh], use.names = FALSE), 0)
    items_gad   <- limpiar_celda_num(unlist(r_gad[, paste0("P", 1:7)], use.names = FALSE), 0)
    items_staxi <- limpiar_celda_num(unlist(r_staxi[, paste0("P", 1:49)], use.names = FALSE), 0)
    items_bads  <- limpiar_celda_num(unlist(r_bads[, paste0("P", 1:25)], use.names = FALSE), 0)
    items_eros  <- limpiar_celda_num(unlist(r_eros[, paste0("P", 1:10)], use.names = FALSE), 0)

    tc_bads <- suppressWarnings(as.numeric(r_bads$Tiempo_consumo))
    tp_bads <- suppressWarnings(as.numeric(r_bads$Trat_previos))
    tc_eros <- suppressWarnings(as.numeric(r_eros$Tiempo_consumo))
    tp_eros <- suppressWarnings(as.numeric(r_eros$Trat_previos))

    if (modo_regresion_historica_166) {
      if (is.na(tc_bads)) tc_bads <- ref_params$normalizacion_final_24$tiempo_consumo$mediana_imputacion_ref
      if (is.na(tp_bads)) tp_bads <- ref_params$normalizacion_final_24$trat_previos$mediana_imputacion_ref
      if (is.na(tc_eros)) tc_eros <- ref_params$normalizacion_final_24$tiempo_consumoEROS$mediana_imputacion_ref
      if (is.na(tp_eros)) tp_eros <- ref_params$normalizacion_final_24$trat_previosEROS$mediana_imputacion_ref
    }

    payload_i <- list(
      id_registro = paste0("ID_", r_bads$ID),
      edad = as.numeric(r_bads$Edad),
      sexo = as.character(r_bads$Sexo),
      tiempo_consumo = tc_bads,
      trat_previos = tp_bads,
      sustancia_principal = if (is.na(r_bads$Sustancia)) "Desconocida" else as.character(r_bads$Sustancia),
      tiempo_consumo_hoja_eros = tc_eros,
      trat_previos_hoja_eros = tp_eros,
      bis11  = list(modo_captura = "excel_canonico", respuestas = items_bis),
      bads   = list(respuestas = items_bads),
      eros   = list(modo_captura = "excel_canonico", respuestas = items_eros),
      gad7   = list(respuestas = items_gad),
      staxi2 = list(respuestas = items_staxi),
      bsl23  = list(respuestas = items_bsl, respuestas_conductuales = items_bsl_b, general_score_0_1 = as.numeric(r_bsl$GENERAL))
    )

    c1_i <- leer_registro_app_capa1(payload_i)
    c2_i <- ejecutar_scoring_capa2(c1_i, modo_bis11 = "excel_canonico", modo_eros = "excel_canonico")
    c3_i <- ejecutar_variables_derivadas_capa3(c2_i, ref_params)
    c4_i <- ejecutar_preprocesamiento_capa4(c3_i, ref_params, aplicar_winsor_ref = TRUE)
    c5_i <- ejecutar_inferencia_capa5(c4_i, encoder_verificado)

    mat_preproc_24[i, ]  <- c4_i$vector_preprocesado_24
    mat_latentes_12[i, ] <- c5_i$vector_latente_12d
  }

  list(
    n_observaciones = n_obs,
    modelo_utilizado = modelo_objetivo,
    sha256_excel = lote_c1$sha256_fuente,
    sha256_modelo = encoder_verificado$sha256_h5,
    matriz_preprocesada_24 = as.data.frame(mat_preproc_24),
    dimensiones_latentes_12 = as.data.frame(mat_latentes_12)
  )
}
