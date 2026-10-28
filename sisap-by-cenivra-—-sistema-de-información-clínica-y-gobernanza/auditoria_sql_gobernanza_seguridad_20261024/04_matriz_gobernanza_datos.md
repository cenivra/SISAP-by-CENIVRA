# 04 — Matriz de Gobernanza de Datos Clínicos

**Fecha:** 24 de octubre de 2026  
**Fase:** Gobernanza de datos  
**Estado:** Documentado

---

## 1. Principios rectores

1. **Minimización de datos:** solo se almacenan los datos estrictamente necesarios para la finalidad clínica.
2. **Separación de identificadores:** los identificadores directos (nombre, CURP) se separan de los identificadores analíticos (pseudónimo TUS-XXXX).
3. **Pseudonimización:** el seudónimo viaja con el expediente clínico; el nombre real vive solo en el padrón (`patients`).
4. **Trazabilidad:** cada evento se registra con versión de modelo/esquema/preprocesamiento y hash de entrada (sin revelar contenido).
5. **No almacenar pesos:** la base de datos NO almacena pesos de modelo ni resultados de autoencoder simulados.

---

## 2. Matriz de gobernanza

| Categoría de dato | Finalidad | Necesidad | Tabla | Responsable acceso | Conservación | Riesgo identificación | En logs | Para pruebas | Salir del entorno | Compartir/exportar |
|-------------------|-----------|-----------|-------|-------------------|--------------|----------------------|---------|--------------|-------------------|-------------------|
| Nombre completo | Búsqueda e identificación | Sí | `patients` | Psicólogo, director | 5 años (NOM-004) | Alto | No | No | No | Solo con consentimiento |
| Pseudónimo (TUS-XXXX) | Identificador clínico ciego | Sí | Todas las tablas clínicas | Todo el personal | 5 años | Bajo | Sí | Sí (fixtures) | No | Sí (investigación anónima) |
| CURP | Identificación oficial | Condicional | `patients` | Director, admin | 5 años | Alto | No | No | No | Solo con consentimiento |
| Expediente físico | Referencia al archivo físico | Sí | `patients` | Director | 5 años | Medio | No | No | No | No |
| Respuestas a escalas | Scoring clínico | Sí | `scale_responses` | Psicólogo | 5 años | Medio | No | Sí (fixtures) | No | Sí (anonimizado) |
| Puntuaciones calculadas | Resultados de escalas | Sí | `scale_scores` | Psicólogo | 5 años | Medio | No | Sí (fixtures) | No | Sí (anonimizado) |
| Narraciones semanales | Datos cualitativos | Sí | `weekly_observations` | Psicólogo | 5 años | Alto | No | Sí (fixtures) | No | Solo con consentimiento |
| Hash de entrada | Trazabilidad sin revelar contenido | Sí | `model_runs` | Sistema | 5 años | Bajo | Sí | Sí | No | Sí |
| Versión de modelo | Trazabilidad de inferencia | Sí | `model_runs` | Sistema | 5 años | Bajo | Sí | Sí | No | Sí |
| Eventos de auditoría | Bitácora de acciones | Sí | `audit_events` | Director, admin | 5 años | Bajo | Sí | No | No | Solo auditoría |
| Pesos de modelo | Inferencia del autoencoder | No | (no almacenar) | N/A | N/A | Alto | No | No | No | No |
| Resultados de inferencia | Salidas del modelo (desactivado) | No | `model_outputs` (vacío) | N/A | N/A | Alto | No | No | No | No |

---

## 3. Reglas de conservación y eliminación

| Regla | Descripción |
|-------|-------------|
| Retención de 5 años | Conforme a NOM-004-SSA3-2012, los expedientes clínicos se conservan 5 años a partir de la última atención. |
| Eliminación controlada | Ninguna eliminación automática; requiere acción explícita y registro en bitácora. |
| Bitácora append-only | `audit_events` es inmutable (triggers SQL impiden UPDATE/DELETE). |
| Fixtures de prueba | Todos los registros de prueba llevan `es_dato_prueba = 1` y deben identificarse como tal. |

---

## 4. Datos que pueden/m no pueden salir del entorno local

| Puede salir (con controles) | NO puede salir |
|----------------------------|----------------|
| Datos anonimizados para investigación | Nombres, CURP, contacto de emergencia |
| Hash de entrada (SHA-256) para trazabilidad | Narraciones clínicas en texto plano |
| Pseudónimo TUS-XXXX para estudios agregados | Pesos o parámetros de modelos de autoencoder |
| Resultados de scoring agregados (sin identificar) | Credenciales o secretos del sistema |

---

## 5. Condiciones para compartir, exportar o respaldar

| Acción | Condición |
|--------|-----------|
| Exportar expediente | Solo con consentimiento del titular o tutorio legal, y registro en bitácora. |
| Respaldo de base | Archivo SQLite copiado a `data/local/backups/` con nombre con timestamp; no sobrescribe destinos existentes. |
| Compartir con terceros | Solo datos anonimizados, con registro de auditoría y sin identificar a pacientes. |

---

## 6. Limitaciones documentadas

- Una base local no garantiza por sí sola cumplimiento normativo, confidencialidad ni recuperación ante pérdida del equipo.
- Para producción se requiere revisión independiente de seguridad y cumplimiento (LFPDPPP, NOM-004, NOM-024).
- El backup no está cifrado en esta fase de pruebas; para producción se recomienda cifrado en reposo.
