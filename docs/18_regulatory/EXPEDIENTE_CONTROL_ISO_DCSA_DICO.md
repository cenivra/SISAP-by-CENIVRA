# Expediente de control documental para software clínico

## 1. Identificación del documento

| Campo | Valor |
| --- | --- |
| Identificador | REG-DOC-DCSA-DICO-001 |
| Título | Expediente de control documental: DCSA, DICO y fase transversal |
| Proyecto | SISAP by CENIVRA |
| Versión | 1.0 |
| Estado | Borrador controlado para revisión y aprobación |
| Fecha | 2026-09-30 |
| Propietario | Responsable del proyecto |
| Clasificación | Documentación técnica y de gobernanza |
| Referencia normativa | ISO 60304: pendiente de confirmación por el responsable normativo. No se declara conformidad normativa en esta versión. |

> **Nota normativa.** El número de norma y su edición deben confirmarse antes de asignar cláusulas o declarar cumplimiento. Por el alcance de este expediente, también debe verificarse si la referencia pretendida es IEC 62304 u otra norma aplicable al ciclo de vida del software sanitario.

---

## 2. Propósito

Este expediente establece el estado documental, técnico y de gobernanza de cuatro líneas relacionadas con SISAP by CENIVRA:

- DCSA: análisis dinámico clínico en investigación.
- DICO: investigación longitudinal y multinivel en investigación.
- Autoencoder: componente técnico con validación parcial.
- Fase transversal: capa operativa de registro, cálculo estructurado y control de acceso.

El expediente evita presentar investigación, prototipos o resultados exploratorios como capacidades clínicas liberadas.

---

## 3. Alcance

### 3.1 Incluido

Este documento controla:

- la separación entre investigación y producto;
- la clasificación del nivel de evidencia;
- las condiciones para incorporar una capacidad al producto;
- los riesgos de sobreafirmación y publicación;
- la trazabilidad de decisiones y evidencias;
- los criterios mínimos para revisión y liberación documental.

### 3.2 Excluido

Este documento no constituye:

- una certificación;
- una declaración de conformidad;
- una validación clínica;
- una autorización regulatoria;
- una especificación completa de requisitos de software;
- una aprobación de DCSA, DICO o del autoencoder para uso clínico.

---

## 4. Uso previsto documentado

SISAP by CENIVRA se documenta como una plataforma de apoyo clínico y analítico para registro estructurado, evaluación, trazabilidad del cálculo y gestión controlada de información bajo supervisión profesional.

El sistema no debe describirse, en esta etapa, como:

- herramienta autónoma de diagnóstico;
- predictor individual de recaída o evolución;
- recomendador automático de tratamiento;
- sistema que decide intervenciones clínicas;
- producto terapéutico;
- sistema con capacidades de inteligencia artificial clínica plenamente validadas.

---

## 5. Clasificación de evidencia

| Nivel | Definición | Uso permitido |
| --- | --- | --- |
| Validado | Implementado, revisado y respaldado por evidencia reproducible y criterios de aceptación aprobados. | Puede formar parte del alcance operativo, sujeto a aprobación. |
| Parcialmente validado | Existe implementación o evidencia técnica, pero falta cerrar una parte del flujo, la verificación o la validación de uso. | Puede documentarse como estado técnico; no debe presentarse como capacidad clínica completa. |
| Exploratorio | Hipótesis, prototipo, piloto, análisis en investigación o resultado aún no consolidado. | Solo investigación y documentación interna controlada. |
| No disponible | No existe evidencia suficiente o el componente no está implementado. | No se publica como capacidad. |

La clasificación se aplica al componente completo, no solo a la existencia de código, una carpeta, un modelo o un resultado aislado.

---

## 6. Estado de los componentes

| Componente | Clasificación actual | Alcance permitido | Condición para avanzar |
| --- | --- | --- | --- |
| DCSA | Exploratorio | Investigación y análisis metodológico con interpretación limitada. | Protocolo, validación independiente, criterios clínicos y aprobación formal. |
| DICO | Exploratorio | Investigación longitudinal y multinivel. | Cierre metodológico, reproducibilidad, documentación de datos, validación y aprobación. |
| Autoencoder del producto | Parcialmente validado | Componente técnico de representación latente, sin afirmación clínica autónoma. | Auditoría completa de decodificación, reconstrucción, pérdida, datos, desempeño y uso previsto. |
| Fase transversal | Parcialmente validada / operativa por componente | Registro estructurado, reglas de cálculo y control de acceso según evidencia disponible. | Verificación de requisitos, pruebas de integración, seguridad, auditoría y aprobación de release. |

---

## 7. Capacidades que pueden declararse con cautela

Siempre que la evidencia correspondiente esté vinculada a la versión liberada, puede declararse que el sistema:

- registra instrumentos clínicos estructurados;
- valida consistencia y estados de cálculo;
- bloquea el cálculo cuando el protocolo no es interpretable;
- conserva trazabilidad del proceso de puntuación cuando el flujo lo soporta;
- aplica roles y permisos de acceso;
- puede exigir justificación para un acceso de emergencia;
- separa componentes operativos de líneas de investigación.

Estas afirmaciones no equivalen a una declaración de eficacia clínica ni de conformidad regulatoria.

---

## 8. Afirmaciones bloqueadas

Quedan bloqueadas para documentación pública, comercial o de producto hasta contar con evidencia y aprobación específica:

- detección automática de recaída;
- predicción individual de evolución clínica;
- recomendación automática de tratamiento;
- clasificación con efecto clínico directo;
- afirmación de superioridad frente a otro método;
- porcentajes de coincidencia clínica no reproducibles y aprobados;
- uso clínico de DCSA o DICO;
- presentación del autoencoder como modelo clínico validado;
- presentación de Recover AI o de cualquier marca equivalente como identidad del producto.

La identidad pública controlada es **SISAP by CENIVRA**.

---

## 9. Controles documentales requeridos

Cada documento o registro que pretenda formar parte del expediente debe incluir, como mínimo:

- identificador único;
- título y versión;
- fecha de emisión;
- estado: borrador, en revisión, aprobado, obsoleto o retirado;
- propietario y aprobador;
- alcance y uso previsto;
- fuentes o evidencias relacionadas;
- riesgos y limitaciones conocidas;
- historial de cambios;
- relación con requisitos, pruebas o decisiones aplicables.

Los documentos históricos pueden conservarse para trazabilidad, pero no deben confundirse con documentos aprobados ni con evidencia vigente.

---

## 10. Trazabilidad mínima

La liberación de una capacidad debe poder seguir esta cadena:

`necesidad o requisito -> diseño o implementación -> prueba o evaluación -> resultado -> riesgo residual -> aprobación -> versión liberada`

Si uno de estos vínculos no existe, la capacidad se mantiene como parcialmente validada, exploratoria o no disponible, según corresponda.

Para DCSA, DICO y el autoencoder, la trazabilidad debe incluir además:

- población y tamaño muestral;
- origen y estado de los datos;
- protocolo de análisis;
- separación entre entrenamiento, evaluación y prueba;
- limitaciones conocidas;
- interpretación permitida;
- prohibiciones de uso;
- responsable de revisión.

---

## 11. Requisitos de publicación en GitHub

La documentación pública debe:

- utilizar SISAP by CENIVRA como identidad vigente;
- excluir Recover AI y nombres provisionales;
- excluir datos personales, datos de participantes y secretos;
- excluir rutas locales, nombres de usuario y configuraciones del entorno;
- evitar resultados o claims que no tengan evidencia enlazada;
- distinguir expresamente investigación, prototipo y producto;
- conservar únicamente el nivel de detalle necesario para comprender el alcance aprobado.

Los anexos forenses, notas de auditoría local y material de trabajo permanecen en el archivo histórico controlado.

---

## 12. Criterios de liberación

Una línea de investigación solo podrá entrar en el alcance operativo cuando se hayan completado y aprobado, como mínimo:

1. definición de uso previsto y límites;
2. requisitos funcionales y de seguridad;
3. análisis de riesgos;
4. control de datos y procedencia;
5. implementación identificable y versionada;
6. pruebas unitarias, integración y sistema aplicables;
7. validación del desempeño para el uso previsto;
8. revisión de seguridad, privacidad y acceso;
9. documentación de limitaciones e interpretación;
10. aprobación formal de la versión liberada.

Hasta entonces, el componente debe permanecer identificado como investigación, parcialmente validado o no disponible.

---

## 13. Riesgos documentales y controles

| Riesgo | Control |
| --- | --- |
| Confundir investigación con producto | Clasificación obligatoria por nivel de evidencia. |
| Sobreafirmar desempeño clínico | Revisión de claims y bloqueo de afirmaciones no respaldadas. |
| Publicar información restringida | Revisión de datos, secretos, rutas locales y archivos históricos antes de cada release. |
| Perder la trazabilidad de una decisión | Identificador, versión, aprobador y registro de cambios. |
| Aplicar una norma incorrecta | Confirmación del número, edición y alcance normativo antes de mapear cláusulas. |
| Incorporar un modelo sin validación completa | Gate de liberación y aprobación específica del uso previsto. |

---

## 14. Registro de decisión

| Decisión | Estado | Justificación |
| --- | --- | --- |
| Mantener DCSA como investigación | Adoptada | Evidencia exploratoria y uso clínico no aprobado. |
| Mantener DICO como investigación | Adoptada | Estudio en desarrollo, sin madurez suficiente para alcance operativo. |
| Mantener el autoencoder fuera de claims clínicos | Adoptada | Validación técnica incompleta en etapas posteriores al espacio latente. |
| Tratar la fase transversal como alcance operativo limitado | Adoptada con revisión | Es la capa con evidencia más directa, pero requiere verificación por release. |
| Usar SISAP by CENIVRA como nombre final | Adoptada | Identidad estable y sin promesa terapéutica no validada. |
| Retirar Recover AI | Adoptada | Reduce ambigüedad de marca y riesgo de sobreinterpretación clínica. |
| Mapear este expediente a ISO 60304 | Pendiente | Debe confirmarse la norma y edición exactas antes de declarar correspondencia. |

---

## 15. Historial de cambios

| Versión | Fecha | Cambio | Responsable |
| --- | --- | --- | --- |
| 1.0 | 2026-09-30 | Creación del expediente controlado y separación de alcance, evidencia y publicación. | Responsable del proyecto |

---

## 16. Aprobaciones

| Rol | Nombre | Firma / registro | Fecha | Estado |
| --- | --- | --- | --- | --- |
| Responsable del proyecto | Pendiente | Pendiente | Pendiente | Pendiente |
| Responsable técnico | Pendiente | Pendiente | Pendiente | Pendiente |
| Responsable de calidad o regulatorio | Pendiente | Pendiente | Pendiente | Pendiente |

---

## Cierre

Este expediente es una base de control documental para preparar la revisión normativa. No sustituye la confirmación de la norma aplicable, el análisis de riesgos, la validación del software ni las aprobaciones requeridas. Su función es dejar claro qué existe, qué está en investigación, qué puede publicarse y qué debe permanecer bloqueado hasta contar con evidencia suficiente.
