# SISAP by CENIVRA — Manual UX

## Especificación de producto, UX, ontología y contratos

| Campo | Valor |
| --- | --- |
| **Versión** | v1.1 |
| **Estado** | **EN REVISIÓN** — no aprobado, no "final", no baseline de implementación |
| **Fecha de esta revisión** | 2026-09-20 |
| **Origen** | Revisión del paquete recibido: `00_RECIBIDO_EXTERNO_2026-09-20_EN_REVISION/SISAP_Recover_AI_Manual_UX_v1_FINAL.md` (216 100 B, 22 135 palabras, 177 encabezados) |
| **Base de contenido** | El documento recibido. Esta revisión **no reescribe el fondo**: reordena, deduplica, numera los contratos, corrige lo demostrablemente incorrecto y reconcilia las referencias con el corpus documental real del proyecto. |
| **Edita** | Hermes (agente), a solicitud del propietario |
| **Aprueba** | **PENDIENTE** — propietario del proyecto |
| **No implica** | aprobación clínica, regulatoria, de seguridad, validación local ni autorización de producción |

> ⚠️ **EN REVISIÓN — NO APROBADO.** Este documento no es baseline de implementación. Ver la
> [regla de cierre](#anexo-e--criterio-de-cierre-editorial): no se declara "final" mientras
> `PEND-01…06`, `ABIERTO-01…03` y `D-01…05` permanezcan abiertas.

## Resumen ejecutivo

Este manual define la **UX y la epistemología de producto de SISAP**: principios, roles, ontología,
contratos de interpretación/evidencia/decisión humana, las dos superficies clínicas (`Trajectory
View`, `Clinical Insight Card`), la capa de interacción end-to-end y la integración de marca y
accesibilidad. Está dirigido al equipo de producto, diseño e ingeniería. **No** define requisitos
formales ni umbrales clínicos: ante conflicto, prevalece el `SISAP-SRS-001` (`PRIN-00`).

## Tabla de contenidos

- [0. Registro de reconciliación con el corpus del proyecto](#0-registro-de-reconciliación-con-el-corpus-del-proyecto)
- [1. Arquitectura de reglas y contratos](#1-arquitectura-de-reglas-y-contratos)
- [2. Principios de producto y de diseño](#2-principios-de-producto-y-de-diseño)
- [3. Roles, necesidades y alcance](#3-roles-necesidades-y-alcance)
- [4. Historias de usuario (PROPUESTA)](#4-historias-de-usuario-propuesta)
- [5. Criterios transversales, riesgos y trazabilidad](#5-criterios-transversales-riesgos-y-trazabilidad)
- [6. Ontología y contratos](#6-ontología-y-contratos)
- [7. Superficie Trajectory View](#7-superficie-trajectory-view)
- [8. Superficie Clinical Insight Card](#8-superficie-clinical-insight-card)
- [9. Interacción end-to-end](#9-interacción-end-to-end)
- [10. Integración de marca y accesibilidad de interfaz](#10-integración-de-marca-y-accesibilidad-de-interfaz)
- [Anexo A — Matriz de trazabilidad consolidada](#anexo-a--matriz-de-trazabilidad-consolidada)
- [Anexo B — Glosario de estados y vocabulario controlado](#anexo-b--glosario-de-estados-y-vocabulario-controlado)
- [Anexo C — Registro de intervenciones de esta revisión](#anexo-c--registro-de-intervenciones-de-esta-revisión)
- [Anexo D — Fuentes y referencias verificadas](#anexo-d--fuentes-y-referencias-verificadas)
- [Anexo E — Criterio de cierre editorial](#anexo-e--criterio-de-cierre-editorial)

## Glosario de etiquetas de revisión

| Etiqueta | Significado |
| --- | --- |
| `CONSERVAR` | Contenido del documento recibido, sin cambios de fondo. Renumerado y deduplicado. |
| `CORREGIR` | Error demostrable; la evidencia va en §0.2. |
| `PRECISA` | La afirmación era ambigua o de dos capas; se separan. |
| `PROPUESTA` | No existe en el corpus del proyecto. Se conserva como propuesta, sin efecto de baseline. |
| `PENDIENTE` | Hueco abierto, con identificador y dueño. |
| `ABIERTO` | Decisión del propietario, no del documento. |

Estas etiquetas se definen operativamente en §0.5 y se usan en todo el documento.

**Documentos controlados del proyecto que este manual referencia y NO sustituye** (verificados
existentes en disco, 2026-09-20):

| ID | Archivo | Qué define |
| --- | --- | --- |
| `SISAP-IU-001` | [docs/00_intended_use/intended_use.md](../../docs/00_intended_use/intended_use.md) | uso previsto, población, funciones, entradas y **salidas** |
| `SISAP-SRS-001` | [docs/02_requirements/SRS.md](../../docs/02_requirements/SRS.md) | requisitos de software (203 `REQ-*` distintos) |
| `SISAP-SAD-001` | [docs/03_software_architecture/SAD.md](../../docs/03_software_architecture/SAD.md) | arquitectura |
| `SISAP-SDD-001` | [docs/04_detailed_design/Software_Detailed_Design.md](../../docs/04_detailed_design/Software_Detailed_Design.md) | diseño detallado |
| `SISAP-VIP-001` | [docs/05_verification_and_integration/Software_Verification_and_Integration_Plan.md](../../docs/05_verification_and_integration/Software_Verification_and_Integration_Plan.md) | verificación e integración |
| `SISAP-STP-001` | [docs/06_system_testing/System_Test_Plan.md](../../docs/06_system_testing/System_Test_Plan.md) | pruebas de sistema |
| `SISAP-RMF-001` | [docs/07_risk_management/Software_Risk_Management_File.md](../../docs/07_risk_management/Software_Risk_Management_File.md) | riesgos (`RISK-001`…`RISK-016`) |
| `SISAP-TRSC-001` | [docs/10_traceability_and_safety/Software_Traceability_and_Safety_Classification.md](../../docs/10_traceability_and_safety/Software_Traceability_and_Safety_Classification.md) | trazabilidad y clasificación de seguridad |
| `SISAP-SVP-001` | [docs/12_software_validation/Software_Validation_Plan.md](../../docs/12_software_validation/Software_Validation_Plan.md) | plan de validación |
| `SISAP-MMP-001` | [docs/13_model_management/Model_Management_Plan.md](../../docs/13_model_management/Model_Management_Plan.md) | gobernanza del modelo |

> **Bloque de control de los diez documentos** (verificado por inspección delegada, 2026-09-20):
> todos declaran **versión 1.0**, estado **"Borrador controlado"**, fecha **agosto 2026** y responsable
> **Psic. Lauro Gutiérrez Castro**. Es decir: **ninguno está aprobado**, lo que es coherente con la
> advertencia de encabezado del documento recibido.

> **Nota.** `SISAP-SDD-001`, `SISAP-STP-001` y `SISAP-TRSC-001` existen en el proyecto pero **no eran
> citados** por el documento recibido. `SISAP-TRSC-001` es además el documento que **contiene la
> convención de identificadores** del proyecto, por lo que toda familia de IDs propuesta en este
> manual (ver §1) debe reconciliarse contra él.

---

# 0. Registro de reconciliación con el corpus del proyecto

**Esto es lo nuevo de esta revisión.** El documento recibido declara en su propio encabezado que los
documentos controlados referenciados *"no se consideran verificados por su sola mención"* y que,
cuando no están presentes, sus contenidos atribuidos deben tratarse como `HIPÓTESIS / REFERENCIADO —
NO VERIFICADO`. Esta sección realiza esa verificación, afirmación por afirmación, contra el corpus
real (626 archivos recorridos; 2026-09-20).

## 0.1 Lo que se verificó como correcto

| Afirmación del documento recibido | Veredicto | Evidencia |
| --- | --- | --- |
| Los documentos controlados `SISAP-IU/SRS/SAD/RMF/MMP/SVP/VIP-001` existen | ✅ **CORRECTA** | los 9 IDs existen (tabla de arriba) |
| Los requisitos `REQ-INTERP-001…004`, `REQ-LONG-001…006`, `REQ-NLP-001…005`, `REQ-CLIN-001…006`, `REQ-UI-001/002/004/005/006/007/009` existen | ✅ **CORRECTA — 28 de 28** | [docs/02_requirements/SRS.md](../../docs/02_requirements/SRS.md) L422–L745 |
| Los riesgos `RISK-001`…`RISK-015` existen | ✅ **CORRECTA** | `Software_Risk_Management_File.md` L324–L604 |
| `MLResult` tiene exactamente los 8 campos que el documento describe (`model_id`, `model_version`, `prediction`, `latent_representation`, `cluster`, `reconstruction_error`, `uncertainty`, `status`) | ✅ **CORRECTA, textual** | `Model_Management_Plan.md` L1269 |
| El Intended Use "enumera posibles salidas" y esa enumeración no autoriza por sí misma su implementación | ✅ **CORRECTA en el argumento** (la lista estaba incompleta: ver 0.2-#1) | `intended_use.md` L377 |

## 0.2 Correcciones demostrables

| # | Qué decía el documento recibido | Qué dice la evidencia | Acción en esta v1.1 |
| --- | --- | --- | --- |
| **1** | *"El Intended Use enumera entre las posibles salidas: estimaciones de riesgo; alertas; representaciones dimensionales; perfiles; agrupaciones; NLP; métricas longitudinales."* | La lista literal del `SISAP-IU-001` §15 tiene **12 elementos**: `Clinical Scores` · `Dimensional Profile` · `Cluster` · **`ML Prediction`** · **`Reconstruction Metrics`** · **`Uncertainty`** · `Risk Level` · `Risk Score` · `Alerts` · `Longitudinal Metrics` · `NLP Results` · **`Reports`**. La paráfrasis **omitía 5 de 12**, entre ellos `ML Prediction`, `Uncertainty` y `Reports` — precisamente tres de los que más discute este manual. | La lista se cita **verbatim** en §3.7, con `intended_use.md#L377`. |
| **2** | *"La v0.2 del Data Dictionary establece que estas entidades describen acontecimientos… no deben convertirse automáticamente en diagnóstico, riesgo, causalidad o recomendación."* | **Ese documento no existe.** [docs/14_data_management/Data_Management_Specification.md](../../docs/14_data_management/Data_Management_Specification.md) lo declara **`Planificado`** y solo contiene un apartado `# 118. Data Dictionary` como marcador. No hay ningún Data Dictionary con versión v0.2 en el corpus (0 archivos, 0 coincidencias). | Se sustituye la atribución por: **"el Data Dictionary está *Planificado* ([docs/14_data_management/Data_Management_Specification.md](../../docs/14_data_management/Data_Management_Specification.md)); su contenido no puede citarse como existente"**. Las reglas de separación entidad↔interpretación se conservan como **regla de este manual**, no como cita. |
| **3** | *"El sistema de alertas permanece fuera de baseline clínica definitiva"* y `REQ-UI-006` marcado como **BLOCKED**. | **`REQ-ALERT-001`…`REQ-ALERT-007` existen en el SRS** (L582–L612): *Generación, Identificación, Criterio, Estado, Trazabilidad, Interpretación, Fallo de generación*. Y **`REQ-UI-006` existe** (L726): *"Las alertas deberán ser claramente distinguibles y mostrar la información necesaria para su interpretación."* Lo que **no** está definido es el **criterio clínico** de disparo: `REQ-ALERT-001` remite a *"los criterios definidos para dicha alerta"*, y `RISK-013` es *"Umbral configurado incorrectamente"*. | Se **precisa la capa**: mecánica de alertas = **especificada** (`ALR-01…07`); criterio clínico y umbral = **abiertos** (`PEND-03`). El `Gate` se aplica al criterio clínico, no al requisito. Se elimina la lectura de que `REQ-UI-006` es una propuesta. |
| **4** | Tabla de riesgos UX que mapea `RISK-001`…`RISK-015`. | Los títulos literales son: 001 Clasificación incorrecta del perfil · 002 Falso negativo de alerta · 003 Falso positivo de alerta · 004 Error de scoring · **005 Error de normalización** · 006 Modelo incompatible · 007 Modelo corrupto o alterado · **008 Error de persistencia** · 009 Acceso no autorizado · 010 Resultado obsoleto presentado como actual · 011 Error longitudinal · 012 Resultado NLP incorrecto · 013 Umbral configurado incorrectamente · 014 Fallo de alerta · 015 Falla de interfaz que induce interpretación incorrecta · **016 SOUP produce comportamiento inesperado**. El documento recibido omitía 005, 008 y 016 — los tres **no** tienen control UX relevante, así que la omisión es correcta, pero no estaba justificada. | La tabla de §5.4 incluye **los 16** y marca explícitamente cuáles no tienen control UX. |
| **5** | El set de requisitos de interfaz citado es `REQ-UI-001/002/004/005/006/007/009`. | `REQ-UI-003` (Validación) y `REQ-UI-008` (Confirmaciones) **también existen** y son las dos que faltaban. Son pertinentes a un manual de UX. | Se añaden a la matriz de §5.2. |

## 0.3 Lo que no se pudo verificar (y no se cierra por inferencia)

| # | Elemento | Estado verificado |
| --- | --- | --- |
| `PEND-01` | **Historias de usuario `HU-001`…`HU-018`** | **0 apariciones en el corpus** (626 archivos recorridos). Las 18 HU son una **propuesta de este paquete**, no baseline del proyecto. Se conservan completas, pero **declaradas como propuesta no incorporada** (§4). |
| `PEND-02` | `AC-*` (46 IDs), `HYP-*` (12 IDs), `TEST-INS-*` `TEST-TRJ-*` `TEST-AUD-*` (23 IDs), `PR-HU15/16-*` (6 IDs) | **0 apariciones en el corpus.** El propio documento los llama *"referencias de trabajo"*. Se conservan, marcados como **identificadores propuestos**, para que no se confundan con los `TEST-*` y `REQ-*` reales del proyecto. |
| `PEND-03` | Criterio clínico y umbral de las alertas | No definido. Ver 0.2-#3. |
| `PEND-04` | **RCI / banda de cambio clínicamente significativo** | **0 apariciones en el corpus.** No está definido ni validado en ningún documento del proyecto. La regla `VIS-03` del Brand System (mostrar la banda *solo* cuando el RCI esté definido) es por tanto la regla correcta, y el hueco sigue abierto. |
| `PEND-05` | `G_H_I_Validation_Matrix_Blueprint.md` | Referenciado por el Anexo A del Brand System como existente. **No se localizó en el corpus.** |
| `PEND-06` | El Data Dictionary completo | Planificado, no escrito. Ver 0.2-#2. |

## 0.4 Correcciones estructurales aplicadas

| Defecto del documento recibido | Medición | Corrección |
| --- | --- | --- |
| **Numeración huérfana** | **71 subtítulos** cuyo prefijo numérico pertenece a otro documento (p. ej. `116.1…116.4` bajo el capítulo `22.`; `226.1` bajo `95.`; `288.1` bajo `151.`; `156.1…156.14` bajo `40.`). El encabezado padre se renumeró a mano (1→176) pero los subtítulos no. | Numeración única y coherente por capítulo. |
| **Colisión de documentos** | El propio encabezado declara que el manual *"integra Product + Ontología + Data Dictionary + Gobernanza + Brand Integration"*: son **≥5 documentos** con cinco numeraciones distintas, concatenados. | Reorganizado en 10 secciones + anexos, con la procedencia de cada bloque declarada. |
| **Capítulos duplicados** | `Role Variants` aparece **2 veces** (caps. 75 y 111); `Accessibility Contract` **3 veces**; `Verification Test Cases` **2**; `Validation Hypotheses` **2**; `Acceptance Criteria` **3**; `Traceability` **3**; cuatro bloques *"propósito y alcance de la especificación"*. | Consolidados por superficie, sin pérdida de contenido. |
| **Versiones cruzadas** | El documento recibido no declara su propia versión en el cuerpo, pero el dashboard y el deck lo citan como **v1.6** y **v1.3**, y como dependientes de un *Checklist Editorial V2.3* inexistente en el paquete. | Versión única declarada en la tabla de control: **v1.1 EN REVISIÓN**. |

## 0.5 Cómo leer el resto del documento

Las etiquetas de revisión (`CONSERVAR`, `CORREGIR`, `PRECISA`, `PROPUESTA`, `PENDIENTE`, `ABIERTO`)
están definidas en el [glosario de etiquetas](#glosario-de-etiquetas-de-revisión) al inicio del
documento.

**Regla de lectura (`PRIN-00`).** Este manual **no convierte hipótesis UX, clínicas, regulatorias ni de
modelo en hechos validados**, y no sustituye la especificación de requisitos del proyecto
(`SISAP-SRS-001`). Cuando una regla de aquí entre en conflicto con un requisito formal, gana el
requisito, y el conflicto se registra como `PENDIENTE` en lugar de resolverse por interpretación.

---

# 1. Arquitectura de reglas y contratos

El documento recibido enunciaba sus reglas en prosa, mediante la fórmula `**REGLA:**` repetida: no
había forma de citar una regla ni de detectar dos que dijeran lo mismo. Esta v1.1 sustituye esa
cascada por **identificadores estables** agrupados en dominios. Una regla = una afirmación
verificable.

- **Formato:** `<DOMINIO>-<NN>`, numeración consecutiva por dominio.
- **Los identificadores no se renumeran nunca.** Una regla nueva se anexa al final de su dominio,
  aunque quede fuera del orden temático.
- Una regla solo puede estar en `VIGENTE`, `DE-V1 (hipótesis de trabajo)`, `PROPUESTA` o `PENDIENTE`.

| Dominio | Qué gobierna | Nº de reglas |
| --- | --- | --- |
| `PRIN-` | Principios de producto y de diseño | 8 |
| `ROL-` | Roles, necesidades y profundidad de presentación | 10 |
| `CA-` | Criterios transversales de aceptación | 8 |
| `ONT-` | Ontología, entidades y separación epistémica | 12 |
| `PROV-` | Provenance, source y vocabulario | 7 |
| `TEMP-` | Temporalidad y precisión | 6 |
| `INT-` | Interpretación (`ClinicalInsight`) | 9 |
| `FND-` | Fundamento (`InsightFoundation`) | 5 |
| `DEC-` | Decisión humana | 7 |
| `EST-` | Estados (provenance, dominio, interacción) | 5 |
| `RBAC-` | Autorización y profundidad de presentación | 4 |
| `ALR-` | Señal, alerta e insight | 7 |
| `NLP-` | Procesamiento de lenguaje natural | 5 |
| `SCR-` | Scoring psicométrico | 3 |
| `MOD-` | Modelo, configuración y resultados | 5 |
| `UNC-` | Incertidumbre | 3 |
| `TRAJ-` | Superficie Trajectory View | 20 |
| `CAR-` | Superficie Clinical Insight Card | 12 |
| `FLU-` | Interacción end-to-end | 10 |
| `MAR-` | Integración de marca y accesibilidad de interfaz | 10 |
| `GOB-` | Gobernanza de IA y de datos | 4 |
| `PEND-` | Huecos abiertos con dueño (registro en §6.16) | 6 |
| `PNT-` | Inventario de pantallas del prototipo (§10.4) | 16 |

**Familias de identificadores que NO son reglas de este manual** (`PROPUESTA`, ver §0.3): `HU-001`…`HU-018`
(historias de usuario), `AC-TRJ-*`, `AC-INS-*`, `AC-INT-*`, `AC-BRAND-*` (criterios de aceptación de
superficie), `HYP-TRJ-*`, `HYP-INS-*` (hipótesis de validación), `TEST-TRJ-*`, `TEST-INS-*`,
`TEST-AUD-*` (casos de verificación), `UX-001`…`UX-008` (escenarios de prueba), `UP-001`…`UP-010`
(caminos infelices), `F-001`…`F-006`, `FI-001`…`FI-006`, `C-001`…`C-008` (reglas internas de bloque),
`TRJ-01`…`TRJ-04` (componentes de superficie), `S-001`…`S-005` (contrato de enunciado). Ninguna de
estas familias existe en el corpus del proyecto: **no deben confundirse con los `TEST-*` y `REQ-*`
reales del `SISAP-SRS-001` ni con el sistema de V&V.**

> **Verificación de integridad (2026-09-20).** 165 identificadores de regla distintos, 0 colisiones
> entre dominios, 0 filas de tabla mal formadas, 0 encabezados sin numerar, 0 marcadores de proceso
> residuales. Corregida en esta verificación una **colisión de prefijo** (`SCR-` se usaba a la vez
> para scoring y para pantallas → las pantallas pasaron a `PNT-`).

---

# 2. Principios de producto y de diseño

| ID | Regla | Estado |
| --- | --- | --- |
| `PRIN-01` | **Principio central.** SISAP no debe mostrar "todo lo que sabe", sino *lo que cada usuario necesita para realizar su tarea, con el nivel de evidencia, incertidumbre y responsabilidad correspondiente*. La misma información puede presentarse de manera diferente según el rol. | `CONSERVAR` |
| `PRIN-02` | **Mínimo privilegio.** Cada usuario accede únicamente a la información necesaria para realizar sus funciones. | `CONSERVAR` |
| `PRIN-03` | **El centro no es el dashboard.** El centro de SISAP es la **trayectoria de la persona**. La interfaz no se construye alrededor de "tarjetas de IA", sino alrededor de comprender una trayectoria y después inspeccionar las interpretaciones que SISAP genera sobre ella. | `CONSERVAR` |
| `PRIN-04` | La experiencia debe sentirse como un sistema que ayuda a comprender una trayectoria, **no** como un sistema que entrega respuestas clínicas generadas por IA. La IA es una capacidad del sistema, no el protagonista narrativo. | `CONSERVAR` |
| `PRIN-05` | **Evidencia antes que efecto.** Ninguna decisión visual, verbal o editorial debe hacer que una interpretación parezca más sólida que la evidencia que la sustenta. La expresividad queda subordinada a la comprensión cuando una pieza contiene información clínica, inferencias o resultados del sistema. | `CONSERVAR` |
| `PRIN-06` | **La IA puede interpretar la trayectoria; la trayectoria no debe reescribirse para justificar la IA.** La evidencia existe independientemente de la interpretación. | `CONSERVAR` |
| `PRIN-07` | **Regla de precedencia epistemológica.** Ante conflicto entre especificaciones prevalece la **más específica, más restrictiva y más directamente relacionada con seguridad, validez clínica o regulación**: `requisito regulatorio/seguridad` → `regla clínica validada` → `gobernanza de IA` → `regla epistemológica del producto` → `design system` → `preferencia visual`. Una taxonomía conceptual no autoriza por sí misma una representación de producto, y una capacidad técnica del modelo no autoriza por sí misma una afirmación clínica. | `CONSERVAR` |
| `PRIN-08` | **Advertencia de reconciliación (`CORREGIR`).** Este manual define **UX y epistemología**, no requisitos ni umbrales clínicos. Donde el documento recibido atribuía contenido a documentos inexistentes (Data Dictionary v0.2) o a versiones que no existen en el proyecto (Manual UX v1.6, Checklist Editorial V2.3), esta v1.1 lo marca en §0 y deja la atribución fuera del cuerpo. | `CORREGIR` |

---

# 3. Roles, necesidades y alcance

## 3.1 Arquitectura de roles

**Niveles y tipo de decisión** (`CONSERVAR`; investigación a validar posteriormente mediante
entrevistas, observación contextual y validación clínica con usuarios mexicanos):

| Nivel | Roles | Tipo de decisión |
| --- | --- | --- |
| Atención directa | Psicología, Medicina, Enfermería, Trabajo Social, Consejería | Individual, clínica y de seguimiento |
| Supervisión | Coordinación / Subdirección | Operativa, clínica agregada y escalamiento |
| Dirección | Dirección institucional | Estratégica e institucional |
| Gobernanza | IT, Calidad, Privacidad | Técnica, seguridad y cumplimiento |

## 3.2 Necesidades por rol

| Rol | Necesidad principal | No necesita en primera capa | Riesgo principal |
| --- | --- | --- | --- |
| **Consejería** | Comprender rápidamente el estado reciente y detectar cambios relevantes para acompañar, documentar o escalar. Puede tener experiencia vivencial sin formación clínica, estadística o psicométrica. | Parámetros del modelo, representaciones latentes, estadística avanzada, terminología psicométrica innecesaria, inferencias presentadas como diagnósticos. | Automation bias |
| **Psicología** | Comprender la trayectoria longitudinal e integrar fuentes de evidencia para formular o ajustar la intervención. Pregunta central: *¿qué cambió y qué evidencia tengo para interpretarlo?* | — | Anchoring, automation bias, interpretación excesiva de una inferencia, falsa precisión |
| **Medicina** | Comprender el estado médico relevante dentro de una atención interdisciplinaria. | — | — |
| **Enfermería** | Monitorear el estado físico y detectar cambios que requieran intervención o escalamiento. | — | Alert fatigue, sobrecarga documental |
| **Trabajo Social** | Comprender los factores sociales que afectan la continuidad y el proceso de atención. | — | Convertir contexto en riesgo |
| **Coordinación / Subdirección** | Visión operativa y clínica agregada de los casos y equipos bajo su responsabilidad. | — | Atribución causal indebida; incentivos perversos |
| **Dirección** | Comprender el comportamiento institucional **sin** acceder a expedientes individuales. | — | Reidentificación; atribución causal indebida |

**Advertencia (`CONSERVAR`).** No debe utilizarse SISAP para mostrar una supuesta **"eficacia del
terapeuta"** sin evidencia de validez, control de factores de confusión y un diseño de evaluación
apropiado.

## 3.3 Jobs-to-be-Done

`CONSERVAR`. Todas las historias siguientes están redactadas como JTBD y relacionadas con las
necesidades específicas de cada rol.

- **Consejería:** ver estado reciente y tendencias de participación para ajustar el apoyo · entender
  en qué información se basa una señal de riesgo para no confiar ciegamente · documentar un cambio y
  compartirlo con el equipo.
- **Psicología:** ver la trayectoria longitudinal completa al preparar una sesión · entender el
  fundamento y la incertidumbre de una inferencia para integrarla críticamente · acceder a las
  distintas fuentes de evidencia al formular un plan.
- **Dirección:** ver métricas agregadas en tiempo real · comprender las limitaciones y factores de
  contexto de una tendencia para no atribuir causalidad indebidamente.

## 3.4 Contrato de roles y profundidad

| ID | Regla | Estado |
| --- | --- | --- |
| `ROL-01` | `Autorización` ≠ `profundidad de presentación`. RBAC determina **qué puede consultar** el usuario; la profundidad determina **cuánto detalle de un contenido ya autorizado** se presenta inicialmente. | `CONSERVAR` |
| `ROL-02` | **La revelación progresiva no puede conceder privilegios.** No puede usarse para saltar una restricción de acceso ni para revelar información que el usuario no está autorizado a consultar. | `CONSERVAR` |
| `ROL-03` | Secuencia obligatoria antes de implementar un componente: `autorización → datos permitidos → profundidad de presentación → componente`. Nunca `componente → revelación → escalada de privilegio`. | `CONSERVAR` |
| `ROL-04` | Si una tabla de roles y una tabla de profundidad difieren, **no se resuelve por interpretación del diseñador**: se abre decisión de gobernanza y se establece una versión canónica. | `CONSERVAR` |
| `ROL-05` | Profundidades por rol: Consejería `Compact` · Psicología `Clinical` · Medicina `Clinical/pertinente` · Enfermería `Compact/Clinical` · Trabajo Social `Contextual` · Coordinación `Summary` · Dirección `Aggregate`. Son reglas de presentación, **no** sustitutos del control de autorización. | `CONSERVAR` |
| `ROL-06` | No construir siete sistemas distintos: `una gramática de evidencia + autorización por rol + profundidad por rol + tarea por rol`. El dato base no cambia porque cambie la profundidad. | `CONSERVAR` |
| `ROL-07` | La adaptación de profundidad **no debe cambiar el significado** de los elementos: un `Inferido` sigue siendo `Inferido` para todos los roles autorizados. | `CONSERVAR` |
| `ROL-08` | La marca y la interfaz no deben sugerir que SISAP muestra todo lo que sabe: solo la información pertinente a la tarea y responsabilidad de quien consulta. | `CONSERVAR` |
| `ROL-09` | La expresión institucional favorece información **agregada** y evita producir una falsa sensación de acceso legítimo a expedientes individuales. No usar mapas, rankings o tablas que faciliten reidentificación cuando no sean necesarios para la tarea. | `CONSERVAR` |
| `ROL-10` | Interfaz de dirección: por defecto, insights agregados, tendencias y métricas institucionales. **No** mostrar Foundation individual ni expediente individual salvo autorización explícita y necesidad legítima definida. | `CONSERVAR` |

## 3.5 Qué queda fuera del MVP

`CONSERVAR`. Estas funcionalidades **no** deben cerrarse como definitivas: score único de riesgo ·
"eficacia del terapeuta" · recomendaciones automáticas prescriptivas · chat clínico como interfaz
principal · representación clínica directa del espacio latente de 12 dimensiones · contrafactuales
(HU-014) · sistema avanzado de feedback para reentrenamiento · sistema definitivo de alertas ·
interpretación causal de diferencias entre profesionales o programas.

El documento recibido señala además vacíos abiertos sobre workflows mexicanos, KPIs institucionales,
alfabetización digital específica, validación de explicaciones con clínicos mexicanos, umbrales
clínicamente relevantes y factores de confusión locales. **Estas decisiones permanecen como
hipótesis de producto, no como requisitos cerrados.**

## 3.6 Arquitectura conceptual y niveles epistemológicos

**`PRIN-03` operacionalizado** — la Trayectoria es una **entidad de producto**, no simplemente una
gráfica:

```text
PERSONA → TRAYECTORIA → datos / eventos / contexto → SISAP / procesamiento
        → INSIGHT → FOUNDATION + UNCERTAINTY + LIMITATIONS → DECISIÓN HUMANA
        → nuevo evento → TRAYECTORIA
```

Principio rector: `Trayectoria → Evidencia → Contexto → Interpretación → Fundamento → Decisión humana → Nueva trayectoria`.

**Tres capas que SISAP debe mantener separadas** (`CONSERVAR`):

| Capa | Incluye |
| --- | --- |
| **Mundo observado** | `Assessment`, `Observation`, `ClinicalEvent`, `BehavioralEvent`, `Context`, `Intervention` |
| **Computación e interpretación** | valores calculados, cambios, tendencias, asociaciones, `ClinicalInsight` |
| **Acción humana** | `HumanDecision` |
| *Transversal* | `Source`, `Provenance`, temporalidad, permisos, auditoría, relaciones |

**Terminología oficial de capas** (`CONSERVAR`): `OBSERVED/EVIDENCE → COMPUTED → MODEL OUTPUT →
INTERPRETATION → HUMAN DECISION`. En la capa de provenance del dato: `reported / calculated /
inferred / pending`. `inferred` describe provenance; `ClinicalInsight` describe una interpretación
explícita. **No usar `inferred` como sustituto de** diagnóstico, riesgo clínico, recomendación o
certeza clínica.

## 3.7 Uso previsto y alcance de las salidas del sistema

**Lo que sí está alineado con `SISAP-IU-001`** (`CONSERVAR`): SISAP es software de apoyo a la decisión
clínica que proporciona información estructurada para evaluación, caracterización dimensional y
seguimiento longitudinal de personas atendidas por TUS; los resultados apoyan la evaluación y
formulación de un profesional autorizado; SISAP **no** toma decisiones clínicas autónomas; los
resultados no deben presentarse como diagnósticos por sí mismos; las alertas son señales para
revisión; la incertidumbre y las limitaciones relevantes deben comunicarse; la responsabilidad de la
decisión clínica permanece en el profesional.

**Salidas enumeradas por el `SISAP-IU-001` §15** (`CORREGIR` — lista verbatim, con su referencia):

> *"Las salidas del sistema podrán incluir: `Clinical Scores` · `Dimensional Profile` · `Cluster` ·
> `ML Prediction` · `Reconstruction Metrics` · `Uncertainty` · `Risk Level` · `Risk Score` ·
> `Alerts` · `Longitudinal Metrics` · `NLP Results` · `Reports`"*
> — [docs/00_intended_use/intended_use.md](../../docs/00_intended_use/intended_use.md) L377

**Punto que requiere reconciliación formal** (`CONSERVAR`): el Intended Use **no** se interpreta como
autorización automática para implementar cada representación.

> Una capacidad incluida como posible salida en el Uso Previsto requiere especificación funcional,
> requisito, análisis de riesgo, definición estadística o clínicamente válida cuando corresponda, y
> validación **antes** de pasar a baseline.

Por tanto: `"estimación de riesgo"` ≠ `"Global Risk Score autorizado"`, y `"alerta"` ≠ `"alerta
clínica validada"`.

---

# 4. Historias de usuario (`PROPUESTA`)

> **Estado: `PEND-01`.** Las 18 historias que siguen **no existen en el corpus documental del
> proyecto** (0 apariciones de `HU-*` en 626 archivos, 2026-09-20). Son una propuesta del paquete
> recibido, conservada íntegra. **No tienen efecto de baseline** hasta que se incorporen al artefacto
> de User Stories / Product Requirements del proyecto.

## 4.1 P0 — Núcleo del producto

| ID | Rol | Historia |
| --- | --- | --- |
| `HU-001` | Psicología | Visualizar la trayectoria longitudinal de una persona, para identificar cambios y patrones relevantes para mi razonamiento clínico. |
| `HU-002` | Psicología | Inspeccionar qué información sustenta una inferencia de SISAP, para integrarla o cuestionarla desde mi juicio clínico. |
| `HU-003` | Todos | Distinguir claramente entre información reportada, calculada, inferida y pendiente, para no confundir una inferencia del sistema con un hecho clínico. |
| `HU-004` | Equipo | Registrar observaciones contextuales de una persona, para incorporarlas a su trayectoria y facilitar la continuidad de atención. |
| `HU-005` | Coordinación | Visualizar los casos que requieren revisión, para priorizar seguimiento y escalamiento. |
| `HU-006` | Dirección | Visualizar métricas institucionales agregadas y su evolución temporal, para tomar decisiones de operación y asignación de recursos. |

## 4.2 P1 — Funcionalidades importantes

| ID | Rol | Historia |
| --- | --- | --- |
| `HU-007` | Psicología | Comparar dos momentos de la trayectoria, para identificar cambios relevantes. |
| `HU-008` | Equipo clínico | Registrar y consultar evaluaciones, para mantener la trayectoria actualizada. |
| `HU-009` | Trabajo Social | Registrar información de contexto social, para que el equipo comprenda las barreras y recursos de la persona. Contempla integración del contexto social a la línea temporal y visibilidad según permisos. |
| `HU-010` | Medicina | Consultar la medicación actual y eventos relacionados (inicio, cambio, suspensión, registro), integrados en la trayectoria, para realizar una valoración segura en la atención interdisciplinaria. La versión investigada incluye alertas de interacción e integración con laboratorio cuando estén disponibles. |
| `HU-011` | Psicología | Exportar un reporte visual de progreso, para compartir información útil con la persona atendida. **Prioridad P2 en la investigación original.** |
| `HU-015` | Equipo clínico | Registrar una intervención realizada con una persona, para mantener la trayectoria actualizada y permitir que el equipo conozca qué acciones fueron realizadas, cuándo y por quién. |
| `HU-016` | Equipo clínico | Consultar la evolución de métricas de participación/engagement dentro de una ventana temporal, para comprender patrones de participación y dar contexto al seguimiento. |

## 4.3 P2 — Posteriores

| ID | Rol | Historia |
| --- | --- | --- |
| `HU-012` | Consejería | Recibir una sugerencia contextual de posibles acciones, para contar con ideas de acompañamiento. **Condición:** la sugerencia no debe ser prescriptiva. **Riesgo:** automation bias. |
| `HU-013` | Dirección | Comparar programas considerando diferencias en la composición de los casos, para interpretar las diferencias sin atribuirlas automáticamente a eficacia. |

## 4.4 P3 — Futuro / investigación avanzada

| ID | Rol | Historia |
|---|---|---|
| `HU-014` | Psicología | Explorar cómo cambiaría una inferencia si determinados datos fueran diferentes, para comprender la sensibilidad del modelo. |
| `HU-018` | Usuarios | Indicar si una inferencia fue útil, correcta o incorrecta y agregar un comentario, para contribuir a la mejora del sistema. **Condición:** requiere gobernanza técnica y ética antes de utilizarse para entrenamiento o modificación del modelo. |

> **Nota de identificador (`CORREGIR`).** El dashboard y el deck del paquete recibido documentan una
> "colisión de ID resuelta": `HU-015` habría estado asignado a dos historias distintas y la segunda
> se renumeró a `HU-018`. **En el documento recibido entrante esa colisión no existe**: `HU-015` es
> "registrar intervención" y `HU-018` es "retroalimentar inferencias". La renumeración se conserva,
> pero la narración del incidente se elimina por no ser verificable contra el archivo entregado.

## 4.5 Cobertura de entidades por historia

`PROPUESTA`. No todas las entidades requieren una HU exclusiva: `entidad existente ≠ entidad requiere
historia propia`. Una HU es necesaria cuando existe una **tarea de usuario diferenciada** que deba
descubrirse, probarse y aceptarse de forma independiente.

| Entidad | HU | Rol | Tarea | Cobertura |
| --- | --- | --- | --- | --- |
| `Person` | HU-001 / 005 / 006 | varios | consultar persona / operación | Explícita |
| `TrajectoryEvent` | HU-001 / 007 | Psicología | visualizar / comparar trayectoria | Explícita |
| `Assessment` | HU-008 | Equipo clínico | registrar / consultar evaluación | Explícita |
| `Observation` | HU-004 | Equipo | registrar observación | Explícita |
| `Context` | HU-009 | Trabajo Social | registrar contexto | Explícita |
| `ClinicalEvent` | HU-010 | Medicina | consultar eventos clínicos | Explícita |
| `MedicationEvent` | HU-010 | Medicina | consultar medicación / eventos | Explícita (subtipo) |
| `BehavioralEvent` | HU-001 / 004 | varios | consultar / registrar eventos | Implícita, cubierta por flujos de trayectoria |
| `Intervention` | HU-015 | Equipo clínico | registrar intervención | Explícita, nueva |
| `EngagementMetric` | HU-016 | roles autorizados | consultar métrica | Explícita, nueva |
| `ClinicalInsight` | HU-002 / 003 | varios | interpretar / inspeccionar | Explícita |
| `InsightFoundation` | HU-002 | Psicología | inspeccionar fundamento | Explícita |
| `HumanDecision` | flujo de decisión | roles autorizados | registrar decisión | Explícita en la especificación de interacción |

## 4.6 Cobertura por superficie

| HU | Superficie primaria | Superficie secundaria |
| --- | --- | --- |
| HU-001 | Trajectory View | Person Overview |
| HU-002 | Foundation View | Clinical Insight Card / Evidence Drawer |
| HU-003 | Trajectory View | Insight Card / Event Card |
| HU-004 | Entrada de observación | Trajectory View |
| HU-005 | Vista de coordinación | Casos que requieren atención |
| HU-006 | Analítica institucional | Reportes |
| HU-007 | Vista de comparación | Trajectory View |
| HU-008 | Entrada de evaluación | Trajectory / Foundation |
| HU-009 | Entrada de contexto | Trajectory View |
| HU-010 | Vista médica | Trajectory View |
| HU-015 | Entrada de intervención | Trajectory View |
| HU-016 | Trajectory View | Analítica donde esté autorizado |

> **`ABIERTO-01` (nota de alcance).** Las superficies nombradas arriba (`Trajectory View`,
> `Foundation View`, `Clinical Insight Card`, `Evidence Drawer`, `Comparison View`, `Person Overview`)
> son **superficies definidas por este paquete**, no por el proyecto. El proyecto tiene su propio
> rediseño de interfaz documentado en [docs/17_product_interface_design/README.md](../../docs/17_product_interface_design/README.md) (paradigma
> *detail-first*, cartera → paciente → secciones, `dashboard` descartado explícitamente). La
> reconciliación entre ambas arquitecturas de información **es una decisión de producto abierta**
> (`ABIERTO-01`) y no se resuelve en este manual.

# 5. Criterios transversales, riesgos y trazabilidad

## 5.1 Criterios transversales de aceptación (`CA-01`…`CA-08`)

`CONSERVAR`. Aplican a toda historia que involucre datos o inferencias de SISAP. El documento
recibido los declara explícitamente como base transversal.

| ID | Criterio |
| --- | --- |
| `CA-01` | **Proveniencia.** Toda información debe poder distinguirse como reportada, calculada, inferida o pendiente. |
| `CA-02` | **Incertidumbre.** Las inferencias de IA deben comunicar su incertidumbre de manera comprensible. |
| `CA-03` | **Explicabilidad.** La explicación debe estar alineada con el razonamiento del usuario y no limitarse a terminología técnica de machine learning. |
| `CA-04` | **Mínimo privilegio.** Cada rol accede solamente a la información necesaria para sus funciones. |
| `CA-05` | **Privacidad.** La información individual no debe exponerse innecesariamente a usuarios institucionales. |
| `CA-06` | **Human override.** El usuario debe poder cuestionar o rechazar una inferencia. |
| `CA-07` | **Auditabilidad.** Las acciones relevantes —atender una alerta, disentir de una inferencia— deben poder registrarse. |
| `CA-08` | **Evitar incentivos perversos.** No deben presentarse métricas de desempeño individual que puedan interpretarse como eficacia causal sin la validación correspondiente. |

> `PEND-02`: estos criterios son del paquete recibido; **no** existen como `CA-*` en el corpus del
> proyecto. Deben incorporarse al artefacto de requisitos o mantenerse como criterios editoriales de
> este manual, sin confundirse con requisitos formales.

## 5.2 Matriz de requisitos de interfaz, interpretación y dominio

`CORREGIR` — se completan los requisitos que el documento recibido omitía y se citan por su
identificador real del `SISAP-SRS-001`.

| Grupo | Requisitos citados | Títulos literales (SRS) |
| --- | --- | --- |
| Interpretación | `REQ-INTERP-001`…`004` | Separación · Fuente · Limitaciones · Juicio profesional |
| Interfaz | `REQ-UI-001`…`009` | Identificación del usuario · Navegación · **Validación** · Mensajes de error · Resultados · Alertas · Estado · **Confirmaciones** · No ambigüedad |
| Longitudinal | `REQ-LONG-001`…`006` | Historial · Orden temporal · Comparación · Evolución · Versiones · Datos incompatibles |
| NLP | `REQ-NLP-001`…`005` | Procesamiento · Estado del procesamiento · Trazabilidad · Naturaleza del resultado · Fallos |
| Scoring | `REQ-CLIN-001`…`008` | Cálculo de escalas · Ítems invertidos · Ítems faltantes · Rangos de puntuación · Trazabilidad · Reproducibilidad · Variables compuestas · Reglas clínicas |
| Alertas | `REQ-ALERT-001`…`007` | Generación · Identificación · Criterio · Estado · Trazabilidad · Interpretación · Fallo de generación |

**Adiciones de esta revisión:** `REQ-UI-003` (Validación) y `REQ-UI-008` (Confirmaciones) — omitidos
por el documento recibido y directamente pertinentes a la UX; `REQ-CLIN-007` y `REQ-CLIN-008` — el
documento citaba solo `001`–`006`.

## 5.3 Riesgos UX (los del documento recibido)

`CONSERVAR`. Son riesgos **de uso**, distintos de los `RISK-*` del RMF del proyecto.

| Riesgo | Roles especialmente relevantes | Implicación UX |
| --- | --- | --- |
| Automation bias | Consejería, Psicología, Dirección | Mostrar evidencia y límites |
| Alert fatigue | Enfermería, Psicología, Consejería | Priorizar señales |
| Anchoring | Psicología, Consejería | Mostrar datos antes de la interpretación |
| Atribución causal indebida | Dirección, Coordinación | Mostrar contexto y limitaciones |
| Falsa precisión | Todos | Comunicar incertidumbre |
| Reidentificación | Dirección | Agregación y supresión de grupos pequeños |
| Incentivos perversos | Coordinación | Evitar rankings individuales |

## 5.4 Vista UX del RMF del proyecto (`CORREGIR` — completa, 16 escenarios)

Esta tabla es una **vista UX** del `SISAP-RMF-001`, no un reemplazo del registro formal de riesgos.

| Riesgo | Título literal del RMF | Control UX relevante |
| --- | --- | --- |
| `RISK-001` | Clasificación incorrecta del perfil | evidencia + revisión profesional + límites |
| `RISK-002` | Falso negativo de alerta | no presentar ausencia de alerta como ausencia de riesgo |
| `RISK-003` | Falso positivo de alerta | contexto + fundamento + revisión |
| `RISK-004` | Error de scoring | fuente + trazabilidad + estado de cálculo |
| `RISK-005` | Error de normalización | *(sin control UX relevante — control de arquitectura/datos)* |
| `RISK-006` | Modelo incompatible | versión/configuración + estado de validez |
| `RISK-007` | Modelo corrupto o alterado | integridad/versionado en Foundation |
| `RISK-008` | Error de persistencia | *(sin control UX relevante — control de datos)* |
| `RISK-009` | Acceso no autorizado | RBAC + mínimo privilegio |
| `RISK-010` | Resultado obsoleto presentado como actual | timestamp + estado + versión |
| `RISK-011` | Error longitudinal | compatibilidad temporal/definicional |
| `RISK-012` | Resultado NLP incorrecto | resultado analítico, fuente, estado y limitaciones |
| `RISK-013` | Umbral configurado incorrectamente | no mostrar umbral como verdad clínica |
| `RISK-014` | Fallo de alerta | estado explícito + auditabilidad |
| `RISK-015` | Falla de interfaz que induce interpretación incorrecta | gramática de evidencia + lenguaje no diagnóstico |
| `RISK-016` | SOUP produce comportamiento inesperado | *(sin control UX relevante — control de SOUP)* |

**Regla crítica (`CONSERVAR`).** La interfaz **no puede "resolver" un riesgo técnico** que requiere un
control de arquitectura, modelo, configuración o proceso. Ejemplo: `RISK-006` no se controla
únicamente mostrando `model_version`; requiere el control técnico de compatibilidad definido por
MMP/SAD/SRS, y la UI únicamente representa el estado resultante de forma trazable.

## 5.5 Cadena de trazabilidad del sistema

`CONSERVAR`:

```text
INTENDED USE → CLAIM / FUNCTION → USER NEED → USER STORY → REQUIREMENT → RISK
            → RISK CONTROL → UX COMPONENT → IMPLEMENTATION → VERIFICATION
            → VALIDATION → EVIDENCE
```

**Regla (`CONSERVAR`).** Ningún componente clínicamente significativo pasa a baseline sólo porque
exista un mockup funcional: debe existir trazabilidad suficiente hasta requisito, riesgo, control y
evidencia de V&V.

## 5.6 Verification vs Validation

`CONSERVAR`. La matriz distingue dos preguntas:

- **Verification** — *¿construimos el sistema conforme al requisito?* Ejemplos: ¿el resultado tiene
  provenance? · ¿la fuente puede recuperarse? · ¿se bloquea una comparación incompatible? · ¿el
  permiso realmente restringe el dato? · ¿un fallo NLP evita presentar un resultado?
- **Validation** — *¿el sistema, usado por la población prevista, permite realizar la tarea de manera
  segura y comprensible?* Ejemplos: ¿el psicólogo distingue dato de inferencia? · ¿comprende la
  incertidumbre? · ¿evita interpretar coincidencia temporal como causalidad? · ¿puede discrepar del
  insight? · ¿cada rol recibe información suficiente sin exposición innecesaria?

**Una prueba técnica satisfactoria no sustituye validación de uso.**

## 5.7 Evidence Package esperado por componente

`CONSERVAR`. Para cada componente clínicamente significativo debe poder recuperarse: 1) requisito ·
2) riesgo · 3) control de riesgo · 4) especificación UX · 5) referencia de diseño/implementación ·
6) prueba de verificación · 7) protocolo de validación · 8) resultado de validación ·
9) defectos/desviaciones · 10) registro de aprobación/revisión. Cuando aplique: 11) versión del modelo
· 12) configuración · 13) esquema de entrada · 14) preprocesamiento · 15) normalización ·
16) referencia de dataset/procedencia · 17) referencia de evaluación regulatoria.

---

# 6. Ontología y contratos

## 6.1 Ontología mínima de trayectoria

`CONSERVAR`:

```text
TRAJECTORY
├── ASSESSMENT
├── CLINICAL_EVENT
├── BEHAVIORAL_EVENT
├── CONTEXT
├── INTERVENTION
└── INTERPRETATION
```

Las entidades **no** deben entenderse como categorías visuales obligatorias. Son una estructura
semántica para que producto, UX, datos y ML compartan lenguaje.

**Correspondencia entidades ↔ interpretación (`CONSERVAR`, `CORREGIR` #2):**

```text
Trajectory ├─ Assessment ├─ Observation ├─ ClinicalEvent ├─ BehavioralEvent
           ├─ Context ├─ Intervention └─ EngagementMetric
                    ↓ interpretación
             ClinicalInsight → InsightFoundation → HumanDecision
```

> **Atribución corregida.** El documento recibido atribuía esta separación a *"la v0.2 del Data
> Dictionary"*. Ese documento **está Planificado y no existe**. Las reglas que siguen se conservan
> como **reglas de este manual**:
>
> 1. `BehavioralEvent` no debe traducirse automáticamente a estados psicológicos.
> 2. `Intervention` no demuestra eficacia, causalidad, respuesta ni mejoría.
> 3. `EngagementMetric` no equivale a motivación, adherencia, respuesta al tratamiento ni mejoría clínica.
> 4. Una ventana temporal debe acompañar a toda métrica agregada.
> 5. La proximidad temporal no debe presentarse como causalidad.
> 6. Cuando el sistema diga "podría significar X", la salida pertenece a `ClinicalInsight`, no a la entidad base.
> 7. La procedencia debe conservarse al atravesar la capa de presentación.

| ID | Regla de entidad | Estado |
| --- | --- | --- |
| `ONT-01` | `Person` representa a la persona registrada. **No** representa su estado clínico completo ni su trayectoria. | `CONSERVAR` |
| `ONT-02` | `Trajectory` es entidad conceptual de primer nivel: conecta eventos, evidencia, contexto, interpretación y decisiones a través del tiempo. | `CONSERVAR` |
| `ONT-03` | `TrajectoryEvent` es la abstracción temporal transversal. Debe conservar: `occurred_at` o precisión temporal, `source`, `author` cuando aplique, `role`, `provenance`, `visibility`, `audit_metadata`. | `CONSERVAR` |
| `ONT-04` | `Assessment` es evaluación estructurada administrada mediante un instrumento definido. **Una puntuación no equivale automáticamente a una interpretación clínica.** | `CONSERVAR` |
| `ONT-05` | `Observation` es registro de algo observado, referido o documentado. **No equivale a diagnóstico ni a inferencia.** | `CONSERVAR` |
| `ONT-06` | `Context` es información contextual relevante para interpretar la trayectoria. **No equivale automáticamente a riesgo.** | `CONSERVAR` |
| `ONT-07` | `ClinicalEvent` es evento clínico documentado. **No debe transformarse automáticamente en causalidad ni interpretación.** Ejemplo: *"Consulta médica registrada"* no implica *"Existe deterioro clínico"*. | `CONSERVAR` |
| `ONT-08` | `BehavioralEvent` es evento de comportamiento, participación o interacción con la atención. **No debe traducirse automáticamente en motivación, adherencia o estado psicológico.** Regla crítica: `missed_session` ≠ `low motivation` ≠ `treatment resistance` ≠ `high risk`. | `CONSERVAR` |
| `ONT-09` | `Intervention` es acción de atención registrada. **No demuestra por sí sola eficacia, respuesta, mejoría ni causalidad.** | `CONSERVAR` |
| `ONT-10` | `EngagementMetric` es medida calculada de participación/actividad, definida por una **ventana temporal**. No equivale automáticamente a motivación, adherencia, respuesta terapéutica ni mejoría clínica. | `CONSERVAR` |
| `ONT-11` | `MLResult` **no equivale a `ClinicalInsight`**. La relación correcta es `MLResult → processing/interpretation → ClinicalInsight`. Un `latent_representation`, `cluster` o `reconstruction_error` **no adquiere significado clínico por el solo hecho de existir**. | `CONSERVAR` |
| `ONT-12` | `ClinicalInsight` **no equivale a** dato observado, diagnóstico, recomendación prescriptiva, decisión humana ni score global de riesgo. `InsightFoundation` es la estructura auditable que explica de qué evidencia, contexto, método y configuración procede. | `CONSERVAR` |

**Subtipos y categorías conservados** (`CONSERVAR`): `ClinicalEvent` → `consultation, admission,
discharge, hospitalization, emergency_event, medication_event, medical_event, other`;
`BehavioralEvent` → `attendance, engagement, participation, appointment_change, missed_session,
other`; `Observation.type` → `clinical, behavioral, patient_report, contextual, operational, other`;
`Context.category` → `housing, employment, education, family, social_support, financial, legal,
environment, treatment_access, other`; `Intervention.type` → `psychological, medical, nursing,
social, educational, peer_support, other`.

**Instrumentos contemplados** (`CONSERVAR`): GAD-7, BIS-11, STAXI-2, BADS, BSL-23, EROS. **La lista
no es un catálogo definitivo.**

## 6.2 Dominio `PROV-` — Provenance y Source

| ID | Regla | Estado |
| --- | --- | --- |
| `PROV-01` | **Source = de dónde salió la información. Provenance = qué naturaleza tiene o cómo fue producida.** Son distintos y no se sustituyen. | `CONSERVAR` |
| `PROV-02` | `Provenance` conserva: `type`, `source`, `source_id`, `generated_by`, `generated_at`, `model_version`. Tipos: `reported`, `calculated`, `inferred`, `pending`. | `CONSERVAR` |
| `PROV-03` | `Source` conserva: `source_type`, `source_id`, `system`, `captured_at`, `metadata`. Ejemplos: `clinical_note`, `assessment_form`, `patient_report`, `staff_entry`, `imported_record`, `system_calculation`, `model_inference`. | `CONSERVAR` |
| `PROV-04` | **Sistema de provenance congelado.** No se amplía mediante `disputed`, `superseded`, `uncertain`, `loading` o `error`: esos son estados de dominio o de interacción (ver `EST-`). | `CONSERVAR` |
| `PROV-05` | Representación de producto: `Reportado`, `Calculado`, `Inferido`, `Pendiente`. La **etiqueta de texto es la fuente de verdad**; el glifo es un ancla semántica. | `CONSERVAR` |
| `PROV-06` | Una medida técnica de incertidumbre **no debe recibir automáticamente el chip `Calculado`** como si fuera un hecho clínico calculado. La UI debe distinguir `provenance clínico` de `metadata / propiedad técnica del modelo`. | `CONSERVAR` |
| `PROV-07` | **Vocabulario pendiente (`ABIERTO-02`).** El paquete recibido usa **dos** familias de etiquetas para el mismo eje: `HECHO / INFERENCIA / HIPÓTESIS / PENDIENTE` (dashboard institucional) y `Reportado / Calculado / Inferido / Pendiente` (provenance). El dashboard las mapea hoy como `HECHO→Reportado`, `HIPÓTESIS→Calculado`, `INFERENCIA→Inferido`, `PENDIENTE→Pendiente`, pero **ese mapeo no está documentado**. Decisión del propietario: mantener ambas con mapeo explícito, o unificar. Mientras no se resuelva, este manual usa **la familia de provenance**. | `ABIERTO-02` |

## 6.3 Dominio `TEMP-` — Contrato temporal

| ID | Regla | Estado |
| --- | --- | --- |
| `TEMP-01` | Precisión temporal conservada: `exact_datetime`, `date`, `week`, `period`, `approximate`, `unknown`. **SISAP no debe inventar precisión temporal.** | `CONSERVAR` |
| `TEMP-02` | **Precision preservation.** `input temporal precision = display temporal precision`, o una representación menos precisa; **nunca** una precisión inventada. Si la precisión es desconocida: *"Fecha: desconocida"*, no una fecha concreta por conveniencia visual. | `CONSERVAR` |
| `TEMP-03` | No ordenar artificialmente eventos con precisión desconocida como si tuvieran timestamp exacto. | `CONSERVAR` |
| `TEMP-04` | **Proximidad temporal no implica causalidad.** `A ocurrió antes que B` no implica `A causó B`. | `CONSERVAR` |
| `TEMP-05` | **Ventana de medición.** Una métrica agregada conserva su ventana: `attendance_rate = 75% · ventana: últimas 4 semanas`. Una métrica sin ventana puede interpretarse erróneamente como estado instantáneo. | `CONSERVAR` |
| `TEMP-06` | **Version awareness.** Si una comparación involucra diferentes versiones de software, configuración, instrumento o modelo, y esto afecta la comparabilidad, la interfaz debe hacerlo visible. Implementa conceptualmente `REQ-LONG-001`…`REQ-LONG-006`. | `CONSERVAR` |

## 6.4 Dominio `INT-` — Contrato de interpretación (`ClinicalInsight`)

| ID | Regla | Estado |
| --- | --- | --- |
| `INT-01` | Todo `ClinicalInsight` debe poder responder: **WHAT** (qué observamos) · **FROM WHAT** (de qué evidencia proviene) · **HOW** (cómo lo interpreta/procesa SISAP) · **WHEN** (en qué ventana temporal) · **LIMITATIONS** (qué limita la interpretación) · **UNCERTAINTY** (qué incertidumbre es relevante) · **WHO DECIDES** (quién decide) · **WHAT HAPPENED NEXT** (qué ocurrió después). | `CONSERVAR` |
| `INT-02` | El insight debe permanecer **vinculado a evidencia**; las limitaciones deben poder comunicarse cuando existan; la necesidad de interpretación profesional debe ser explícita; el lenguaje **no** debe transformar un resultado computacional en diagnóstico autónomo. | `CONSERVAR` |
| `INT-03` | **Contrato de la afirmación (`statement`)** — `S-001` Descriptivo antes que categórico: preferir *"Se observa…", "La información disponible sugiere…", "SISAP identifica una posible asociación…"*; evitar *"SISAP sabe…", "La IA concluye…", "La persona es…", "El sistema diagnostica…"*. | `CONSERVAR` |
| `INT-04` | **`S-002` Alcance explícito:** la afirmación debe estar vinculada a una ventana temporal cuando la interpretación dependa de ella. | `CONSERVAR` |
| `INT-05` | **`S-003` No sobreinterpretación:** el statement no debe convertir una medición en una conclusión clínica no sustentada. | `CONSERVAR` |
| `INT-06` | **`S-004` No causalidad implícita:** no usar construcciones que impliquen `A ocurrió → por lo tanto B fue causado por A` sin evidencia metodológica específica. | `CONSERVAR` |
| `INT-07` | **`S-005` No recomendación encubierta:** evitar statements que escondan una prescripción (*"Debe aumentar sesiones"*, *"Debe cambiar tratamiento"*, *"Debe intervenir inmediatamente"*). La decisión pertenece al profesional. | `CONSERVAR` |
| `INT-08` | **Tipos de interpretación congelados:** `change`, `trend`, `association`, `inconsistency`, `insufficient_information`, `insight`. Regla: no todo `change` → `insight`, ni `insight` → `recommendation`. | `CONSERVAR` |
| `INT-09` | **Contrato de evidencia:** la evidencia se organiza en `PRIMARY` (Assessment, Observation, ClinicalEvent, BehavioralEvent, Context, Intervention) → `DERIVED` (score, rate, change, trend metric, aggregation) → `INTERPRETATION` (ClinicalInsight). **La interpretación no debe aparecer como si fuera una fuente primaria.** Relaciones posibles: `supports`, `derived_from`, `occurred_near`, `references`, `contradicts`, `updates`, `part_of`. Regla: `occurred_near` no debe representarse visualmente como `caused_by`. | `CONSERVAR` |

## 6.5 Dominio `FND-` — Fundamento (`InsightFoundation` / Foundation View)

| ID | Regla | Estado |
| --- | --- | --- |
| `FND-01` | Foundation responde: *¿cómo produjo SISAP esta interpretación?* Estructura: `WHAT` · `FROM WHAT` · `HOW` · `MODEL` · `WHEN` · `LIMITATIONS` · `UNCERTAINTY` · `STATUS` · `SCOPE`. | `CONSERVAR` |
| `FND-02` | Campos recuperables: `insight_id`, `statement`, `time_window`, `evidence[]`, `context[]`, `processing_method`, `model_or_rule`, `model_version`, `configuration`, `input_window`, `limitations[]`, `uncertainty`, `provenance`, `domain_status`, `generated_at`, `relationships`, `audit_metadata`. | `CONSERVAR` |
| `FND-03` | **Foundation no es una consola de ingeniería.** Debe explicar suficientemente el proceso para auditoría y juicio profesional **sin** convertir la interfaz clínica en un panel de parámetros de ML. | `CONSERVAR` |
| `FND-04` | **Prohibiciones de representación automática:** no presentar `0.68 confidence`, `87% certainty`, `high risk` ni `diagnostic probability` si no existe definición estadística y validación que autoricen exactamente esa representación. | `CONSERVAR` |
| `FND-05` | Foundation **pertenece a la identidad de transparencia** de SISAP: debe percibirse como referencia y trazabilidad, **no** como una segunda afirmación clínica ni como decoración técnica. Visualmente permanece **más neutro** que el resumen del insight. | `CONSERVAR` |

## 6.6 Dominio `DEC-` — Decisión humana

| ID | Regla | Estado |
| --- | --- | --- |
| `DEC-01` | Taxonomía de trabajo: `agrees`, `disagrees`, `modifies`, `defers`, `no_action`. | `CONSERVAR` |
| `DEC-02` | Una `HumanDecision` **no reescribe** el insight original, **no cambia automáticamente** su provenance, **no altera automáticamente** el modelo, **no inicia entrenamiento** y **no modifica** el Model Registry. | `CONSERVAR` |
| `DEC-03` | UX: **no** usar como acción primaria `[Aceptar recomendación de IA]`. Preferir `[Registrar decisión]` y después `Estoy de acuerdo` · `No estoy de acuerdo` · `Modificar interpretación` · `Aplazar decisión` · `Sin acción`. El sistema registra la decisión humana **sin convertirla en aprobación automática del modelo**. | `CONSERVAR` |
| `DEC-04` | La decisión humana tiene identidad visual y verbal propia y se distingue inequívocamente de una inferencia, una alerta, un estado del sistema y una recomendación automática: `SISAP → interpreta/muestra` · `HUMANO → valora/decide/documenta`. **No presentar como patrón obligatorio** `SISAP recomendó → profesional aceptó`. | `CONSERVAR` |
| `DEC-05` | El sistema debe permitir registrar una decisión humana **sin que exista un `ClinicalInsight`**, siempre que la tarea y el permiso estén formalmente definidos. No imponer `AI insight → human action` como única ruta legítima: la decisión puede derivar directamente de evidencia clínica o documental. | `CONSERVAR` |
| `DEC-06` | El desacuerdo humano **no se representa como "error del usuario"** ni reescribe retroactivamente el insight: se conserva la distinción entre interpretación original del sistema, desacuerdo o modificación humana, y decisión posterior. | `CONSERVAR` |
| `DEC-07` | **Aislamiento del desacuerdo respecto de ML (`GOB-01` operacionalizado).** Flujo permitido: `ClinicalInsight → HumanDecision → Feedback/Audit Store → Governance Review → Eligibility criteria → Curated training dataset → Approved training pipeline → Model training → Validation → Model approval → Deployment`. El desacuerdo solo se convierte en señal de aprendizaje tras revisión y curación explícitas. | `CONSERVAR` |

## 6.7 Dominio `EST-` — Separación formal de estados

`CONSERVAR`. El manual adopta tres capas independientes más una dimensión transversal, que **no deben
mezclarse**:

```text
PROVENANCE       ¿qué tipo de información es y cómo se obtuvo?
DOMAIN STATUS    ¿cuál es el estado del objeto dentro del dominio?
INTERACTION STATE ¿cómo se encuentra la interfaz respecto de ese objeto?
UNCERTAINTY      ¿qué limitación o variabilidad afecta a la interpretación?  (transversal)
```

| ID | Regla | Estado |
| --- | --- | --- |
| `EST-01` | **Provenance (congelado):** `reported / calculated / inferred / pending`. No se amplía con `disputed`, `superseded`, `uncertain`, `loading` ni `error`. | `CONSERVAR` |
| `EST-02` | **Domain status:** `active`, `disputed`, `superseded`, `pending`. No son provenance. Ejemplo válido: `provenance = inferred` + `domain_status = disputed` = *la interpretación fue generada como inferencia y posteriormente un usuario autorizado registró desacuerdo*. | `CONSERVAR` |
| `EST-03` | **Interaction state:** `default`, `expanded`, `loading`, `error`, `permission_limited`. `expanded` es estado de interfaz; `loading`/`error` describen el proceso; `permission_limited` describe la disponibilidad para el usuario actual, **no** el contenido subyacente. | `CONSERVAR` |
| `EST-04` | `uncertain` **no es un cuarto tipo de provenance ni un estado de interacción mezclado**: es un *presentation modifier* cuya fuente semántica es el objeto `Uncertainty`. Conceptual: `ClinicalInsight ├ provenance ├ domain_status ├ uncertainty ├ permissions └ interaction_state`. **No** `ClinicalInsight.status = uncertain` como sustituto del modelo de incertidumbre. | `CONSERVAR` |
| `EST-05` | **Un componente no debe inferir el provenance a partir de su interaction state.** La matriz de combinaciones (§6.8) es una combinación de estados, no una nueva taxonomía. | `CONSERVAR` |

## 6.8 Matriz Provenance × Domain Status × Interaction State

`CONSERVAR`:

| Provenance | Domain status | Interaction state | Interpretación |
| --- | --- | --- | --- |
| Reportado | Active | Default | Dato reportado disponible |
| Reportado | Disputed | Default | El dato existe, con desacuerdo registrado sobre su contenido/uso |
| Calculado | Active | Expanded | Resultado calculado consultado en detalle |
| Inferido | Active | Default | Insight disponible |
| Inferido | Disputed | Expanded | Insight inferido con desacuerdo humano registrado |
| Inferido | Superseded | Default | Insight anterior reemplazado; permanece auditable |
| Pending | Pending | Loading | Información/proceso pendiente |
| Inferido | Active | Error | No se pudo recuperar/renderizar correctamente la representación |
| Cualquiera | Cualquiera | Permission-limited | El usuario no puede acceder a parte del contenido |

## 6.9 Dominio `RBAC-` — Autorización × profundidad de presentación

| ID | Regla | Estado |
| --- | --- | --- |
| `RBAC-01` | Secuencia oficial: `AUTHORIZATION → ALLOWED DATA → PRESENTATION DEPTH → COMPONENT`. Nunca `COMPONENT → DISCLOSURE → PRIVILEGE`. | `CONSERVAR` |
| `RBAC-02` | Matriz canónica rol × acceso × profundidad × Foundation × restricción principal: Consejería *pertinente / compact / Foundation no o limitado / no exponer complejidad técnica innecesaria* · Psicología *clínicamente pertinente / clinical / sí / contrastar evidencia y contexto* · Medicina *clínicamente pertinente / clinical / sí según pertinencia / priorizar información médica relevante* · Enfermería *pertinente / compact-clinical según caso / según necesidad / evitar alert fatigue* · Trabajo Social *contextual-pertinente / contextual / según necesidad / no convertir contexto en riesgo* · Coordinación *resumen / summary / limitado / no exposición innecesaria de datos individuales* · Dirección *agregado / aggregate / no / no exposición individual identificable*. | `CONSERVAR` |
| `RBAC-03` | Si una tabla de roles y una de profundidad difieren, se abre decisión de gobernanza y se establece versión canónica (**no** se resuelve por interpretación del diseñador). | `CONSERVAR` |
| `RBAC-04` | `permission_limited` no cambia provenance ni domain status, y **no revela indirectamente la existencia de datos restringidos** si hacerlo constituye exposición no autorizada. | `CONSERVAR` |

## 6.10 Dominio `ALR-` — Señal, alerta e insight (`CORREGIR` #3)

```text
SIGNAL   Cambio o patrón que puede merecer revisión.
INSIGHT  Interpretación explícita de evidencia.
ALERT    Mecanismo operacional para llamar la atención sobre una condición definida.
```

| ID | Regla | Estado |
| --- | --- | --- |
| `ALR-01` | `Signal ≠ Insight ≠ Alert`. **No todo** `Signal → Alert` ni `Insight → Alert` automáticamente. La conversión a alerta requiere especificación de umbral/condición, análisis de riesgo y validación. | `CONSERVAR` |
| `ALR-02` | **Lo que ya está especificado en `SISAP-SRS-001`** (`CORREGIR`): `REQ-ALERT-001` Generación — *el sistema deberá generar una alerta cuando se cumplan los criterios definidos para dicha alerta* · `REQ-ALERT-002` Identificación — *cada alerta deberá tener un tipo identificable* · `REQ-ALERT-003` Criterio — *el criterio que originó la alerta deberá poder identificarse* · `REQ-ALERT-004` Estado · `REQ-ALERT-005` Trazabilidad · `REQ-ALERT-006` Interpretación — *las alertas deberán presentarse como apoyo a la evaluación* · `REQ-ALERT-007` Fallo de generación. Y `REQ-UI-006` — *las alertas deberán ser claramente distinguibles y mostrar la información necesaria para su interpretación*. | `CORREGIR` |
| `ALR-03` | **Lo que sigue abierto (`PEND-03`):** el **criterio clínico** de disparo y el umbral. `REQ-ALERT-001` remite a *"los criterios definidos"* y `RISK-013` es *"Umbral configurado incorrectamente"*. Hasta que existan: condición explícita, finalidad, población/ámbito, umbral, control de riesgo, estrategia ante falsos positivos y negativos, comportamiento ante indisponibilidad, validación de usuario y trazabilidad, **el sistema de alertas permanece fuera de baseline clínica definitiva**. | `PENDIENTE` |
| `ALR-04` | El **Gate** se aplica al criterio clínico, **no** al requisito: marcar `REQ-UI-006` como *BLOCKED* era incorrecto; el requisito existe. Lo que se bloquea es la implementación clínica de alertas con umbral no validado. | `CORREGIR` |
| `ALR-05` | **Prominencia y anti-fatiga.** Debe evitarse el tratamiento de alerta por color de semáforo: *"no presentar ausencia de alerta como ausencia de riesgo"* (`RISK-002`) y *"no mostrar umbral como verdad clínica"* (`RISK-013`). | `CONSERVAR` |
| `ALR-06` | Ningún fallo de generación de alerta puede quedar silencioso: `REQ-ALERT-007` + `RISK-014` exigen estado explícito y auditabilidad. | `CONSERVAR` |
| `ALR-07` | La interfaz de alertas **no** introduce una semántica clínica no definida: si el umbral es un valor configurado, se muestra como configuración con su ventana y su fuente, no como conclusión. | `CONSERVAR` |

## 6.11 Dominio `NLP-` — Contrato de NLP

`CONSERVAR`. Flujo: `text → processing state → NLP result → analytic interpretation`. Estados
mínimos: `not_processed`, `processed`, `processing_failed`, `result_unavailable`.

| ID | Regla | Estado |
| --- | --- | --- |
| `NLP-01` | El resultado debe conservar método, versión, configuración relevante, asociación con el texto/fuente y estado. | `CONSERVAR` |
| `NLP-02` | **Un fallo no puede producir un resultado presentado como válido.** | `CONSERVAR` |
| `NLP-03` | La trazabilidad de método/versión/configuración debe ser recuperable. | `CONSERVAR` |
| `NLP-04` | El NLP se presenta como **información analítica de apoyo**, nunca como diagnóstico autónomo. | `CONSERVAR` |
| `NLP-05` | Implementa conceptualmente `REQ-NLP-001`…`REQ-NLP-005`. | `CONSERVAR` |

## 6.12 Dominio `SCR-` — Contrato de scoring psicométrico

`CONSERVAR`. Flujo: `responses → scoring rules → missing-item policy → score → range validation →
traceability`.

| ID | Regla | Estado |
| --- | --- | --- |
| `SCR-01` | Debe ser posible identificar **qué respuestas originaron una puntuación**. Implementa `REQ-CLIN-005`. | `CONSERVAR` |
| `SCR-02` | La puntuación sigue siendo un **resultado calculado**; su interpretación clínica requiere el contexto correspondiente. Un score **no** se convierte automáticamente en diagnóstico, riesgo, estado global ni recomendación. | `CONSERVAR` |
| `SCR-03` | Cobertura: `REQ-CLIN-001`…`REQ-CLIN-008` (el documento recibido citaba solo 001–006). | `CORREGIR` |

## 6.13 Dominio `MOD-` — Contrato de modelo

| ID | Regla | Estado |
| --- | --- | --- |
| `MOD-01` | **Unidad auditable de modelo:** `MODEL + INPUT SCHEMA + PREPROCESSING + NORMALIZATION + CONFIGURATION + RUNTIME`. Un modelo no es un artefacto aislado. | `CONSERVAR` |
| `MOD-02` | `MLResult` mínimo: `model_id`, `model_version`, `output`, `uncertainty`, `status`, `traceability`. **Verificado textualmente** contra `Model_Management_Plan.md` L1269 (`prediction`, `latent_representation`, `cluster`, `reconstruction_error` entre sus campos). Campos adicionales pueden existir según el modelo. | `CONSERVAR` |
| `MOD-03` | **Prohibición:** ningún campo técnico adquiere semántica clínica por defecto. `latent_representation`, `cluster`, `reconstruction_error` y la incertidumbre técnica **no** se convierten automáticamente en estado clínico, severidad, diagnóstico, probabilidad clínica ni categoría de riesgo. | `CONSERVAR` |
| `MOD-04` | **Fallo, indisponibilidad y fuera de dominio.** Estados explícitos: `MODEL ERROR → no valid prediction` · `MODEL NOT AVAILABLE → no valid current model output` · `OUT OF VALIDATED DOMAIN → domain limitation` · `HIGH UNCERTAINTY → comportamiento definido por la especificación del modelo`. **No reutilizar silenciosamente la última predicción como resultado actual.** | `CONSERVAR` |
| `MOD-05` | Cuando la inferencia dependa materialmente de ellos, el fundamento auditable debe poder recuperar o referenciar modelo, versión, configuración, preprocesamiento, normalización, ventana de entrada y método de procesamiento. La UI no tiene que mostrarlos todos en primera instancia, pero debe permitir su trazabilidad por revelación progresiva. | `CONSERVAR` |

## 6.14 Dominio `UNC-` — Contrato de incertidumbre

| ID | Regla | Estado |
| --- | --- | --- |
| `UNC-01` | **Lo que sí se congela:** `Uncertainty ├ type ├ value ├ interpretation ├ method └ limitations`. Tipos conceptuales: `data_uncertainty`, `model_uncertainty`, `temporal_uncertainty`, `measurement_uncertainty`, `interpretive_uncertainty`. | `CONSERVAR` |
| `UNC-02` | **Lo que NO se congela todavía:** una escala universal, un umbral universal, una traducción clínica universal, un número de "confidence", ni una probabilidad clínica derivada de incertidumbre técnica. **El contrato de datos está congelado; su semántica estadística y su representación clínica permanecen model-specific y deben validarse.** | `CONSERVAR` |
| `UNC-03` | **Identificar un tipo de incertidumbre no equivale a tener una medida de incertidumbre clínicamente validada.** Mientras no exista una medida por dimensión validada externamente: no usar "confianza" como resultado clínico; no mostrar "confianza del diagnóstico"; no representar una medida técnica como probabilidad o evidencia clínica; no convertir automáticamente una medida de estabilidad del modelo en indicador de gravedad, riesgo o diagnóstico; no asignar etiqueta clínica a una medida cuya interpretación clínica no haya sido validada. **La interfaz no inventará una escala universal de incertidumbre.** | `CONSERVAR` |

## 6.15 Dominio `GOB-` — Gobernanza de IA y de datos

| ID | Regla | Estado |
| --- | --- | --- |
| `GOB-01` | **`REQ-ML-GOV-001` — Aislamiento del desacuerdo humano.** Cuando un usuario registra desacuerdo con un `ClinicalInsight`: (1) el evento queda registrado; (2) se conserva el insight original; (3) no se modifica automáticamente el dataset de entrenamiento; (4) no se inicia entrenamiento automáticamente; (5) no cambia automáticamente la versión desplegada; (6) cualquier uso posterior para aprendizaje es trazable. **Criterio de prueba:** dado `HumanDecision.decision_type = disagrees`, se espera `audit_event = created`, `training_dataset = unchanged`, `training_job = not_started`, `deployed_model = unchanged`. | `CONSERVAR` |
| `GOB-02` | `Source-of-Truth Policy`: este manual es fuente única de verdad para principios UX, arquitectura conceptual de interacción, ontología UX, reglas epistemológicas, representación de evidencia, `Clinical Insight`, interacción humano-IA y restricciones de presentación. **No sustituye** MMP, SAD, Risk Management, Regulatory Assessment, Data Protection, Validation Protocols ni evidencia V&V. Cuando una regla especializada exista fuera: `Manual → referencia explícita → documento normativo especializado`. **No debe copiarse parcialmente de forma que pueda divergir.** | `CONSERVAR` |
| `GOB-03` | **Fuente de verdad por responsabilidad:** Brand & Design System define cómo se ve, cómo suena y cómo se etiqueta; este Manual define cuándo aparece, qué contiene, interacción, roles, estados y decisiones; el Data Dictionary define entidades, campos y semántica (`PEND-06`: planificado); Model Governance define generación, versionado, validación y límites; SRS/Risk/V&V definen requisitos, riesgos, controles, verificación y validación. **Ningún documento debe apropiarse silenciosamente de la responsabilidad de otro.** | `CONSERVAR` |
| `GOB-04` | **Regulatory Traceability Bridge.** La clasificación regulatoria **no se asume** por el hecho de operar en salud: se determina por la finalidad prevista, funciones y claims del producto, mediante el proceso regulatorio correspondiente. Cadena: `Uso previsto → Claim/función → Necesidad clínica → Requisito → Riesgo → Control de diseño → Implementación → Verificación → Validación → Evidencia`. **Ningún componente clínico pasa a baseline de implementación si una función relevante para seguridad o interpretación carece de trazabilidad suficiente.** | `CONSERVAR` |

## 6.16 `PEND-` — Huecos abiertos con dueño

| ID | Hueco | Dueño | Estado |
| --- | --- | --- | --- |
| `PEND-01` | Las 18 HU no existen en el corpus del proyecto | Producto / requisitos | Abierto |
| `PEND-02` | `AC-*`, `HYP-*`, `TEST-INS/TRJ/AUD-*`, `PR-HU*` no existen en el corpus ni en V&V | V&V / gobernanza | Abierto |
| `PEND-03` | Criterio clínico y umbral de alertas | Clínico + RMF | Abierto |
| `PEND-04` | RCI / banda de cambio clínicamente significativo | Clínico + MMP | Abierto |
| `PEND-05` | `G_H_I_Validation_Matrix_Blueprint.md` no localizado | Validación | Abierto |
| `PEND-06` | Data Dictionary planificado, no escrito | Datos | Abierto |

# 7. Superficie `Trajectory View`

## 7.1 Propósito y alcance

`CONSERVAR`. Convierte `Trajectory View` de arquitectura conceptual en **especificación UX testeable**.

**No define todavía:** diseño visual final · componentes de una librería concreta · valores clínicos
reales · umbrales clínicos · estados clínicos por color · recomendaciones automáticas · alertas
clínicas definitivas.

**Sí define:** anatomía funcional · jerarquía de información · componentes · bindings conceptuales
con el modelo de datos · estados · reglas temporales · variantes por rol · accesibilidad · estados de
fallo · casos de verificación · hipótesis de validación.

**Pregunta primaria:** *¿Qué cambió, qué evidencia existe, qué contexto lo rodea, qué interpreta
SISAP y qué decidió el profesional?*

**Preguntas secundarias:** ¿qué ocurrió? · ¿cuándo ocurrió? · ¿qué tan precisa es la fecha? · ¿de
dónde proviene? · ¿es dato observado, calculado o inferido? · ¿qué cambió respecto a otro momento? ·
¿la comparación es válida? · ¿qué contexto estaba presente? · ¿qué interpreta SISAP? · ¿qué
incertidumbre o limitación existe? · ¿qué decidió la persona responsable? · ¿qué ocurrió después?

**Lo que la superficie NO debe responder directamente:** ¿cuál es el riesgo global de esta persona? ·
¿va a recaer? · ¿qué tratamiento debe recibir? · ¿qué profesional es mejor? · ¿qué intervención causó
el cambio? · ¿qué diagnóstico tiene según SISAP? **Esas formulaciones exceden el contrato actual de la
superficie.**

## 7.2 Reglas de la superficie

| ID | Regla | Estado |
| --- | --- | --- |
| `TRAJ-01` | **Anatomía de pantalla:** `PERSONA` (identidad autorizada, programa, episodio, estado) → `VENTANA TEMPORAL` (periodo, filtros, escala, comparación) → `RESUMEN DE CAMBIOS` → `STREAM DE EVENTOS DE TRAYECTORIA` (eventos, insights, decisiones humanas) → `EVIDENCIA / CONTEXTO / INSIGHT / DECISIÓN` por revelación progresiva. | `CONSERVAR` |
| `TRAJ-02` | **La pantalla no debe convertirse en una colección de tarjetas equivalentes.** La jerarquía debe comunicar `TRAYECTORIA → EVENTOS/EVIDENCIA → INTERPRETACIÓN → DECISIÓN HUMANA`. | `CONSERVAR` |
| `TRAJ-03` | **TRJ-01 Person Header.** Establece el contexto de la persona y del episodio antes de interpretar la trayectoria. Datos: `Person.id`, `Person.identifiers` autorizados, `Person.program`, `Person.episode`, `Person.status`. Reglas: mostrar solo identificadores autorizados; no mostrar datos fuera del permiso del rol; indicar claramente el contexto de sesión; evitar que el usuario confunda persona, episodio y trayectoria. Requisitos: `REQ-UI-001`, `REQ-UI-002`. Riesgo: `RISK-009`. | `CONSERVAR` |
| `TRAJ-04` | **TRJ-02 Temporal Window.** Delimita el periodo que se interpreta. Datos: `TrajectoryEvent.timestamp/occurred_at`, `temporal_precision`, `Assessment.administered_at`, `Context.effective_from/to`, `Intervention.timestamp`, `EngagementMetric.measurement_window`. Estados: `exact_datetime, date, week, period, approximate, unknown`. Reglas: no inventar precisión; no convertir `week` en fecha exacta; no representar `unknown` como posición temporal precisa; las ventanas agregadas conservan su `measurement_window`; comparaciones solo entre variables compatibles. Requisitos: `REQ-LONG-002`…`REQ-LONG-006`, `REQ-UI-007`. | `CONSERVAR` |
| `TRAJ-05` | **TRJ-03 Change Summary.** Permite lectura rápida **sin sustituir la trayectoria**. Puede mostrar cambios registrados, eventos recientes, información pendiente, limitaciones relevantes, insights disponibles y decisiones recientes. **No puede mostrar por defecto** `Global Risk Score`, `Clinical Confidence`, predicción de recaída, semáforo clínico no validado ni ranking de evolución. **El resumen es una puerta de entrada a evidencia, no un sustituto de ella.** | `CONSERVAR` |
| `TRAJ-06` | **TRJ-04 Event Stream.** Representa la trayectoria como secuencia temporal multimodal. Tipos: `Assessment, ClinicalEvent, BehavioralEvent, Context, Intervention, Observation, EngagementMetric, ClinicalInsight, HumanDecision, Pending`. Cada evento expresa: `id, event_type, occurred_at, temporal_precision, source, author/role, provenance, visibility, content, relationships, audit_metadata`. `TrajectoryEvent` es la estructura temporal de navegación; **no implica** que todas las entidades deban almacenarse físicamente como una sola tabla. | `CONSERVAR` |
| `TRAJ-07` | **Contrato de Event Card.** Todo evento conserva estructura mínima: tipo de evento · `[PROVENANCE]` · fecha/precisión · contenido relevante · fuente · autor/rol si aplica · `[Ver detalle]`. Valores de provenance permitidos: `reported / calculated / inferred / pending`. **La etiqueta de provenance se deriva del dato estructurado, no de la apariencia visual.** | `CONSERVAR` |
| `TRAJ-08` | **`Assessment` — binding.** Mostrar instrumento, fecha/precisión, resultado, fuente y comparabilidad. **No convertir automáticamente `score → diagnosis`, `score → risk state` ni `score → treatment recommendation`.** | `CONSERVAR` |
| `TRAJ-09` | **`Observation` — binding.** Distinguir claramente una observación profesional de un resultado psicométrico. | `CONSERVAR` |
| `TRAJ-10` | **`Context` — binding.** Mostrarlo como contexto temporalmente relacionado. **No convertir** `housing problem → clinical risk`, `financial difficulty → treatment failure`, `transport barrier → motivation` sin una interpretación explícita y validada. | `CONSERVAR` |
| `TRAJ-11` | **`ClinicalEvent`, `BehavioralEvent`, `Intervention`, `EngagementMetric` — binding.** Mantener el evento clínico como evento documentado; no traducir un evento conductual en estado psicológico; mostrar que una intervención ocurrió sin afirmar eficacia ni causalidad por proximidad temporal; mostrar siempre el periodo de medición cuando sea relevante. | `CONSERVAR` |
| `TRAJ-12` | **Contrato de comparación.** Toda comparación longitudinal responde: ¿qué se compara? · ¿en qué periodos? · ¿la variable es compatible? · ¿la metodología es comparable? · ¿cambió el instrumento? · ¿cambió la versión? · ¿cambió el modelo/configuración? · ¿existe información suficiente? **Estados:** `COMPARABLE` → permitir · `LIMITED_COMPARABILITY` → permitir solo con advertencia explícita · `INCOMPATIBLE` → impedir la representación como comparación directa · `PENDING` → indicar que aún no está disponible. **No compensar la incompatibilidad mediante una explicación visual que la haga parecer válida.** (Estado: especificación UX propuesta; requiere cierre con SRS/MMP.) | `CONSERVAR` |
| `TRAJ-13` | **Integridad temporal (`T-001`…`T-006`).** `T-001` precisión conservada · `T-002` *"Fecha: desconocida"* cuando la precisión es desconocida · `T-003` aproximado explícito (*"aprox. marzo 2026"*) · `T-004` proximidad temporal ≠ causalidad · `T-005` ventana de medición conservada · `T-006` versiones visibles cuando afectan la comparación. | `CONSERVAR` |
| `TRAJ-14` | **Capa derivada.** La trayectoria puede tener una capa derivada separada de los eventos observados: `OBSERVED/EVIDENCE → COMPUTED → MODEL OUTPUT → INTERPRETATION`. Cada capa conserva su provenance y trazabilidad. Ejemplo: observado *3 sesiones perdidas* → computado *tasa de asistencia 75%* → modelo *cluster / representación latente / NLP* → interpretación *posible asociación temporal*. | `CONSERVAR` |
| `TRAJ-15` | **Colocación del `ClinicalInsight`.** Debe aparecer **después de la evidencia que lo sustenta o junto a ella**. La representación compacta puede mostrar `[INFERIDO]` + enunciado + periodo + resumen de evidencia + acciones `[Ver evidencia] [Ver fundamento]`. | `CONSERVAR` |
| `TRAJ-16` | **Colocación de la decisión humana.** Aparece como evento propio: actor autorizado · relación con el insight · racional · acción registrada · seguimiento. Nunca presentar `SISAP recomendó → profesional aceptó` como patrón obligatorio. | `CONSERVAR` |
| `TRAJ-17` | **Revelación progresiva.** Nivel 0 (~30 s): qué ocurrió, cuándo, qué cambió, qué requiere atención. Nivel 1 (~2 min): evidencia, fuente, contexto, comparación, insight, limitaciones. Nivel 2 (5–15 min): Foundation, método, modelo, versión, configuración, ventana de entrada, provenance, relaciones, audit trail. **Regla crítica: revelación progresiva ≠ escalada de privilegio.** | `CONSERVAR` |
| `TRAJ-18` | **Variantes por rol** (prioridad de lectura): Psicología `Trajectory → Assessment → Observation → Context → Intervention → Insight → Foundation → Human Decision` (profundidad Clinical) · Medicina `ClinicalEvent → Medication → Assessment pertinente → observación médica → Insight pertinente` · Enfermería `eventos recientes → observaciones → medicación → estados operativos` (riesgo: alert fatigue) · Consejería `estado reciente → participación → observaciones → contexto → señales simplificadas`, sin Foundation técnica por defecto · Trabajo Social `Context → acceso al tratamiento → red de apoyo → intervención social → observación contextual` · Coordinación `casos que requieren atención → carga → tendencias → seguimiento` (sin eficacia individual de profesionales sin validación) · Dirección `agregados → tendencias → capacidad → resultados institucionales`, sin acceso individual por defecto. | `CONSERVAR` |
| `TRAJ-19` | **Estados de interacción y de fallo.** Todo componente soporta al menos `default, expanded, loading, error, permission_limited` y, cuando corresponda, los domain status. Fallos: `F-001` datos no disponibles (*"La información solicitada no está disponible"*, no rellenar con inferencia) · `F-002` procesamiento fallido (no mostrar resultado como válido) · `F-003` incompleto (*"La interpretación puede estar limitada"*) · `F-004` permiso limitado (no revelar el contenido protegido) · `F-005` superseded (*"Este resultado corresponde a una versión anterior"*; la representación de "vigente" requiere definición de dominio y **no** debe asumirse que lo más reciente sea clínicamente correcto) · `F-006` comparación incompatible. | `CONSERVAR` |
| `TRAJ-20` | **Accesibilidad de la superficie.** Objetivo WCAG 2.2 AA. Reglas mínimas: no depender exclusivamente del color · provenance siempre textual · estados con etiqueta + señal visual · foco visible · navegación por teclado · orden lógico de lectura · controles identificables · mensajes de error comprensibles · lenguaje claro · tablas y datos temporales legibles · contenido expandible accesible · no usar animación como único indicador de cambio · contraste suficiente · tamaños de interacción adecuados. **Accesibilidad cognitiva:** minimizar clutter visual, gráficos densos sin explicación, jerga de modelo innecesaria, alertas competidoras múltiples y relaciones temporales ambiguas. | `CONSERVAR` |

## 7.3 Contrato de datos por componente

`CONSERVAR`:

```text
TRJ-01 Person Header      → Person
TRJ-02 Temporal Window    → TrajectoryEvent temporal metadata · Context effective period
                            · EngagementMetric measurement window
TRJ-03 Change Summary     → derived calculations · ClinicalInsight · pending states
TRJ-04 Event Stream       → TrajectoryEvent · Assessment · Observation · ClinicalEvent
                            · BehavioralEvent · Context · Intervention · EngagementMetric
                            · ClinicalInsight · HumanDecision
Evidence Drawer           → Source · source_id · original record
Foundation                → InsightFoundation · MLResult · processing method
                            · model/version/configuration
Human Decision            → HumanDecision · audit metadata
```

## 7.4 Máquina de estados de la interacción

`CONSERVAR`. Representa flujo UX, **no** un workflow clínico obligatorio:

```text
PERSON SELECTED → TRAJECTORY LOADED → EVENTS AVAILABLE?
   NO → EMPTY / INCOMPLETE          YES → FILTER / EXPLORE → EVENT SELECTED
        → EVIDENCE AVAILABLE?  NO → LIMITED     YES → REVIEW
        → INSIGHT?  NO → EVIDENCE   YES → FOUNDATION → HUMAN DECISION
        → NEW TRAJECTORY EVENT
```

## 7.5 Casos de verificación (`TEST-TRJ-001`…`010` — `PROPUESTA`)

`PROPUESTA`: estos identificadores **no existen** en el sistema de V&V del proyecto.

| Test | Requisito | Dado / Entonces | PASS si |
| --- | --- | --- | --- |
| `TEST-TRJ-001` | `REQ-LONG-002`, `REQ-UI-007` | Evento con `temporal_precision = week` | conserva la precisión |
| `TEST-TRJ-002` | `REQ-LONG-002`, `REQ-UI-007` | Evento con fecha desconocida | no se inventa posición exacta |
| `TEST-TRJ-003` | `REQ-LONG-006` | Dos resultados no comparables | nunca se presentan como directamente equivalentes |
| `TEST-TRJ-004` | `REQ-LONG-005` | Resultados con configuraciones/modelos/versiones distintas | la diferencia es recuperable y visible cuando afecta la comparación |
| `TEST-TRJ-005` | `REQ-INTERP-001`, `REQ-UI-005` | Un evento reportado y un insight inferido | se distinguen sin abrir Foundation |
| `TEST-TRJ-006` | interpretación / gobernanza | Contexto social o de acceso al tratamiento | no se presenta automáticamente como riesgo clínico |
| `TEST-TRJ-007` | `REQ-NLP-002`, `REQ-NLP-005` | Procesamiento NLP fallido | no aparece como resultado analítico válido |
| `TEST-TRJ-008` | autorización / `RISK-009` | Usuario sin autorización | la UI no revela el contenido restringido |
| `TEST-TRJ-009` | `REQ-INTERP-004` | Usuario discrepa del insight | puede registrar `disagrees` sin modificar el insight original |
| `TEST-TRJ-010` | `REQ-LONG-005`, `REQ-UI-007` | Resultado `superseded` | se identifica como histórico y no como resultado actual |

## 7.6 Hipótesis de validación (`HYP-TRJ-001`…`005` — `PROPUESTA`)

| Hipótesis | Pregunta | Método | Métrica primaria |
| --- | --- | --- | --- |
| `HYP-TRJ-001` | ¿El usuario distingue correctamente actual / histórico / pendiente / superseded / aproximado / desconocido sin atribuir precisión inexistente? | Estudio de usabilidad basado en tareas, con protocolo de **pensamiento en voz alta (think-aloud)** | Clasificación correcta del estado temporal |
| `HYP-TRJ-002` | ¿La organización de la pantalla permite identificar evidencia **antes** de aceptar una interpretación como hecho? | Tarea comparativa | Interpretación correcta de provenance y naturaleza del resultado |
| `HYP-TRJ-003` | ¿El usuario evita inferir causalidad a partir de proximidad temporal? | Tarea basada en escenarios | Tasa de interpretaciones correctas |
| `HYP-TRJ-004` | ¿El usuario reconoce cuándo una comparación es incompatible o limitada? | Tarea de comparación | Selección correcta de `COMPARABLE` / `LIMITED` / `INCOMPATIBLE` / `PENDING` |
| `HYP-TRJ-005` | ¿Cada rol recibe información suficiente para su tarea sin exposición innecesaria? | Estudio por rol | Éxito de tarea + tasa de exposición de información no autorizada |

> En `HYP-TRJ-001`, la *"confianza declarada"* se admite **solo como métrica de UX**, nunca como
> confidence clínico.

## 7.7 Criterios de aceptación (`AC-TRJ-001`…`012` — `PROPUESTA`)

| ID | Criterio |
| --- | --- |
| `AC-TRJ-001` | Toda representación temporal conserva la precisión de origen o reduce precisión explícitamente; nunca la inventa. |
| `AC-TRJ-002` | Los eventos observados y las interpretaciones inferidas son distinguibles. |
| `AC-TRJ-003` | Las fuentes recuperables se pueden rastrear desde la representación UX. |
| `AC-TRJ-004` | Las comparaciones incompatibles no aparecen como comparaciones válidas. |
| `AC-TRJ-005` | Los modelos/versiones/configuraciones relevantes para la interpretación son trazables. |
| `AC-TRJ-006` | Un contexto no se transforma automáticamente en riesgo. |
| `AC-TRJ-007` | Una intervención no se presenta como eficaz por proximidad temporal. |
| `AC-TRJ-008` | Un resultado fallido o no disponible no parece un resultado válido. |
| `AC-TRJ-009` | El usuario puede registrar desacuerdo con una interpretación sin sobrescribirla. |
| `AC-TRJ-010` | Las variantes de rol respetan autorización y mínimo privilegio. |
| `AC-TRJ-011` | La interfaz mantiene la ruta `Trajectory → Evidence → Interpretation → Foundation → Human Decision`. |
| `AC-TRJ-012` | No se presentan como baseline: `global risk score`, `clinical confidence`, `diagnostic confidence`, recomendación automática, semáforos clínicos no sustentados. |

---

# 8. Superficie `Clinical Insight Card`

## 8.1 Propósito

`CONSERVAR`. La tarjeta es una **representación UX de `ClinicalInsight`**. **No es** un modelo, un
diagnóstico, un score de riesgo global, una recomendación automática ni una decisión clínica. Su
función es hacer navegable una interpretación de SISAP sin ocultar qué se observó, de dónde proviene,
cómo fue interpretado, cuándo aplica, qué incertidumbre y limitaciones existen, qué contexto puede
modificar su lectura y qué decide la persona profesional.

**Pregunta primaria:** *¿Qué interpreta SISAP, sobre qué evidencia, durante qué periodo y con qué
limitaciones?*

**No debe responder por sí sola:** ¿qué diagnóstico tiene la persona? · ¿qué tratamiento debe
recibir? · ¿cuál es su riesgo global? · ¿va a recaer? · ¿qué intervención funcionará? · ¿el terapeuta
fue eficaz?

## 8.2 Reglas de la tarjeta

| ID | Regla | Estado |
| --- | --- | --- |
| `CAR-01` | **Correspondencia conceptual del contrato:** `WHAT → ClinicalInsight.statement` · `FROM WHAT → ClinicalInsight.evidence[]` + `InsightFoundation.evidence[]` · `HOW → processing_method, model_or_rule, model_version` · `WHEN → ClinicalInsight.time_window, input_window` · `LIMITATIONS → limitations[]` · `UNCERTAINTY → ClinicalInsight.uncertainty` · `WHO DECIDES → HumanDecision` · `WHAT HAPPENED NEXT → TrajectoryEvent posterior`. | `CONSERVAR` |
| `CAR-02` | **Anatomía Nivel 1 — Compact (~30 s).** Muestra: provenance, enunciado, periodo, resumen de evidencia, limitación/incertidumbre relevante y acciones de navegación (`[Ver evidencia] [Ver fundamento]`). **No debe mostrar por defecto:** vector latente, parámetros del modelo, embeddings crudos, score técnico de confianza, probabilidad clínica, score global de riesgo ni confianza diagnóstica. | `CONSERVAR` |
| `CAR-03` | **Anatomía Nivel 2 — Clinical.** Añade: qué se observa, periodo, evidencia (assessment, observación, evento conductual/clínico), contexto relacionado, cómo lo interpreta SISAP, incertidumbre y limitaciones, con acciones `[Ver evidencia] [Ver fundamento] [Registrar decisión]`. **Regla: la profundidad clínica debe aumentar la comprensión, no aumentar artificialmente la certeza.** | `CONSERVAR` |
| `CAR-04` | **Anatomía Nivel 3 — Foundation.** Cadena `ClinicalInsight → Evidence → Source → Processing Method → Model/Rule → Version/Configuration → Input Window → Limitations → Uncertainty → Status`, con los campos recuperables de `FND-02`. | `CONSERVAR` |
| `CAR-05` | **Contrato de la evidencia y su trazabilidad.** El Evidence Drawer responde *¿de dónde salió esta interpretación?* con el flujo `ClinicalInsight → Evidence Drawer → Evidence item → Source → Original record`, indicando por cada evidencia: tipo, fecha/precisión, source, provenance y relación con el insight. **Regla: `occurred_near` no se representa visualmente como `caused_by`.** | `CONSERVAR` |
| `CAR-06` | **Presentación de la incertidumbre.** `ClinicalInsight.uncertainty` se representa como **limitación de interpretación**, no como etiqueta de prestigio del modelo. Puede comunicar tipo, interpretación, método y limitaciones. **No puede asumir:** `uncertainty → probability of diagnosis` · `→ probability of relapse` · `→ severity` · `→ clinical risk`. Hasta que el MMP defina y valide una métrica: **la interfaz no inventará una escala universal de incertidumbre.** | `CONSERVAR` |
| `CAR-07` | **Presentación del contexto.** El contexto puede aparecer asociado al insight cuando ayude a interpretarlo (`Insight + Context`), pero `Context ≠ Risk`. La UI puede mostrar que ambos coinciden temporalmente; **no** debe afirmar *"el cambio de vivienda causó la disminución"*. | `CONSERVAR` |
| `CAR-08` | **Estados de la tarjeta.** `Default` (enunciado + provenance + periodo + resumen de evidencia) · `Expanded` (evidencia/contexto/limitaciones visibles) · `Loading` (*"Procesando información…"*, **nunca** un placeholder con apariencia de resultado clínico) · `Error` (*"No fue posible generar esta interpretación"*, sin mostrar contenido parcialmente generado como resultado válido) · `Permission-limited` (*"Información adicional no disponible para este rol"*, sin revelar indirectamente la existencia de datos restringidos) · `Disputed` (la interpretación fue cuestionada) · `Superseded` (pertenece a una versión anterior). | `CONSERVAR` |
| `CAR-09` | **Interacción hacia la decisión humana.** Flujo `Review evidence → Review foundation → Contrast context → HumanDecision`, con los tipos de `DEC-01`. La acción primaria es `[Registrar decisión]`, **no** `[Aceptar recomendación de IA]`. | `CONSERVAR` |
| `CAR-10` | **Accesibilidad de la tarjeta.** Semántica accesible equivalente a: tipo de información · enunciado · periodo · evidencia · limitaciones · acciones. Sin dependencia del color (`Inferido`, `Reportado`, `Pendiente` siempre con texto explícito). Teclado: enfocar, expandir, cerrar, abrir evidencia, abrir fundamento, registrar decisión. Orden para lectores de pantalla: enunciado → provenance → alcance temporal → evidencia → limitaciones → acciones. **Carga cognitiva:** no colocar simultáneamente modelo, score, alerta, gráfica, texto y diez acciones sin jerarquía. | `CONSERVAR` |
| `CAR-11` | **Estados de fallo y disponibilidad (`FI-001`…`FI-006`).** `FI-001` sin interpretación disponible para el periodo · `FI-002` información insuficiente (*puede ser un `ClinicalInsight` de tipo `insufficient_information`; no debe rellenarse con una conclusión especulativa*) · `FI-003` procesamiento fallido · `FI-004` fuente no disponible · `FI-005` modelo no disponible · `FI-006` fuera de dominio (**usar la definición exacta aprobada por el artefacto dueño**). | `CONSERVAR` |
| `CAR-12` | **Variantes por rol.** Psicología: enunciado, ventana, evidencia, contexto, interpretación, incertidumbre, limitaciones, fundamento, decisión (Clinical + Foundation). Medicina: evidencia clínica pertinente, eventos médicos, medicación, evaluaciones relevantes, insight pertinente, sin mostrar información irrelevante solo porque esté disponible. Enfermería: Compact/Clinical según autorización. Consejería: enunciado simple, evidencia reciente, contexto, qué revisar; sin detalles técnicos del modelo por defecto. Trabajo Social: contexto, evidencia social, acceso al tratamiento, observaciones relacionadas, insight pertinente; sin convertir contexto social en clasificación de riesgo. Coordinación: resumen, casos que requieren atención, implicaciones operativas; Foundation limitado. Dirección: insights agregados, tendencias y métricas institucionales por defecto. | `CONSERVAR` |

## 8.3 Casos de verificación, hipótesis y criterios (`PROPUESTA`)

**`TEST-INS-001`…`010`** — `PROPUESTA`. Distinción de provenance · trazabilidad de evidencia
(`insight → evidencia → fuente`) · visibilidad de la limitación · ausencia de diagnóstico autónomo ·
ausencia de recomendación disfrazada de hallazgo · semántica de la incertidumbre · desacuerdo humano
que no modifica el insight · insight superseded que no se presenta como vigente · frontera de permiso
en Foundation · fallo de procesamiento que no parece interpretación válida.

**`HYP-INS-001`…`006`** — `PROPUESTA`. Comprensión de provenance (`reported/calculated/inferred/
pending`) · trazabilidad de evidencia · comprensión de la incertidumbre sin convertirla en
probabilidad inexistente · automation bias (proporción de decisiones que consideran evidencia y
contexto además del insight) · anchoring (detección de evidencia contradictoria) · registro correcto
de `HumanDecision` al discrepar.

**`AC-INS-001`…`014`** — `PROPUESTA`. Distingue provenance de interpretación · ventana temporal o
declaración explícita de alcance · evidencia rastreable hasta fuentes autorizadas · limitaciones
visibles · incertidumbre no presentada como probabilidad clínica sin validación · sin diagnóstico
autónomo · sin recomendación prescriptiva automática · contexto como contexto y no como riesgo
automático · decisión humana como entidad separada · desacuerdo que no modifica retroactivamente el
insight · estados de error/pendiente/superseded distinguibles · profundidad de Foundation sujeta a
autorización · cumplimiento del objetivo de accesibilidad de SISAP · datos `DEMO/EXAMPLE`
inconfundibles con datos clínicos reales.

# 9. Interacción end-to-end

## 9.1 Principio

`CONSERVAR`. La experiencia completa preserva `PERSONA → TRAYECTORIA → EVIDENCIA → INTERPRETACIÓN →
FOUNDATION → DECISIÓN HUMANA → TRAYECTORIA`. La interfaz **nunca** debe invertir silenciosamente la
relación `AI interpretation → retroactively selected evidence` (`PRIN-06`).

## 9.2 Flujos

| ID | Flujo | Reglas |
| --- | --- | --- |
| `FLU-01` | **Entrada.** Person Overview → seleccionar persona → Trajectory View. Precondiciones: usuario autenticado, persona autorizada, permisos resueltos, trayectoria disponible o estado de disponibilidad conocido. Resultado: el contenido respeta `authorization`, `provenance`, `temporal precision` y `presentation depth`. | `CONSERVAR` |
| `FLU-02` | **Explorar trayectoria.** Seleccionar ventana temporal → aplicar filtros → explorar el stream → seleccionar evento. Filtros posibles (solo cuando estén implementados y autorizados): tipo de evento, periodo, provenance, fuente, rol. **No añadir filtros que impliquen semántica clínica no validada.** | `CONSERVAR` |
| `FLU-03` | **Evento → Evidencia.** El usuario debe poder responder: ¿qué es? · ¿cuándo ocurrió? · ¿de dónde viene? · ¿qué tipo de información es? **No debe saltar directamente a "¿qué significa clínicamente?"** sin permitir acceso a la evidencia cuando exista. | `CONSERVAR` |
| `FLU-04` | **Evidencia → Insight.** Si existe `ClinicalInsight` relacionado se abre la tarjeta; si no existe → *"No insight available"*; si está pendiente → *"Insight pending"*; si falló → *"Processing failed"*. **No generar una interpretación sólo porque el usuario abrió un evento.** | `CONSERVAR` |
| `FLU-05` | **Insight → Foundation.** `[Ver fundamento]` permite revisar qué, de qué, cómo, cuándo, limitaciones, incertidumbre y estado. **La acción nunca modifica el insight.** | `CONSERVAR` |
| `FLU-06` | **Insight → Contexto.** La navegación contextual muestra relación temporal, fuente, provenance y contenido. **No** relación causal, salvo que exista una relación causal explícita y metodológicamente sustentada, lo cual no forma parte del baseline actual. | `CONSERVAR` |
| `FLU-07` | **Foundation → Decisión humana.** `Foundation → Review evidence → Contrast context → Registrar decisión`, con tipos `agrees / disagrees / modifies / defers / no_action`. **No usar `Aceptar recomendación` como sustituto de decisión humana.** | `CONSERVAR` |
| `FLU-08` | **Decisión humana → Trayectoria.** La decisión genera un `audit event` y aparece como evento temporal propio. La decisión **no reemplaza, no edita y no reescribe** el insight original: la trayectoria pasa a contener `insight original + human decision + eventos posteriores`. | `CONSERVAR` |
| `FLU-09` | **Escenarios que el sistema debe soportar** (A–H): camino feliz con persona sintética · insight disputado · información insuficiente · procesamiento fallido · permiso limitado · insight superseded · comparación incompatible · decisión humana **sin** insight. | `CONSERVAR` |
| `FLU-10` | **Caminos infelices (`UP-001`…`UP-010`).** Abrir un insight sin autorización → permission-limited · fuente ya no disponible → source unavailable · modelo no disponible → model unavailable · datos insuficientes → insufficient information · procesamiento fallido → processing failed · comparación incompatible → comparison blocked · fecha desconocida → temporal precision preserved · insight disputado → disputed + HumanDecision · insight superseded → historical/superseded · usuario abandona la decisión → el insight permanece sin modificación. | `CONSERVAR` |

## 9.3 Matriz de estados entre componentes

`CONSERVAR`. Ningún estado de un componente debe producir implícitamente un estado clínico.

| Trayectoria | Evento | Insight | Evidencia | Foundation | Decisión | UX esperado |
| --- | --- | --- | --- | --- | --- | --- |
| loaded | available | available | available | authorized | available | Flujo completo |
| loaded | available | none | available | — | — | Solo evidencia |
| loaded | available | pending | available | unavailable | — | Estado pendiente |
| loaded | available | failed | available | unavailable | — | Estado de error |
| loaded | available | disputed | available | authorized | available | Revisión + decisión |
| loaded | available | superseded | available | authorized | available | Estado histórico |
| loaded | unavailable | — | — | — | — | Vacío / evento no disponible |
| partial | available | available | limited | limited | available | Divulgación parcial |
| loaded | available | available | unavailable | unavailable | — | Fuente no disponible |
| loaded | available | available | available | unauthorized | available | Foundation con permiso limitado |
| loading | — | — | — | — | — | Cargando |
| error | — | — | — | — | — | Error / reintentar |
| loaded | pending | pending | pending | pending | — | Procesamiento pendiente |

**Reglas entre componentes (`C-001`…`C-008`).** `C-001` si `Insight = pending`, `Foundation` no debe
parecer disponible · `C-002` si `Insight = failed`, no mostrar contenido como resultado válido ·
`C-003` si `Evidence = unavailable`, no afirmar que la evidencia no existe · `C-004` si
`Foundation = permission_limited`, no degradar a información restringida visible · `C-005` si
`HumanDecision = saved`, el insight original permanece inmutable · `C-006` si
`Comparison = incompatible`, la gráfica o comparación directa debe estar bloqueada · `C-007` si
`Temporal precision = unknown`, ningún componente downstream puede inventarla · `C-008` si un insight
es `superseded`, su estado se propaga a sus representaciones.

## 9.4 Navegación y contrato de interacción

`CONSERVAR`. Navegación primaria `Persona → Trayectoria`; secundaria desde la trayectoria hacia
`Evento (detalle, evidencia, contexto, eventos relacionados)` e `Insight (evidencia, fundamento,
contexto, decisión humana)`. **Todo retorno debe conservar** persona, ventana temporal, filtros,
posición temporal y evento seleccionado cuando técnicamente sea posible, para evitar que el usuario
reconstruya mentalmente dónde estaba.

**Contrato de interacción:** cada interacción se describe como `TRIGGER → PRECONDITION → ACTION →
SYSTEM RESPONSE → NEW STATE → AVAILABLE NEXT ACTIONS`. Ejemplo: *seleccionar insight* / *insight
disponible* / *abrir tarjeta* / *mostrar enunciado + provenance + periodo* / *Insight = expanded* /
*ver evidencia · ver fundamento · registrar decisión*.

## 9.5 Escenarios de prueba UX (`UX-001`…`UX-008` — `PROPUESTA`)

`PROPUESTA`. Encontrar un cambio (identificar `cambio + ventana + evidencia`) · inspeccionar el
fundamento (navegar `Insight → Evidence → Foundation`) · desafiar el insight (encontrar evidencia
contradictoria y registrar desacuerdo o modificación) · comparar (clasificar correctamente
`comparable / limited / incompatible / pending`) · interpretación temporal (determinar cuándo ocurrió
un evento y con qué precisión, sin inventarla) · manejo de error (no tratar como válido un resultado
cuyo procesamiento falló) · frontera de rol (acceder al fundamento con rol autorizado y con rol no
autorizado, sin bypass) · contexto (identificar coincidencia temporal **sin** inferir causalidad:
distinguir `occurred_near` de `caused_by`).

## 9.6 Niveles de fidelidad del prototipo

`CONSERVAR`. `Fidelity 0 — estructura` (cajas, etiquetas, navegación, estados; objetivo: validar
arquitectura) · `Fidelity 1 — interacción` (flujo clickeable, cambios de estado, drawers, modales;
objetivo: validar comportamiento) · `Fidelity 2 — contenido` (datos sintéticos, terminología
realista, variantes por rol, estados de error; objetivo: validar comprensión) · `Fidelity 3 — visual`
(tipografía, espaciado, color, componentes, dataviz; objetivo: validar experiencia visual y
accesibilidad). **Regla: no saltar directamente a Fidelity 3.** Primero estructura y comportamiento.

## 9.7 Datos de prototipo

`CONSERVAR`. El set inicial debe permitir probar: 2 `Assessment` · 2 `Observation` ·
2 `BehavioralEvent` · 2 `Context` · 1 `ClinicalEvent` · 1 `MedicationEvent` · 2 `Intervention` ·
2 `EngagementMetric` · 1 `ClinicalInsight` · 1 insight disputado · 1 superseded · 1 pendiente ·
1 fallido · 1 `HumanDecision`. **Todo marcado `DEMO / SYNTHETIC`.** No utilizar datos clínicos reales
en el prototipo inicial sin autorización y protocolo aplicable. Los datos sintéticos deben conservar
las propiedades estructurales necesarias para probar precisión temporal, provenance, comparación,
incertidumbre, permisos y estados de fallo.

## 9.8 Criterios de aceptación de la capa de interacción (`AC-INT-001`…`010` — `PROPUESTA`)

`PROPUESTA`. Llegar de persona a trayectoria sin perder el contexto de autorización · navegar de
evento a evidencia · distinguir evidencia de interpretación · abrir Foundation cuando el rol lo
permite · registrar `HumanDecision` sin modificar el insight original · la nueva decisión aparece como
evento independiente · los estados pending/error/permission-limited no parecen resultados clínicos
válidos · las comparaciones incompatibles no pueden presentarse como válidas · la navegación conserva
contexto temporal y filtros · las variantes por rol no alteran la semántica de provenance.

---

# 10. Integración de marca y accesibilidad de interfaz

## 10.1 Propósito

`CONSERVAR`. El prototipo **no debe ser visualmente correcto por un lado y semánticamente correcto por
otro**: la interacción, los datos y la marca deben hablar el mismo idioma. La marca no es una capa
decorativa aplicada al final: el sistema visual también comunica qué sabemos, cómo lo sabemos, qué
interpreta SISAP, qué permanece incierto y qué decide una persona.

**Regla (`MAR-01`).** Cuando exista conflicto: `regulatorio/seguridad → requisito validado →
gobernanza clínica/IA → epistemología del producto → Brand & Design System → preferencia visual`. **La
marca no puede convertir una salida incierta en una salida aparentemente cierta.**

## 10.2 Contrato marca ↔ UX

| ID | Regla | Estado |
| --- | --- | --- |
| `MAR-02` | **Territorio:** Trayectoria, con Evidencia como soporte. El prototipo debe sentirse como un sistema que ayuda a comprender una trayectoria, no como un chatbot que entrega respuestas. Jerarquía visual primaria `Trayectoria → Eventos → Evidencia → Interpretación`, **no** `IA → Respuesta → Acción`. | `CONSERVAR` |
| `MAR-03` | **Gramática de marca en la interfaz:** `TRAYECTORIA` = estructura temporal · `EVIDENCIA` = procedencia visible · `INFERENCIA` = tratamiento visual menos categórico · `CONTEXTO` = capa contextual diferenciada · `DECISIÓN HUMANA` = acción explícitamente humana. **Nunca** un tratamiento visual que haga que una inferencia parezca más sólida que la evidencia que la sustenta. | `CONSERVAR` |
| `MAR-04` | **Provenance como componente de marca.** Toda representación con provenance disponible mantiene `etiqueta + distinción visual + distinción no dependiente del color`. **No sustituir** estas etiquetas por `AI`, `AI generated`, `confidence` o `prediction` si eso modifica su significado epistemológico. Mapeo V1: `Reportado` chip neutral con borde primary · `Calculado` chip neutral con borde secondary · `Inferido` tratamiento punteado con tipografía diferenciada · `Pendiente` estado explícito, **no vacío ambiguo**. | `CONSERVAR` |
| `MAR-05` | **Epistemología × marca.** `Observado/Evidence → Reportado` (claro, estable, directo) · `Computado → Calculado` (diferenciado, no alarmista) · `Model Output → Inferido` (visualmente menos categórico) · `Pendiente → Pendiente` (estado de disponibilidad) · `Human Decision → Humano` (claramente separado de SISAP). La marca **hace visible la epistemología sin convertirla en decoración**. | `CONSERVAR` |
| `MAR-06` | **Independencia del color.** Ejemplo correcto: `Inferido` + chip punteado + asterisco. Incorrecto: chip naranja sin etiqueta. **Siempre** existe una segunda señal: texto, ícono, borde, patrón o posición. | `CONSERVAR` |
| `MAR-07` | **Componentes de IA clínica — binding visual.** Tarjeta de insight: radio 8 px, padding 16 px, separación 12 px, elevación `raised`, acento `brand.primary`, fundamento con tratamiento más neutro, provenance siempre visible, **sin** iconografía de cerebro/circuito/IA mágica, **sin** color como único indicador. | `CONSERVAR` |
| `MAR-08` | **Trajectory View — binding visual.** Jerarquía `PERSONA → PERIODO → EVENTOS → CAMBIO → EVIDENCIA → INSIGHT`. La trayectoria debe sentirse `temporal, continua, legible, humana, evidencial`, **no** `predictiva, alarmista, gamificada`. En dataviz: mostrar escalas de origen, preservar unidades y semántica, usar trayectorias, incorporar RCI solo cuando esté definido y validado, **no** mostrar el espacio latente de 12 dimensiones, **no** usar semáforos como sustituto de análisis. | `CONSERVAR` |
| `MAR-09` | **Estados × marca.** Default = acento primario · Expanded = acento primario + jerarquía · Pending = etiqueta explícita · Uncertain = copy de incertidumbre + señal no cromática · Disputed = estado explícito · Superseded = tratamiento histórico · Failed = error semántico + copy explicativo · Permission limited = mensaje neutral de acceso limitado · Loading = movimiento restringido. Motion: `fast 150 ms`, `normal 250 ms`, `ease-out`; **no** >300 ms en flujo clínico; respetar `prefers-reduced-motion`. | `CONSERVAR` |
| `MAR-10` | **Accesibilidad del prototipo.** Verificar contrastes ≥4.5:1 texto y ≥3:1 no textual, targets ≥24×24 px (44×44 preferente), foco visible, navegación por teclado, estados no dependientes sólo de color, lenguaje claro, alternativa textual para visualizaciones y reducción de movimiento. **Regla de prototipo: no esperar a producción para descubrir que una distinción epistemológica sólo funciona visualmente con color.** | `CONSERVAR` |

## 10.3 Checklist de marca previa a pantalla (`CONSERVAR`)

- **Semántica:** ¿se distingue Reportado/Calculado/Inferido/Pendiente? · ¿la inferencia está separada
  del dato? · ¿la decisión humana está separada de SISAP? · ¿la incertidumbre es comprensible? · ¿no
  se sugiere causalidad sin fundamento?
- **Voz:** ¿usa lenguaje persona-primero? · ¿evita "adicto/a" como sustantivo? · ¿evita "diagnostica" y
  "predice"? · ¿evita claims terapéuticos? · ¿distingue información de interpretación?
- **Visual:** ¿usa tokens oficiales? · ¿la fuente base es la del sistema? · ¿el color de marca no está
  funcionando como warning? · ¿la semántica no depende sólo de color? · ¿no aparece iconografía de
  cerebro/circuito/IA mágica? · ¿no aparece el espacio latente de 12 dimensiones?
- **Accesibilidad:** ¿contraste verificado? · ¿foco visible? · ¿targets adecuados? · ¿accesible por
  teclado? · ¿reduced motion? · ¿texto alternativo o tabla cuando aplica?
- **Gobernanza:** ¿todo dato es sintético? · ¿no se utilizan datos clínicos reales en herramientas
  externas? · ¿el estado de evidencia está visible? · ¿los claims están dentro de la evidencia
  disponible?

> **`ABIERTO-03`.** Los criterios visuales concretos (paleta, tipografía, tamaño base, set de
> iconografía) dependen de las decisiones `D-01` a `D-05` abiertas en el **Brand & Design System
> v1.1**. Este manual **no las resuelve**. Además, el proyecto tiene una identidad **implementada** en
> [assets/app.css](../../assets/app.css) (tema oscuro, `Sora` + `JetBrains Mono`, cuerpo 13 px) y un logo propio
> (`sisap_recover_ai_logo_propuesta_1.svg`, navy + teal) que **difieren** de los valores propuestos por
> el paquete recibido. Ver [01_EN_REVISION_v1.1/SISAP_Recover_AI_Brand_Design_System_v1.1_EN_REVISION.md](SISAP_Recover_AI_Brand_Design_System_v1.1_EN_REVISION.md) §1.

## 10.4 Inventario de pantallas del primer prototipo (`CONSERVAR`)

`PNT-01` Person Overview · `PNT-02` Trajectory View · `PNT-03` Event Detail · `PNT-04` Evidence
Drawer · `PNT-05` Clinical Insight Compact · `PNT-06` Clinical Insight Clinical · `PNT-07` Foundation
View · `PNT-08` Context View · `PNT-09` Human Decision · `PNT-10` Decision Saved · `PNT-11` Pending
State · `PNT-12` Processing Failed · `PNT-13` Permission Limited · `PNT-14` Disputed Insight ·
`PNT-15` Superseded Insight · `PNT-16` Incompatible Comparison.

**Matriz de contenido:** Person Overview → capa observada/contexto, énfasis Trayectoria · Trajectory →
observada + calculada, Trayectoria · Event Detail → observada, Evidencia · Evidence Drawer →
provenance, Evidencia · Insight Compact → inferida, distinción epistémica · Insight Clinical →
inferida + contexto, Evidencia + Trayectoria · Foundation → evidencia + procesamiento,
neutral/referencia · Context → reportada, contexto humano · Human Decision → acción humana,
human-in-the-loop · Pending → pendiente, transparencia · Failed → no disponible, claridad ·
Permission → gobernanza, mínimo privilegio.

## 10.5 Lo que la marca NO debe hacer

`CONSERVAR`. No convertir inferencias en diagnósticos visuales · no usar color para indicar
"bueno/malo" clínico sin definición · no convertir una tarjeta de insight en call-to-action
prescriptivo · no usar iconografía futurista para sugerir autoridad algorítmica · no esconder
incertidumbre para lograr una interfaz "limpia" · no presentar el producto como chatbot · no
representar personas con TUS mediante imágenes generadas por IA · no mostrar el espacio latente
clínicamente · no usar "Recover" como promesa terapéutica · no confundir el dashboard institucional
con el producto clínico.

## 10.6 Criterios de aceptación de marca (`AC-BRAND-001`…`010` — `PROPUESTA`)

Todo prototipo clínico utiliza el Brand & Design System como fuente visual · las etiquetas de
provenance son visibles y semánticamente consistentes · la visualización de inferencias comunica menor
categorización que la evidencia observada · la marca no introduce claims clínicos no soportados · la
trayectoria es visualmente prioritaria frente a la salida de IA · `HumanDecision` tiene identidad
visual propia y no parece recomendación automática · la interfaz utiliza los tokens definidos · el
prototipo puede comprenderse sin depender sólo del color · los estados de disponibilidad no se
confunden con estados clínicos · el prototipo utiliza exclusivamente datos sintéticos.

---
---

# Anexo A — Matriz de trazabilidad consolidada

`CORREGIR`. El documento recibido distribuía esta trazabilidad en **seis matrices distintas**
(caps. 54–60, 85, 118, 149 y capa de interacción), con los mismos requisitos repetidos y con
identificadores de prueba y validación que **no existen** en el proyecto (`PROPUESTA`). Aquí se
consolida en una sola matriz con los identificadores **reales** del `SISAP-SRS-001` y del
`SISAP-RMF-001`.

Columnas canónicas: `Requisito · Riesgo · Control · Componente UX · Regla · Verificación ·
Validación · Dueño · Estado`.

| Requisito | Riesgo | Control | Componente UX | Regla | Verificación | Validación |
| --- | --- | --- | --- | --- | --- | --- |
| `REQ-INTERP-001` | `RISK-015` | Separación de capas / trazabilidad | Clinical Insight Card | `INT-01`, `CAR-02` | `TEST-TRJ-005`, `TEST-INS-001` | `HYP-INS-001` |
| `REQ-INTERP-002` | `RISK-012`, `RISK-015` | Fuente identificable y navegable | Evidence Drawer | `CAR-05` | `TEST-INS-002` | `HYP-INS-002` |
| `REQ-INTERP-003` | `RISK-001`, `RISK-012`, `RISK-015` | Limitaciones comunicadas | Foundation View | `FND-01`, `FND-04` | `TEST-INS-003` | `HYP-INS-003` |
| `REQ-INTERP-004` | `RISK-001`, `RISK-015` | Juicio profesional explícito | Human Decision | `DEC-02`…`DEC-06` | `TEST-INS-007`, `TEST-TRJ-009` | `HYP-INS-006` |
| `REQ-UI-003` | `RISK-004`, `RISK-015` | Validación en captura | Entrada de evaluación | *(sin regla dedicada en este manual)* | *(V&V del proyecto)* | — |
| `REQ-UI-005` | `RISK-015` | Gramática visual de provenance | Trajectory + Insight | `PROV-05`, `TRAJ-07` | `TEST-TRJ-005` | `HYP-TRJ-002` |
| `REQ-UI-006` | `RISK-002`, `RISK-003`, `RISK-014` | Alert validation / auditabilidad | Alert & Signal UI | `ALR-02`…`ALR-07` | *(bloqueado en criterio clínico — `PEND-03`)* | — |
| `REQ-UI-007` | `RISK-010`, `RISK-011`, `RISK-014` | Manejo explícito de estado | Trajectory states | `TRAJ-19` | `TEST-TRJ-001`, `002`, `010` | `HYP-TRJ-001` |
| `REQ-UI-008` | `RISK-009`, `RISK-015` | Confirmación de operaciones destructivas | Flujos de captura | *(el documento recibido no lo cubría)* | *(V&V del proyecto)* | — |
| `REQ-UI-009` | `RISK-001`, `RISK-015` | Lenguaje no diagnóstico | Clinical Insight Card | `INT-03`…`INT-07` | `TEST-INS-004`, `005` | `HYP-INS-004` |
| `REQ-LONG-001` | `RISK-010`, `RISK-011` | Recuperación longitudinal autorizada | Trajectory View | `TRAJ-06` | `TEST-TRJ-003` | `HYP-TRJ-001` |
| `REQ-LONG-002` | `RISK-010`, `RISK-011` | Orden temporal por precisión disponible | Trajectory View | `TEMP-01`, `TEMP-03` | `TEST-TRJ-001`, `002` | `HYP-TRJ-001` |
| `REQ-LONG-003` | `RISK-010`, `RISK-011` | Compatibilidad de variables | Vista de comparación | `TRAJ-12` | `TEST-TRJ-003` | `HYP-TRJ-004` |
| `REQ-LONG-004` | `RISK-010`, `RISK-011` | Ventana temporal y contexto | Trajectory View | `TEMP-05` | `TEST-TRJ-003` | `HYP-TRJ-001` |
| `REQ-LONG-005` | `RISK-010`, `RISK-011` | Identificación de versiones | Trajectory / Foundation | `TEMP-06`, `MOD-05` | `TEST-TRJ-004`, `010` | `HYP-TRJ-001` |
| `REQ-LONG-006` | `RISK-010`, `RISK-011` | Bloqueo de comparación incompatible | Vista de comparación | `TRAJ-12` | `TEST-TRJ-003` | `HYP-TRJ-004` |
| `REQ-NLP-003` | `RISK-006`, `RISK-007`, `RISK-012` | Trazabilidad de método/versión/configuración | NLP Foundation | `NLP-01`, `NLP-03` | *(V&V del proyecto)* | — |
| `REQ-NLP-004` | `RISK-001`, `RISK-015` | Presentación como apoyo analítico | NLP result | `NLP-04` | `TEST-TRJ-007` | `HYP-INS-001` |
| `REQ-NLP-005` | `RISK-006`, `RISK-007`, `RISK-015` | Manejo de fallos | NLP state | `NLP-02` | `TEST-TRJ-007` | — |
| `REQ-CLIN-005` | `RISK-004` | Trazabilidad de puntuación | Assessment → Foundation | `SCR-01` | *(V&V del proyecto)* | — |
| `REQ-ALERT-003` | `RISK-013` | Criterio identificable | Alert UI | `ALR-04` | *(bloqueado — `PEND-03`)* | — |
| `REQ-ALERT-007` | `RISK-014` | Fallo detectado y registrado | Alert UI | `ALR-06` | *(bloqueado — `PEND-03`)* | — |
| `RISK-009` (control) | `RISK-009` | Autorización y mínimo privilegio | Variantes por rol | `RBAC-01`…`RBAC-04`, `ROL-01`…`ROL-04` | `TEST-TRJ-008` | `HYP-TRJ-005` |
| `RISK-010` (control) | `RISK-010` | No presentar resultado obsoleto como actual | Estados de trayectoria | `TRAJ-19` (`F-005`), `MOD-04` | `TEST-TRJ-010` | `HYP-TRJ-001` |
| `REQ-ML-GOV-001` | `RISK-001`, `RISK-007` | Aislamiento del desacuerdo | Human Decision | `GOB-01`, `DEC-07` | `TEST-INS-007` | `HYP-INS-006` |

**Nota.** Las asociaciones de este anexo son de **trabajo**: la incorporación formal de cada relación
corresponde al sistema de V&V del proyecto. `Owner`: SRS / RMF / SVP según el caso.

---

# Anexo B — Glosario de estados y vocabulario controlado

| Término | Significado en este manual | No significa |
| --- | --- | --- |
| `reported` / Reportado | Dato directo de una fuente registrada | Verdad clínica |
| `calculated` / Calculado | Transformación reproducible sobre datos de entrada | Interpretación clínica |
| `inferred` / Inferido | Relación interpretativa del sistema | Diagnóstico, riesgo, certeza |
| `pending` / Pendiente | Información esperada, no disponible o no resuelta | Estado clínico |
| `active` / `disputed` / `superseded` / `pending` | Domain status del objeto | Provenance |
| `default` / `expanded` / `loading` / `error` / `permission_limited` | Interaction state de la interfaz | Estado del dato |
| `COMPARABLE` / `LIMITED_COMPARABILITY` / `INCOMPATIBLE` / `PENDING` | Estado de una comparación | Calidad clínica del resultado |
| `Signal` | Cambio o patrón que puede merecer revisión | Alerta |
| `Alert` | Mecanismo operacional con condición definida | Insight |
| `ClinicalInsight` | Interpretación explícita de evidencia | Diagnóstico, recomendación |
| `InsightFoundation` | Estructura auditable de procedencia del insight | Segunda afirmación clínica |
| `MLResult` | Resultado computacional del modelo | Insight clínico |
| `HumanDecision` | Decisión o posición de una persona autorizada | Salida automática del sistema |

---

# Anexo C — Registro de intervenciones de esta revisión

> Metadato del proceso de revisión (no es contenido del manual). Desplegar para ver el detalle.

<details>
<summary><strong>Ver registro completo (12 intervenciones)</strong></summary>

| # | Tipo | Intervención |
| --- | --- | --- |
| 1 | `CORREGIR` | Lista de salidas del Intended Use citada **verbatim** (12 elementos) en lugar de la paráfrasis que omitía 5 (`ML Prediction`, `Reconstruction Metrics`, `Uncertainty`, `Reports`, `Clinical Scores`). |
| 2 | `CORREGIR` | Eliminada la atribución a *"la v0.2 del Data Dictionary"*: el documento está **Planificado** y no existe. Las reglas se conservan como reglas del manual. |
| 3 | `CORREGIR` / `PRECISA` | Separadas las dos capas de las alertas: mecánica **especificada** en `REQ-ALERT-001`…`007` y `REQ-UI-006`; criterio clínico y umbral **abiertos** (`PEND-03`). Eliminada la lectura de `REQ-UI-006` como propuesta. |
| 4 | `CORREGIR` | Tabla de riesgos completada con `RISK-005`, `RISK-008` y `RISK-016` y con los **títulos literales** de los 16 escenarios del RMF. |
| 5 | `CORREGIR` | Añadidos `REQ-UI-003` (Validación), `REQ-UI-008` (Confirmaciones), `REQ-CLIN-007` y `REQ-CLIN-008`; añadidos `REQ-ALERT-*` a la matriz. |
| 6 | `CORREGIR` | Eliminada la narración de la "colisión de ID HU-015/HU-018": no es verificable contra el archivo recibido. La renumeración se conserva. |
| 7 | `CORREGIR` | Añadidos `SISAP-SDD-001` y `SISAP-STP-001` a la tabla de documentos controlados (existían y no se citaban). |
| 8 | `PROPUESTA` | Las 18 HU, los 46 `AC-*`, los 12 `HYP-*`, los 23 `TEST-INS/TRJ/AUD-*` y los 6 `PR-HU*` quedan declarados como **propuesta no incorporada** (0 apariciones en el corpus). |
| 9 | Estructural | **71 subtítulos con numeración huérfana** renumerados; 5 documentos concatenados reorganizados en 10 secciones; capítulos duplicados (`Role Variants`, `Accessibility Contract`, `Acceptance Criteria`, `Traceability`, `Verification Test Cases`, `Validation Hypotheses`) consolidados; anexos ordenados. |
| 10 | Estructural | Seis matrices de trazabilidad consolidadas en **una** (Anexo A) con identificadores reales del SRS y del RMF. |
| 11 | Estructural | Cascada de `**REGLA:**` sustituida por **identificadores estables** en 21 dominios, con índice en §1. |
| 12 | Control | Versión y estado declarados: **v1.1 · EN REVISIÓN**. Se eliminan las referencias a versiones inexistentes (Manual UX v1.6, Checklist Editorial V2.3). |

**Lo que NO se tocó:** ninguna decisión clínica, ningún umbral, ninguna metodología de modelo, ningún
valor de token visual, ninguna entidad de datos. Los huecos se registran como `PEND-*` en lugar de
cerrarse por inferencia.

</details>

---

# Anexo D — Fuentes y referencias verificadas

Todas consultadas el 2026-09-20. `[P]` = primaria del emisor; `[S]` = secundaria.

| Fuente | Referencia | Se usa en |
| --- | --- | --- |
| [P] | [docs/00_intended_use/intended_use.md](../../docs/00_intended_use/intended_use.md) L377 (lista de salidas) | §0.2-#1, §3.7 |
| [P] | [docs/02_requirements/SRS.md](../../docs/02_requirements/SRS.md) L422–L745 (`REQ-CLIN/ALERT/LONG/NLP/INTERP/UI`) | §0.1, §0.2-#5, §5.2, §6.10 |
| [P] | [docs/07_risk_management/Software_Risk_Management_File.md](../../docs/07_risk_management/Software_Risk_Management_File.md) L324–L624 (`RISK-001`…`RISK-016`) | §0.2-#4, §5.4 |
| [P] | [docs/13_model_management/Model_Management_Plan.md](../../docs/13_model_management/Model_Management_Plan.md) L1269 (`MLResult`) | §0.1, §6.13 |
| [P] | [docs/14_data_management/Data_Management_Specification.md](../../docs/14_data_management/Data_Management_Specification.md) (`Data Dictionary` = *Planificado*) | §0.2-#2, §6.1 |
| [P] | [docs/17_product_interface_design/README.md](../../docs/17_product_interface_design/README.md) (paradigma *detail-first*; `dashboard` descartado) | §4.6, §10.3 |
| [P] | [assets/app.css](../../assets/app.css) (tokens implementados) | §10.3 |
| [S] | W3C — *WCAG 2.2 approved as ISO/IEC 40500:2025* · <https://www.w3.org/press-releases/2025/wcag22-iso-pas/> | `TRAJ-20`, `MAR-10` |
| [S] | Collins G. *et al.* (2024). TRIPOD+AI statement. *BMJ* 385:e078378. DOI 10.1136/bmj-2023-078378 | §3.5 (reporte) |
| [S] | Vasey B. *et al.* (2022). DECIDE-AI. *BMJ* 377:e070904. DOI 10.1136/bmj-2022-070904 | §3.5 |
| [S] | Liu X. *et al.* (2020). CONSORT-AI extension. *Nat Med* 26:1364–1374. DOI 10.1038/s41591-020-1034-x | §3.5 |

> **Nota de citación.** El documento recibido nombraba las tres guías de reporte **sin referencia**.
> Se añaden aquí. Advertencia detectada al verificarlas: el DOI `10.1038/s41591-022-01887-z`, que
> circula como "DECIDE-AI", **resuelve a otro artículo** (un estudio sobre la variante Ómicron); la
> referencia correcta del documento principal es *BMJ* 2022;377:e070904.

---

# Anexo E — Criterio de cierre editorial

Este documento se considera **editorialmente completo para la fase de prototipado** cuando:

- la Trayectoria está establecida como estructura narrativa primaria y el eje del producto;
- evidencia, interpretación, incertidumbre y decisión humana tienen una relación explícita y
  verificable en las superficies;
- provenance funciona como lenguaje formal y no sólo como metadata (`PROV-05`, `EPI-03`);
- `Clinical Insight`, `Foundation` y `Human Decision` tienen expresión consistente;
- la misma gramática se expresa a distintas profundidades por rol sin alterar el significado;
- contexto, temporalidad y causalidad tienen reglas explícitas;
- los estados técnicos no se confunden con estados clínicos;
- las matrices de trazabilidad apuntan a **requisitos y riesgos reales** del proyecto;
- las referencias a documentos controlados apuntan a **archivos que existen**.

**REGLA DE CIERRE.** Este documento **no convierte hipótesis UX, clínicas, regulatorias ni de modelo
en hechos validados**, y **no se declara "final"** mientras `PEND-01`…`PEND-06`, `ABIERTO-01`…`ABIERTO-03`
y las decisiones `D-01`…`D-05` del Brand & Design System v1.1 permanezcan abiertas.

---

## Cómo contribuir a este documento

Este manual es un **documento controlado en revisión**. Para proponer cambios:

1. Abre un *issue* o *pull request* contra este archivo en el repositorio.
2. Respeta la **arquitectura de reglas** (§1): los identificadores (`PRIN-`, `ONT-`, `TRAJ-`…)
   **nunca se renumeran**; una regla nueva se anexa al final de su dominio.
3. Toda corrección debe aportar **evidencia verificable** contra el corpus del proyecto
   (ver §0); las hipótesis se registran como `PROPUESTA` o `PENDIENTE`, no como hechos.
4. El estado del documento (`EN REVISIÓN` → aprobado) solo lo cambia el **propietario del proyecto**
   (ver tabla de control y Anexo E).
