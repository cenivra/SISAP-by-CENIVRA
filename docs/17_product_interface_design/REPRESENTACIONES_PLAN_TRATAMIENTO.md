# Representaciones de los autoencoders en el Plan de Tratamiento

Documento propio de la carpeta 17. Complementa
`MODELO_DATOS_PLAN_TRATAMIENTO.md` (secciones 3 y 9) y describe **qué representación
de cada rama se calcula de verdad hoy**, con qué artefacto, de dónde sale su entrada,
y qué queda pendiente.

- **Capa de servicio**: `app/services/representaciones_service.py`.
- **Lectura en la interfaz**: `app/ui/pages/plan_tratamiento.py`, bloque
  «E. Indicadores de seguimiento» → sub-bloque «Representaciones derivadas de los
  cuatro canales».
- **Pruebas**: `tests/unit/test_representaciones_plan.py` (base temporal en memoria,
  paciente sintético, sin datos de pacientes reales).

---

## 1. Tabla por rama (estado medido, no declarado)

| Rama | Entrada real | Artefacto | ¿Calculable hoy? | Estado |
|---|---|---|---|---|
| `Z_ESCALAS` | respuestas de instrumentos de la evaluación más reciente del expediente + contexto anamnésico (`edad`, `tiempo_consumo`, `trat_previos`, `tiempo_consumoEROS`, `trat_previosEROS`) | `data/modelo/encoder.h5` (24→32→24→12) + `data/modelo/parametros_normalizacion_crudos.csv` + `data/modelo/nombres_variables.txt`; `app/services/model_inference.py` (`EncoderNumpy`, `NormalizadorZ`) | **Sí** | IMPLEMENTADO / VERIFICADO |
| `Z_QUINCENAL` | instrumentos quincenales y mensuales | — no existe — | **No** | PENDIENTE (declarado) |
| `Z_DICO_DCSA` | índices estructurados DICO/DCSA | — no existe — | **No** | PENDIENTE (declarado) |
| `Z_NOTAS` | narración vigente más reciente del expediente (entrevista exploratoria, narración semanal, nota clínica), minimizada de identidad | `data/modelo/nlp/bsc-bio-ehr-es` (ONNX) vía `app/nlp/canal_notas.py` + AE-NOTAS (`app/nlp/ae_notas.py`, provisional, hash `de5357d40384a708`) | **Sí** (latente de 12 dimensiones de un AE **provisional**, sin entrenar con datos propios) | IMPLEMENTADO / VERIFICADO |

Detalle de la ruta calculable:

```text
Z_ESCALAS
  Evaluacion.respuestas_escalas
    -> clinical.scoring.scales.score_all_scales
    -> clinical.scoring.mapping.map_scores_to_model   (vector de 24 variables)
    -> model_inference.NormalizadorZ.estandarizar
    -> model_inference.EncoderNumpy                   (encoder.h5, 24->32->24->12)
    -> 12 valores latentes + procedencia (huella SHA-256 del encoder)

Z_NOTAS
  NotaClinica (vigente) + NotaVersion (vigente, texto)
    -> minimizacion_service.construir_entrada_nlp     (identidad -> seudónimo)
    -> app/nlp/canal_notas.CanalNotas                 (valida narrativa real)
    -> app/nlp/embedder.EmbedderClinico               (bsc-bio-ehr-es, 768 dims)
    -> app/nlp/ae_notas                               (AE-NOTAS provisional, 768->12)
    -> 12 valores latentes + procedencia (modelo, backend, hash de texto y de vector)
```

### Por qué `Z_QUINCENAL` y `Z_DICO_DCSA` no son calculables

Falta, exactamente:

1. **Pesos del autoencoder** de cada rama (no hay `encoder_quincenal.h5` ni
   `encoder_dico_dcsa.h5` en `data/modelo/` ni en el material no versionado).
2. **Parámetros de normalización** de sus entradas (no hay tabla de
   estandarización para los ítems quincenales/mensuales ni para los índices
   DICO/DCSA).
3. **Contrato de entrada**: no existe el mapeo ítems→variables equivalente a
   `clinical/scoring/mapping.py` para esas dos modalidades.
4. **Entrenamiento**: ninguna de las dos ramas se ha entrenado, por lo que
   tampoco hay umbrales, dimensión latente declarada ni validación.

La rama se declara `NO DISPONIBLE` con ese motivo. **No se estima, no se rellena
con ceros y no se introduce un valor «simulado».**

---

## 2. Estado tipado por rama

`representaciones_service` devuelve, por rama, un `RepresentacionRama`:

| Campo | Contenido |
|---|---|
| `rama` | `Z_ESCALAS` · `Z_QUINCENAL` · `Z_DICO_DCSA` · `Z_NOTAS` |
| `estado` | `DISPONIBLE` · `NO_DISPONIBLE` |
| `valores` | mapa `Dim1..DimN` → `float`, o `None` si no hay dato |
| `dimension` | nº de dimensiones, o `None` |
| `procedencia` | modelo, artefacto, backend, huella y momento de cálculo (`calculado_en`) |
| `motivo` | motivo explícito cuando no hay dato |
| `marca` | siempre `DERIVADO / INFORMATIVO` |

Las cuatro ramas se devuelven **separadas**: `combinar()` falla a propósito
(`ErrorFusionNoPermitida`) y el resumen marca `fusionado: False`. No hay media,
concatenación ni representación multimodal.

`reunir_representaciones()` **no escribe nada** en el plan: no crea objetivos,
intervenciones ni indicadores. Sólo lee y calcula.

---

## 3. Lo que la pantalla muestra

En «E. Indicadores de seguimiento», cada rama aparece como una fila propia:

- **Con dato**: valores derivados con la marca `DERIVADO / INFORMATIVO`, la
  dimensión, la procedencia (modelo, artefacto, backend, huella, fecha) y el
  detalle de la entrada (evaluación o nota usada).
- **Sin dato**: badge `NO DISPONIBLE` y el **motivo** (qué falta exactamente);
  nunca un valor, nunca un cero de relleno.

La fila va acompañada de dos avisos fijos: que el dato es informativo y no se
guarda como objetivo, y que la primera lectura del modelo de texto puede tardar
(después queda en memoria del proceso).

---

## 4. Fronteras prohibidas y cómo se garantizan

| Frontera | Garantía |
|---|---|
| `Z → diagnóstico` | `a_diagnostico()` lanza `ErrorRepresentacionNoDecide` |
| `Z → tratamiento` | `a_tratamiento()` lanza `ErrorRepresentacionNoDecide` |
| `Z → objetivo/intervención guardada` | `persistir_como_decision()` lanza `ErrorRepresentacionNoDecide` |
| `Z → decisión confirmada` | una representación sólo puede proponerse como **sugerencia** (categoría `D`, estado `pendiente`); el paso a `E` exige `confirmar_sugerencia(..., confirmado_por=...)` |
| fusión de ramas | `combinar()` lanza `ErrorFusionNoPermitida`; no existe modelo multimodal |
| valores inventados | sin artefacto o sin entrada → `NO_DISPONIBLE` con motivo; `valores is None` |

---

## 5. Coste de cálculo (declarado, no oculto)

- `Z_ESCALAS`: ~1–2 s (lectura de `encoder.h5` + normalización).
- `Z_NOTAS`: ~30–60 s la primera vez (carga del modelo de texto ONNX); después
  los embeddings de un texto corto son de orden de centenas de milisegundos.
- Memoria de proceso: `representaciones_service._CACHE` evita recalcular la misma
  entrada (misma evaluación / misma versión de nota) en cada re-render. `limpiar_cache()`
  la vacía. La caché sólo actúa en la ruta de producción (cuando no se inyectan
  piezas de prueba).

---

## 6. Pruebas

`tests/unit/test_representaciones_plan.py`:

| Prueba | Qué verifica |
|---|---|
| `test_las_cuatro_ramas_se_resuelven_por_separado_y_sin_fusionar` | las cuatro ramas con estado tipado y `fusionado: False` |
| `test_sin_datos_las_cuatro_ramas_declaran_motivo` | sin datos: `NO_DISPONIBLE` con motivo y `valores is None` |
| `test_z_quincenal_y_dico_dcsa_no_son_calculables_hoy` | las dos ramas sin artefacto: motivo `NO CALCULABLE`, sin procedencia |
| `test_z_escalas_sin_respuestas_no_se_inventa` | sin respuestas no hay vector |
| `test_z_escalas_con_respuestas_incompletas_declara_las_variables_que_faltan` | vector de 24 variables incompleto → `NO_DISPONIBLE`, sin ceros |
| `test_z_escalas_con_respuestas_completas_devuelve_12_dimensiones_y_procedencia` | 12 dims + procedencia (proyector inyectado) |
| `test_z_escalas_usa_de_verdad_el_autoencoder_desplegado` | ruta real con `encoder.h5` desplegado (se omite si falta el artefacto) |
| `test_z_notas_sin_narracion_no_se_inventa` | sin narración no hay latente |
| `test_z_notas_con_narracion_produce_el_latente_con_su_procedencia` | canal real con backend de embeddings sintético → 12 dims |
| `test_z_notas_rechaza_texto_que_no_es_narrativa` | texto no narrativo → `NO_DISPONIBLE` con motivo |
| `test_estado_artefactos_confirmar_que_quincenal_y_dico_no_tienen_pesos` | inventario de artefactos por rama |
| `test_rama_sin_artefactos_no_devuelve_ningun_valor` | sin artefacto, `valores is None` |
| `test_no_se_fusionan_las_ramas` | `combinar()` falla |
| `test_la_pantalla_muestra_no_disponible_con_motivo` | la pantalla muestra `NO DISPONIBLE` y el motivo |
| `test_la_pantalla_muestra_los_valores_con_marca_derivado` | la pantalla muestra valores + `DERIVADO / INFORMATIVO` + procedencia |
| `test_la_pantalla_sin_representaciones_no_finge` | sin datos no se fabrica contenido |
| `test_persistir_una_representacion_como_decision_falla` | frontera de persistencia |
| `test_pasos_representacion_a_diagnostico_y_a_tratamiento_fallan` | fronteras `Z → diagnóstico` y `Z → tratamiento` |
| `test_reunir_representaciones_no_escribe_nada_en_el_plan` | reunir no modifica objetivos/intervenciones/indicadores |
| `test_sugerencia_desde_una_rama_no_disponible_falla` | sin dato no hay sugerencia |
| `test_sugerencia_derivada_queda_pendiente_hasta_que_el_clinico_confirma` | `D` → `E` sólo con confirmación explícita |

Todos los datos son **sintéticos** y la base es **temporal en memoria**; nunca se
usa la base clínica real ni datos de pacientes.

---

## 7. Pendiente (explícito)

1. Entrenar y desplegar el autoencoder quincenal (pesos + normalización + mapeo).
2. Entrenar y desplegar el autoencoder DICO/DCSA (pesos + normalización + mapeo).
3. Sustituir el AE-NOTAS provisional por el AE-NOTAS entrenado con datos propios
   y declarar su dimensión latente definitiva.
4. Diccionario de interpretación por rama (qué significa cada `DimN`), que hoy no
   existe: por eso la pantalla muestra los valores **sin etiqueta clínica**.
5. Aligerar la primera carga del modelo de texto para que la apertura del plan no
   dependa de ella (p. ej. servir el latente desde un artefacto ya calculado).
