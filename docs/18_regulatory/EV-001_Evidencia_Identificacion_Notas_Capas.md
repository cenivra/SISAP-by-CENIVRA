# EV-001 — Evidencia de implementación: identificación clínica, expediente, notas, capas y minimización

| Campo | Valor |
|---|---|
| Fecha | 30/09/2026 |
| Alcance | Bloque fundacional de identificación clínica y expediente (corrección de diseño R1, §5.10) |
| Requisitos considerados | REG-001 (`Marco_Regulatorio_Mexicano_Aplicable.md`) |
| Naturaleza | Evidencia de **implementación en código**, no de conformidad |

> **Advertencia de lenguaje.** Este documento **no** declara que SISAP-TUS
> «cumpla» NOM-004-SSA3-2012, NOM-024-SSA3-2012 ni la LFPDPPP, ni que esté
> «certificado». Declara qué requisitos fueron **identificados**, qué está
> **implementado en código** y **verificado por pruebas** de software, y qué
> queda **pendiente de verificación de conformidad**. La conformidad regulatoria
> exige revisión independiente y no se acredita por la existencia de campos o
> controles.

## 1. Qué quedó implementado (modelo de datos)

Módulo: `app/database/models_notas.py` (registrado en la misma `Base.metadata`).

| Tabla | Contenido | Requisito considerado |
|---|---|---|
| `expedientes_clinicos` | identificación del paciente: nombre completo (Fernet) + huella HMAC, número de expediente único, sexo, edad, fecha de nacimiento, identificadores clínicos, contacto (Fernet), consentimiento y finalidad | NOM-004-SSA3-2012 (identificación, número de expediente); LFPDPPP (consentimiento, finalidad) |
| `notas_clinicas` | raíz del agregado de la nota: tipo, versión vigente, estado | NOM-004-SSA3-2012 (nota en el expediente) |
| `nota_versiones` | versión **inmutable** con fecha y hora, autor (`autor_nombre`, `autor_cedula_profesional`, `autor_id`), firma (`firma_tipo` ∈ autógrafa/electrónica/digital, `firma_referencia`, `firma_hash`), texto íntegro, `hash_texto` y motivo de corrección | NOM-004-SSA3-2012 (fecha, hora, autor, firma); NOM-024-SSA3-2012 5.6 (integridad) |
| `acceso_expediente` | bitácora de acceso a la capa de identidad (quién, rol, capa, acción, justificación, emergencia) | NOM-004-SSA3-2012 (confidencialidad); NOM-024-SSA3-2012 |

## 2. Control de acceso por capas

Módulo: `app/security/capas.py`. Extiende el RBAC/ABAC existente
(`app/security/authorization.py`); **no** crea un segundo sistema de autenticación.

| Capa | Acceso |
|---|---|
| `expediente_clinico` (1) | admin, director clínico, psicólogo; otros roles sólo por acceso de emergencia justificado |
| `datos_procesables` (2) | roles clínicos |
| `nlp_autoencoders` (3) | roles clínicos; sólo admite las claves `origen` y `texto` |
| `demo_sintetica` (4) | cualquier rol, pero sólo con datos sintéticos |

La frontera hacia el NLP es **más estricta** que la del canal: `validar_payload_nlp`
rechaza `expediente` o `autor` aunque `app.nlp.canal_notas` los tolerara como
metadatos ignorados.

## 3. Minimización de identidad antes del NLP

Módulo: `app/services/minimizacion_service.py`.

* Elimina del texto narrativo: nombre completo y sus componentes, número de
  expediente, identificadores internos (`SISAP-…`, `PAC-…`), datos de contacto
  (correo, teléfono) e identificadores tipo CURP.
* Cotejo insensible a mayúsculas y **acentos**, conservando íntegro el resto del
  texto.
* El informe de minimización **no** transporta los valores eliminados: sólo el
  tipo y el recuento.
* `asegurar_sin_identidad` es la **frontera dura**: falla si alguna referencia
  identificable sobrevive, sin revelar el valor.
* `construir_entrada_nlp` aplica la cadena completa: frontera de capa →
  minimización → verificación dura → validación del canal de notas.

## 4. Servicios

| Módulo | Operaciones |
|---|---|
| `app/services/expediente_service.py` | `crear_expediente`, `obtener_expediente`, `identidad_clinica` (tracto auditado con justificación), `actualizar_expediente`, `identidad_para_minimizacion`, `registrar_acceso` |
| `app/services/notas_service.py` | `crear_nota`, `corregir_nota` (versionado no destructivo, exige motivo), `archivar_nota`, `version_vigente`, `listar_versiones`, `verificar_integridad`, `texto_para_nlp` |

## 5. Migración no destructiva

`migrar_esquema_notas(engine)` en `app/database/models_notas.py`, invocada desde
`_migrar_esquema` en `app/database/models.py`:

1. crea las tablas nuevas que falten (`create_all`; nunca `drop`);
2. añade columnas faltantes con `ALTER TABLE ADD COLUMN` (idempotente);
3. crea índices de forma idempotente.

No ejecuta `DROP` ni `DELETE`. Probado contra un esquema previo con datos: las
filas preexistentes se conservan.

## 6. Pruebas (ejecutadas)

Paquete: `tests/unit/identificacion_clinica/` (datos sintéticos; base temporal en
memoria y `tmp_path`; **nunca** la base clínica real).

| Archivo | Cubre |
|---|---|
| `test_expediente_identificacion.py` | identificación cifrada, huella no reversible, unicidad, edad, capa de acceso, bitácora, emergencia |
| `test_notas_autoria_versionado.py` | autoría, fecha/hora, firma, versionado no destructivo, integridad (detección de alteración), archivado |
| `test_capas_acceso.py` | matriz de roles por capa, guardas, frontera estricta del NLP |
| `test_minimizacion_nlp.py` | eliminación de nombre/expediente/contacto/CURP, insensibilidad a acentos, informe sin valores, frontera dura, cadena completa nota→NLP |
| `test_migracion_no_destructiva.py` | create-table, ALTER TABLE sin pérdida de filas, idempotencia, sin DROP/DELETE, integración con `_migrar_esquema` |

Comando:

```bash
python -m pytest tests/unit/identificacion_clinica -q --no-header -p no:cacheprovider
```

## 7. Pendiente de verificación de conformidad

1. Verificación independiente de conformidad con NOM-004-SSA3-2012 y
   NOM-024-SSA3-2012 (no acreditable por pruebas de software).
2. Definición formal del régimen de conservación y plazo de retención de
   versiones y bitácora.
3. Firma electrónica/digital: se registra el tipo y la referencia; la validez
   legal del mecanismo de firma no se evalúa aquí.
4. Pantallas de captura de identificación y notas conforme a §5.10 (el backend
   está implementado; la capa de UI es trabajo separado).
5. Aviso de privacidad y flujo de consentimiento conforme a la LFPDPPP 2025.
