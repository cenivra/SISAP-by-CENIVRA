# SISAP by CENIVRA

# Model Management Plan

**Documento:** Model Management Plan  
**Identificador:** SISAP-MMP-001  
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
| Documento | Model Management Plan |
| Identificador | SISAP-MMP-001 |
| Versión | 1.0 |
| Estado | Borrador controlado |
| Producto | SISAP by CENIVRA |
| Plataforma | Python / Dash |
| Componentes | Modelos estadísticos y Machine Learning |
| Marco de desarrollo | IEC 62304:2006 + AMD1:2015 |
| Gestión de riesgos | Integrada con el proceso de gestión de riesgos |
| Validación | Definida por el uso previsto y los requisitos del producto |

---

# 1. Propósito

Este documento establece el proceso para identificar, desarrollar, evaluar, validar, aprobar, versionar, desplegar, monitorizar, modificar y retirar los modelos de aprendizaje automático utilizados por SISAP by CENIVRA.

El objetivo es garantizar que:

- cada modelo esté identificado;
- su propósito esté definido;
- sus entradas estén controladas;
- su preprocesamiento esté documentado;
- sus parámetros estén controlados;
- su versión sea inequívoca;
- su integridad pueda verificarse;
- su desempeño haya sido evaluado;
- sus limitaciones sean conocidas;
- su uso esté restringido al dominio validado;
- sus modificaciones sean controladas;
- y su incorporación al software pueda ser trazada.

La gestión de modelos deberá integrarse con:

```text
Modelo
   ↓
Software
   ↓
Configuración
   ↓
Riesgo
   ↓
Verificación
   ↓
Validación
   ↓
Release
```

---

# 2. Alcance

Este plan aplica a los modelos utilizados para:

- representación dimensional;
- reducción dimensional;
- clustering;
- clasificación;
- predicción;
- estimación de riesgo;
- reconstrucción;
- detección de patrones;
- procesamiento NLP;
- y cualquier otra función analítica basada en modelos.

Incluye:

```text
Modelo
Datos de entrenamiento
Datos de validación
Datos de prueba
Preprocesamiento
Normalización
Parámetros
Artefactos
Runtime
Configuración
Resultados
Versionado
Validación
Monitorización
Retiro
```

---

# 3. Principio fundamental

Un modelo no se considerará un componente aislado.

La configuración válida de un modelo será:

```text
MODEL
+
INPUT SCHEMA
+
PREPROCESSING
+
NORMALIZATION
+
CONFIGURATION
+
RUNTIME
```

Por lo tanto:

```text
modelo.h5
```

por sí solo **no representa una configuración completa del modelo**.

---

# 4. Definición de modelo

A efectos de SISAP, un modelo será un artefacto computacional entrenado o parametrizado que transforme entradas definidas en una o más salidas conforme a una especificación determinada.

Podrá incluir:

```text
Neural Network
Autoencoder
GMM
Classifier
Regression Model
Clustering Model
NLP Model
Dimensionality Reduction Model
```

---

# 5. Preguntas iniciales sobre el componente ML

Antes de establecer la baseline definitiva del sistema deberán responderse las siguientes preguntas.

### Pregunta MLP-001

¿Qué modelos se consideran oficialmente parte de SISAP?

Actualmente se contemplan, entre otros:

```text
encoder.h5
gmm_model.pkl
autoencoder_completo.h5
```

¿Existen otros modelos que deban incorporarse?

**Respuesta:**

> Pendiente de especificación.

---

### Pregunta MLP-002

¿Cuáles de los modelos producen resultados directamente utilizados para decisiones o alertas?

**Respuesta:**

> Pendiente de especificación.

---

### Pregunta MLP-003

¿Cuáles modelos son auxiliares y cuáles son clínicamente relevantes?

**Respuesta:**

> Pendiente de especificación.

---

# 6. Clasificación funcional de modelos

Cada modelo deberá clasificarse por función.

Ejemplo:

| Modelo | Función | Uso |
|---|---|---|
| Autoencoder | Representación latente | Dimensional |
| GMM | Clustering | Perfil |
| Modelo de riesgo | Estratificación | Riesgo |
| NLP model | Análisis narrativo | NLP |

### Pregunta MLP-004

¿Debemos utilizar una taxonomía formal de modelos como:

```text
REPRESENTATION
CLUSTERING
RISK
NLP
PREDICTION
RECONSTRUCTION
```

o alguna otra clasificación?

**Respuesta:**

> Pendiente de especificación.

---

# 7. Model Identification

Cada modelo deberá disponer de un identificador único.

Ejemplo:

```text
MODEL-AE-001
MODEL-GMM-001
MODEL-RISK-001
MODEL-NLP-001
```

La versión se mantendrá separada:

```text
MODEL-AE-001
Version:
2026.03
```

---

# 8. Model Versioning

Una modificación que cambie el comportamiento del modelo deberá generar una nueva versión.

Ejemplo:

```text
AE-2026.02
      ↓
AE-2026.03
```

El nombre del archivo físico no será suficiente para identificar una versión.

---

# 9. Criterios de incremento de versión

Deberá definirse cuándo un cambio constituye:

```text
MAJOR
MINOR
PATCH
```

### Pregunta MLP-005

¿Qué cambios producirán una nueva versión de modelo?

Por ejemplo:

- nuevo dataset;
- nueva arquitectura;
- nuevos hiperparámetros;
- nueva normalización;
- nuevo algoritmo;
- reentrenamiento;
- cambio de variables.

**Respuesta:**

> Pendiente de especificación.

---

# 10. Model Registry

SISAP deberá mantener un registro de modelos.

Archivo previsto:

```text
model_inventory.csv
```

Columnas iniciales:

```text
model_id
model_name
version
model_type
purpose
status
artifact
checksum
input_schema_version
preprocessing_version
normalization_version
training_dataset
validation_dataset
test_dataset
metrics
limitations
approval_status
created_at
retired_at
```

---

# 11. Estados del modelo

Se utilizarán inicialmente:

```text
DEVELOPMENT
TRAINING
VALIDATION
VERIFICATION
APPROVED
DEPLOYED
DEPRECATED
RETIRED
```

---

# 12. Modelo en desarrollo

Un modelo en estado `DEVELOPMENT`:

- no podrá utilizarse en producción;
- podrá modificarse;
- deberá mantenerse separado de modelos aprobados.

---

# 13. Modelo en validación

Un modelo en `VALIDATION` estará siendo evaluado respecto de criterios predefinidos.

No deberá utilizarse en producción.

---

# 14. Modelo aprobado

Un modelo `APPROVED` deberá:

- cumplir criterios establecidos;
- tener identificación completa;
- disponer de evidencia;
- haber completado las revisiones aplicables;
- y estar autorizado para el uso definido.

---

# 15. Modelo desplegado

El estado `DEPLOYED` indica que la versión aprobada está instalada en el entorno correspondiente.

Debe distinguirse:

```text
APPROVED
```

de:

```text
DEPLOYED
```

porque un modelo puede estar aprobado pero todavía no desplegado.

**Artefacto desplegado actualmente (encoder psicométrico, rama `Z_ESCALAS`):**

- `data/modelo/encoder.h5` junto con `data/modelo/nombres_variables.txt` (**24 variables**).
- Procedencia: era **E5** del proyecto de estratificación funcional transversal — modelo de **24 variables** (166 observaciones), el único `.h5` desplegado.
- Verificación canónica: la matriz de 24 de `03_MATRIZ_24` es **idéntica en nombres y orden** a `nombres_variables.txt` (`identical() == TRUE`).
- Contraste completo entre lo publicado, lo canónico y lo desplegado (**fuera de este repositorio**): `Estratificación Funcional Transversal en TUS\Analisis en R Fase Transversal\Datos Canonicos\10_DOCUMENTACION\` — `AUDITORIA_CONSOLIDACION_CANONICA.md` y `CONTRASTE_PUBLICACION_AUDITORIA_CANONICA.md`.
- Regla al leer métricas: el proyecto produjo **tres matrices** (21 variables / n=155 = linaje de la publicación; 22 variables / n=166 = corrida canónica; 24 variables / n=166 = desplegado). **No comparar métricas entre eras** sin declarar a cuál pertenecen.

---

# 16. Modelo retirado

Un modelo `RETIRED` no deberá utilizarse para nuevas evaluaciones de producción.

Podrá conservarse para:

- reproducibilidad histórica;
- análisis retrospectivo;
- auditoría;
- interpretación de resultados antiguos.

---

# 17. [DIVISIÓN FUTURA A — Model Inventory]

En el futuro, esta sección podrá separarse en:

```text
model_inventory.csv
```

y:

```text
Model_Registry.md
```

---

# 18. Propósito clínico de cada modelo

Cada modelo deberá tener una finalidad explícita.

Ejemplo:

```text
Model:
Autoencoder

Purpose:
Generate latent representation.

Clinical role:
Descriptive / stratification support.

Autonomous decision:
No.
```

### Pregunta MLP-006

Para cada modelo, ¿cuál es exactamente su propósito clínico?

**Respuesta:**

> Pendiente de especificación individual.

---

# 19. Entradas del modelo

Cada modelo deberá definir:

- variables;
- orden;
- tipos;
- rangos;
- unidades;
- tratamiento de faltantes;
- transformaciones.

---

# 20. Input Schema

Cada modelo deberá tener un esquema de entrada versionado.

Ejemplo:

```text
MODEL-AE-001
Input Schema:
AE-SCHEMA-03
```

---

# 21. Preguntas sobre las variables de entrada

### Pregunta MLP-007

¿Cuál es el vector exacto de entrada de cada modelo?

### Pregunta MLP-008

¿Existe un orden obligatorio de variables?

### Pregunta MLP-009

¿Todas las variables requieren transformación previa?

### Pregunta MLP-010

¿Qué variables son obligatorias?

### Pregunta MLP-011

¿Qué ocurre si falta una variable?

**Respuesta:**

> Pendiente de especificación por modelo.

---

# 22. Preprocesamiento

El preprocesamiento deberá documentarse explícitamente.

Puede incluir:

```text
Cleaning
Transformation
Encoding
Aggregation
Filtering
Imputation
Feature Construction
```

---

# 23. Normalización

Cada modelo deberá identificar los parámetros de normalización utilizados.

Ejemplo:

```text
Normalization:
NORM-03
```

---

# 24. Regla de compatibilidad

No deberá ejecutarse un modelo con parámetros de normalización diferentes de los definidos para su configuración validada.

```text
Model
+
Normalization
=
Compatible Configuration
```

---

# 25. Preguntas sobre normalización

### Pregunta MLP-012

¿Dónde se almacenan los parámetros de normalización?

### Pregunta MLP-013

¿Se almacenan dentro del artefacto del modelo o externamente?

### Pregunta MLP-014

¿Cómo se identifica su versión?

### Pregunta MLP-015

¿Qué sucede si falta el archivo de normalización?

**Respuesta:**

> Pendiente de especificación.

---

# 26. Datos de entrenamiento

Cada modelo deberá identificar el dataset utilizado para entrenamiento.

Ejemplo:

```text
Training Dataset:
DATA-AE-2026-01
```

---

# 27. Datos de validación

La evaluación del modelo deberá identificar los datos utilizados para seleccionar o ajustar el modelo.

---

# 28. Datos de prueba

Los resultados finales de desempeño deberán basarse, cuando corresponda, en datos independientes de los utilizados para entrenamiento.

---

# 29. Preguntas sobre datasets

### Pregunta MLP-016

¿Qué datasets históricos se utilizaron para entrenar cada modelo?

### Pregunta MLP-017

¿Cuáles datasets son independientes?

### Pregunta MLP-018

¿Existe riesgo de leakage entre entrenamiento y evaluación?

### Pregunta MLP-019

¿Cómo se documentará la separación de datasets?

### Pregunta MLP-020

¿Existe versionado de datasets?

**Respuesta:**

> Pendiente de especificación.

---

# 30. Caracterización de datasets

Cada dataset relevante deberá documentar, cuando sea posible:

```text
Dataset ID
Version
Source
Population
Variables
Sample Size
Collection Period
Processing
Exclusions
Missing Data
```

---

# 31. Proveniencia de datos

Debe documentarse la procedencia de los datos utilizados para desarrollar y evaluar modelos.

---

# 32. Datos sensibles

Los datasets que contengan información clínica identificable deberán permanecer fuera del repositorio de software y estar sujetos a los controles de acceso correspondientes.

---

# 33. Entrenamiento

Cada entrenamiento de modelo deberá poder identificar:

```text
Model
Dataset
Code Version
Parameters
Environment
Date
```

---

# 34. Registro de entrenamiento

Podrá utilizarse:

```text
training_record.md
```

con:

```text
Training ID
Model ID
Dataset
Software Version
Hyperparameters
Random Seed
Metrics
Date
Operator
```

---

# 35. Reproducibilidad del entrenamiento

Cuando técnicamente sea posible, un entrenamiento deberá poder reconstruirse a partir de:

```text
Code
+
Dataset
+
Configuration
+
Dependencies
+
Random Seed
```

---

# 36. Aleatoriedad

Cuando el entrenamiento sea estocástico deberá documentarse:

- semilla;
- framework;
- fuente de aleatoriedad;
- y comportamiento esperado.

### Pregunta MLP-021

¿Las ejecuciones de entrenamiento actuales son reproducibles exactamente?

**Respuesta:**

> Pendiente de evaluación.

---

# 37. Arquitectura del modelo

Cada modelo deberá disponer de una descripción de arquitectura cuando corresponda.

Ejemplo:

```text
Input
 ↓
Encoder
 ↓
Latent Space
 ↓
Decoder
```

---

# 38. Autoencoder

Para el autoencoder deberá documentarse:

```text
Input Dimensions
Encoder
Latent Dimensions
Decoder
Activation Functions
Loss Function
Optimizer
Epochs
Batch Size
```

### Pregunta MLP-022

¿Cuál es la arquitectura definitiva del autoencoder que será considerada baseline?

**Respuesta:**

> Pendiente de especificación.

---

# 39. Espacio latente

Cuando exista representación latente deberá documentarse:

- dimensionalidad;
- significado;
- transformación;
- interpretación;
- limitaciones.

---

# 40. GMM / Clustering

Para modelos GMM o similares deberá documentarse:

```text
Number of Components
Covariance Type
Initialization
Random State
Scaling
Input Space
```

### Pregunta MLP-023

¿Cuál es el número definitivo de componentes del GMM?

**Respuesta:**

> Pendiente de especificación.

---

# 41. Métricas de desempeño

Cada modelo deberá definir las métricas apropiadas.

Ejemplos:

```text
Accuracy
Precision
Recall
F1
ROC-AUC
MAE
RMSE
R²
Silhouette
Reconstruction Error
Calibration
```

No todas las métricas aplican a todos los modelos.

---

# 42. Preguntas sobre desempeño

### Pregunta MLP-024

¿Qué métricas son apropiadas para cada modelo?

### Pregunta MLP-025

¿Cuáles son los valores mínimos de aceptación?

### Pregunta MLP-026

¿Existen intervalos de confianza?

### Pregunta MLP-027

¿Se evaluará desempeño por subgrupos?

**Respuesta:**

> Pendiente de especificación por modelo.

---

# 43. Incertidumbre

Cuando un modelo produzca una estimación de incertidumbre deberá documentarse:

- método;
- escala;
- interpretación;
- límites;
- umbrales;
- y comportamiento.

---

# 44. Preguntas sobre incertidumbre

### Pregunta MLP-028

¿Cómo se calcula la incertidumbre?

### Pregunta MLP-029

¿Qué valor representa incertidumbre elevada?

### Pregunta MLP-030

¿Qué ocurre clínicamente cuando la incertidumbre es elevada?

**Respuesta:**

> Pendiente de especificación.

---

# 45. Applicability Domain

Cada modelo deberá definir, cuando sea posible, su dominio de aplicabilidad.

Puede incluir:

```text
Population
Feature Range
Missingness
Latent Distance
Distribution
```

---

# 46. Fuera de dominio

Si una entrada queda fuera del dominio validado:

```text
Input
 ↓
Domain Check
 ↓
OUTSIDE DOMAIN
```

el sistema deberá ejecutar el comportamiento especificado:

```text
BLOCK
WARNING
NOT AVAILABLE
```

según corresponda.

### Pregunta MLP-031

¿Cuál será el criterio matemático para determinar “fuera de dominio” en cada modelo?

**Respuesta:**

> Pendiente de especificación.

---

# 47. Limitaciones conocidas

Cada modelo deberá disponer de una sección de limitaciones.

Ejemplo:

```text
Population limitation
Feature limitation
Dataset limitation
Performance limitation
Uncertainty limitation
```

---

# 48. Model Card

Cada modelo aprobado deberá disponer de una ficha.

Estructura mínima:

```text
Model ID
Model Version
Purpose
Input
Output
Training Data
Validation Data
Performance
Limitations
Known Risks
Software Compatibility
Approval
```

---

# 49. [DIVISIÓN FUTURA B — Model Cards]

Cuando el proyecto crezca:

```text
model_cards/
├── AE-2026-03.md
├── GMM-2026-02.md
├── RISK-2026-01.md
└── NLP-2026-01.md
```

---

# 50. Verificación del modelo

Antes de aprobar un modelo deberá verificarse:

```text
Load
Compatibility
Input
Preprocessing
Inference
Output
Integrity
Reproducibility
```

---

# 51. Validación del modelo

La validación deberá determinar si el modelo es adecuado para el uso previsto definido.

Deberá distinguirse:

```text
Model Verification
=
¿El modelo funciona conforme a su especificación?

Model Validation
=
¿El modelo es adecuado para el uso previsto?
```

---

# 52. Modelo → Sistema

Un modelo que funcione correctamente de forma aislada no se considerará automáticamente validado dentro de SISAP.

Debe comprobarse:

```text
Model
 ↓
Integration
 ↓
System
 ↓
Intended Use
```

---

# 53. Modelo → Riesgo

Para modelos relacionados con funciones de riesgo:

```text
Model
 ↓
Failure Mode
 ↓
Hazard
 ↓
Risk
 ↓
Control
```

---

# 54. Modelo → Alertas

Cuando el modelo contribuya a una alerta:

```text
ML Result
 ↓
Risk Engine
 ↓
Alert Engine
```

deberá comprobarse la cadena completa.

---

# 55. Aprobación del modelo

La aprobación deberá considerar:

- desempeño;
- estabilidad;
- compatibilidad;
- limitaciones;
- riesgo;
- verificación;
- validación.

---

# 56. Model Approval Record

Ejemplo:

```text
MODEL APPROVAL RECORD

Model:
AE-2026-03

Training:
TRAIN-AE-2026-03

Validation:
VAL-ML-2026-03

Risk Review:
RISK-REVIEW-ML-03

Verification:
TEST-ML-003

Decision:
APPROVED / REJECTED

Reviewer:
________________

Date:
________________
```

---

# 57. Despliegue del modelo

La instalación deberá utilizar exclusivamente una versión aprobada.

Flujo:

```text
APPROVED
   ↓
DEPLOYMENT
   ↓
INTEGRITY CHECK
   ↓
COMPATIBILITY CHECK
   ↓
PRODUCTION
```

---

# 58. Integridad del artefacto

Los modelos podrán identificarse mediante:

```text
SHA-256
```

Ejemplo:

```text
Model:
AE-2026-03

SHA-256:
<hash>
```

---

# 59. Compatibilidad de runtime

El modelo deberá identificar, cuando corresponda:

```text
Python
TensorFlow
Keras
scikit-learn
PyTorch
```

y sus versiones compatibles.

---

# 60. Preguntas sobre runtime

### Pregunta MLP-032

¿Con qué versión exacta de Python fueron entrenados los modelos?

### Pregunta MLP-033

¿Con qué framework y versión?

### Pregunta MLP-034

¿Los modelos pueden ejecutarse con una versión diferente?

### Pregunta MLP-035

¿Qué combinaciones son oficialmente compatibles?

**Respuesta:**

> Pendiente de inventario y pruebas.

---

# 61. Compatibility Matrix

Se mantendrá:

```text
model_compatibility.csv
```

Ejemplo:

| Model | Python | Framework | Config | Compatible |
|---|---|---|---|---|
| AE-2026-03 | 3.12 | TF X.X | CC-0.5 | YES |
| AE-2026-03 | 3.13 | TF X.X | CC-0.5 | TBD |
| AE-2026-02 | 3.12 | TF X.X | CC-0.4 | YES |

---

# 62. Ejecución del modelo

Toda ejecución clínicamente relevante deberá poder identificar:

```text
execution_id
assessment_id
model_id
model_version
configuration_version
timestamp
status
```

---

# 63. Resultados del modelo

Los resultados deberán estructurarse.

Ejemplo:

```text
MLResult
├── model_id
├── model_version
├── prediction
├── latent_representation
├── cluster
├── reconstruction_error
├── uncertainty
└── status
```

---

# 64. Persistencia

Los resultados relevantes deberán poder conservar:

```text
Model ID
Model Version
Input Context
Output
Timestamp
```

según la política de trazabilidad.

---

# 65. Monitorización

Cuando SISAP se encuentre en uso operativo, deberá definirse si el modelo será monitorizado.

Posibles variables:

```text
Input Distribution
Missingness
Prediction Distribution
Uncertainty
Performance
Drift
Failure Rate
```

---

# 66. Model Drift

Debe evaluarse si cambios en los datos pueden reducir la aplicabilidad del modelo.

Conceptualmente:

```text
Reference Distribution
        ↓
Current Distribution
        ↓
Drift Detection
```

---

# 67. Preguntas de monitorización

### Pregunta MLP-036

¿Se monitorizará drift?

### Pregunta MLP-037

¿Qué variables se monitorizarán?

### Pregunta MLP-038

¿Qué umbral activará una revisión?

### Pregunta MLP-039

¿Quién revisará el desempeño del modelo?

### Pregunta MLP-040

¿Con qué periodicidad?

**Respuesta:**

> Pendiente de especificación.

---

# 68. Degradación del desempeño

Cuando exista evidencia de degradación:

```text
Detection
 ↓
Investigation
 ↓
Risk Assessment
 ↓
Retraining / Retirement
```

---

# 69. Reentrenamiento

Un reentrenamiento deberá generar una nueva versión del modelo cuando cambie su comportamiento.

```text
Model vN
   ↓
Retraining
   ↓
Model vN+1
```

---

# 70. Preguntas sobre reentrenamiento

### Pregunta MLP-041

¿Qué condiciones activan un reentrenamiento?

### Pregunta MLP-042

¿Quién puede autorizarlo?

### Pregunta MLP-043

¿Qué datos nuevos pueden incorporarse?

### Pregunta MLP-044

¿Se conservarán los modelos anteriores?

**Respuesta:**

> Pendiente de especificación.

---

# 71. Cambio de arquitectura del modelo

Un cambio estructural deberá generar evaluación reforzada.

Ejemplo:

```text
AE 32-24-12
   ↓
AE 32-24-16
```

No deberá tratarse como un simple reemplazo de archivo.

---

# 72. Cambio de dataset

Un nuevo dataset deberá evaluarse respecto de:

- población;
- distribución;
- variables;
- missingness;
- resultados;
- riesgos.

---

# 73. Cambio de hiperparámetros

Los cambios de:

```text
Learning Rate
Epochs
Batch Size
Regularization
Number of Components
```

deberán registrarse.

---

# 74. Cambio de variables

Agregar, eliminar o reordenar variables constituye un cambio relevante.

```text
Old Input Schema
      ↓
New Input Schema
```

Debe generar compatibilidad explícita y nueva evaluación.

---

# 75. Cambio de normalización

Modificar:

```text
Mean
SD
Scaling
Transformation
```

puede cambiar el comportamiento del modelo.

Deberá generarse nueva evaluación.

---

# 76. Cambio de framework

Cambiar de:

```text
TensorFlow
```

a:

```text
PyTorch
```

requiere un nuevo proceso de evaluación.

---

# 77. Cambio de versión del framework

Incluso una actualización menor deberá evaluarse cuando pueda afectar inferencia.

---

# 78. Actualización de dependencias del modelo

Los cambios de SOUP deberán registrarse.

```text
SOUP Change
 ↓
Model Compatibility
 ↓
Verification
```

---

# 79. Modelo retirado

Un modelo deberá poder pasar por:

```text
APPROVED
 ↓
DEPRECATED
 ↓
RETIRED
```

---

# 80. Retiro del modelo

Antes de retirar un modelo deberá revisarse:

```text
Historical Results
Reports
Audits
Reproducibility
Replacement
```

---

# 81. Conservación de modelos anteriores

Las versiones históricas deberán conservarse cuando sean necesarias para:

- reproducibilidad;
- auditoría;
- análisis de resultados históricos.

---

# 82. Reproducción de resultados históricos

SISAP deberá poder identificar el modelo que produjo un resultado histórico.

```text
Historical Result
      ↓
Model Version
      ↓
Model Artifact
```

cuando sea necesario.

---

# 83. Modelo y configuración clínica

No deberá asumirse que:

```text
Model A
```

funciona con:

```text
Clinical Configuration B
```

sin comprobar compatibilidad.

---

# 84. Model + Configuration Matrix

Se mantendrá cuando sea necesario:

| Model | Normalization | Clinical Config | Compatible |
|---|---|---|---|
| AE-03 | NORM-03 | CC-03 | YES |
| AE-03 | NORM-02 | CC-03 | NO |
| AE-04 | NORM-04 | CC-04 | TBD |

---

# 85. Model Risk Controls

Los modelos relacionados con funciones de seguridad deberán poseer controles.

Ejemplos:

```text
Input validation
Domain validation
Output validation
Integrity check
Version check
Uncertainty check
```

---

# 86. Fallo del modelo

Cuando el modelo falle:

```text
Model Error
 ↓
No Valid Prediction
 ↓
Explicit Error State
```

No deberá utilizarse:

```text
last prediction
```

como resultado actual salvo que exista un requisito explícito y un análisis de riesgo que lo permita.

---

# 87. Modelo no disponible

Cuando el modelo requerido no esté disponible:

```text
MODEL NOT AVAILABLE
```

deberá impedirse la presentación de una predicción válida inexistente.

---

# 88. Resultado fuera del dominio

Cuando un resultado esté fuera del dominio validado:

```text
Prediction
+
Domain Warning
```

o:

```text
NOT_AVAILABLE
```

según lo definido.

---

# 89. Incertidumbre elevada

Cuando exista incertidumbre elevada, el comportamiento deberá estar especificado.

Posibles opciones:

```text
WARNING
REVIEW_REQUIRED
NOT_AVAILABLE
```

### Pregunta MLP-045

¿Cuál será el comportamiento exacto de SISAP ante incertidumbre elevada?

**Respuesta:**

> Pendiente de especificación.

---

# 90. Interpretabilidad

Cada modelo deberá documentar, cuando sea aplicable:

- qué representa la salida;
- qué variables utiliza;
- qué limitaciones tiene;
- cómo interpretar sus métricas.

---

# 91. Explicabilidad

### Pregunta MLP-046

¿Necesitamos explicar al profesional:

```text
why this prediction occurred
```

o es suficiente mostrar:

```text
prediction
+
uncertainty
+
model information
```

**Respuesta:**

> Pendiente de especificación clínica y de usabilidad.

---

# 92. Resultados latentes

Las representaciones latentes deberán distinguir:

```text
Latent Representation
```

de:

```text
Clinical Interpretation
```

El sistema no deberá asumir que una dimensión latente tiene significado clínico simplemente por su posición matemática.

---

# 93. Clustering

La asignación a un cluster deberá presentarse como resultado analítico.

Deberá documentarse:

- definición;
- número de clusters;
- entrenamiento;
- asignación;
- limitaciones.

---

# 94. Stability Testing

Los modelos de clustering deberán evaluarse respecto de estabilidad cuando sea relevante.

### Pregunta MLP-047

¿Qué criterio utilizaremos para determinar que los clusters son suficientemente estables?

**Respuesta:**

> Pendiente de especificación.

---

# 95. Reconstrucción

Para modelos de reconstrucción deberá documentarse:

```text
Reconstruction Error
Threshold
Interpretation
```

---

# 96. Umbral de reconstrucción

### Pregunta MLP-048

¿Cómo se determinará el umbral de error de reconstrucción?

**Respuesta:**

> Pendiente de especificación.

---

# 97. NLP

Los modelos NLP deberán seguir los mismos controles generales:

```text
Model ID
Version
Input
Preprocessing
Validation
Output
Limitations
```

---

# 98. NLP y seguridad clínica

Los resultados NLP deberán presentarse como resultados derivados.

No deberán convertirse automáticamente en hechos clínicos confirmados.

---

# 99. Model Validation Dataset

Deberá mantenerse un conjunto de validación identificado.

Ejemplo:

```text
VAL-ML-DATA-001
```

---

# 100. Model Performance Record

Cada modelo aprobado deberá tener:

```text
performance_record.md
```

con:

```text
Model
Dataset
Metrics
Confidence Intervals
Subgroup Results
Limitations
Date
```

---

# 101. Revisión por subgrupos

Cuando sea pertinente, deberá evaluarse el desempeño por subgrupos relevantes de la población objetivo.

### Pregunta MLP-049

¿Qué variables demográficas o clínicas deben considerarse para evaluar heterogeneidad del desempeño?

**Respuesta:**

> Pendiente de especificación.

---

# 102. Sesgo

Deberá evaluarse si existen diferencias sistemáticas de desempeño entre subgrupos relevantes.

Esto no implica automáticamente que exista sesgo clínicamente inaceptable; el análisis deberá documentarse.

---

# 103. Calibración

Cuando el modelo produzca probabilidades o riesgo cuantitativo deberá evaluarse la calibración cuando sea apropiado.

### Pregunta MLP-050

¿Los modelos de riesgo deberán incluir análisis formal de calibración?

**Respuesta:**

> Pendiente de especificación.

---

# 104. Generalización

Debe documentarse qué evidencia existe para generalización fuera del dataset de desarrollo.

---

# 105. Limitaciones de generalización

Un desempeño observado en un dataset no deberá interpretarse automáticamente como desempeño garantizado en cualquier población.

---

# 106. Model Monitoring Record

Cuando corresponda:

```text
monitoring_record.md
```

podrá registrar:

```text
Model Version
Monitoring Period
Input Drift
Output Drift
Failures
Uncertainty
Performance
Decision
```

---

# 107. Incidentes relacionados con modelos

Cuando un modelo contribuya a un incidente:

```text
Incident
 ↓
Problem Report
 ↓
Risk Review
 ↓
Model Review
 ↓
Correction / Retirement
```

---

# 108. Problemas relacionados con modelos

Los problemas podrán incluir:

```text
Wrong Model
Wrong Version
Model Corruption
Unexpected Output
Wrong Input Schema
Normalization Error
Drift
Performance Degradation
Serialization Error
```

---

# 109. Registro de modelos

El inventario deberá poder responder:

> ¿Qué modelos están aprobados actualmente?

y:

> ¿Qué modelo produjo este resultado?

---

# 110. Integración con Configuration Management

Cada modelo deberá convertirse en Configuration Item.

Ejemplo:

```text
CI-MODEL-001
Model:
AE-2026-03
```

---

# 111. Integración con Risk Management

La relación será:

```text
Model
 ↓
Failure
 ↓
Risk
 ↓
Control
 ↓
Verification
```

---

# 112. Integración con Verification

```text
Model
 ↓
Model Verification
 ↓
Integration Testing
 ↓
System Testing
```

---

# 113. Integración con Validation

```text
Model
 ↓
System
 ↓
Use Intended
 ↓
Validation
```

---

# 114. Integración con Release

Un modelo sólo podrá formar parte de una release cuando:

```text
Model
+
Verification
+
Validation where applicable
+
Risk Review
+
Configuration
=
Approved Model
```

---

# 115. Model Release Record

Ejemplo:

```text
MODEL RELEASE RECORD

Model:
AE-2026-03

Software:
SISAP 0.5.0

Input Schema:
AE-SCHEMA-03

Normalization:
NORM-03

Configuration:
CC-0.5

Verification:
PASS

Validation:
PASS

Risk Review:
PASS

Checksum:
<hash>

Status:
DEPLOYED
```

---

# 116. Rollback

Debe poder determinarse qué modelo anterior puede restaurarse.

```text
AE-2026-04
     ↓
Rollback
     ↓
AE-2026-03
```

La compatibilidad de rollback deberá evaluarse.

---

# 117. Modelo y datos históricos

No deberá eliminarse un modelo histórico únicamente porque ya no se encuentre desplegado.

---

# 118. Modelo y resultados históricos

Una evaluación histórica deberá conservar referencia al modelo que la generó cuando sea necesario para reproducibilidad.

---

# 119. Criterios de aprobación del modelo

El modelo deberá cumplir los criterios específicos definidos para:

```text
Performance
Compatibility
Integrity
Risk
Verification
Validation
```

cuando sean aplicables.

---

# 120. Criterios de rechazo

Un modelo deberá rechazarse cuando:

- no cumpla los criterios de desempeño;
- no sea compatible;
- no pueda reproducirse suficientemente;
- presente riesgos no aceptables;
- o carezca de evidencia necesaria.

---

# 121. Cambios de modelo

Todo cambio deberá pasar por:

```text
Change Request
 ↓
Impact Analysis
 ↓
Risk Review
 ↓
Verification
 ↓
Validation if applicable
 ↓
Approval
 ↓
Deployment
```

---

# 122. Reentrenamiento periódico

No se deberá establecer automáticamente un calendario de reentrenamiento sin evidencia de que dicha estrategia sea apropiada.

### Pregunta MLP-051

¿El modelo se actualizará:

```text
por tiempo
por drift
por pérdida de desempeño
por nuevos datos
```

o mediante una combinación?

**Respuesta:**

> Pendiente de especificación.

---

# 123. Retiro por desempeño

Un modelo podrá retirarse cuando su desempeño deje de cumplir los criterios establecidos.

---

# 124. Retiro por seguridad

Un modelo podrá retirarse inmediatamente cuando exista una situación de seguridad que lo justifique.

---

# 125. Retiro por vulnerabilidad

Una vulnerabilidad de una dependencia necesaria para ejecutar el modelo podrá justificar su suspensión o sustitución.

---

# 126. Retiro por incompatibilidad

Un modelo podrá retirarse cuando deje de ser compatible con el software o configuración soportada.

---

# 127. Retiro por cambio de uso previsto

Si cambia el uso previsto, deberá evaluarse nuevamente la aplicabilidad del modelo.

---

# 128. Documentación mínima por modelo

Cada modelo aprobado deberá disponer de:

```text
Model ID
Model Version
Purpose
Input Schema
Preprocessing
Normalization
Training Dataset
Validation Dataset
Test Dataset
Architecture
Metrics
Limitations
Risk References
Verification
Validation
Approval
Checksum
Compatibility
Status
```

---

# 129. Estructura futura

Cuando el sistema madure, se recomienda:

```text
docs/
└── 13_model_management/
    │
    ├── Model_Management_Plan.md
    ├── model_inventory.csv
    ├── model_compatibility.csv
    │
    ├── model_cards/
    │   ├── AE-2026-03.md
    │   ├── GMM-2026-02.md
    │   └── RISK-2026-01.md
    │
    ├── training_records/
    ├── validation_records/
    ├── approval_records/
    └── release_records/
```

---

# 130. Preguntas pendientes de definición

Antes de cerrar el Model Management Plan deberán responderse como mínimo:

### Arquitectura

- ¿Cuál es el inventario definitivo de modelos?
- ¿Qué modelos son clínicamente relevantes?
- ¿Qué modelos participan en riesgo o alertas?
- ¿Cuál es la arquitectura definitiva de cada uno?

### Datos

- ¿Cuáles fueron los datasets de entrenamiento?
- ¿Cómo se separaron entrenamiento, validación y prueba?
- ¿Cómo se controla data leakage?
- ¿Cómo se versionan datasets?

### Preprocesamiento

- ¿Qué transformaciones se aplican?
- ¿Qué versión tiene cada transformación?
- ¿Cómo se manejan faltantes?

### Normalización

- ¿Qué parámetros utiliza cada modelo?
- ¿Dónde se almacenan?
- ¿Cómo se versionan?

### Desempeño

- ¿Qué métricas corresponden a cada modelo?
- ¿Cuáles son los criterios mínimos de aceptación?
- ¿Se evaluarán subgrupos?
- ¿Se evaluará calibración?

### Incertidumbre

- ¿Cómo se calcula?
- ¿Qué umbral define incertidumbre elevada?
- ¿Qué comportamiento activa?

### Dominio

- ¿Cuál es el dominio de aplicabilidad?
- ¿Cómo se detectan entradas fuera de dominio?

### Reentrenamiento

- ¿Qué activa un reentrenamiento?
- ¿Quién lo autoriza?
- ¿Qué datos pueden utilizarse?

### Despliegue

- ¿Qué runtime es compatible?
- ¿Qué versiones de frameworks son compatibles?
- ¿Cómo se verifica la integridad?

### Retiro

- ¿Cuándo se retira un modelo?
- ¿Cuánto tiempo se conserva?
- ¿Cómo se reproducen resultados históricos?

---

# 131. Matriz de decisiones pendientes

| ID | Tema | Pregunta | Estado |
|---|---|---|---|
| MLP-001 | Inventario | ¿Qué modelos son oficiales? | Pendiente |
| MLP-005 | Versionado | ¿Qué cambios incrementan versión? | Pendiente |
| MLP-007 | Inputs | ¿Vector exacto por modelo? | Pendiente |
| MLP-012 | Normalización | ¿Dónde se almacenan parámetros? | Pendiente |
| MLP-016 | Datos | ¿Qué datasets se utilizaron? | Pendiente |
| MLP-024 | Métricas | ¿Qué métricas por modelo? | Pendiente |
| MLP-028 | Incertidumbre | ¿Cómo se calcula? | Pendiente |
| MLP-031 | Dominio | ¿Cómo se detecta fuera de dominio? | Pendiente |
| MLP-036 | Drift | ¿Se monitorizará? | Pendiente |
| MLP-041 | Retraining | ¿Qué lo activa? | Pendiente |
| MLP-045 | Incertidumbre | ¿Qué hace SISAP ante incertidumbre alta? | Pendiente |
| MLP-046 | Explainability | ¿Qué explicación necesita el usuario? | Pendiente |
| MLP-049 | Subgrupos | ¿Qué subgrupos se evaluarán? | Pendiente |
| MLP-050 | Calibración | ¿Se requerirá? | Pendiente |
| MLP-051 | Retraining | ¿Por tiempo, drift o desempeño? | Pendiente |

---

# 132. Criterios de aceptación del Model Management Plan

El plan podrá pasar a baseline cuando:

- exista inventario completo de modelos;
- cada modelo tenga propósito definido;
- las entradas estén documentadas;
- el preprocesamiento esté documentado;
- la normalización esté documentada;
- los datasets estén identificados;
- las métricas estén definidas;
- los criterios de aceptación estén definidos;
- la incertidumbre esté especificada cuando corresponda;
- la compatibilidad esté definida;
- los procesos de aprobación estén definidos;
- los cambios estén controlados;
- y el retiro esté definido.

---

# 133. Estado actual

| Elemento | Estado |
|---|---|
| Model Registry | Definido |
| Model Versioning | Definido |
| Model States | Definidos |
| Model Inputs | En desarrollo |
| Preprocessing | Pendiente por modelo |
| Normalization | Pendiente por modelo |
| Training Data | Pendiente |
| Validation Data | Pendiente |
| Test Data | Pendiente |
| Performance Criteria | Pendiente |
| Uncertainty | Pendiente |
| Applicability Domain | Pendiente |
| Model Cards | Estructura definida |
| Model Verification | Definida |
| Model Validation | Definida |
| Model Approval | Definida |
| Model Deployment | Definido |
| Model Monitoring | Pendiente |
| Drift | Pendiente |
| Retraining | Pendiente |
| Retirement | Definido |
| Compatibility Matrix | Definida |
| Baseline | Pendiente |

---

# 134. Aprobación

| Rol | Responsable | Estado |
|---|---|---|
| Responsable del producto | Psic. Lauro Gutiérrez Castro | Pendiente |
| Responsable clínico | Psic. Lauro Gutiérrez Castro | Pendiente |
| Responsable de software | Pendiente | Pendiente |
| Responsable de riesgos | Pendiente | Pendiente |
| Responsable de ML | Pendiente | Pendiente |
| Responsable de verificación | Pendiente | Pendiente |
| Responsable de validación | Pendiente | Pendiente |

---

# 135. Historial de versiones

| Versión | Fecha | Descripción |
|---|---|---|
| 0.1 | Agosto 2026 | Estructura inicial |
| 0.9 | Pendiente | Revisión técnica y de modelos |
| 1.0 | Pendiente | Baseline inicial |
| 1.x | Futuro | Cambios controlados |

---

# 136. Declaración

> **SISAP by CENIVRA Model Management Plan establece el proceso para identificar, documentar, verificar, validar, aprobar, desplegar, monitorizar, modificar y retirar los modelos de aprendizaje automático utilizados por el sistema.**
>
> Un modelo no será considerado únicamente como un archivo de software. Su configuración válida comprende el artefacto del modelo, las entradas, el esquema de variables, el preprocesamiento, la normalización, la configuración, el entorno de ejecución y los elementos necesarios para reproducir o identificar su comportamiento.
>
> Todo modelo utilizado para una función relevante deberá estar identificado, versionado y sujeto a los procesos de verificación, gestión de riesgos, configuración y liberación correspondientes.
>
> Los cambios de modelo deberán tratarse como cambios controlados y no como sustituciones informales de archivos.
>
> Las conclusiones sobre desempeño o aplicabilidad de un modelo estarán limitadas a las poblaciones, datos, configuraciones y condiciones para las cuales exista evidencia suficiente.
>
> Este documento no constituye por sí mismo una certificación, declaración de conformidad ni autorización regulatoria.