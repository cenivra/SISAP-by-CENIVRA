# SISAP by CENIVRA

# Software Verification and Integration Plan

**Documento:** Software Verification and Integration Plan  
**Identificador:** SISAP-VIP-001  
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
| Documento | Software Verification and Integration Plan |
| ID | SISAP-VIP-001 |
| Versión | 1.0 |
| Estado | Borrador controlado |
| Producto | SISAP by CENIVRA |
| Plataforma | Python / Dash |
| Framework | Flask / Dash |
| Persistencia inicial | SQLite / SQLAlchemy |
| Marco de referencia | IEC 62304:2006 + AMD1:2015 |

---

# 1. Propósito

Este documento establece la estrategia para la:

- verificación de unidades de software;
- verificación de interfaces;
- integración de componentes;
- pruebas de integración;
- documentación de resultados;
- gestión de anomalías;
- pruebas de regresión;
- y conservación de evidencia.

El objetivo es demostrar de forma objetiva que los componentes implementados de SISAP by CENIVRA cumplen los requisitos y que, al integrarse, mantienen el comportamiento esperado.

El documento complementa:

```text
Software Development Plan
        ↓
Software Requirements Specification
        ↓
Software Architecture Description
        ↓
Software Detailed Design
        ↓
Verification & Integration
```

IEC 62304 contempla la verificación de unidades durante la implementación, seguida por integración y pruebas de integración como actividades diferenciadas dentro del proceso de desarrollo. ([IEC](https://webstore.iec.ch/en/publication/22794?utm_source=chatgpt.com))

---

# 2. Alcance

Este documento cubre:

```text
Unit Verification
Integration Testing
Interface Testing
Regression Testing
Test Evidence
Anomaly Tracking
Traceability
```

Las pruebas de sistema completo y los criterios de liberación final se documentarán posteriormente en el **Software System Test Plan** y en los documentos de liberación correspondientes.

---

# 3. Definiciones

## 3.1 Verificación

Actividad destinada a proporcionar evidencia de que una salida cumple los requisitos especificados.

## 3.2 Software Unit

Unidad implementable y verificable de software.

Ejemplos:

```text
Scoring Unit
Normalization Unit
ML Inference Unit
Risk Unit
Alert Unit
```

## 3.3 Integration Test

Prueba destinada a demostrar que dos o más unidades integradas funcionan correctamente mediante sus interfaces.

## 3.4 Test Case

Caso de prueba definido mediante entradas, condiciones, procedimiento y resultado esperado.

## 3.5 Test Record

Registro de la ejecución efectiva de un caso de prueba.

## 3.6 Anomaly

Desviación respecto del comportamiento esperado.

---

# 4. Principios de verificación

SISAP seguirá los siguientes principios:

## 4.1 Verificación basada en requisitos

Cada requisito verificable deberá tener al menos un caso de prueba o método de verificación justificado.

## 4.2 Verificación basada en riesgo

Los componentes que puedan afectar seguridad clínica deberán recibir una estrategia de verificación proporcional a su impacto.

## 4.3 Reproducibilidad

Las pruebas deberán poder reproducirse con la misma configuración.

## 4.4 Evidencia objetiva

La conclusión PASS/FAIL deberá basarse en resultados observables.

## 4.5 Pruebas automatizadas cuando sea posible

Las pruebas repetibles deberán automatizarse preferentemente.

## 4.6 Separación entre prueba y resultado esperado

El resultado esperado deberá estar definido antes de ejecutar la prueba.

## 4.7 No utilizar datos clínicos innecesarios

Las pruebas deberán utilizar datos sintéticos, anonimizados o específicamente autorizados.

---

# 5. Estrategia general

La estrategia será:

```text
Software Unit
      ↓
Unit Verification
      ↓
Verified Unit
      ↓
Integration
      ↓
Integration Test
      ↓
Integrated Component
      ↓
System Test
```

La integración se realizará progresivamente.

---

# 6. Niveles de prueba

Se establecen cuatro niveles principales:

```text
Nivel 1 — Unit Verification

Nivel 2 — Interface Verification

Nivel 3 — Integration Testing

Nivel 4 — System Testing
```

Este documento cubre principalmente los niveles 1–3.

---

# 7. Software Units sujetos a verificación

| ID | Software Unit | Prioridad |
|---|---|---|
| SU-01 | UI Layer | Media |
| SU-02 | Application Controller | Alta |
| SU-03 | Patient Service | Alta |
| SU-04 | Assessment Service | Alta |
| SU-05 | Scoring Unit | Muy alta |
| SU-06 | Transformation Unit | Alta |
| SU-07 | Normalization Unit | Muy alta |
| SU-08 | Dimensional Unit | Alta |
| SU-09 | ML Inference Unit | Muy alta |
| SU-10 | Model Registry Unit | Muy alta |
| SU-11 | Risk Unit | Muy alta |
| SU-12 | Alert Unit | Muy alta |
| SU-13 | Longitudinal Unit | Alta |
| SU-14 | NLP Unit | Media/Alta |
| SU-15 | Authentication Unit | Muy alta |
| SU-16 | Authorization Unit | Muy alta |
| SU-17 | Audit Unit | Alta |
| SU-18 | Repository Unit | Alta |
| SU-19 | Reporting Unit | Media |
| SU-20 | Configuration Unit | Alta |

La prioridad indicada es de planificación y podrá cambiar después de la clasificación formal de seguridad y del análisis de riesgos.

---

# 8. Tipos de pruebas

Las pruebas podrán clasificarse como:

```text
Functional
Boundary
Negative
Invalid Input
Exception Handling
Data Integrity
Determinism
Compatibility
Security
Performance
Regression
Interface
Integration
```

---

# 9. Unit Verification

Cada unidad deberá verificarse de manera independiente cuando sea posible.

Un registro mínimo deberá contener:

```text id="7h1s0w"
TEST ID
Requirement ID
Software Unit
Test Type
Preconditions
Input
Procedure
Expected Result
Observed Result
Version
Environment
Tester
Date
Status
Evidence
```

---

# 10. Formato estándar de Unit Test

Ejemplo:

```text id="3v6mde"
TEST-SU05-001

Requirement:
REQ-CLIN-001

Software Unit:
SU-05 Scoring Unit

Test Type:
Functional

Input:
Set of valid responses

Expected:
Score = X

Observed:
Score = X

Software Version:
0.1.0

Result:
PASS
```

---

# 11. Criterios PASS / FAIL

## PASS

Un caso será `PASS` cuando:

```text
Resultado observado
=
Resultado esperado
```

dentro de la tolerancia definida.

## FAIL

Será `FAIL` cuando:

```text
Resultado observado
≠
Resultado esperado
```

o cuando ocurra un comportamiento no especificado.

No deberá marcarse `PASS` para una prueba cuyo resultado sea desconocido.

---

# 12. Estados de prueba

Los casos podrán adoptar:

```text
DRAFT
READY
RUNNING
PASS
FAIL
BLOCKED
NOT_APPLICABLE
RETEST
```

---

# 13. Criterios de entrada para Unit Verification

Una unidad podrá entrar en verificación cuando:

- el diseño esté disponible;
- el código compile;
- el entorno sea reproducible;
- las dependencias estén disponibles;
- el requisito esté identificado;
- y los resultados esperados estén definidos.

---

# 14. Criterios de salida para Unit Verification

Una unidad podrá considerarse verificada cuando:

- los casos planificados hayan sido ejecutados;
- los resultados críticos sean PASS;
- los fallos estén registrados;
- las anomalías hayan sido evaluadas;
- y exista evidencia suficiente.

---

# 15. Verificación del Scoring Unit

## Objetivos

Demostrar:

- cálculo correcto;
- recodificación correcta;
- tratamiento correcto de faltantes;
- validación de rangos;
- reproducibilidad.

## Casos mínimos

```text
TEST-SU05-001
Respuestas válidas

TEST-SU05-002
Valor mínimo

TEST-SU05-003
Valor máximo

TEST-SU05-004
Ítem faltante

TEST-SU05-005
Ítem inválido

TEST-SU05-006
Ítem invertido

TEST-SU05-007
Repetibilidad
```

---

# 16. Verificación del Transformation Unit

Debe comprobarse:

- fórmulas;
- rangos;
- tipos;
- casos límite;
- valores faltantes;
- y reproducibilidad.

Ejemplo:

```text id="q8h2ey"
TEST-SU06-001
Input → Expected transformed value
```

---

# 17. Verificación del Normalization Unit

Debe comprobarse:

```text id="w3m8ev"
Correct parameter
Wrong parameter
Missing parameter
Out-of-range value
NaN
Infinite
```

Caso crítico:

```text id="6u3v0e"
TEST-SU07-006

Expected:
Execution blocked

Condition:
Normalization version incompatible
```

---

# 18. Verificación del Dimensional Unit

Debe comprobar:

- número de dimensiones;
- orden;
- valores;
- configuración;
- versión;
- datos inválidos.

Ejemplo:

```text id="9xsxvn"
TEST-SU08-001
Known input → Known dimensional output
```

---

# 19. Verificación del ML Inference Unit

El ML Engine deberá tener una estrategia reforzada de verificación.

Casos mínimos:

```text id="02i4ek"
Valid Input
Invalid Input
Missing Feature
Extra Feature
Wrong Feature Order
Wrong Model Version
Missing Model
Corrupted Model
Invalid Normalization
Boundary Input
Reproducibility
Output Validation
Uncertainty
```

---

# 20. Verificación del Model Registry

Deberán probarse:

```text id="11ctaa"
register_model
get_model
validate_model
get_model_metadata
retire_model
```

Caso:

```text id="34c1yb"
Model RETIRED
      ↓
Inference
      ↓
BLOCKED
```

---

# 21. Verificación del Risk Unit

Casos mínimos:

```text id="k4d2jv"
Low Risk
Medium Risk
High Risk
Threshold Boundary
Missing Input
Invalid Input
Uncertainty High
Model Failure
```

Los umbrales deberán utilizar valores definidos por la configuración clínica aprobada.

---

# 22. Verificación del Alert Unit

Deberá probarse:

```text id="b4o0x4"
Alert Triggered
Alert Not Triggered
Boundary
Duplicate Prevention
Status Transition
Persistence
```

Caso crítico:

```text id="m6rj56"
Risk unavailable
      ↓
No false alert
```

---

# 23. Verificación del Longitudinal Unit

Casos:

```text id="q3byk0"
One Assessment
Multiple Assessments
Out-of-order Dates
Missing Assessment
Different Model Version
Different Clinical Configuration
```

---

# 24. Verificación del NLP Unit

Casos:

```text id="uhj3mo"
Valid Narrative
Empty Narrative
Very Short Narrative
Invalid Character Encoding
Model Missing
NLP Error
```

El resultado de un procesamiento fallido deberá ser un estado explícito de error/no disponibilidad.

---

# 25. Verificación de Authentication Unit

Casos:

```text id="xg4h2c"
Valid Credentials
Invalid Password
Unknown User
Disabled User
Session Expired
Logout
```

---

# 26. Verificación de Authorization Unit

La matriz de autorización deberá probar:

```text id="a6tm8q"
User
+
Role
+
Resource
+
Action
```

Ejemplo:

| Role | Resource | Action | Expected |
|---|---|---|---|
| admin | user | create | ALLOW |
| psicologo | assessment | create | ALLOW |
| viewer | assessment | modify | DENY |
| consejero | administration | modify | DENY |

---

# 27. Verificación del Audit Unit

Deberá comprobarse:

- generación del evento;
- usuario;
- fecha/hora;
- tipo;
- entidad;
- persistencia;
- integridad.

---

# 28. Verificación del Repository Unit

Casos:

```text id="aiv7o1"
Create
Read
Update
Archive
Invalid ID
Missing Entity
Database Error
Transaction Failure
```

---

# 29. Verificación del Reporting Unit

Deberá comprobar:

- correspondencia con la evaluación;
- resultados;
- versiones;
- advertencias;
- integridad.

---

# 30. Verificación del Configuration Unit

Deberá comprobar:

```text id="n7irz8"
Valid configuration
Missing configuration
Invalid configuration
Version mismatch
Environment mismatch
```

---

# 31. Verificación de manejo de errores

Cada unidad deberá tener pruebas negativas.

Ejemplo:

```text id="9qldws"
Invalid Input
     ↓
Expected Exception / Error State
     ↓
No invalid clinical output
```

---

# 32. Verificación de límites

Deberán probarse:

```text id="51tp1d"
Minimum
Maximum
Just below minimum
Just above maximum
Empty
Null
NaN
Infinity
```

cuando sean aplicables.

---

# 33. Verificación de determinismo

Para una función determinista:

```text id="cb8g5p"
Input A
   ↓
Run 1 → Output X
Run 2 → Output X
Run 3 → Output X
```

Debe cumplirse:

```text
X1 = X2 = X3
```

dentro de la tolerancia definida.

---

# 34. Verificación de precisión numérica

Los algoritmos numéricos deberán definir:

- precisión;
- tolerancia absoluta;
- tolerancia relativa;
- reglas de redondeo.

Ejemplo conceptual:

```python
assert abs(observed - expected) <= tolerance
```

---

# 35. Verificación de compatibilidad de modelos

Deberá comprobarse:

```text id="vt3vpp"
Model
+
Input Schema
+
Normalization
+
Configuration
```

Una incompatibilidad deberá bloquear la ejecución cuando pueda comprometer la validez del resultado.

---

# 36. Verificación de seguridad

Las pruebas deberán incluir:

```text id="tx6xom"
Unauthorized access
Unauthorized modification
Invalid session
Expired session
Direct resource access
Invalid model access
Sensitive data exposure
```

---

# 37. Pruebas de interfaz

Las interfaces críticas son:

```text id="gzx2u0"
INT-001 Assessment → Scoring
INT-002 Scoring → Transformation
INT-003 Transformation → Normalization
INT-004 Normalization → ML
INT-005 ML → Risk
INT-006 Risk → Alert
INT-007 Application → Persistence
INT-008 Application → Audit
```

Cada una deberá disponer de casos de prueba.

---

# 38. Integración progresiva

La integración seguirá una estrategia incremental.

Primera etapa:

```text id="6y0hlr"
Assessment
   ↓
Scoring
```

Segunda:

```text id="o0xyut"
Assessment
   ↓
Scoring
   ↓
Transformation
   ↓
Normalization
```

Tercera:

```text id="0sj5w2"
Clinical Processing
        ↓
ML
```

Cuarta:

```text id="v0yd3h"
Clinical + ML
       ↓
Risk
```

Quinta:

```text id="m4n15z"
Risk
 ↓
Alert
```

Sexta:

```text id="ep3jpz"
Complete Clinical Workflow
```

---

# 39. Integration Test INT-001

## Assessment → Scoring

### Input

Evaluación válida.

### Esperado

El Scoring Unit recibe las respuestas correctamente y devuelve un `ClinicalScore` válido.

### Debe verificarse

- estructura;
- tipos;
- identificación;
- estado;
- errores.

---

# 40. Integration Test INT-002

## Scoring → Transformation

Debe verificarse que:

```text id="x1ru6l"
Clinical Score
        ↓
Transformation
```

reciba exactamente las variables requeridas.

---

# 41. Integration Test INT-003

## Transformation → Normalization

Debe verificarse:

- nombres;
- orden;
- tipos;
- parámetros;
- valores;
- y versión.

---

# 42. Integration Test INT-004

## Normalization → ML

Debe comprobarse:

```text id="4bq9up"
Feature Vector
        ↓
Expected Model Input
```

Una incompatibilidad deberá producir:

```text id="2unfdr"
Integration Error
```

y no una predicción.

---

# 43. Integration Test INT-005

## ML → Risk

Debe verificarse que:

```text id="d5n9sn"
MLResult
+
Clinical Features
        ↓
Risk Unit
```

produzca un `RiskResult` válido.

---

# 44. Integration Test INT-006

## Risk → Alert

Debe verificarse:

```text id="3b1v45"
RiskResult
      ↓
Alert Engine
      ↓
Expected Alert
```

incluyendo fronteras de umbral.

---

# 45. Integration Test INT-007

## Application → Persistence

Debe comprobarse:

```text id="nq1v0e"
Request
 ↓
Service
 ↓
Repository
 ↓
Database
```

y la recuperación posterior.

---

# 46. Integration Test INT-008

## Application → Audit

Toda operación definida como auditable deberá producir el evento correspondiente.

---

# 47. Integración del flujo clínico completo

Prueba principal:

```text id="f1jdcg"
Patient
   ↓
Assessment
   ↓
Validation
   ↓
Scoring
   ↓
Transformation
   ↓
Normalization
   ↓
Dimensional
   ↓
ML
   ↓
Risk
   ↓
Alert
   ↓
Persistence
   ↓
Audit
```

Este caso servirá como puente hacia las pruebas de sistema.

---

# 48. Pruebas de integración negativas

Deberán incluir:

```text id="4z8p7q"
Invalid Assessment
Missing Model
Wrong Model Version
Normalization Error
Risk Error
Database Error
Authorization Failure
```

El sistema deberá terminar en un estado controlado.

---

# 49. Pruebas de integración de fallos

Ejemplo:

```text id="f09nmm"
ML Engine
     ↓
FAIL
     ↓
Risk Engine
     ↓
BLOCKED
```

Nunca:

```text id="3z1sud"
ML Engine
     ↓
FAIL
     ↓
Risk = LOW
```

---

# 50. Pruebas de regresión

Después de cada modificación relevante se determinará qué pruebas deben repetirse.

Se prestará especial atención a:

```text id="ob5pyo"
Scoring
Normalization
ML
Risk
Alerts
Authentication
Authorization
Database
```

---

# 51. Matriz de pruebas de regresión

| Cambio | Unit | Integration | System |
|---|---|---|---|
| Scoring | Sí | Sí | Sí |
| UI | Sí | Según impacto | Según impacto |
| ML model | Sí | Sí | Sí |
| Threshold | Sí | Sí | Sí |
| Database schema | Sí | Sí | Sí |
| Auth | Sí | Sí | Sí |
| Report | Sí | Sí | Según impacto |

La selección definitiva será determinada mediante análisis de impacto.

---

# 52. Datos de prueba

Los datos de prueba deberán clasificarse:

```text id="j2q1c8"
Synthetic
De-identified
Reference
Boundary
Negative
```

Los datos clínicos reales deberán evitarse salvo que exista una justificación y control apropiados.

---

# 53. Dataset de referencia para pruebas

SISAP deberá mantener un conjunto controlado de casos de referencia.

Ejemplo:

```text id="bsjuxd"
tests/
└── fixtures/
    ├── clinical_cases/
    ├── scoring_cases/
    ├── ml_cases/
    ├── risk_cases/
    └── longitudinal_cases/
```

Los casos deberán tener identificadores estables.

---

# 54. Golden Test Cases

Para cálculos clínicos y modelos seleccionados podrán establecerse casos de referencia:

```text id="qby9tf"
Input
   ↓
Expected Output
```

Estos casos servirán como pruebas de regresión.

---

# 55. Machine Learning Golden Set

El ML Engine deberá disponer, cuando corresponda, de un conjunto de entradas con resultados de referencia:

```text id="ajghxg"
ML-GOLD-001
ML-GOLD-002
ML-GOLD-003
...
```

Cada caso deberá identificar:

- modelo;
- versión;
- entrada;
- resultado esperado;
- tolerancia.

---

# 56. Validación de modelos durante pruebas

Las pruebas no deberán limitarse a comprobar que el archivo `.h5`, `.pkl` u otro artefacto pueda cargarse.

Deberán comprobarse también:

```text id="q0nxqv"
Load
Compatibility
Inference
Output
Determinism
Failure Handling
```

---

# 57. Pruebas de cambios de modelo

Un nuevo modelo deberá activar:

```text id="5v75u3"
Model Verification
+
Integration Testing
+
Regression Testing
+
Risk Review
```

antes de su aprobación.

---

# 58. Pruebas de cambios de umbrales

Un cambio de umbral deberá activar:

```text id="eod28j"
Rule Test
Boundary Test
Risk Test
Alert Test
Regression
```

---

# 59. Pruebas de persistencia

Después de generar un resultado deberá verificarse:

```text id="2ihjpu"
Generated Result
       ↓
Stored Result
       ↓
Retrieved Result
```

La información recuperada deberá corresponder al resultado original.

---

# 60. Pruebas de auditoría

Debe comprobarse:

```text id="f64xk8"
Operation
 ↓
Audit Event
 ↓
Persist
 ↓
Retrieve
```

---

# 61. Integración con autenticación

Antes de ejecutar operaciones protegidas:

```text id="q9a4yl"
Request
 ↓
Authentication
 ↓
Authorization
 ↓
Application Service
```

Un usuario no autenticado deberá ser rechazado.

Un usuario autenticado pero no autorizado también deberá ser rechazado.

---

# 62. Integración con reportes

Debe comprobarse:

```text id="8j4ljr"
Assessment
 ↓
Results
 ↓
Report
```

sin recalcular silenciosamente los resultados.

---

# 63. Criterios para iniciar integración

La integración de dos unidades podrá comenzar cuando:

- las unidades hayan sido verificadas;
- sus interfaces estén definidas;
- los datos de entrada/salida estén documentados;
- las dependencias estén disponibles;
- y los errores esperados estén definidos.

---

# 64. Criterios para completar integración

Una integración podrá considerarse aceptada cuando:

- los casos planificados estén ejecutados;
- las interfaces funcionen conforme al diseño;
- los resultados esperados se obtengan;
- los fallos conocidos estén evaluados;
- y exista evidencia documentada.

---

# 65. Gestión de FAIL

Cuando una prueba falle:

```text id="m1r8zt"
FAIL
 ↓
Problem Report
 ↓
Impact Analysis
 ↓
Correction
 ↓
Retest
 ↓
Regression
```

No deberá modificarse el resultado de la prueba para convertirlo en PASS.

---

# 66. Retest

Una prueba corregida deberá registrarse nuevamente.

Ejemplo:

```text id="dfv3pw"
TEST-SU05-006
Run 1 → FAIL

Fix:
CHANGE-017

Run 2 → PASS
```

Ambos resultados deberán conservarse.

---

# 67. Evidencia

La evidencia podrá incluir:

```text id="n2jz3m"
pytest output
logs técnicos
test reports
screenshots
generated reports
database records
model outputs
hashes
```

La evidencia deberá poder vincularse al caso de prueba correspondiente.

---

# 68. Automatización

Cuando sea posible se utilizará:

```bash id="cdps58"
pytest
```

y:

```bash id="0xys4w"
pytest -q
```

para ejecución automatizada.

Podrán utilizarse:

```text id="7p85vc"
pytest fixtures
parameterized tests
mocking
coverage
```

según las necesidades del proyecto.

---

# 69. Cobertura

La cobertura de código podrá utilizarse como métrica complementaria.

Ejemplo:

```bash id="1xj7jv"
pytest --cov=app
```

La cobertura de código **no sustituye** la cobertura de requisitos ni demuestra por sí sola seguridad del software.

---

# 70. Cobertura de requisitos

Debe mantenerse:

```text id="5f5y4k"
Requirement
   ↓
Test Case
   ↓
Result
```

Ningún requisito de seguridad deberá quedar sin estrategia de verificación.

---

# 71. Cobertura de riesgos

Cuando un riesgo tenga un control de software:

```text id="cnkh7a"
Risk
 ↓
Risk Control
 ↓
Requirement
 ↓
Test
```

deberá existir trazabilidad.

---

# 72. Matriz preliminar de trazabilidad

| Requisito | Unit Test | Integration Test | Resultado |
|---|---|---|---|
| REQ-CLIN-001 | TEST-SU05-001 | INT-001 | TBD |
| REQ-DATA-001 | TEST-SU05-005 | INT-001 | TBD |
| REQ-NORM-001 | TEST-SU07-001 | INT-003 | TBD |
| REQ-ML-003 | TEST-SU09-001 | INT-004 | TBD |
| REQ-RISK-001 | TEST-SU11-001 | INT-005 | TBD |
| REQ-ALERT-001 | TEST-SU12-001 | INT-006 | TBD |
| REQ-SEC-004 | TEST-SU16-001 | INT-007 | TBD |
| REQ-AUD-001 | TEST-SU17-001 | INT-008 | TBD |

---

# 73. Identificación de versiones

Cada ejecución deberá identificar, cuando corresponda:

```text id="0icm7t"
Software Version
Model Version
Configuration Version
Database Schema Version
Test Version
```

Ejemplo:

```text id="y0y1bm"
Software: 0.4.0
Model: ML-2026.03
Config: CFG-0.4
DB: DB-0.4
```

---

# 74. Entorno de prueba

El entorno deberá documentarse.

Ejemplo:

```text id="wl6g1z"
OS: Windows
Python: 3.x
pytest: x.x.x
NumPy: x.x.x
scikit-learn: x.x.x
TensorFlow: x.x.x
Dash: x.x.x
```

La configuración definitiva deberá quedar registrada con cada baseline.

---

# 75. Responsabilidad de ejecución

Cada prueba deberá identificar al ejecutor.

Ejemplo:

```text id="qv2yrn"
Tester:
Lauro Gutiérrez Castro
```

En futuras estructuras podrán existir responsables independientes para desarrollo y verificación.

---

# 76. Revisión de resultados

Los resultados deberán revisarse antes del cierre de cada conjunto de pruebas.

La revisión deberá verificar:

- evidencia;
- conclusión;
- anomalías;
- desviaciones;
- y necesidad de repetición.

---

# 77. Criterios de aceptación del conjunto de pruebas

Un conjunto podrá considerarse completado cuando:

- todos los casos obligatorios estén ejecutados;
- no existan FAIL críticos abiertos;
- las anomalías residuales estén evaluadas;
- los riesgos afectados estén revisados;
- y exista trazabilidad completa.

---

# 78. Anomalías

Una anomalía deberá disponer de:

```text id="7v8rqs"
Anomaly ID
Test ID
Version
Description
Expected
Observed
Severity
Safety Impact
Status
```

---

# 79. Relación con Problem Resolution

Los FAIL que representen defectos deberán alimentar el proceso de resolución de problemas:

```text id="b24j3w"
Test Failure
     ↓
Problem Report
     ↓
Investigation
     ↓
Correction
     ↓
Retest
```

---

# 80. Pruebas de regresión después de correcciones

Toda corrección deberá analizar qué otras áreas podrían haberse afectado.

Ejemplo:

```text id="x4y9gh"
Scoring Change
     ↓
Scoring Tests
+
Normalization Tests
+
ML Integration
+
Risk
+
System
```

La lista exacta dependerá del análisis de impacto.

---

# 81. Baseline de pruebas

Cada conjunto de pruebas deberá poder quedar asociado a una baseline:

```text id="3m1c6p"
TEST-BL-001
```

que incluya:

- casos;
- fixtures;
- versión;
- configuración;
- resultados;
- evidencia.

---

# 82. Criterios para pruebas bloqueadas

Una prueba podrá ser `BLOCKED` cuando:

- falte una dependencia;
- exista un problema previo que impida ejecutarla;
- falte un artefacto;
- o el entorno no pueda reproducirse.

Un caso bloqueado no se considerará PASS.

---

# 83. Pruebas no aplicables

Cuando un caso sea `NOT_APPLICABLE`, deberá existir una justificación documentada.

---

# 84. Pruebas de seguridad clínica

Los escenarios relacionados con seguridad deberán recibir prioridad.

Ejemplos:

```text id="xzsecy"
Invalid clinical input
ML failure
Risk failure
Alert failure
Wrong model version
Missing model
Incorrect threshold
Unauthorized access
```

---

# 85. Prueba crítica de fallo ML

```text id="26c9hk"
TEST-SAF-ML-001

Condition:
ML model unavailable

Expected:
No ML result
No ML-derived risk
Explicit error state
Audit event
```

---

# 86. Prueba crítica de incompatibilidad de modelo

```text id="ckr3uc"
TEST-SAF-ML-002

Condition:
Model version incompatible with normalization

Expected:
Inference blocked
No prediction generated
Error recorded
```

---

# 87. Prueba crítica de riesgo

```text id="l0e5qq"
TEST-SAF-RISK-001

Condition:
Risk Engine failure

Expected:
Risk result = NOT_AVAILABLE
No default risk level
```

---

# 88. Prueba crítica de alerta

```text id="atvf1m"
TEST-SAF-ALERT-001

Condition:
Required risk input unavailable

Expected:
No clinically misleading alert
Explicit unavailable/error state
```

---

# 89. Prueba crítica de autorización

```text id="2d4sq0"
TEST-SAF-SEC-001

Condition:
Viewer attempts to modify clinical assessment

Expected:
DENY
No modification
Audit event
```

---

# 90. Prueba de integridad de persistencia

```text id="d0s1qb"
TEST-SAF-DB-001

Condition:
Database write fails

Expected:
Operation not confirmed
No false success state
Error recorded
```

---

# 91. Requisitos para modelos probabilísticos

Cuando los resultados sean probabilísticos, las pruebas deberán definir:

- tolerancia;
- reproducibilidad esperada;
- rango válido;
- comportamiento de casos límite.

---

# 92. Requisitos para modelos estocásticos

Cuando un modelo utilice aleatoriedad:

```text id="5cyfzr"
Seed
+
Model
+
Input
```

deberán controlarse cuando sea técnicamente posible.

Si la salida no es reproducible exactamente, deberá documentarse el comportamiento esperado.

---

# 93. Pruebas de reconstrucción

Cuando se utilicen métricas como error de reconstrucción:

```text id="ctm1dt"
Input
 ↓
Model
 ↓
Reconstruction
 ↓
Error
```

deberá definirse:

- precisión;
- tolerancia;
- rango;
- y casos límite.

---

# 94. Pruebas de incertidumbre

Las pruebas deberán comprobar:

```text id="96lfwb"
Low uncertainty
High uncertainty
Missing uncertainty
Invalid uncertainty
```

cuando el modelo disponga de esta información.

---

# 95. Pruebas de compatibilidad temporal

El Longitudinal Engine deberá ser probado con:

```text id="vshb6x"
same model
different model
same configuration
different configuration
```

---

# 96. Criterios de aceptación para integración clínica

El flujo integrado podrá pasar a pruebas de sistema cuando:

- Assessment funcione;
- Scoring funcione;
- Normalization funcione;
- Dimensional funcione;
- ML funcione;
- Risk funcione;
- Alert funcione;
- Persistence funcione;
- Audit funcione;
- y las interfaces críticas estén verificadas.

---

# 97. Criterios de salida del documento

Este documento podrá pasar a baseline cuando:

- exista estrategia de Unit Verification;
- existan casos de integración;
- existan criterios PASS/FAIL;
- exista estrategia de regresión;
- exista trazabilidad inicial;
- existan pruebas de seguridad críticas;
- y esté definido el proceso de manejo de anomalías.

---

# 98. Estructura futura de registros

Los registros podrán organizarse posteriormente:

```text id="g0d1g0"
docs/
└── 05_verification_and_integration/
    │
    ├── Software_Verification_and_Integration_Plan.md
    │
    ├── unit_tests/
    │   ├── scoring/
    │   ├── normalization/
    │   ├── ml/
    │   ├── risk/
    │   ├── alert/
    │   └── security/
    │
    ├── integration_tests/
    │   ├── INT-001/
    │   ├── INT-002/
    │   ├── INT-003/
    │   └── ...
    │
    └── evidence/
```

---

# 99. Relación con la arquitectura

Las pruebas deberán poder relacionarse con las unidades identificadas en la SAD/SDD:

```text id="8d3kq4"
SAD
 ↓
Software Item
 ↓
SDD
 ↓
Software Unit
 ↓
Unit Test
 ↓
Integration Test
```

---

# 100. Relación con los requisitos

La cadena esperada será:

```text id="0j4fzv"
SRS
 ↓
Requirement
 ↓
Software Unit
 ↓
Test Case
 ↓
Test Result
```

---

# 101. Relación con riesgos

Para requisitos de seguridad:

```text id="f4sb4j"
Risk
 ↓
Risk Control
 ↓
Requirement
 ↓
Implementation
 ↓
Unit Test
 ↓
Integration Test
 ↓
System Test
```

---

# 102. Estado del documento

| Elemento | Estado |
|---|---|
| Estrategia Unit Verification | Definida |
| Casos de Unit Verification | Preliminares |
| Estrategia de integración | Definida |
| Interfaces críticas | Identificadas |
| Integration Tests | Preliminares |
| Datos de prueba | Definidos conceptualmente |
| Golden Tests | Planificados |
| Regresión | Definida |
| Evidencia | Pendiente |
| Matriz de trazabilidad | En construcción |
| Pruebas de seguridad | Definidas conceptualmente |
| Baseline | Pendiente |

---

# 103. Aprobación

| Rol | Responsable | Estado |
|---|---|---|
| Responsable del producto | Psic. Lauro Gutiérrez Castro | Pendiente |
| Responsable clínico | Psic. Lauro Gutiérrez Castro | Pendiente |
| Responsable de software | Pendiente | Pendiente |
| Responsable de verificación | Pendiente | Pendiente |

---

# 104. Historial de versiones

| Versión | Fecha | Descripción |
|---|---|---|
| 0.1 | Agosto 2026 | Estructura inicial |
| 0.9 | Pendiente | Revisión técnica |
| 1.0 | Pendiente | Baseline |
| 1.x | Futuro | Cambios controlados |

---

# 105. Declaración

> **SISAP by CENIVRA Software Verification and Integration Plan establece la estrategia para verificar unidades de software y demostrar la correcta integración de sus componentes.**
>
> Este documento deberá mantenerse bajo control de configuración y actualizarse cuando cambien los requisitos, arquitectura, diseño, modelos, riesgos o estrategia de pruebas.
>
> Los resultados reales de las pruebas deberán conservarse como registros de verificación independientes de este plan.
>
> Este documento no constituye por sí mismo una certificación, declaración de conformidad ni autorización regulatoria.