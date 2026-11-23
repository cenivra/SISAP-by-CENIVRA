# Evaluación de Compatibilidad Arquitectónica y Regulatoria con Cloudflare — SISAP v1.1.0

## Control Documental

| Campo | Valor |
|---|---|
| **Código documental** | `SISAP-QA-007` |
| **Título** | Evaluación Técnica, de Privacidad y Normativa sobre el Uso de Servicios Cloudflare en SISAP |
| **Versión** | `1.1.0-draft` |
| **Estado** | **En revisión** |
| **Fecha de creación** | 2026-11-23 |
| **Autor / Responsable** | Equipo de Arquitectura, Privacidad y QA — SISAP by CENIVRA |
| **Revisor y aprobación** | **Pendiente de revisión formal** |
| **Documentos relacionados** | `SISAP-LC-001` · `SISAP-LC-004` (`RSK-008`) · `SISAP-LC-005` · `SISAP-QA-001` |

---

## 1. Pregunta Arquitectónica Evaluada

Determinar si **Cloudflare** (Workers, Pages, R2, D1, WAF o Cloudflare Zero Trust Tunnel) resulta compatible, beneficioso o contraindicado respecto a la arquitectura actual `v1.1.0` de **SISAP by CENIVRA**, **sin migrar la plataforma hacia la nube ni comprometer su soberanía local**.

---

## 2. Diagnóstico de Compatibilidad por Componente de Cloudflare

| Servicio Cloudflare | Compatibilidad Técnica con `v1.1.0` | Implicación LFPDPPP / NOM-024 / IEC 62304 | Veredicto |
|---|---|---|---|
| **Cloudflare Pages / CDN para SPA clínica** | Baja / Innecesaria para escritorio | La app productiva se distribuye y ejecuta localmente como contenedor desktop Electron (`dist/` empaquetado offline + loopback `127.0.0.1`). Servir la app clínica como sitio público en CDN añade superficie web no requerida. | **No recomendado para operación clínica local** |
| **Cloudflare Workers + D1 / R2 (Backend y SQLite en la nube)** | **Incompatible con modelo actual** | Trasladaría el Padrón nominal (`patients`), notas clínicas, evaluaciones psicométricas e inferencias `model_runs` fuera del equipo institucional local hacia infraestructura multi-tenant en borde extranjero, contradiciendo el diseño *local-first* soberano y creando nuevas obligaciones de transferencia de datos sensibles de salud (LFPDPPP / NOM-024-SSA3-2012). | **Contraindicado / Rechazado para `v1.1.0`** |
| **Cloudflare Tunnel + Zero Trust Access (si evolucionara a intranet institucional)** | Condicional para futuras versiones red (`v2.x`) | Permitiría exponer un portal web interno tras mTLS/SSO sin abrir puertos públicos de firewall, **únicamente** si el servidor permaneciera on-premise en CENIVRA y si previamente se implementara RBAC multiusuario HTTP por ruta (`REQ-SEC-004`). | **Diferido a evaluación futura (`v2.x` red)** |
| **Cloudflare Pages para documentación estática / sitio informativo institucional** | **Compatible (si es 100% libre de PHI)** | Únicamente aplicable si CENIVRA decidiera publicar manuales públicos, landing informativa o sitio de descargas del instalador firmado, completamente separado de pacientes y expedientes. | **Apto solo para contenido estático público sin PHI** |

---

## 3. Conclusión y Recomendación Oficial para `v1.1.0`

1. **No migrar el backend ni la base de datos de SISAP a Cloudflare** en la línea `v1.1.0`. La arquitectura soberana local (*Electron + loopback `127.0.0.1:8080` + SQLite WAL en equipo institucional*) es una decisión deliberada de mitigación de riesgo (`RSK-008`, `SISAP-LC-001`) que evita exposición externa por Internet y dependencia de conectividad en clínicas residenciales.
2. Si CENIVRA desease en fases futuras acceso remoto entre sedes o documentación institucional en línea, deberá abrirse un expediente específico de arquitectura de red multiusuario (`REQ-SEC-004` + revisión legal LFPDPPP de encargado de tratamiento) antes de conectar cualquier túnel o CDN.
