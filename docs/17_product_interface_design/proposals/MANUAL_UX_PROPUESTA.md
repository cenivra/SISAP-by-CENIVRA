# SISAP — Manual UX (propuesta pública)

| Campo | Valor |
| --- | --- |
| Versión | 1.1 · edición pública depurada |
| Estado | **Borrador de trabajo; no aprobado y no baseline de implementación** |
| Fecha | 2026-09-30 |
| Aprobación | Pendiente del propietario del proyecto y de las revisiones aplicables |

> Este documento propone criterios de experiencia de usuario. No establece requisitos clínicos,
> umbrales, autorizaciones, diagnósticos ni declaraciones regulatorias. En caso de conflicto,
> prevalecen el uso previsto y los requisitos controlados del proyecto.

## Propósito y alcance

La interfaz debe ayudar al personal autorizado a revisar información registrada y su procedencia,
comprender qué parte es transformación o interpretación del sistema y documentar su propio juicio.
Esta propuesta cubre presentación e interacción; no modifica scoring, modelo, política clínica,
seguridad, persistencia ni permisos.

El registro del diseño actualmente implementado está en [Diseño de interfaz de producto](../README.md).
Esta propuesta no lo reemplaza ni afirma que las superficies siguientes ya existan.

## Principios

| Principio | Aplicación en interfaz |
| --- | --- |
| La tarea y la persona primero | Organizar el trabajo alrededor del registro autorizado de la persona, no de métricas agregadas o de tarjetas de IA. |
| Evidencia antes que interpretación | Hacer visible la fuente y el periodo del dato antes de presentar una interpretación. |
| Separar observación e inferencia | No representar una inferencia como dato observado, diagnóstico, causalidad o certeza. |
| Juicio humano explícito | Una decisión clínica pertenece a la persona autorizada; no se atribuye a una salida automática. |
| Acceso mínimo | La interfaz respeta los permisos del sistema; revelar más detalle no concede permisos adicionales. |
| Accesibilidad verificable | El significado no depende solo del color; contraste, teclado, foco y alternativas textuales se verifican antes de liberar. |

## Vocabulario de procedencia

| Etiqueta | Significado | No implica |
| --- | --- | --- |
| Reportado | Dato recibido de una fuente identificada | Que sea una verdad clínica confirmada |
| Calculado | Transformación reproducible de entradas conocidas | Una interpretación clínica |
| Inferido | Interpretación producida por el sistema | Diagnóstico, riesgo, causalidad o certeza |
| Pendiente | Dato esperado que no está disponible o no se ha resuelto | Un estado clínico |

Las etiquetas solo se usan si el dato y su fuente lo permiten. Si la procedencia es desconocida, se indica
esa limitación en vez de asignar una categoría por inferencia.

## Superficies propuestas

Estas superficies son hipótesis de diseño que requieren especificación, autorización y validación antes
de implementarse:

- **Trayectoria:** ordenar eventos conservando la precisión temporal disponible; no inventar fechas,
  continuidad ni comparabilidad.
- **Detalle de evidencia:** permitir consultar la fuente, el periodo y las transformaciones documentadas.
- **Interpretación:** mostrarla separada de la evidencia, junto con limitaciones y disponibilidad.
- **Decisión humana:** registrar por separado la decisión de una persona autorizada y la salida del sistema.

No se muestran puntuaciones de riesgo, umbrales o alertas nuevos por decisión visual. Cada resultado
requiere una definición formal y evidencia aprobada fuera de este manual.

## Estados de interfaz

La interfaz debe distinguir los estados de interacción (por ejemplo, cargando, error o permiso limitado)
de los estados del dato y de cualquier estado clínico. Un fallo, ausencia o falta de permiso no se
representa como valor cero ni como resultado normal.

## Requisitos previos a aprobación

1. Reconciliar cada comportamiento propuesto con el [uso previsto](../../00_intended_use/intended_use.md)
   y el [SRS](../../02_requirements/SRS.md).
2. Validar permisos, procedencia y estados con los documentos de seguridad y riesgo aplicables.
3. Revisar lenguaje y flujos con especialistas y usuarios previstos antes de tratarlos como diseño aprobado.
4. Verificar accesibilidad con pruebas, no solo con declaraciones de intención.
5. Registrar las decisiones del propietario y actualizar este estado solo tras su aprobación.

## Referencias del proyecto

- [Uso previsto](../../00_intended_use/intended_use.md)
- [Requisitos de software](../../02_requirements/SRS.md)
- [Gestión de riesgos](../../07_risk_management/Software_Risk_Management_File.md)
- [Diseño de interfaz actualmente documentado](../README.md)
