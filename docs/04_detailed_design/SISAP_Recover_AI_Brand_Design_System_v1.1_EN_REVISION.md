# SISAP by CENIVRA — Brand & Design System

| Campo | Valor |
|---|---|
| **Versión** | v1.1 |
| **Estado** | **EN REVISIÓN** — no aprobado, no "final", no publicable |
| **Fecha de esta revisión** | 2026-09-20 |
| **Origen** | Revisión del paquete recibido de tercero: `00_RECIBIDO_EXTERNO_2026-09-20_EN_REVISION/SISAP_Recover_AI_Brand_Design_System_v1_FINAL.md` |
| **Base de contenido** | El documento recibido. Esta revisión **no reescribe el fondo**: reordena, numera las reglas, corrige lo demostrablemente incorrecto y documenta lo que no se pudo verificar. |
| **Edita** | Hermes (agente), a solicitud del propietario |
| **Aprueba** | **PENDIENTE** — propietario del proyecto. Sin firma, ninguna regla de este documento es vigente. |
| **Documento relacionado que NO se modifica** | `SISAP_Dashboard_InstitucionalPublic (2).html`, `SISAP_Recover_AI_Brand_Product_System_.pptx` (congelados por decisión del propietario) |

---

## 0. Cómo leer este documento

### 0.1 Etiquetas de intervención

Cada regla lleva una etiqueta de estado. Sirven para que el propietario sepa de un vistazo qué
puede aprobar sin pensar y qué requiere su decisión.

| Etiqueta | Significado |
|---|---|
| `CONSERVAR` | Texto y decisión del documento recibido, sin cambios de fondo. Solo se renumeró y se le dio identificador. |
| `CONSERVAR / consolidado` | Repetido en varios capítulos del documento recibido; aquí se declara **una vez** y se referencia por identificador. |
| `VERIFICAR` | Afirmación que necesita comprobación externa. **No se modificó.** |
| `CORREGIR` | Error demostrable, con la evidencia de la corrección al lado. |
| `DE-V1` | Decisión del documento recibido que sigue en pie como hipótesis de trabajo. |
| `DECISIÓN DEL PROPIETARIO` | **No la resuelve este documento.** Se presenta el conflicto y sus consecuencias; elige el propietario. |

### 0.2 Qué cambió respecto al documento recibido

1. **Arquitectura de reglas.** Se eliminó la cascada de `**REGLA:**` en prosa y se sustituyó por
   identificadores estables por dominio (`COL-04`, `TIP-02`, `AIC-07`…). Una regla = una afirmación
   verificable. El índice completo es la §21 y se escanea en dos minutos.
2. **Numeración y anexos.** Los anexos van en orden A→B→C→D. El documento recibido los tenía
   D → (cierre) → A → B → C, con **dos bloques de cierre distintos**.
3. **Afirmaciones repetidas.** La cadena `Trayectoria → Evidencia → Interpretación → Incertidumbre →
   Decisión humana` aparecía **6 veces** (caps. 15.1, 15.2, 16.1, 16.2, 18.1, 19.2 y Anexo C). Aquí se
   declara una vez (`EPI-01`) y se referencia.
4. **Citas.** El documento recibido tenía **0 URLs, 0 DOIs y 0 citas autor-año en 53 KB**. Las reglas
   que dependen de una fuente externa ahora la llevan (§22).
5. **Correcciones demostrables**: `CORREGIR-01` a `CORREGIR-05` (§5).

### 0.3 Advertencia de alcance

Este documento define **cómo se ve, cómo suena y cómo se etiqueta** la identidad de SISAP. No
define qué información aparece en cada momento, ni cómo se registra una decisión clínica: eso vive
en el Manual UX y en los documentos del proyecto. Ninguna regla de aquí puede convertir una salida
incierta del sistema en una salida aparentemente cierta.

---

## 1. Registro de reconciliación con los artefactos del proyecto

**Hallazgo principal de esta revisión.** El documento recibido presenta su paleta y su tipografía
como decisiones tomadas "sobre la evidencia disponible", pero **no consultó los artefactos de
identidad e interfaz que el proyecto ya tenía**, producidos un día antes (2026-09-19). Hay **tres
paletas y tres tipografías** en juego, y ninguna de las tres coincide.

### 1.1 Evidencia (verificado en disco, 2026-09-20)

| Artefacto | Fecha | Tokens / valores declarados |
|---|---|---|
| `assets/app.css` (48 362 B) — **lo implementado** | 2026-09-19 14:06 | `--surface-page:#0b1120` · `--surface:#131d33` · `--primary:#2d8cf0` · `--success:#10b981` · `--warning:#f59e0b` · `--high:#f97316` · `--danger:#f43f5e` · `--info:#38bdf8` · `--text:#e8edf7` · **`--font-ui:'Sora'`** · **`--font-mono:'JetBrains Mono'`** · `--fs-body:13px` · `--fs-meta:11px` · `--fs-micro:10px` · `--fs-page-title:18px` · espacio 4/8/12/16/24/32 |
| `docs/17_product_interface_design/README.md` (22 066 B) | 2026-09-19 15:01 | Paradigma **_detail-first_**; **`dashboard` descartado explícitamente**; densidad **productiva** (contenido 16/20 px); iconografía Font Awesome 6 ya empaquetada; componentes renombrados (`work_rail`, `status_strip`, `work_queue`, `disclosure`…) |
| `app/ui/DISEÑO_UI_SPECIFICACION.md` (46 903 B) | 2026-09-19 14:53 | Especificación de UI del proyecto (**no leída en profundidad en esta revisión**) |
| `sisap_recover_ai_logo_propuesta_1.svg` (23 408 B) | 2026-09-19 18:55 | **`#0B2239`** ×14 · **`#1FB5A8`** ×11 · `#0B3C5D` ×7 · `#FFFFFF` ×19 |
| `identidad_visual_sisap.html` (11 743 B) | 2026-09-19 18:58 | `#0B2239` · `#0B3C5D` · `#1FB5A8` · `#64748b` · `#e2e8f0`; `font-family: 'Segoe UI', Roboto, Helvetica, Arial` |
| **Documento recibido** (Brand System v1) | 2026-09-20 17:53 | `color.brand.primary:#123C56` · `color.brand.secondary:#B5623A` · `neutral.bg:#FAF8F5` · **IBM Plex Sans / IBM Plex Mono** · base **≥16 px** |

### 1.2 Los tres conflictos

| # | Conflicto | Consecuencia si no se resuelve |
|---|---|---|
| **C-1** | **Paleta.** Recibido: azul profundo `#123C56` + terracota `#B5623A` sobre fondo claro `#FAF8F5`. Implementado: tema oscuro `#0b1120` + azul `#2d8cf0`. Logo del proyecto: navy `#0B2239` + **teal** `#1FB5A8`. | El logo existente **no está en la paleta que el manual declara como marca**; el manual además descarta el azul+teal llamándolo "código saturado del sector", sin saber que ese teal es el color del logo del propio proyecto. |
| **C-2** | **Tipografía.** Recibido: IBM Plex Sans (+ Mono). Implementado: Sora + JetBrains Mono, **autoalojadas** en `assets/fonts/` (10 archivos `.woff2` + `fonts.css`). | Adoptar IBM Plex obliga a empaquetar y versionar dos familias nuevas; la regla del documento recibido ("una sola familia… consistencia real de sistema") ya se cumple con el par Sora + JetBrains Mono. |
| **C-3** | **Tamaño base.** Recibido: `>= 16 px`, line-height `>= 1.5`. Implementado: cuerpo **13 px**, metadatos 11 px, micro 10 px, con densidad "productiva" documentada y validada visualmente. | **Aplicar la regla recibida rompería la interfaz implementada** y su criterio de densidad. Es una regla de marca que choca con una decisión de producto ya verificada. |
| **C-4** | **Taxonomías epistémicas paralelas.** El recibido formaliza `HECHO / INFERENCIA / HIPÓTESIS / PENDIENTE` (Cap. 1) **y** define `Reportado / Calculado / Inferido / Pendiente` (Cap. 9) como sistema de provenance, sin reconciliarlas. El dashboard mapea de facto: `HECHO→Reportado`, `HIPÓTESIS→Calculado`, `INFERENCIA→Inferido`, `PENDIENTE→Pendiente`. | Dos vocabularios para cuatro casillas, con los mismos colores. Un lector nuevo no puede saber cuál es el canónico, y un desarrollador puede implementar el mapeo al revés. |

### 1.3 Estado de cada conflicto

Los cuatro quedan como **`DECISIÓN DEL PROPIETARIO`** (D-01 a D-04, §20). Este documento **no elige
paleta, tipografía ni tamaño base**: presenta el conflicto con evidencia y las consecuencias
técnicas de cada opción.

---

## 2. Dominio ESQ — Esencia, posicionamiento y voz

| ID | Regla | Estado |
|---|---|---|
| `ESQ-01` | Ningún texto de marca, producto, deck o paper usa un verbo de certeza para una salida del modelo: **"sugiere"**, nunca "diagnostica" o "predice". | `CONSERVAR` |
| `ESQ-02` | Las etiquetas de estado de evidencia son elemento de marca y se conservan en todo material nuevo. **Ver `EPI-03` para la ambigüedad de vocabulario pendiente de resolver.** | `CONSERVAR` + `VERIFICAR` |
| `ESQ-03` | Territorio de marca: **Trayectoria**, con **Evidencia** como principio de soporte. **Acompañamiento** y **Capas** siguen operando como principios de interfaz y de tono, sin ser la metáfora visual principal. | `DE-V1` |
| `ESQ-04` | Cuatro registros de voz sin cambios: Científico (papers, posters: formal, cita todo) · Clínico (producto: claro, lenguaje de asociación) · Institucional (sitio, instituciones: claro, honesto sobre el estado de la evidencia) · Inversión (decks: confianza, sin exceder la evidencia). | `CONSERVAR` |
| `ESQ-05` | Ante conflicto, **una regla editorial o regulatoria gana siempre sobre una regla de marca**. | `CONSERVAR / consolidado` (aparecía en Cap. 13 y en Cap. 20.2) |

---

## 3. Dominio LEN — Lenguaje ético y no estigmatizante

| ID | Regla | Estado |
|---|---|---|
| `LEN-01` | Lenguaje persona-primero siempre: "persona con TUS". Prohibido: "adicto/a" como sustantivo, "limpio/sucio", metáforas de lucha o guerra, sustantivar la condición, y lenguaje de "perfil/cluster/tipo" aplicado a una persona. | `CONSERVAR` |
| `LEN-02` | Aplicar el glosario ES-MX del Anexo E. Es **adaptación** de la fuente NIDA, no una traducción literal: tres filas se desvían de la fuente. | `CORREGIR-05` |
| `LEN-03` | El glosario **no está validado** con los psicólogos de las comunidades terapéuticas de SISAP. Se usa para producir; la validación corre en paralelo y no bloquea producción. | `CONSERVAR` |
| `LEN-04` | El contexto (vivienda, empleo, familia, red de apoyo, situación financiera, entorno, acceso al tratamiento) **no se convierte automáticamente en riesgo, pronóstico, adherencia, motivación ni eficacia**. | `CONSERVAR` |

**Fuente de la regla LEN-01/LEN-02** (verificada 2026-09-20):
*Words Matter: Terms to Use and Avoid When Talking About Addiction*, National Institute on Drug
Abuse (NIDA), 21 de junio de 2021 —
<https://nida.nih.gov/research-topics/addiction-science/words-matter-preferred-language-talking-about-addiction>
y folleto <https://nida.nih.gov/sites/default/files/nidamed_words_matter_terms.pdf>.

---

## 4. Dominio LOG — Logo y símbolo

| ID | Regla | Estado |
|---|---|---|
| `LOG-01` | Requisitos técnicos: legible a 16×16 px, funcional a 1024×1024 px, versión monocromática/B&N disponible, contraste ≥3:1, funciona igual en español e inglés. | `CONSERVAR` |
| `LOG-02` | Anti-patrón: prohibido cerebro con circuitos, redes neuronales literales o cualquier símbolo que sugiera vigilancia o diagnóstico automático. | `CONSERVAR` |
| `LOG-03` | Dirección: **wordmark + símbolo abstracto**. Se elige sobre wordmark puro porque SISAP necesita símbolo independiente en favicon, ícono de app y marca de agua. | `DE-V1` |
| `LOG-04` | Concepto del símbolo: **trayectoria en capas** — líneas horizontales apiladas que convergen en una línea ascendente; geometría pura, sin pictograma reconocible. | `DE-V1` |
| `LOG-05` | Lockup: **"SISAP"** con el peso visual principal; **"Recover AI"** como descriptor secundario, menor tamaño y peso. | `CONSERVAR` |
| `LOG-06` | Cómo se valida (no bloquea producción): encuesta a mentores/inversionistas (N≥20) sobre 2–3 ejecuciones antes del Demo Day; si no hay tiempo, se produce con esta dirección y se ajusta **ejecución**, no concepto. | `CONSERVAR` |
| `LOG-07` | **Estado real del logo en el proyecto.** Existe `sisap_recover_ai_logo_propuesta_1.svg` (2026-09-19) en navy `#0B2239` + teal `#1FB5A8`, más `sisap_logo_exploration_sheet.png` y `sisap_identity_presentation_board.png`. | `CORREGIR-03` |

---

## 5. Correcciones demostrables

| ID | Qué decía el documento recibido | Qué dice la evidencia | Acción |
|---|---|---|---|
| `CORREGIR-01` | *"Arquitectura de tokens, estándar W3C DTCG 2025.10 (versión estable, no preliminar)"* | La versión **2025.10 existe** y es un **Final Community Group Report (28-oct-2025)** — por tanto "no preliminar" es defendible. Pero la propia especificación declara: *"It is not a W3C Standard nor is it on the W3C Standards Track."* No es un estándar W3C. El borrador vivo (`tr.designtokens.org`) añade: *"Do not attempt to implement this version of the specification. Do not reference this version as authoritative in any way."* | Reescribir como: **"Formato basado en el Design Tokens Format Module 2025.10 del Design Tokens Community Group (Final Community Group Report, 28-oct-2025). No es un estándar W3C ni está en la vía de estándares."** |
| `CORREGIR-02` | Anexo B, JSON de tokens: `"easing": {"$value": "ease-out", "$type": "cubicBezier"}` | El módulo DTCG establece para `cubicBezier`: *"The value MUST be an array containing four numbers."* Una cadena `"ease-out"` no es conforme. Además, `ratio` y `dimension[]` no figuran entre los tipos definidos (Color, Dimension, Font family, Font weight, Duration, Cubic Bézier, Number); la §8.8 admite tipos adicionales, pero entonces no pueden presentarse como el estándar cargado. | Corregir el JSON del Anexo B. Los tipos adicionales se conservan pero se declaran como **extensión local**, no como tipo DTCG. |
| `CORREGIR-03` | El manual define paleta y tipografía de marca sin mencionar que el proyecto ya tenía identidad visual y logo. | Ver §1.1 (cinco artefactos del 2026-09-19, uno de ellos `assets/app.css` implementado). | Conflicto declarado en §1.2 y elevado a `D-01`/`D-02`/`D-03`. |
| `CORREGIR-04` | El documento recibido **no tiene una sola cita** (0 URLs, 0 DOIs, 0 citas autor-año en 53 KB) pese a declarar *"REGLA: Científico — papers, posters: formal, **cita todo**"*. | Medición propia sobre el archivo recibido. | Cada regla que depende de fuente externa la lleva ahora (§22). |
| `CORREGIR-05` | Glosario: *"recaída (como fracaso) → reingreso a tratamiento / continuidad de cuidado"* y *"limpio/sucio → en abstinencia / con consumo reciente"*, presentado como *"construido sobre la guía oficial de NIDA en inglés, traducida y adaptada"*. | Las correspondencias de NIDA son: *relapse* → **"return to use"** / *treatment failure* → **"treatment attempt"**; y *clean/dirty* → **"negative or positive urine drug test"**. La adaptación del documento recibido **no coincide** con las de la fuente. | `CONSERVAR` el glosario como propuesta ES-MX, pero **declararlo adaptación con desviaciones**, no "traducción de la guía NIDA". La validación pendiente (Estudio 7) es la que decide el término final. |

**Fuente de la verificación DTCG** (consultada 2026-09-20):
<https://www.designtokens.org/TR/2025.10/format/> (Final Community Group Report, 28-oct-2025) ·
<https://tr.designtokens.org/format/> (borrador vivo).

---

## 6. Dominio COL — Color

| ID | Regla | Estado |
|---|---|---|
| `COL-01` | Contraste ≥4.5:1 texto normal, ≥3:1 texto grande y componentes no textuales (WCAG 2.2 AA). Ningún estado semántico depende solo del color. Máximo 5–7 categorías por gráfico. Rojo intenso solo para alertas críticas. | `CONSERVAR` |
| `COL-02` | Dirección: azul profundo + terracota, elegida sobre azul+teal y sobre azul+verde. | `DE-V1` **sujeto a `D-01`** |
| `COL-03` | Tokens v1: `color.brand.primary #123C56` (rigor, headers, botones primarios) · `color.brand.secondary #B5623A` (calidez, acentos, **nunca estados de sistema**) · `color.semantic.success #2F9E63` · `color.semantic.warning #E8A33D` (deliberadamente más amarillo y claro que el terracota) · `color.semantic.error #C6483F` (solo alertas críticas) · `color.neutral.bg #FAF8F5` · `color.neutral.bg.dark #12171C`. | `DE-V1` **sujeto a `D-01`** |
| `COL-04` | **Estos valores son punto de partida de producción, no hallazgo cerrado.** Verificar cada combinación con una herramienta de contraste real antes de usarla en componentes; no asumir que pasan WCAG en toda combinación. | `CONSERVAR` |
| `COL-05` | El ajuste esperado en V2 es de **tono, no de dirección**: es más probable que se afine el terracota exacto que se abandone azul+terracota. | `DE-V1` |
| `COL-06` | Ningún significado crítico depende solo del color: siempre una segunda señal (texto, ícono, borde, patrón, posición). | `CONSERVAR / consolidado` (Caps. 4, 9, 17.1, 20) |

**Nota de verificación (`VERIFICAR`).** El documento recibido advierte que sus hex no deben asumirse
conformes. La comprobación de contraste **no se realizó** aquí porque la paleta está sujeta a `D-01`.
Si se conserva la dirección recibida, hay que medirla; si se adopta la implementada, la medición ya
existe en el proyecto y debe citarse desde `app.css`.

---

## 7. Dominio TIP — Tipografía

| ID | Regla | Estado |
|---|---|---|
| `TIP-01` | Tamaño base ≥16 px, line-height ≥1.5, máximo dos familias por jerarquía, sin monoespaciada en cuerpo de UI. | `DE-V1` **en conflicto con la implementación — `D-03`** |
| `TIP-02` | Una sola familia en toda la jerarquía, con monoespaciada reservada a tablas de datos densas (puntajes, IDs). Se descarta la combinación serif+sans por ser "convención editorial sin respaldo de legibilidad medido". | `DE-V1` |
| `TIP-03` | Familia propuesta: **IBM Plex Sans** (+ IBM Plex Mono). | `DE-V1` **en conflicto con `app.css` — `D-02`** |
| `TIP-04` | **Atkinson Hyperlegible** disponible como opción de accesibilidad **activable por el usuario, nunca por defecto**. | `CONSERVAR` |
| `TIP-05` | Ajuste esperado en V2: si el volumen de informes clínicos largos resulta alto, se evalúa añadir una serif **solo para documentos largos**, no para toda la interfaz. | `DE-V1` |

---

## 8. Dominio IMG — Iconografía, ilustración y fotografía

| ID | Regla | Estado |
|---|---|---|
| `IMG-01` | **Ninguna imagen de una persona con TUS se genera con IA** — solo fotografía real con consentimiento documentado. | `CONSERVAR` |
| `IMG-02` | Anti-patrones prohibidos: parafernalia visible, escenarios de "antes/después", rostros ocultos, escenarios de justicia penal, personas en sufrimiento. | `CONSERVAR` |
| `IMG-03` | Dirección: ilustración plana geométrica (misma lógica del símbolo) para material público; fotografía real curada y consentida solo para material institucional de una comunidad terapéutica específica, nunca stock genérico. | `DE-V1` |
| `IMG-04` | Recurso inmediato: banco de fotografías **Empathy Lens** (UW ADAI) para pieza que necesite fotografía real. **Verificar la licencia vigente en su sitio antes de usar cada imagen.** | `VERIFICAR` |
| `IMG-05` | Prohibido: mascotas o caritas antropomorfizadas de la IA; iconografía de "cerebro", "circuito" o "IA mágica" (✨) en cualquier componente que muestre salida del modelo. | `CONSERVAR` |

| `IMG-06` | Iconografía de interfaz: un único lenguaje, lineal, geométrico, de bajo detalle; un ícono que no comunica acción, estado ni categoría es ruido. **`DECISIÓN DEL PROPIETARIO D-05`**: el documento recibido no dice qué set usar; el proyecto ya usa **Font Awesome 6** empaquetado y documentado (`docs/17_product_interface_design` §5). | `DE-V1` + `D-05` |

**Fuente IMG-04** (verificada 2026-09-20): *Empathy Lens Image Collection*, University of Washington
Addictions, Drug & Alcohol Institute — <https://adai.uw.edu/> (la colección aparece enlazada desde
el sitio institucional; la ruta directa `/empathylens/` bloquea acceso automatizado, la licencia
debe confirmarse en su página).

---

## 9. Dominio VIS — Visualización de datos y figuras científicas

| ID | Regla | Estado |
|---|---|---|
| `VIS-01` | **La más importante del sistema:** el espacio latente de 12 dimensiones **nunca se muestra crudo en la interfaz clínica**. Se muestran: (1) las 6 escalas de origen (BIS-11, STAXI-2, BADS, BSL-23, GAD-7, EROS) con sus puntajes validados; (2) lenguaje de similitud relativa para estratos, nunca una etiqueta fija tipo diagnóstico; (3) referencia al respaldo científico externo, no a los pesos internos del modelo. | `CONSERVAR` |
| `VIS-02` | Cualquier proyección del espacio latente (PCA, t-SNE, UMAP) es **exclusivamente** para uso técnico interno o para el paper; nunca llega al flujo clínico. | `CONSERVAR` |
| `VIS-03` | Trayectorias longitudinales (T1, T2, T3). La banda de cambio clínicamente significativo (Reliable Change Index) se incorpora **únicamente cuando el RCI esté definido y validado para la escala correspondiente**; mientras no lo esté, la trayectoria se muestra **sin** esa banda, nunca con una banda no sustentada. | `CONSERVAR` |
| `VIS-04` | Resolución ≥300 DPI, vectorial para impresión, paletas colorblind-safe, máximo 5–7 categorías, nunca ejes truncados ni gráficos sin N. | `CONSERVAR` |
| `VIS-05` | Paleta de dataviz: `brand.primary` y `brand.secondary` como extremos de una escala secuencial de dos tonos para trayectorias individuales; paleta categórica separada y verificada como colorblind-safe (p. ej. **Okabe-Ito** o equivalente) para comparaciones de más de dos series. **No reutilizar los colores semánticos de estado como colores de datos.** | `DE-V1` (depende de `D-01`) |
| `VIS-06` | **La incertidumbre es DataViz, nunca Gramática visual de marca.** La Gramática visual (Anexo C) define significado *conceptual*; nunca *cuantitativo*. Incertidumbre, intervalo, error, N y dato faltante se comunican **exclusivamente** mediante banda de rango, línea punteada de continuidad no observada o intervalo explícito — nunca mediante trama de marca ni opacidad decorativa. | `CONSERVAR / consolidado` (Caps. 7, 9, 17.1, Anexo C) |
| `VIS-07` | Guías de reporte a seguir: TRIPOD+AI, DECIDE-AI, CONSORT-AI. | `CONSERVAR` + citas en §22 |

---

## 10. Dominio UI — Fundamentos de interfaz y tokens

| ID | Regla | Estado |
|---|---|---|
| `UI-01` | Targets ≥24×24 px (44×44 recomendado); foco nunca oculto; escala de espaciado base 4 px (4/8/12/16/24/32/48); elevación máx. 3 niveles; motion 150–250 ms, ease-out, nunca >300 ms en flujo clínico. | `CONSERVAR` |
| `UI-02` | Arquitectura de tokens: `primitive/` → `semantic/` → `component/` → `dataviz/` → `accessibility/`. Convención `categoría.grupo.variante.estado`. Ruta a código: Figma Variables → JSON DTCG → Style Dictionary v4 → variables CSS/Swift/Kotlin. | `DE-V1` con la corrección `CORREGIR-01` |
| `UI-03` | **La identidad visual del producto ya está implementada** en `assets/app.css` (superficies, texto, semánticos, tonos clínicos, tipografía, espacio, radio) y documentada en `docs/17_product_interface_design`. Cualquier token nuevo se **añade** a ese sistema; no se crea un sistema paralelo. | `CORREGIR-03` |

---

## 11. Dominio AIC — Sistema visual de los componentes de IA clínica

> Este dominio define **solo la forma**. Qué información aparece en cada momento, qué dispara una
> confirmación o cómo se registra un desacuerdo clínico es UX/producto y vive en el Manual UX.

| ID | Regla | Estado |
|---|---|---|
| `AIC-01` | **Anatomía de la etiqueta de origen.** Chip pequeño, siempre junto al valor que etiqueta, nunca solo por color: `Reportado ●` (borde primary 20 %) · `Calculado ▱` (borde secondary 20 %) · `Inferido ◐` (borde punteado, texto secundario en itálica) · `Pendiente ○` (borde discontinuo tenue, sin énfasis). El estilo punteado/itálica de "Inferido" es deliberado: todo lo que viene del modelo se ve **menos categórico** que un dato observado. | `CONSERVAR` |
| `AIC-02` | El glifo es un **ancla semántica, no el significado completo**. La etiqueta de texto sigue siendo la fuente de verdad; el glifo nunca aparece solo cuando la distinción es clínicamente relevante. | `CONSERVAR / consolidado` (Caps. 9 y 17.1) |
| `AIC-03` | Jerarquía tipográfica dentro de una tarjeta de resultado: título 16 px/semibold · cuerpo 16 px/regular · metadato 13 px/regular en color secundario · etiqueta de origen 12 px/medium, mayúsculas, tracking amplio. **Escala sujeta a `D-03`.** | `DE-V1` |
| `AIC-04` | Espacio y elevación de tarjeta de IA: elevación "raised", radio 8 px, padding interno 16 px (`spacing.4`), separación entre tarjetas 12 px (`spacing.3`). | `CONSERVAR` |
| `AIC-05` | Color **por capa, no por contenido clínico**: la capa "resumen" usa acento primary; la capa "fundamento" usa un tratamiento más neutro (gris/texto secundario), porque el fundamento es referencia externa y no una afirmación con el mismo peso que el resumen. | `CONSERVAR` |
| `AIC-06` | Nunca en este sistema visual: un gráfico, mapa de calor o proyección que represente el espacio latente de 12 dimensiones. | `CONSERVAR` |
| `AIC-07` | Todo `ClinicalInsight` debe poder leerse como: qué se observa → de qué evidencia proviene → cómo se obtuvo → en qué ventana temporal → qué limitaciones existen → qué incertidumbre permanece → quién decide. | `CONSERVAR / consolidado` (Caps. 18.1, 16, 17.3) |
| `AIC-08` | La decisión humana tiene identidad visual y verbal propia y se distingue de una inferencia, de una alerta, de un estado del sistema y de una recomendación automática: `SISAP → interpreta / muestra` · `HUMANO → valora / decide / documenta`. | `CONSERVAR` |
| `AIC-09` | El desacuerdo humano no se representa como "error del usuario" ni reescribe retroactivamente el insight original. | `CONSERVAR` |

---

## 12. Dominio EPI — Identidad epistémica (provenance, contexto, temporalidad)

| ID | Regla | Estado |
|---|---|---|
| `EPI-01` | **Gramática de identidad (declaración única).** SISAP comunica cómo se relacionan los niveles de información: `PERSONA → TRAYECTORIA → EVENTOS/CONTEXTO → EVIDENCIA → INTERPRETACIÓN → INCERTIDUMBRE → DECISIÓN HUMANA`. No comunica `IA → RESPUESTA → ACCIÓN`. La IA es una capacidad del sistema, no el protagonista narrativo. | `CONSERVAR / consolidado` — **absorbe 6 repeticiones** de los caps. 15.1, 15.2, 16.1, 16.2, 18.1, 19.2 y Anexo C |
| `EPI-02` | **Evidencia antes que efecto:** ninguna decisión visual, verbal o editorial debe hacer que una interpretación parezca más sólida que la evidencia que la sustenta. | `CONSERVAR` |
| `EPI-03` | Cuando una representación requiera distinguir provenance, debe conservar **etiqueta de texto + distinción visual + distinción no dependiente del color**. No sustituir estas categorías por `AI`, `AI generated`, `prediction` o `confidence` cuando ello altere su significado epistemológico. **Vocabulario exacto: ver `C-4` / `D-04`.** | `CONSERVAR` + `VERIFICAR` |
| `EPI-04` | **Contexto ≠ riesgo.** El contexto se representa como contexto; no se convierte automáticamente en riesgo, pronóstico, adherencia, motivación ni eficacia. | `CONSERVAR / consolidado` (Caps. 17.2, 20.2, Anexo D) |
| `EPI-05` | **La precisión temporal pertenece a la evidencia.** SISAP no comunica más precisión de la que permite la fuente: `fecha y hora exactas` / `fecha` / `semana` / `periodo` / `aproximado` / `desconocido`. No convertir una semana o una fecha aproximada en un punto temporal artificialmente exacto para producir una visualización más limpia. | `CONSERVAR` |
| `EPI-06` | **La trayectoria no significa mejoría.** Una trayectoria representa cambio, evolución o secuencia; no implica progreso, recuperación, deterioro ni éxito. La dirección clínica proviene de la evidencia y de una formulación explícita, no de la presencia de una línea ascendente. | `CONSERVAR` |
| `EPI-07` | **Intersección ≠ causalidad.** Ninguna pieza usa el motivo de intersección para sugerir que una dimensión provoca otra; la proximidad temporal no se representa como causalidad. | `CONSERVAR / consolidado` |
| `EPI-08` | **Misma gramática, distinta profundidad.** La densidad de expresión varía por rol y contexto (consejería compacta · psicología clínica · medicina clínica/pertinente · enfermería compacta/clínica · trabajo social contextual · coordinación resumen · dirección agregada) **sin constituir una submarca**. Un `Inferido` sigue siendo `Inferido` para todos los roles autorizados. | `CONSERVAR / consolidado` |
| `EPI-09` | La expresión institucional favorece información agregada y evita que el diseño produzca una falsa sensación de acceso legítimo a expedientes individuales. No usar mapas, rankings o recursos visuales que faciliten reidentificación cuando no sean necesarios para la tarea. | `CONSERVAR` |

---

## 13. Dominio ACC — Accesibilidad

| ID | Regla | Estado |
|---|---|---|
| `ACC-01` | Objetivo: **WCAG 2.2 AA**. Checklist mínimo por medio: plataforma (contraste 4.5:1/3:1, foco visible, targets ≥24×24 px, sin reingreso de datos, ayuda en posición consistente, autenticación sin pruebas cognitivas) · dashboards (+ tabla de datos alternativa por gráfico) · decks (contraste a 200 % de zoom, alt text) · posters (título de figura 32–40 pt, ejes 28–32 pt, leyendas 24 pt) · papers/figuras (alt text de tendencia y ejes, paletas colorblind-safe). | `CONSERVAR` |
| `ACC-02` | Incluye movimiento reducido (`prefers-reduced-motion`), navegación completa por teclado, lenguaje claro y ningún estado dependiente solo del color. | `CONSERVAR` |
| `ACC-03` | Las distinciones **epistemológicas** no pueden funcionar solo visualmente: la proveniencia siempre es textual. | `CONSERVAR` |

**Base normativa verificada** (2026-09-20): WCAG 2.2 es W3C Recommendation (5-oct-2023, actualización
editorial 12-dic-2024) y fue aprobada como **ISO/IEC 40500:2025** el 21-oct-2025 —
<https://www.w3.org/press-releases/2025/wcag22-iso-pas/>.

---

## 14. Dominio PRE — Presentaciones, decks y posters

| ID | Regla | Estado |
|---|---|---|
| `PRE-01` | Deck de inversión 12–20 slides: hook, problema, solución, evidencia clínica, ruta regulatoria, mercado, modelo de negocio, tracción, equipo, financiamiento. Un hallazgo por slide en inversión; densidad controlada en congresos — **dos plantillas, no una**. Tablas: máximo ~6 filas visibles. | `CONSERVAR` |
| `PRE-02` | Siempre nombrar la ruta regulatoria, aunque sea hipótesis en curso. La evidencia parcial se presenta como estado de roadmap, nunca oculta. | `CONSERVAR` |
| `PRE-03` | **ADVERTENCIA de gobernanza:** verificar vigencia de cualquier benchmark citado antes de cada presentación. Woebot Health y Akili se usan como ejemplo en materiales del sector. **`VERIFICAR` — el estado actual de ambos no se comprobó en esta revisión; no citarlos como hecho hasta comprobarlo.** | `VERIFICAR` |

---

## 15. Dominio WEB — Sitio y materiales institucionales

| ID | Regla | Estado |
|---|---|---|
| `WEB-01` | Conservar y formalizar el sistema de etiquetas de evidencia del dashboard actual como componente del design system. | `CONSERVAR` (ver `D-04`) |
| `WEB-02` | Mantener visualmente explícita la separación entre "dashboard institucional para asesores" y "producto clínico real". | `CONSERVAR` |
| `WEB-03` | **Pendiente de acción, no de decisión:** correr una auditoría técnica real de contraste/foco/targets sobre el sitio actual con una herramienta de accesibilidad. **No se ha hecho todavía con datos reales.** | `CONSERVAR` |

---

## 16. Dominio GOV — Gobernanza de marca y uso de IA generativa

| ID | Regla | Estado |
|---|---|---|
| `GOV-01` | **Checklist antes de publicar cualquier pieza externa:** lenguaje no estigmatizante · contraste WCAG 2.2 AA · sin verbos de certeza sobre el modelo · vigencia de benchmarks revisada en los últimos 12 meses · consistencia de tokens · si usa "Recover" o un resultado terapéutico, pasa por el criterio de `GOV-04`. | `CONSERVAR` |
| `GOV-02` | Ownership: un founder actúa como guardián de la checklist antes de cada publicación externa; no requiere contratar a nadie. | `CONSERVAR` |
| `GOV-03` | Versionado: manual y tokens se versionan juntos (semver simple). | `CONSERVAR` |
| `GOV-04` | **Advertencia de naming — "Recover".** No se recomienda cambiar el nombre. Pero se señala: la FTC (EE. UU.) tiene precedente de sancionar nombres de producto que implican una cura o un resultado de salud. **No se verificó** si existe un mecanismo equivalente explícito bajo COFEPRIS o la Ley General de Salud en México: no es una prohibición confirmada, es una señal de alerta transferible. Mitigación de diseño ya incorporada: en el lockup, "SISAP" lleva el peso visual principal. Acción concreta pendiente, **fuera de este manual**: llevarlo a Jesús Retiz González (o quien cumpla ese rol) antes del Demo Day. | `CONSERVAR` + `VERIFICAR` |
| `GOV-05` | Dos capas de documentación: este documento (humanos) + JSON de tokens y reglas en formato DTCG (IA). | `CONSERVAR` con `CORREGIR-01` |
| `GOV-06` | **Uso de IA generativa** — Iconos abstractos: `PERMITIDO`. Ilustraciones abstractas, gráficos con datos reales, copy no clínico, variaciones de logo: `CON REVISIÓN`. Imágenes de personas con TUS: `PROHIBIDO`. Figuras médicas/anatómicas por IA: `PROHIBIDO`. Imágenes en papers científicos: `NO RECOMENDADO` — verificar la política de cada revista, no asumir prohibición universal. Logos completos sin edición humana: `PROHIBIDO` (no registrable sin autoría humana significativa). Datos de pacientes en herramientas externas: `PROHIBIDO`. Claims terapéuticos: `PROHIBIDO`. | `CONSERVAR` |

**Base de `GOV-04`** (verificada 2026-09-20): *Health Products Compliance Guidance*, Federal Trade
Commission (EE. UU.), diciembre 2022 —
<https://www.ftc.gov/business-guidance/resources/health-products-compliance-guidance>. La guía trata
explícitamente los claims explícitos e **implícitos** sobre beneficios de salud. **Precisión al
citarla:** el documento recibido afirma un "precedente directo de sancionar **nombres de producto**";
lo verificado es la guía sobre claims engañosos de productos de salud, no una regla específica sobre
nombres. La formulación queda acotada a lo verificable.

---

## 17. Dominio EST — Estados de interacción y anti-patrones

| ID | Regla | Estado |
|---|---|---|
| `EST-01` | El sistema mantiene separados: **estado clínico**, **estado epistemológico**, **estado de interacción** y **estado de disponibilidad del sistema**. Ninguno de los estados de interacción (default, expanded, pending, uncertain, disputed, superseded, failed, permission limited, loading) debe parecer un diagnóstico ni un estado clínico de la persona. | `CONSERVAR / consolidado` |
| `EST-02` | Anti-patrones (la marca **no debe**): convertir inferencias en diagnósticos visuales · usar color para "bueno/malo" clínico sin definición · convertir un insight en call-to-action prescriptivo · usar iconografía futurista como autoridad algorítmica · esconder incertidumbre por limpieza visual · presentar SISAP como chatbot clínico · representar personas con TUS mediante imágenes generadas por IA · mostrar el espacio latente clínicamente · usar "Recover" como promesa terapéutica · confundir el dashboard institucional con el producto clínico · hacer que una decisión humana parezca recomendación automática · hacer que un estado técnico parezca un estado clínico. | `CONSERVAR` |
| `EST-03` | **Copy contract.** Preferido: "SISAP muestra un patrón asociado a…", "Se observa un cambio en…", "La información disponible sugiere…", "La información disponible no permite…", "Este resultado debe interpretarse junto con…". Prohibido salvo definición, validación y contexto que lo sustenten: "SISAP diagnostica…", "SISAP predice…", "El modelo indica que…", "La persona tiene riesgo alto…", "La intervención causó…". | `CONSERVAR` |

---

## 18. Anexo A — Plan de investigación (resumen)

Este v1.1 se produce ya. En paralelo, estos estudios cierran las hipótesis marcadas arriba —
**ninguno bloquea producción**:

| # | Qué valida | Con quién | Método rápido |
|---|---|---|---|
| 1 | Paleta azul+terracota (o la alternativa que resuelva `D-01`) | 8–12 psicólogos | Test A/B/C de preferencia + confianza |
| 2 | Familia tipográfica única (`D-02`, `D-03`) | 8–12 psicólogos | Comparación de lectura, una familia vs. combinación |
| 3 | Bandas de RCI en trayectorias | 6–8 psicólogos | Think-aloud sobre gráfico con/sin banda |
| 4 | Lenguaje de similitud vs. etiqueta fija en estratos | 8–12 psicólogos | Comparación de redacción + "¿es un diagnóstico?" |
| 5 | Contenido de la capa "fundamento" | 6–8 psicólogos | 3 variantes, medir confianza y preferencia |
| 6 | Etiquetas de provenance | 8–12 psicólogos | Tarea de clasificación con/sin etiqueta |
| 7 | Glosario de lenguaje en español mexicano | 8–12, incluir experto en adicciones | Entrevista corta (15 min) |
| 8 | Automation bias general | 10–15 | Escenario con sugerencia incorrecta a propósito |
| 9 | Comprensión de límites/incertidumbre | 8–12 | Recuerdo de nota de limitación a los 5 min |
| 10 | Logo wordmark+símbolo, ejecución del símbolo | Mentores/inversionistas, N≥20 | Encuesta de recordación y comprensión |

**Nota de trazabilidad (`VERIFICAR`).** El documento recibido afirma que el plan completo, con
hipótesis, estímulos y criterios de éxito detallados, *"ya existe en el proyecto
(`G_H_I_Validation_Matrix_Blueprint.md`)"*. **Ese archivo no se localizó en el corpus del proyecto
en esta revisión.** Debe verificarse si existe, si se llamó distinto, o si la referencia es
aspiracional.

---

## 19. Anexo B — JSON de tokens v1 (capa legible por IA)

**Estado:** `DE-V1` con `CORREGIR-02` aplicado. Los valores de color quedan **sin cambios** y
**sujetos a `D-01`**.

```json
{
  "color": {
    "brand": {
      "primary":   { "$value": "#123C56", "$type": "color", "$description": "Azul profundo — v1, sujeto a validación (Anexo A, Estudio 1) y a D-01" },
      "secondary": { "$value": "#B5623A", "$type": "color", "$description": "Terracota — v1, sujeto a validación" }
    },
    "semantic": {
      "success": { "$value": "#2F9E63", "$type": "color" },
      "warning": { "$value": "#E8A33D", "$type": "color", "$description": "Deliberadamente distinto de brand.secondary" },
      "error":   { "$value": "#C6483F", "$type": "color", "$description": "Solo alertas críticas" }
    },
    "neutral": {
      "bg":     { "$value": "#FAF8F5", "$type": "color" },
      "bgDark": { "$value": "#12171C", "$type": "color" }
    }
  },
  "typography": {
    "fontFamily": {
      "default":       { "$value": "IBM Plex Sans, sans-serif", "$type": "fontFamily", "$description": "En conflicto con app.css (Sora) — ver D-02" },
      "data":          { "$value": "IBM Plex Mono, monospace", "$type": "fontFamily", "$description": "Solo tablas de datos densas" },
      "accessibility": { "$value": "Atkinson Hyperlegible, sans-serif", "$type": "fontFamily", "$description": "Opción activable por el usuario, nunca default" }
    },
    "fontSize": {
      "base": { "$value": "16px", "$type": "dimension", "$description": "En conflicto con app.css (13px) — ver D-03" }
    },
    "lineHeight": {
      "body": { "$value": 1.5, "$type": "number", "$description": "CORREGIR-02: valor numérico, no cadena" }
    }
  },
  "spacing": {
    "scale": { "$value": [4, 8, 12, 16, 24, 32, 48], "$type": "dimension[]", "$extensions": { "org.designtokens.local": true }, "$description": "CORREGIR-02: 'dimension[]' no es un tipo del módulo DTCG; se conserva como extensión local" }
  },
  "motion": {
    "duration": {
      "fast":   { "$value": { "value": 150, "unit": "ms" }, "$type": "duration" },
      "normal": { "$value": { "value": 250, "unit": "ms" }, "$type": "duration" }
    },
    "easing": {
      "standard": { "$value": [0, 0, 0.58, 1], "$type": "cubicBezier", "$description": "CORREGIR-02: cubicBezier exige arreglo de 4 números; 'ease-out' no era válido. Equivalente CSS: cubic-bezier(0, 0, 0.58, 1)" }
    }
  },
  "accessibility": {
    "contrast": {
      "minText":    { "$value": 4.5, "$type": "number", "$extensions": { "org.designtokens.local": true }, "$description": "CORREGIR-02: ratio se expresa como número, no como cadena '4.5:1'" },
      "minNonText": { "$value": 3, "$type": "number", "$extensions": { "org.designtokens.local": true } }
    },
    "target": {
      "min":         { "$value": { "value": 24, "unit": "px" }, "$type": "dimension" },
      "recommended": { "$value": { "value": 44, "unit": "px" }, "$type": "dimension" }
    }
  },
  "visualGrammar": {
    "$description": "Vocabulario formal de 6 elementos (Anexo C). Significado conceptual, nunca cuantitativo.",
    "point":        { "$value": "●", "$type": "glyph", "$extensions": { "org.designtokens.local": true }, "$description": "evidencia / dato / evento" },
    "circle":       { "$value": "○", "$type": "glyph", "$extensions": { "org.designtokens.local": true }, "$description": "dimensión / fuente / contexto; variante abierta = pendiente" },
    "layer":        { "$value": "▱", "$type": "glyph", "$extensions": { "org.designtokens.local": true }, "$description": "información / perspectiva / profundidad" },
    "trajectory":   { "$value": "⌁", "$type": "glyph", "$extensions": { "org.designtokens.local": true }, "$description": "cambio / evolución / tiempo" },
    "intersection": { "$value": "◐", "$type": "glyph", "$extensions": { "org.designtokens.local": true }, "$description": "relación / integración — nunca implica causalidad" },
    "texture":      { "$value": "···", "$type": "glyph", "$extensions": { "org.designtokens.local": true }, "$description": "sistema / estructura / escala — nunca incertidumbre, error, N o missingness" }
  },
  "provenance": {
    "$description": "El glifo es un ancla semántica a visualGrammar, no el significado completo. La etiqueta de texto es la fuente de verdad. VOCABULARIO PENDIENTE DE UNIFICACIÓN — ver D-04.",
    "reportado": { "$value": "●", "$type": "glyph", "anchor": "visualGrammar.point" },
    "calculado": { "$value": "▱", "$type": "glyph", "anchor": "visualGrammar.layer" },
    "inferido":  { "$value": "◐", "$type": "glyph", "anchor": "visualGrammar.intersection" },
    "pendiente": { "$value": "○", "$type": "glyph", "anchor": "visualGrammar.circle" }
  },
  "rules": {
    "imagery": {
      "prohibited": [
        "Generar imágenes de personas con TUS, fotorrealistas o ilustradas",
        "Imágenes de agujas, sombras, rostros ocultos, escenarios de antes/después, parafernalia visible"
      ],
      "required": ["Fotografía real con consentimiento documentado", "Diversidad demográfica real"]
    },
    "latentSpace": {
      "prohibited": ["Mostrar valores o proyecciones del espacio latente de 12 dimensiones en cualquier interfaz clínica"]
    },
    "voice": {
      "prohibited": ["diagnostica", "predice", "indica que", "recuperación garantizada"],
      "preferred": ["sugiere", "muestra un patrón asociado a"]
    },
    "dataVizVsBrandGrammar": {
      "principle": "Brand Grammar = significado conceptual. DataViz Grammar = significado cuantitativo. Nunca se mezclan.",
      "prohibited": [
        "Representar incertidumbre, intervalo, error, N o missingness mediante texture (trama)",
        "Representar incertidumbre mediante opacidad decorativa fuera del sistema de capas definido",
        "Usar un glifo de provenance solo, sin etiqueta de texto, cuando la distinción sea clínicamente relevante"
      ],
      "required": ["La incertidumbre se representa exclusivamente en el sistema de DataViz: banda de rango sobre trayectoria, intervalo explícito o línea punteada de continuidad no observada"]
    }
  }
}
```

---

## 20. Anexo C — Gramática visual (Visual Grammar)

**Principio rector:** las formas no son decoración. Cada forma tiene significado. Este anexo define el
vocabulario formal a partir del cual se construyen el símbolo (§4), la iconografía e ilustración (§8),
la visualización de datos (§9) y las etiquetas de provenance (§11) — no como capítulos independientes,
sino como combinaciones de los mismos seis elementos.

| Elemento | Glifo | Significa | Uso |
|---|---|---|---|
| Punto | `●` | evidencia / dato / evento | marcar observaciones |
| Círculo | `○` | dimensión / fuente / contexto | representar entidades; variante abierta → pendiente |
| Capa | `▱` | información / perspectiva / profundidad | integrar información |
| Trayectoria | `⌁` | cambio / evolución / tiempo | longitudinalidad |
| Intersección | `◐` | relación / integración | conectar dimensiones |
| Trama | `···` | sistema / estructura / escala | estructura y contexto — **nunca incertidumbre** |

**Principios de composición:** capas + trayectoria → "contexto en movimiento" · evidencia en contexto
→ "información situada" · equilibrio humano-técnico → "tecnología que acompaña" (dos formas que se
completan sin fundirse; nunca una forma absorbiendo a la otra).

**Sistema de capas (el elemento más propietario):**

```text
Capa 4 — Interpretación   (más opacidad, más énfasis visual — se muestra primero)
Capa 3 — Análisis
Capa 2 — Información
Capa 1 — Dato / evidencia (más transparencia, más contexto compartido — se revela al profundizar)
```

**REGLA (`VIS-06`):** la transparencia tiene función semántica, no decorativa: más transparencia =
más contexto compartido / capa más profunda; más opacidad = mayor énfasis visual / capa más cercana a
la interpretación. La transparencia **nunca** codifica certeza o confianza de un dato.

**Trayectoria — anatomía:** línea = tendencia / estimación central · puntos = observaciones ·
banda = rango de incertidumbre (única forma permitida de representar incertidumbre en todo el
sistema) · línea punteada = continuidad no observada / estimación.

**Tramas — tres familias, ningún significado cuantitativo:** Dot Grid (estructura / sistema / escala;
portadas, fondos, separadores) · Context Waves (continuidad / trayectoria / temporalidad; transiciones,
fondos editoriales) · Layer Field (multidimensionalidad / contexto; posters, decks, website).

**Densidad adaptativa por contexto:**

| Contexto | Densidad | Prioridad |
|---|---|---|
| UI clínica | muy baja ornamentación | máxima claridad |
| Científico (paper/poster) | media densidad | máxima precisión |
| Website | media densidad | narrativa |
| Inversionistas | alta expresividad | síntesis |
| Marca / campaña | máxima libertad | siempre dentro de la gramática |

Combinaciones de referencia por pieza: Website = capas + fotografía + trayectoria · Dashboard =
puntos + trayectoria + capas · Poster científico = trama + capas + dataviz · Deck de inversión =
intersecciones + capas + una trayectoria.

---

## 21. Anexo D — Trazabilidad Brand × User Stories

| HU / principio | Implicación de marca | Superficie / sistema | Estado |
|---|---|---|---|
| HU-001 — visualizar trayectoria | Trayectoria como estructura narrativa primaria | Visual Grammar + Trajectory expression | Integrado |
| HU-002 — inspeccionar fundamento | Evidencia antes que interpretación; Foundation como transparencia | Clinical AI Expression | Integrado |
| HU-003 — distinguir información | Provenance como lenguaje formal | Tokens + componentes IA | Integrado |
| HU-004 — registrar observaciones | Observación como evidencia contextualizada | Evidence / Content language | Integrado |
| HU-005 — casos que requieren atención | Evitar que señales parezcan diagnósticos o certezas | Voice + interaction states | Integrado |
| HU-006 — métricas institucionales | Agregación y protección frente a reidentificación | Institutional expression | Integrado |
| HU-007 — comparar momentos | Temporalidad explícita; no inventar precisión | Trajectory + DataViz | Integrado |
| HU-008 — evaluaciones | Score ≠ diagnóstico automático | DataViz + voice | Integrado |
| HU-009 — contexto social | Contexto ≠ riesgo | Ethical language + contextual expression | Integrado |
| HU-010 — medicación | Evento clínico ≠ interpretación | Evidence grammar | Integrado |
| HU-011 — reporte | Mantener provenance, limitaciones y lenguaje persona-primero | Reports / editorial | Integrado |
| HU-012 — sugerencia contextual | No prescripción automática; autoridad humana explícita | Voice + Human Decision | Integrado |
| HU-013 — comparación de programas | No atribución causal sin diseño apropiado | Institutional voice + dataviz | Integrado |
| HU-014 — explicación contrafactual | Mantener como exploración futura; no convertir en promesa | Governance / future expression | Reservado |
| HU-015 — registrar intervención | Acción realizada por una persona o equipo debe distinguirse de un insight | Human Decision / Trajectory | Integrado |
| HU-016 — métricas de engagement | Una medición de participación ≠ interpretación psicológica; profundidad condicionada por autorización | Trajectory View / Analytics | Integrado |
| Provenance | Reportado / Calculado / Inferido / Pendiente | Brand Grammar + tokens | Integrado (**vocabulario pendiente, `D-04`**) |
| Mínimo privilegio | Misma marca, distinta profundidad por rol | Role-aware expression | Integrado |
| Human override | Desacuerdo visible sin reescribir el insight | Human Decision | Integrado |
| Incertidumbre | No esconderla; no representarla mediante decoración | DataViz Grammar + voice | Integrado |
| No causalidad | Intersección ≠ causalidad; proximidad temporal ≠ causa | Visual Grammar + copy | Integrado |
| Accesibilidad | Distinciones epistemológicas no dependen solo del color | Accessibility + components | Integrado |

### D.1 Regla de lectura

La tabla demuestra **cobertura editorial**, no validación clínica ni cumplimiento regulatorio. Una
fila "Integrado" significa que el principio tiene una expresión definida dentro del Brand & Design
System; **no** significa que haya sido probado con usuarios.

### D.2 Fuente de verdad por responsabilidad

| Documento | Define |
|---|---|
| Brand & Design System | cómo se ve, cómo suena, cómo se etiqueta, cómo se expresa la identidad |
| Manual UX | cuándo aparece, qué información contiene, interacción, roles, estados, decisiones |
| Data Dictionary | entidades, campos y semántica de datos |
| Model Governance | generación, versionado, validación y límites del modelo |
| SRS / Risk / V&V | requisitos, riesgos, controles, verificación y validación |

**REGLA (`GOV-07`):** ningún documento se apropia silenciosamente de la responsabilidad de otro.

### D.3 Nota de trazabilidad sobre las HU

Las 18 historias de usuario que esta tabla referencia **no existen en el corpus documental del
proyecto** (0 apariciones de `HU-*` en 626 archivos revisados, 2026-09-20). Son una propuesta del
paquete recibido. Mientras el propietario no las incorpore formalmente, esta tabla documenta
cobertura **de un artefacto no aprobado**.

---

## 22. Anexo E — Glosario de lenguaje (ES-MX)

| Evitar | Usar en su lugar | Corresponde a la fuente NIDA |
|---|---|---|
| adicto / adicta | persona con TUS / persona en tratamiento | Sí ("person with substance use disorder") |
| limpio / sucio (referido a consumo) | en abstinencia / con consumo reciente | **No** — NIDA propone "negative or positive urine drug test" |
| recaída (como fracaso) | reingreso a tratamiento / continuidad de cuidado | **No** — NIDA propone "return to use" / "treatment attempt" |
| paciente difícil | caso que requiere mayor seguimiento | No figura en la fuente |
| diagnosticar / predecir (salidas del modelo) | mostrar un patrón asociado a / sugerir | No figura en la fuente |

**Estado:** `v1` — adaptación ES-MX de NIDA con desviaciones señaladas, **sin validar todavía con los
psicólogos de las comunidades terapéuticas de SISAP**. Se usa para producir; la validación con
entrevista corta (Anexo A, Estudio 7) corre en paralelo.

---

## 23. Fuentes verificadas en esta revisión

Todas consultadas el 2026-09-20. `[P]` = fuente primaria del emisor; `[S]` = secundaria.

| Fuente | URL | Se usa en |
|---|---|---|
| [P] Design Tokens Format Module 2025.10 — Final Community Group Report, DTCG | <https://www.designtokens.org/TR/2025.10/format/> | `CORREGIR-01`, `CORREGIR-02`, Anexo B |
| [P] W3C — WCAG 2.2 aprobada como ISO/IEC 40500:2025 | <https://www.w3.org/press-releases/2025/wcag22-iso-pas/> | `ACC-01` |
| [P] NIDA — *Words Matter: Preferred Language for Talking About Addiction* | <https://nida.nih.gov/research-topics/addiction-science/words-matter-preferred-language-talking-about-addiction> | `LEN-01`, `LEN-02`, Anexo E |
| [P] FTC — *Health Products Compliance Guidance* (dic-2022) | <https://www.ftc.gov/business-guidance/resources/health-products-compliance-guidance> | `GOV-04` |
| [P/-] UW ADAI — Empathy Lens Image Collection | <https://adai.uw.edu/> | `IMG-04` |
| [S] Collins G. *et al.* (2024). TRIPOD+AI statement. *BMJ* 385:e078378. DOI 10.1136/bmj-2023-078378 | <https://doi.org/10.1136/bmj-2023-078378> | `VIS-07` |
| [S] Vasey B. *et al.* (2022). DECIDE-AI. *BMJ* 377:e070904. DOI 10.1136/bmj-2022-070904 | <https://doi.org/10.1136/bmj-2022-070904> | `VIS-07` |
| [S] Liu X. *et al.* (2020). CONSORT-AI extension. *Nat Med* 26:1364–1374. DOI 10.1038/s41591-020-1034-x | <https://doi.org/10.1038/s41591-020-1034-x> | `VIS-07` |
| [S] Wong B. (2011). Points of view: Color blindness. *Nat Methods* 8:441. DOI 10.1038/nmeth.1618 | <https://doi.org/10.1038/nmeth.1618> | `VIS-04`, `VIS-05` |

**Advertencia de citación (`CORREGIR-06`):** el documento recibido nombraba TRIPOD+AI, DECIDE-AI y
CONSORT-AI sin referencia. Al añadirlas se detectó que el DOI más citado en circulación para DECIDE-AI
(`10.1038/s41591-022-01887-z`) **resuelve a otro artículo** (un estudio sobre la variante Ómicron).
La referencia correcta del documento principal de DECIDE-AI es **BMJ 2022;377:e070904**
(DOI `10.1136/bmj-2022-070904`). Verificado por resolución en Crossref API.

---

## 24. Decisiones pendientes del propietario

Ninguna de estas las resuelve este documento. Se presentan con la consecuencia técnica de cada opción.

| ID | Decisión | Opciones | Consecuencia |
|---|---|---|---|
| `D-01` | **Paleta de marca** | (a) Conservar azul profundo `#123C56` + terracota `#B5623A` sobre claro. (b) Adoptar lo implementado: tema oscuro `#0b1120` + azul `#2d8cf0`. (c) Adoptar la identidad del logo: navy `#0B2239` + teal `#1FB5A8`. | (a) exige rediseñar `app.css` y produce una interfaz clara donde hoy hay oscura; (b) exige rehacer el logo y sus propuestas; (c) exige rediseñar la interfaz y añadir un color de acento que no está en `app.css`. En los tres casos hay que medir contraste real antes de implementar. |
| `D-02` | **Tipografía** | (a) IBM Plex Sans + Mono (recibido). (b) Sora + JetBrains Mono (implementado, autoalojado). | (a) obliga a empaquetar y versionar dos familias nuevas y a re-medir densidad; (b) no cambia nada y ya está validado visualmente. |
| `D-03` | **Tamaño base y densidad** | (a) `>= 16 px` (recibido). (b) Cuerpo 13 px / meta 11 px / micro 10 px (implementado, densidad "productiva"). | (a) rompe la densidad documentada en `docs/17_product_interface_design` §5 y obliga a rehacer el layout; (b) mantiene la interfaz validada, pero deja la regla de accesibilidad "≥16 px" sin cumplir como regla de marca. |
| `D-04` | **Vocabulario de provenance** | (a) Mantener dos taxonomías y documentar el mapeo explícito. (b) Unificar en `Reportado / Calculado / Inferido / Pendiente`. (c) Unificar en `HECHO / INFERENCIA / HIPÓTESIS / PENDIENTE`. | (a) es lo que hace el dashboard hoy, pero deja dos vocabularios para cuatro casillas; (b) alinea con el Manual UX y obliga a retocar el dashboard (congelado); (c) alinea con el dashboard y obliga a retocar el Manual UX y el Anexo D. |
| `D-05` | **Set de iconografía** | (a) Font Awesome 6 (implementado y empaquetado). (b) Set lineal geométrico propio. | (a) no requiere trabajo y ya cumple "lineal y de bajo detalle" parcialmente; (b) es coherente con la gramática visual pero añade un activo que hay que producir y versionar. |

---

## 25. Índice de reglas

`ESQ-01…05` · `LEN-01…04` · `LOG-01…07` · `COL-01…06` · `TIP-01…05` · `IMG-01…06` · `VIS-01…07` ·
`UI-01…03` · `AIC-01…09` · `EPI-01…09` · `ACC-01…03` · `PRE-01…03` · `WEB-01…03` · `GOV-01…08` ·
`EST-01…03` — **81 reglas** en 15 dominios, contra las ~60 reglas en prosa del documento recibido
(que además repetían la misma cadena 6 veces).

*Verificación de integridad (2026-09-20): 78 reglas definidas en tabla + `IMG-06`, `GOV-07` y `GOV-08`
definidas en prosa; 0 identificadores duplicados.*

---

## 26. Criterio de cierre editorial

Este documento se considera **editorialmente completo para la fase de prototipado** cuando:

- la Trayectoria está establecida como estructura narrativa primaria (`EPI-01`);
- Evidencia, Interpretación, Incertidumbre y Decisión humana tienen una relación explícita de marca;
- provenance funciona como lenguaje formal y no solo como metadata (`EPI-03`, `D-04`);
- Clinical Insight, Foundation y Human Decision tienen expresión de marca consistente (`AIC-07…09`);
- la misma gramática puede expresarse a distintas profundidades por rol (`EPI-08`);
- contexto, temporalidad y causalidad tienen reglas explícitas (`EPI-04…07`);
- los estados técnicos no se confunden con estados clínicos (`EST-01`);
- las HU tienen trazabilidad editorial sin duplicar la especificación UX (Anexo D);
- las reglas nuevas siguen sujetas a validación donde el Manual Maestro las mantiene como hipótesis.

**REGLA DE CIERRE (`GOV-08`):** este documento **no convierte hipótesis UX, clínicas, regulatorias ni
de modelo en hechos validados**, y **no se declara "final"** mientras `D-01` a `D-05` estén abiertas.
Su función es asegurar que, mientras esas hipótesis se validan, la identidad de SISAP las represente
de forma coherente, transparente y epistemológicamente honesta.
