# SISAP by CENIVRA

> [!NOTE]
> **Control Documental (Fuente Única de Verdad `v1.1.0`):** Este archivo se conserva como registro histórico de la fase conceptual inicial (`v1.0`, agosto 2026, Python / Dash). La Matriz de Trazabilidad Bidireccional **vigente para `v1.1.0`** reside en [`BIDIRECTIONAL_TRACEABILITY_MATRIX.md`](../lifecycle/15_traceability/BIDIRECTIONAL_TRACEABILITY_MATRIX.md) y la evaluación de clasificación de seguridad en [`RISK_MANAGEMENT_FILE_v1.1.md`](../lifecycle/04_risk_management/RISK_MANAGEMENT_FILE_v1.1.md).

# Software Traceability and Safety Classification

**Documento:** Software Traceability and Safety Classification  
**Identificador:** SISAP-TRSC-001  
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
| Documento | Software Traceability and Safety Classification |
| Identificador | SISAP-TRSC-001 |
| Versión | 1.0 |
| Estado | Borrador controlado |
| Producto | SISAP by CENIVRA |
| Plataforma | Python / Dash |
| Marco principal | IEC 62304:2006 + AMD1:2015 |
| Procesos relacionados | Requisitos · Arquitectura · Diseño · Riesgos · Verificación · Configuración |

---

# 1. Propósito

Este documento establece el mecanismo mediante el cual SISAP by CENIVRA mantendrá:

1. la **trazabilidad de requisitos, riesgos, arquitectura, diseño, implementación, pruebas y releases**;
2. la identificación de los *software items* y *software units* relevantes;
3. la evaluación documentada de la **clasificación de seguridad del software**;
4. la justificación de dicha clasificación;
5. y la relación entre seguridad, riesgo y diseño arquitectónico.

El objetivo es que cualquier función clínicamente relevante pueda rastrearse desde su requisito inicial hasta su implementación, verificación y release:

```text
REQUISITO
    ↓
RIESGO
    ↓
ARQUITECTURA
    ↓
DISEÑO
    ↓
CÓDIGO
    ↓
VERIFICACIÓN UNITARIA
    ↓
INTEGRACIÓN
    ↓
PRUEBA DE SISTEMA
    ↓
RELEASE
```

IEC 62304 establece procesos de ciclo de vida para el desarrollo y mantenimiento del software, incluyendo requisitos de desarrollo, gestión de riesgos, configuración y resolución de problemas.

---

# 2. Alcance

Este documento aplica a:

- requisitos;
- riesgos;
- controles de riesgo;
- software items;
- software units;
- arquitectura;
- diseño detallado;
- código;
- pruebas;
- configuración;
- modelos ML;
- componentes SOUP;
- releases;
- y documentación relacionada.

---

# 3. Principios de trazabilidad

## 3.1 Identificación única

Cada artefacto relevante deberá poseer un identificador único.

## 3.2 Trazabilidad bidireccional

La trazabilidad deberá poder recorrerse:

```text
Requisito → Implementación → Prueba
```

y también:

```text
Prueba → Implementación → Requisito
```

## 3.3 Trazabilidad de seguridad

Los elementos relacionados con seguridad deberán poder recorrerse:

```text
Riesgo → Control → Requisito → Diseño → Código → Prueba
```

## 3.4 Trazabilidad de versión

Una release deberá poder vincularse con las versiones concretas de:

- código;
- modelos;
- configuración;
- base de datos;
- dependencias;
- pruebas;
- y documentación.

---

# 4. Tipos de artefactos trazables

SISAP utilizará inicialmente las siguientes categorías:

```text
REQ
RISK
RISK-CONTROL
ARCH
DESIGN
SWI
SWU
CODE
TEST-UNIT
TEST-INT
TEST-SYS
MODEL
CONFIG
SOUP
PROBLEM
RELEASE
```

---

# 5. Convención de identificadores

## Requisitos

```text
REQ-[DOMAIN]-[NUMBER]
```

Ejemplo:

```text
REQ-ML-003
```

## Riesgos

```text
RISK-[DOMAIN]-[NUMBER]
```

Ejemplo:

```text
RISK-ML-001
```

## Controles

```text
CTRL-[DOMAIN]-[NUMBER]
```

## Arquitectura

```text
ARCH-[DOMAIN]-[NUMBER]
```

## Diseño

```text
DES-[DOMAIN]-[NUMBER]
```

## Software Items

```text
SWI-[NUMBER]
```

## Software Units

```text
SWU-[NUMBER]
```

## Pruebas

```text
TEST-[LEVEL]-[NUMBER]
```

Ejemplos:

```text
TEST-UNIT-001
TEST-INT-001
TEST-SYS-001
```

## Modelos

```text
MODEL-[DOMAIN]-[NUMBER]
```

## Problemas

```text
PROB-[NUMBER]
```

## Releases

```text
RELEASE-[VERSION]
```

---

# 6. Cadena de trazabilidad principal

La cadena de referencia será:

```text
REQ
 ↓
RISK
 ↓
ARCH
 ↓
DESIGN
 ↓
SWI
 ↓
SWU
 ↓
CODE
 ↓
UNIT TEST
 ↓
INTEGRATION TEST
 ↓
SYSTEM TEST
 ↓
RELEASE
```

No todos los requisitos deberán necesariamente poseer todos los niveles intermedios.

Por ejemplo, un requisito puramente documental podría no generar una unidad de software.

---

# 7. Requisito → Riesgo

Cuando un requisito esté relacionado con seguridad:

```text
REQ-SAF-003
      ↓
RISK-ML-001
```

Deberá conservarse la relación explícita.

---

# 8. Riesgo → Control

Cada riesgo deberá identificar las medidas de control correspondientes.

Ejemplo:

```text
RISK-ML-001
      ↓
CTRL-ML-001
Model compatibility validation
```

---

# 9. Control → Requisito

Cuando el control se implemente mediante software:

```text
CTRL-ML-001
      ↓
REQ-ML-002
```

El requisito deberá describir el comportamiento que debe implementar el software.

---

# 10. Requisito → Arquitectura

Ejemplo:

```text
REQ-ML-002
      ↓
ARCH-ML-001
      ↓
SWI-09 Model Registry
```

---

# 11. Arquitectura → Diseño

Ejemplo:

```text
SWI-09
      ↓
DES-MODEL-001
      ↓
SWU-10 Model Registry Unit
```

---

# 12. Diseño → Código

Ejemplo:

```text
SWU-10
      ↓
app/ml/registry.py
```

---

# 13. Código → Verificación

Ejemplo:

```text
registry.py
      ↓
TEST-UNIT-ML-001
```

---

# 14. Verificación → Integración

Ejemplo:

```text
TEST-UNIT-ML-001
      ↓
TEST-INT-ML-001
```

---

# 15. Integración → Sistema

Ejemplo:

```text
TEST-INT-ML-001
      ↓
TEST-SYS-011
```

---

# 16. Sistema → Release

Ejemplo:

```text
TEST-SYS-011
      ↓
RELEASE-0.5.0
```

---

# 17. Ejemplo completo

```text
REQ-RISK-003
      │
      ├── RISK-012
      │
      ├── CTRL-RISK-003
      │
      ├── ARCH-RISK-001
      │
      ├── DES-RISK-001
      │
      ├── SWI-10 Risk Engine
      │
      ├── SWU-11 Risk Unit
      │
      ├── app/risk/engine.py
      │
      ├── TEST-UNIT-RISK-012
      │
      ├── TEST-INT-RISK-012
      │
      ├── TEST-SYS-014
      │
      └── RELEASE-0.4.0
```

---

# 18. Trazabilidad bidireccional

El sistema documental deberá permitir responder:

### Desde un requisito

> ¿Qué código y qué pruebas implementan este requisito?

### Desde una prueba

> ¿Qué requisito verifica esta prueba?

### Desde un riesgo

> ¿Qué controles y pruebas reducen este riesgo?

### Desde un release

> ¿Qué requisitos, riesgos y pruebas corresponden a esta versión?

---

# 19. Matriz maestra de trazabilidad

Se mantendrá:

```text
requirements_traceability.csv
```

Columnas iniciales:

```text
requirement_id
risk_id
control_id
architecture_id
design_id
software_item_id
software_unit_id
code_reference
unit_test_id
integration_test_id
system_test_id
release_id
status
```

---

# 20. Ejemplo de matriz

| Requirement | Risk | Control | SW Item | Unit | Unit Test | Integration | System Test | Release |
|---|---|---|---|---|---|---|---|---|
| REQ-ML-002 | RISK-006 | CTRL-ML-001 | SWI-09 | SWU-10 | TEST-UNIT-ML-001 | TEST-INT-004 | TEST-SYS-011 | 0.5.0 |
| REQ-RISK-001 | RISK-002 | CTRL-RISK-001 | SWI-10 | SWU-11 | TEST-UNIT-RISK-001 | TEST-INT-005 | TEST-SYS-014 | 0.5.0 |
| REQ-ALERT-001 | RISK-014 | CTRL-ALERT-001 | SWI-11 | SWU-12 | TEST-UNIT-ALERT-001 | TEST-INT-006 | TEST-SYS-016 | 0.5.0 |

---

# 21. Trazabilidad de modelos

Los modelos deberán tener relaciones explícitas:

```text
MODEL
 ↓
Input Schema
 ↓
Normalization
 ↓
Software Unit
 ↓
Verification
 ↓
Risk
 ↓
Release
```

Ejemplo:

```text
MODEL-AE-2026-03
      ↓
MODEL-SCHEMA-03
      ↓
NORM-03
      ↓
SWU-09
      ↓
TEST-ML-003
      ↓
RELEASE-0.5.0
```

---

# 22. Trazabilidad de configuración

Las configuraciones con impacto clínico deberán relacionarse con:

```text
CONFIG
 ↓
Requirement
 ↓
Risk
 ↓
Test
 ↓
Release
```

---

# 23. Trazabilidad de problemas

Un problema deberá poder relacionarse con:

```text
PROB
 ↓
Version
 ↓
Requirement
 ↓
Risk
 ↓
Code
 ↓
Correction
 ↓
Retest
 ↓
Release
```

---

# 24. Trazabilidad temporal

Los artefactos deberán poder consultarse históricamente.

Ejemplo:

```text
RELEASE-0.3.0
```

deberá identificar las versiones vigentes en ese momento.

---

# 25. Trazabilidad de resultados

Cuando sea necesario para la reproducibilidad de un resultado:

```text
Assessment
 ↓
Execution
 ↓
Software Version
 ↓
Model Version
 ↓
Configuration Version
 ↓
Result
```

---

# 26. Estados de trazabilidad

Los vínculos podrán tener:

```text
PROPOSED
DEFINED
IMPLEMENTED
VERIFIED
RELEASED
OBSOLETE
BROKEN
```

Un enlace `BROKEN` deberá ser tratado como una anomalía documental.

---

# 27. Trazabilidad incompleta

No deberá permitirse que un release formal se considere completo cuando existan requisitos críticos sin trazabilidad.

---

# 28. Trazabilidad de seguridad

Los requisitos relacionados con seguridad deberán tener:

```text
Risk
 ↓
Control
 ↓
Requirement
 ↓
Implementation
 ↓
Verification
```

como mínimo.

---

# 29. Trazabilidad hacia controles externos

Cuando el control de riesgo sea externo al software:

```text
Risk
 ↓
External Control
 ↓
Clinical Workflow
```

la relación deberá documentarse.

Ejemplo:

```text
RISK-002
   ↓
Professional Review
   ↓
Clinical Workflow CW-001
```

---

# 30. Control de cambios de trazabilidad

Si cambia un requisito:

```text
Requirement Change
      ↓
Impact Analysis
      ↓
Affected Risks
      ↓
Affected Architecture
      ↓
Affected Tests
      ↓
New Release
```

---

# 31. Auditoría de trazabilidad

Antes de una release importante deberá realizarse una revisión de trazabilidad.

Debe comprobarse:

```text
Requirements
Risks
Controls
Architecture
Design
Code
Tests
Release
```

---

# 32. Criterio de completitud

Un requisito se considerará completamente trazable cuando pueda recorrerse:

```text
REQ
 ↓
Implementation
 ↓
Verification
```

y, para requisitos de seguridad:

```text
REQ
 ↓
Risk
 ↓
Control
 ↓
Verification
```

---

# 33. [DIVISIÓN FUTURA A — TRACEABILITY MANAGEMENT]

A partir de este punto, el contenido relacionado exclusivamente con trazabilidad podrá separarse en:

```text
docs/
└── 02_traceability/
    └── Software_Traceability_Management.md
```

Este documento futuro contendría:

- matriz maestra;
- convenciones de identificadores;
- trazabilidad bidireccional;
- auditoría;
- control de vínculos;
- trazabilidad de modelos;
- trazabilidad de releases;
- y reglas de mantenimiento de la matriz.

---

# 34. Clasificación de seguridad del software

## [DIVISIÓN FUTURA B — Este bloque podrá convertirse en `Software_Safety_Classification.md`]

---

# 35. Propósito de la clasificación

La clasificación de seguridad determina el nivel de rigor requerido para las actividades de desarrollo de los *software items*.

IEC 62304:2006+A1:2015 utiliza tres clases:

```text
Class A
Class B
Class C
```

La clasificación se basa en la posibilidad de que el software contribuya a una situación peligrosa y en la gravedad del daño potencial. ([turn616486search0](https://webstore.iec.ch/en/publication/22794?utm_source=chatgpt.com))

---

# 36. Clases de seguridad

## Class A

El software no puede contribuir a una situación peligrosa o las consecuencias de dicha contribución no resultan en un riesgo inaceptable bajo las condiciones consideradas.

## Class B

El software puede contribuir a una situación peligrosa que podría resultar en una lesión no grave.

## Class C

El software puede contribuir a una situación peligrosa que podría resultar en una lesión grave o muerte.

La clasificación definitiva deberá establecerse mediante el análisis formal de riesgo.

---

# 37. Principio de clasificación

La clasificación no deberá determinarse simplemente mediante:

```text
Nombre del módulo
```

sino mediante:

```text
Software Item
     ↓
Función
     ↓
Fallo potencial
     ↓
Contribución a situación peligrosa
     ↓
Daño
     ↓
Clasificación
```

---

# 38. Método de clasificación

Para cada software item potencialmente relevante:

### Paso 1

Identificar la función.

### Paso 2

Identificar cómo puede fallar.

### Paso 3

Determinar si el fallo puede contribuir a una situación peligrosa.

### Paso 4

Identificar el daño potencial.

### Paso 5

Identificar controles externos al software.

### Paso 6

Determinar la clasificación.

### Paso 7

Documentar la justificación.

---

# 39. Plantilla de clasificación

```text
Software Item:
SWI-08 ML Engine

Function:
Generate model-based predictions.

Potential Failure:
Incorrect prediction.

Hazardous Situation:
Clinical user interprets incorrect result
as valid information.

Potential Harm:
Inappropriate clinical decision.

External Controls:
Professional review.

Software Controls:
Input validation
Output validation
Model compatibility checks

Classification:
PENDING

Rationale:
PENDING FORMAL RISK ANALYSIS
```

---

# 40. Matriz de clasificación preliminar

| Software Item | Función | Clasificación preliminar | Estado |
|---|---|---|---|
| SWI-01 Presentation | Presentación | A/B | Pendiente |
| SWI-04 Scoring | Cálculo psicométrico | A/B | Pendiente |
| SWI-05 Transformation | Transformaciones | A/B | Pendiente |
| SWI-06 Normalization | Normalización | A/B | Pendiente |
| SWI-07 Dimensional | Perfil dimensional | A/B | Pendiente |
| SWI-08 ML Engine | Inferencia | A/B | Pendiente |
| SWI-09 Model Registry | Gestión de modelos | A/B | Pendiente |
| SWI-10 Risk Engine | Riesgo | B* | Pendiente |
| SWI-11 Alert Engine | Alertas | B* | Pendiente |
| SWI-12 Longitudinal | Seguimiento | A/B | Pendiente |
| SWI-13 NLP | Análisis narrativo | A/B | Pendiente |
| SWI-14 Security | Seguridad | A/B | Pendiente |
| SWI-16 Persistence | Persistencia | A/B | Pendiente |

`*` Hipótesis preliminar; no constituye clasificación formal.

---

# 41. Importancia de los controles externos

Cuando un procedimiento externo al software reduzca el riesgo, deberá documentarse explícitamente.

Ejemplo:

```text
SISAP Result
      ↓
Professional Review
      ↓
Clinical Decision
```

Debe describirse:

- quién realiza la revisión;
- en qué momento;
- qué información revisa;
- qué ocurre si el resultado es inválido;
- y qué evita que la salida se use como una decisión automática.

No basta con afirmar genéricamente que “el profesional revisa el resultado”.

---

# 42. Software que implementa medidas de control de riesgo

Cuando un *software item* implemente una medida de control de riesgo, deberá identificarse explícitamente:

```text
RISK
 ↓
RISK CONTROL
 ↓
SOFTWARE ITEM
 ↓
REQUIREMENT
 ↓
IMPLEMENTATION
 ↓
VERIFICATION
```

Este vínculo será especialmente importante para:

```text
SWI-10 Risk Engine
SWI-11 Alert Engine
SWI-08 ML Engine
```

---

# 43. Clasificación de arquitectura

La arquitectura deberá favorecer la separación de componentes cuando exista una diferencia relevante de clasificación.

Ejemplo:

```text
Class A
   │
   │
   ├─────────────┐
                 │
Class B/C        │
                 ▼
            Controlled
             Interface
```

La separación deberá ser técnica y verificable, no únicamente documental.

---

# 44. Software Item Decomposition

Cuando sea necesario subdividir:

```text
SWI-10 Risk Engine
       │
       ├── SWU-11 Risk Calculation
       ├── SWU-21 Threshold Evaluation
       └── SWU-22 Output Validation
```

La clasificación de cada unidad deberá determinarse según el análisis correspondiente.

---

# 45. Reglas para herencia de clasificación

Cuando un componente se encuentre dentro de un *software item* clasificado con un nivel determinado, su diseño y desarrollo deberán cumplir las actividades aplicables a ese nivel, salvo que exista una justificación documentada para una separación diferente.

---

# 46. Clasificación de interfaces

Las interfaces entre componentes de diferente nivel de seguridad deberán estar explícitamente definidas.

Ejemplo:

```text
ML Engine
    ↓
Risk Engine
```

La interfaz deberá controlar:

- formato;
- valores;
- estado;
- errores;
- incertidumbre.

---

# 47. Clasificación y errores

Los errores de un componente de mayor impacto deberán propagarse de forma segura.

Ejemplo:

```text
ML ERROR
   ↓
Risk NOT AVAILABLE
```

y no:

```text
ML ERROR
   ↓
Risk LOW
```

---

# 48. Clasificación y resultados

Los resultados deberán incluir estado cuando sea necesario:

```text
VALID
INVALID
NOT_AVAILABLE
ERROR
```

Esto ayuda a evitar que el software convierta silenciosamente un fallo en una salida clínica aparentemente válida.

---

# 49. Clasificación y modelos

Los modelos que participen en funciones asociadas a riesgo deberán incluir:

```text
Model ID
Model Version
Integrity
Compatibility
Validation Status
```

---

# 50. Clasificación y configuración

Los parámetros que puedan afectar una función de seguridad deberán estar bajo control de configuración.

---

# 51. Clasificación y pruebas

La clasificación deberá influir en la estrategia de verificación.

A mayor impacto:

```text
More rigorous design
+
More detailed verification
+
More explicit traceability
```

---

# 52. Clasificación y SOUP

Cuando un componente SOUP pueda afectar una función de seguridad:

```text
SOUP
 ↓
Potential Failure
 ↓
Hazardous Situation
 ↓
Risk
 ↓
Control
 ↓
Verification
```

---

# 53. Clasificación y defectos comunes

Los defectos comunes relacionados con la tecnología deberán evaluarse cuando puedan contribuir a situaciones peligrosas.

Ejemplos:

```text
Null Handling
Numeric Errors
Serialization
Model Loading
Type Conversion
Database Failure
Authentication
Authorization
```

---

# 54. Registro de clasificación

Se mantendrá:

```text
software_safety_classification.csv
```

Columnas:

```text
software_item_id
function
potential_failure
hazardous_situation
potential_harm
external_controls
software_controls
initial_classification
rationale
risk_reference
reviewer
review_date
status
```

---

# 55. Ejemplo de registro

| Software Item | Function | Potential Failure | Harm | External Control | Class | Status |
|---|---|---|---|---|---|---|
| SWI-10 | Risk | Incorrect risk level | Clinical decision affected | Professional review | B* | Pending |
| SWI-11 | Alert | Alert omitted | Delayed review | Workflow | B* | Pending |
| SWI-08 | ML | Incorrect prediction | Misinterpretation | Professional review | A/B | Pending |

---

# 56. Justificación de clasificación

Cada clasificación deberá responder:

```text
What does the item do?
What can fail?
Can failure contribute to a hazardous situation?
What harm could occur?
What external controls exist?
What software controls exist?
Why is the selected class justified?
```

---

# 57. Revisión de clasificación

La clasificación deberá revisarse cuando exista:

- nuevo uso previsto;
- nueva función;
- nuevo riesgo;
- modificación arquitectónica;
- nuevo modelo;
- cambio de control;
- nuevo escenario de uso;
- o incidente relevante.

---

# 58. Cambio de clasificación

Si una modificación cambia el análisis:

```text
Current Class
      ↓
Impact Analysis
      ↓
Risk Review
      ↓
New Class
      ↓
Development Process Adjustment
```

---

# 59. Release y clasificación

Cada release deberá identificar la clasificación vigente de los software items relevantes.

---

# 60. Trazabilidad de clasificación

La relación final deberá ser:

```text
Software Item
      ↓
Risk
      ↓
Safety Class
      ↓
Requirements
      ↓
Design
      ↓
Verification
```

---

# 61. Criterios de aceptación de la clasificación

La clasificación podrá considerarse documentada cuando:

- todos los *software items* potencialmente relacionados con seguridad estén identificados;
- exista análisis de sus funciones;
- existan escenarios de fallo;
- se hayan identificado situaciones peligrosas;
- se hayan identificado daños potenciales;
- se hayan documentado controles externos;
- se hayan identificado controles de software;
- se haya justificado la clase;
- y exista revisión formal.

---

# 62. [DIVISIÓN FUTURA B — FIN]

---

# 63. Integración entre trazabilidad y clasificación

Las dos áreas deberán permanecer conectadas.

Ejemplo:

```text
REQ-ALERT-001
       ↓
RISK-002
       ↓
CTRL-ALERT-001
       ↓
SWI-11 Alert Engine
       ↓
SWU-12 Alert Unit
       ↓
TEST-UNIT-ALERT-001
       ↓
TEST-INT-006
       ↓
TEST-SYS-016
       ↓
RELEASE-0.5.0
```

---

# 64. Auditoría de la cadena de evidencia

Antes de una release relevante deberá revisarse que no existan saltos injustificados.

Cadena esperada:

```text
Requirement
    ↓
Risk
    ↓
Control
    ↓
Architecture
    ↓
Design
    ↓
Implementation
    ↓
Verification
    ↓
Release
```

---

# 65. Trazabilidad de cambios

Cuando se modifique una unidad:

```text
Code Change
     ↓
Affected Requirement
     ↓
Affected Risk
     ↓
Affected Tests
     ↓
Configuration
     ↓
Release
```

---

# 66. Trazabilidad de modelos ML

Cuando se sustituya un modelo:

```text
Old Model
     ↓
Change Request
     ↓
Risk Review
     ↓
New Model
     ↓
Verification
     ↓
System Test
     ↓
Release
```

---

# 67. Trazabilidad de reglas clínicas

Cuando cambie un umbral:

```text
Old Rule
     ↓
Change
     ↓
Risk
     ↓
Test Boundary
     ↓
Alert Test
     ↓
System Test
     ↓
Release
```

---

# 68. Trazabilidad de configuración

Cuando cambie la normalización:

```text
Normalization Change
        ↓
Affected Models
        ↓
Risk Review
        ↓
Regression
        ↓
Release
```

---

# 69. Trazabilidad de SOUP

Cuando cambie una dependencia:

```text
SOUP Change
     ↓
Affected Component
     ↓
Affected Requirements
     ↓
Risk
     ↓
Tests
     ↓
Release
```

---

# 70. Trazabilidad de problemas

Cuando se detecte un problema:

```text
Problem
  ↓
Affected Release
  ↓
Risk
  ↓
Correction
  ↓
Verification
  ↓
Regression
  ↓
New Release
```

---

# 71. Criterios de auditoría

Una auditoría de trazabilidad deberá poder responder:

1. ¿Qué requisito originó esta función?
2. ¿Qué riesgo está asociado?
3. ¿Qué control lo mitiga?
4. ¿Dónde está implementado?
5. ¿Qué prueba lo verifica?
6. ¿En qué release fue liberado?

---

# 72. Integridad documental

Los identificadores no deberán reutilizarse.

Un requisito retirado deberá permanecer históricamente identificable.

Un riesgo cerrado deberá conservar su registro.

Una release retirada deberá permanecer trazable.

---

# 73. Elementos huérfanos

Deberán detectarse elementos sin relación.

Ejemplos:

```text
Requirement without test
Risk without control
Control without implementation
Test without requirement
Code without documented function
Release without baseline
```

Los elementos huérfanos deberán ser revisados.

---

# 74. Trazabilidad inversa

También deberá ser posible detectar:

```text
Code
 ↓
Which Requirement?
```

y:

```text
Test
 ↓
Which Requirement?
```

---

# 75. Métricas de trazabilidad

Podrán monitorizarse:

```text
Requirement Coverage
Risk Coverage
Test Coverage
Traceability Completeness
Orphaned Items
Broken Links
```

Estas métricas son indicadores de gestión y no sustituyen las decisiones de verificación.

---

# 76. Indicador de cobertura de requisitos

Conceptualmente:

```text
Requirements with valid verification
------------------------------------
Total applicable requirements
```

---

# 77. Indicador de cobertura de riesgos

Conceptualmente:

```text
Risks with verified controls
----------------------------
Total risks requiring controls
```

---

# 78. Indicador de cobertura de pruebas

Conceptualmente:

```text
Requirements with executed tests
---------------------------------
Requirements requiring verification
```

---

# 79. Criterios de release relacionados con trazabilidad

Antes de una release deberá comprobarse:

```text
[ ] Requirements identified
[ ] Risks identified
[ ] Controls identified
[ ] Architecture linked
[ ] Design linked
[ ] Implementation linked
[ ] Tests linked
[ ] Configuration linked
[ ] Release linked
```

---

# 80. Responsabilidades

| Rol | Responsabilidad |
|---|---|
| Responsable del producto | Aprobación general |
| Responsable clínico | Revisión clínica |
| Responsable de software | Arquitectura e implementación |
| Responsable de riesgos | Clasificación y riesgos |
| Responsable de verificación | Evidencia de pruebas |
| Responsable de configuración | Integridad de vínculos y versiones |

---

# 81. Criterios de aceptación del documento

Este documento podrá pasar a baseline cuando:

- las convenciones de identificación estén aprobadas;
- la matriz maestra esté definida;
- las relaciones entre requisitos y riesgos estén establecidas;
- los *software items* estén identificados;
- exista metodología de clasificación;
- estén definidos los registros;
- y los procesos de revisión estén establecidos.

---

# 82. Estado actual

| Elemento | Estado |
|---|---|
| Identificadores | Definidos |
| Cadena de trazabilidad | Definida |
| Matriz maestra | Definida |
| Requisitos → Riesgos | Definido |
| Riesgos → Controles | Definido |
| Controles → Arquitectura | Definido |
| Arquitectura → Diseño | Definido |
| Diseño → Código | Definido |
| Código → Tests | Definido |
| Tests → Release | Definido |
| Trazabilidad ML | Definida |
| Clasificación A/B/C | Metodología definida |
| Clasificación individual | Pendiente |
| Matriz final de clasificación | Pendiente |
| Auditoría de trazabilidad | Pendiente |
| Baseline | Pendiente |

---

# 83. Aprobación

| Rol | Responsable | Estado |
|---|---|---|
| Responsable del producto | Psic. Lauro Gutiérrez Castro | Pendiente |
| Responsable clínico | Psic. Lauro Gutiérrez Castro | Pendiente |
| Responsable de software | Pendiente | Pendiente |
| Responsable de riesgos | Pendiente | Pendiente |
| Responsable de verificación | Pendiente | Pendiente |
| Responsable de configuración | Pendiente | Pendiente |

---

# 84. Historial de versiones

| Versión | Fecha | Descripción |
|---|---|---|
| 0.1 | Agosto 2026 | Documento maestro inicial |
| 0.9 | Pendiente | Revisión técnica |
| 1.0 | Pendiente | Baseline inicial |
| 1.x | Futuro | Cambios controlados |

---

# 85. Declaración

> **SISAP by CENIVRA Software Traceability and Safety Classification establece el mecanismo para relacionar requisitos, riesgos, controles, arquitectura, diseño, implementación, verificación y releases, así como para documentar la clasificación de seguridad de los principales elementos de software.**
>
> La clasificación A/B/C contenida en este documento se mantendrá como preliminar hasta completar el análisis formal de riesgos y la evaluación del uso previsto.
>
> La trazabilidad deberá mantenerse durante todo el ciclo de vida y actualizarse cuando cambien requisitos, arquitectura, diseño, código, modelos, configuración, riesgos, pruebas o releases.
>
> Este documento no constituye por sí mismo una certificación, declaración de conformidad ni autorización regulatoria