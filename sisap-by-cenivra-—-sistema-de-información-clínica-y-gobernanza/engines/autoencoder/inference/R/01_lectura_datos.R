# ==============================================================================
# MÓDULO: R/01_lectura_datos.R
# CAPA 1: DATOS CRUDOS — Lectura de fuente canónica y registros individuales
# Proyecto: Estratificación Funcional Transversal en TUS / SISAP-by-CENIVRA
# Fecha: 24 de octubre de 2026
# ==============================================================================
# Responsabilidad:
#   - Leer en modo de solo lectura las 6 hojas del Excel canónico o recibir un
#     registro estructurado de SISAP (JSON / list).
#   - Preservar intactas las respuestas crudas por ítem (P1..Pn), las variables
#     sociodemográficas (edad, sexo) y las variables clínicas/temporales
#     (tiempo_consumo, trat_previos, sustancia) sin sobrescribirlas ni mezclarlas.
#   - Verificar el hash SHA-256 de la fuente canónica cuando se lee desde disco.
# ==============================================================================

EXPECTED_EXCEL_SHA256 <- "031b161b1431903d104ec1604defe4731f567d8c8513d5fc3e8c51590d9b9724"

#' Calcular SHA-256 de un archivo
#' @param filepath Ruta al archivo
#' @return Cadena hexadecimal en minúsculas con el hash SHA-256
calcular_sha256_archivo <- function(filepath) {
  if (!file.exists(filepath)) {
    stop(sprintf("[CAPA 1 ERROR] Archivo no encontrado: %s", filepath))
  }
  if (requireNamespace("digest", quietly = TRUE)) {
    return(tolower(digest::digest(file = filepath, algo = "sha256")))
  }
  cmd <- sprintf("sha256sum %s", shQuote(filepath))
  out <- tryCatch(system(cmd, intern = TRUE), error = function(e) NULL)
  if (!is.null(out) && length(out) > 0) {
    return(tolower(strsplit(trimws(out[1]), "\\s+")[[1]][1]))
  }
  stop("[CAPA 1 ERROR] No se pudo calcular SHA-256 (instale 'digest' o disponga de 'sha256sum').")
}

#' Leer el Excel canónico preservando ítems crudos, totales precalculados y variables clínicas
#' @param ruta_excel Ruta al archivo Escalas fase transversal TUS.xlsx
#' @param verificar_hash Booleano; si TRUE, comprueba EXPECTED_EXCEL_SHA256
#' @param restringir_cohorte_166 Booleano; si TRUE, alinea BIS-11 a los 166 IDs con cobertura en las 6 hojas
#' @return Lista estructurada de Capa 1 con hojas crudas, ítems separados y metadatos de trazabilidad
leer_excel_canonico_capa1 <- function(ruta_excel,
                                      verificar_hash = TRUE,
                                      restringir_cohorte_166 = TRUE) {
  if (!file.exists(ruta_excel)) {
    stop(sprintf("[CAPA 1 ERROR] Fuente canónica no encontrada en: %s", ruta_excel))
  }
  if (!requireNamespace("readxl", quietly = TRUE)) {
    stop("[CAPA 1 ERROR] El paquete 'readxl' es obligatorio para leer la fuente canónica.")
  }

  hash_obs <- calcular_sha256_archivo(ruta_excel)
  if (verificar_hash && hash_obs != EXPECTED_EXCEL_SHA256) {
    stop(sprintf(
      "[CAPA 1 ERROR DE INTEGRIDAD] SHA-256 del Excel (%s) no coincide con el canónico (%s).",
      hash_obs, EXPECTED_EXCEL_SHA256
    ))
  }

  hojas_esperadas <- c("BIS 11", "BSL 23", "GAD 7", "STAXI 2", "BADS", "EROS")
  hojas_disponibles <- readxl::excel_sheets(ruta_excel)
  faltantes <- setdiff(hojas_esperadas, hojas_disponibles)
  if (length(faltantes) > 0) {
    stop(sprintf("[CAPA 1 ERROR] Faltan hojas en el Excel canónico: %s", paste(faltantes, collapse = ", ")))
  }

  raw_sheets <- lapply(setNames(hojas_esperadas, hojas_esperadas), function(sh) {
    df <- as.data.frame(readxl::read_excel(ruta_excel, sheet = sh), stringsAsFactors = FALSE)
    # Filtrar filas completamente vacías al final de la tabla (ej. filas 167-237 vacías en BIS 11)
    tiene_id <- !is.na(df$ID)
    df <- df[tiene_id, , drop = FALSE]
    return(df)
  })

  # En BIS 11 las filas 168..238 tienen fórmula =ROW()-1 en ID pero todas las demás columnas NA
  bis_df_raw <- raw_sheets[["BIS 11"]]
  cols_datos_bis <- setdiff(colnames(bis_df_raw), "ID")
  filas_no_vacias_bis <- rowSums(!is.na(bis_df_raw[, cols_datos_bis, drop = FALSE])) > 0
  n_filas_vacias_bis <- sum(!filas_no_vacias_bis)
  if (restringir_cohorte_166) {
    bis_df_raw <- bis_df_raw[filas_no_vacias_bis, , drop = FALSE]
    raw_sheets[["BIS 11"]] <- bis_df_raw
  }

  # Verificar consistencia de IDs entre las 6 hojas
  ids_bads <- raw_sheets[["BADS"]]$ID
  ids_eros <- raw_sheets[["EROS"]]$ID
  ids_comunes <- Reduce(intersect, lapply(raw_sheets, function(df) df$ID))

  # Construir estructura de Capa 1 por participante sin mezclar instrumentos
  list(
    capa = "CAPA_1_DATOS_CRUDOS",
    fuente_tipo = "excel_canonico",
    ruta_fuente = ruta_excel,
    sha256_fuente = hash_obs,
    timestamp_lectura = format(Sys.time(), "%Y-%m-%dT%H:%M:%SZ", tz = "UTC"),
    n_participantes_comunes = length(ids_comunes),
    n_filas_vacias_excluidas_bis11 = n_filas_vacias_bis,
    ids_comunes = ids_comunes,
    hojas_crudas = raw_sheets
  )
}

#' Construir objeto de Capa 1 a partir de un registro individual estructurado (SISAP / App)
#' @param payload Lista o cadena JSON que cumple con config/contrato_entrada.json
#' @return Objeto estructurado de Capa 1 (un registro) con campos crudos inmutables
leer_registro_app_capa1 <- function(payload) {
  if (is.character(payload) && length(payload) == 1) {
    if (!requireNamespace("jsonlite", quietly = TRUE)) {
      stop("[CAPA 1 ERROR] Se requiere 'jsonlite' para parsear cadenas JSON.")
    }
    payload <- jsonlite::fromJSON(payload, simplifyVector = TRUE)
  }
  if (!is.list(payload)) {
    stop("[CAPA 1 ERROR] El registro de entrada debe ser una lista estructurada o JSON válido.")
  }

  # Preservar edad, tiempo_consumo y EROS en espacios de nombres explícitamente separados
  registro_crudo <- list(
    capa = "CAPA_1_DATOS_CRUDOS",
    fuente_tipo = "registro_individual_app",
    timestamp_lectura = format(Sys.time(), "%Y-%m-%dT%H:%M:%SZ", tz = "UTC"),
    id_registro = if (!is.null(payload$id_registro)) as.character(payload$id_registro) else "ANON_UNSPECIFIED",
    sociodemograficos_raw = list(
      edad_raw = payload$edad,
      sexo_raw = payload$sexo
    ),
    clinicos_consumo_raw = list(
      tiempo_consumo_raw = payload$tiempo_consumo,
      trat_previos_raw = payload$trat_previos,
      sustancia_principal_raw = if (!is.null(payload$sustancia_principal)) payload$sustancia_principal else "Desconocida",
      # Solo si se suministra una captura histórica separada de la hoja EROS
      tiempo_consumo_hoja_eros_raw = payload$tiempo_consumo_hoja_eros,
      trat_previos_hoja_eros_raw = payload$trat_previos_hoja_eros
    ),
    instrumentos_raw = list(
      bis11 = payload$bis11,
      bads  = payload$bads,
      eros  = payload$eros,
      gad7  = payload$gad7,
      staxi2 = payload$staxi2,
      bsl23 = payload$bsl23
    )
  )
  return(registro_crudo)
}
