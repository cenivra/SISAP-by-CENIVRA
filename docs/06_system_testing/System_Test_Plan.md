# SISAP by CENIVRA

# System Test Plan

**Documento:** System Test Plan  
**Identificador:** SISAP-STP-001  
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
| Documento | System Test Plan |
| Identificador | SISAP-STP-001 |
| Versión | 1.0 |
| Estado | Borrador controlado |
| Producto | SISAP by CENIVRA |
| Plataforma | Python / Dash |
| Persistencia inicial | SQLite / SQLAlchemy |
| Marco de referencia | IEC 62304:2006 + AMD1:2015 |

---

# 1. Propósito

Este documento establece el plan para las **pruebas de sistema de SISAP by CENIVRA**.

El objetivo es demostrar que el sistema integrado, ejecutado en un entorno representativo del uso previsto, cumple los requisitos de sistema definidos y funciona correctamente como conjunto.

Las pruebas de sistema se realizan después de:

```text
Software Requirements
        ↓
Architecture
        ↓
Detailed Design
        ↓
Unit Verification
        ↓
Integration Testing
        ↓
System Testing
```

La prueba de sistema no se limita a verificar componentes individuales. Evalúa el comportamiento del producto completo y sus flujos de uso previstos.

---

# 2. Alcance

Este plan cubre las pruebas del sistema completo, incluyendo cuando corresponda:

- autenticación;
- autorización;
- gestión de usuarios;
- gestión de pacientes;
- creación de evaluaciones;
- captura de datos;
- validación;
- scoring;
- transformaciones;
- normalización;
- representación dimensional;
- ejecución de modelos ML;
- clustering;
- estimación de riesgo;
- generación de alertas;
- análisis longitudinal;
- procesamiento NLP;
- persistencia;
- auditoría;
- reportes;
- manejo de errores;
- y comportamiento de seguridad.

No sustituye:

- pruebas unitarias;
- pruebas de integración;
- validación clínica;
- análisis formal de riesgos;
- ni evaluación regulatoria.

---

# 3. Objetivo de las pruebas de sistema

Las pruebas deberán responder a la pregunta:

> **¿SISAP by CENIVRA, como sistema completo, cumple sus requisitos y se comporta de forma segura y consistente dentro de su uso previsto?**

La prueba deberá evaluar no solamente resultados correctos, sino también:

- comportamiento ante errores;
- manejo de datos inválidos;
- límites;
- permisos;
- integridad;
- trazabilidad;
- uso de modelos;
- persistencia;
- y comunicación de estados.

---

# 4. Flujo principal del sistema

El flujo principal de prueba será:

```text
Paciente
   │
   ▼
Autenticación
   │
   ▼
Autorización
   │
   ▼
Captura de evaluación
   │
   ▼
Validación
   │
   ▼
Scoring
   │
   ▼
Transformación
   │
   ▼
Normalización
   │
   ▼
Representación dimensional
   │
   ▼
Modelo ML
   │
   ├──► Perfil
   ├──► Cluster
   ├──► Métricas
   └──► Incertidumbre
   │
   ▼
Risk Engine
   │
   ▼
Alert Engine
   │
   ▼
Dashboard
   │
   ▼
Reporte
   │
   ▼
Persistencia
   │
   ▼
Auditoría
```

Este flujo constituirá el principal **System Test Scenario**.

---

# 5. Principios de System Testing

## 5.1 Basado en uso previsto

Los escenarios deberán representar operaciones que formen parte del uso previsto.

## 5.2 Basado en requisitos

Cada requisito verificable deberá estar asociado con una prueba de sistema cuando corresponda.

## 5.3 Basado en riesgos

Las funciones que puedan contribuir a riesgos clínicos recibirán pruebas reforzadas.

## 5.4 Entorno representativo

Las pruebas deberán ejecutarse en un entorno que represente razonablemente al entorno previsto para la operación.

## 5.5 Evidencia reproducible

Cada ejecución deberá dejar evidencia suficiente para reconstruir:

```text
Qué se probó
Cómo se probó
Con qué versión
Con qué configuración
Con qué datos
Qué se esperaba
Qué ocurrió
Quién ejecutó
Cuándo
```

---

# 6. Tipos de pruebas de sistema

Se contemplan:

```text
Functional System Tests
End-to-End Tests
Negative Tests
Boundary Tests
Security Tests
Usability-related System Tests
Data Integrity Tests
Recovery Tests
Regression Tests
Model Execution Tests
Longitudinal Tests
Reporting Tests
Auditability Tests
```

---

# 7. Entorno de System Testing

El entorno deberá documentarse antes de ejecutar las pruebas.

Como mínimo:

```text
Operating System
Python Version
Dash Version
Flask Version
SQLAlchemy Version
Database Version
ML Framework Version
Model Version
Configuration Version
Test Dataset Version
```

Ejemplo:

```text
OS: Windows
Python: 3.x
Dash: x.x.x
Flask: x.x.x
SQLAlchemy: x.x.x
SQLite: x.x
TensorFlow: x.x
```

Los valores definitivos deberán registrarse en cada ejecución.

---

# 8. Configuración de prueba

Cada prueba deberá identificar:

```text
Software Version
Model Version
Clinical Configuration Version
Database Schema Version
Dependency Set
Test Dataset Version
```

Esto permitirá reproducir una ejecución posterior.

---

# 9. Datos de prueba

Los datos de sistema deberán utilizar preferentemente:

```text
Synthetic
De-identified
Reference
Boundary
Negative
```

Los datos clínicos reales solamente se utilizarán cuando exista autorización y control apropiados.

---

# 10. Casos clínicos de referencia

Se establecerá un conjunto controlado de casos:

```text
SYS-CASE-001
SYS-CASE-002
SYS-CASE-003
...
```

Cada caso deberá definir:

- contexto;
- datos;
- condiciones;
- comportamiento esperado;
- resultados esperados;
- y criterios de aceptación.

---

# 11. Scenario ST-001 — Acceso al sistema

## Objetivo

Comprobar el flujo completo de autenticación.

## Procedimiento

```text
Abrir aplicación
      ↓
Introducir credenciales
      ↓
Autenticar
      ↓
Crear sesión
```

## Resultado esperado

El usuario válido deberá acceder a las funciones autorizadas.

## Fallos a probar

```text
Contraseña incorrecta
Usuario inexistente
Usuario deshabilitado
Sesión inválida
```

---

# 12. Scenario ST-002 — Autorización

## Objetivo

Comprobar que el sistema aplique correctamente las restricciones por rol.

## Ejemplo

```text
viewer
  ↓
attempt modify assessment
  ↓
DENY
```

Debe comprobarse:

- ausencia de modificación;
- mensaje apropiado;
- auditoría.

---

# 13. Scenario ST-003 — Creación de paciente

## Objetivo

Verificar el ciclo completo:

```text
Usuario
 ↓
Patient Service
 ↓
Validation
 ↓
Database
 ↓
Audit
```

## Resultado esperado

El paciente deberá quedar registrado y recuperable.

---

# 14. Scenario ST-004 — Creación de evaluación

Debe verificarse:

```text
Patient
 ↓
New Assessment
 ↓
Assessment ID
 ↓
Draft
```

La evaluación deberá quedar correctamente asociada al paciente.

---

# 15. Scenario ST-005 — Captura de evaluación válida

El sistema deberá aceptar una evaluación completa y válida.

Debe comprobarse:

- campos;
- tipos;
- rangos;
- almacenamiento.

---

# 16. Scenario ST-006 — Datos incompletos

Se deberá intentar completar una evaluación con campos obligatorios ausentes.

Resultado esperado:

```text
Evaluation
     ↓
Validation Failure
     ↓
Not Completed
```

No deberá generarse un resultado clínico final inválido.

---

# 17. Scenario ST-007 — Datos fuera de rango

Se introducirán valores fuera del rango definido.

Resultado esperado:

```text
Invalid Data
     ↓
Rejected / Flagged
     ↓
No invalid result
```

---

# 18. Scenario ST-008 — Scoring completo

Flujo:

```text
Responses
 ↓
Scoring
 ↓
Clinical Scores
 ↓
Persistence
```

Debe verificarse:

- puntuación;
- validez;
- versión del instrumento;
- trazabilidad.

---

# 19. Scenario ST-009 — Normalización

Flujo:

```text
Clinical Results
 ↓
Feature Transformation
 ↓
Normalization
```

Debe comprobarse la compatibilidad con la configuración correspondiente.

---

# 20. Scenario ST-010 — Representación dimensional

Flujo:

```text
Normalized Features
 ↓
Dimensional Engine
 ↓
Dimensional Profile
```

Debe verificarse:

- dimensiones;
- valores;
- versión;
- persistencia.

---

# 21. Scenario ST-011 — Inferencia ML

Flujo:

```text
Validated Features
 ↓
Model Compatibility
 ↓
Inference
 ↓
ML Result
```

Debe comprobarse:

- modelo correcto;
- entrada correcta;
- salida;
- versión;
- métricas;
- incertidumbre.

---

# 22. Scenario ST-012 — Modelo ausente

Condición:

```text
Required Model
      ↓
NOT AVAILABLE
```

Resultado esperado:

```text
No inference
No false result
Explicit error state
Audit
```

---

# 23. Scenario ST-013 — Modelo incompatible

Condición:

```text
Model Version
     ≠
Normalization Version
```

Resultado esperado:

```text
Inference BLOCKED
```

---

# 24. Scenario ST-014 — Riesgo

Flujo:

```text
Clinical Features
+
ML Result
      ↓
Risk Engine
      ↓
Risk Result
```

Debe comprobarse:

- score;
- nivel;
- versión;
- incertidumbre;
- estado.

---

# 25. Scenario ST-015 — Umbral de riesgo

Se probarán:

```text
Below threshold
Exactly threshold
Above threshold
```

El comportamiento deberá corresponder exactamente con la regla configurada.

---

# 26. Scenario ST-016 — Generación de alerta

Flujo:

```text
Risk Result
 ↓
Alert Rules
 ↓
Alert
 ↓
Persistence
 ↓
Audit
```

Debe comprobarse:

- trigger;
- severidad;
- estado;
- fecha;
- trazabilidad.

---

# 27. Scenario ST-017 — Fallo de Risk Engine

Condición:

```text
Risk Engine
     ↓
FAIL
```

Resultado esperado:

```text
Risk = NOT_AVAILABLE
No default risk
No false alert
Explicit error
```

---

# 28. Scenario ST-018 — Seguimiento longitudinal

Flujo:

```text
Assessment T1
Assessment T2
Assessment T3
      ↓
Longitudinal Engine
      ↓
Trajectory
```

Debe verificarse:

- orden temporal;
- comparabilidad;
- cambios;
- tendencias;
- versiones.

---

# 29. Scenario ST-019 — Incompatibilidad longitudinal

Debe probarse:

```text
Different Model Versions
Different Clinical Configurations
```

Resultado esperado:

```text
Comparison restricted
or
Compatibility warning
```

según la regla definida.

---

# 30. Scenario ST-020 — NLP

Flujo:

```text
Narrative
 ↓
NLP
 ↓
Structured Result
```

Debe probarse:

- texto válido;
- vacío;
- inválido;
- modelo ausente;
- error.

---

# 31. Scenario ST-021 — Reporte clínico

Flujo:

```text
Assessment
+
Results
+
Risk
+
Alerts
 ↓
Report
```

Debe verificarse:

- correspondencia;
- resultados;
- fecha;
- versiones;
- advertencias.

---

# 32. Scenario ST-022 — Auditoría

Una operación clínica completa deberá producir eventos de auditoría apropiados.

Ejemplo:

```text
Assessment Processed
      ↓
Audit Event
      ↓
User
Timestamp
Assessment ID
Software Version
Model Version
```

---

# 33. Scenario ST-023 — Persistencia completa

Debe comprobarse:

```text
Input
 ↓
Processing
 ↓
Persistence
 ↓
Retrieval
```

Los datos recuperados deberán coincidir con los datos almacenados.

---

# 34. Scenario ST-024 — Fallo de base de datos

Condición:

```text
Database unavailable
```

Resultado esperado:

```text
Operation fails safely
No false confirmation
Error state
```

---

# 35. Scenario ST-025 — Flujo end-to-end principal

Este será uno de los casos principales.

```text
Login
  ↓
Authorization
  ↓
Create Patient
  ↓
Create Assessment
  ↓
Capture Data
  ↓
Validate
  ↓
Scoring
  ↓
Transformation
  ↓
Normalization
  ↓
Dimensions
  ↓
ML
  ↓
Risk
  ↓
Alert
  ↓
Dashboard
  ↓
Report
  ↓
Audit
```

El resultado deberá permitir comprobar el comportamiento completo de SISAP.

---

# 36. Scenario ST-026 — Flujo end-to-end sin alerta

Se utilizará un caso en el que las condiciones de alerta no se cumplan.

Resultado esperado:

```text
Valid assessment
+
Valid risk
+
No alert
```

Debe comprobarse que la ausencia de alerta sea un resultado explícito y no un fallo silencioso.

---

# 37. Scenario ST-027 — Flujo end-to-end con error de modelo

Debe comprobarse:

```text
Assessment
 ↓
Valid Scoring
 ↓
Valid Normalization
 ↓
ML Failure
```

Resultado:

```text
ML unavailable
Risk unavailable if dependent
No false clinical result
```

---

# 38. Scenario ST-028 — Seguridad de acceso a datos

Debe comprobarse que:

```text
Unauthorized User
      ↓
Patient Data Request
      ↓
DENY
```

No deberá exponerse información clínica.

---

# 39. Scenario ST-029 — Modificación no autorizada

Debe probarse:

```text
Viewer
 ↓
Modify Assessment
 ↓
DENY
```

y confirmar que:

- no se modifique información;
- exista auditoría si corresponde.

---

# 40. Scenario ST-030 — Sesión expirada

Debe probarse:

```text
Authenticated Session
       ↓
Session Expired
       ↓
Protected Resource
```

Resultado esperado:

```text
Access Denied
```

---

# 41. Scenario ST-031 — Recuperación

Cuando corresponda, se probará:

```text
Application Failure
      ↓
Restart
      ↓
Database
      ↓
Recover State
```

Debe verificarse la integridad de los datos persistidos.

---

# 42. Scenario ST-032 — Regresión

Después de un cambio relevante se ejecutará el conjunto de pruebas afectado.

Las áreas prioritarias incluyen:

```text
Scoring
Normalization
ML
Risk
Alerts
Security
Database
Reports
```

---

# 43. Pruebas negativas

Cada flujo relevante deberá probar:

```text
Missing Input
Invalid Input
Unauthorized Access
Missing Model
Wrong Model
Wrong Configuration
Database Failure
Processing Failure
```

---

# 44. Pruebas de frontera

Las pruebas deberán incluir:

```text
Minimum
Maximum
Just Below
Just Above
Empty
Null
NaN
Infinity
```

cuando sean aplicables.

---

# 45. Pruebas de seguridad clínica

Los escenarios críticos deberán cubrir al menos:

```text
Invalid clinical data
Incorrect model
Model unavailable
Risk unavailable
Alert failure
Unauthorized access
Incorrect configuration
Database failure
```

---

# 46. Criterios PASS / FAIL

## PASS

Se marca PASS cuando:

```text
Observed = Expected
```

dentro de la tolerancia definida.

## FAIL

Se marca FAIL cuando:

- el resultado difiere;
- existe un comportamiento no especificado;
- se viola un requisito;
- o aparece una condición potencialmente insegura.

---

# 47. Criterios BLOCKED

Una prueba podrá marcarse BLOCKED si:

- no existe una dependencia necesaria;
- el entorno no es reproducible;
- falta un artefacto;
- existe un defecto previo que impide la ejecución.

`BLOCKED` no equivale a `PASS`.

---

# 48. Criterios NOT APPLICABLE

Un caso podrá marcarse `NOT_APPLICABLE` únicamente con justificación documentada.

---

# 49. Registro de prueba de sistema

Cada ejecución deberá conservar:

```text
TEST ID
Scenario ID
Requirement ID
Risk ID
Software Version
Model Version
Configuration Version
Database Version
Environment
Tester
Date
Start Time
End Time
Preconditions
Input
Procedure
Expected Result
Observed Result
Pass/Fail
Anomalies
Evidence
```

---

# 50. Formato de Test Record

Ejemplo:

```text
SYSTEM TEST RECORD

Test ID:
ST-025-R01

Scenario:
End-to-End Clinical Workflow

Requirement:
REQ-SYS-001

Software:
0.5.0

Model:
ML-2026.03

Configuration:
CFG-0.5

Environment:
Windows / Python 3.x

Tester:
________________

Date:
________________

Input:
SYS-CASE-004

Expected:
Complete workflow produces valid
clinical results and stores audit data.

Observed:
________________

Result:
PASS / FAIL / BLOCKED

Anomalies:
________________

Evidence:
________________
```

---

# 51. Identificación de evidencia

La evidencia deberá mantener una nomenclatura consistente.

Ejemplo:

```text
ST-025-R01/
├── test_record.md
├── output.json
├── application.log
├── audit_record.json
└── screenshots/
```

---

# 52. Reproducibilidad

Una prueba deberá poder repetirse usando:

```text
Test Case
+
Software Version
+
Model Version
+
Configuration
+
Dataset
+
Environment
```

---

# 53. Pruebas de modelo

Los modelos deberán evaluarse dentro del sistema, no solamente de forma aislada.

Esto incluye:

```text
Loading
Compatibility
Preprocessing
Inference
Output
Persistence
Presentation
```

---

# 54. Pruebas de resultados ML

Un resultado ML deberá conservar:

```text
Model Version
Prediction
Uncertainty
Timestamp
Assessment
```

cuando corresponda.

---

# 55. Pruebas de incertidumbre

Cuando corresponda:

```text
Low Uncertainty
High Uncertainty
Missing Uncertainty
Invalid Uncertainty
```

deberán generar el comportamiento especificado.

---

# 56. Pruebas de umbrales

Los umbrales clínicos deberán probarse en:

```text
Below
Boundary
Above
```

---

# 57. Pruebas de alertas

Deberán comprobarse:

```text
Trigger
No Trigger
Boundary
Duplicate
Persistence
Review
Closure
```

---

# 58. Pruebas de trazabilidad

Debe comprobarse que un resultado relevante pueda rastrearse hasta:

```text
Patient
 ↓
Assessment
 ↓
Input
 ↓
Processing
 ↓
Model
 ↓
Risk
 ↓
Alert
 ↓
Audit
```

---

# 59. Pruebas de versiones

Debe comprobarse que SISAP identifique correctamente:

```text
Software Version
Model Version
Configuration Version
Database Version
```

---

# 60. Pruebas de configuración incompatible

Ejemplo:

```text
Software A
+
Model B
+
Config C
```

Si la combinación no es compatible:

```text
Execution BLOCKED
```

---

# 61. Pruebas de persistencia

Debe verificarse:

```text
Create
Read
Update
Archive
Recover
```

según las operaciones aplicables.

---

# 62. Pruebas de integridad de datos

Se deberá verificar que:

```text
Input
 ↓
Processing
 ↓
Stored Result
```

mantenga la correspondencia necesaria.

---

# 63. Pruebas de reportes

Deberá comprobarse que el reporte represente los resultados correctos.

Especial atención:

```text
Risk
Alert
Model Version
Date
Patient
Assessment
```

---

# 64. Pruebas de interfaz de usuario

Deberán verificarse:

- navegación;
- mensajes;
- estados;
- errores;
- alertas;
- resultados;
- permisos.

Las pruebas visuales no sustituyen pruebas funcionales.

---

# 65. Pruebas de mensajes

Los mensajes deberán ser:

- coherentes;
- comprensibles;
- no ambiguos;
- y no deberán presentar un resultado computacional como diagnóstico autónomo.

---

# 66. Pruebas de estados

Los estados:

```text
DRAFT
VALIDATED
PROCESSING
COMPLETED
ERROR
ARCHIVED
```

deberán transicionar únicamente según las reglas definidas.

---

# 67. Pruebas de fallo seguro

Debe comprobarse:

```text
Failure
 ↓
Explicit State
 ↓
No misleading clinical output
```

---

# 68. Pruebas de operaciones concurrentes

Cuando corresponda, deberán probarse:

```text
Concurrent Users
Concurrent Assessments
Concurrent Reads
Concurrent Writes
```

La estrategia exacta dependerá del entorno de despliegue.

---

# 69. Pruebas de recuperación

Debe comprobarse que un fallo no genere:

```text
Corrupt Assessment
False Completion
Duplicate Alert
Incomplete Audit
```

---

# 70. Pruebas de cierre y archivo

Debe verificarse:

```text
Completed Assessment
       ↓
Archive
       ↓
Retrieval
```

sin pérdida de trazabilidad.

---

# 71. Pruebas longitudinales

Debe comprobarse que múltiples evaluaciones:

```text
T1
T2
T3
```

puedan presentarse correctamente y que los cambios de versión sean detectados.

---

# 72. Pruebas de compatibilidad temporal

Cuando un modelo o configuración cambie:

```text
T1 → Model A
T2 → Model B
```

el sistema deberá conservar esta diferencia.

---

# 73. Pruebas de auditoría

La ejecución de operaciones críticas deberá producir los eventos esperados.

Debe verificarse:

```text
Actor
Action
Entity
Timestamp
Version
Result
```

cuando corresponda.

---

# 74. Pruebas de seguridad de datos

Debe comprobarse que un usuario no autorizado no pueda:

- consultar;
- modificar;
- exportar;
- eliminar;

información para la cual no tiene permisos.

---

# 75. Pruebas de exportación

Cuando exista exportación:

```text
Authorization
 ↓
Selection
 ↓
Generation
 ↓
Audit
```

deberá verificarse.

---

# 76. Pruebas de eliminación

Las operaciones destructivas deberán comprobar:

- permisos;
- confirmación;
- persistencia;
- auditoría;
- recuperación cuando corresponda.

---

# 77. Pruebas de mantenimiento

Los cambios posteriores a una release deberán activar pruebas según el análisis de impacto.

---

# 78. Pruebas de actualización de modelo

Cada nuevo modelo deberá ejecutar:

```text
Model Verification
 ↓
System Integration
 ↓
System Test
 ↓
Regression
```

antes de ser aprobado para producción.

---

# 79. Pruebas de actualización de configuración

Los cambios en:

```text
thresholds
rules
dimensions
```

deberán activar las pruebas correspondientes.

---

# 80. Criterios de entrada para System Testing

El sistema podrá entrar en pruebas de sistema cuando:

- las unidades relevantes estén verificadas;
- las integraciones críticas estén probadas;
- el entorno esté preparado;
- los requisitos del escenario estén definidos;
- el dataset esté disponible;
- la versión esté identificada;
- y no existan bloqueadores conocidos.

---

# 81. Criterios de salida para System Testing

El conjunto de pruebas podrá considerarse completado cuando:

- todos los casos obligatorios hayan sido ejecutados;
- no existan fallos críticos abiertos;
- las anomalías estén evaluadas;
- los riesgos afectados estén revisados;
- exista evidencia suficiente;
- y la trazabilidad esté actualizada.

---

# 82. Anomalías durante System Testing

Toda anomalía deberá evaluarse para determinar si constituye:

```text
Expected Behavior
Test Issue
Configuration Issue
Software Defect
Safety-related Issue
```

---

# 83. Relación con Problem Resolution

Cuando una prueba revele un defecto:

```text
System Test FAIL
       ↓
Problem Report
       ↓
Investigation
       ↓
Correction
       ↓
Retest
       ↓
Regression
```

---

# 84. Retest

Una prueba corregida deberá conservar:

```text
Original Run
Correction
Retest Run
Final Status
```

No deberán eliminarse resultados históricos.

---

# 85. Regresión

Un cambio deberá generar una evaluación de impacto.

Ejemplo:

```text
Change: Risk Threshold

Affected:
Risk
Alerts
Dashboard
Reports
Longitudinal
```

Las pruebas correspondientes deberán repetirse.

---

# 86. Golden System Scenarios

SISAP deberá mantener escenarios de referencia estables para regresión.

Ejemplo:

```text
SYS-GOLD-001
SYS-GOLD-002
SYS-GOLD-003
```

Cada uno deberá tener resultados esperados controlados.

---

# 87. End-to-End Golden Case

Se recomienda establecer al menos un caso integral:

```text
SYS-GOLD-E2E-001
```

que recorra:

```text
Login
Patient
Assessment
Scoring
Normalization
Dimensions
ML
Risk
Alert
Report
Audit
```

Este caso constituirá una prueba de regresión central.

---

# 88. Criterios de aceptación clínica del sistema

Los resultados clínicos de la prueba deberán:

- corresponder a las especificaciones;
- mantener las relaciones esperadas;
- no producir resultados inválidos;
- y respetar los controles definidos.

La validación clínica formal será una actividad complementaria.

---

# 89. Criterios de seguridad del sistema

Un escenario de seguridad no podrá considerarse PASS cuando:

- aparezca información no autorizada;
- se produzca una salida clínica inválida;
- se presente una alerta incorrecta como válida;
- se oculte un error relevante;
- o se genere un resultado incompatible con la configuración.

---

# 90. Trazabilidad

La matriz deberá evolucionar hacia:

```text
Requirement
   ↓
Risk
   ↓
Architecture
   ↓
Software Unit
   ↓
Integration
   ↓
System Test
   ↓
Release
```

---

# 91. Matriz preliminar de pruebas de sistema

| Test | Requisito | Área | Resultado |
|---|---|---|---|
| ST-001 | REQ-SEC-001 | Authentication | TBD |
| ST-002 | REQ-SEC-004 | Authorization | TBD |
| ST-003 | REQ-PAT-002 | Patient | TBD |
| ST-004 | REQ-EVAL-001 | Assessment | TBD |
| ST-006 | REQ-DATA-004 | Validation | TBD |
| ST-008 | REQ-CLIN-001 | Scoring | TBD |
| ST-009 | REQ-NORM-001 | Normalization | TBD |
| ST-010 | REQ-DIM-001 | Dimensions | TBD |
| ST-011 | REQ-ML-001 | ML | TBD |
| ST-014 | REQ-RISK-001 | Risk | TBD |
| ST-016 | REQ-ALERT-001 | Alert | TBD |
| ST-018 | REQ-LONG-001 | Longitudinal | TBD |
| ST-020 | REQ-NLP-001 | NLP | TBD |
| ST-021 | REQ-REP-001 | Reporting | TBD |
| ST-022 | REQ-AUD-001 | Audit | TBD |
| ST-025 | REQ-SYS-001 | End-to-End | TBD |

---

# 92. Estructura de los registros

Los registros de ejecución se almacenarán en:

```text
docs/
└── 06_system_testing/
    ├── System_Test_Plan.md
    │
    └── test_records/
        ├── ST-001/
        ├── ST-002/
        ├── ST-003/
        ├── ST-025/
        └── ...
```

Cada carpeta podrá contener:

```text
test_record.md
input.json
expected.json
observed.json
logs/
screenshots/
reports/
```

---

# 93. Integridad de los registros de prueba

Los registros no deberán modificarse silenciosamente después de una ejecución.

Cuando exista una corrección:

```text
Original Record
      ↓
Correction / Retest
      ↓
New Record
```

deberá mantenerse el historial.

---

# 94. Retención

Los registros deberán conservarse durante el periodo definido por la política documental del proyecto y las obligaciones aplicables.

---

# 95. Herramientas de System Testing

Se utilizarán cuando corresponda:

```text
pytest
Python
Dash test utilities
Browser automation tools
SQLite inspection
JSON comparison
Coverage tools
Logging tools
```

La herramienta concreta utilizada deberá registrarse cuando sea relevante para reproducibilidad.

---

# 96. Automatización

Los escenarios automatizables deberán automatizarse progresivamente.

Se favorecerán especialmente:

```text
Authentication
Validation
Scoring
Normalization
ML
Risk
Alerts
Persistence
Regression
```

---

# 97. Pruebas manuales

Las pruebas manuales podrán utilizarse cuando:

- el comportamiento sea principalmente visual;
- exista interacción compleja;
- la automatización no sea suficiente;
- o se requiera evaluación de flujo de usuario.

El resultado manual deberá documentarse con el mismo nivel de trazabilidad.

---

# 98. Evidencia visual

Cuando sea necesaria, la evidencia podrá incluir:

```text
Screenshot
Screen recording
Rendered report
Dashboard state
Error message
```

La evidencia visual deberá estar vinculada al Test ID correspondiente.

---

# 99. Métricas de pruebas

Se podrán registrar:

```text
Total Tests
Executed
Passed
Failed
Blocked
Not Applicable
Pass Rate
Open Anomalies
Critical Failures
```

Estas métricas no sustituyen la evaluación individual de los casos.

---

# 100. Cobertura de requisitos

Debe mantenerse:

```text
Requirements covered
Requirements not covered
Requirements pending
```

Los requisitos de seguridad deberán tener cobertura explícita.

---

# 101. Cobertura de riesgos

Los riesgos con controles de software deberán vincularse a pruebas.

Ejemplo:

```text
RISK-ML-001
      ↓
REQ-SAF-003
      ↓
ST-027
```

---

# 102. Cobertura de software items

Debe poder determinarse qué pruebas cubren cada componente:

```text
SU-05 → ST-008
SU-07 → ST-009
SU-09 → ST-011
SU-11 → ST-014
SU-12 → ST-016
```

---

# 103. Pruebas de actualización del software

Una actualización de SISAP deberá generar:

```text
Impact Assessment
 ↓
Affected Requirements
 ↓
Affected Tests
 ↓
Regression
 ↓
New System Test
```

---

# 104. Pruebas de actualización de dependencias

Las actualizaciones de:

```text
Python
Dash
Flask
SQLAlchemy
ML frameworks
```

deberán evaluarse según su impacto.

---

# 105. Pruebas de actualización de base de datos

Una migración deberá verificar:

```text
Schema
Data Integrity
Queries
Persistence
Reports
Audit
```

---

# 106. Pruebas de seguridad tras cambios

Los cambios en:

```text
Authentication
Authorization
Session
Database
Dependencies
```

deberán activar pruebas de seguridad apropiadas.

---

# 107. Pruebas de rendimiento del sistema

Cuando se definan requisitos cuantitativos, se probarán:

```text
Response Time
Processing Time
Memory
Concurrent Users
Database Performance
```

Los criterios definitivos se establecerán antes de la validación correspondiente.

---

# 108. Pruebas de estabilidad

Cuando corresponda se realizarán ejecuciones repetidas para identificar:

- fallos intermitentes;
- fugas de memoria;
- inconsistencias;
- resultados no deterministas.

---

# 109. Pruebas de reproducibilidad del sistema

Un escenario determinista deberá producir resultados equivalentes cuando se repita bajo la misma configuración.

---

# 110. Manejo de resultados inesperados

Si se obtiene un resultado no previsto:

```text
Unexpected Result
      ↓
STOP / CONTINUE according to impact
      ↓
Problem Report
      ↓
Risk Assessment
```

Las pruebas relacionadas con seguridad deberán detenerse cuando exista un riesgo que justifique hacerlo.

---

# 111. Criterios para aceptación de anomalías

Una anomalía conocida podrá permanecer abierta únicamente cuando:

- esté documentada;
- su impacto esté evaluado;
- el riesgo sea aceptable;
- y exista una decisión explícita respecto a la liberación.

---

# 112. Criterios para System Test Release Candidate

Antes de considerar una versión como candidata a release deberá existir:

```text
Completed System Tests
+
No Critical Open Failures
+
Risk Review
+
Configuration Identified
+
Model Identified
+
Evidence Archived
```

---

# 113. Relación con Release Record

Una release deberá apuntar al conjunto de pruebas utilizado:

```text
Release 0.5.0
     ↓
System Test Baseline ST-BL-05
```

---

# 114. Relación con Configuration Management

Los registros deberán permitir determinar:

```text
qué versión
qué modelo
qué configuración
qué datos
qué dependencias
```

fueron utilizados.

---

# 115. Revisión del plan

El plan deberá actualizarse cuando cambien:

- requisitos;
- arquitectura;
- modelos;
- riesgos;
- configuración;
- entorno;
- o estrategia de pruebas.

---

# 116. Criterios de aceptación del plan

Este plan podrá pasar a baseline cuando:

- los principales escenarios estén definidos;
- los casos críticos estén identificados;
- existan criterios PASS/FAIL;
- exista estrategia de evidencia;
- exista relación con requisitos;
- exista estrategia de regresión;
- y estén definidos los criterios de entrada/salida.

---

# 117. Estado del documento

| Elemento | Estado |
|---|---|
| Estrategia de pruebas de sistema | Definida |
| Escenarios principales | Definidos |
| End-to-End | Definido |
| Pruebas de seguridad | Definidas |
| Pruebas ML | Definidas |
| Pruebas de riesgo | Definidas |
| Pruebas de alertas | Definidas |
| Pruebas longitudinales | Definidas |
| Registros | Estructura definida |
| Evidencia | Pendiente de ejecución |
| Trazabilidad | En construcción |
| Baseline | Pendiente |

---

# 118. Aprobación

| Rol | Responsable | Estado |
|---|---|---|
| Responsable del producto | Psic. Lauro Gutiérrez Castro | Pendiente |
| Responsable clínico | Psic. Lauro Gutiérrez Castro | Pendiente |
| Responsable de software | Pendiente | Pendiente |
| Responsable de verificación | Pendiente | Pendiente |

---

# 119. Historial de versiones

| Versión | Fecha | Descripción |
|---|---|---|
| 0.1 | Agosto 2026 | Estructura inicial |
| 0.9 | Pendiente | Revisión técnica |
| 1.0 | Pendiente | Baseline |
| 1.x | Futuro | Cambios controlados |

---

# 120. Declaración

> **SISAP by CENIVRA System Test Plan define la estrategia para demostrar el comportamiento del sistema completo dentro de su uso previsto.**
>
> Los registros de ejecución de las pruebas deberán mantenerse separados de este plan y deberán contener la evidencia objetiva de cada ejecución.
>
> El resultado de las pruebas de sistema no constituye por sí mismo validación clínica, certificación ni autorización regulatoria.