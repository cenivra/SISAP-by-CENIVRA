# SISAP by CENIVRA

> [!NOTE]
> **Control Documental (Fuente Única de Verdad `v1.1.0`):** Este archivo se conserva como registro histórico de la fase conceptual inicial (`v1.0`, agosto 2026, Python / Dash). El Expediente de Gestión de Riesgos y evaluación de clasificación de seguridad A/B/C **vigente para `v1.1.0`** reside en [`docs/lifecycle/04_risk_management/RISK_MANAGEMENT_FILE_v1.1.md`](../lifecycle/04_risk_management/RISK_MANAGEMENT_FILE_v1.1.md).

# Software Risk Management File

**Documento:** Software Risk Management File  
**Identificador:** SISAP-RMF-001  
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
| Documento | Software Risk Management File |
| Identificador | SISAP-RMF-001 |
| Versión | 1.0 |
| Estado | Borrador controlado |
| Producto | SISAP by CENIVRA |
| Plataforma | Python / Dash |
| Marco principal | IEC 62304:2006 + AMD1:2015 |
| Gestión de riesgos | Integrada con ISO 14971, según corresponda |

---

# 1. Propósito

Este documento establece la estructura para identificar, analizar, controlar, verificar y mantener bajo seguimiento los riesgos relacionados con el software de SISAP by CENIVRA.

El objetivo es determinar:

1. cómo el software puede contribuir a una situación peligrosa;
2. qué fallos o causas pueden producir dicha contribución;
3. qué medidas de control deben implementarse;
4. dónde se implementan;
5. cómo se verifica cada control;
6. y cuál es el riesgo residual después de su aplicación.

IEC 62304 exige identificar los *software items* que puedan contribuir a situaciones peligrosas, identificar las causas potenciales de esa contribución y documentar las medidas de control de riesgo asociadas.

---

# 2. Alcance

Este archivo aplica a los componentes de software que formen parte de SISAP by CENIVRA y que puedan contribuir directa o indirectamente a una situación peligrosa.

Incluye:

- lógica clínica;
- scoring;
- transformaciones;
- normalización;
- representación dimensional;
- modelos ML;
- clustering;
- estratificación de riesgo;
- alertas;
- análisis longitudinal;
- NLP;
- autenticación;
- autorización;
- persistencia;
- auditoría;
- configuración;
- dependencias SOUP;
- interfaz de usuario;
- y componentes de infraestructura cuando su fallo pueda afectar al software.

---

# 3. Marco de referencia

La gestión de riesgos del software se desarrollará integrada con el proceso de gestión de riesgos del producto.

IEC 62304:2006+AMD1:2015 establece un proceso específico para identificar cómo un *software item* puede contribuir a una situación peligrosa y para definir y verificar medidas de control de riesgo. Este proceso se relaciona con la gestión de riesgos definida por ISO 14971.

Para SISAP, el análisis de riesgos se estructurará alrededor de:

```text
Uso previsto
   ↓
Peligro
   ↓
Secuencia de eventos
   ↓
Situación peligrosa
   ↓
Daño potencial
   ↓
Contribución del software
   ↓
Control de riesgo
   ↓
Verificación
   ↓
Riesgo residual
```

---

# 4. Definiciones

## 4.1 Peligro

Fuente potencial de daño.

## 4.2 Situación peligrosa

Circunstancia en la que una persona está expuesta a uno o más peligros.

## 4.3 Daño

Lesión o perjuicio potencial resultante de una situación peligrosa.

## 4.4 Riesgo

Combinación de la probabilidad de ocurrencia del daño y la severidad de ese daño.

## 4.5 Software Item

Componente identificable del software que puede ser analizado individualmente respecto de su función y contribución al riesgo.

## 4.6 Medida de control de riesgo

Medida destinada a reducir o controlar un riesgo.

Puede implementarse en:

- software;
- hardware;
- procedimientos;
- entorno;
- instrucciones de uso;
- o combinaciones de estos.

IEC 62304 señala expresamente que una medida de control de riesgo puede encontrarse fuera del software.

---

# 5. Principios de gestión de riesgos

## 5.1 Seguridad por diseño

Los riesgos deberán considerarse desde el diseño inicial.

## 5.2 Enfoque basado en escenarios

No se evaluará únicamente “si el software falla”, sino:

```text
Cómo falla
   ↓
Qué ocurre después
   ↓
Qué puede hacer el usuario
   ↓
Qué situación peligrosa puede producirse
   ↓
Qué daño podría resultar
```

## 5.3 Peor caso razonablemente relevante

La clasificación y evaluación deberán considerar escenarios de fallo relevantes y sus consecuencias.

## 5.4 Controles verificables

Todo control implementado por software deberá tener evidencia de verificación.

## 5.5 Trazabilidad

Cada riesgo relevante deberá poder relacionarse con:

```text
Risk
 ↓
Control
 ↓
Requirement
 ↓
Software Item
 ↓
Test
 ↓
Release
```

---

# 6. Software Items sujetos a análisis

Los principales *software items* identificados en la arquitectura son:

```text
SWI-01 Presentation Service
SWI-02 Application Service
SWI-03 Assessment Service
SWI-04 Clinical Scoring Engine
SWI-05 Transformation Engine
SWI-06 Normalization Engine
SWI-07 Dimensional Engine
SWI-08 ML Engine
SWI-09 Model Registry
SWI-10 Risk Engine
SWI-11 Alert Engine
SWI-12 Longitudinal Engine
SWI-13 NLP Engine
SWI-14 Security Service
SWI-15 Audit Service
SWI-16 Persistence Service
SWI-17 Reporting Service
SWI-18 Configuration Service
```

Esta lista se corresponde con la arquitectura documentada en `SISAP-SAD-001`.

---

# 7. Identificación de software que puede contribuir a situaciones peligrosas

Deberá determinarse cuáles de los *software items* pueden contribuir directa o indirectamente a una situación peligrosa.

Los candidatos iniciales incluyen:

```text
SWI-04 Clinical Scoring Engine
SWI-05 Transformation Engine
SWI-06 Normalization Engine
SWI-07 Dimensional Engine
SWI-08 ML Engine
SWI-10 Risk Engine
SWI-11 Alert Engine
SWI-12 Longitudinal Engine
SWI-13 NLP Engine
SWI-14 Security Service
SWI-16 Persistence Service
SWI-18 Configuration Service
```

Esta lista es preliminar y deberá confirmarse mediante el análisis formal de riesgos.

---

# 8. Clasificación de seguridad y riesgo

La clasificación A/B/C de un *software item* deberá establecerse considerando el riesgo de daño asociado con una situación peligrosa a la que pueda contribuir dicho elemento.

IEC 62304:2006+AMD1:2015 define las clases A, B y C en función de la gravedad del daño potencial y del riesgo residual después de considerar medidas de control externas al software.

La clasificación definitiva no deberá asignarse únicamente por el nombre del módulo.

Deberá existir una justificación documentada.

---

# 9. Metodología de análisis

Cada escenario de riesgo deberá analizarse mediante:

```text
Step 1
Identificar peligro

Step 2
Identificar situación peligrosa

Step 3
Identificar daño

Step 4
Identificar software item

Step 5
Identificar causas potenciales

Step 6
Evaluar riesgo

Step 7
Definir controles

Step 8
Implementar controles

Step 9
Verificar controles

Step 10
Evaluar riesgo residual
```

---

# 10. Categorías de causas potenciales

Para cada *software item* relevante deberán considerarse causas como:

- especificación incompleta o incorrecta;
- defecto de software;
- fallo de componente SOUP;
- comportamiento inesperado de dependencias;
- datos incorrectos;
- datos incompletos;
- configuración incorrecta;
- modelo incompatible;
- modelo degradado;
- error de interfaz;
- error de usuario razonablemente previsible;
- fallo de hardware relevante;
- corrupción de datos;
- fallo de almacenamiento;
- fallo de comunicación;
- y errores derivados de cambios o mantenimiento.

IEC 62304 identifica específicamente la especificación incorrecta o incompleta, defectos del software, fallos o resultados inesperados de SOUP, fallos de hardware u otros defectos y mal uso razonablemente previsible como causas que deben considerarse para software que pueda contribuir a situaciones peligrosas.

---

# 11. Escenario de riesgo RISK-001

## Clasificación incorrecta del perfil

| Campo | Descripción |
|---|---|
| ID | RISK-001 |
| Peligro | Información clínica incorrecta |
| Software Item | SWI-08 ML Engine |
| Evento | El modelo genera una representación o clasificación incorrecta |
| Situación peligrosa | El profesional interpreta el resultado como representación válida del paciente |
| Daño potencial | Decisión clínica inadecuada |
| Causa | Modelo defectuoso, entrada incompatible o configuración incorrecta |
| Control | Validación de entrada + validación de modelo + revisión profesional |
| Implementación | SU-07 / SU-09 / UI |
| Verificación | TEST-RISK-001 |
| Riesgo residual | Pendiente |

---

# 12. Escenario de riesgo RISK-002

## Falso negativo de alerta

| Campo | Descripción |
|---|---|
| ID | RISK-002 |
| Peligro | Riesgo clínico no identificado |
| Software Item | SWI-10 / SWI-11 |
| Evento | No se genera una alerta requerida |
| Situación peligrosa | El profesional no recibe la señal de riesgo esperada |
| Daño potencial | Retraso o ausencia de intervención apropiada |
| Causa | Error de regla, umbral, cálculo, modelo o software |
| Control | Reglas explícitas + pruebas de frontera + revisión profesional |
| Implementación | Risk Engine / Alert Engine |
| Verificación | TEST-RISK-002 |
| Riesgo residual | Pendiente |

---

# 13. Escenario de riesgo RISK-003

## Falso positivo de alerta

| Campo | Descripción |
|---|---|
| ID | RISK-003 |
| Peligro | Información clínica incorrecta |
| Software Item | SWI-11 Alert Engine |
| Evento | Se genera una alerta sin que se cumplan correctamente las condiciones |
| Situación peligrosa | El profesional interpreta la alerta como señal válida |
| Daño potencial | Intervención innecesaria o interpretación errónea |
| Causa | Error de regla, umbral o datos |
| Control | Validación de reglas + pruebas de frontera + revisión |
| Implementación | Alert Engine |
| Verificación | TEST-RISK-003 |
| Riesgo residual | Pendiente |

---

# 14. Escenario de riesgo RISK-004

## Error de scoring

| Campo | Descripción |
|---|---|
| ID | RISK-004 |
| Peligro | Resultado psicométrico incorrecto |
| Software Item | SWI-04 |
| Evento | Error de cálculo |
| Situación peligrosa | Resultado presentado como puntuación válida |
| Daño potencial | Interpretación clínica incorrecta |
| Causa | Fórmula incorrecta, ítem invertido mal, manejo incorrecto de faltantes |
| Control | Casos de referencia + pruebas unitarias + pruebas de regresión |
| Implementación | Scoring Unit |
| Verificación | TEST-SCORE-* |
| Riesgo residual | Pendiente |

---

# 15. Escenario de riesgo RISK-005

## Error de normalización

| Campo | Descripción |
|---|---|
| ID | RISK-005 |
| Peligro | Caracterización incorrecta |
| Software Item | SWI-06 |
| Evento | Parámetros incorrectos |
| Situación peligrosa | Modelo recibe datos transformados incorrectamente |
| Daño potencial | Predicción incorrecta |
| Causa | Configuración incompatible |
| Control | Versionado + compatibility check |
| Implementación | Normalization Unit |
| Verificación | TEST-NORM-* |
| Riesgo residual | Pendiente |

---

# 16. Escenario de riesgo RISK-006

## Modelo incompatible

| Campo | Descripción |
|---|---|
| ID | RISK-006 |
| Peligro | Resultado ML incorrecto |
| Software Item | SWI-08 / SWI-09 |
| Evento | Se ejecuta modelo con entradas incompatibles |
| Situación peligrosa | Predicción inválida presentada |
| Daño potencial | Decisión clínica incorrecta |
| Causa | Cambio de variables, versión o normalización |
| Control | Model Registry + schema validation |
| Implementación | Model Registry |
| Verificación | TEST-ML-COMPAT |
| Riesgo residual | Pendiente |

---

# 17. Escenario de riesgo RISK-007

## Modelo corrupto o alterado

| Campo | Descripción |
|---|---|
| ID | RISK-007 |
| Peligro | Resultado computacional incorrecto |
| Software Item | SWI-09 |
| Evento | Artefacto alterado |
| Situación peligrosa | Modelo ejecutado sin integridad garantizada |
| Daño potencial | Resultado incorrecto |
| Causa | Corrupción o sustitución |
| Control | Hash / integridad / versionado |
| Implementación | Model Registry |
| Verificación | TEST-MODEL-INTEGRITY |
| Riesgo residual | Pendiente |

---

# 18. Escenario de riesgo RISK-008

## Error de persistencia

| Campo | Descripción |
|---|---|
| ID | RISK-008 |
| Peligro | Pérdida o asociación incorrecta de información |
| Software Item | SWI-16 |
| Evento | Escritura parcial o incorrecta |
| Situación peligrosa | El profesional consulta información incorrecta o incompleta |
| Daño potencial | Decisión basada en información incorrecta |
| Causa | Error de base de datos o transacción |
| Control | Transacciones + validación + recuperación |
| Implementación | Repository / Database |
| Verificación | TEST-DB-* |
| Riesgo residual | Pendiente |

---

# 19. Escenario de riesgo RISK-009

## Acceso no autorizado

| Campo | Descripción |
|---|---|
| ID | RISK-009 |
| Peligro | Exposición o modificación de información clínica |
| Software Item | SWI-14 |
| Evento | Usuario accede a recurso sin autorización |
| Situación peligrosa | Información clínica expuesta o modificada |
| Daño potencial | Daño a privacidad e integridad de información |
| Causa | Error de autenticación/autorización |
| Control | Authentication + Authorization + Audit |
| Implementación | Security Service |
| Verificación | TEST-SEC-* |
| Riesgo residual | Pendiente |

---

# 20. Escenario de riesgo RISK-010

## Resultado obsoleto presentado como actual

| Campo | Descripción |
|---|---|
| ID | RISK-010 |
| Peligro | Información clínica desactualizada |
| Software Item | SWI-02 / SWI-15 / SWI-18 |
| Evento | Se presenta resultado previo como resultado actual |
| Situación peligrosa | El profesional interpreta información antigua como reciente |
| Daño potencial | Decisión clínica incorrecta |
| Causa | Estado o timestamp incorrecto |
| Control | Versionado + timestamps + estado |
| Implementación | Application / Audit / Configuration |
| Verificación | TEST-TEMP-* |
| Riesgo residual | Pendiente |

---

# 21. Escenario de riesgo RISK-011

## Error longitudinal

| Campo | Descripción |
|---|---|
| ID | RISK-011 |
| Peligro | Tendencia clínica incorrecta |
| Software Item | SWI-12 |
| Evento | Se comparan resultados incompatibles |
| Situación peligrosa | Evolución interpretada incorrectamente |
| Daño potencial | Decisión clínica inadecuada |
| Causa | Diferencia de versiones o definiciones |
| Control | Version compatibility check |
| Implementación | Longitudinal Engine |
| Verificación | TEST-LONG-* |
| Riesgo residual | Pendiente |

---

# 22. Escenario de riesgo RISK-012

## Resultado NLP incorrecto

| Campo | Descripción |
|---|---|
| ID | RISK-012 |
| Peligro | Información derivada incorrecta |
| Software Item | SWI-13 |
| Evento | NLP genera interpretación incorrecta |
| Situación peligrosa | Resultado se interpreta como evidencia clínica válida |
| Daño potencial | Interpretación clínica incorrecta |
| Causa | Modelo NLP o procesamiento defectuoso |
| Control | Estado explícito + trazabilidad + presentación como apoyo |
| Implementación | NLP Engine |
| Verificación | TEST-NLP-* |
| Riesgo residual | Pendiente |

---

# 23. Escenario de riesgo RISK-013

## Umbral configurado incorrectamente

| Campo | Descripción |
|---|---|
| ID | RISK-013 |
| Peligro | Clasificación incorrecta |
| Software Item | SWI-18 / SWI-10 |
| Evento | Umbral incorrecto |
| Situación peligrosa | Riesgo o alerta incorrectos |
| Daño potencial | Decisión inadecuada |
| Causa | Cambio de configuración no controlado |
| Control | Versionado + change control + boundary tests |
| Implementación | Configuration / Risk Engine |
| Verificación | TEST-THRESHOLD-* |
| Riesgo residual | Pendiente |

---

# 24. Escenario de riesgo RISK-014

## Fallo de alerta

| Campo | Descripción |
|---|---|
| ID | RISK-014 |
| Peligro | Omisión de información relevante |
| Software Item | SWI-11 |
| Evento | Error en generación o persistencia |
| Situación peligrosa | Alerta esperada no está disponible |
| Daño potencial | Retraso en revisión profesional |
| Causa | Error lógico, persistencia o UI |
| Control | End-to-end testing + persistence verification |
| Implementación | Alert Engine / Audit / Persistence |
| Verificación | TEST-ALERT-E2E |
| Riesgo residual | Pendiente |

---

# 25. Escenario de riesgo RISK-015

## Falla de interfaz que induce interpretación incorrecta

| Campo | Descripción |
|---|---|
| ID | RISK-015 |
| Peligro | Información clínicamente ambigua |
| Software Item | SWI-01 |
| Evento | Presentación incorrecta |
| Situación peligrosa | Resultado computacional interpretado como diagnóstico |
| Daño potencial | Decisión inadecuada |
| Causa | Etiqueta, color, estado o diseño ambiguo |
| Control | Requisitos UI + revisión + pruebas |
| Implementación | Presentation Layer |
| Verificación | TEST-UI-* |
| Riesgo residual | Pendiente |

---

# 26. Escenario de riesgo RISK-016

## SOUP produce comportamiento inesperado

| Campo | Descripción |
|---|---|
| ID | RISK-016 |
| Peligro | Funcionamiento incorrecto |
| Software Item | Variable |
| Evento | Dependencia externa produce comportamiento inesperado |
| Situación peligrosa | Resultado o proceso incorrecto |
| Daño potencial | Depende del componente |
| Causa | Defecto SOUP |
| Control | Inventario SOUP + revisión de anomalías conocidas + pruebas |
| Implementación | Dependencia correspondiente |
| Verificación | Tests afectados |
| Riesgo residual | Pendiente |

Cuando un fallo de SOUP pueda contribuir a una situación peligrosa, IEC 62304 exige evaluar las listas de anomalías publicadas por el proveedor relevantes a la versión utilizada.

---

# 27. Registro maestro de riesgos

Los riesgos deberán mantenerse también en formato tabular.

Archivo:

```text
risk_register.csv
```

Columnas:

```text
risk_id
hazard
software_item
event
hazardous_situation
harm
cause
initial_probability
initial_severity
initial_risk
risk_control
implementation
verification_test
residual_probability
residual_severity
residual_risk
status
owner
review_date
```

---

# 28. Matriz de riesgo

La matriz definitiva de severidad y probabilidad deberá establecerse en el marco de gestión de riesgos del producto.

Estructura:

```text
             PROBABILIDAD
             Low  Med  High
SEVERIDAD
Low
Medium
High
Serious
```

Los criterios cuantitativos deberán establecerse antes de utilizar la matriz para decisiones formales.

---

# 29. Riesgo inicial

El riesgo inicial deberá evaluarse antes de considerar los controles específicos.

Conceptualmente:

```text
Hazard
+
Event
+
Situation
+
Harm
```

determinan el escenario de riesgo.

---

# 30. Medidas de control

Las medidas podrán ser:

```text
Software Control
Hardware Control
Workflow Control
Professional Review
User Instruction
Environmental Control
```

IEC 62304 reconoce explícitamente estos tipos de controles y no exige que todos sean implementados dentro del software.

---

# 31. Controles de riesgo implementados en software

Ejemplos SISAP:

```text
Input Validation
Model Compatibility
Output Validation
Threshold Validation
Access Control
Explicit Error States
Version Tracking
Audit
```

---

# 32. Control de riesgo mediante revisión profesional

Un posible control externo es:

```text
SISAP Result
      ↓
Professional Review
      ↓
Clinical Decision
```

No deberá considerarse suficiente simplemente con escribir en la documentación que “el médico revisa”. Deberá analizarse cómo el flujo de trabajo real implementa ese control y cómo se evita que la salida sea tratada como decisión autónoma.

---

# 33. Verificación de controles de riesgo

Cada control de riesgo implementado por software deberá tener evidencia.

Ejemplo:

```text
RISK-002
   ↓
Control:
Alert threshold validation
   ↓
REQ-RISK-002
   ↓
SU-11 / SU-12
   ↓
TEST-RISK-002
```

IEC 62304 exige verificar las medidas de control de riesgo y revisar si una medida puede introducir una nueva situación peligrosa.

---

# 34. Riesgo residual

Después de implementar los controles:

```text
Initial Risk
      ↓
Risk Controls
      ↓
Residual Risk
```

El riesgo residual deberá documentarse.

---

# 35. Nuevos riesgos introducidos por controles

Los controles deberán evaluarse para detectar si crean nuevos escenarios.

Ejemplo:

```text
Automatic Alert Suppression
        ↓
Could hide valid alerts
        ↓
New Hazardous Situation?
```

La revisión de los controles para detectar nuevas situaciones peligrosas forma parte del proceso de verificación de controles de riesgo en IEC 62304.

---

# 36. Seguridad de modelos ML

Los modelos introducen riesgos específicos:

```text
Training Data Problem
Model Drift
Input Distribution Shift
Model Incompatibility
Serialization Error
Normalization Mismatch
Unexpected Output
High Uncertainty
```

Estos escenarios deberán evaluarse individualmente cuando sean relevantes.

---

# 37. Riesgo de incertidumbre

Cuando un modelo produzca una estimación con incertidumbre elevada, deberá evaluarse si:

- el resultado puede interpretarse incorrectamente;
- debe marcarse como no confiable;
- debe impedirse una acción automática;
- o debe requerirse revisión adicional.

---

# 38. Riesgo de fuera de dominio

Cuando se haya definido un dominio de aplicabilidad:

```text
Input
 ↓
Domain Check
 ↓
Inside Domain → Continue
Outside Domain → Controlled State
```

La salida fuera de dominio deberá tratarse según la especificación del modelo.

---

# 39. Riesgo de degradación del modelo

Cuando corresponda deberá monitorizarse:

- desempeño;
- distribución de entradas;
- errores;
- estabilidad;
- y cambios respecto de la población de referencia.

La estrategia concreta de monitorización se establecerá en el plan de mantenimiento y gestión de modelos.

---

# 40. Riesgo de cambio de configuración

Los elementos siguientes son potenciales fuentes de riesgo:

```text
Thresholds
Clinical Rules
Normalization
Dimension Mapping
Model Selection
Feature Selection
```

Todos deberán estar bajo control de configuración.

---

# 41. Riesgo de cambios de dependencias

Cuando una actualización SOUP pueda afectar una función relevante:

```text
Dependency Change
      ↓
Impact Analysis
      ↓
Risk Review
      ↓
Verification
      ↓
Release
```

---

# 42. Riesgo de autenticación

Debe evaluarse:

```text
Credential Failure
Session Failure
Privilege Escalation
Unauthorized Resource Access
```

---

# 43. Riesgo de autorización

Debe comprobarse:

```text
Role
+
Resource
+
Action
```

y no únicamente la existencia de un usuario autenticado.

---

# 44. Riesgo de integridad de auditoría

Si la auditoría se utiliza como evidencia de trazabilidad, deberá evaluarse el riesgo de:

- pérdida;
- modificación;
- duplicación;
- timestamp incorrecto;
- usuario incorrecto.

---

# 45. Riesgo de integridad de datos

Deberán considerarse:

```text
Incomplete write
Partial transaction
Wrong patient association
Wrong assessment association
Corruption
Duplicate
```

---

# 46. Riesgo por interacción humana

Deberán considerarse usos previsibles como:

- selección equivocada de paciente;
- selección equivocada de evaluación;
- interpretación incorrecta de niveles;
- ignorar una advertencia;
- utilizar un resultado no disponible;
- y exportar información incorrecta.

---

# 47. Riesgo por uso fuera de contexto

SISAP deberá evaluar el riesgo de:

- utilizar resultados fuera del contexto validado;
- usar modelos fuera de su población de referencia;
- utilizar el sistema con instrumentos no soportados;
- interpretar resultados fuera de las condiciones especificadas.

---

# 48. Riesgo relacionado con interfaz

Debe evaluarse que la interfaz no:

- oculte errores;
- presente valores por defecto engañosos;
- mezcle resultados históricos y actuales;
- oculte incertidumbre;
- o presente recomendaciones como decisiones obligatorias.

---

# 49. Riesgo relacionado con reportes

Debe evaluarse:

```text
Wrong Patient
Wrong Assessment
Wrong Date
Wrong Model Version
Wrong Risk
Missing Alert
```

---

# 50. Riesgos de mantenimiento

Durante mantenimiento deberán reevaluarse:

```text
Requirements
Architecture
Model
Configuration
Dependencies
Risk Controls
```

---

# 51. Trazabilidad riesgo → requisito

Archivo:

```text
risk_control_traceability.csv
```

Estructura:

| Risk | Control | Requirement | Software Item | Test |
|---|---|---|---|---|
| RISK-001 | Model validation | REQ-ML-002 | SWI-08 | TEST-ML-001 |
| RISK-002 | Alert validation | REQ-RISK-001 | SWI-10/11 | TEST-RISK-002 |
| RISK-005 | Compatibility check | REQ-NORM-003 | SWI-06 | TEST-NORM-006 |
| RISK-009 | Authorization | REQ-SEC-004 | SWI-14 | TEST-SEC-001 |

---

# 52. Trazabilidad riesgo → diseño

Ejemplo:

```text
RISK-006
    ↓
Control: Model Compatibility
    ↓
SAD: SWI-09 Model Registry
    ↓
SDD: SU-10 Model Registry Unit
    ↓
Implementation:
registry.py
    ↓
Test:
TEST-MODEL-COMPAT
```

---

# 53. Trazabilidad riesgo → release

Cada riesgo relevante deberá poder relacionarse con la release donde se verificó.

```text
RISK-006
    ↓
TEST-MODEL-COMPAT
    ↓
ST-BL-02
    ↓
RELEASE-0.2.0
```

---

# 54. Revisión periódica de riesgos

Los riesgos deberán revisarse cuando exista:

- nueva funcionalidad;
- cambio arquitectónico;
- nuevo modelo;
- nuevo umbral;
- nueva dependencia;
- cambio de uso previsto;
- incidente;
- anomalía;
- o actualización relevante.

---

# 55. Eventos que obligan a revaluación

La revisión deberá activarse especialmente cuando:

```text
New Hazard
New Software Item
Model Change
Clinical Rule Change
Security Vulnerability
Major Dependency Change
Serious Incident
Near Incident
```

---

# 56. Gestión de incidentes y near misses

Cuando un incidente o casi incidente sugiera una contribución del software:

```text
Incident
 ↓
Problem Report
 ↓
Risk Analysis
 ↓
Potential New Hazard
 ↓
Risk Control
 ↓
Verification
```

---

# 57. Registros de revisión de riesgos

Las revisiones deberán conservar:

```text
Risk Review ID
Date
Release
Reviewer
Changes Reviewed
Risks Added
Risks Modified
Risks Closed
Residual Risk
Decision
```

---

# 58. Risk Review Record

Ejemplo:

```text
RISK-REVIEW-001

Release:
0.2.0

Changes:
Risk Engine thresholds

Risks affected:
RISK-002
RISK-003
RISK-013

New hazards:
None identified

Residual risk:
Acceptable / Pending

Reviewer:
________________

Date:
________________
```

---

# 59. Criterios de aceptación del riesgo

Los criterios exactos de aceptabilidad deberán definirse en el proceso general de gestión de riesgos del producto.

El software no deberá definir arbitrariamente por sí solo qué nivel de riesgo es aceptable.

---

# 60. Riesgo residual no aceptable

Cuando un riesgo residual no sea aceptable:

```text
Residual Risk
      ↓
Not Acceptable
      ↓
Additional Control
      ↓
Implementation
      ↓
Verification
      ↓
Reassessment
```

---

# 61. Escalada de riesgo

Si un control de software no logra reducir suficientemente el riesgo, podrán considerarse controles externos:

```text
Software
+
Workflow
+
Professional Review
+
Independent Procedure
```

La arquitectura podrá modificarse cuando sea necesario para reducir el riesgo.

IEC 62304 contempla expresamente que pueden añadirse medidas de control externas al software para reducir el riesgo y, cuando proceda, reconsiderar la clasificación del sistema.

---

# 62. Clasificación de seguridad por Software Item

La tabla inicial será:

| Software Item | Clasificación provisional | Justificación |
|---|---|---|
| SWI-04 Scoring | A/B | Pendiente de análisis |
| SWI-06 Normalization | A/B | Pendiente |
| SWI-08 ML | A/B | Pendiente |
| SWI-10 Risk | B* | Pendiente |
| SWI-11 Alert | B* | Pendiente |
| SWI-14 Security | A/B | Pendiente |
| SWI-16 Persistence | A/B | Pendiente |

`*` No constituye clasificación definitiva.

Si varios *software items* se agrupan para aplicar IEC 62304, los procesos y tareas deberán corresponder a la clasificación más alta, salvo que exista una justificación documentada para utilizar una clasificación menor.

---

# 63. Criterios para controles de software

Un control implementado en software deberá ser:

- identificable;
- verificable;
- mantenible;
- trazable;
- y compatible con la arquitectura.

---

# 64. Ejemplos de controles SISAP

| Riesgo | Control |
|---|---|
| Error de scoring | Golden test cases |
| Modelo incompatible | Schema validation |
| Modelo corrupto | Hash verification |
| Falso riesgo | Output validation |
| Falsa alerta | Boundary tests |
| Acceso no autorizado | Authorization middleware |
| Resultado obsoleto | Version/timestamp tracking |
| Error de persistencia | Transaction control |
| UI ambigua | UI requirements + review |
| SOUP defect | Dependency inventory + monitoring |

---

# 65. Verificación de controles

Cada control deberá tener uno o más métodos de verificación:

```text
Inspection
Analysis
Test
Review
Demonstration
```

El método elegido deberá ser adecuado al riesgo.

---

# 66. Registro de control

Ejemplo:

```text
CONTROL-001

Risk:
RISK-006

Control:
Model compatibility validation

Requirement:
REQ-ML-002

Software Item:
SWI-08 / SWI-09

Implementation:
SU-09 / SU-10

Test:
TEST-ML-COMPAT

Status:
Pending
```

---

# 67. Requisitos derivados de riesgo

Los riesgos podrán generar nuevos requisitos.

Ejemplo:

```text
RISK-006
   ↓
REQ-ML-002
   ↓
Model compatibility validation
```

Estos requisitos deberán incorporarse a la SRS mediante control de cambios.

---

# 68. Verificación de nuevos controles

Cuando un control de riesgo genere un requisito nuevo:

```text
Risk
 ↓
Requirement
 ↓
Design
 ↓
Implementation
 ↓
Verification
```

deberá actualizarse la matriz de trazabilidad.

---

# 69. Defectos comunes

El análisis de riesgos deberá considerar defectos comunes asociados con las tecnologías utilizadas:

```text
Type Errors
Null Handling
Boundary Errors
Numeric Errors
Memory Errors
Database Errors
Concurrency
Authentication
Authorization
Configuration
Model Serialization
Model Compatibility
UI State
```

Estos deberán vincularse a riesgos cuando puedan contribuir a una situación peligrosa.

---

# 70. SOUP

Para SOUP relevante deberá considerarse:

```text
Component
Version
Known Anomalies
Safety Relevance
Affected Functions
Risk
Control
Verification
```

La evaluación de anomalías conocidas del proveedor será especialmente relevante cuando el SOUP pueda contribuir a una situación peligrosa.

---

# 71. Cambios de riesgo por mantenimiento

Un cambio posterior deberá activar:

```text
Change
 ↓
Impact Analysis
 ↓
Risk Review
 ↓
Tests
 ↓
Residual Risk
 ↓
Release
```

---

# 72. Cambio de modelo ML

Un cambio de modelo deberá revisar:

- entradas;
- transformaciones;
- normalización;
- arquitectura;
- desempeño;
- incertidumbre;
- riesgos;
- controles;
- pruebas.

---

# 73. Cambio de umbral

Un cambio de umbral deberá revisar:

```text
Risk
Alert
Dashboard
Report
Longitudinal
```

---

# 74. Cambio de dependencia

Una actualización deberá revisar:

```text
Known Issues
Security
Compatibility
Behavior
Tests
```

---

# 75. Cierre de riesgos

Un riesgo podrá marcarse `CLOSED` cuando:

- haya dejado de ser aplicable;
- la función haya sido eliminada;
- o exista justificación documentada para su cierre.

El cierre deberá conservar el historial.

---

# 76. Estados de riesgo

```text
IDENTIFIED
ANALYZING
CONTROL_DEFINED
IMPLEMENTED
VERIFIED
ACCEPTED
MONITORED
MODIFIED
CLOSED
```

---

# 77. Registro maestro

El registro maestro deberá mantener un registro único por riesgo.

Ejemplo:

```text
RISK-001
Status: VERIFIED

RISK-002
Status: CONTROL_DEFINED

RISK-003
Status: ANALYZING
```

---

# 78. Criterios de aceptación del Risk Management File

El archivo podrá pasar a baseline cuando:

- los principales peligros estén identificados;
- las situaciones peligrosas estén descritas;
- los *software items* potencialmente contribuyentes estén identificados;
- las causas potenciales estén documentadas;
- los controles estén definidos;
- exista trazabilidad;
- los controles verificables tengan pruebas;
- y los riesgos residuales estén evaluados.

---

# 79. Estado actual

| Elemento | Estado |
|---|---|
| Metodología | Definida |
| Software Items | Identificados |
| Riesgos iniciales | Identificados |
| Risk Register | Definido |
| Risk Controls | Definidos preliminarmente |
| Trazabilidad | En construcción |
| Clasificación A/B/C | Pendiente |
| Riesgos residuales | Pendiente |
| Verificación de controles | Pendiente |
| SOUP Risk Review | Pendiente |
| Baseline | Pendiente |

---

# 80. Aprobación

| Rol | Responsable | Estado |
|---|---|---|
| Responsable del producto | Psic. Lauro Gutiérrez Castro | Pendiente |
| Responsable clínico | Psic. Lauro Gutiérrez Castro | Pendiente |
| Responsable de software | Pendiente | Pendiente |
| Responsable de verificación | Pendiente | Pendiente |

---

# 81. Historial de versiones

| Versión | Fecha | Descripción |
|---|---|---|
| 0.1 | Agosto 2026 | Estructura inicial |
| 0.9 | Pendiente | Revisión de riesgos |
| 1.0 | Pendiente | Baseline inicial |
| 1.x | Futuro | Cambios controlados |

---

# 82. Declaración

> **SISAP by CENIVRA Software Risk Management File constituye el registro maestro de los riesgos relacionados con el software y de las medidas de control asociadas.**
>
> Los riesgos deberán mantenerse bajo revisión durante el ciclo de vida del producto. Las modificaciones del software, modelos, configuración, dependencias o uso previsto deberán evaluarse para determinar si introducen nuevos riesgos o modifican riesgos existentes.
>
> La clasificación de seguridad del software y la aceptabilidad del riesgo deberán establecerse mediante los procesos formales correspondientes y no mediante este documento de manera aislada.
>
> Este documento no constituye por sí mismo certificación, declaración de conformidad ni autorización regulatoria.