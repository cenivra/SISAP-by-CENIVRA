# ==============================================================================
# MÓDULO: R/02_validacion_esquema.R
# CAPA 1B: VALIDACIÓN DE ESQUEMA, RANGOS Y VALORES AUSENTES (D-06)
# Proyecto: Estratificación Funcional Transversal en TUS / SISAP-by-CENIVRA
# Fecha: 24 de octubre de 2026
# ==============================================================================
# Responsabilidad (D-06):
#   - Prohibir toda imputación silenciosa (no rellenar con 0 ni valores por defecto).
#   - Distinguir explícitamente entre:
#       1. Campo obligatorio no capturado (MISSING_REQUIRED_FIELD)
#       2. Respuesta de ítem ausente (MISSING_ITEM_RESPONSE)
#       3. Variable opcional ausente (MISSING_OPTIONAL_FIELD)
#       4. Valor fuera de rango permitido (OUT_OF_RANGE_VALUE)
#       5. Valor no interpretable / tipo inválido (UNINTERPRETABLE_VALUE)
#       6. Variable derivada no calculable por falta de componente (UNCALCULABLE_DERIVED)
# ==============================================================================

ESPECIFICACION_INSTRUMENTOS <- list(
  bis11  = list(n_items = 30L, min_estandar = 1, max_estandar = 4, min_excel = 0, max_excel = 4),
  bads   = list(n_items = 25L, min_val = 0, max_val = 6),
  eros   = list(n_items = 10L, min_estandar = 1, max_estandar = 4, min_excel = 0, max_excel = 4),
  gad7   = list(n_items = 7L,  min_val = 0, max_val = 3),
  staxi2 = list(n_items = 49L, min_val = 1, max_val = 4),
  bsl23  = list(n_items = 23L, n_conductuales = 11L, min_val = 0, max_val = 4)
)

#' Validar un vector numérico de respuestas de ítems sin imputar
#' @param items Vector de respuestas
#' @param nombre_escala Nombre del instrumento
#' @param n_esperado Número exacto de ítems esperado
#' @param min_val Valor mínimo admisible por ítem
#' @param max_val Valor máximo admisible por ítem
#' @return Lista con estado, errores tipificados y vector numérico validado
validar_items_instrumento <- function(items, nombre_escala, n_esperado, min_val, max_val) {
  incidencias <- list()
  add_inc <- function(tipo, detalle) {
    incidencias[[length(incidencias) + 1]] <<- list(
      escala = nombre_escala,
      categoria_d06 = tipo,
      mensaje = detalle
    )
  }

  if (is.null(items)) {
    add_inc("MISSING_REQUIRED_FIELD", sprintf("No se proporcionó el vector de respuestas para %s.", nombre_escala))
    return(list(valido = FALSE, items_num = NULL, incidencias = incidencias))
  }

  if (length(items) != n_esperado) {
    add_inc("UNINTERPRETABLE_VALUE", sprintf(
      "%s requiere exactamente %d ítems, pero se recibieron %d.",
      nombre_escala, n_esperado, length(items)
    ))
    return(list(valido = FALSE, items_num = NULL, incidencias = incidencias))
  }

  # Detectar valores no numéricos antes de convertir
  es_na_orig <- is.na(items) | (is.character(items) & trimws(items) == "")
  items_num <- suppressWarnings(as.numeric(items))
  fallo_conv <- is.na(items_num) & !es_na_orig
  if (any(fallo_conv)) {
    idx_bad <- which(fallo_conv)
    add_inc("UNINTERPRETABLE_VALUE", sprintf(
      "%s contiene valores no numéricos/no interpretables en los ítems: %s.",
      nombre_escala, paste(idx_bad, collapse = ", ")
    ))
  }

  # Detectar ítems ausentes (NA)
  idx_na <- which(es_na_orig)
  if (length(idx_na) > 0) {
    add_inc("MISSING_ITEM_RESPONSE", sprintf(
      "%s presenta %d respuesta(s) de ítem ausente(s) en posiciones: %s.",
      nombre_escala, length(idx_na), paste(idx_na, collapse = ", ")
    ))
  }

  # Detectar valores fuera de rango
  idx_oor <- which(!is.na(items_num) & (items_num < min_val | items_num > max_val))
  if (length(idx_oor) > 0) {
    vals_oor <- items_num[idx_oor]
    add_inc("OUT_OF_RANGE_VALUE", sprintf(
      "%s presenta valores fuera del rango [%s, %s] en ítems %s (valores: %s).",
      nombre_escala, min_val, max_val,
      paste(idx_oor, collapse = ", "),
      paste(vals_oor, collapse = ", ")
    ))
  }

  list(
    valido = (length(incidencias) == 0),
    items_num = items_num,
    n_esperado = n_esperado,
    n_ausentes = length(idx_na),
    n_fuera_rango = length(idx_oor),
    incidencias = incidencias
  )
}

#' Validar un registro individual de Capa 1 conforme a las reglas D-06
#' @param obj_capa1 Objeto devuelto por leer_registro_app_capa1()
#' @return Lista con valido (TRUE/FALSE), incidencias tipificadas y resumen
validar_registro_capa1 <- function(obj_capa1) {
  incidencias <- list()
  warnings_opc <- character(0)

  add_inc <- function(campo, tipo, detalle) {
    incidencias[[length(incidencias) + 1]] <<- list(
      campo = campo,
      categoria_d06 = tipo,
      mensaje = detalle
    )
  }

  # 1. Validar campos clínicos independientes obligatorios: edad, tiempo_consumo, trat_previos
   validar_escalar <- function(val, nombre, min_v, max_v, obligatorio = TRUE) {
    if (is.null(val) || length(val) == 0 || (length(val) == 1 && is.na(val))) {
      if (obligatorio) {
        add_inc(nombre, "MISSING_REQUIRED_FIELD", sprintf("El campo obligatorio '%s' está ausente.", nombre))
      } else {
        warnings_opc <<- c(warnings_opc, sprintf("Campo opcional '%s' no proporcionado.", nombre))
      }
      return(NA_real_)
    }
    if (length(val) != 1 || is.logical(val)) {
      add_inc(nombre, "UNINTERPRETABLE_VALUE", sprintf("El campo '%s' debe ser un escalar numérico.", nombre))
      return(NA_real_)
    }
    num_v <- suppressWarnings(as.numeric(val))
    if (is.na(num_v) || !is.finite(num_v)) {
      add_inc(nombre, "UNINTERPRETABLE_VALUE", sprintf("El campo '%s' ('%s') no es un número finito interpretable.", nombre, as.character(val)))
      return(NA_real_)
    }
    if (num_v < min_v || num_v > max_v) {
      add_inc(nombre, "OUT_OF_RANGE_VALUE", sprintf(
        "El campo '%s' = %.2f está fuera del rango admisible [%.1f, %.1f].",
        nombre, num_v, min_v, max_v
      ))
    }
    return(num_v)
  }

  edad_v <- validar_escalar(obj_capa1$sociodemograficos_raw$edad_raw, "edad", 12, 100, TRUE)
  tc_v   <- validar_escalar(obj_capa1$clinicos_consumo_raw$tiempo_consumo_raw, "tiempo_consumo", 0, 80, TRUE)
  tp_v   <- validar_escalar(obj_capa1$clinicos_consumo_raw$trat_previos_raw, "trat_previos", 0, 50, TRUE)

  # Validar coherencia biológica: tiempo_consumo <= edad
  if (!is.na(edad_v) && !is.na(tc_v) && tc_v > edad_v) {
    add_inc("tiempo_consumo", "OUT_OF_RANGE_VALUE", sprintf(
      "Inconsistencia temporal: tiempo_consumo (%.1f años) excede la edad del paciente (%.1f años).",
      tc_v, edad_v
    ))
  }

  # 2. Validar cada instrumento
  inst_raw <- obj_capa1$instrumentos_raw
  detalles_escalas <- list()

  for (esc in names(ESPECIFICACION_INSTRUMENTOS)) {
    spec <- ESPECIFICACION_INSTRUMENTOS[[esc]]
    bloque <- inst_raw[[esc]]
    if (is.null(bloque)) {
      add_inc(esc, "MISSING_REQUIRED_FIELD", sprintf("Falta el bloque del instrumento '%s'.", esc))
      next
    }

    # Determinar si se pasaron puntuaciones precalculadas del Excel o respuestas por ítem
    if (!is.null(bloque$respuestas)) {
      modo <- if (!is.null(bloque$modo_captura)) bloque$modo_captura else "items_crudos"
      min_r <- if (!is.null(spec$min_val)) spec$min_val else if (modo == "excel_canonico") spec$min_excel else spec$min_estandar
      max_r <- if (!is.null(spec$max_val)) spec$max_val else if (modo == "excel_canonico") spec$max_excel else spec$max_estandar
      res_v <- validar_items_instrumento(bloque$respuestas, esc, spec$n_items, min_r, max_r)
      detalles_escalas[[esc]] <- res_v
      if (!res_v$valido) {
        incidencias <- c(incidencias, res_v$incidencias)
      }
      # Validación adicional para BSL-23 (sección conductual y campo GENERAL)
      if (esc == "bsl23") {
        if (!is.null(bloque$respuestas_conductuales)) {
          res_beh <- validar_items_instrumento(bloque$respuestas_conductuales, "bsl23_conductual", spec$n_conductuales, 0, 4)
          if (!res_beh$valido) incidencias <- c(incidencias, res_beh$incidencias)
        } else {
          add_inc("bsl23.respuestas_conductuales", "MISSING_REQUIRED_FIELD",
                  "BSL-23 requiere los 11 ítems conductuales para calcular 'Total Integrado' del pipeline canónico.")
        }
        validar_escalar(bloque$general_score_0_1, "bsl23.general_score_0_1", 0.0, 1.0, TRUE)
      }
    } else if (!is.null(bloque$subescalas_precalculadas)) {
      detalles_escalas[[esc]] <- list(valido = TRUE, modo = "subescalas_precalculadas")
    } else {
      add_inc(esc, "MISSING_REQUIRED_FIELD", sprintf("El instrumento '%s' no contiene 'respuestas' ni 'subescalas_precalculadas'.", esc))
    }
  }

  list(
    capa = "CAPA_1B_VALIDACION_ESQUEMA",
    valido = (length(incidencias) == 0),
    n_incidencias = length(incidencias),
    incidencias = incidencias,
    warnings_opcionales = warnings_opc,
    detalles_escalas = detalles_escalas
  )
}
