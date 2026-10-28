# Icono e identidad de distribución — SISAP-TUS / SISAP by CENIVRA

Procedencia, licencia y modo de regeneración del recurso gráfico del producto.

---

## Ficha del recurso

| Campo | Valor |
|---|---|
| **Nombre del recurso** | *Traza de seguimiento* (icono de SISAP) |
| **Identificador** | `sisap` |
| **Versión del recurso** | 1.0.0 |
| **Fecha de generación** | 2026-09-30 |
| **Autoría** | CENIVRA — SISAP by CENIVRA (autor de referencia: Lauro Gutiérrez Castro, CENIVRA) |
| **Fuente** | Generado íntegramente por `scripts/generar_icono.py` (geometría original definida en ese script) |
| **Licencia** | Propia del proyecto. Se distribuye con el repositorio bajo **MIT** (Copyright (c) 2026 CENIVRA). |
| **Marca** | El icono es un recurso original del proyecto; no reproduce marcas de terceros. |

## Declaración de originalidad

**No se usaron recursos de terceros.** No se copiaron, trazaron ni aproximaron
logotipos, iconos, pictogramas, *cliparts* ni fuentes de iconos de ningún
origen. Toda la geometría son cinco puntos, tres círculos y un grosor de trazo,
definidos en `scripts/generar_icono.py` y en ningún otro sitio. No hay texto,
letras ni iniciales dentro del recurso.

## Qué es el icono

Morfología de **señal longitudinal sobre una retícula discreta de puntos de
medición**:

- una **traza escalonada ascendente** (*sample-and-hold*: valor retenido entre
  muestras), que representa el seguimiento de una serie a lo largo del tiempo;
- **tres puntos sólidos**, uno por cada punto de medición de la retícula
  discreta;
- sin cruz médica, sin símbolos de botiquín y sin simbolismo médico genérico.

### Por qué la geometría es sólo esto

El icono se verifica también a **16 px**. Un cuarto punto de medición se
fusionaría con sus vecinos a ese tamaño y el recurso se vería como una mancha,
así que la geometría se mantiene deliberadamente en tres niveles, tres puntos y
un grosor de trazo grueso (12 % del lienzo). La misma geometría —una sola— se
usa para el máster vectorial y para todos los derivados.

### Contraste (claro y oscuro)

El trazo es un azul medio elegido para maximizar el mínimo de los dos
contrastes de luminancia WCAG. Para una tinta única el mejor equilibrio posible
ronda 4,08:1 contra ambos fondos; este recurso queda por encima de 3,9:1 en los
dos sentidos:

| Medición | Valor |
|---|---|
| Color del trazo | `#2E7CD6` |
| Luminancia relativa del trazo | 0,1985 |
| Contraste del trazo contra blanco (`#ffffff`) | **4,23:1** |
| Contraste del trazo contra oscuro (`#1e1e1e`) | **3,95:1** |
| Mínimo de los dos | 3,95:1 (umbral exigido: 3,0:1) |

El propio generador calcula estas razones, las imprime y **aborta** si el mínimo
baja de 3,0:1. La hoja de contacto
(`assets/branding/hoja_de_contacto.png`) permite la revisión visual humana a
tamaño real y ampliado, sobre fondo claro y oscuro.

## Inventario de archivos

### `assets/branding/` — máster y procedencia (se versiona)

| Archivo | Qué es |
|---|---|
| `icono_master.svg` | **Máster vectorial** (`viewBox 0 0 256 256`). Fuente de verdad formal del recurso. |
| `hoja_de_contacto.png` | Hoja de revisión: el icono a tamaño real y ampliado ×8, sobre blanco y sobre `#1e1e1e`. |
| `LEEME.md` | Este documento. |

### `assets/icons/` — derivados ráster (se versionan)

| Archivo | Qué es |
|---|---|
| `sisap_16.png` … `sisap_256.png` | PNG con transparencia a 16, 24, 32, 48, 64, 128 y 256 px. |
| `sisap.ico` | Icono de Windows con **7 tamaños embebidos**: 16, 24, 32, 48, 64, 128 y 256 px. |

## Cómo se regenera

```bash
python scripts/generar_icono.py          # escribe máster, PNG, .ico y hoja de contacto
python scripts/generar_icono.py --check  # no escribe; sólo comprueba el contraste
```

El generador es **reproducible**: dos ejecuciones producen bytes idénticos
(no se incrustan marcas de tiempo en los PNG ni en el `.ico`), y escribe la
geometría una sola vez. La salida de `--check` informa las dos razones de
contraste.

## Dependencia de construcción (no de la aplicación)

El generador necesita una biblioteca de imagen para rasterizar:

| Herramienta | Versión usada | Licencia | Papel |
|---|---|---|---|
| **Pillow** | 12.3.0 | MIT-CMU | **Dependencia de construcción.** Rasteriza el máster a PNG y compone el `.ico` y la hoja de contacto. |
| **PyInstaller** | 6.22.3 | GPL-2.0-or-later con excepción (bootloader) | Herramienta de construcción del ejecutable (ver `docs/16_desktop_and_packaging/`). |

**Ninguna de las dos es dependencia de la aplicación.** El producto no importa
Pillow ni PyInstaller en tiempo de ejecución; sólo se usan para construir. Si
falta Pillow, el generador se detiene con un mensaje explícito.

## Estado

- **DISEÑADO** — morfología, doble contraste y licencia definidos aquí.
- **IMPLEMENTADO** — generador, máster SVG, 7 PNG, `.ico` de 7 tamaños y hoja de
  contacto, presentes en disco.
- **VERIFICADO** — contraste calculado e impreso (4,23:1 / 3,95:1); directorio
  interno del `.ico` leído y con 16/32/48/256 presentes; regeneración
  bit-a-bit idéntica; sin texto ni marcas de terceros.
- **PENDIENTE** — decisión del titular sobre si este recurso se declara marca
  del proyecto; y la firma de código de los binarios que lo embeben (ver
  `docs/16_desktop_and_packaging/README.md`).
