# ==============================================================================
# MÓDULO: R/07_validacion_salida.R
# CAPA 5B: VALIDACIÓN DE SALIDA LATENTE Y EMISIÓN SEGÚN CONTRATO (Sección 8.2 y 10.1)
# Proyecto: Estratificación Funcional Transversal en TUS / SISAP-by-CENIVRA
# Fecha: 24 de octubre de 2026
# ==============================================================================
# Responsabilidad:
#   - Verificar que la inferencia devuelva exactamente 12 valores finitos y
#     numéricos en el orden latent_01 .. latent_12.
#   - Garantizar que las salidas estén vinculadas únicamente al identificador
#     interno anónimo del registro (sin exponer nombres de pacientes).
#   - Formatear la salida conforme a config/contrato_salida.json.
# ==============================================================================

NOMBRES_LATENTES_12 <- sprintf("latent_%02d", 1:12)

#' Validar la salida de Capa 5 y construir el objeto de contrato de salida
#' @param obj_capa5 Objeto devuelto por ejecutar_inferencia_capa5()
validar_y_formatear_salida_capa5 <- function(obj_capa5) {
  errores <- character(0)

  if (is.null(obj_capa5) || !is.list(obj_capa5)) {
    stop("[VALIDACIÓN SALIDA ERROR] El objeto de Capa 5 es nulo o inválido.")
  }

  vec <- obj_capa5$vector_latente_12d
  if (is.null(vec) || !is.numeric(vec)) {
    errores <- c(errores, "El vector latente no es numérico.")
  } else {
    if (length(vec) != 12L) {
      errores <- c(errores, sprintf("Se esperaban exactamente 12 dimensiones latentes, pero se recibieron %d.", length(vec)))
    }
    if (!identical(names(vec), NOMBRES_LATENTES_12)) {
      errores <- c(errores, "Los nombres o el orden de las dimensiones latentes no coinciden con latent_01..latent_12.")
    }
    if (any(!is.finite(vec))) {
      errores <- c(errores, "Existen valores NA, NaN o Inf en las 12 dimensiones latentes.")
    }
  }

  if (length(errores) > 0) {
    return(list(
      status = "failed",
      registro_id = obj_capa5$registro_id,
      timestamp_utc = format(Sys.time(), "%Y-%m-%dT%H:%M:%SZ", tz = "UTC"),
      errors = errores,
      dimensions = setNames(as.list(rep(NA_real_, 12)), NOMBRES_LATENTES_12)
    ))
  }

  list(
    status = "completed",
    registro_id = as.character(obj_capa5$registro_id),
    timestamp_utc = obj_capa5$timestamp_utc,
    model_id = obj_capa5$model_id,
    model_metadata = list(
      model_id = obj_capa5$model_id,
      model_sha256 = obj_capa5$model_sha256,
      n_input_features = obj_capa5$n_input_features,
      preproc_version = obj_capa5$capa4_preservada$metadatos_preprocesamiento$version,
      clustering_incluido = FALSE
    ),
    dimensions = as.list(vec)
  )
}
