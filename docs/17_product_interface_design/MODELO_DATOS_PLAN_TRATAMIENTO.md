# Modelo de datos — PLAN DE TRATAMIENTO (módulo independiente)

> Documento técnico del módulo descrito en la sección 9 de
> [`ESPECIFICACION_CAPTURA_NARRATIVA.md`](ESPECIFICACION_CAPTURA_NARRATIVA.md).
> Implementación: `app/database/models_plan.py`,
> `app/services/plan_tratamiento_service.py`,
> `app/ui/pages/plan_tratamiento.py`.

## 0. Delimitación del módulo

El Plan de Tratamiento es una **sección independiente** de SISAP-TUS. No comparte tablas,
estado ni callbacks con Entrevista Exploratoria, Narración Semanal, Notas de Evolución,
Escalas ni DICO/DCSA. Tampoco se acopla al canal NLP.

```text
                          ┌──────────────────────────────┐
  DATO FUENTE (clínico)   │  PLAN DE TRATAMIENTO          │
  ─────────────────────►  │  (captura, versionado,        │
  A = CLÍNICO             │   histórico consultable)      │
                          └──────────────────────────────┘
                                     ▲            │
        DATO DERIVADO / INFORMATIVO  │            │  registro clínico
        (Z_ESCALAS, Z_QUINCENAL,     │            │  (nunca al canal NLP)
         Z_DICO_DCSA, Z_NOTAS)  ─────┘            ▼
                                          app/database (SQLite)
```

El sistema **no genera diagnósticos ni tratamientos automáticos**. Está prohibido por
diseño cualquier regla del tipo `Z_NOTAS = X → diagnóstico Y` o
`Z_MULTIMODAL = X → tratamiento Y`. La formulación y la decisión son del profesional.

---

## 1. Tablas, campos y relaciones

Nueve tablas, todas dentro de la misma `Base` declarativa de `app/database/models.py`
(por lo que `Base.metadata.create_all` las crea junto al resto del expediente).

### 1.1 `planes_tratamiento` — raíz del plan

| Campo | Tipo | Notas |
|---|---|---|
| `plan_id` | VARCHAR(36) **PK** | UUID del plan |
| `paciente_id` | VARCHAR(64) **FK → `pacientes.id`** | identificador seudonimizado |
| `titulo` | VARCHAR(255) | etiqueta libre del plan |
| `version_actual` | INTEGER | número de la versión vigente (v1, v2, …) |
| `estado` | VARCHAR(30) | `activo` / `archivado` |
| `creado_por` | VARCHAR(100) | autor de la creación |
| `fecha_creacion` | DATETIME | |
| `actualizado_en` | DATETIME | |

Un paciente puede tener varios planes; el servicio resuelve el **plan vigente** y nunca
sobrescribe una versión.

### 1.2 `plan_versiones` — histórico (nunca se sobrescribe)

| Campo | Tipo | Notas |
|---|---|---|
| `id` | INTEGER **PK** | |
| `plan_id` | VARCHAR(36) **FK → `planes_tratamiento.plan_id`** | |
| `numero_version` | INTEGER | v1, v2, v3… |
| `fecha` | DATETIME | fecha de la versión |
| `autor` | VARCHAR(100) | autor de la modificación |
| `motivo_modificacion` | TEXT | por qué se revisó |
| `cambios_realizados` | TEXT | qué cambió |

Restricción única `(plan_id, numero_version)`. Toda la demás información del plan
**cuelga de la versión**, de modo que `v1` queda intacta cuando se crea `v2`.

### 1.3 `plan_formulacion` — bloque A

Once campos breves de texto libre **más** el campo principal, todos dato fuente del
clínico, ligados a `version_id`:

`problema_principal`, `conductas_relevantes`, `antecedentes_contextos`,
`consecuencias_mantenedores`, `patrones_evitacion`, `patrones_aproximacion`,
`factores_contextuales`, `recursos_protectores`, `procesos_psicologicos`,
`hipotesis_funcional`, `prioridades_clinicas` (**11 campos**)
y `formulacion_clinica` (**campo principal**).

| Campo | Tipo | Notas |
|---|---|---|
| `id` | INTEGER **PK** | |
| `version_id` | INTEGER **FK → `plan_versiones.id`** | |
| … | TEXT | los 12 textos anteriores |
| `trazabilidad_origen` | VARCHAR(1) | `A` (CLÍNICO) |

Se conserva **tal como lo escribe el clínico**: no se normaliza, resume ni reinterpreta.

### 1.4 `plan_objetivos` — bloque B (múltiples)

| Campo | Tipo |
|---|---|
| `id` | INTEGER **PK** |
| `version_id` | INTEGER **FK → `plan_versiones.id`** |
| `objetivo_id` | VARCHAR(40) (`OBJ-1`, `OBJ-2`, …) |
| `descripcion` | TEXT |
| `prioridad` | VARCHAR(30) |
| `area_proceso` | VARCHAR(120) |
| `conducta_objetivo` | TEXT |
| `contexto` | TEXT |
| `resultado_esperado` | TEXT |
| `indicador_cambio` | TEXT |
| `linea_base` | VARCHAR(255) **opcional** |
| `meta` | VARCHAR(255) **opcional** |
| `fecha_inicio` / `fecha_revision` | DATE |
| `estado` | VARCHAR(30): `pendiente`, `activo`, `parcialmente_alcanzado`, `alcanzado`, `suspendido`, `modificado` |
| `trazabilidad_origen` | VARCHAR(1) |

`linea_base` y `meta` son **opcionales**: no se obliga a convertir todo en una
puntuación 0–10. Cuando existe medida cuantitativa, se conserva como variable
estructurada independiente (ver `plan_indicadores`).

### 1.5 `plan_procesos` — bloque C (matriz editable)

Lista de partida (evitación experiencial, rigidez psicológica, activación conductual,
regulación emocional, tolerancia al malestar, impulsividad, craving, rumiación,
resolución de problemas, habilidades interpersonales, funcionamiento social,
adherencia/participación, exposición/aproximación, valores y acción comprometida,
otros). **El catálogo no se materializa**: la tabla nace vacía y sólo contiene lo que el
clínico decide.

| Campo | Tipo | Notas |
|---|---|---|
| `id` | INTEGER **PK** | |
| `version_id` | INTEGER **FK → `plan_versiones.id`** | |
| `proceso` | VARCHAR(160) | nombre (del catálogo o libre) |
| `incluido` | BOOLEAN | `True` seleccionado / `False` excluido |
| `del_catalogo` | BOOLEAN | distingue catálogo de proceso propio |
| `justificacion` | TEXT | |
| `orden` | INTEGER | |
| `trazabilidad_origen` | VARCHAR(1) | `A` (CLÍNICO); `D` si partió de una sugerencia |

### 1.6 `plan_intervenciones` — bloque D

Relación explícita **Objetivo → Proceso → Intervención → Resultado observado**.

| Campo | Tipo | Notas |
|---|---|---|
| `id` | INTEGER **PK** | |
| `version_id` | INTEGER **FK → `plan_versiones.id`** | |
| `objetivo_ref` | INTEGER **FK → `plan_objetivos.id`** | eslabón Objetivo |
| `proceso_ref` | INTEGER **FK → `plan_procesos.id`** | eslabón Proceso |
| `proceso` | VARCHAR(160) | nombre del proceso (denormalizado, legible) |
| `intervencion` | TEXT | intervención propuesta |
| `fundamento_clinico` | TEXT | |
| `tecnica` | TEXT | técnica/procedimiento |
| `frecuencia` | VARCHAR(120) | |
| `responsable` | VARCHAR(120) | |
| `contexto` | TEXT | |
| `tareas_entre_sesiones` | TEXT | |
| `criterios_revision` | TEXT | |
| `respuesta_observada` | TEXT | resultado observado |
| `modificaciones_realizadas` | TEXT | |
| `trazabilidad_origen` | VARCHAR(1) | |

### 1.7 `plan_indicadores` — bloque E

Cada objetivo puede vincularse a escalas, variables estructuradas, indicadores
conductuales, narraciones, notas clínicas, indicadores derivados de DICO/DCSA y
variables temporales.

| Campo | Tipo | Notas |
|---|---|---|
| `id` | INTEGER **PK** | |
| `version_id` | INTEGER **FK → `plan_versiones.id`** | |
| `objetivo_ref` | INTEGER **FK → `plan_objetivos.id`** (nullable) | |
| `tipo` | VARCHAR(40) | `escala`, `variable_estructurada`, `indicador_conductual`, `narracion`, `nota_clinica`, `derivado_dico_dcsa`, `variable_temporal` |
| `referencia` | VARCHAR(255) | p. ej. `BIS-11` |
| `valor` | VARCHAR(255) **nullable** | el dato real, si existe |
| `estado_dato` | VARCHAR(20) | `DISPONIBLE` / `NO_DISPONIBLE` |
| `fecha` | DATE | |
| `nota` | TEXT | |
| `trazabilidad_origen` | VARCHAR(1) | `B` (INSTRUMENTO) / `C` (DERIVADO) / `A` |

**Regla dura:** si no hay dato, `valor` queda `NULL` y `estado_dato = 'NO_DISPONIBLE'`.
La interfaz y el servicio muestran literalmente `NO DISPONIBLE`; nunca `0`, nunca un
valor estimado.

### 1.8 `plan_referencias_externas` — documento/referencia del plan

Coexiste con el módulo interno: no obliga a reconstruir el documento externo.

| Campo | Tipo |
|---|---|
| `id` | INTEGER **PK** |
| `version_id` | INTEGER **FK → `plan_versiones.id`** |
| `nombre` | VARCHAR(255) |
| `fecha` | DATE |
| `version_documento` | VARCHAR(60) |
| `ubicacion` | VARCHAR(512) |
| `adjunto` | VARCHAR(512) opcional |
| `observaciones` | TEXT |
| `trazabilidad_origen` | VARCHAR(1) |

### 1.9 `plan_sugerencias` — propuesta de intervención (apoyo a la revisión)

| Campo | Tipo | Notas |
|---|---|---|
| `id` | INTEGER **PK** | |
| `version_id` | INTEGER **FK → `plan_versiones.id`** | |
| `descripcion` | TEXT | |
| `fundamento_datos` | TEXT | **obligatorio**: sin datos disponibles no se emite |
| `procesos_relacionados` | JSON | |
| `estado` | VARCHAR(20) | `pendiente` / `confirmada` / `descartada` |
| `confirmada_por` | VARCHAR(100) | |
| `descartada_por` | VARCHAR(100) | |
| `confirmada_en` | DATETIME | |
| `trazabilidad_origen` | VARCHAR(1) | `D` mientras es sugerencia; pasa a `E` **sólo** al confirmarla |

Una sugerencia **no se guarda como decisión clínica** hasta que el clínico la confirma.
`decisiones_confirmadas()` devuelve únicamente las de trazabilidad `E`.

---

## 2. Versionado e histórico

```text
crear_plan()            → planes_tratamiento + plan_versiones v1 + formulación vacía
modificar/editar()      → escribe en el contenido de la versión vigente
nueva_version()         → plan_versiones v(n+1) + CLONA el contenido de v(n)
                          (v(n) permanece consultable en su totalidad)
historico_versiones()   → todas las versiones, ordenadas
version_actual()        → la vigente
```

Cada versión registra **fecha · versión · autor · motivo de modificación · cambios
realizados** (campos propios de `plan_versiones`). El contenido clínico de cada versión
se conserva íntegro: la clonación crea filas nuevas que apuntan a la nueva versión y
remapean las claves `objetivo_ref` / `proceso_ref` de intervenciones e indicadores. Las
sugerencias confirmadas se arrastran como decisión (`E`); las pendientes quedan en el
histórico de la versión donde se emitieron.

---

## 3. Relación con los cuatro espacios latentes

El Plan es una **capa clínica de decisión y formulación**, alimentada *informativamente*
por las representaciones de los cuatro canales:

```text
AE-ESCALAS     →  Z_ESCALAS
AE-QUINCENAL   →  Z_QUINCENAL
AE-DICO/DCSA   →  Z_DICO_DCSA
NLP → AE-NOTAS →  Z_NOTAS
                        ↓
            REPRESENTACIÓN MULTIMODAL   (preparada, NO entrenada)
                        ↓
                PLAN DE TRATAMIENTO
                        ↓
        procesos · objetivos · intervenciones
```

| Espacio latente | Vínculo con el Plan | Naturaleza del vínculo |
|---|---|---|
| `Z_ESCALAS` | indicadores tipo `escala` | DATO DERIVADO / INFORMATIVO |
| `Z_QUINCENAL` | indicadores tipo `variable_temporal` | DATO DERIVADO / INFORMATIVO |
| `Z_DICO_DCSA` | indicadores tipo `derivado_dico_dcsa` | DATO DERIVADO / INFORMATIVO |
| `Z_NOTAS` | indicadores tipo `narracion` / `nota_clinica` | DATO DERIVADO / INFORMATIVO |

### 3.1 Consumo real de las representaciones (estado medido)

El módulo no se limita a declarar la relación: **consume** las representaciones a
través de `app/services/representaciones_service.py`, que reúne por rama lo que es
calculable hoy y lo muestra en «E. Indicadores de seguimiento» con la marca
`DERIVADO / INFORMATIVO` y su procedencia, o como `NO DISPONIBLE` con el motivo
cuando no hay dato. Detalle por rama, artefactos y pendientes:
`REPRESENTACIONES_PLAN_TRATAMIENTO.md`.

Resumen de hoy:

| Rama | ¿Calculable hoy? | Motivo si no |
|---|---|---|
| `Z_ESCALAS` | Sí (`encoder.h5` + normalización + `nombres_variables.txt`) | — |
| `Z_QUINCENAL` | No | faltan pesos del AE quincenal, normalización y mapeo ítems→variables |
| `Z_DICO_DCSA` | No | faltan pesos del AE DICO/DCSA, normalización y mapeo índices→variables |
| `Z_NOTAS` | Sí (modelo de texto ONNX + AE-NOTAS **provisional**) | — |

Las cuatro ramas se mantienen separadas: `combinar()` falla a propósito y no existe
representación multimodal en este módulo.

**Los autoencoders no deciden el tratamiento.** La fusión multimodal sigue sin
entrenarse: no existe todavía evidencia ni datos suficientes, y este módulo **no la
presupone**. Las representaciones se usan sólo para contextualizar la evolución,
identificar cambios, mostrar patrones, señalar discrepancias entre modalidades, apoyar
la revisión de objetivos y aportar información longitudinal.

Si en el futuro se desarrolla un modelo predictivo o de apoyo a decisiones, vivirá como
**componente separado, documentado y validado** — nunca dentro de este módulo.

---

## 4. DATO FUENTE vs DATO DERIVADO

| | DATO FUENTE | DATO DERIVADO / INFORMATIVO |
|---|---|---|
| Quién lo produce | el clínico (o un instrumento aplicado) | un proceso computacional |
| Trazabilidad | `A` CLÍNICO · `B` INSTRUMENTO | `C` DERIVADO / INFORMATIVO |
| Dónde vive | `plan_formulacion`, `plan_objetivos`, `plan_procesos`, `plan_intervenciones`, `plan_referencias_externas` | `plan_indicadores` (`tipo` de origen latente) y las salidas de los canales |
| Efecto clínico | constituye el registro del plan | ninguno por sí solo: informa la revisión |
| Se puede editar | sí, creando una versión nueva | no se edita: se recalcula o se marca `NO DISPONIBLE` |

Separación explícita en la interfaz: el texto libre clínico se captura en cuadros de
texto rotulados como fuente; las variables estructuradas y los indicadores se muestran
en tablas/`kv` con su estado de dato (`DISPONIBLE` / `NO DISPONIBLE`) y con el sello
`DERIVADO / INFORMATIVO`.

---

## 5. Trazabilidad del origen de cada dato

Toda fila de contenido lleva `trazabilidad_origen` (VARCHAR(1)), sin mezclar categorías:

| Código | Significado | Marca en interfaz |
|---|---|---|
| `A` | Dato introducido por el clínico | `CLÍNICO` |
| `B` | Dato proveniente de un instrumento | `INSTRUMENTO` |
| `C` | Dato derivado computacionalmente | `DERIVADO / INFORMATIVO` |
| `D` | Sugerencia generada por SISAP (sólo si está fundamentada con datos disponibles) | `SUGERENCIA` |
| `E` | Decisión clínica confirmada por el profesional | `REGISTRO CLÍNICO CONFIRMADO` |

Transición `D → E`: únicamente `confirmar_sugerencia()`, que exige `confirmado_por`. La
interfaz distingue visualmente `DERIVADO / INFORMATIVO` (ámbar) de
`REGISTRO CLÍNICO CONFIRMADO` (verde).

---

## 6. Frontera con el canal de NLP

```text
Texto clínico fuente (entrevista / narraciones)  →  NLP / AE-NOTAS
Plan de tratamiento estructurado                 →  registro clínico
```

El Plan **no se envía automáticamente** al canal de notas (`app/nlp/`). No existe camino
de escritura desde el plan hacia `app/nlp/`; además, el canal rechaza el origen
`plan_tratamiento` (`ORIGENES_PERMITIDOS` en `app/nlp/canal_notas.py`). Si más adelante
se quiere estudiar el lenguaje de los planes, será un **análisis explícitamente definido
y validado**, sin incorporarlo por accidente al AE-NOTAS.

---

## 7. API del servicio (resumen)

`app/services/plan_tratamiento_service.py`

| Grupo | Funciones |
|---|---|
| Plan | `crear_plan`, `obtener_plan`, `plan_de_paciente`, `resumen_plan` |
| Versionado | `version_actual`, `historico_versiones`, `nueva_version` |
| Formulación | `guardar_formulacion`, `obtener_formulacion` |
| Objetivos | `agregar_objetivo`, `listar_objetivos`, `editar_objetivo`, `cambiar_estado_objetivo` |
| Procesos | `catalogo_procesos`, `matriz_procesos`, `seleccionar_proceso`, `excluir_proceso`, `agregar_proceso`, `modificar_proceso` |
| Intervenciones | `agregar_intervencion`, `listar_intervenciones`, `editar_intervencion` |
| Indicadores | `agregar_indicador`, `listar_indicadores`, `actualizar_valor_indicador` |
| Referencia externa | `guardar_referencia_externa`, `obtener_referencia_externa` |
| Sugerencias | `registrar_sugerencia`, `proponer_procesos_relacionados`, `registrar_sugerencias_propuestas`, `confirmar_sugerencia`, `descartar_sugerencia`, `listar_sugerencias`, `sugerencias_pendientes`, `decisiones_confirmadas` |
| Trazabilidad | `etiqueta_trazabilidad`, `es_informativo`, `es_registro_confirmado`, `estado_frontera_nlp` |

---

## 8. Interfaz

Ruta: `/pacientes/<patient_id>/plan-tratamiento` (sección propia, resuelta en
`app/ui/layout/__init__.py:resolve`). Página:
`app/ui/pages/plan_tratamiento.py`. Todos los controles leen y escriben en la base real
a través del servicio; no hay datos de ejemplo ni acciones simuladas.

---

## 9. Pruebas

`tests/unit/test_plan_tratamiento.py` — 41 pruebas con base de datos temporal en memoria
y paciente sintético `SISAP-DEMO-0001`. Verifican, entre otros: creación del plan,
versionado sin pérdida del histórico, estado del objetivo transitable, matriz de procesos
vacía al crear, indicador sin dato `NO DISPONIBLE`, sugerencia que no cuenta como decisión
hasta confirmarse, y la frontera con el canal NLP.

`tests/unit/test_representaciones_plan.py` — 21 pruebas con base temporal en memoria y
paciente sintético. Verifican que las cuatro representaciones se resuelven **por rama**
(`DISPONIBLE` con valores y procedencia, o `NO DISPONIBLE` con motivo), que una rama sin
artefactos no produce ningún valor, que la pantalla muestra `NO DISPONIBLE` cuando no hay
datos, que ninguna representación se guarda como objetivo/diagnóstico/tratamiento y que una
sugerencia derivada sigue siendo sugerencia hasta la confirmación explícita del clínico.
Detalle de cada prueba en `REPRESENTACIONES_PLAN_TRATAMIENTO.md` (§6).
