# Marco regulatorio mexicano aplicable a SISAP-TUS

| Campo | Valor |
|---|---|
| Documento | REG-001 |
| Fecha de consulta de fuentes | 30 de septiembre de 2026 |
| Método | Consulta directa a fuentes oficiales (Diario Oficial de la Federación, Cámara de Diputados, Secretaría de Salud, COFEPRIS, catálogo oficial de normalización). **No se asumió vigencia por conocimiento previo** |
| Alcance | Expediente clínico · expediente clínico electrónico · identificación del paciente · notas clínicas · trazabilidad de quien registra · confidencialidad · seguridad · integridad · conservación · software como dispositivo médico · protección de datos personales |
| Advertencia | Este documento **no declara conformidad** con ninguna disposición. Identifica requisitos, su fuente y el estado de la implementación. La verificación de conformidad está **pendiente** |

---

## 1. Disposiciones revisadas y estado verificado

| # | Disposición (nombre exacto) | Versión / año | Estado verificado | Fuente oficial | Fecha de consulta |
|---|---|---|---|---|---|
| 1 | **Norma Oficial Mexicana NOM-004-SSA3-2012, Del expediente clínico** | Publicada DOF 15/10/2012 | **Vigente** (catálogo oficial de normalización; sin reforma localizada en esta consulta) | `dof.gob.mx` (nota 5272787) · catálogo `platiica.economia.gob.mx` · texto íntegro en réplica institucional de salud estatal (`cri.saludtlax.gob.mx`) · cita de requisito en `conamed.gob.mx` | 30/09/2026 |
| 2 | **Norma Oficial Mexicana NOM-024-SSA3-2012, Sistemas de información de registro electrónico para la salud. Intercambio de información en salud** | Publicada DOF 30/11/2012 (sustituye a la NOM-024-SSA3-2010) | Vigente (publicación DOF confirmada) | `dof.gob.mx` (nota 5280847) · `dgis.salud.gob.mx` | 30/09/2026 |
| 3 | **NOM-241-SSA1-2025, Buenas prácticas de fabricación de dispositivos médicos** — modificaciones informadas por COFEPRIS | 2025 (informada 05/04/2025) | Vigente; contempla **líneas de fabricación específicas para software como dispositivos médicos** | `gob.mx/cofepris` (artículo institucional oficial) | 30/09/2026 |
| 4 | **Guía para la obtención del Registro Sanitario de Dispositivos Médicos** — COFEPRIS | vigente a la fecha de consulta | Publicada (documento institucional) | `gob.mx/cofepris` | 30/09/2026 |
| 5 | **Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP)** — **ley nueva** | Publicada DOF **20/03/2025**; **última reforma DOF 14/11/2025** | **Vigente con reforma de noviembre de 2025** | Cámara de Diputados, `diputados.gob.mx/LeyesBiblio` (texto consolidado y página de reformas) | 30/09/2026 |

### Hallazgo principal de la verificación

> **La LFPDPPP aplicable NO es la de 2010.** Fue expedida de nuevo y publicada en el DOF el **20 de marzo de 2025**, con una **reforma posterior publicada el 14 de noviembre de 2025**. Cualquier diseño apoyado en la versión de 2010 (aviso de privacidad, derechos ARCO, plazos y régimen de sanciones) está desactualizado.

Hallazgos secundarios verificados:

- La NOM-241-SSA1-2025 **incorpora explícitamente el software como dispositivo médico** en el marco de buenas prácticas de fabricación, y COFEPRIS publicó además una guía de preguntas y respuestas sobre su aplicación.
- COFEPRIS ya cuenta con precedentes de autorización de **software como dispositivo médico de alta tecnología**, lo que confirma que la vía regulatoria existe en México para productos de software clínico.
- La NOM-024-SSA3-2012 establece que los prestadores son responsables de **conservar y mantener en condiciones adecuadas de operación** sus sistemas, para asegurar **integridad, confiabilidad y disponibilidad** de los datos a través del tiempo (numeral 5.6, cita textual).

---

## 2. Requisitos concretos que afectan el diseño

Citas textuales obtenidas del texto oficial de la NOM-004 (numerales 5.x, 6.x y concordantes):

| Requisito (cita) | Implicación para SISAP-TUS |
|---|---|
| «…**nombre completo del paciente, edad, sexo** y en su caso, **número de cama o expediente**» | El expediente debe poder contener **identificación clínica completa**, no sólo un seudónimo |
| «Todas las notas en el expediente clínico deberán contener **fecha, hora, nombre completo**, así como la **firma de quien la elabora**» | Toda nota debe registrar fecha, hora, profesional y firma |
| «…nombre completo de quien la elabora, así como la **firma autógrafa, electrónica o digital**, según sea…» | El mecanismo de firma es explícitamente reconocido; el sistema debe admitirlo |
| Obligaciones sobre «elaboración, integración, uso, manejo, **archivo, conservación**, propiedad, titularidad y **confidencialidad** del expediente clínico» | Conservación y confidencialidad son obligaciones del prestador, no opciones |
| (NOM-024-SSA3-2012, 5.6) responsabilidad de asegurar «**integridad, confiabilidad y disponibilidad**» de los datos a través del tiempo | Versionado, respaldo e integridad de los registros |
| (LFPDPPP 2025, arts. 5 y 7) principios de «**licitud, finalidad, lealtad, consentimiento**» y régimen de consentimiento expreso/tácito; categoría de «**datos personales sensibles**» | Los datos de salud entran en la categoría más protegida: consentimiento, finalidad y medidas de seguridad reforzadas |

---

## 3. Matriz requisito → fuente → aplicación → evidencia → estado

| Requisito | Fuente normativa | Aplicación en SISAP | Evidencia / implementación | Estado |
|---|---|---|---|---|
| Identificación del paciente | NOM-004-SSA3-2012 | Campos de identificación clínica en el expediente | `app/database/models_notas.py` (`expedientes_clinicos`) + `app/services/expediente_service.py` | **Implementado en código — pendiente de verificación de conformidad** |
| Número de expediente | NOM-004-SSA3-2012 | Campo propio del expediente, distinto de los identificadores internos | `ExpedienteClinico.numero_expediente` (único) + validación en servicio | **Implementado en código — pendiente de verificación de conformidad** |
| Identificación de quien elabora | NOM-004-SSA3-2012 | Usuario/profesional autenticado en cada registro | Autenticación + RBAC + autoría por nota (`autor_nombre`, `autor_cedula_profesional`, `autor_id`) | **Implementado en código — pendiente de verificación de conformidad** |
| Fecha y hora | NOM-004-SSA3-2012 | Marca temporal en cada nota y registro | `NotaVersion.fecha` (fecha y hora por versión) + `fecha_creacion` | **Implementado en código — pendiente de verificación de conformidad** |
| Integridad / versionado | NOM-004-SSA3-2012 · NOM-024-SSA3-2012 (5.6) | Historial sin sobrescritura; corrección por versionado | `notas_clinicas` + `nota_versiones` (no destructivo) + `verificar_integridad` (huellas) · Plan de Tratamiento | **Implementado en código y verificado por pruebas — conformidad pendiente** |
| Confidencialidad | NOM-004-SSA3-2012 · LFPDPPP 2025 | Control de acceso por roles; separación de capas | `app/security/capas.py` (cuatro capas) + RBAC/ABAC existente + bitácora de acceso | **Implementado en código y verificado por pruebas — conformidad pendiente** |
| Firma (autógrafa/electrónica/digital) | NOM-004-SSA3-2012 | Registro del mecanismo de firma por nota | `NotaVersion.firma_tipo` + `firma_referencia` + `firma_hash` | **Implementado en código — pendiente de verificación de conformidad** |
| Protección de datos personales | LFPDPPP (DOF 20/03/2025; reforma 14/11/2025) | Minimización y seudonimización antes del procesamiento; anonimización en demo | `app/services/minimizacion_service.py` + frontera dura antes del NLP | **Implementado en código y verificado por pruebas — conformidad pendiente** |
| Software como dispositivo médico | COFEPRIS · NOM-241-SSA1-2025 | Análisis de clasificación del producto y del uso previsto | `docs/00_intended_use`, `docs/10_traceability_and_safety` | **Pendiente de determinación formal** |

---

## 4. Lenguaje obligatorio en la documentación

**No** se declarará «cumple NOM-004», «cumple COFEPRIS», «certificado» ni equivalente por el hecho de haber implementado campos o controles.

Formulaciones admitidas: **«diseñado considerando»**, **«requisito identificado»**, **«implementación prevista»**, **«evidencia disponible»**, **«pendiente de verificación de conformidad»**.

---

## 5. Lo que NO pudo verificarse en esta consulta

Se registra sin adornos, para no dar por cierto lo que no se comprobó:

1. **No se localizó reforma posterior a la NOM-004-SSA3-2012**, pero la búsqueda se apoyó en réplicas institucionales del texto y en el catálogo de normalización; la verificación definitiva de vigencia exige consulta al DOF, cuyo acceso por navegador falló (tiempo de espera agotado). **Estado: vigencia confirmada por catálogo oficial; ausencia de reformas, no concluyente.**
2. **No se verificó en fuente oficial la autoridad que hoy ejerce las funciones de protección de datos** tras la reforma de 2025. Circulan referencias a una secretaría de Estado como sustituta del instituto desaparecido, pero **no se confirmó en fuente oficial** y no se incorpora como hecho.
3. **No se determinó la clasificación regulatoria de SISAP-TUS** como dispositivo médico: depende del uso previsto y requiere decisión formal documentada.
4. **No se verificó** el contenido del numeral de conservación mínima del expediente (periodo de resguardo) directamente en el DOF.

*(La presente fase es de investigación y documentación; los cambios de implementación derivados se ejecutan en el bloque siguiente.)*

---

## 6. Implicaciones de diseño (resumen ejecutivo)

1. El expediente clínico **debe poder contener la identificación clínica** (nombre completo, número de expediente, edad, sexo, identificadores clínicos). **El seudónimo no la sustituye.**
2. La seudonimización es una **capa de protección para el procesamiento**, no un mecanismo de identidad del expediente.
3. Toda nota clínica requiere **fecha, hora, autor identificado y firma**, y **no admite edición destructiva**: la corrección se hace por versionado con trazabilidad.
4. Se distinguen cuatro capas: **expediente clínico** → **datos clínicos procesables** → **NLP/autoencoders** → **demo pública**, con control de acceso entre ellas.
5. La demo pública permanece **100 % sintética**, con independencia de que la aplicación clínica muestre identidad real.
6. Toda afirmación de cumplimiento queda **prohibida** hasta que exista verificación formal.
