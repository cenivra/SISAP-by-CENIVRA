# SISAP by CENIVRA

> [!NOTE]
> **Control Documental (Fuente Única de Verdad `v1.1.0`):** Este archivo se conserva como registro histórico de la fase conceptual inicial (`v1.0`, agosto 2026, Python / Dash). La Especificación de Requisitos de Software (SRS) **vigente para `v1.1.0`** reside en [`docs/lifecycle/03_requirements/SOFTWARE_REQUIREMENTS_SPECIFICATION_v1.1.md`](../lifecycle/03_requirements/SOFTWARE_REQUIREMENTS_SPECIFICATION_v1.1.md).

# Software Requirements Specification — SRS

**Documento:** Software Requirements Specification  
**Identificador:** SISAP-SRS-001  
**Versión:** 1.0  
**Estado:** Borrador controlado  
**Fecha:** Agosto 2026  
**Producto:** SISAP by CENIVRA  
**Responsable:** Psic. Lauro Gutiérrez Castro

---

# Control del documento

| Campo | Valor |
|---|---|
| Documento | Software Requirements Specification |
| ID | SISAP-SRS-001 |
| Versión | 1.0 |
| Estado | Borrador controlado |
| Producto | SISAP by CENIVRA |
| Plataforma | Python / Dash |
| Base de datos | SQLite inicialmente |
| Propósito | Especificación de requisitos de software |
| Marco de referencia | IEC 62304:2006 + AMD1:2015 |

---

# 1. Propósito

Este documento define los **requisitos de software** de SISAP by CENIVRA.

La SRS constituye la referencia formal para:

- diseño;
- arquitectura;
- implementación;
- verificación;
- pruebas;
- gestión de riesgos;
- control de cambios;
- trazabilidad;
- y liberación del software.

Cada requisito deberá poseer una identificación única y, cuando corresponda, deberá poder relacionarse con:

```text
REQUISITO
    ↓
RIESGO
    ↓
ARQUITECTURA
    ↓
IMPLEMENTACIÓN
    ↓
PRUEBA
    ↓
RELEASE
```

La SRS describe **qué debe hacer el software**. La arquitectura y el diseño describirán posteriormente **cómo se implementará**.

---

# 2. Alcance

Esta especificación aplica al software SISAP by CENIVRA y comprende:

- gestión de usuarios;
- autenticación;
- autorización;
- gestión de pacientes;
- gestión de evaluaciones;
- captura de respuestas;
- scoring psicométrico;
- validación de datos;
- normalización;
- representación dimensional;
- modelos de aprendizaje automático;
- clustering;
- estratificación;
- análisis longitudinal;
- generación de alertas;
- visualización clínica;
- reportes;
- auditoría;
- persistencia;
- gestión de modelos;
- gestión de configuración;
- y mecanismos relacionados con seguridad y trazabilidad.

---

# 3. Uso previsto del software

SISAP by CENIVRA está destinado a proporcionar información estructurada para apoyar a profesionales durante la evaluación, estratificación dimensional y seguimiento longitudinal de personas atendidas por trastornos por uso de sustancias.

El sistema podrá procesar información clínica estructurada y producir:

- puntuaciones psicométricas;
- indicadores derivados;
- representaciones dimensionales;
- perfiles;
- agrupaciones;
- estimaciones o niveles de riesgo definidos por el sistema;
- alertas;
- métricas longitudinales;
- y resultados derivados mediante modelos estadísticos o de aprendizaje automático.

Los resultados del sistema deberán presentarse como **información de apoyo a la decisión clínica**.

El software no deberá presentar sus resultados como sustituto del diagnóstico, evaluación clínica o juicio profesional.

---

# 4. Usuarios previstos

El sistema contempla inicialmente cuatro roles:

```text
admin
psicologo
consejero
viewer
```

## 4.1 Administrador

Responsable de funciones administrativas autorizadas, incluyendo:

- gestión de usuarios;
- configuración;
- mantenimiento;
- control de acceso;
- y operaciones administrativas.

## 4.2 Psicólogo

Podrá utilizar las funciones clínicas autorizadas, incluyendo:

- creación y consulta de pacientes;
- evaluación;
- interpretación;
- seguimiento;
- visualización de resultados;
- y generación de reportes.

## 4.3 Consejero

Podrá acceder a las funciones que determine la política institucional, con permisos restringidos respecto de funciones administrativas y datos sensibles.

## 4.4 Viewer

Podrá consultar información autorizada sin modificar información clínica.

La matriz definitiva de permisos será especificada en los requisitos de seguridad y control de acceso.

---

# 5. Entorno operativo

SISAP será desarrollado inicialmente para ejecutarse sobre:

```text
Sistema operativo
Windows / Linux / macOS

Runtime
Python

Interfaz
Dash

Servidor
Flask / WSGI

Base de datos
SQLite

ORM
SQLAlchemy
```

La configuración definitiva del entorno de producción será especificada antes de la primera liberación formal.

---

# 6. Convenciones de requisitos

Los requisitos utilizarán identificadores únicos.

Formato:

```text
REQ-[DOMINIO]-[NÚMERO]
```

Ejemplos:

```text
REQ-SYS-001
REQ-CLIN-001
REQ-DATA-001
REQ-ML-001
REQ-RISK-001
REQ-SEC-001
REQ-UI-001
REQ-AUD-001
REQ-REP-001
REQ-DB-001
REQ-CFG-001
REQ-TEST-001
REQ-MAINT-001
```

Los requisitos deberán formularse utilizando:

> **El sistema deberá...**

Cada requisito deberá ser:

- específico;
- inequívoco;
- verificable;
- trazable;
- coherente;
- y suficientemente independiente.

---

# 7. Requisitos del sistema

## REQ-SYS-001 — Identificación del software

El sistema deberá identificarse mediante nombre, versión y estado de liberación.

## REQ-SYS-002 — Configuración reproducible

El sistema deberá permitir identificar las versiones de software, dependencias, modelos y configuraciones utilizadas para producir una salida clínica.

## REQ-SYS-003 — Manejo de errores

El sistema deberá detectar y manejar errores de ejecución sin generar silenciosamente resultados clínicos inválidos.

## REQ-SYS-004 — Registro de estado

El sistema deberá registrar información suficiente para identificar el estado de configuración correspondiente a una operación relevante cuando sea necesario para la trazabilidad.

## REQ-SYS-005 — Separación de entornos

El sistema deberá permitir mantener separados los entornos de desarrollo, pruebas y producción.

---

# 8. Requisitos de gestión de usuarios

## REQ-USER-001 — Creación de usuarios

El sistema deberá permitir la creación de usuarios autorizados.

## REQ-USER-002 — Identificación única

Cada usuario deberá poseer un identificador único.

## REQ-USER-003 — Roles

El sistema deberá asociar cada usuario con uno o más niveles de autorización definidos por la política de acceso.

## REQ-USER-004 — Estado de usuario

El sistema deberá permitir determinar si una cuenta está activa, inactiva o bloqueada.

## REQ-USER-005 — Administración de usuarios

Las funciones administrativas de usuarios deberán estar restringidas a usuarios autorizados.

---

# 9. Requisitos de autenticación y seguridad

## REQ-SEC-001 — Autenticación

El sistema deberá requerir autenticación antes de conceder acceso a funciones protegidas.

## REQ-SEC-002 — Protección de contraseñas

Las contraseñas no deberán almacenarse en texto plano.

## REQ-SEC-003 — Hash seguro

Las contraseñas deberán almacenarse mediante un mecanismo criptográfico de hashing apropiado.

## REQ-SEC-004 — Control de autorización

El sistema deberá impedir el acceso a información y funciones para las cuales el usuario no posea autorización.

## REQ-SEC-005 — Separación de roles

El sistema deberá aplicar permisos según el rol asignado al usuario.

## REQ-SEC-006 — Gestión de secretos

Las claves de aplicación, secretos y credenciales no deberán almacenarse directamente en el código fuente.

## REQ-SEC-007 — Configuración segura

El sistema deberá poder ejecutarse utilizando variables de entorno u otro mecanismo seguro para gestionar secretos.

## REQ-SEC-008 — Sesiones

El sistema deberá controlar las sesiones autenticadas e impedir el acceso a información protegida mediante una sesión inválida.

## REQ-SEC-009 — Cierre de sesión

El sistema deberá permitir cerrar una sesión autenticada.

## REQ-SEC-010 — Acceso mínimo necesario

Los usuarios deberán recibir únicamente los permisos necesarios para sus funciones autorizadas.

---

# 10. Requisitos de pacientes

## REQ-PAT-001 — Identificador interno

Cada paciente deberá disponer de un identificador interno único.

## REQ-PAT-002 — Registro de paciente

El sistema deberá permitir registrar un paciente cuando el usuario tenga autorización suficiente.

## REQ-PAT-003 — Consulta

El sistema deberá permitir consultar pacientes autorizados.

## REQ-PAT-004 — Modificación

El sistema deberá restringir la modificación de datos del paciente a usuarios autorizados.

## REQ-PAT-005 — Integridad referencial

Las evaluaciones deberán poder asociarse de manera inequívoca con el paciente correspondiente.

## REQ-PAT-006 — Separación de identidad

El sistema deberá favorecer el uso de identificadores internos para las funciones analíticas cuando no sea necesario utilizar información identificable.

---

# 11. Requisitos de evaluaciones

## REQ-EVAL-001 — Crear evaluación

El sistema deberá permitir crear una evaluación asociada a un paciente autorizado.

## REQ-EVAL-002 — Fecha

Cada evaluación deberá registrar la fecha de realización.

## REQ-EVAL-003 — Identificador único

Cada evaluación deberá disponer de un identificador único.

## REQ-EVAL-004 — Estado

El sistema deberá permitir identificar el estado de una evaluación.

## REQ-EVAL-005 — Integridad

El sistema deberá impedir que una evaluación válida quede asociada a un paciente inexistente.

## REQ-EVAL-006 — Persistencia

Una evaluación guardada deberá poder recuperarse posteriormente según los permisos del usuario.

---

# 12. Requisitos de captura de datos

## REQ-DATA-001 — Validación de rango

El sistema deberá rechazar valores fuera del rango válido definido para cada variable o instrumento.

## REQ-DATA-002 — Valores faltantes

El sistema deberá distinguir entre:

```text
dato válido
dato faltante
dato inválido
dato no aplicable
```

## REQ-DATA-003 — Tipos de datos

El sistema deberá validar que los datos introducidos correspondan al tipo esperado.

## REQ-DATA-004 — Campos obligatorios

El sistema deberá impedir la finalización de una evaluación cuando falten datos obligatorios.

## REQ-DATA-005 — Valores extremos

El sistema deberá identificar valores fuera de los límites definidos para las variables aplicables.

## REQ-DATA-006 — Consistencia

El sistema deberá aplicar reglas de consistencia a conjuntos de variables cuando dichas reglas estén definidas.

## REQ-DATA-007 — Datos inválidos

El sistema no deberá utilizar datos identificados como inválidos para producir resultados clínicos.

---

# 13. Requisitos de scoring psicométrico

## REQ-CLIN-001 — Cálculo de escalas

El sistema deberá calcular las puntuaciones de las escalas psicométricas implementadas según las reglas definidas para cada instrumento.

## REQ-CLIN-002 — Ítems invertidos

El sistema deberá aplicar correctamente las reglas de recodificación de ítems cuando corresponda.

## REQ-CLIN-003 — Ítems faltantes

El sistema deberá aplicar la política definida para ítems faltantes antes de calcular una puntuación.

## REQ-CLIN-004 — Rangos de puntuación

El sistema deberá verificar que la puntuación final se encuentre dentro del rango permitido para cada escala.

## REQ-CLIN-005 — Trazabilidad

El sistema deberá permitir identificar qué respuestas originaron una puntuación determinada.

## REQ-CLIN-006 — Reproducibilidad

El mismo conjunto de entradas y la misma configuración deberá producir el mismo resultado cuando el procedimiento sea determinista.

## REQ-CLIN-007 — Variables compuestas

El sistema deberá calcular variables compuestas únicamente de acuerdo con definiciones previamente especificadas.

## REQ-CLIN-008 — Reglas clínicas

Las reglas clínicas deberán estar implementadas de manera explícita y controlada.

---

# 14. Requisitos de normalización

## REQ-NORM-001 — Transformación

El sistema deberá aplicar las transformaciones definidas para cada variable antes de utilizarla en modelos que las requieran.

## REQ-NORM-002 — Parámetros

Los parámetros de normalización utilizados deberán estar identificados y versionados.

## REQ-NORM-003 — Consistencia

El sistema deberá utilizar los parámetros de normalización correspondientes a la versión del modelo que esté ejecutando.

## REQ-NORM-004 — Valores incompatibles

El sistema deberá impedir o controlar la ejecución de modelos cuando las entradas no cumplan las condiciones requeridas por la transformación.

## REQ-NORM-005 — Trazabilidad

El sistema deberá permitir identificar la transformación utilizada para una salida analítica relevante.

---

# 15. Requisitos de representación dimensional

## REQ-DIM-001 — Representación

El sistema deberá transformar las variables clínicas definidas en una representación dimensional conforme a la especificación vigente.

## REQ-DIM-002 — Dimensiones

El sistema deberá utilizar las dimensiones definidas en la configuración clínica aprobada.

## REQ-DIM-003 — Identificación

Cada resultado dimensional deberá asociarse con la versión correspondiente de la configuración dimensional.

## REQ-DIM-004 — Valores inválidos

El sistema no deberá producir una representación dimensional válida a partir de entradas identificadas como inválidas.

## REQ-DIM-005 — Interpretación

La interfaz deberá distinguir entre el resultado computacional de una dimensión y su interpretación clínica.

---

# 16. Requisitos de modelos de aprendizaje automático

## REQ-ML-001 — Identificación del modelo

Cada modelo utilizado en producción deberá disponer de un identificador y una versión.

## REQ-ML-002 — Compatibilidad

El sistema deberá verificar que las variables de entrada sean compatibles con el modelo seleccionado.

## REQ-ML-003 — Preprocesamiento

El sistema deberá utilizar el preprocesamiento asociado a la versión del modelo.

## REQ-ML-004 — Parámetros

Los parámetros requeridos para la inferencia deberán estar asociados a la versión del modelo.

## REQ-ML-005 — Integridad

El sistema deberá poder comprobar la integridad del artefacto de modelo mediante un mecanismo de identificación o hash cuando corresponda.

## REQ-ML-006 — Modelo ausente

El sistema no deberá producir una predicción válida si el modelo requerido no está disponible.

## REQ-ML-007 — Modelo incompatible

El sistema deberá impedir la ejecución de un modelo cuando detecte incompatibilidad entre el modelo y sus entradas requeridas.

## REQ-ML-008 — Salida del modelo

El sistema deberá conservar la salida computacional del modelo de forma que pueda relacionarse con la versión que la generó.

## REQ-ML-009 — Incertidumbre

Cuando un modelo disponga de una métrica de incertidumbre o confiabilidad definida, el sistema deberá conservar y presentar dicha información de acuerdo con las especificaciones clínicas y de interfaz.

## REQ-ML-010 — Dominio de aplicación

Cuando se definan límites de aplicabilidad para un modelo, el sistema deberá detectar entradas fuera del dominio especificado.

---

# 17. Requisitos de clustering y estratificación

## REQ-CLUST-001 — Clustering

El sistema deberá asignar una observación al agrupamiento definido por el modelo correspondiente cuando se cumplan sus condiciones de ejecución.

## REQ-CLUST-002 — Versión

El resultado del clustering deberá poder asociarse con la versión del modelo utilizado.

## REQ-RISK-001 — Estratificación

El sistema deberá calcular el nivel de riesgo de acuerdo con las reglas o modelos aprobados.

## REQ-RISK-002 — Nivel de riesgo

Cada resultado de riesgo deberá incluir el nivel correspondiente definido por la especificación clínica.

## REQ-RISK-003 — Puntuación

Cuando exista una puntuación cuantitativa de riesgo, el sistema deberá almacenarla junto con la versión del procedimiento utilizado.

## REQ-RISK-004 — Resultado no disponible

Cuando no sea posible determinar el nivel de riesgo de manera válida, el sistema no deberá presentar un nivel como si fuese válido.

## REQ-RISK-005 — Incertidumbre

Cuando la estimación de riesgo incorpore incertidumbre, esta deberá conservarse y utilizarse de acuerdo con la especificación correspondiente.

---

# 18. Requisitos de alertas

## REQ-ALERT-001 — Generación

El sistema deberá generar una alerta cuando se cumplan los criterios definidos para dicha alerta.

## REQ-ALERT-002 — Identificación

Cada alerta deberá tener un tipo identificable.

## REQ-ALERT-003 — Criterio

El criterio que originó la alerta deberá poder identificarse.

## REQ-ALERT-004 — Estado

Las alertas deberán poder tener un estado definido, por ejemplo:

```text
activa
revisada
cerrada
```

## REQ-ALERT-005 — Trazabilidad

El sistema deberá registrar cuándo se generó una alerta y qué versión del software o modelo participó en su generación.

## REQ-ALERT-006 — Interpretación

Las alertas deberán presentarse como apoyo a la evaluación profesional y no como una decisión clínica autónoma.

## REQ-ALERT-007 — Fallo de generación

El sistema deberá detectar y registrar errores que impidan generar una alerta requerida.

---

# 19. Requisitos de análisis longitudinal

## REQ-LONG-001 — Historial

El sistema deberá permitir recuperar evaluaciones longitudinales autorizadas de un paciente.

## REQ-LONG-002 — Orden temporal

Las evaluaciones deberán poder ordenarse cronológicamente.

## REQ-LONG-003 — Comparación

El sistema deberá permitir comparar resultados entre evaluaciones cuando las variables sean compatibles.

## REQ-LONG-004 — Evolución

El sistema deberá representar la evolución temporal de variables seleccionadas.

## REQ-LONG-005 — Versiones

El sistema deberá identificar cuando una comparación involucre resultados generados con distintas versiones de software, configuración o modelo.

## REQ-LONG-006 — Datos incompatibles

El sistema no deberá presentar como directamente comparables resultados incompatibles por cambios metodológicos, salvo que una regla explícita lo permita.

---

# 20. Requisitos de narrativa y NLP

## REQ-NLP-001 — Procesamiento

El sistema podrá procesar narrativas clínicas mediante procedimientos de análisis de lenguaje natural previamente especificados.

## REQ-NLP-002 — Estado del procesamiento

El sistema deberá distinguir entre:

```text
texto no procesado
texto procesado
procesamiento fallido
resultado no disponible
```

## REQ-NLP-003 — Trazabilidad

El resultado NLP deberá poder asociarse con el método, versión y configuración utilizados.

## REQ-NLP-004 — Naturaleza del resultado

Los resultados derivados del NLP deberán presentarse como información analítica de apoyo.

## REQ-NLP-005 — Fallos

El fallo del procesamiento NLP no deberá provocar la presentación de un resultado inventado o incorrectamente interpretado como válido.

---

# 21. Requisitos de interpretación clínica

## REQ-INTERP-001 — Separación

El sistema deberá diferenciar entre:

```text
dato de entrada
resultado calculado
resultado del modelo
interpretación
```

## REQ-INTERP-002 — Fuente

Cuando sea necesario para la comprensión clínica, la interfaz deberá identificar la fuente del resultado.

## REQ-INTERP-003 — Limitaciones

Cuando una salida posea limitaciones conocidas, estas deberán poder comunicarse al usuario conforme a la especificación correspondiente.

## REQ-INTERP-004 — Juicio profesional

El sistema deberá mostrar de manera explícita que los resultados requieren interpretación profesional.

---

# 22. Requisitos de interfaz de usuario

## REQ-UI-001 — Identificación del usuario

La interfaz deberá permitir al usuario identificar el contexto de la sesión activa.

## REQ-UI-002 — Navegación

La interfaz deberá proporcionar navegación consistente entre las funciones autorizadas.

## REQ-UI-003 — Validación

La interfaz deberá proporcionar información cuando un dato introducido sea inválido.

## REQ-UI-004 — Mensajes de error

Los mensajes de error deberán permitir al usuario comprender qué operación falló sin revelar información sensible innecesaria.

## REQ-UI-005 — Resultados

Los resultados clínicos deberán distinguirse visualmente de los datos de entrada.

## REQ-UI-006 — Alertas

Las alertas deberán ser claramente distinguibles y mostrar la información necesaria para su interpretación.

## REQ-UI-007 — Estado

La interfaz deberá indicar cuando un resultado se encuentre:

```text
disponible
no disponible
pendiente
incompleto
```

## REQ-UI-008 — Confirmaciones

Las operaciones que modifiquen o eliminen información relevante deberán requerir una confirmación cuando corresponda.

## REQ-UI-009 — No ambigüedad

La interfaz no deberá utilizar etiquetas que puedan inducir a interpretar un resultado computacional como un diagnóstico autónomo.

---

# 23. Requisitos de reportes

## REQ-REP-001 — Generación

El sistema deberá permitir generar reportes de las evaluaciones autorizadas.

## REQ-REP-002 — Identificación

El reporte deberá identificar al menos:

- paciente o identificador autorizado;
- evaluación;
- fecha;
- y versión del sistema cuando corresponda.

## REQ-REP-003 — Resultados

El reporte deberá presentar los resultados relevantes de la evaluación.

## REQ-REP-004 — Advertencia

Los reportes deberán incluir la indicación de que los resultados constituyen apoyo a la decisión profesional.

## REQ-REP-005 — Versión de modelo

Cuando un resultado provenga de un modelo ML, el reporte deberá poder identificar la versión del modelo utilizada cuando sea necesario para la trazabilidad.

## REQ-REP-006 — Integridad

El reporte generado deberá corresponder a la evaluación seleccionada.

---

# 24. Requisitos de auditoría

## REQ-AUD-001 — Registro de acceso

El sistema deberá registrar las acciones de acceso relevantes.

## REQ-AUD-002 — Registro de evaluación

El sistema deberá registrar las operaciones relevantes relacionadas con evaluaciones.

## REQ-AUD-003 — Usuario

Las acciones auditadas deberán asociarse con el usuario cuando corresponda.

## REQ-AUD-004 — Fecha y hora

Las acciones auditadas deberán registrar fecha y hora.

## REQ-AUD-005 — Integridad

Los registros de auditoría no deberán modificarse mediante las funciones normales de la aplicación.

## REQ-AUD-006 — Trazabilidad de resultados

Las operaciones relevantes deberán poder relacionarse con los resultados generados cuando sea necesario.

---

# 25. Requisitos de base de datos

## REQ-DB-001 — Persistencia

El sistema deberá almacenar de manera persistente las entidades necesarias para su operación.

## REQ-DB-002 — Integridad

La base de datos deberá mantener las relaciones definidas entre usuarios, pacientes y evaluaciones.

## REQ-DB-003 — Identificadores únicos

Las entidades principales deberán disponer de identificadores únicos.

## REQ-DB-004 — Consistencia

El sistema deberá impedir registros inconsistentes cuando dichas inconsistencias puedan detectarse mediante reglas definidas.

## REQ-DB-005 — Recuperación

El sistema deberá poder recuperar registros almacenados correctamente.

---

# 26. Requisitos de configuración

## REQ-CFG-001 — Configuración externa

La configuración que pueda variar entre entornos deberá mantenerse separada del código cuando sea apropiado.

## REQ-CFG-002 — Identificación

La configuración relevante para los resultados clínicos deberá estar identificada y versionada.

## REQ-CFG-003 — Cambios

Las modificaciones de configuración deberán estar sujetas al proceso de control de cambios.

## REQ-CFG-004 — Consistencia

La configuración utilizada para una ejecución deberá ser compatible con la versión del software.

---

# 27. Requisitos de gestión de modelos

## REQ-MODEL-001 — Registro

Los modelos disponibles deberán estar registrados en un inventario controlado.

## REQ-MODEL-002 — Estado

Cada modelo deberá disponer de un estado, por ejemplo:

```text
desarrollo
validación
aprobado
retirado
```

## REQ-MODEL-003 — Integridad

El sistema deberá comprobar la integridad del artefacto antes de utilizarlo cuando exista un mecanismo definido para ello.

## REQ-MODEL-004 — Compatibilidad

El modelo deberá estar asociado con las variables y parámetros para los cuales fue validado.

## REQ-MODEL-005 — Retiro

Un modelo marcado como retirado no deberá utilizarse para nuevas evaluaciones de producción.

---

# 28. Requisitos de seguridad de datos

## REQ-DATASEC-001 — Acceso restringido

El acceso a información clínica deberá requerir autorización.

## REQ-DATASEC-002 — Minimización

El sistema deberá limitar la exposición de información identificable a la necesaria para la función correspondiente.

## REQ-DATASEC-003 — Exportación

Las funciones de exportación de información clínica deberán estar restringidas.

## REQ-DATASEC-004 — Datos de prueba

Los datos de prueba no deberán incorporar innecesariamente información clínica identificable.

## REQ-DATASEC-005 — Secretos

Los secretos de aplicación no deberán persistirse en bases de datos clínicas ni en el código fuente.

---

# 29. Requisitos de rendimiento

Los valores definitivos serán establecidos durante la fase de validación del sistema.

## REQ-PERF-001

El sistema deberá completar las operaciones clínicas ordinarias dentro de los límites de tiempo definidos para el entorno de producción.

## REQ-PERF-002

La ejecución de un modelo deberá finalizar correctamente o informar de manera controlada cuando se supere el tiempo máximo definido.

## REQ-PERF-003

El sistema deberá evitar operaciones que provoquen un consumo de memoria incompatible con el entorno operativo definido.

---

# 30. Requisitos de disponibilidad y recuperación

## REQ-REC-001

El sistema deberá detectar errores de conexión con la base de datos.

## REQ-REC-002

El sistema no deberá indicar que una operación de persistencia fue exitosa cuando la escritura haya fallado.

## REQ-REC-003

El sistema deberá informar al usuario cuando una operación no pueda completarse.

## REQ-REC-004

Los mecanismos de recuperación y respaldo deberán definirse para el entorno de producción.

---

# 31. Requisitos de interoperabilidad

## REQ-INT-001

Los formatos de importación y exportación deberán estar definidos y documentados.

## REQ-INT-002

Los archivos importados deberán validarse antes de incorporarse a datos clínicos.

## REQ-INT-003

El sistema deberá rechazar o marcar archivos que no cumplan el esquema esperado.

---

# 32. Requisitos específicos de seguridad clínica

## REQ-SAF-001 — Resultado inválido

El sistema no deberá presentar un resultado inválido como resultado clínico válido.

## REQ-SAF-002 — Datos insuficientes

Cuando los datos disponibles no sean suficientes para producir un resultado válido, el sistema deberá indicarlo.

## REQ-SAF-003 — Error del modelo

Cuando un modelo falle durante la inferencia, el sistema deberá impedir que el resultado de una ejecución anterior o incompleta sea presentado como el resultado actual.

## REQ-SAF-004 — Incompatibilidad

El sistema deberá impedir la utilización de modelos con entradas incompatibles.

## REQ-SAF-005 — Estado de resultados

El usuario deberá poder distinguir entre resultados calculados correctamente y resultados no disponibles.

## REQ-SAF-006 — Revisión profesional

Las funciones de apoyo a la decisión deberán presentar los resultados de forma compatible con su revisión por un profesional autorizado.

## REQ-SAF-007 — Alertas críticas

Las alertas definidas como clínicamente relevantes deberán poseer mecanismos de generación, persistencia y trazabilidad verificables.

---

# 33. Requisitos de reproducibilidad

## REQ-REPRO-001

El sistema deberá permitir identificar el código utilizado para una ejecución relevante.

## REQ-REPRO-002

El sistema deberá permitir identificar la versión del modelo utilizada.

## REQ-REPRO-003

El sistema deberá permitir identificar la configuración y parámetros relevantes.

## REQ-REPRO-004

Las operaciones deterministas deberán producir resultados reproducibles bajo la misma configuración y entradas.

---

# 34. Requisitos de mantenibilidad

## REQ-MAINT-001

El software deberá estructurarse modularmente para permitir mantenimiento controlado.

## REQ-MAINT-002

Los componentes deberán poseer interfaces definidas.

## REQ-MAINT-003

Los cambios deberán poder asociarse con una versión del software.

## REQ-MAINT-004

Los cambios que afecten resultados clínicos deberán activar las pruebas correspondientes.

---

# 35. Requisitos de documentación y trazabilidad

## REQ-DOC-001

Cada requisito deberá poseer un identificador único.

## REQ-DOC-002

Los requisitos deberán poder relacionarse con pruebas.

## REQ-DOC-003

Los requisitos relacionados con seguridad deberán poder relacionarse con riesgos.

## REQ-DOC-004

Las liberaciones deberán poder relacionarse con la versión de requisitos aplicable.

## REQ-DOC-005

Las modificaciones de requisitos deberán conservar historial.

---

# 36. Requisitos para defectos y errores

## REQ-DEF-001

El sistema deberá registrar errores críticos de operación cuando sea necesario para diagnóstico y seguridad.

## REQ-DEF-002

Los errores que puedan afectar resultados clínicos deberán poder identificarse.

## REQ-DEF-003

Un error no deberá generar silenciosamente un resultado incorrecto presentado como válido.

## REQ-DEF-004

Los defectos corregidos deberán disponer de una prueba de regresión cuando corresponda.

---

# 37. Requisitos de pruebas

## REQ-TEST-001

Cada requisito verificable deberá asociarse con uno o más casos de prueba.

## REQ-TEST-002

Las pruebas deberán identificar la versión del software evaluada.

## REQ-TEST-003

Las pruebas relacionadas con modelos deberán identificar la versión del modelo.

## REQ-TEST-004

Los resultados de pruebas deberán conservarse como evidencia.

## REQ-TEST-005

Los cambios de software deberán activar pruebas de regresión según el impacto determinado.

---

# 38. Requisitos de liberación

## REQ-REL-001

Cada liberación deberá poseer un identificador único.

## REQ-REL-002

Una liberación deberá estar asociada a una configuración específica.

## REQ-REL-003

Las pruebas requeridas deberán completarse antes de una liberación.

## REQ-REL-004

Las anomalías conocidas deberán ser evaluadas antes de la liberación.

## REQ-REL-005

Los modelos incluidos en una liberación deberán estar identificados.

## REQ-REL-006

Los componentes de terceros relevantes deberán estar identificados.

---

# 39. Requisitos de mantenimiento y retiro

## REQ-LIFE-001

Las modificaciones posteriores a la liberación deberán seguir el proceso de mantenimiento establecido.

## REQ-LIFE-002

Las modificaciones deberán someterse a evaluación de impacto.

## REQ-LIFE-003

Los cambios que puedan afectar seguridad deberán someterse a reevaluación de riesgos.

## REQ-LIFE-004

Las versiones retiradas deberán quedar identificadas históricamente.

## REQ-LIFE-005

Los resultados históricos deberán conservar información suficiente para identificar la versión de software y modelo que los generó.

---

# 40. Requisitos de componentes de terceros / SOUP

## REQ-SOUP-001

Los componentes de terceros utilizados por SISAP deberán estar identificados.

## REQ-SOUP-002

La versión utilizada de cada componente relevante deberá estar registrada.

## REQ-SOUP-003

Los componentes relevantes para seguridad deberán someterse a evaluación proporcional a su función.

## REQ-SOUP-004

Los cambios de componentes SOUP que puedan afectar el comportamiento del software deberán activar evaluación de impacto.

---

# 41. Requisitos de defectos comunes asociados a la tecnología

El desarrollo deberá identificar categorías de defectos comunes asociadas con las tecnologías empleadas.

Deberán considerarse, como mínimo cuando sean aplicables:

```text
Errores de memoria
Errores de tipos
Errores de conversión
Valores nulos
Valores fuera de rango
Errores matemáticos
Errores de redondeo
Persistencia incompleta
Errores de concurrencia
Errores de autenticación
Errores de autorización
Errores de sesión
Incompatibilidad de dependencias
Corrupción de modelos
Modelos incompatibles
Normalización incorrecta
Resultados ML inválidos
Errores de visualización
Exposición de información
```

## REQ-DEFECT-001

El equipo deberá mantener un registro de categorías de defectos comunes relevantes.

## REQ-DEFECT-002

Los defectos comunes que puedan contribuir a situaciones peligrosas deberán considerarse dentro del análisis de riesgos.

## REQ-DEFECT-003

Cuando la clasificación de seguridad del software lo requiera, deberá existir evidencia de que los defectos comunes relevantes han sido controlados.

---

# 42. Requisitos de seguridad del modelo ML

Debido a la naturaleza analítica de SISAP, los modelos se consideran componentes controlados del sistema.

## REQ-MLSEC-001

El sistema deberá impedir la ejecución de un artefacto de modelo cuya integridad no pueda verificarse cuando dicha verificación sea obligatoria.

## REQ-MLSEC-002

El sistema deberá impedir la utilización de modelos fuera de su configuración compatible.

## REQ-MLSEC-003

El modelo utilizado deberá quedar identificado en los registros relevantes.

## REQ-MLSEC-004

La actualización de un modelo deberá seguir un proceso controlado de cambio y verificación.

## REQ-MLSEC-005

Un modelo retirado no deberá utilizarse en nuevas evaluaciones de producción.

---

# 43. Requisitos de información clínica

## REQ-CLININFO-001

El sistema deberá conservar la relación entre las respuestas y sus resultados derivados cuando dicha relación sea necesaria para trazabilidad.

## REQ-CLININFO-002

Las puntuaciones brutas y derivadas deberán poder distinguirse.

## REQ-CLININFO-003

Los resultados clínicamente relevantes deberán poder asociarse con su fecha.

## REQ-CLININFO-004

Los resultados deberán poder asociarse con la evaluación correspondiente.

---

# 44. Requisitos no funcionales

Además de los requisitos funcionales, SISAP deberá cumplir requisitos no funcionales relacionados con:

```text
Seguridad
Trazabilidad
Reproducibilidad
Mantenibilidad
Integridad
Disponibilidad
Rendimiento
Usabilidad
Interoperabilidad
Control de configuración
Auditabilidad
```

Los valores cuantitativos que aún no estén definidos deberán establecerse antes de la liberación correspondiente.

---

# 45. Requisitos pendientes de especificación

Los siguientes elementos todavía requieren definición cuantitativa o clínica antes de considerarse requisitos cerrados:

| Área | Elemento pendiente |
|---|---|
| Rendimiento | Tiempos máximos de respuesta |
| Disponibilidad | Objetivos de disponibilidad |
| Sesiones | Tiempo de expiración |
| Contraseñas | Política exacta |
| Backup | Frecuencia |
| Recuperación | RPO/RTO |
| Riesgo | Umbrales definitivos |
| ML | Límites de aplicabilidad |
| Incertidumbre | Umbrales |
| Alertas | Severidad y prioridad |
| Reportes | Formato definitivo |
| Roles | Matriz final de permisos |
| Auditoría | Eventos exactos a registrar |
| Datos | Política definitiva de retención |
| Seguridad | Requisitos específicos de infraestructura |

Estos elementos deberán convertirse en requisitos controlados antes de la correspondiente fase de diseño o liberación.

---

# 46. Matriz preliminar de dominios

| Dominio | Prefijo | Ejemplos |
|---|---|---|
| Sistema | SYS | REQ-SYS-001 |
| Usuarios | USER | REQ-USER-001 |
| Seguridad | SEC | REQ-SEC-001 |
| Pacientes | PAT | REQ-PAT-001 |
| Evaluaciones | EVAL | REQ-EVAL-001 |
| Datos | DATA | REQ-DATA-001 |
| Clínica | CLIN | REQ-CLIN-001 |
| Normalización | NORM | REQ-NORM-001 |
| Dimensional | DIM | REQ-DIM-001 |
| ML | ML | REQ-ML-001 |
| Clustering | CLUST | REQ-CLUST-001 |
| Riesgo | RISK | REQ-RISK-001 |
| Alertas | ALERT | REQ-ALERT-001 |
| Longitudinal | LONG | REQ-LONG-001 |
| NLP | NLP | REQ-NLP-001 |
| Interpretación | INTERP | REQ-INTERP-001 |
| Interfaz | UI | REQ-UI-001 |
| Reportes | REP | REQ-REP-001 |
| Auditoría | AUD | REQ-AUD-001 |
| Base de datos | DB | REQ-DB-001 |
| Configuración | CFG | REQ-CFG-001 |
| Modelo | MODEL | REQ-MODEL-001 |
| Datos seguros | DATASEC | REQ-DATASEC-001 |
| Rendimiento | PERF | REQ-PERF-001 |
| Recuperación | REC | REQ-REC-001 |
| Interoperabilidad | INT | REQ-INT-001 |
| Seguridad clínica | SAF | REQ-SAF-001 |
| Reproducibilidad | REPRO | REQ-REPRO-001 |
| Mantenimiento | MAINT | REQ-MAINT-001 |
| Documentación | DOC | REQ-DOC-001 |
| Defectos | DEF | REQ-DEF-001 |
| Pruebas | TEST | REQ-TEST-001 |
| Liberación | REL | REQ-REL-001 |
| Ciclo de vida | LIFE | REQ-LIFE-001 |
| SOUP | SOUP | REQ-SOUP-001 |
| Seguridad ML | MLSEC | REQ-MLSEC-001 |

---

# 47. Relación con gestión de riesgos

Los requisitos con impacto potencial en seguridad deberán poder relacionarse con el análisis de riesgos.

Ejemplo:

```text
REQ-SAF-003
Error del modelo
       │
       ▼
RISK-ML-001
Modelo produce salida incorrecta
       │
       ▼
Control de riesgo
       │
       ▼
TEST-ML-001
       │
       ▼
RELEASE
```

Los requisitos relacionados con riesgo deberán estar claramente identificados en la matriz de trazabilidad.

---

# 48. Relación con arquitectura

Los requisitos se convertirán posteriormente en elementos arquitectónicos.

Ejemplo:

```text
REQ-SEC-004
Control de autorización
        ↓
Security Service
        ↓
Authorization Middleware
        ↓
User Model
        ↓
TEST-SEC-004
```

Otro ejemplo:

```text
REQ-ML-003
Preprocesamiento compatible
        ↓
ML Service
        ↓
Normalization Service
        ↓
Model Registry
        ↓
TEST-ML-003
```

---

# 49. Matriz de trazabilidad preliminar

| Requisito | Riesgo | Arquitectura | Implementación | Prueba | Release |
|---|---|---|---|---|---|
| REQ-SEC-001 | RISK-SEC-001 | ARCH-SEC-001 | TBD | TEST-SEC-001 | TBD |
| REQ-DATA-001 | RISK-DATA-001 | ARCH-DATA-001 | TBD | TEST-DATA-001 | TBD |
| REQ-CLIN-001 | RISK-CLIN-001 | ARCH-CLIN-001 | TBD | TEST-CLIN-001 | TBD |
| REQ-ML-001 | RISK-ML-001 | ARCH-ML-001 | TBD | TEST-ML-001 | TBD |
| REQ-RISK-001 | RISK-RISK-001 | ARCH-RISK-001 | TBD | TEST-RISK-001 | TBD |
| REQ-ALERT-001 | RISK-ALERT-001 | ARCH-ALERT-001 | TBD | TEST-ALERT-001 | TBD |

Esta matriz deberá evolucionar hasta cubrir todos los requisitos aplicables.

---

# 50. Criterios de aceptación de la SRS

La SRS podrá considerarse lista para baseline cuando:

- cada requisito tenga identificador;
- los requisitos sean verificables;
- no existan requisitos contradictorios;
- los requisitos relacionados con seguridad estén identificados;
- las interfaces relevantes estén especificadas;
- los requisitos clínicos esenciales estén definidos;
- los requisitos ML estén definidos;
- los requisitos de datos estén definidos;
- los requisitos de seguridad estén definidos;
- los requisitos pendientes estén identificados;
- y exista una estrategia de trazabilidad.

---

# 51. Control de cambios de la SRS

Toda modificación posterior a la baseline deberá:

```text
Solicitud
   ↓
Análisis de impacto
   ↓
Evaluación de riesgo
   ↓
Modificación
   ↓
Revisión
   ↓
Pruebas afectadas
   ↓
Nueva versión
```

Los cambios que modifiquen comportamiento clínico deberán evaluarse especialmente.

---

# 52. Estado de los requisitos

| Estado | Significado |
|---|---|
| Proposed | Propuesto |
| Draft | En elaboración |
| Reviewed | Revisado |
| Approved | Aprobado |
| Implemented | Implementado |
| Verified | Verificado |
| Released | Liberado |
| Deprecated | Obsoleto |
| Retired | Retirado |

---

# 53. Estado actual

| Área | Estado |
|---|---|
| Requisitos del sistema | En desarrollo |
| Requisitos clínicos | En desarrollo |
| Requisitos de datos | En desarrollo |
| Requisitos ML | En desarrollo |
| Requisitos de seguridad | En desarrollo |
| Requisitos UI | En desarrollo |
| Requisitos de auditoría | En desarrollo |
| Requisitos de reportes | En desarrollo |
| Requisitos de rendimiento | Parcial |
| Requisitos de recuperación | Parcial |
| Matriz de riesgos | Pendiente |
| Arquitectura relacionada | Pendiente |
| Casos de prueba | Pendiente |
| Trazabilidad completa | Pendiente |
| Baseline SRS | Pendiente |

---

# 54. Aprobación

Este documento deberá ser revisado antes de establecerse como baseline de requisitos.

| Rol | Responsable | Estado |
|---|---|---|
| Responsable del producto | Psic. Lauro Gutiérrez Castro | Pendiente |
| Responsable clínico | Psic. Lauro Gutiérrez Castro | Pendiente |
| Responsable de software | Pendiente | Pendiente |
| Responsable de verificación | Pendiente | Pendiente |

---

# 55. Historial de versiones

| Versión | Fecha | Descripción |
|---|---|---|
| 0.1 | Agosto 2026 | Estructura inicial de SRS |
| 0.9 | Pendiente | Revisión técnica |
| 1.0 | Pendiente | Baseline inicial |
| 1.x | Futuro | Cambios controlados |

---

# 56. Declaración de estado

> **SISAP by CENIVRA Software Requirements Specification constituye la especificación de requisitos de software del producto.**
>
> Los requisitos contenidos en este documento deberán utilizarse como referencia para arquitectura, diseño, implementación, gestión de riesgos, verificación, pruebas y liberación.
>
> Este documento permanecerá bajo control de configuración y cualquier modificación posterior a su aprobación deberá gestionarse mediante el proceso formal de control de cambios.