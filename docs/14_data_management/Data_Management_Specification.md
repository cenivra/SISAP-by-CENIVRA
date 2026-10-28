# SISAP by CENIVRA

# Data Management Specification

**Documento:** Data Management Specification  
**Identificador:** SISAP-DMS-001  
**Versión:** 1.0  
**Estado:** Borrador controlado  
**Fecha:** Agosto 2026  
**Producto:** SISAP by CENIVRA  
**Plataforma:** Python / Dash  
**Responsable:** Psic. Lauro Gutiérrez Castro

---

# Control del documento

| Campo | Valor |
|---|---|
| Documento | Data Management Specification |
| Identificador | SISAP-DMS-001 |
| Versión | 1.0 |
| Estado | Borrador controlado |
| Producto | SISAP by CENIVRA |
| Plataforma | Python / Dash |
| Persistencia inicial | SQLite / SQLAlchemy |
| Datos principales | Datos clínicos, psicométricos, longitudinales y derivados |
| Uso analítico | Estadístico y Machine Learning |
| Marco relacionado | IEC 62304:2006 + AMD1:2015 / ISO 14971:2019, cuando corresponda |

---

# 1. Propósito

Este documento define cómo SISAP by CENIVRA gestionará los datos durante todo su ciclo de vida.

La especificación cubre:

- origen;
- adquisición;
- identificación;
- captura;
- validación;
- almacenamiento;
- calidad;
- clasificación;
- transformación;
- scoring;
- normalización;
- generación de variables derivadas;
- preparación para modelos;
- entrenamiento;
- validación;
- pruebas;
- inferencia;
- seguimiento longitudinal;
- trazabilidad;
- seguridad;
- control de versiones;
- conservación;
- y disposición.

El objetivo es garantizar que los datos utilizados por SISAP sean:

- identificables;
- trazables;
- íntegros;
- consistentes;
- apropiados para la función en la que se utilizan;
- y suficientemente documentados para reproducir los procesos relevantes.

---

# 2. Alcance

Este documento aplica a:

```text
Datos clínicos
Datos psicométricos
Datos longitudinales
Datos narrativos
Variables derivadas
Variables normalizadas
Representaciones latentes
Resultados ML
Datasets de entrenamiento
Datasets de validación
Datasets de prueba
Datasets de referencia
Datos de configuración
Metadatos
```

También aplica a los procesos que transforman datos.

---

# 3. Principio fundamental

Los datos no deberán considerarse solamente como valores almacenados.

En SISAP:

```text
Dato
 ↓
Contexto
 ↓
Validación
 ↓
Transformación
 ↓
Resultado
```

Por tanto, para datos clínicamente relevantes deberá poder determinarse, cuando corresponda:

```text
Qué dato fue utilizado
Qué transformación recibió
Qué versión de transformación se aplicó
En qué modelo se utilizó
Qué resultado produjo
```

---

# 4. Clasificación general de datos

Los datos se clasificarán inicialmente como:

```text
DAT-CLIN
Datos clínicos

DAT-PSY
Datos psicométricos

DAT-LONG
Datos longitudinales

DAT-NLP
Datos narrativos / NLP

DAT-DER
Datos derivados

DAT-ML
Datos utilizados por Machine Learning

DAT-REF
Datos de referencia

DAT-TEST
Datos de prueba

DAT-META
Metadatos
```

---

# 5. Datos clínicos

Podrán incluir:

- información demográfica autorizada;
- antecedentes relevantes;
- variables clínicas estructuradas;
- resultados de evaluaciones;
- indicadores;
- y variables necesarias para el uso previsto.

El conjunto exacto deberá definirse por esquema de datos.

---

# 6. Datos psicométricos

Los datos psicométricos incluyen:

```text
Instrument
Item
Response
Score
Subscore
Derived Variable
Validity Status
```

Cada respuesta deberá poder asociarse con:

- instrumento;
- versión;
- evaluación;
- paciente o identificador interno;
- y fecha.

---

# 7. Instrumentos psicométricos

Cada instrumento deberá poseer una definición controlada.

Ejemplo:

```text
Instrument ID
Instrument Name
Version
Items
Response Scale
Scoring Rules
Missing Data Rules
Score Range
```

---

# 8. Preguntas sobre instrumentos

### Pregunta DMS-001

¿Cuál es el inventario definitivo de instrumentos que SISAP utilizará en producción?

### Pregunta DMS-002

¿Qué versión exacta de cada instrumento se utilizará?

### Pregunta DMS-003

¿Qué instrumentos generan variables directamente utilizadas por los modelos ML?

### Pregunta DMS-004

¿Qué instrumentos son únicamente descriptivos?

**Respuesta:**

> Pendiente de especificación.

---

# 9. Identificación de datos

Cada entidad principal deberá disponer de un identificador.

Ejemplos:

```text
PATIENT_ID
ASSESSMENT_ID
RESPONSE_ID
RESULT_ID
EXECUTION_ID
MODEL_ID
DATASET_ID
```

---

# 10. Identificadores internos

SISAP deberá utilizar identificadores internos para relacionar registros siempre que sea posible.

Ejemplo:

```text
PAT-000123
EVAL-000431
EXEC-000852
```

Los identificadores no deberán contener información clínica innecesaria.

---

# 11. Separación de identidad y análisis

La arquitectura deberá permitir separar:

```text
Identity Data
      ≠
Clinical Data
      ≠
Analytical Features
```

cuando sea técnicamente y operativamente apropiado.

---

# 12. Relación entre paciente y evaluación

La relación deberá ser:

```text
Patient
   ↓
Assessment
   ↓
Responses
```

Una evaluación no deberá asociarse a un paciente inexistente.

---

# 13. Fecha y tiempo

Los datos relevantes deberán conservar información temporal.

Podrán distinguirse:

```text
assessment_date
created_at
updated_at
processed_at
```

Cuando corresponda.

---

# 14. Convención temporal

Deberá establecerse una convención uniforme para:

- fecha;
- hora;
- zona horaria;
- timestamps;
- y almacenamiento.

### Pregunta DMS-005

¿Cuál será la zona horaria oficial de los registros?

**Respuesta:**

> Pendiente de especificación.

---

# 15. Fuentes de datos

Cada dataset relevante deberá identificar su fuente.

Ejemplo:

```text
Source ID
Source Type
Collection Method
Collection Period
Responsible
```

---

# 16. Proveniencia

La proveniencia deberá poder representar:

```text
Source
 ↓
Dataset
 ↓
Processing
 ↓
Derived Dataset
```

---

# 17. Data Lineage

La trazabilidad de datos deberá seguir, cuando corresponda:

```text
Raw Data
   ↓
Validated Data
   ↓
Scored Data
   ↓
Transformed Data
   ↓
Normalized Data
   ↓
ML Features
   ↓
Model Output
```

---

# 18. Estados de datos

Los registros podrán asumir:

```text
RAW
VALIDATING
VALID
INVALID
MISSING
PROCESSED
DERIVED
ARCHIVED
DELETED
```

---

# 19. Validación de datos

Antes de utilizar datos en operaciones clínicas o ML deberán verificarse:

```text
Structure
Type
Range
Completeness
Consistency
Compatibility
```

---

# 20. Validación de tipos

Cada variable deberá tener un tipo esperado.

Ejemplos:

```text
integer
float
boolean
category
string
date
datetime
```

---

# 21. Validación de rangos

Cuando exista rango válido:

```text
minimum
maximum
```

deberá aplicarse antes del procesamiento.

---

# 22. Valores faltantes

SISAP deberá distinguir entre:

```text
MISSING
NOT_APPLICABLE
UNKNOWN
INVALID
VALID
```

cuando dichas categorías sean relevantes.

No deberá utilizarse un único valor de relleno para representar todas estas condiciones.

---

# 23. Tratamiento de valores faltantes

El procedimiento de tratamiento dependerá de la variable y su uso.

Podrá incluir:

```text
Complete Case
Imputation
Model-specific Handling
No Processing
```

La estrategia deberá documentarse.

---

# 24. Preguntas sobre missing data

### Pregunta DMS-006

¿Qué política se utilizará para valores faltantes de cada instrumento?

### Pregunta DMS-007

¿Se utilizará imputación?

### Pregunta DMS-008

¿La imputación será previa al scoring, posterior al scoring o específica para ML?

### Pregunta DMS-009

¿Qué porcentaje máximo de datos faltantes permitirá el sistema?

**Respuesta:**

> Pendiente de especificación por instrumento y modelo.

---

# 25. Datos inválidos

Un dato identificado como inválido:

```text
NO
↓
Scoring
NO
↓
Model
NO
↓
Risk
```

salvo que exista una transformación o procedimiento explícitamente aprobado.

---

# 26. Datos no aplicables

Un dato `NOT_APPLICABLE` no deberá interpretarse automáticamente como:

```text
0
```

o como otra categoría numérica válida.

---

# 27. Validación semántica

Además de validaciones sintácticas deberá considerarse, cuando sea aplicable:

```text
Cross-variable consistency
Temporal consistency
Clinical consistency
Instrument consistency
```

---

# 28. Reglas de consistencia

Podrán existir reglas como:

```text
Assessment belongs to Patient
Response belongs to Instrument
Result belongs to Assessment
Model Result belongs to Execution
Alert belongs to Risk Context
```

---

# 29. Calidad de datos

SISAP considerará como dimensiones principales:

```text
Completeness
Validity
Accuracy
Consistency
Timeliness
Uniqueness
Traceability
```

---

# 30. Indicadores de calidad

Podrán utilizarse:

```text
Missingness Rate
Invalid Value Rate
Duplicate Rate
Completeness Rate
Out-of-range Rate
```

Los umbrales de aceptación deberán definirse según el uso.

---

# 31. Calidad psicométrica

Cuando sea relevante, los datasets utilizados para investigación o modelos podrán documentar:

- distribución de respuestas;
- valores extremos;
- consistencia;
- dimensionalidad;
- y otras propiedades pertinentes.

La calidad estadística de un dataset no sustituye su validación funcional para el uso de SISAP.

---

# 32. Transformación de datos

Las transformaciones deberán estar documentadas.

Ejemplos:

```text
Recoding
Reverse scoring
Aggregation
Scaling
Log transformation
Standardization
Feature engineering
```

---

# 33. Identificación de transformaciones

Cada transformación relevante deberá poseer:

```text
Transformation ID
Version
Input
Output
Formula / Rule
Purpose
```

---

# 34. Ejemplo de transformación

```text
TRANS-001

Input:
Raw score

Operation:
z = (x - mean) / sd

Output:
Standardized score

Version:
TRANS-001-v1
```

---

# 35. Transformaciones clínicas

Las transformaciones que afecten resultados clínicos deberán mantenerse bajo control de configuración.

---

# 36. Transformaciones para ML

Las transformaciones requeridas por un modelo deberán asociarse al modelo.

```text
Model
 ↓
Preprocessing Version
 ↓
Transformation Version
```

---

# 37. Normalización

Los parámetros de normalización deberán tratarse como artefactos controlados.

Ejemplo:

```text
Normalization ID
Version
Variable
Mean
SD
Method
```

---

# 38. Preguntas sobre normalización

### Pregunta DMS-010

¿Cuál es el procedimiento exacto de normalización por modelo?

### Pregunta DMS-011

¿Los parámetros proceden del dataset de entrenamiento?

### Pregunta DMS-012

¿Cómo se almacenarán?

### Pregunta DMS-013

¿Cómo se verificará que el modelo reciba la normalización correcta?

**Respuesta:**

> Pendiente de especificación por modelo.

---

# 39. Datos derivados

Los datos derivados deberán identificarse como tales.

Ejemplo:

```text
RAW
 ↓
DERIVED
```

La variable derivada deberá conservar referencia a su fuente y transformación cuando sea necesario.

---

# 40. Variables compuestas

Las variables compuestas deberán documentar:

- componentes;
- fórmula;
- reglas;
- tratamiento de faltantes;
- versión.

---

# 41. Variables latentes

Las variables latentes derivadas de modelos deberán identificarse como:

```text
Latent Variable
```

y no deberán confundirse con variables observadas directamente.

---

# 42. Perfil dimensional

Una representación dimensional deberá conservar:

```text
Dimension ID
Value
Version
Assessment
Timestamp
```

---

# 43. Datos de entrada para ML

Cada modelo deberá poseer un esquema de entrada.

Ejemplo:

```text
Input Schema:
AE-SCHEMA-03
```

El esquema deberá indicar:

```text
Variables
Order
Types
Allowed Range
Missingness
Transformation
Normalization
```

---

# 44. Compatibilidad de datos con modelos

Antes de inferencia:

```text
Data
 ↓
Schema Validation
 ↓
Transformation Validation
 ↓
Normalization Validation
 ↓
Model Compatibility
```

---

# 45. Dataset de entrenamiento

Cada dataset de entrenamiento deberá identificarse:

```text
Dataset ID
Version
Source
Population
Variables
Collection Period
Processing
```

---

# 46. Dataset de validación

Debe distinguirse del dataset de entrenamiento.

Su finalidad deberá estar documentada.

---

# 47. Dataset de prueba

Deberá mantenerse separado cuando se utilice para evaluación independiente del modelo.

---

# 48. Dataset de referencia

Podrán existir datasets de referencia para:

- pruebas;
- regresión;
- validación;
- benchmarking.

---

# 49. Separación de datasets

La documentación deberá mostrar:

```text
Training
Validation
Test
```

y justificar la estrategia de separación.

---

# 50. Prevención de Data Leakage

Deberá evaluarse la posibilidad de que información del conjunto de validación o prueba se introduzca inadvertidamente en:

- entrenamiento;
- selección de variables;
- normalización;
- imputación;
- ajuste de hiperparámetros.

---

# 51. Preguntas de Data Leakage

### Pregunta DMS-014

¿La normalización se calcula únicamente con entrenamiento?

### Pregunta DMS-015

¿La selección de variables utiliza información del conjunto de prueba?

### Pregunta DMS-016

¿Existen pacientes repetidos entre entrenamiento y prueba?

### Pregunta DMS-017

¿Existen evaluaciones longitudinales del mismo paciente en distintos splits?

**Respuesta:**

> Pendiente de auditoría de datasets.

---

# 52. Dependencia longitudinal

Cuando existan múltiples observaciones del mismo paciente, la estrategia de partición deberá evitar fuga de información entre conjuntos cuando esto comprometa la independencia de evaluación.

---

# 53. Datos de entrenamiento históricos

Cuando los modelos utilicen datos históricos deberá documentarse:

```text
Population
Period
Source
Inclusion
Exclusion
```

---

# 54. Criterios de inclusión

Los datasets deberán documentar los criterios utilizados para incluir observaciones.

---

# 55. Criterios de exclusión

También deberán documentarse las exclusiones.

---

# 56. Datos atípicos

Los valores atípicos deberán identificarse según reglas documentadas.

No deberán eliminarse automáticamente sin justificación.

---

# 57. Preguntas sobre outliers

### Pregunta DMS-018

¿Qué procedimiento define un outlier?

### Pregunta DMS-019

¿Cuándo se conserva?

### Pregunta DMS-020

¿Cuándo se corrige?

### Pregunta DMS-021

¿Cuándo se excluye?

**Respuesta:**

> Pendiente de especificación.

---

# 58. Duplicados

Los datasets deberán evaluarse respecto de duplicados.

La definición de duplicado deberá depender de la entidad.

---

# 59. Corrección de datos

Toda corrección relevante deberá poder identificarse.

Ejemplo:

```text
Original
   ↓
Correction
   ↓
Corrected Version
```

---

# 60. Conservación del dato original

Cuando sea necesario para trazabilidad, deberá conservarse el dato original y registrarse la transformación o corrección aplicada.

---

# 61. Datos de auditoría

Los datos de auditoría deberán permanecer separados de los datos analíticos.

---

# 62. Datos de producción

Los datos de producción no deberán utilizarse automáticamente como datos de desarrollo o prueba.

Su uso deberá estar autorizado y controlado.

---

# 63. Datos de prueba

Se dará preferencia a:

```text
Synthetic
De-identified
Controlled Reference Data
```

---

# 64. Datos sintéticos

Cuando se utilicen datos sintéticos deberá identificarse:

```text
Synthetic Dataset ID
Generation Method
Version
Purpose
```

## 64.1 Espacio sintético de la estación de trabajo (datos sembrados)

```text
Synthetic Dataset ID   SISAP-SYN-DB-001
Generation Method      bin/sembrar_demo.py (sembrador reproducible y determinista)
Version                0.1.0
Purpose                Demostración del flujo clínico completo en la estación de trabajo
```

Alcance: cuatro expedientes ficticios con alias ASCII (clave operativa) y nombre ficticio
completo en la capa de identidad clínica; entrevista exploratoria con el catálogo canónico
(bloque previo + 14 secciones, 145 campos); diez narraciones semanales por paciente con las
ocho preguntas canónicas en su orden; notas de evolución derivadas del expediente ficticio de
ese mismo paciente; escalas y plan de tratamiento confirmado. Toda identidad visible lleva la
marca `DATO SINTÉTICO DE DEMOSTRACIÓN — NO CORRESPONDE A PERSONA REAL`. No existe ni se
escribe tabla, diccionario, comentario o archivo que relacione un paciente real con uno
sintético.

## 64.2 Espacio sintético de la página pública de demostración

```text
Synthetic Dataset ID   SISAP-SYN-WEB-001
Generation Method      bin/generar_demo_html.py (prosa y tablas generadas por campo)
Version                0.1.0
Purpose                Demostración pública documentada, con validación de anonimización
```

Alcance: cuatro casos ficticios; entrevista exploratoria completa, con prosa propia por campo
apoyada en el expediente ficticio de cada caso; narración semanal longitudinal de diez
semanas; notas de evolución con versionado no destructivo (original y corrección con motivo);
plan de tratamiento; representaciones por rama. La generación **falla y no escribe archivo**
si alguno de los doce puntos de anonimización no pasa.

## 64.3 Disyunción y frontera de los espacios sintéticos

```text
SISAP-SYN-DB-001  : ninguna identidad ficticia completa (nombre o alias) se repite
SISAP-SYN-WEB-001 : respecto del otro espacio, ni coincide con el material clínico real
```

La comprobación contra el material clínico real se ejecuta en cada generación de la página
pública: se comparan 8-gramas de palabras sobre la **prosa generada**. El **texto de
instrumento** (títulos de sección, preguntas de la guía y etiquetas del catálogo) no es un
espacio sintético: es texto del producto, compartido por diseño con cualquier levantamiento
hecho con el mismo cuestionario, por lo que se excluye del cotejo y se informa su conteo por
separado. Ningún nombre, identificador ni valor del material real se copia a los artefactos
ni se imprime: sólo se cuenta.

---

# 65. Datos anonimizados / desidentificados

Cuando se utilicen datos desidentificados, deberá documentarse el procedimiento correspondiente.

---

# 66. Preguntas de privacidad

### Pregunta DMS-022

¿Qué datos serán considerados directamente identificables?

### Pregunta DMS-023

¿Qué mecanismo se utilizará para pseudonimización?

### Pregunta DMS-024

¿Qué datos serán visibles para cada rol?

### Pregunta DMS-025

¿Qué datos podrán exportarse?

**Respuesta:**

> Pendiente de especificación institucional y de seguridad.

---

# 67. Almacenamiento

La persistencia inicial utilizará:

```text
SQLite
+
SQLAlchemy
```

La estructura de almacenamiento deberá mantener separación lógica entre:

```text
Patients
Assessments
Results
Audit
Models
```

---

# 68. Integridad referencial

Deberá preservarse:

```text
Patient
 ↓
Assessment
 ↓
Result
```

---

# 69. Persistencia de resultados

Los resultados relevantes deberán poder recuperar su contexto de generación.

---

# 70. Datos almacenados como JSON

Cuando un conjunto estructurado se almacene como JSON:

- deberá existir un esquema;
- deberá existir una versión;
- deberá validarse su estructura;
- y deberá ser posible procesarlo de forma determinista.

---

# 71. Evolución del esquema

Los cambios de estructura deberán utilizar migraciones controladas.

---

# 72. Versionado de datasets

Cada dataset controlado deberá tener:

```text
Dataset ID
Version
Status
```

---

# 73. Estados de datasets

```text
DRAFT
DEVELOPMENT
VALIDATION
APPROVED
ACTIVE
DEPRECATED
RETIRED
```

---

# 74. Versionado de datasets clínicos

Una modificación significativa deberá generar una nueva versión.

Ejemplo:

```text
DATA-0.3
   ↓
DATA-0.4
```

---

# 75. Versionado de datasets ML

Cada dataset utilizado para entrenar o validar modelos deberá conservar su versión.

---

# 76. Dataset Manifest

Se recomienda que cada dataset relevante tenga un manifest:

```json
{
  "dataset_id": "VAL-DATA-001",
  "version": "0.3",
  "purpose": "model_validation",
  "source": "...",
  "variables": [],
  "sample_size": 0,
  "processing_version": "PROC-03"
}
```

---

# 77. Data Processing Pipeline

El procesamiento podrá representarse:

```text
Raw Dataset
      ↓
Validation
      ↓
Cleaning
      ↓
Transformation
      ↓
Scoring
      ↓
Feature Engineering
      ↓
Normalization
      ↓
Model Input
```

---

# 78. Reproducibilidad del pipeline

Un pipeline deberá poder identificarse mediante:

```text
Pipeline Version
Code Version
Dataset Version
Configuration Version
```

---

# 79. Scripts de procesamiento

Los scripts que transformen datos relevantes deberán estar bajo control de configuración.

---

# 80. Prohibición de procesamiento manual no registrado

Los cambios manuales en datasets utilizados para modelos o validación deberán evitarse.

Cuando sean inevitables, deberán documentarse.

---

# 81. Preprocesamiento automatizado

El preprocesamiento relevante deberá preferentemente automatizarse para reducir variabilidad.

---

# 82. Validación del pipeline

El pipeline deberá probar:

```text
Input
 ↓
Expected Transformation
 ↓
Expected Output
```

---

# 83. Golden Dataset

SISAP deberá mantener datasets de referencia para verificar que las transformaciones produzcan resultados esperados.

Ejemplo:

```text
GOLD-DATA-001
```

---

# 84. Golden Transform Tests

Ejemplo:

```text
Input:
X

Expected:
Z

Observed:
Z
```

---

# 85. Datos para scoring

Debe existir al menos un conjunto controlado de casos con:

```text
Responses
Expected Scores
```

para verificar scoring.

---

# 86. Datos para normalización

Debe existir un conjunto controlado para comprobar:

```text
Raw Feature
Expected Normalized Feature
```

---

# 87. Datos para ML

Debe existir un conjunto controlado para evaluar:

```text
Input
Model
Expected Output / Tolerance
```

cuando sea posible.

---

# 88. Datos longitudinales

Los datos longitudinales deberán conservar:

```text
Patient
Assessment Date
Assessment ID
Variable Version
Model Version
```

cuando corresponda.

---

# 89. Comparabilidad longitudinal

Antes de comparar dos observaciones deberá evaluarse:

```text
Variable Definition
Instrument Version
Processing Version
Model Version
```

cuando sean relevantes.

---

# 90. Datos NLP

Las narrativas deberán conservar, cuando corresponda:

```text
Narrative ID
Assessment ID
Text Version
Processing Version
NLP Model Version
```

---

# 91. Seguridad de datos

El acceso a datos deberá seguir:

```text
Authentication
 ↓
Authorization
 ↓
Data Access
```

---

# 92. Acceso por mínimo privilegio

Los usuarios deberán acceder únicamente a los datos necesarios para sus funciones.

---

# 93. Exportación de datos

Las exportaciones deberán estar controladas.

Deberán identificarse:

```text
Who
What
When
Why / Context when required
```

---

# 94. Datos en logs

Los logs no deberán contener innecesariamente:

- información identificable;
- respuestas clínicas completas;
- contraseñas;
- secretos.

---

# 95. Datos en errores

Los mensajes de error no deberán exponer información clínica innecesaria.

---

# 96. Backup

Los mecanismos de respaldo deberán preservar la integridad de los datos.

Deberán definirse posteriormente:

```text
Frequency
Retention
Encryption where applicable
Recovery
Testing
```

---

# 97. Recuperación

La estrategia deberá permitir recuperar datos sin romper:

```text
Patient
Assessment
Result
Audit
```

---

# 98. Retención

Deberá establecerse una política para:

- datos clínicos;
- datasets;
- resultados;
- logs;
- auditoría;
- y datasets históricos de modelos.

---

# 99. Preguntas sobre retención

### Pregunta DMS-026

¿Cuánto tiempo deberán conservarse las evaluaciones?

### Pregunta DMS-027

¿Cuánto tiempo deberán conservarse resultados históricos?

### Pregunta DMS-028

¿Cuánto tiempo deberán conservarse datasets de validación?

### Pregunta DMS-029

¿Cuánto tiempo deberán conservarse modelos retirados?

**Respuesta:**

> Pendiente de política institucional y requisitos aplicables.

---

# 100. Archivado

Los datos que deban conservarse pero no estén en operación activa podrán pasar a:

```text
ARCHIVED
```

---

# 101. Eliminación

La eliminación de datos deberá estar controlada.

---

# 102. Trazabilidad de eliminación

Cuando una eliminación deba registrarse, deberá poder determinarse:

```text
What
When
Who
Reason
```

---

# 103. Cambios en datos clínicos

Las modificaciones relevantes deberán mantener trazabilidad cuando sea necesario.

---

# 104. Correcciones de datos

Una corrección no deberá borrar silenciosamente la historia cuando la trazabilidad requiera conservarla.

---

# 105. Calidad de datos para ML

Antes de utilizar un dataset para ML deberá evaluarse:

```text
Completeness
Validity
Duplicates
Outliers
Distribution
Missingness
Representativeness
Leakage
```

---

# 106. Representatividad

Deberá documentarse en qué medida los datos representan la población para la cual se pretende utilizar el modelo.

---

# 107. Preguntas sobre representatividad

### Pregunta DMS-030

¿Cuál es la población de referencia de cada modelo?

### Pregunta DMS-031

¿Existe diferencia entre la población de entrenamiento y la población de uso previsto?

### Pregunta DMS-032

¿Qué variables podrían generar distribución diferente?

**Respuesta:**

> Pendiente de análisis por modelo.

---

# 108. Distribución de variables

Cuando sea relevante, deberán analizarse:

```text
Mean
Variance
Range
Skewness
Missingness
Distribution
```

---

# 109. Distribución temporal

Cuando los datos sean longitudinales deberán considerarse cambios de distribución a través del tiempo.

---

# 110. Data Drift

Cuando el modelo esté en producción y exista un mecanismo de monitorización:

```text
Reference Data
      ↓
Current Data
      ↓
Drift Analysis
```

---

# 111. Preguntas sobre drift

### Pregunta DMS-033

¿Qué variables se utilizarán para detectar drift?

### Pregunta DMS-034

¿Qué método se utilizará?

### Pregunta DMS-035

¿Qué umbral activará revisión?

**Respuesta:**

> Pendiente de especificación conjunta con Model Management.

---

# 112. Seguridad de datasets

Los datasets sensibles deberán almacenarse con control de acceso apropiado.

---

# 113. Separación de ambientes

Los datos de:

```text
Development
Testing
Validation
Production
```

deberán mantenerse separados cuando corresponda.

---

# 114. Copias de producción

No deberán copiarse datos de producción a desarrollo sin la autorización y controles correspondientes.

---

# 115. Acceso de desarrolladores

El acceso de desarrolladores a datos clínicos reales deberá limitarse al mínimo necesario.

---

# 116. Datos para pruebas automatizadas

Las pruebas automatizadas deberán utilizar preferentemente datos:

```text
Synthetic
De-identified
Deterministic
```

---

# 117. Esquema de datos

Cada dataset estructurado deberá tener un esquema definido.

El esquema podrá incluir:

```text
Field
Type
Allowed Values
Nullable
Range
Description
Source
```

---

# 118. Data Dictionary

SISAP deberá mantener un diccionario de datos controlado.

Archivo futuro:

```text
data_dictionary.csv
```

Columnas:

```text
variable_id
name
label
type
domain
unit
source
allowed_values
missing_rule
transformation
description
version
```

---

# 119. Relación con Clinical Constants

Los nombres clínicos definidos en `app/clinical/constants.py` deberán mantenerse consistentes con el diccionario de datos.

---

# 120. Cambios de variables

Agregar, eliminar, renombrar o cambiar el significado de una variable deberá considerarse un cambio controlado.

---

# 121. Cambios de codificación

Cambiar:

```text
0 / 1
```

por:

```text
False / True
```

o modificar categorías deberá activar revisión de impacto cuando afecte funciones existentes.

---

# 122. Unidades

Cuando una variable tenga unidad, deberá documentarse.

---

# 123. Rangos

Cuando exista un rango permitido, deberá documentarse.

---

# 124. Derivación

Las variables derivadas deberán identificar su origen.

Ejemplo:

```text
ATQ8_total_z
       ↓
Source:
ATQ8_total
```

---

# 125. Transformación auditable

Una variable derivada deberá poder relacionarse con:

```text
Input
Formula
Version
Output
```

---

# 126. Datos para análisis estadístico

Los datasets analíticos deberán conservar información suficiente para reproducir transformaciones relevantes.

---

# 127. Datos para investigación

Los datasets destinados a investigación deberán mantenerse separados de los datasets operativos cuando sea apropiado.

---

# 128. Cambios en datasets de investigación

Los cambios no deberán alterar retrospectivamente una versión previamente utilizada sin generar una nueva versión.

---

# 129. Integración con Model Management

La relación será:

```text
Dataset
 ↓
Model Training
 ↓
Model Version
```

y:

```text
Dataset
 ↓
Model Validation
 ↓
Model Approval
```

---

# 130. Integración con Configuration Management

Los datasets relevantes podrán convertirse en Configuration Items.

Ejemplo:

```text
CI-DATA-001
DATA-VAL-03
```

---

# 131. Integración con Risk Management

Los riesgos relacionados con datos podrán incluir:

```text
Invalid Input
Missing Data
Data Leakage
Wrong Distribution
Wrong Patient
Wrong Assessment
Corrupted Data
```

---

# 132. Integración con Verification

Los procesos de datos deberán tener pruebas:

```text
Data Rule
 ↓
Test
 ↓
Expected Result
```

---

# 133. Integración con Validation

La adecuación de los datos para el uso previsto podrá evaluarse durante la validación del sistema y de los modelos.

---

# 134. Data Lineage hacia resultados

La trazabilidad completa podrá representarse:

```text
Source Data
    ↓
Dataset Version
    ↓
Processing Version
    ↓
Feature Version
    ↓
Model Version
    ↓
Result
```

---

# 135. Ejecución reproducible

Una ejecución analítica deberá poder identificarse mediante:

```text
Dataset
+
Processing
+
Configuration
+
Model
+
Software
```

---

# 136. Control de artefactos

Los siguientes elementos deberán estar controlados:

```text
Datasets
Schemas
Transforms
Normalization Parameters
Feature Definitions
Processing Scripts
```

---

# 137. Prohibición de sobrescritura silenciosa

No deberá reemplazarse un dataset controlado sin:

```text
Version Increment
```

y registro de cambio cuando corresponda.

---

# 138. Criterios de calidad para dataset de ML

Un dataset deberá poder considerarse apto para uso en un modelo cuando:

- la procedencia esté documentada;
- la estructura esté definida;
- los datos hayan sido validados;
- no exista leakage conocido no controlado;
- la preparación sea reproducible;
- y exista una justificación de su adecuación.

---

# 139. Estado de datasets

El estado deberá reflejar el nivel de aprobación.

Ejemplo:

```text
TRAINING
VALIDATION
APPROVED
RETIRED
```

---

# 140. Dataset Approval Record

Ejemplo:

```text
DATASET APPROVAL RECORD

Dataset:
VAL-DATA-001

Version:
0.3

Purpose:
Model validation

Population:
________________

Sample Size:
________________

Quality Review:
PASS

Leakage Review:
PASS

Risk Review:
PASS

Approved By:
________________

Date:
________________
```

---

# 141. Criterios de rechazo de dataset

Un dataset podrá rechazarse cuando:

- no se conozca su procedencia;
- presente problemas graves de calidad;
- exista leakage no controlado;
- no sea representativo para el propósito;
- o no sea reproducible.

---

# 142. Criterios de retiro de dataset

Un dataset podrá retirarse cuando:

- sea sustituido;
- exista un error;
- deje de ser compatible;
- o presente un problema que impida su uso.

---

# 143. Conservación de datasets históricos

Los datasets utilizados para generar modelos o resultados importantes deberán conservarse cuando sean necesarios para reproducibilidad.

---

# 144. Datasets y privacidad

La conservación deberá equilibrar:

```text
Reproducibility
+
Security
+
Privacy
```

---

# 145. Datasets de entrenamiento sensibles

Cuando un dataset de entrenamiento contenga información sensible, su almacenamiento deberá estar separado del repositorio de código.

---

# 146. Exportación de datasets

Toda exportación deberá estar controlada y registrada cuando sea relevante.

---

# 147. Datasets utilizados en producción

La versión exacta utilizada deberá poder identificarse.

---

# 148. Auditoría de datos

Cuando corresponda, podrán realizarse revisiones de:

```text
Completeness
Consistency
Version
Provenance
Access
Transformation
```

---

# 149. Data Quality Record

Ejemplo:

```text
DATA-QUALITY-001

Dataset:
DATA-ML-03

Completeness:
________

Invalid Rate:
________

Duplicate Rate:
________

Leakage:
PASS / FAIL

Representativeness:
________

Conclusion:
________
```

---

# 150. Gestión de cambios de datos

Los cambios relevantes deberán seguir:

```text
Change Request
 ↓
Impact Analysis
 ↓
Risk Review
 ↓
Data Processing
 ↓
Verification
 ↓
Approval
 ↓
New Version
```

---

# 151. Cambio de dataset y modelo

Cuando cambie un dataset de entrenamiento:

```text
Dataset vN
   ↓
Retraining
   ↓
Model vN+1
   ↓
Validation
```

---

# 152. Cambio de esquema

Cuando cambie el esquema:

```text
Schema vN
   ↓
Schema vN+1
```

deberá evaluarse compatibilidad con:

- software;
- modelos;
- reportes;
- pruebas.

---

# 153. Cambio de transformación

Un cambio de transformación deberá revisar:

```text
Derived Variables
Models
Results
Risk
Tests
```

---

# 154. Cambio de normalización

Un cambio de normalización deberá revisar:

```text
Model Input
Model
Results
Risk
```

---

# 155. Criterios de aceptación del Data Management Specification

Este documento podrá pasar a baseline cuando estén definidos:

- inventario de datos;
- diccionario de datos;
- instrumentos;
- validación;
- missing data;
- transformaciones;
- normalización;
- datasets ML;
- separación de entrenamiento/validación/prueba;
- política de leakage;
- privacidad;
- retención;
- versionado;
- lineage;
- y responsabilidades.

---

# 156. Estado actual

| Elemento | Estado |
|---|---|
| Clasificación de datos | Definida |
| Identificadores | Definidos |
| Datos psicométricos | Definidos conceptualmente |
| Validación | Definida |
| Missing Data | Marco definido |
| Transformaciones | Definidas |
| Normalización | Definida |
| Data Lineage | Definido |
| Datasets ML | Marco definido |
| Leakage | Identificado como requisito |
| Datos longitudinales | Definidos |
| NLP | Definido |
| Data Dictionary | Planificado |
| Calidad | Definida |
| Privacidad | Marco definido |
| Retención | Pendiente |
| Drift | Pendiente |
| Representatividad | Pendiente |
| Inventario real | Pendiente |

---

# 157. Preguntas pendientes de definición

### Datos clínicos

- ¿Cuál es el conjunto mínimo de datos clínicos?
- ¿Qué variables son obligatorias?
- ¿Qué datos identificables serán almacenados?

### Psicometría

- ¿Qué instrumentos entran en producción?
- ¿Qué versiones?
- ¿Qué reglas de faltantes?
- ¿Qué reglas de scoring?

### Transformaciones

- ¿Cuál es el pipeline exacto?
- ¿Qué transformaciones son obligatorias?
- ¿Qué transformaciones se aplican sólo a ML?

### Normalización

- ¿Qué parámetros utiliza cada modelo?
- ¿De qué dataset provienen?

### ML

- ¿Cómo se separan los datasets?
- ¿Cómo se evita leakage?
- ¿Cómo se manejan pacientes longitudinales?
- ¿Qué población representa cada dataset?

### Calidad

- ¿Qué niveles mínimos de completitud se exigirán?
- ¿Qué tasa máxima de datos inválidos será aceptable?

### Privacidad

- ¿Qué datos podrá ver cada rol?
- ¿Qué datos pueden exportarse?
- ¿Qué mecanismo de pseudonimización se utilizará?

### Retención

- ¿Qué se conserva?
- ¿Durante cuánto tiempo?
- ¿Qué se archiva?
- ¿Qué se elimina?

### Monitorización

- ¿Se monitorizará drift?
- ¿Con qué método?
- ¿Quién revisará los resultados?

**Respuesta general:**

> Pendiente de especificación con base en los datasets, instrumentos, modelos, requisitos institucionales y entorno operativo definitivos.

---

# 158. Estructura física futura

Cuando el proyecto madure, el contenido podrá dividirse:

```text
docs/
└── 14_data_management/
    │
    ├── Data_Management_Specification.md
    ├── data_dictionary.csv
    ├── dataset_inventory.csv
    ├── transformation_registry.csv
    ├── normalization_registry.csv
    │
    ├── dataset_manifests/
    ├── data_quality_records/
    ├── lineage_records/
    └── validation_records/
```

---

# 159. Posibles documentos futuros derivados

### Data Dictionary

```text
data_dictionary.md
```

### Dataset Management

```text
dataset_management.md
```

### Data Quality

```text
data_quality_management.md
```

### Data Lineage

```text
data_lineage.md
```

La división se realizará únicamente cuando el volumen documental lo justifique.

---

# 160. Responsabilidades

| Rol | Responsabilidad |
|---|---|
| Responsable del producto | Aprobación general |
| Responsable clínico | Definiciones clínicas |
| Responsable de datos | Calidad y estructura |
| Responsable de ML | Datasets de modelos |
| Responsable de software | Implementación |
| Responsable de riesgos | Riesgos asociados a datos |
| Responsable de verificación | Evidencia |
| Responsable de configuración | Versionado |

---

# 161. Aprobación

| Rol | Responsable | Estado |
|---|---|---|
| Responsable del producto | Psic. Lauro Gutiérrez Castro | Pendiente |
| Responsable clínico | Psic. Lauro Gutiérrez Castro | Pendiente |
| Responsable de datos | Pendiente | Pendiente |
| Responsable de software | Pendiente | Pendiente |
| Responsable de ML | Pendiente | Pendiente |
| Responsable de riesgos | Pendiente | Pendiente |
| Responsable de verificación | Pendiente | Pendiente |
| Responsable de configuración | Pendiente | Pendiente |

---

# 162. Historial de versiones

| Versión | Fecha | Descripción |
|---|---|---|
| 0.1 | Agosto 2026 | Estructura inicial |
| 0.9 | Pendiente | Revisión técnica |
| 1.0 | Pendiente | Baseline inicial |
| 1.x | Futuro | Cambios controlados |

---

# 163. Declaración

> **SISAP by CENIVRA Data Management Specification define las reglas y controles para gestionar los datos utilizados por el sistema durante todo su ciclo de vida.**
>
> La especificación establece mecanismos para controlar la captura, validación, transformación, normalización, almacenamiento, uso analítico, entrenamiento y evaluación de modelos, trazabilidad, calidad, seguridad, versionado y conservación de datos.
>
> Los datasets utilizados para Machine Learning deberán estar identificados, versionados y asociados con su finalidad y modelo correspondiente.
>
> Las transformaciones y parámetros que puedan afectar resultados clínicos deberán mantenerse bajo control de configuración.
>
> Las políticas concretas de retención, privacidad, calidad, representatividad y monitorización deberán completarse antes de establecer la baseline definitiva del sistema.
>
> Este documento no constituye por sí mismo una certificación, declaración de conformidad ni autorización regulatoria.