# SISAP — Propuesta de interfaz de usuario

| Campo | Valor |
| --- | --- |
| Versión | 0.1 · edición pública depurada |
| Estado | **Propuesta; no aprobada ni comprometida para implementación** |
| Fecha | 2026-09-30 |
| Aprobación | Pendiente del propietario del proyecto |

> Esta propuesta resume oportunidades de interfaz con lenguaje propio. No reproduce manuales,
> capturas ni contenido de instrumentos de terceros. Las fuentes externas deben citarse mediante sus
> páginas oficiales; el corpus descargado de investigación no forma parte de esta publicación.

## Relación con la interfaz existente

El [registro de diseño de interfaz](../README.md) describe la implementación y sus decisiones actuales.
Esta propuesta no es una auditoría de código ni declara que las ideas aquí descritas estén implementadas.
Se plantea como trabajo futuro y debe reconciliarse con los requisitos formales antes de construir.

## Dirección propuesta

Mantener una experiencia centrada en el registro y la tarea autorizada. La trayectoria de una persona,
cuando esté disponible y permitida por los requisitos, puede organizar la navegación longitudinal. Las
vistas agregadas no deben desplazar el trabajo individual ni sugerir una precisión que los datos no tienen.

Posibles componentes a evaluar:

| Componente | Objetivo | Condición previa |
| --- | --- | --- |
| Trayectoria | Revisar eventos y medidas en el tiempo | Datos con procedencia, fecha y compatibilidad documentadas |
| Detalle de evidencia | Consultar fuente y transformaciones | Fuente disponible y permiso de acceso comprobado |
| Tarjeta de interpretación | Separar evidencia, interpretación y limitaciones | Salida definida, revisada y aprobada para el uso previsto |
| Registro de decisión humana | Documentar la decisión del profesional por separado | Roles, auditoría y persistencia especificados |
| Comparación | Revisar dos mediciones compatibles | Regla de comparabilidad aprobada; bloquear comparaciones no válidas |

Estos componentes no autorizan diagnósticos, predicciones, alertas, umbrales ni recomendaciones nuevas.

## Estados mínimos

Diseñar y verificar estados distintos para vacío, cargando, error, dato no disponible y permiso limitado.
No reutilizar un estado técnico como mensaje clínico; no presentar la falta de datos como cero o como ausencia
de riesgo.

## Restricciones de diseño

- Mantener la coherencia con el stack y los componentes documentados en el diseño implementado.
- No añadir bibliotecas o dependencias sin una decisión de arquitectura.
- No inventar contenido clínico, datos de demostración ni umbrales para completar una pantalla.
- Preservar autorización y mínimo privilegio en servidor; ocultar un control no sustituye el control de acceso.
- Diseñar alternativas textuales y por teclado; verificar contraste y foco en cada estado.
- Utilizar datos sintéticos claramente identificados en prototipos públicos.

## Criterios para pasar a implementación

1. Trazar cada componente a un requisito aprobado y a sus riesgos.
2. Confirmar que los servicios existentes proveen los datos y estados requeridos.
3. Revisar licencias de fuentes, instrumentos, iconos, imágenes y demás activos.
4. Validar tareas con usuarios previstos sin usar información clínica identificable.
5. Documentar decisiones, pruebas y aprobación antes de actualizar el diseño de referencia.

## Referencias del proyecto

- [Diseño de interfaz implementado y sus límites](../README.md)
- [Uso previsto](../../00_intended_use/intended_use.md)
- [Requisitos de software](../../02_requirements/SRS.md)
- [Gestión de riesgos](../../07_risk_management/Software_Risk_Management_File.md)
- [Tokens implementados](../../../assets/app.css)
