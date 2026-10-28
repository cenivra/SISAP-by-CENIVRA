# SISAP by CENIVRA

# Intended Use — Uso Previsto

**Documento:** Intended Use  
**Identificador:** SISAP-IU-001  
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
| Documento | Intended Use |
| Identificador | SISAP-IU-001 |
| Versión | 1.0 |
| Estado | Borrador controlado |
| Producto | SISAP by CENIVRA |
| Tipo | Software de apoyo a la decisión clínica |
| Plataforma | Python / Dash |
| Entorno inicial | Atención residencial para TUS |
| Población objetivo | Personas atendidas por trastornos por uso de sustancias |
| Usuario principal | Profesional clínico autorizado |
| Marco de referencia | IEC 62304:2006 + AMD1:2015 / ISO 14971:2019 |

---

# 1. Propósito

El presente documento define el **uso previsto de SISAP by CENIVRA**.

Su finalidad es establecer de manera controlada:

- el propósito del software;
- la población objetivo;
- los usuarios previstos;
- el entorno de utilización;
- las funciones previstas;
- las entradas;
- las salidas;
- las condiciones de uso;
- las limitaciones;
- los usos fuera de alcance;
- y los mecanismos de interacción entre el software y el profesional.

El uso previsto constituye una referencia fundamental para:

```text
Requisitos
   ↓
Arquitectura
   ↓
Gestión de riesgos
   ↓
Clasificación de seguridad
   ↓
Verificación
   ↓
Validación
```

La definición del uso previsto es especialmente relevante para la gestión de riesgos, ya que la aceptabilidad del riesgo debe evaluarse en función del contexto específico del producto y de su uso previsto. ISO 14971:2019 establece un proceso de gestión de riesgos aplicable durante todo el ciclo de vida de dispositivos médicos, incluido el software.

---

# 2. Identificación del producto

**Nombre:** SISAP by CENIVRA

**Nombre completo:** Plataforma inteligente de apoyo a la decisión clínica para trastornos por uso de sustancias.

**Tipo de sistema:** Plataforma de software para evaluación, estratificación dimensional, análisis longitudinal y apoyo a la decisión clínica.

**Arquitectura:** Aplicación modular desarrollada nativamente en Python.

**Interfaz:** Dash.

**Persistencia inicial:** SQLite mediante SQLAlchemy.

---

# 3. Declaración de uso previsto

SISAP by CENIVRA está destinado a proporcionar **información estructurada de apoyo a profesionales clínicos** durante la evaluación, caracterización dimensional y seguimiento longitudinal de personas atendidas por trastornos por uso de sustancias (TUS).

El sistema procesa información clínica estructurada y, cuando corresponda, información narrativa, para generar resultados derivados mediante procedimientos psicométricos, estadísticos y de aprendizaje automático.

Estos resultados pueden incluir:

- puntuaciones psicométricas;
- indicadores derivados;
- representaciones dimensionales;
- perfiles;
- agrupaciones;
- estimaciones de riesgo;
- alertas;
- métricas longitudinales;
- resultados de análisis de lenguaje natural;
- y otras variables derivadas definidas por la configuración del sistema.

Los resultados están destinados a **apoyar la evaluación y formulación clínica realizada por un profesional autorizado**.

---

# 4. Finalidad clínica

La finalidad funcional de SISAP es apoyar procesos relacionados con:

```text
Evaluación
   ↓
Caracterización
   ↓
Estratificación
   ↓
Seguimiento
   ↓
Formulación clínica
   ↓
Apoyo a intervención
```

La plataforma no pretende sustituir la entrevista clínica, la observación profesional, la evaluación integral del paciente ni los procedimientos institucionales correspondientes.

---

# 5. Población objetivo

La población objetivo del sistema está constituida por:

> **Personas atendidas por trastornos por uso de sustancias en contextos clínicos o terapéuticos en los que se encuentre autorizado el uso del sistema.**

La población específica para cada modelo, escala o función podrá ser más restringida que la población general del producto y deberá documentarse en los artefactos correspondientes.

Por ejemplo:

```text
Población del producto
        ↓
Población elegible para evaluación
        ↓
Población de referencia del modelo
```

Un modelo no deberá interpretarse como validado para una población diferente de aquella para la cual existe evidencia suficiente.

---

# 6. Usuarios previstos

Los usuarios previstos son profesionales o personal autorizado que participen en la atención o seguimiento de personas con TUS.

Los roles iniciales contemplados son:

```text
admin
psicologo
consejero
viewer
```

Las capacidades concretas de cada rol estarán determinadas por la matriz de autorización del sistema.

---

# 7. Usuario clínico principal

El usuario clínico principal será el profesional encargado de interpretar los resultados proporcionados por SISAP.

Entre sus funciones se encuentran:

- revisar los datos introducidos;
- comprobar la suficiencia de la información;
- interpretar los resultados;
- contextualizar los resultados;
- valorar alertas;
- integrar la información con otras fuentes clínicas;
- y tomar las decisiones clínicas correspondientes.

---

# 8. Usuario administrativo

El usuario administrativo podrá realizar funciones de gestión del sistema de acuerdo con sus permisos.

Estas funciones pueden incluir:

- gestión de cuentas;
- configuración autorizada;
- mantenimiento;
- control del sistema;
- y operaciones administrativas.

Las funciones administrativas no implican autorización para modificar interpretaciones clínicas sin seguir el proceso de control correspondiente.

---

# 9. Entorno previsto de utilización

El entorno inicial previsto comprende instituciones o programas de atención terapéutica en los que se realice seguimiento de personas con TUS.

El sistema podrá ejecutarse en:

```text
Workstation
Servidor institucional
Red local
Infraestructura controlada
```

La infraestructura definitiva de producción deberá especificarse en documentación posterior.

---

# 10. Contexto de uso

SISAP está previsto para utilizarse como parte de un flujo clínico en el que:

```text
Profesional
     ↓
Recopila información
     ↓
Introduce / revisa datos
     ↓
Ejecuta SISAP
     ↓
Revisa resultados
     ↓
Integra información clínica
     ↓
Toma decisión profesional
```

El sistema no deberá utilizarse de forma aislada del contexto clínico para el cual ha sido definido.

---

# 11. Funciones previstas

SISAP podrá proporcionar, según la versión y configuración:

### 11.1 Gestión de pacientes

- creación;
- identificación;
- consulta;
- seguimiento.

### 11.2 Gestión de evaluaciones

- creación;
- captura;
- validación;
- procesamiento;
- consulta histórica.

### 11.3 Evaluación psicométrica

- cálculo de puntuaciones;
- transformación;
- validación;
- indicadores derivados.

### 11.4 Análisis dimensional

- representación multidimensional;
- perfiles;
- indicadores latentes;
- agrupaciones.

### 11.5 Aprendizaje automático

- inferencia;
- clustering;
- reconstrucción;
- predicción;
- métricas;
- incertidumbre.

### 11.6 Riesgo

- cálculo;
- estratificación;
- indicadores;
- reglas;
- alertas.

### 11.7 Seguimiento longitudinal

- comparación;
- trayectorias;
- cambios;
- tendencias.

### 11.8 Análisis narrativo

Cuando la función esté habilitada:

- procesamiento NLP;
- extracción de características;
- indicadores derivados.

### 11.9 Reportes

- visualización;
- generación de informes;
- exportación autorizada.

### 11.10 Auditoría

- registro de acciones;
- trazabilidad;
- identificación de versiones.

---

# 12. Datos de entrada

Las entradas podrán incluir:

```text
Datos demográficos autorizados
Respuestas psicométricas
Variables clínicas estructuradas
Variables derivadas
Narrativas
Información longitudinal
Configuraciones
```

Cada tipo de dato deberá estar sujeto a las reglas de validación correspondientes.

---

# 13. Condiciones de entrada

Antes de procesar una evaluación, el sistema deberá determinar si:

```text
Datos presentes
+
Tipos correctos
+
Rangos válidos
+
Estructura válida
+
Configuración compatible
```

Cuando estas condiciones no se cumplan, el sistema deberá comunicar la condición de manera explícita.

---

# 14. Datos faltantes

El sistema deberá distinguir entre:

```text
Dato válido
Dato faltante
Dato inválido
Dato no aplicable
```

La ausencia de un dato no deberá convertirse automáticamente en un valor clínico válido.

---

# 15. Resultados esperados

Las salidas del sistema podrán incluir:

```text
Clinical Scores
Dimensional Profile
Cluster
ML Prediction
Reconstruction Metrics
Uncertainty
Risk Level
Risk Score
Alerts
Longitudinal Metrics
NLP Results
Reports
```

Cada resultado deberá distinguirse de una decisión clínica realizada por el profesional.

---

# 16. Naturaleza de los resultados

Los resultados generados por SISAP deberán considerarse:

> **información computacional de apoyo a la evaluación y decisión clínica.**

No deberán interpretarse automáticamente como:

- diagnóstico;
- pronóstico clínico definitivo;
- indicación terapéutica obligatoria;
- ni decisión clínica autónoma.

---

# 17. Intervención profesional

El flujo previsto establece:

```text
SISAP
  ↓
Resultado
  ↓
Revisión profesional
  ↓
Interpretación clínica
  ↓
Decisión
```

La decisión clínica permanece bajo responsabilidad del profesional autorizado.

---

# 18. Evaluación de riesgo

Cuando SISAP genere una salida relacionada con riesgo, esta deberá considerarse una estimación computacional dentro del contexto especificado.

El sistema no deberá sustituir:

- entrevista clínica;
- evaluación de riesgo profesional;
- valoración de factores agudos;
- procedimientos institucionales;
- ni protocolos de emergencia.

---

# 19. Alertas

Las alertas constituyen mecanismos de apoyo para señalar condiciones definidas por el sistema.

Una alerta:

```text
NO equivale a:
diagnóstico
```

y:

```text
NO equivale a:
decisión clínica automática
```

La alerta deberá ser revisada de acuerdo con el flujo clínico correspondiente.

---

# 20. Situaciones de emergencia

SISAP no se establece como sustituto de protocolos institucionales de emergencia.

Ante una situación clínica aguda o de emergencia, deberán utilizarse los procedimientos asistenciales correspondientes.

El software no deberá interpretarse como un sistema autónomo de respuesta a emergencias salvo que una versión futura haya sido específicamente diseñada, validada y autorizada para ello.

---

# 21. Uso de modelos de aprendizaje automático

Los modelos de aprendizaje automático se utilizarán para generar información analítica dentro del dominio definido.

Las salidas deberán asociarse, cuando corresponda, con:

```text
Model ID
Model Version
Input Configuration
Normalization
Uncertainty
Timestamp
```

---

# 22. Limitaciones de los modelos

Las limitaciones de cada modelo deberán documentarse.

Podrán incluir:

- población de entrenamiento;
- variables necesarias;
- rango de aplicabilidad;
- incertidumbre;
- desempeño;
- sesgos conocidos;
- datos faltantes;
- y condiciones de uso.

---

# 23. Condiciones de aplicabilidad

Un modelo sólo deberá utilizarse cuando se cumplan las condiciones definidas para él.

Conceptualmente:

```text
Input
 ↓
Compatibility Check
 ↓
Domain Check
 ↓
Valid
 ↓
Inference
```

Cuando no se cumplan:

```text
Inference
   ↓
BLOCKED / NOT AVAILABLE
```

según corresponda.

---

# 24. Interpretación clínica

La interpretación de SISAP deberá integrar:

```text
Resultados SISAP
+
Información clínica
+
Contexto del paciente
+
Juicio profesional
```

Un resultado individual no deberá interpretarse aislado de su contexto.

---

# 25. Uso longitudinal

SISAP podrá utilizar información de múltiples evaluaciones.

Las comparaciones deberán considerar:

- definición de variables;
- versión;
- modelo;
- configuración;
- fecha;
- y compatibilidad metodológica.

---

# 26. Identificación temporal

Los resultados relevantes deberán asociarse con la fecha y el contexto de generación.

Cuando sea necesario, también deberán conservar:

```text
Software Version
Model Version
Configuration Version
```

---

# 27. Uso previsto de la interfaz

La interfaz está destinada a:

- captura;
- consulta;
- visualización;
- interpretación;
- y gestión autorizada de información.

La interfaz no deberá incorporar directamente algoritmos clínicos que no estén especificados y controlados.

---

# 28. Uso previsto de reportes

Los reportes están destinados a facilitar la consulta y documentación de resultados.

No deberán presentarse como informes médicos independientes del profesional.

---

# 29. Uso fuera de alcance

SISAP no está destinado, dentro del presente uso previsto, a:

- realizar diagnóstico autónomo;
- sustituir evaluación clínica;
- tomar decisiones clínicas de manera autónoma;
- iniciar o suspender tratamientos automáticamente;
- sustituir protocolos institucionales;
- responder de manera autónoma a emergencias;
- ni operar fuera del dominio para el que cada función haya sido validada.

---

# 30. Uso fuera del dominio del modelo

No deberá utilizarse un modelo:

```text
fuera de su población de referencia
fuera de sus variables requeridas
fuera de su rango de entrada
fuera de su configuración validada
```

sin una justificación y evaluación apropiadas.

---

# 31. Uso razonablemente previsible

El análisis de riesgo deberá considerar usos previsibles como:

```text
Interpretar una puntuación como diagnóstico
Interpretar una alerta como decisión
Usar una evaluación incompleta
Usar un resultado antiguo como actual
Usar un modelo incompatible
Ignorar incertidumbre
Usar resultados fuera del dominio validado
```

Estos escenarios deberán considerarse durante la evaluación de riesgos.

---

# 32. Uso incorrecto razonablemente previsible

Podrán considerarse, entre otros:

- selección equivocada de paciente;
- selección equivocada de evaluación;
- introducción incorrecta de datos;
- selección incorrecta de modelo;
- modificación no autorizada de parámetros;
- interpretación incorrecta de gráficos;
- exportación de información equivocada.

Estos usos deberán evaluarse dentro de la gestión de riesgos.

---

# 33. Exclusiones

Quedan fuera del uso previsto:

```text
Autodiagnóstico
Uso directo por pacientes
Uso sin supervisión profesional
Uso como único criterio de decisión
Uso de modelos no aprobados
Uso de configuraciones no controladas
Uso fuera de población validada
```

salvo que una versión futura modifique formalmente el uso previsto.

---

# 34. Seguridad y juicio profesional

SISAP deberá diseñarse para apoyar, no reemplazar, el juicio profesional.

El sistema deberá diferenciar claramente:

```text
Resultado computacional
        ≠
Interpretación clínica
        ≠
Decisión profesional
```

---

# 35. Dependencia de datos

La validez de una salida depende de la calidad y suficiencia de las entradas.

Por tanto:

```text
Datos incorrectos
      ↓
Resultado potencialmente incorrecto
```

La plataforma deberá implementar mecanismos de validación para reducir este riesgo.

---

# 36. Dependencia de modelos

La validez de una salida ML depende, entre otros elementos, de:

```text
Modelo
Inputs
Preprocessing
Normalization
Configuration
Domain
```

La plataforma deberá controlar estos elementos.

---

# 37. Dependencia de configuración clínica

Los resultados pueden depender de:

- umbrales;
- reglas;
- definiciones;
- parámetros;
- versiones.

Las configuraciones relevantes deberán mantenerse bajo control de configuración.

---

# 38. Interacción con sistemas externos

SISAP podrá interactuar con:

```text
Sistema operativo
Base de datos
Framework web
Bibliotecas científicas
Frameworks ML
Sistemas de almacenamiento
```

Las interfaces relevantes deberán documentarse.

---

# 39. Usuarios y permisos

Las funciones disponibles dependerán del rol.

La matriz definitiva se documentará como parte del diseño de seguridad.

---

# 40. Protección de información

El sistema deberá limitar el acceso a información clínica a usuarios autorizados.

Las funciones analíticas deberán utilizar identificadores internos cuando sea posible.

---

# 41. Trazabilidad

Las operaciones relevantes deberán poder asociarse con:

```text
Usuario
Paciente
Evaluación
Fecha
Software Version
Model Version
Configuration Version
Resultado
```

según corresponda.

---

# 42. Auditoría

Las acciones relevantes deberán registrarse mediante mecanismos de auditoría.

La auditoría deberá ser independiente del concepto de Problem Report.

---

# 43. Retención histórica

Los resultados históricos deberán conservar suficiente información para comprender el contexto en que fueron generados.

Especial atención:

```text
Software Version
Model Version
Configuration Version
```

---

# 44. Requisitos de disponibilidad

Los valores específicos de disponibilidad, rendimiento y recuperación se definirán en los requisitos de software y documentos de arquitectura correspondientes.

---

# 45. Requisitos de seguridad

El sistema deberá implementar mecanismos proporcionales al uso previsto y al riesgo identificado.

Esto incluye:

- autenticación;
- autorización;
- protección de credenciales;
- control de sesiones;
- gestión de secretos;
- auditoría;
- y control de dependencias.

---

# 46. Requisitos de interoperabilidad

Cuando SISAP intercambie información con sistemas externos:

- deberá utilizar formatos definidos;
- deberá validar datos entrantes;
- deberá controlar datos salientes;
- y deberá mantener trazabilidad de las operaciones relevantes.

---

# 47. Beneficio esperado

El beneficio previsto de SISAP consiste en proporcionar una representación estructurada y sistemática de información clínica que pueda:

- facilitar la integración de múltiples indicadores;
- apoyar la identificación de patrones;
- facilitar el seguimiento longitudinal;
- apoyar la estratificación;
- mejorar la trazabilidad;
- y facilitar la revisión profesional.

---

# 48. Riesgos asociados al uso

El uso del sistema puede involucrar riesgos relacionados con:

```text
Datos incorrectos
Datos faltantes
Algoritmos incorrectos
Modelos incorrectos
Configuración incorrecta
Interpretación incorrecta
Alertas ausentes
Alertas falsas
Errores de interfaz
Errores de persistencia
Acceso no autorizado
```

Estos riesgos serán desarrollados en el **Software Risk Management File**.

---

# 49. Criterios de validez de una salida

Una salida podrá considerarse válida cuando:

```text
Inputs valid
+
Required data present
+
Compatible configuration
+
Valid model
+
Successful execution
+
Output validation passed
```

Cuando estas condiciones no se cumplan, deberá comunicarse un estado diferente de `VALID`.

---

# 50. Estado de resultado

El sistema deberá poder diferenciar entre:

```text
VALID
INVALID
NOT_AVAILABLE
ERROR
PENDING
```

cuando esta distinción sea necesaria.

---

# 51. Uso de información histórica

Las evaluaciones históricas podrán consultarse para seguimiento longitudinal.

Los resultados históricos no deberán modificarse silenciosamente por el cambio de una versión posterior del modelo.

---

# 52. Actualización de modelos

La actualización de un modelo constituye un cambio controlado.

Un modelo nuevo deberá pasar por:

```text
Validation
+
Verification
+
Risk Review
+
Configuration Control
+
Release
```

antes de utilizarse en producción.

---

# 53. Actualización de reglas clínicas

Los cambios en:

```text
Thresholds
Risk Rules
Alert Rules
Dimension Definitions
```

deberán controlarse como cambios del sistema.

---

# 54. Actualización de dependencias

Los cambios de componentes de terceros deberán evaluarse de acuerdo con su posible impacto.

---

# 55. Fin de uso

Una versión de SISAP podrá dejar de estar autorizada para uso cuando:

- sea reemplazada;
- haya quedado obsoleta;
- presente riesgos no aceptables;
- sea incompatible;
- o exista una decisión institucional.

---

# 56. Retiro

El retiro deberá preservar la trazabilidad histórica necesaria.

Los resultados históricos deberán poder asociarse con la versión con la que fueron generados.

---

# 57. Criterios para modificar el uso previsto

El uso previsto deberá revisarse cuando exista:

- nueva función clínica;
- nuevo tipo de usuario;
- nueva población;
- nuevo entorno;
- nuevo modelo;
- nueva salida;
- nuevo mercado;
- o cambio significativo en la finalidad.

Una modificación del uso previsto deberá activar análisis de impacto y revisión de riesgos.

---

# 58. Relación con requisitos

El uso previsto deberá dar origen a requisitos de software verificables.

Ejemplo:

```text
Intended Use:
Apoyo a evaluación

       ↓

REQ-CLIN-001

El sistema deberá calcular las puntuaciones
psicométricas definidas.
```

---

# 59. Relación con arquitectura

El uso previsto deberá reflejarse en la arquitectura.

Ejemplo:

```text
Clinical Support
       ↓
Application Layer
       ↓
Clinical Engine
       ↓
ML Engine
       ↓
Risk / Alert
```

---

# 60. Relación con gestión de riesgos

Cada función del uso previsto que pueda contribuir a una situación peligrosa deberá analizarse:

```text
Intended Use
      ↓
Function
      ↓
Failure
      ↓
Hazard
      ↓
Risk
```

---

# 61. Relación con validación

La validación deberá demostrar que el sistema cumple su uso previsto en el entorno correspondiente.

Conceptualmente:

```text
Intended Use
      ↓
User Need
      ↓
System
      ↓
Validation
```

---

# 62. Declaración sobre autonomía

SISAP by CENIVRA no está diseñado, dentro del presente uso previsto, para tomar decisiones clínicas autónomas.

La arquitectura y la interfaz deberán preservar esta distinción.

---

# 63. Declaración sobre diagnóstico

SISAP no deberá presentar sus resultados como diagnósticos por sí mismos.

Una salida computacional podrá ser un elemento de información dentro de la evaluación profesional.

---

# 64. Declaración sobre intervención

Las recomendaciones o hipótesis generadas por el sistema, cuando existan, deberán presentarse como información de apoyo y no como órdenes terapéuticas automáticas.

---

# 65. Declaración sobre alertas

Las alertas deberán considerarse señales para revisión.

El profesional deberá determinar su significado dentro del contexto clínico.

---

# 66. Declaración sobre incertidumbre

Cuando una salida posea incertidumbre o limitaciones relevantes, estas deberán comunicarse de forma apropiada.

---

# 67. Declaración sobre responsabilidad

La utilización de SISAP no transfiere al software la responsabilidad de la decisión clínica.

La decisión permanecerá bajo responsabilidad del profesional autorizado y de la organización dentro de sus procedimientos aplicables.

---

# 68. Dependencias organizacionales

La seguridad del uso de SISAP dependerá también de:

- formación de usuarios;
- procedimientos institucionales;
- supervisión profesional;
- control de acceso;
- mantenimiento;
- y gestión de cambios.

---

# 69. Consideración de factores humanos

El diseño deberá considerar errores previsibles del usuario.

Ejemplos:

```text
Wrong patient
Wrong assessment
Wrong interpretation
Wrong model
Missed warning
```

Estos escenarios deberán considerarse en la gestión de riesgos y pruebas.

---

# 70. Criterios de aceptación del Intended Use

Este documento podrá pasar a baseline cuando estén definidos:

- propósito;
- población;
- usuarios;
- entorno;
- funciones;
- entradas;
- salidas;
- limitaciones;
- uso fuera de alcance;
- uso razonablemente previsible;
- interacción profesional;
- y relación con riesgos y requisitos.

---

# 71. Estado actual

| Elemento | Estado |
|---|---|
| Nombre del producto | Definido |
| Propósito | Definido |
| Uso previsto | Definido preliminarmente |
| Población objetivo | Definida preliminarmente |
| Usuarios | Definidos |
| Entorno | Definido preliminarmente |
| Funciones | Definidas |
| Entradas | Definidas |
| Salidas | Definidas |
| Limitaciones | Definidas |
| Uso fuera de alcance | Definido |
| Uso razonablemente previsible | Definido |
| Autonomía | Definida |
| Riesgos derivados | Pendiente de análisis |
| Validación | Pendiente |
| Baseline | Pendiente |

---

# 72. Aprobación

| Rol | Responsable | Estado |
|---|---|---|
| Responsable del producto | Psic. Lauro Gutiérrez Castro | Pendiente |
| Responsable clínico | Psic. Lauro Gutiérrez Castro | Pendiente |
| Responsable de software | Pendiente | Pendiente |
| Responsable de riesgos | Pendiente | Pendiente |
| Responsable de verificación | Pendiente | Pendiente |

---

# 73. Historial de versiones

| Versión | Fecha | Descripción |
|---|---|---|
| 0.1 | Agosto 2026 | Estructura inicial |
| 0.9 | Pendiente | Revisión clínica y técnica |
| 1.0 | Pendiente | Baseline inicial |
| 1.x | Futuro | Cambios controlados |

---

# 74. Declaración

> **SISAP by CENIVRA Intended Use define el propósito, población, usuarios, entorno, funciones, entradas, salidas, limitaciones y condiciones de utilización previstas del sistema.**
>
> Este documento constituye una referencia fundamental para la especificación de requisitos, la arquitectura, la gestión de riesgos, la clasificación de seguridad y la validación del software.
>
> Cualquier modificación significativa del uso previsto deberá someterse a control de cambios y evaluación de impacto.
>
> Este documento no constituye por sí mismo una certificación, declaración de conformidad ni autorización regulatoria.