# Especificación de captura — Entrevista Exploratoria y Narraciones Semanales

| Campo | Valor |
|---|---|
| Documento | ESP-CAP-001 |
| Fecha | 2026-09-30 |
| Estado | Especificación derivada de las fuentes primarias. **Pendiente de implementación en la interfaz.** |
| Corrección de diseño vigente | **R1 (30/09/2026) — identificación clínica.** Ver §5.10. Sustituye la decisión anterior de «seudónimo en lugar de nombre/expediente» por **identificación clínica protegida + identificador interno + seudonimización para procesamiento + anonimización para demo**. La decisión anterior **no se borra**: queda documentada como superada |
| Objetivo | Fijar, campo por campo, qué estructura real usan los formatos clínicos y cómo se transporta a la captura de SISAP-TUS |

---

## 1. Fuentes primarias

| Documento fuente | Archivo | SHA-256 | Tamaño | Qué se toma |
|---|---|---|---|---|
| Entrevista Exploratoria | `Entrevista Exploratoria-2.docx` — «Entrevista Integral sobre el Consumo de Sustancias · Consulta de primera vez» | `d9a5a320a586b33c73ce38854e1ac93fb999543462d5e6742ad7974a91a9b99a` | 118 873 B | **Estructura completa**: 14 secciones numeradas, bloques previos y anexos |
| Guía de Narraciones Semanales | `Guia de narraciones rehabilitacion 6.docx` | `b697336d99c8e9f0a7cf3a11d9ae79d10f285b35a1330ff740ed103abd322a28` | 27 866 B | **Sólo las 8 preguntas** y su encabezado. Indicación expresa del clínico: del resto no se toma nada |

### Advertencia sobre datos reales

El documento de la guía adjunto contiene **respuestas de un paciente real** (nombre, edad, sexo, fecha y narraciones completas).
De ese archivo se extraen **únicamente la estructura y los enunciados de las 8 preguntas**; ningún contenido clínico se
reproduce en la interfaz, en las pruebas ni en la demo. El documento de la entrevista es un **formulario en blanco**
(«Fecha:», «Paciente:», «No. Exp.» vacíos), sin datos de paciente; sí trae preimpresos el nombre y la cédula del terapeuta,
que **no se codifican de forma fija** sino que se configuran.

Ninguno de los dos documentos, ni sus contenidos, se incorporan al repositorio. Las huellas SHA-256 se registran sólo como
trazabilidad de la fuente de diseño y no permiten recuperar contenido.

---

## 2. Regla de conservación del dato fuente

```
DATO CAPTURADO POR EL CLÍNICO  →  DATO FUENTE INMUTABLE  →  PROCESAMIENTO  →  embedding  →  AE-NOTAS  →  Z_NOTAS
```

1. El texto que escribe el clínico (o el paciente, en la narración semanal) se guarda **tal cual**, sin normalizar, recortar ni
   resumir.
2. El embedding y el latente **nunca sobrescriben** el texto fuente: son registros derivados, separados y con su propia
   procedencia (modelo, versión, hash del texto, fecha de cálculo).
3. La consulta posterior muestra siempre **el texto original**; la representación computacional es información adicional.
4. Un campo vacío se guarda como vacío. No se inventan valores por defecto clínicos.

---

## 3. Entrevista Exploratoria

### 3.1 Encabezado

| Campo fuente | Tipo | Canal |
|---|---|---|
| Fecha | FECHA | ESTRUCTURADO |
| Paciente | IDENTIDAD CLÍNICA | Capa 1, acceso restringido por rol. **Corregido por R1: no se sustituye por seudónimo** |
| No. Exp. | IDENTIDAD CLÍNICA | Capa 1. Campo propio del expediente |
| Identificador interno SISAP | IDENTIFICADOR | Interno; nunca se muestra como identidad ni viaja al modelo |
| Seudónimo operativo | IDENTIFICADOR | Sólo módulos que no requieren identidad |
| Edad | NUMÉRICO | ESTRUCTURADO |
| Sexo | CATEGÓRICO-ÚNICO (Masculino / Femenino) | ESTRUCTURADO |

### 3.2 Bloque previo — Evaluación rápida de rigidez por dominio (hipótesis ontológica)

| Campo fuente | Tipo | Canal |
|---|---|---|
| Respuesta por dominio: Conductual, Emocional, Cognitivo, Interpersonal, Identitario (5 preguntas) | NARRATIVO | **NLP** |
| Nivel de rigidización por dominio (Bajo / Medio / Alto), para cada uno de los 5 dominios | ORDINAL | ESTRUCTURADO |
| Patrón rígido predominante (Regulación emocional / Evitación / Control cognitivo / Dependencia) | CATEGÓRICO-ÚNICO | ESTRUCTURADO |
| Hipótesis ontológica (enunciado plantilla) | DERIVADO (texto compuesto con el patrón elegido) | ESTRUCTURADO — *no* se envía al NLP: se construye por plantilla |

### 3.3 Secciones 1 a 14

| Sección | Campo | Tipo | Canal |
|---|---|---|---|
| **1. Motivo de consulta declarado** | Cita textual del paciente sobre el problema principal | NARRATIVO | **NLP** |
| | Evento precipitante inmediato de esta búsqueda de ayuda | NARRATIVO | **NLP** |
| | Consecuencias más graves señaladas (8 opciones) | CATEGÓRICO-MÚLTIPLE | ESTRUCTURADO |
| **2. Historial académico y laboral** | Nivel educativo más alto completado | CATEGÓRICO | ESTRUCTURADO |
| | Empleo actual / desde cuándo | TEXTO CORTO + FECHA | ESTRUCTURADO |
| | ¿El consumo ha afectado su historial laboral o la pérdida de empleos? | NARRATIVO | **NLP** |
| **3. Consumo** | Tabla de drogas de uso en orden cronológico: sustancia, droga de inicio, la consume actualmente (Sí/No), edad de inicio, vía de administración (7 opciones), frecuencia de consumo actual (10 opciones), hasta 5 filas | TABLA / REPETIBLE | ESTRUCTURADO |
| | Sustancia (droga) de impacto que motiva el tratamiento | CATEGÓRICO | ESTRUCTURADO |
| | Uso combinado de sustancias (Sí/No) y ¿cuáles? | CATEGÓRICO + TEXTO CORTO | ESTRUCTURADO |
| | **Análisis funcional del episodio central de consumo**: Disparador · Contexto antecedente · Estados internos asociados · Pensamientos dominantes (frase exacta) · Conducta problema · Consecuencia inmediata positiva · Consecuencia tardía negativa · Bucle de mantenimiento | NARRATIVO (8 de 10 elementos; «Descripción (palabras del paciente)») | **NLP** |
| | Función del consumo principal y secundaria (6 opciones) | CATEGÓRICO-ÚNICO (+ secundaria opcional) | ESTRUCTURADO |
| **4. Consumo actual** | Tiempo que le lleva consumir una unidad y tiempo antes de volver a consumir | NARRATIVO | **NLP** |
| | Momento del día en que suele consumir (4 opciones) | CATEGÓRICO-ÚNICO | ESTRUCTURADO |
| | ¿Suele consumir solo/a o acompañado/a? (4 opciones) | CATEGÓRICO-ÚNICO | ESTRUCTURADO |
| | Inmediatamente después de consumir, ¿qué cambia? | NARRATIVO | **NLP** |
| | ¿Ver ciertos objetos actúa como señal? (Nunca / A veces / Frecuentemente) | ORDINAL | ESTRUCTURADO |
| | Frecuencia de episodios que duran más de lo previsto (4 opciones) | CATEGÓRICO-ÚNICO | ESTRUCTURADO |
| | **Craving**: intensidad máxima 0–10 · cuántas veces al día · minutos u horas antes de ceder | NUMÉRICO ×3 | ESTRUCTURADO — **excluido del NLP** |
| | ¿Puede observar el deseo como una ola sin actuar? (Sí / No / A veces) | ORDINAL | ESTRUCTURADO |
| | **Impulsividad (BIS-11 verbal)**: 3 reactivos (Nunca / A veces / Frecuentemente) | ESCALA / INSTRUMENTO | INSTRUMENTO — **excluido del NLP** |
| **5. Consecuencias del consumo** | Problemas de salud generados (18 opciones) | CATEGÓRICO-MÚLTIPLE | ESTRUCTURADO |
| | Problemas familiares (5) · de pareja (10, incluye «No aplica») · sociales (5) | CATEGÓRICO-MÚLTIPLE | ESTRUCTURADO |
| | Círculo social consumidor; personas señal de no consumo; consumo como acceso a actividades intensas; % de salario destinado; normalización en el entorno | NARRATIVO | **NLP** |
| | Evaluación de red de síntomas: peor síntoma o problema (hasta 4) | CATEGÓRICO-MÚLTIPLE (máx. 4) | ESTRUCTURADO |
| **6. Periodos de abstinencia** | ¿Cuántas veces ha intentado dejar de consumir? | NUMÉRICO | ESTRUCTURADO |
| | Duración promedio de los periodos (4 rangos) | ORDINAL | ESTRUCTURADO |
| | Situaciones/pensamientos/emociones más difíciles · en qué ocupa su tiempo · qué hace para divertirse sin sustancias · un día bueno · personas sin presión de consumo · qué le impide involucrarse · por qué se abstuvo · estrategia eficaz descubierta · qué hace hoy para manejar los deseos · qué pasaría si dejara por completo | NARRATIVO (9 preguntas abiertas) | **NLP** |
| | Estrategias usadas en intentos previos (5) · desafíos de esos intentos (4) | CATEGÓRICO-MÚLTIPLE | ESTRUCTURADO |
| **7. Historia familiar** | ¿Algún familiar con problemas de consumo? (Sí/No) · quién (Padre/Madre/Hermanos) · naturaleza (Alcohol/Drogas ilegales/Medicamentos) · ¿en tratamiento? (Sí/No/Desconozco) · ¿influyó en su consumo? (4 opciones) · ¿hubo intervención? (Sí/No) · ¿fue efectiva? (Sí/No) | CATEGÓRICO | ESTRUCTURADO |
| **8. Historia de trauma** | ¿Ha experimentado un evento traumático? (Sí/No) | CATEGÓRICO-ÚNICO | ESTRUCTURADO |
| | Descripción breve del evento | NARRATIVO | **NLP** |
| | Momento de la vida (5 rangos) · afectación diaria (5 opciones) · apoyo buscado (4 opciones) · ¿influyó en el consumo? · ¿de qué manera? (3 opciones) | CATEGÓRICO | ESTRUCTURADO |
| | Sensación física recurrente que le lleva a consumir | NARRATIVO | **NLP** |
| | Estrés diario promedio 0–10 | NUMÉRICO | ESTRUCTURADO — **excluido del NLP** |
| | ¿Suficiente apoyo de familiares o amigos? | CATEGÓRICO-ÚNICO | ESTRUCTURADO |
| **9. Tratamientos previos** | Tabla de intentos (a-l): No. de veces · sustancia · duración (fechas) · resultados | TABLA / REPETIBLE | ESTRUCTURADO |
| **10. Expectativas del tratamiento** | ¿Qué espera lograr? (6, mult.) · ¿qué tan efectivo cree que será? (5) · ¿cuánto tiempo espera? (5) · preocupaciones (5, mult.) | CATEGÓRICO | ESTRUCTURADO |
| **11. Compromiso de la familia** | ¿Familia involucrada? (Sí/No) · ¿de qué manera participa? (3, mult.) · ¿qué importancia tiene? (5 ordinales) | CATEGÓRICO / ORDINAL | ESTRUCTURADO |
| **Anexo 11.a — Espectros HiTOP** | 6 espectros (Internalizante, Externalizante, Desinhibición, Distrés, Compulsividad, Retraimiento social) × nivel Bajo/Medio/Alto, con pregunta guía para el clínico | ORDINAL × 6 | ESTRUCTURADO |
| **Anexo 11.b — Dominios RDoC** | 6 dominios (Valencia negativa, Valencia positiva, Control cognitivo, Sistemas sociales, Arousal/regulación, Procesamiento sensoriomotor): marca de evidencia + **descripción de lo que ocurre** | BOOLEANO + NARRATIVO | Marca: ESTRUCTURADO · Descripción: **NLP** |
| **Anexo 11.c — Módulos SISAPTUS** | 5 módulos (Regulación afectiva · Motivación, recompensa y dirección vital · Control cognitivo, flexibilidad y metacognición · Interocepción, estrés y homeostasis · Self, identidad y procesos interpersonales), cada uno con nivel Bajo/Medio/Alto y reactivos mixtos (Sí/No, Nunca/A veces/Siempre, 0–10, texto corto) | MIXTO: ORDINAL + CATEGÓRICO + NUMÉRICO + TEXTO CORTO | ESTRUCTURADO — reactivos numéricos y dicotómicos **excluidos del NLP** |
| **Anexo 11.d — Modelo Causal Funcional** | 6 tipos de proceso (Vulnerabilidades basales · Disparadores · Amplificadores · Conductas de mantenimiento · Consecuencias perpetuadoras · Factores protectores) con «palabras clave del paciente» | NARRATIVO / TEXTO CORTO | **NLP** |
| **Anexo 11.e — Dinámica temporal** | Estado basal actual · principales perturbadores · indicadores de transición de fase | NARRATIVO | **NLP** |
| | Estabilidad del sistema afectivo (Estable/Lábil) · velocidad de recuperación (Rápida/Media/Lenta) · recaídas cíclicas (No / Sí cada N días-semanas + patrón) · resiliencia 0–10 | ORDINAL + NUMÉRICO | ESTRUCTURADO — **excluido del NLP** |
| **12. Impresión diagnóstica (CIE-11 / DSM-5-TR)** | Código · Diagnóstico | CATEGÓRICO / CÓDIGO | ESTRUCTURADO |
| | Observaciones al diagnóstico | NARRATIVO (clínico) | **NLP** (el alcance del canal incluye notas narrativas del clínico) |
| | Pronóstico (Reservado / Favorable / Desfavorable) | CATEGÓRICO-ÚNICO | ESTRUCTURADO |
| **13. Plan de tratamiento** | El formato indica que el plan se desarrolla **en un documento aparte** | REFERENCIA | NO-CANAL: campo de referencia/adjunto, no de captura obligatoria |
| | Recomendación de evaluación psiquiátrica (Sí/No) | CATEGÓRICO-ÚNICO | ESTRUCTURADO |
| **14. Recomendaciones al usuario y/o familia** | 8 opciones (terapia individual o grupal, apoyo familiar, educación sobre la adicción, exploración de opciones, habilidades de afrontamiento, planificación de crisis, seguimiento médico y terapéutico, apoyo social) | CATEGÓRICO-MÚLTIPLE | ESTRUCTURADO |
| | Próxima cita | FECHA | ESTRUCTURADO |
| | Nombre del terapeuta · Cédula profesional · Firma | IDENTIDAD DEL CLÍNICO (configurable) | ESTRUCTURADO — **no** se codifica fijo |

---

## 4. Narraciones Semanales

**Naturaleza del instrumento:** es un **autorregistro del paciente**, redactado en primera persona, que se entrega el día de
su sesión psicológica. No es una nota del clínico: la interfaz debe permitir registrar quién captura (usuario o clínico
transcribiendo), sin mezclar ambos orígenes.

### 4.1 Encabezado

| Campo fuente | Tipo | Canal |
|---|---|---|
| No. de expediente | IDENTIDAD CLÍNICA | Capa 1 (acceso restringido). **Corregido por R1** |
| Fecha | FECHA | ESTRUCTURADO |
| Edad | NUMÉRICO | ESTRUCTURADO |
| Sexo | CATEGÓRICO-ÚNICO | ESTRUCTURADO |
| Nombre del usuario | IDENTIDAD CLÍNICA | Capa 1. **Corregido por R1: se captura, no se sustituye** |
| Semana de rehabilitación | FECHA / PERIODO | ESTRUCTURADO |

### 4.2 Las 8 preguntas (estructura textual de la guía)

| Nº | Apartado | Pregunta de la guía | Tipo | Canal |
|---|---|---|---|---|
| 1 | Descripción de la Semana | Describe brevemente cómo ha sido tu semana. ¿Hubo algún evento importante o cambio significativo? | NARRATIVO | **NLP** |
| 2 | Desafíos Encontrados | ¿Qué desafíos o dificultades has enfrentado esta semana en tu proceso de rehabilitación? | NARRATIVO | **NLP** |
| 3 | Estrategias de Afrontamiento | ¿Qué estrategias o técnicas has utilizado para enfrentar estos desafíos? ¿Funcionaron bien? ¿Por qué o por qué no? | NARRATIVO | **NLP** |
| 4 | Emociones Experimentadas | ¿Qué emociones has experimentado predominantemente esta semana? ¿Cómo las manejaste? | NARRATIVO | **NLP** |
| 5 | Progresos y Logros | ¿Qué progresos o logros has notado en tu proceso de rehabilitación? ¿Hay algo de lo que te sientas especialmente orgulloso? | NARRATIVO | **NLP** |
| 6 | Reflexiones Personales | Reflexiona sobre cualquier pensamiento o sentimiento que quieras compartir acerca de tu proceso de rehabilitación. ¿Has notado algún cambio en tu perspectiva o actitud? | NARRATIVO | **NLP** |
| 7 | Metas para la Próxima Semana | ¿Cuáles son tus metas para la próxima semana en tu proceso de rehabilitación? ¿Hay algo específico en lo que te gustaría trabajar? | NARRATIVO | **NLP** |
| 8 | Comentarios Adicionales | Añade cualquier otro comentario o información que consideres relevante y que no hayas mencionado en las secciones anteriores. | NARRATIVO | **NLP** |

En la guía **los 8 apartados son texto libre**: no hay escalas ni variables cuantitativas. El único dato numérico del formato
es el encabezado (edad), que permanece estructurado.

---

## 5. Inconsistencias y ambigüedades detectadas (se conserva el original)

Documentadas antes de proponer cualquier cambio, según la indicación del clínico:

1. **Marcador de obligatoriedad sin alcance definido.** «Área obligatoria familiar y/o usuario» aparece en las secciones 1 y 2
   sin indicar a qué campos aplica. No se interpreta: se registra como marcador de sección.
2. **Marcas de obligatoriedad dispersas.** «Obligatorio para usuario de drogas» (secciones 3, 4 y 5) y «Obligatoria» (sección
   12) conviven con el marcador anterior sin un criterio único. La interfaz debe permitir marcar obligatoriedad **por campo**,
   sin imponer una regla que la fuente no establece.
3. **Bloques sin numeración dentro de la sección 11.** HiTOP, RDoC, módulos SISAPTUS, Modelo Causal Funcional y Dinámica
   Temporal no llevan número de sección y están intercalados entre la 11 y la 12. Se conservan como anexos de la sección 11
   para no renumerar la estructura clínica.
4. **Erratas en el texto fuente** (se conservan; sólo se corrigen en la interfaz si el clínico lo autoriza):
   «Asilamiento» (aislamiento), «le ha triado» (le ha generado), «diagnostica» por «diagnóstica», «¿Sí b. No», «hastal».
5. **Artefacto de extracción**: «010» en la escala de intensidad emocional corresponde a «0–10» partido por el conversor de
   texto del documento. No es un campo distinto.
6. **Identidad clínica y expediente — decisión CORREGIDA (§5.10).** Ambos formatos piden nombre del usuario y número de
   expediente. La decisión anterior los sustituía por un seudónimo; tras la revisión regulatoria (REG-001, NOM-004-SSA3-2012
   y LFPDPPP 2025) esa decisión **queda superada**: el expediente **contiene la identificación clínica** y el seudónimo pasa a
   ser identificador operativo de los módulos que no necesitan identidad.
7. **Dos contextos de captura distintos.** La entrevista es **administrada por el clínico** (tercera persona); la guía de
   narraciones es **autorregistro del paciente** (primera persona). No se unifican en una sola pantalla ni un solo origen.
8. **La sección 13 remite a un documento aparte** para el plan de tratamiento: la interfaz debe admitir una referencia o
   adjunto, y no forzar la captura de un plan que la fuente no define en este formato.
9. **Datos del terapeuta preimpresos** (nombre y cédula profesional) en el pie de la entrevista: pasan a configuración, nunca
   a valor fijo en el código.

---

## 5.10 Corrección de diseño R1 — identificación clínica (30/09/2026)

**Decisión anterior (superada, se conserva aquí para trazabilidad):** «el nombre real no es identificador principal; se usa
seudónimo + correspondencia protegida, y la interfaz muestra el seudónimo en lugar del nombre y del expediente».

**Motivo de la corrección:** revisión regulatoria con fuentes oficiales (REG-001). La NOM-004-SSA3-2012 exige que el
expediente contenga la identificación del paciente —«nombre completo del paciente, edad, sexo y en su caso, número de cama o
expediente»— y que las notas incluyan «fecha, hora, nombre completo, así como la firma de quien la elabora». Un seudónimo no
satisface jurídicamente esa identificación.

**Decisión vigente:**

```
IDENTIDAD CLÍNICA (nombre completo · expediente · identificadores clínicos)
        ↓  control de acceso
ID INTERNO SISAP
        ↓
SEUDÓNIMO OPERATIVO  →  sólo módulos que no requieren identidad
```

| Capa | Contenido | Regla |
|---|---|---|
| **1. Expediente clínico** | Identidad clínica, expediente, notas, información clínica | Acceso restringido por rol; es el registro jurídicamente válido |
| **2. Datos clínicos procesables** | Lo que los módulos analíticos necesitan, sin identificadores innecesarios | Derivada de la capa 1 por minimización |
| **3. NLP / autoencoders** | Sólo campos autorizados: texto narrativo | **Nunca** identidad, expediente ni identificadores |
| **4. Demo pública** | Datos sintéticos | **Nunca** identidad ni datos reales |

**Campos de identificación que el expediente debe poder contener:** nombre completo · número de expediente · sexo · edad y/o
fecha de nacimiento · otros identificadores clínicos requeridos · identificador interno único de SISAP · seudónimo operativo
(cuando sea útil). **Ninguno se elimina para favorecer la anonimización**: la anonimización es otra capa.

**Estrategia de minimización antes del NLP** (a documentar por campo al implementar):

| Tratamiento | Contenido |
|---|---|
| **Permanece en el expediente** | Identidad clínica, expediente, edad, sexo, fechas, autor y firma |
| **Se elimina antes del NLP** | Nombre completo, número de expediente, identificadores internos y cualquier dato de contacto |
| **Se transforma** | Referencias nominales dentro del texto narrativo (se minimizan antes de generar el embedding) |
| **Sólo referencia interna** | Identificador interno SISAP y vínculo con el expediente; nunca viaja al modelo ni a la demo |

**Nota de frontera:** la identificación del paciente **no se elimina del expediente** porque su texto clínico vaya a procesarse.
La separación se resuelve minimizando lo que entra al canal de notas, no borrando la identidad del registro clínico.

---

## 6. Frontera NLP / canal estructurado (regla operativa)

- **Entra al canal de notas** (`texto → NLP clínico → embedding → AE-NOTAS → Z_NOTAS`) exclusivamente el **texto narrativo**
  libre: respuestas abiertas de la entrevista, descripciones del Modelo Causal Funcional, observaciones del clínico y los
  **8 apartados** de la narración semanal.
- **No entra nunca** al canal de notas: escala de craving 0–10 y demás numéricos, reactivos BIS-11, niveles Bajo/Medio/Alto,
  listas de opciones, tablas repetibles, fechas, edad, sexo, códigos diagnósticos y variables derivadas. Pasan por su canal
  estructurado o por el autoencoder que corresponda.
- La separación no depende del criterio del operador: la verificación de entrada del canal rechaza valores numéricos y
  campos de instrumento (probado en `tests/unit/nlp/test_canal_notas.py`).

---

## 7. Correspondencia con módulos de SISAP

| Estructura fuente | Módulo de SISAP-TUS | Canal |
|---|---|---|
| Entrevista Exploratoria (14 secciones) | Captura clínica — primera consulta (pantalla por secciones) | Mixto: narrativo → NLP; resto → estructurado |
| Guía de Narraciones Semanales (8 preguntas) | Registro semanal (autorregistro) | Narrativo → NLP |
| Encabezados (expediente, nombre, edad, sexo) | Mecanismo de identidad existente (seudónimo + correspondencia protegida) | Identidad |
| Anexos HiTOP / RDoC / módulos SISAPTUS | Captura estructurada del perfil clínico | Estructurado |
| Impresión diagnóstica | Captura clínica — cierre diagnóstico | Estructurado (+ narrativo en observaciones) |
| Plan de tratamiento | Referencia a documento aparte | Referencia |
| Texto narrativo + derivados | Canal de notas clínicas (`app/nlp/`) + AE-NOTAS | NLP |

---

## 8. Pendientes de verificación

1. Implementar las pantallas de captura conforme a esta especificación (entrevista por secciones y registro semanal).
2. Pruebas de captura con datos sintéticos: guardar, reabrir y comprobar que el **texto original se conserva íntegro**.
3. Comprobar que los campos estructurados y numéricos **no** llegan al canal de notas.
4. Dataset de demostración: **4 pacientes sintéticos × 10 semanas × 8 preguntas**, entrevistas y notas de evolución
   sintéticas, sin correspondencia con pacientes reales.
5. Validación de anonimización de los 12 puntos antes de que cualquier artefacto de demo se considere publicable.

### Estado de implementación de la identificación clínica (30/09/2026)

Registrado en `docs/18_regulatory/EV-001_Evidencia_Identificacion_Notas_Capas.md`:

* **Implementado en código y verificado por pruebas** el bloque fundacional:
  identificación clínica y expediente (`app/database/models_notas.py`,
  `app/services/expediente_service.py`), notas con autoría, fecha/hora y firma
  con **versionado no destructivo** (`app/services/notas_service.py`), control de
  acceso por las cuatro capas (`app/security/capas.py`) y minimización de
  identidad antes del NLP (`app/services/minimizacion_service.py`).
* Cubierto por pruebas el punto 2 (el texto original de cada versión se conserva
  íntegro al corregir) y el punto 3 (contenido no narrativo y campos de identidad
  no cruzan al canal de notas).
* **Pendiente**: pantallas de captura de identificación y notas, y dataset de
  demostración sintético (puntos 1 y 4). La conformidad regulatoria permanece
  **pendiente de verificación**.

---

# 9. PLAN DE TRATAMIENTO (módulo independiente)

> Añadido a solicitud del clínico. **No se mezcla** con Entrevista Exploratoria, Narración Semanal, Notas de Evolución,
> Escalas ni DICO/DCSA: es una sección propia de SISAP-TUS.

## 9.1 Objetivo y límite

SISAP-TUS sirve para que **el clínico formule, documente, revise y actualice** el plan. Marco de uso: TCC, Terapia Basada en
Procesos, análisis funcional/conductual, ACT/DBT cuando corresponda, intervención orientada a procesos y objetivos
individualizados.

**El sistema no genera diagnósticos ni tratamientos automáticos.** La IA/ML **organiza información y señala patrones**; la
formulación y la decisión clínica son del profesional.

Prohibido por diseño:

```
Z_NOTAS = X        →  diagnóstico Y
Z_MULTIMODAL = X   →  tratamiento Y
```

El espacio latente es una representación computacional. Si en el futuro se desarrolla un modelo predictivo o de apoyo a
decisiones, vivirá como **componente separado, documentado y validado** — nunca dentro de este módulo.

## 9.2 Bloques de la pantalla

### A. Formulación clínica actual

Campos: problema/s principal/es · conductas clínicamente relevantes · antecedentes/contextos relevantes ·
consecuencias/mantenedores · patrones de evitación · patrones de aproximación/acción · factores contextuales · recursos y
factores protectores · procesos psicológicos relevantes · hipótesis funcional · prioridades clínicas.

Campo principal de texto libre: **Formulación clínica**, conservado tal como lo escribe el clínico (dato fuente).
Los once campos anteriores son texto libre breve y **también** quedan como dato fuente introducido por el clínico.

### B. Objetivos terapéuticos (múltiples)

| Campo | Tipo |
|---|---|
| `objetivo_id` | IDENTIFICADOR |
| descripción | NARRATIVO |
| prioridad | ORDINAL |
| área/proceso | CATEGÓRICO |
| conducta o proceso objetivo | TEXTO |
| contexto en el que ocurre | TEXTO |
| resultado esperado | NARRATIVO |
| indicador de cambio | NARRATIVO + vínculo (ver E) |
| línea base | NARRATIVO o NUMÉRICO **opcional** |
| meta | NARRATIVO o NUMÉRICO **opcional** |
| fecha de inicio · fecha de revisión | FECHA |
| estado | CATEGÓRICO: pendiente · activo · parcialmente alcanzado · alcanzado · suspendido · modificado |

**No se obliga a convertir todo en una puntuación 0–10.** Cuando exista una medida cuantitativa, se conserva como variable
estructurada independiente.

### C. Procesos terapéuticos objetivo (matriz editable)

Lista de partida — el clínico puede **seleccionar, excluir, modificar y agregar**: evitación experiencial · rigidez
psicológica · activación conductual · regulación emocional · tolerancia al malestar · impulsividad · craving · rumiación ·
resolución de problemas · habilidades interpersonales · funcionamiento social · adherencia/participación ·
exposición/aproximación · valores y acción comprometida · otros.

**No se asume que todos los pacientes presenten todos los procesos**: la matriz nace vacía, sin preselecciones.

### D. Intervenciones — relación explícita

```
Objetivo → Proceso → Intervención → Resultado observado
```

Por cada objetivo/proceso: intervención propuesta · fundamento clínico · técnica/procedimiento · frecuencia · responsable ·
contexto · tareas entre sesiones · criterios de revisión · respuesta observada · modificaciones realizadas.

### E. Indicadores de seguimiento

Cada objetivo puede vincularse a: escalas · variables estructuradas · indicadores conductuales · narraciones · notas clínicas ·
indicadores derivados de DICO/DCSA · variables temporales.

**No se crean valores ficticios.** Un indicador sin dato disponible se muestra como **no disponible**, no como cero ni como
valor estimado.

## 9.3 Relación con los cuatro espacios latentes

El Plan de Tratamiento es una **capa clínica de decisión y formulación**, alimentada *informativamente* por las
representaciones de los cuatro canales:

```
AE-ESCALAS     →  Z_ESCALAS
AE-QUINCENAL   →  Z_QUINCENAL
AE-DICO/DCSA   →  Z_DICO_DCSA
NLP → AE-NOTAS →  Z_NOTAS
                        ↓
            REPRESENTACIÓN MULTIMODAL   (preparada, no entrenada)
                        ↓
                PLAN DE TRATAMIENTO
                        ↓
        procesos · objetivos · intervenciones
```

Usos permitidos de las representaciones: contextualizar la evolución · identificar cambios · mostrar patrones · señalar
discrepancias entre modalidades · apoyar la revisión de objetivos · aportar información longitudinal.

**Los autoencoders no deciden el tratamiento.** La fusión multimodal sigue sin entrenarse: no existe todavía evidencia ni
datos suficientes, y este módulo **no la presupone**.

## 9.4 Propuesta de intervención (apoyo a la revisión)

```
Patrones observados → Procesos potencialmente relevantes → Objetivos registrados por el clínico
→ Intervenciones compatibles → Revisión por el clínico → Plan de tratamiento
```

El clínico puede **aceptar, modificar o descartar** cualquier sugerencia. Una sugerencia **no se guarda como decisión
clínica** hasta que el clínico la confirme. Si SISAP no puede fundamentar una sugerencia con datos disponibles, no la emite.

## 9.5 Revisión y versionado

El plan es longitudinal y **nunca se sobrescribe**: `Plan v1 → revisión → Plan v2 → revisión → Plan v3`, conservando el
histórico completo. Cada versión registra: fecha · versión · autor · motivo de modificación · cambios realizados.

## 9.6 Documento/referencia externa del plan

La fuente de Potrerillos remite a un documento aparte para el plan de tratamiento. La interfaz admite: nombre del documento ·
fecha · versión · ubicación/referencia · archivo adjunto cuando corresponda · observaciones.

**No se obliga a reconstruir en SISAP información que sólo existe en ese documento.** El módulo propio y el documento externo
**coexisten**.

## 9.7 Frontera con el canal de NLP

El NLP procesa **sólo** los campos narrativos ya definidos como entrada del canal de notas/entrevista. **El Plan de
Tratamiento no se envía automáticamente al NLP.**

```
Texto clínico fuente        →  NLP / AE-NOTAS
Plan de tratamiento estructurado  →  registro clínico
```

Si más adelante se quiere estudiar el lenguaje de los planes, será un **análisis explícitamente definido y validado**, sin
incorporarlo por accidente al AE-NOTAS.

## 9.8 Trazabilidad del origen de cada dato

Cada elemento se marca con su categoría, y **no se mezclan**:

| Categoría | Significado | Marca en interfaz |
|---|---|---|
| A | Dato introducido por el clínico | `CLÍNICO` |
| B | Dato proveniente de un instrumento | `INSTRUMENTO` |
| C | Dato derivado computacionalmente | `DERIVADO / INFORMATIVO` |
| D | Sugerencia generada por SISAP | `SUGERENCIA` |
| E | Decisión clínica confirmada por el profesional | `REGISTRO CLÍNICO CONFIRMADO` |

La interfaz debe dejar claro en todo momento qué es **`DERIVADO / INFORMATIVO`** y qué es **`REGISTRO CLÍNICO CONFIRMADO`**.

---

# 10. Estado de implementación de las dos pantallas de captura (30/09/2026)

Nota de estado. Esta sección **no toca la §9** (Plan de Tratamiento) ni modifica el contenido canónico anterior: sólo
declara qué de lo especificado en §3 y §4 quedó **diseñado**, **implementado**, **verificado** y **pendiente**.

## 10.1 Implementado (código en el repositorio)

**Estructura canónica como dato único.** `app/database/estructura_captura.py` declara la estructura de ambas pantallas
—bloque previo de rigidez por dominio + secciones 1 a 14 de la Entrevista Exploratoria, y las 8 preguntas de la
Narración Semanal con su apartado y su enunciado textual—. La UI y el servicio consumen la misma fuente; la estructura
no se repite en las pantallas.

**Modelo de datos.** `app/database/models_captura.py`, con seis tablas registradas en `Base.metadata`:

| Pantalla | Tablas | Contenido |
|---|---|---|
| Entrevista Exploratoria | `entrevistas_exploratorias`, `entrevista_versiones`, `entrevista_campos` | una fila por entrevista (identificación por `paciente_id` del expediente ya existente, fecha, autor, estado, versión vigente); una fila por campo, separada por `tipo` |
| Narración Semanal | `narraciones_semanales`, `narracion_versiones`, `narracion_respuestas` | una fila por narración (paciente, semana/periodo, fecha, origen/autorregistro, estado); una fila por pregunta y versión |

Cada campo guarda su `tipo` y separa el **texto libre** (`texto`) del **valor estructurado** (`valor`, JSON). Los tipos
narrativos quedan marcados como candidatos al canal de NLP; escalas, VAS, ordinales, numéricos, categóricos, múltiples,
booleanos y tablas **no** lo son.

**Migración no destructiva.** `migrar_esquema_captura(engine)` —creación de tabla si falta y `ALTER TABLE ADD COLUMN`
idempotente; nunca `DROP` ni `DELETE`— encadenada en `init_db()` de `app/database/models.py`.

**Servicio.** `app/services/captura_service.py`: crear, leer, listar, corregir por versionado (la corrección **nunca
sobrescribe**: crea versión nueva con motivo), cambio de estado validado, y `verificar_integridad_narracion` (huella por
versión). El texto original de la narración es inmutable.

**Frontera NLP.** `seleccionar_campos_nlp` y `TIPOS_CANDIDATOS_NLP` (`narrativo`, `observacion`) filtran la entrada;
`entrada_nlp_entrevista`, `entrada_nlp_narracion` y `entrada_nlp_para_campos` exigen capa `NLP_AUTOENCODERS` y pasan la
identidad por minimización. `asegurar_campos_narrativos` levanta `ErrorCampoNoNarrativo` si algo que no es narrativo
intenta cruzar, incluso forzado como texto.

**Pantallas.** `app/ui/pages/entrevista_exploratoria.py` (administrada por el clínico, tercera persona; prefijo `ee-`) y
`app/ui/pages/narracion_semanal.py` (autorregistro del paciente, primera persona; prefijo `ns-`): **dos pantallas
separadas**, enrutadas en `resolve()` como `/pacientes/<id>/entrevista` y `/pacientes/<id>/narracion-semanal`, con
callbacks reales en `register_callbacks()`. El texto libre se distingue visualmente de las variables estructuradas
(clase e insignia de tipo) y el estado de registro se muestra en pantalla. La identificación clínica se toma del
expediente existente: la captura **no duplica** nombre ni número de expediente.

## 10.2 Verificado

- `tests/unit/test_captura_narrativa.py` — 31 pruebas: (12) entrevista y sus tipos de campo; (13) narración semanal;
  (14) las 8 preguntas exactas; (15) que sólo lo narrativo llega al canal y que escalas/VAS/numéricos quedan fuera.
- Base de datos **sintética en memoria**, paciente `SISAP-DEMO-0001`; las pruebas no abren la base clínica.
- Suite completa en verde: `333 passed` (`302` de línea base + `31` nuevas) con
  `python -m pytest tests -q --no-header -p no:cacheprovider`.
- Registro real de callbacks comprobado sobre una app Dash: los dos flujos nuevos exponen
  `ee-body/ee-feedback/ee-entrevista` y `ns-body/ns-feedback/ns-narracion`.

## 10.3 Pendiente

- **Inferencia NLP end-to-end**: los pesos del modelo no están instalados en el entorno; el canal declara el motivo en
  lugar de devolver valores sustitutos. La frontera de tipos sí está probada.
- **Datos reales**: no se ha probado con datos clínicos reales —por diseño, sólo con datos sintéticos—; falta la
  validación con el equipo clínico.
- **Navegación del shell**: las dos pantallas se alcanzan por ruta directa; falta incorporarlas al rail/barra de
  navegación.
- **Revisión externa**: sin revisión por comité ni validación documental de la captura en uso.

