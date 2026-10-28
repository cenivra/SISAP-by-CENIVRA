# Ficha del modelo de NLP clínico del canal de notas

| Campo | Valor |
|---|---|
| Identificador | MC-001 |
| Fecha | 2026-09-30 |
| Fase | Canal de notas clínicas y entrevista exploratoria (representación de texto) |
| Decisión | **`PlanTL-GOB-ES/bsc-bio-ehr-es`** |
| Estado del componente | Modelo preentrenado instalado y verificado por ejecución · AE-NOTAS provisional |
| Marco documental | Ciclo de vida tipo IEC 62304 (ingeniería y trazabilidad). **No** es declaración de conformidad ni certificación. |

## 1. Qué se necesitaba

Un **modelo preentrenado de representación** de texto clínico narrativo en español,
para alimentar el canal:

```
texto narrativo -> NLP clínico -> embedding -> AE-NOTAS -> Z_NOTAS
```

No se entrena un transformer en esta fase. El modelo debe poder sustituirse o
retirarse sin tocar el resto de SISAP, y no debe cargarse en el modo clínico general.

## 2. Candidatos y verificación

Todos los datos de esta tabla se comprobaron contra la ficha o la API del
repositorio del modelo, no de memoria. Lo que no se pudo verificar se declara como
no verificado.

| Criterio | `bsc-bio-ehr-es` | `IIC/RigoBERTa-Clinical` | `spanish-clinical-flair` | `MedSpaNER` |
|---|---|---|---|---|
| Especialización en narrativa clínica / EHR | **Sí: 95 M tokens de EHR, 278 K documentos clínicos reales (informes de alta, notas de evolución, radiológicos)** | Sí, pero corpus *ClinText-SP* (≈26 M tokens) de artículos, informes radiológicos, Wikipedia y tareas compartidas: **no incluye notas de evolución reales** | Sí: narrativas clínicas chilenas | No aplica: es un recurso de **reconocimiento de entidades** (NER), no de representación |
| Español clínico | Sí | Sí | Sí | Sí |
| **Licencia** | **Apache-2.0** (verificado por API del modelo) | **`rigoclinical-nc` — no comercial** | No verificada: no se localizó ficha oficial con licencia | No verificada: no se localizó recurso oficial |
| Tipo de modelo | Encoder MLM (representación) | Encoder MLM (representación) | Embeddings contextuales de *flair* para etiquetado de secuencias | Modelo de etiquetado (NER) |
| Tamaño | 125 M parámetros · 475.9 MB los pesos | Mayor que la base (base declarada: RigoBERTa 2) | Depende del embedding + arquitectura de flair | No declarado |
| Dependencias | `onnxruntime` + `tokenizers` (sin torch) | igual | **`flair`** (dependencia pesada y ligada a versiones concretas de torch) | no declaradas |
| Facilidad de ejecución local | Alta: exportable a ONNX int8 (~130 MB) y ejecutable sin torch | Alta en teoría, bloqueada por licencia | Baja: cadena flair + versión de torch | n/a |
| Compatibilidad con la arquitectura actual | Alta: convive con el motor NumPy existente como componente aislado | Alta | Baja | nula para este fin |
| Capacidad de representar narrativa | Alta: su corpus son notas clínicas reales | Media-alta en dominios concretos (radiología, artículos) | Media: se usó para NER, no se validó como vector de documento | nula |
| Reproducibilidad | Alta: repositorio público, peso fijo, hash medido al instalar | Alta | Media: cadena de dependencias antigua | No verificable |
| Mantenible como componente independiente | **Sí: recurso externo en `data/modelo/nlp/`, cargado bajo demanda** | Sí | No | No |
| Impacto en tamaño/memoria de la aplicación | Nulo si no se usa; ~155 MB de memoria sólo al procesar texto | n/a | Considerable | nulo |
| Adecuación para validación formal futura | Alta: licencia permisiva, versión fijada por hash, procedencia documentada | **Bloqueada por licencia no comercial** | Baja | n/a |

## 3. Decisión y motivo

Se selecciona **`PlanTL-GOB-ES/bsc-bio-ehr-es`** porque es el único candidato que
cumple simultáneamente las condiciones que el canal exige:

1. **Está entrenado sobre narrativa clínica real** (278 K documentos de EHR, 95 M
   tokens), que es exactamente el tipo de texto que este canal recibe.
2. **Es un modelo de representación** (encoder MLM) y no un modelo de tareas
   puntuales: el vector medio de sus estados ocultos sirve como entrada del
   AE-NOTAS.
3. **Su licencia es Apache-2.0**, verificada por API. Esto es condición
   indispensable para un componente de software clínico que aspira a validación
   formal y a distribución.
4. **Su tamaño es gobernable**: 125 M parámetros, exportable a ONNX int8, de modo
   que la aplicación no incrusta torch y sólo paga memoria cuando procesa texto.
5. **Es reproducible**: repositorio público, pesos fijos, SHA256 medido e
   inscrito en el manifiesto, y comprobación numérica del ONNX contra torch.

### Por qué se descartan los otros tres

* **`IIC/RigoBERTa-Clinical`** — técnicamente competitivo y más reciente (destaca
  en NER clínico en español), pero **su licencia es no comercial
  (`rigoclinical-nc`)** y su corpus clínico es de artículos, informes y tareas
  compartidas, **sin notas de evolución reales**. La licencia, por sí sola,
  impide incorporarlo a un componente clínico. Queda anotado como candidato si
  alguna vez se requiere **extracción de entidades** y se resuelve la licencia;
  para *representación* no aporta ventaja sobre el seleccionado.
* **`spanish-clinical-flair`** (Clinical Flair, ACL ClinicalNLP 2022) — es un
  recurso de **embeddings de flair orientados a etiquetado de secuencias**, no un
  encoder de documento: no produce de forma nativa la representación que el canal
  necesita, y arrastra la dependencia `flair`, pesada y atada a versiones
  concretas de torch. Además no se localizó ficha oficial con licencia, lo que
  compromete la trazabilidad y la validación futura.
* **`MedSpaNER`** — no se localizó recurso ni ficha oficial verificable, y por su
  naturaleza (**NER**: reconocer entidades) no es un modelo de representación. Se
  descarta por inadecuación técnica, no por calidad.

## 4. Estado de verificación del componente

| Comprobación | Resultado |
|---|---|
| Licencia del modelo verificada por API | Sí: `apache-2.0` |
| Pesos descargados | Sí: 499 010 056 bytes (475.9 MB) |
| Exportación ONNX y cuantización int8 | Ejecutada con comprobación numérica contra torch (ver `bin/instalar_nlp_clinico.py`) |
| Prueba de extremo a extremo del canal | `bin/verificar_canal_notas.py` con texto sintético no identificable |
| Pruebas unitarias del canal | `tests/unit/nlp/test_canal_notas.py` |
| Validación clínica de la representación | **No realizada** |
| Conformidad IEC 62304 | **No evaluada**: la norma se usa como marco de ingeniería y trazabilidad |

## 5. Limitaciones declaradas

* El modelo se usa **como representación**, no como clasificador ni como
  instrumento de medida: no produce puntuaciones clínicas ni diagnósticos.
* El **AE-NOTAS es provisional** y no está entrenado con datos de SISAP; su
  espacio latente sirve para integrar y probar la ruta, no para interpretar pacientes.
* No se ha evaluado el desempeño de la representación sobre la población de
  SISAP; cualquier afirmación al respecto está fuera de alcance hasta que exista
  esa evaluación.
* La **fusión multimodal** (`Z_ESCALAS + Z_QUINCENAL + Z_DICO_DCSA + Z_NOTAS`) está
  preparada pero **no entrenada**: no hay datos ni evidencia suficientes.
