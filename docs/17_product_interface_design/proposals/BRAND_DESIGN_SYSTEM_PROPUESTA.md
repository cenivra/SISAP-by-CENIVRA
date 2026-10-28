# SISAP — Brand & Design System (propuesta pública)

| Campo | Valor |
| --- | --- |
| Versión | 1.1 · edición pública depurada |
| Estado | **Borrador de trabajo; no aprobado y no baseline visual** |
| Fecha | 2026-09-30 |
| Aprobación | Pendiente del propietario del proyecto |

> Este documento no concede derechos sobre marcas, nombres, logotipos, tipografías o activos de terceros.
> No afirma que el nombre, el logotipo ni una paleta estén registrados o aprobados.

## Propósito

Proponer principios para que las decisiones visuales de SISAP sean coherentes, legibles y accesibles,
sin convertir una salida exploratoria en una afirmación clínica. Esta propuesta no reemplaza el sistema
visual que el proyecto ya documenta para la interfaz implementada en [Diseño de interfaz de producto](../README.md)
y en [assets/app.css](../../../assets/app.css).

## Estado de las decisiones

| Decisión | Estado público |
| --- | --- |
| Nombre de producto y uso de marca | Pendiente de aprobación y revisión de propiedad intelectual |
| Logotipo y variantes | Propuesta; no declarar como identidad oficial sin aprobación y confirmación de derechos |
| Paleta de marca | Pendiente; no sustituir ni duplicar tokens implementados hasta decidir la dirección visual |
| Tipografías | Mantener la referencia de implementación existente mientras se evalúa cualquier cambio |
| Tokens de interfaz | La implementación vigente se consulta en `assets/app.css`; este documento no establece nuevos valores |

El nombre en este documento es una referencia de trabajo al proyecto. No constituye una búsqueda de
anterioridades ni una autorización de uso comercial.

## Principios visuales propuestos

- La identidad no debe sugerir diagnóstico, predicción, vigilancia o eficacia terapéutica no demostrada.
- El color de marca no debe funcionar como señal clínica ni sustituir etiquetas textuales.
- Los colores semánticos y los estados de producto deben derivarse de contratos aprobados, no de decisiones
  de marca aisladas.
- Tipografía, densidad y componentes deben conservar coherencia con la aplicación existente hasta que el
  propietario apruebe una migración documentada.
- Los activos externos se incorporan solo tras verificar licencia, atribución y forma de distribución.

## Accesibilidad y verificación

La accesibilidad es un criterio de aceptación, no una propiedad que se presume por la paleta. Antes de
aprobar componentes, verificar contraste de cada combinación real, foco visible, uso por teclado,
semántica, alternativas no cromáticas y comportamiento con ampliación de texto.

Los resultados de esas verificaciones deben quedar asociados a componentes concretos. Este documento
no declara que una paleta o una interfaz ya cumpla WCAG.

## Aprobación

Antes de convertir esta propuesta en fuente visual oficial:

1. Resolver las decisiones de nombre, logo, paleta y tipografía.
2. Confirmar titularidad y licencias de cada activo que se vaya a distribuir.
3. Comparar la propuesta con la interfaz implementada y documentar cualquier migración.
4. Verificar accesibilidad en la interfaz real.
5. Registrar aprobación del propietario y actualizar el estado de este documento.

## Referencias del proyecto

- [Diseño de interfaz actualmente documentado](../README.md)
- [Tokens visuales implementados](../../../assets/app.css)
- [Uso previsto](../../00_intended_use/intended_use.md)
