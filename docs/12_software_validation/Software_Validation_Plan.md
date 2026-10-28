# SISAP by CENIVRA

# Software Validation Plan

**Documento:** Software Validation Plan  
**Identificador:** SISAP-SVP-001  
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
| Documento | Software Validation Plan |
| Identificador | SISAP-SVP-001 |
| Versión | 1.0 |
| Estado | Borrador controlado |
| Producto | SISAP by CENIVRA |
| Plataforma | Python / Dash |
| Uso previsto | Apoyo a evaluación, estratificación dimensional y seguimiento de personas atendidas por TUS |
| Marco de desarrollo | IEC 62304:2006 + AMD1:2015 |
| Marco de gestión de riesgos | ISO 14971:2019, cuando resulte aplicable |

---

# 1. Propósito

Este documento establece el plan mediante el cual se determinará si **SISAP by CENIVRA satisface su uso previsto y las necesidades de sus usuarios dentro del entorno para el cual fue diseñado**.

La validación se diferencia de la verificación.

La verificación responde:

> **¿El software fue construido correctamente respecto de sus requisitos y especificaciones?**

La validación responde:

> **¿El software construido es adecuado para el uso previsto?**

Esta distinción es especialmente importante en SISAP porque un algoritmo puede producir correctamente el resultado definido por su especificación y, aun así, no demostrar que dicho resultado sea adecuado para apoyar el proceso clínico previsto.

La presente planificación complementa los procesos de desarrollo, verificación, pruebas, gestión de riesgos y liberación.

IEC 62304 establece procesos de ciclo de vida para software de dispositivo médico, pero declara expresamente que no cubre la validación ni la liberación final del dispositivo médico. Por ello, este documento constituye un proceso complementario para SISAP y no debe interpretarse como que IEC 62304, por sí sola, establece todo el proceso de validación del producto.

---

# 2. Alcance

Este plan aplica a la validación de las funciones incluidas en el uso previsto de SISAP by CENIVRA.

Incluye:

- gestión de pacientes;
- captura de evaluaciones;
- scoring psicométrico;
- procesamiento de variables;
- representación dimensional;
- modelos de aprendizaje automático;
- clustering;
- estimación o estratificación de riesgo;
- alertas;
- análisis longitudinal;
- NLP cuando forme parte de una versión validable;
- visualización;
- reportes;
- auditoría;
- y flujo general de utilización profesional.

También incluye la evaluación del sistema dentro del entorno previsto de utilización.

---

# 3. Relación con el uso previsto

La validación deberá derivarse directamente del documento:

```text
SISAP-IU-001
Intended Use
```

La relación general será:

```text
Uso previsto
      ↓
Necesidad del usuario
      ↓
Requisito
      ↓
Función
      ↓
Sistema
      ↓
Validación
```

No deberán validarse funciones que no estén incluidas en el uso previsto sin modificar previamente la documentación correspondiente.

---

# 4. Principio fundamental

La validación no deberá limitarse a determinar si:

```text
El sistema funciona técnicamente
```

sino si:

```text
El sistema cumple su finalidad prevista
en el contexto de utilización previsto.
```

---

# 5. Diferencia entre verificación y validación

## 5.1 Verificación

La verificación evalúa conformidad con especificaciones.

Ejemplo:

```text
REQ-CLIN-001
      ↓
Scoring Unit
      ↓
TEST-UNIT-001
      ↓
PASS
```

Pregunta:

> ¿Se calculó correctamente la puntuación especificada?

## 5.2 Validación

La validación evalúa adecuación al uso previsto.

Ejemplo:

```text
Uso clínico previsto
      ↓
Profesional utiliza SISAP
      ↓
Revisa perfil
      ↓
Interpreta resultado
      ↓
Resultado apoya el proceso previsto
```

Pregunta:

> ¿La función proporciona información adecuada para el uso previsto?

---

# 6. Modelo de validación

El modelo será:

```text
USER NEED
    ↓
INTENDED USE
    ↓
VALIDATION REQUIREMENT
    ↓
VALIDATION SCENARIO
    ↓
EXECUTION
    ↓
OBSERVED RESULT
    ↓
ACCEPTANCE
```

---

# 7. Objetivos de validación

La validación deberá determinar, según corresponda:

1. si SISAP es utilizable para el propósito previsto;
2. si las funciones implementadas responden a las necesidades previstas;
3. si las salidas son comprensibles dentro del contexto definido;
4. si los flujos permiten una utilización coherente;
5. si las funciones críticas operan de acuerdo con las condiciones previstas;
6. si las limitaciones conocidas están adecuadamente comunicadas;
7. y si el sistema puede utilizarse dentro de los límites establecidos.

---

# 8. Usuarios previstos para la validación

Las actividades de validación deberán considerar a los usuarios previstos:

```text
admin
psicologo
consejero
viewer
```

Sin embargo, las actividades clínicas de validación deberán concentrarse especialmente en los usuarios que interpreten o utilicen resultados clínicos.

---

# 9. Entorno de validación

El entorno deberá representar razonablemente el entorno previsto.

Deberá documentarse:

```text
Hardware
Operating System
Python
Dash
Database
Dependencies
Network
Browser
Models
Configuration
```

Cuando la validación se realice con una configuración diferente a producción, la diferencia deberá justificarse.

---

# 10. Configuración validada

Cada actividad de validación deberá identificar:

```text
Software Version
Model Version
Clinical Configuration
Database Schema
Dependency Set
Environment
```

Ejemplo:

```text
Software:
1.0.0

Model:
ML-2026.04

Clinical Configuration:
CC-1.0

Database:
DB-08
```

---

# 11. Estado de validación

Las funciones podrán clasificarse como:

```text
NOT_VALIDATED
VALIDATION_PLANNED
UNDER_VALIDATION
VALIDATED
VALIDATED_WITH_LIMITATIONS
NOT_VALIDATED
RETIRED
```

---

# 12. Estrategia de validación

La estrategia combinará:

```text
Scenario-based validation
Workflow validation
User-oriented validation
Data validation
Output validation
Safety-oriented validation
Usability-related evaluation
```

cuando corresponda.

---

# 13. Validación basada en escenarios

Los escenarios deberán representar situaciones reales o razonablemente representativas del uso previsto.

Ejemplo:

```text
Profesional
   ↓
Selecciona paciente
   ↓
Realiza evaluación
   ↓
Introduce datos
   ↓
Procesa evaluación
   ↓
Recibe resultados
   ↓
Revisa perfil
   ↓
Revisa riesgo
   ↓
Evalúa alertas
   ↓
Integra información clínica
```

---

# 14. Escenarios de validación

Se establecerán inicialmente:

```text
VAL-001  Acceso al sistema
VAL-002  Gestión de paciente
VAL-003  Evaluación completa
VAL-004  Evaluación incompleta
VAL-005  Scoring
VAL-006  Perfil dimensional
VAL-007  Inferencia ML
VAL-008  Estratificación de riesgo
VAL-009  Alertas
VAL-010  Seguimiento longitudinal
VAL-011  NLP
VAL-012  Reporte
VAL-013  Auditoría
VAL-014  Flujo end-to-end
VAL-015  Error y recuperación
```

Los escenarios deberán modificarse según las funcionalidades efectivamente incluidas en cada release.

---

# 15. VAL-001 — Acceso

## Objetivo

Determinar si un usuario autorizado puede acceder al sistema y utilizar las funciones correspondientes.

## Criterios

- autenticación correcta;
- rol correcto;
- acceso a recursos permitidos;
- rechazo de acceso no autorizado.

---

# 16. VAL-002 — Gestión de paciente

## Objetivo

Determinar si el flujo de creación y consulta de pacientes es adecuado al uso previsto.

Debe evaluarse:

- identificación;
- búsqueda;
- selección;
- consulta;
- asociación de evaluaciones.

---

# 17. VAL-003 — Evaluación completa

## Objetivo

Determinar si un profesional puede completar el flujo de evaluación previsto.

```text
Patient
 ↓
Assessment
 ↓
Responses
 ↓
Validation
 ↓
Processing
 ↓
Results
```

---

# 18. VAL-004 — Evaluación incompleta

## Objetivo

Determinar si el sistema comunica adecuadamente que los datos disponibles son insuficientes.

No deberá presentar un resultado incompleto como resultado final válido.

---

# 19. VAL-005 — Scoring

## Objetivo

Evaluar si las puntuaciones producidas son apropiadas para el flujo previsto.

La validación utilizará los casos y procedimientos clínicos definidos para los instrumentos.

La verificación matemática continuará realizándose mediante las pruebas unitarias correspondientes.

---

# 20. VAL-006 — Perfil dimensional

## Objetivo

Determinar si el perfil dimensional se presenta de manera comprensible y útil dentro del contexto previsto.

Se evaluará:

- identificación de dimensiones;
- consistencia;
- interpretación;
- presentación;
- advertencias;
- y separación entre resultado computacional e interpretación clínica.

---

# 21. VAL-007 — Inferencia ML

## Objetivo

Determinar si el componente ML funciona dentro del uso previsto y las condiciones de aplicabilidad definidas.

La evaluación deberá considerar:

```text
Input
 ↓
Preprocessing
 ↓
Model
 ↓
Output
 ↓
Presentation
```

También deberá comprobarse que las limitaciones conocidas sean visibles o accesibles cuando sea necesario.

---

# 22. VAL-008 — Estratificación de riesgo

## Objetivo

Determinar si la presentación de la estratificación de riesgo es apropiada para el uso previsto.

Debe evaluarse:

- nivel;
- puntuación;
- incertidumbre;
- fuente;
- estado;
- contexto;
- y advertencias.

La validación no implica que SISAP pueda sustituir una evaluación clínica independiente.

---

# 23. VAL-009 — Alertas

## Objetivo

Determinar si las alertas cumplen su función prevista dentro del flujo de revisión profesional.

Debe evaluarse:

- visibilidad;
- identificación;
- contexto;
- prioridad;
- estado;
- trazabilidad;
- interpretación.

---

# 24. VAL-010 — Seguimiento longitudinal

## Objetivo

Determinar si el sistema presenta adecuadamente cambios a través del tiempo.

Se evaluará:

```text
T1
 ↓
T2
 ↓
T3
 ↓
Trajectory
```

También deberá evaluarse la comunicación de incompatibilidades metodológicas o de versiones.

---

# 25. VAL-011 — NLP

Cuando el NLP forme parte de una versión validable:

## Objetivo

Determinar si los resultados derivados del análisis narrativo se presentan de manera compatible con el uso previsto.

Los resultados NLP no deberán presentarse como hechos clínicos confirmados cuando constituyan inferencias computacionales.

---

# 26. VAL-012 — Reportes

## Objetivo

Determinar si los reportes contienen la información necesaria para su finalidad prevista.

Deberán evaluarse:

- identificación;
- fecha;
- resultados;
- versiones;
- alertas;
- advertencias;
- y consistencia.

---

# 27. VAL-013 — Auditoría

## Objetivo

Determinar si las acciones relevantes pueden rastrearse adecuadamente.

Debe evaluarse:

```text
User
Action
Entity
Timestamp
Version
```

cuando corresponda.

---

# 28. VAL-014 — Flujo end-to-end

Este será uno de los escenarios principales.

```text
Login
 ↓
Authorization
 ↓
Patient
 ↓
Assessment
 ↓
Data Capture
 ↓
Validation
 ↓
Scoring
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

El objetivo es determinar si el sistema completo cumple el flujo previsto.

---

# 29. VAL-015 — Error y recuperación

Se evaluará si el usuario recibe información adecuada cuando ocurre un fallo.

Ejemplos:

```text
Model unavailable
Database unavailable
Invalid input
Risk processing failure
Session expiration
```

El sistema no deberá ocultar el fallo ni presentar un resultado inválido como válido.

---

# 30. Validación de necesidades del usuario

Las necesidades de usuario deberán convertirse en escenarios validables.

Ejemplo:

```text
Necesidad:
El profesional necesita conocer el perfil longitudinal.

        ↓

Validation Requirement:
El sistema deberá permitir consultar la evolución temporal.

        ↓

Validation Scenario:
VAL-010
```

---

# 31. User Need IDs

Las necesidades podrán identificarse:

```text
UN-001
UN-002
UN-003
```

Ejemplo:

```text
UN-001
El profesional necesita consultar una evaluación completa.

UN-002
El profesional necesita identificar cambios longitudinales.

UN-003
El profesional necesita distinguir resultados computacionales
de decisiones clínicas.
```

---

# 32. Validation Requirement IDs

Podrán utilizarse:

```text
VAL-REQ-001
VAL-REQ-002
VAL-REQ-003
```

Ejemplo:

```text
VAL-REQ-001
El sistema deberá permitir completar una evaluación
dentro del flujo previsto.
```

---

# 33. Trazabilidad de validación

La relación será:

```text
USER NEED
    ↓
INTENDED USE
    ↓
VALIDATION REQUIREMENT
    ↓
SYSTEM FUNCTION
    ↓
VALIDATION SCENARIO
    ↓
VALIDATION RECORD
```

---

# 34. Validación y requisitos SRS

La validación deberá poder relacionarse con la SRS.

Ejemplo:

```text
REQ-ALERT-001
      ↓
VAL-REQ-008
      ↓
VAL-009
      ↓
VAL-009-R01
```

---

# 35. Validación y riesgos

Cuando corresponda:

```text
Risk
 ↓
Risk Control
 ↓
Requirement
 ↓
Validation
```

Ejemplo:

```text
RISK-002
  ↓
CTRL-ALERT-001
  ↓
REQ-ALERT-001
  ↓
VAL-009
```

---

# 36. Verificación y validación

La relación puede representarse:

```text
VERIFICATION
¿Está construido conforme a especificación?
        │
        ▼
VALIDATION
¿Es adecuado para el uso previsto?
```

Ambas actividades deberán conservar evidencia separada.

---

# 37. No sustitución de pruebas

La validación no sustituirá:

- unit tests;
- integration tests;
- system tests;
- pruebas de seguridad;
- verificación de controles de riesgo.

La validación complementa estas actividades.

---

# 38. Datos de validación

Los datos utilizados deberán ser:

```text
Representative
Controlled
Documented
Traceable
```

Preferentemente:

```text
Synthetic
De-identified
Reference
```

cuando sea posible.

---

# 39. Dataset de validación

Los datasets utilizados para validación deberán poseer identificación.

Ejemplo:

```text
VAL-DATA-001
```

y:

```text
Validation Dataset Version:
VAL-DATA-0.1
```

---

# 40. Separación entrenamiento-validación-prueba

Cuando existan modelos ML, deberá evitarse utilizar inadvertidamente datos que hayan participado en entrenamiento como evidencia independiente de validación.

La procedencia de los datasets deberá documentarse.

---

# 41. Validación de población

Deberá verificarse que los escenarios y datos utilizados sean compatibles con la población objetivo definida.

Cuando se utilice una población distinta:

```text
Difference
 ↓
Impact Analysis
 ↓
Justification
```

---

# 42. Validación de entorno

La validación deberá representar el entorno de utilización previsto.

Podrán evaluarse:

- hardware;
- software;
- navegador;
- red;
- almacenamiento;
- usuarios;
- y configuración.

---

# 43. Validación de configuración

La configuración validada deberá quedar congelada durante la ejecución cuando sea necesario.

```text
Software
+
Model
+
Config
+
Database
```

deberán estar identificados.

---

# 44. Validación de modelos

Para cada modelo incluido en una funcionalidad validable deberá comprobarse:

- versión;
- datos de entrada;
- procesamiento;
- dominio;
- rendimiento;
- limitaciones;
- comportamiento esperado;
- y compatibilidad con el sistema.

---

# 45. Validación de incertidumbre

Cuando una función produzca incertidumbre, deberá evaluarse si el usuario puede comprender correctamente:

- qué significa;
- cuándo es elevada;
- qué limitaciones implica;
- y qué acciones adicionales corresponden al flujo previsto.

---

# 46. Validación de alertas

La validación deberá determinar si una alerta:

```text
se genera
se muestra
se contextualiza
se puede revisar
```

de acuerdo con el uso previsto.

---

# 47. Validación de interpretación

Deberá evaluarse el riesgo de que un usuario interprete:

```text
Score
```

como:

```text
Diagnosis
```

o:

```text
Risk Level
```

como:

```text
Clinical Decision
```

cuando dichas interpretaciones no correspondan.

---

# 48. Validación de información histórica

Deberá comprobarse que los resultados históricos no se presenten de manera que puedan confundirse con resultados actuales.

---

# 49. Validación de versiones

Cuando el resultado dependa de versiones:

```text
Software Version
Model Version
Configuration Version
```

estas deberán presentarse o conservarse de acuerdo con las necesidades de trazabilidad del uso previsto.

---

# 50. Validación de flujo profesional

Debe evaluarse:

```text
Professional
      ↓
SISAP Output
      ↓
Review
      ↓
Interpretation
```

La validación deberá comprobar que el sistema no obligue arquitectónicamente a convertir un resultado computacional en una decisión automática.

---

# 51. Evaluación de errores de usuario

Deberán considerarse errores previsibles como:

```text
Wrong Patient
Wrong Assessment
Wrong Data
Wrong Interpretation
Wrong Report
```

La evaluación de estos escenarios deberá relacionarse con los riesgos correspondientes.

---

# 52. Validación de mensajes

Los mensajes de error, advertencia y estado deberán evaluarse para determinar que no generen una interpretación incorrecta.

---

# 53. Validación de reportes

Los reportes deberán evaluarse como productos de información y no solamente como archivos técnicamente generados.

Se comprobará:

```text
Correct Patient
Correct Assessment
Correct Results
Correct Version
Correct Date
Correct Warnings
```

---

# 54. Validación de auditoría

Se deberá comprobar que el funcionamiento real genere la trazabilidad prevista.

---

# 55. Validación de seguridad

Cuando la seguridad técnica forme parte del uso previsto, deberán validarse:

- autenticación;
- autorización;
- sesiones;
- acceso a información;
- exportación;
- y protección de funciones.

---

# 56. Validación de rendimiento

Los criterios cuantitativos se validarán cuando estén definidos en los requisitos.

Ejemplos:

```text
Response time
Processing time
Memory limits
Concurrent use
```

---

# 57. Validación de disponibilidad

Cuando se establezcan requisitos de disponibilidad:

```text
Expected availability
Failure handling
Recovery
```

serán objeto de validación.

---

# 58. Criterios de aceptación

Cada escenario deberá definir previamente:

```text
Expected Result
Acceptance Criteria
```

Ejemplo:

```text
Expected:
Professional can complete assessment
and correctly identify the generated result.

Acceptance:
All required workflow steps completed
without misleading output.
```

---

# 59. PASS

Un escenario será `PASS` cuando:

- se cumplan los criterios;
- el resultado sea adecuado;
- no exista una desviación relevante;
- y la evidencia sea suficiente.

---

# 60. FAIL

Será `FAIL` cuando:

- no se cumpla un criterio;
- el resultado contradiga el uso previsto;
- exista una desviación relevante;
- o aparezca un comportamiento que pueda comprometer la finalidad prevista.

---

# 61. PASS WITH LIMITATIONS

Podrá utilizarse:

```text
PASS WITH LIMITATIONS
```

cuando el sistema cumpla el uso previsto dentro de restricciones documentadas.

Las limitaciones deberán quedar registradas.

---

# 62. BLOCKED

Un escenario podrá marcarse `BLOCKED` cuando no pueda ejecutarse debido a:

- entorno;
- dependencia;
- configuración;
- datos;
- o defecto previo.

No equivale a validado.

---

# 63. Registro de validación

Cada ejecución deberá generar un registro con:

```text
Validation Record ID
User Need
Validation Requirement
Scenario
Software Version
Model Version
Configuration
Environment
Dataset
Tester
Date
Preconditions
Procedure
Expected Result
Observed Result
Acceptance
Anomalies
Conclusion
Evidence
```

---

# 64. Formato de Validation Record

```text
==================================================
SISAP RECOVER AI
VALIDATION RECORD
==================================================

Validation ID:
VAL-009-R01

User Need:
UN-003

Validation Requirement:
VAL-REQ-008

Scenario:
VAL-009 — Alerts

Software Version:
1.0.0

Model Version:
ML-2026.04

Configuration:
CC-1.0

Database:
DB-08

Environment:
________________

Dataset:
VAL-DATA-001

Tester:
________________

Date:
________________

Preconditions:
________________

Procedure:
________________

Expected Result:
________________

Observed Result:
________________

Acceptance:
PASS / FAIL / PASS WITH LIMITATIONS / BLOCKED

Anomalies:
________________

Evidence:
________________

Conclusion:
________________
==================================================
```

---

# 65. Evidencia de validación

La evidencia podrá incluir:

```text
Validation record
Screenshots
Reports
System logs
Generated outputs
User evaluation
Structured observations
Dataset references
```

La evidencia deberá estar vinculada al Validation ID.

---

# 66. Validación de usuarios

Cuando se realicen evaluaciones con usuarios, deberá registrarse:

- perfil del usuario;
- experiencia relevante;
- escenario;
- tarea;
- resultado;
- observaciones;
- problemas encontrados.

Los datos personales de los participantes deberán gestionarse conforme a las políticas aplicables.

---

# 67. Tamaño y selección de usuarios

El número y tipo de participantes deberán justificarse según:

- objetivo de la validación;
- complejidad;
- riesgo;
- variabilidad de usuarios;
- y funciones evaluadas.

No se deberá asumir que un número arbitrario constituye automáticamente validación suficiente.

---

# 68. Evaluación de usabilidad relacionada con seguridad

Cuando una interacción pueda afectar la seguridad:

```text
User
 ↓
Interface
 ↓
Interpretation
 ↓
Action
```

deberá considerarse como parte del análisis correspondiente.

Cuando sea aplicable, podrán utilizarse principios de ingeniería de usabilidad de IEC 62366-1 como referencia adicional.

---

# 69. Validación de entrenamiento del usuario

Cuando la formación del usuario constituya un control necesario, deberá documentarse:

```text
Training
 ↓
User Capability
 ↓
Validation
```

---

# 70. Validación de instrucciones

Las instrucciones, advertencias o mensajes importantes deberán evaluarse en el contexto donde serán utilizados.

---

# 71. Validación de limitaciones

Las limitaciones documentadas deberán verificarse en el entorno correspondiente.

Ejemplo:

```text
Model not validated outside defined population
```

deberá reflejarse en el comportamiento o información proporcionada por el sistema cuando sea necesario.

---

# 72. Validación de uso razonablemente previsible

Los escenarios relevantes identificados en el Intended Use y Risk Management deberán evaluarse.

Ejemplos:

```text
Use incomplete assessment
Interpret alert as diagnosis
Use old result as current
Use model outside domain
```

---

# 73. Validación frente a usos indebidos

Cuando una función pueda ser utilizada de manera incorrecta previsible, deberá comprobarse que el sistema reduzca el riesgo de interpretación o utilización indebida cuando esto forme parte del control definido.

---

# 74. Validación de fallos

La validación deberá comprobar que los fallos sean comunicados de forma compatible con el uso previsto.

---

# 75. Validación de datos

Deberá evaluarse:

```text
Valid
Missing
Invalid
Out-of-range
Unexpected
```

cuando sean relevantes.

---

# 76. Validación de persistencia

Debe verificarse en el contexto del uso:

```text
Create
Save
Retrieve
Display
```

sin pérdida o asociación incorrecta.

---

# 77. Validación de consistencia de resultados

El resultado mostrado al usuario deberá corresponder con el resultado almacenado.

---

# 78. Validación de trazabilidad

Debe comprobarse que las funciones relevantes produzcan suficiente información para identificar:

```text
User
Patient
Assessment
Software
Model
Configuration
```

cuando corresponda.

---

# 79. Validación de actualización

Cuando una nueva versión modifique funciones relevantes:

```text
Change
 ↓
Impact Assessment
 ↓
Validation
```

deberá determinarse si es necesaria una nueva actividad de validación.

---

# 80. Validación de modelos actualizados

Un nuevo modelo deberá evaluarse respecto de:

```text
Intended Use
Performance
Domain
Output
Interpretability
Limitations
Risk
```

---

# 81. Validación de cambio de configuración

Los cambios de:

```text
Threshold
Clinical Rule
Normalization
Dimension Mapping
Model Selection
```

deberán evaluarse por impacto.

---

# 82. Validación de cambios de SOUP

Los cambios relevantes de dependencias deberán evaluarse cuando puedan afectar el uso previsto.

---

# 83. Validación de cambios de base de datos

Una modificación del esquema deberá comprobar:

```text
Data Integrity
Clinical Workflow
Historical Data
Reports
```

cuando sean aplicables.

---

# 84. Revalidación

Una función podrá requerir revalidación cuando exista:

- cambio de uso previsto;
- nueva población;
- nueva función;
- nuevo modelo;
- cambio de arquitectura;
- cambio clínico;
- cambio significativo de dependencia;
- incidente;
- o evidencia de comportamiento inesperado.

---

# 85. Criterios de revalidación

La decisión deberá basarse en:

```text
Change Impact
+
Risk
+
Affected Function
+
Previous Evidence
```

---

# 86. Validación continua

La validación no se considerará necesariamente una actividad única.

Cuando exista mantenimiento significativo, podrá requerirse nueva validación.

---

# 87. Relación con Risk Management

La validación deberá proporcionar evidencia para los riesgos relevantes.

```text
RISK
 ↓
CONTROL
 ↓
SYSTEM
 ↓
VALIDATION
```

---

# 88. Beneficio clínico

Cuando sea necesario para una futura evaluación regulatoria o institucional, deberá analizarse también la relación:

```text
Expected Benefit
        vs.
Residual Risk
```

La metodología definitiva se establecerá dentro del sistema formal de gestión de riesgos.

ISO 14971:2019 exige criterios objetivos de aceptabilidad del riesgo, pero no fija por sí misma cuáles deben ser los niveles aceptables; estos dependen del contexto del dispositivo y su uso previsto. La norma permanece vigente y fue confirmada por ISO en 2025.

---

# 89. Criterios de conclusión

La validación podrá concluir:

```text
VALIDATED
VALIDATED WITH LIMITATIONS
NOT VALIDATED
```

---

# 90. Validated

Se asignará cuando la evidencia demuestre cumplimiento del uso previsto dentro del alcance evaluado.

---

# 91. Validated With Limitations

Se utilizará cuando el sistema sea adecuado únicamente bajo condiciones claramente documentadas.

Ejemplo:

```text
Validated for:
Defined population
Defined model
Defined environment

Not validated for:
Other populations
```

---

# 92. Not Validated

Se utilizará cuando la evidencia sea insuficiente o existan incumplimientos relevantes.

---

# 93. Criterios de cierre

Una actividad de validación podrá cerrarse cuando:

- los escenarios requeridos hayan sido ejecutados;
- las desviaciones estén evaluadas;
- los problemas críticos estén resueltos;
- los riesgos relevantes estén revisados;
- y exista evidencia suficiente.

---

# 94. Anomalías de validación

Las anomalías deberán:

```text
Identify
 ↓
Classify
 ↓
Assess
 ↓
Link to Risk if relevant
 ↓
Resolve / Accept / Defer
```

---

# 95. Registro de desviaciones

Cuando una prueba no pueda ejecutarse exactamente como fue planificada, deberá registrarse:

```text
Deviation ID
Reason
Impact
Effect on Validity
Decision
```

---

# 96. Dependencia de evidencia previa

La validación podrá apoyarse en evidencia de:

- verificación;
- integración;
- pruebas de sistema;
- validaciones anteriores;

pero deberá quedar claro qué evidencia se reutiliza y por qué sigue siendo válida.

---

# 97. Validación de la primera release

Antes de una primera release destinada al uso definido, deberán haberse completado las actividades de validación aplicables.

---

# 98. Validación de releases posteriores

Una nueva release deberá evaluarse para determinar:

```text
No Revalidation
Partial Revalidation
Full Revalidation
```

según el análisis de impacto.

---

# 99. Criterios de liberación relacionados con validación

Una release no deberá marcarse como validada si:

```text
Required Validation
=
Incomplete
```

---

# 100. Matriz de validación

Se mantendrá:

```text
validation_traceability.csv
```

Columnas:

```text
user_need_id
intended_use_id
validation_requirement_id
srs_requirement_id
risk_id
control_id
software_item_id
scenario_id
validation_record_id
software_version
model_version
configuration_version
result
status
```

---

# 101. Ejemplo de matriz

| User Need | Validation Req | SRS | Risk | Scenario | Record | Result |
|---|---|---|---|---|---|---|
| UN-001 | VAL-REQ-001 | REQ-EVAL-001 | RISK-004 | VAL-003 | VAL-003-R01 | TBD |
| UN-002 | VAL-REQ-002 | REQ-LONG-001 | RISK-011 | VAL-010 | VAL-010-R01 | TBD |
| UN-003 | VAL-REQ-008 | REQ-ALERT-001 | RISK-002 | VAL-009 | VAL-009-R01 | TBD |

---

# 102. Validación de extremo a extremo

El flujo crítico deberá poder recorrer:

```text
Intended Use
      ↓
User Need
      ↓
Requirement
      ↓
Risk
      ↓
Control
      ↓
Software
      ↓
Test
      ↓
Validation
      ↓
Release
```

---

# 103. Validación y clasificación de seguridad

La evidencia de validación podrá contribuir a demostrar que las funciones relevantes funcionan dentro de su uso previsto.

No obstante, la validación no sustituye la clasificación de seguridad ni el análisis de riesgos.

---

# 104. Validación y modelos

La documentación de validación deberá identificar qué modelo fue evaluado.

Nunca deberá considerarse que:

```text
Model A validated
```

implica automáticamente:

```text
Model B validated
```

---

# 105. Validación y configuración

La evidencia se considerará válida únicamente para la configuración evaluada, salvo justificación para su extrapolación.

---

# 106. Revisión de independencia

Cuando sea posible, las actividades de validación deberán incluir revisión independiente del resultado por una persona distinta del desarrollador que implementó la función.

El grado de independencia requerido deberá establecerse proporcionalmente al riesgo.

---

# 107. Competencia de los evaluadores

Las personas que ejecuten o revisen validaciones deberán poseer competencia apropiada para las actividades realizadas.

En validaciones clínicas deberá existir competencia suficiente para interpretar el contexto clínico.

---

# 108. Criterios de aceptación globales

SISAP podrá considerarse validado para un alcance determinado cuando:

```text
Uso previsto definido
      ↓
Usuarios definidos
      ↓
Entorno definido
      ↓
Escenarios ejecutados
      ↓
Criterios satisfechos
      ↓
Anomalías evaluadas
      ↓
Riesgos revisados
      ↓
Evidencia completa
      ↓
Conclusión aprobada
```

---

# 109. Limitaciones de la validación

La validación estará limitada por:

- población evaluada;
- entorno;
- configuración;
- modelos;
- versión;
- datasets;
- funciones incluidas;
- y escenarios evaluados.

Una conclusión de validación no deberá extrapolarse automáticamente fuera de estos límites.

---

# 110. Validación de población futura

Si SISAP se extiende a otra población:

```text
New Population
      ↓
Impact Assessment
      ↓
Risk Review
      ↓
Additional Validation
```

---

# 111. Validación de nuevo entorno

Si SISAP se despliega en otro entorno:

```text
New Environment
      ↓
Compatibility
      ↓
Risk
      ↓
Revalidation
```

---

# 112. Validación de nuevas funciones

Una nueva función incluida en el producto deberá evaluarse antes de incorporarse al alcance validado.

---

# 113. Validación de nuevos usuarios

Si se incorpora un nuevo perfil de usuario:

```text
New User
 ↓
New Workflow
 ↓
Impact
 ↓
Validation
```

---

# 114. Validación de nuevas interfaces

Una modificación relevante de UI deberá evaluarse respecto de:

- comprensión;
- interacción;
- seguridad;
- presentación;
- y flujo de trabajo.

---

# 115. Validación de mantenimiento

Las actividades de mantenimiento deberán determinar si afectan la validez previa.

---

# 116. Validación posterior a incidentes

Cuando ocurra un incidente relevante:

```text
Incident
 ↓
Investigation
 ↓
Risk Review
 ↓
Validation Impact
 ↓
Revalidation if required
```

---

# 117. Control de cambios del plan

El presente plan deberá actualizarse cuando cambien:

- uso previsto;
- población;
- arquitectura;
- modelos;
- riesgos;
- escenarios;
- criterios;
- o estrategia de validación.

---

# 118. Registros de validación

La estructura podrá ser:

```text
docs/
└── 12_software_validation/
    │
    ├── Software_Validation_Plan.md
    │
    ├── validation_traceability.csv
    │
    └── validation_records/
        │
        ├── VAL-001-R01/
        ├── VAL-002-R01/
        ├── VAL-003-R01/
        └── ...
```

---

# 119. Evidencia de validación

Cada registro podrá contener:

```text
validation_record.md
expected_result.json
observed_result.json
screenshots/
reports/
logs/
supporting_evidence/
```

---

# 120. Criterios de aceptación del documento

Este plan podrá pasar a baseline cuando:

- el uso previsto esté aprobado;
- las necesidades de usuario estén identificadas;
- los escenarios estén definidos;
- los criterios de aceptación estén establecidos;
- la trazabilidad esté definida;
- los criterios de revalidación estén definidos;
- y las responsabilidades estén asignadas.

---

# 121. Estado actual

| Elemento | Estado |
|---|---|
| Intended Use | Definido preliminarmente |
| User Needs | Definidas preliminarmente |
| Validation Requirements | Definidos preliminarmente |
| Validation Scenarios | Definidos |
| End-to-End Validation | Definida |
| Model Validation | Definida |
| Risk-related Validation | Definida |
| Validation Traceability | Definida |
| Validation Records | Estructura definida |
| User Validation | Planificada |
| Revalidation | Definida |
| Limitations | Definidas |
| Baseline | Pendiente |

---

# 122. Aprobación

| Rol | Responsable | Estado |
|---|---|---|
| Responsable del producto | Psic. Lauro Gutiérrez Castro | Pendiente |
| Responsable clínico | Psic. Lauro Gutiérrez Castro | Pendiente |
| Responsable de software | Pendiente | Pendiente |
| Responsable de riesgos | Pendiente | Pendiente |
| Responsable de verificación | Pendiente | Pendiente |
| Responsable de validación | Pendiente | Pendiente |

---

# 123. Historial de versiones

| Versión | Fecha | Descripción |
|---|---|---|
| 0.1 | Agosto 2026 | Estructura inicial |
| 0.9 | Pendiente | Revisión clínica y técnica |
| 1.0 | Pendiente | Baseline inicial |
| 1.x | Futuro | Cambios controlados |

---

# 124. Declaración

> **SISAP by CENIVRA Software Validation Plan establece la estrategia para determinar si el software satisface su uso previsto y las necesidades de sus usuarios dentro de las condiciones de utilización definidas.**
>
> La validación se mantiene conceptualmente separada de la verificación técnica. Las pruebas unitarias, de integración y de sistema proporcionan evidencia de verificación; las actividades descritas en este documento proporcionan evidencia orientada a la adecuación del sistema para el uso previsto.
>
> El alcance de una conclusión de validación estará limitado por la población, entorno, configuración, modelos, versión y escenarios evaluados.
>
> Cualquier modificación significativa del uso previsto, población, arquitectura, modelo, configuración o funciones deberá evaluarse para determinar la necesidad de revalidación.
>
> Este documento constituye un plan de validación y no una certificación, declaración de conformidad ni autorización regulatoria.