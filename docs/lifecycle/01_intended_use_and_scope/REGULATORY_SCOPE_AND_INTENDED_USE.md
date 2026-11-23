# Evaluación de Aplicabilidad Regulatoria y Uso Previsto de SISAP

## Control Documental

| Campo | Valor |
|---|---|
| **Código documental** | `SISAP-LC-001` |
| **Título** | Evaluación de Aplicabilidad Regulatoria, Uso Previsto y Fronteras Clínicas de SISAP by CENIVRA |
| **Versión** | `1.1.0-draft` |
| **Estado** | **En revisión** |
| **Fecha de creación** | 2026-11-23 |
| **Última actualización** | 2026-11-23 |
| **Autor / Responsable** | Equipo de Producto, Clínica e Ingeniería — CENIVRA / SISAP |
| **Revisor y aprobación** | **Pendiente de revisión clínica y regulatoria formal** |
| **Documentos relacionados** | `SISAP-LC-000` · `SISAP-LC-003` · `SISAP-LC-004` · [`Marco_Regulatorio_Mexicano_Aplicable.md`](../../18_regulatory/Marco_Regulatorio_Mexicano_Aplicable.md) · [`EXPEDIENTE_CONTROL_ISO_DCSA_DICO.md`](../../18_regulatory/EXPEDIENTE_CONTROL_ISO_DCSA_DICO.md) |

### Historial de Cambios

| Versión | Fecha | Descripción | Responsable |
|---|---|---|---|
| `1.1.0-draft` | 2026-11-23 | Evaluación formal de aplicabilidad según Sección 2 del requisito transversal IEC 62304, actualizada al alcance real de `v1.1.0` (Autoencoder, 5 Motores y Centro Psicométrico). | Equipo de Ingeniería SISAP |

---

## 1. Declaración de Estado Normativo (Sin Sobleafirmación)

- **SISAP by CENIVRA NO declara ser un dispositivo médico certificado ni declara conformidad demostrada con IEC 62304:2006 + AMD1:2015 o registro sanitario COFEPRIS.**
- Formulaciones aprobadas para documentación técnica y de liberación:
  - *Desarrollado siguiendo procesos basados en IEC 62304:2006 + AMD1:2015.*
  - *Documentación alineada con IEC 62304.*
  - *Evaluación de conformidad y clasificación regulatoria formal en curso.*

---

## 2. Evaluación de Aplicabilidad (7 Criterios Obligatorios)

### 2.1 Uso previsto de SISAP
SISAP by CENIVRA es una **plataforma informática de apoyo al registro clínico estructurado, aplicación y puntuación digital de instrumentos psicométricos, seguimiento longitudinal y análisis exploratorio dimensional** orientada al contexto de atención a personas con **Trastornos por Uso de Sustancias (TUS)**.

Su finalidad operativa en `v1.1.0` comprende:
1. Gestionar expedientes locales con separación entre identidad clínica y capa seudonimizada (`TUS-XXXX`).
2. Aplicar digitalmente reactivo por reactivo y puntuar de forma determinista el catálogo activo (`BIS-11`, `BSL-23`, `GAD-7`, `EROS`, `BADS`, `STAXI-2`).
3. Ejecutar la inferencia dimensional determinista del Autoencoder TUS sobre vectores estandarizados de 22 o 24 variables (con validación estricta D-06) y el análisis exploratorio longitudinal (RCI), léxico (`E1–E5`) y multimodal bajo **revisión humana obligatoria**.

### 2.2 Usuarios previstos
Los roles contemplados en el código fuente ([`src/types/clinical.ts`](../../../sisap-by-cenivra-%E2%80%94-sistema-de-informaci%C3%B3n-cl%C3%ADnica-y-gobernanza/src/types/clinical.ts)) se dividen en:
- **Personal clínico interpretador (`director_clinico`, `psicologo`, `medicina`, `enfermeria`, `consejero`, `trabajador_social`):** captura instrumentos, consulta historial, revisa formulaciones (`pending_human_review`) y adopta decisiones profesionales independientes.
- **Coordinación y consulta restringida (`coordinacion`, `viewer`):** supervisión operativa o lectura limitada según permisos de capa.
- **Administración técnica (`superadmin`, `admin`):** gestión de cuentas, respaldos, configuración e integridad del sistema, sin autoridad de prescripción ni validación clínica autónoma.

### 2.3 Entorno de utilización
- **Entorno clínico/institucional controlado:** consultorios, unidades de atención residencial o ambulatoria para TUS e infraestructura de investigación CENIVRA.
- **Entorno técnico de ejecución en `v1.1.0`:**
  - Aplicación de escritorio para **Windows 10/11 (x64)** empaquetada sobre **Electron v45** con persistencia en `%APPDATA%` o servidor local **Node.js `>=22.5.0` vinculado exclusivamente a interfaz loopback (`127.0.0.1:8080`)** con base **SQLite en modo WAL**.
  - Módulo opcional de verificación/cómputo científico en **R (`>=4.0`)** para reproducibilidad local.
- **No está diseñado para:** monitoreo crítico continuo de UCI, respuesta ante urgencias vitales en tiempo real, operación autónoma por el paciente sin supervisión profesional ni despliegue directo en internet público sin capa perimetral institucional.

### 2.4 Clasificación funcional por módulo (SaMD / Apoyo institucional / Investigación)

| Módulo / Función en SISAP `v1.1.0` | Categoría Funcional | Justificación |
|---|---|---|
| Gestión de identidad, padrón, expediente y bitácora WORM (`patientService`, `auditService`) | **Software de apoyo a procesos institucionales / historia clínica electrónica** | Registra, versiona y audita información administrativa y clínica sin transformar ni interpretar automáticamente conductas terapéuticas (incidencia NOM-004 / NOM-024 / LFPDPPP). |
| **Centro de Evaluación Psicométrica** (`instrumentCatalog`, `scoringEngine`, `psychometricService`) | **Apoyo estructurado a evaluación clínica (potencial componente de software clínico sujeto a evaluación SaMD)** | Automatiza la aplicación de escalas, inversiones (`5 - x`) y cálculo de sumas, subescalas e indicadores normativos descriptivos; un error de cálculo alteraría puntajes revisados por el clínico. |
| **Motor 1 — Autoencoder 22v/24v** (`autoencoderInferenceEngine`, `latentSpaceAnalyzer`) | **Componente analítico de apoyo exploratorio / investigación trasladada (validación externa pendiente)** | Proyecta 22/24 entradas a 12 dimensiones latentes **opacas (`MOD-03`)** sin etiquetas diagnósticas y compara distancias respecto a $N=166$; no emite diagnósticos ni clasificaciones nosológicas (`D-03` bloquea GMM). |
| **Motor 1 — Prototipo `17→12` (`ae_tus_17to12_m3k12`)** | **Software de investigación (exploratorio/confirmatorio aislado)** | Marcado explícitamente como `PROTOTIPO_CONFIRMATORIO_SIN_VALIDACION_CLINICA`; separado en endpoint comparativo dedicado. |
| **Motor 2 — Analítica Longitudinal RCI** (`analyticalService`) | **Apoyo descriptivo cuantitativo al seguimiento** | Calcula diferencias intraindividuales e Índice de Cambio Confiable (Jacobson-Truax ±1.96) con parámetros documentados y declaración explícita cuando son insuficientes (`INSUFFICIENT_OBSERVATIONS_LT2`). |
| **Motor 3 — Inteligencia Narrativa** (`narrativeService`) | **Apoyo descriptivo exploratorio de texto** | Ejecuta conteo léxico determinista por coincidencia explícita (`E1_explicit`); artefacto neuronal ONNX reportado como no listo (`inference_ready: false`). |
| **Motor 4 — Integración Multimodal** (`multimodalService`) | **Apoyo a organización y trazabilidad de datos** | Presenta matriz alineada de fuentes, fechas y completitud de 5 modalidades sin inferencia oculta. |
| **Motor 5 — Apoyo a Decisiones `E1–E5`** (`decisionSupportService`) | **Apoyo a la decisión clínica (CDSS informativo supervisado)** | Presenta hallazgos, incertidumbre y compositor de formulaciones que **siempre** nacen como `pending_human_review`; `automatic_diagnosis_disabled = true`, `therapeutic_prescription_disabled = true`. |

### 2.5 Consecuencias potenciales de errores de funcionamiento
1. **Error de cálculo o inversión psicométrica** (ej. inversión invertida o denominador erróneo): sobreestimación o subestimación de severidad sintomática que podría sesgar la priorización clínica si el profesional no contrasta el reactivo original. Mitigación: conservación de respuestas brutas en 3 niveles y pruebas unitarias `PSYC-01..09`.
2. **Imputación silenciosa de datos faltantes:** generar un puntaje o vector latente aparente sobre escalas incompletas ocultaría omisiones relevantes. Mitigación: compuerta estricta `D-06` y estado explícito `isValidForScoring: false`.
3. **Mezcla de versiones incompatibles en seguimiento longitudinal:** comparar `BADS v22` con `BADS v25` como si compartieran la misma escala numérica. Mitigación: campo obligatorio `instrument_version` y bandera `versionMismatchWarning`.
4. **Presentación engañosa de embeddings `12D` o clústeres como diagnósticos:** inducir falsamente a interpretar dimensiones latentes o agrupamientos estadísticos como categorías clínicas validadas. Mitigación: bloqueo `D-03`, etiquetas `MOD-03` y advertencia explícita obligatoria en UI y API.
5. **Pérdida, sobrescritura o fuga de PHI:** alteración retrospectiva de evaluaciones completadas o exposición de nombres/CURP en bitácoras. Mitigación: `HTTP 409 Conflict` al intentar editar `completed`, bitácora WORM con cadena SHA-256 y redacción de claves sensibles en `logger.js`.

### 2.6 Fronteras estrictas entre información descriptiva, apoyo a decisiones y funciones clínicas prohibidas

| Permitido (Informativo / Apoyo Supervisado) | Prohibido en SISAP `v1.1.0` |
|---|---|
| Presentar puntajes brutos, subescalas, percentiles empíricos ($N=166$) y RCI con su fórmula y origen. | Emitir diagnóstico nosológico (DSM-5 / CIE-11) de forma automática. |
| Exponer residuos de reconstrucción y distancia L2 en espacio latente opaco `latent_01..12`. | Asignar etiquetas clínicas automáticas o clústeres nosológicos (GMM excluido por `D-03`). |
| Etiquetar coincidencias léxicas literales como `E1_explicit` con revisión clínica pendiente. | Prescribir intervenciones farmacológicas, dosis o altas terapéuticas automáticas. |
| Detectar valores faltantes o mezclas de versión y solicitar confirmación humana. | Imputar silenciosamente ítems faltantes para completar vectores en producción (`D-06`). |

### 2.7 Requisitos adicionales del contexto regulatorio aplicable
Conforme al análisis verificado en [`Marco_Regulatorio_Mexicano_Aplicable.md`](../../18_regulatory/Marco_Regulatorio_Mexicano_Aplicable.md):
- **NOM-004-SSA3-2012 (Del expediente clínico):** identificación completa del paciente, fecha/hora, autoría y firma en notas, conservación e integridad no destructiva.
- **NOM-024-SSA3-2012 (Sistemas de registro electrónico en salud):** integridad, confiabilidad y disponibilidad de registros mediante versionado y respaldos.
- **LFPDPPP vigente (DOF 20/03/2025, reforma DOF 14/11/2025):** tratamiento reforzado de datos personales sensibles de salud, licitud, consentimiento y minimización antes de analítica/demo.
- **COFEPRIS / NOM-241-SSA1-2025:** contempla líneas regulatorias específicas para software como dispositivo médico (SaMD); la determinación regulatoria definitiva ante autoridad sanitaria permanece **pendiente de dictamen formal** previo a un eventual despliegue comercial externo como SaMD.
