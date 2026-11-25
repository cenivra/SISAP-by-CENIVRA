# D · Catálogo de Skills Utilizadas y Decisiones de Diseño e Ingeniería

Este documento registra únicamente las skills reales inspeccionadas en `C:\Users\saraq\.gemini\config\skills\` y aplicadas de forma efectiva en el código y arquitectura de SISAP.

---

## 1. Matriz de Skills Aplicadas

| Skill | Categoría | Aplicación Efectiva en el Proyecto |
|---|---|---|
| [`scientific-computing-workflow`](file:///C:/Users/saraq/.gemini/config/skills/scientific-computing-workflow/SKILL.md) | Ciencia de datos y ML reproducible | Inspección no destructiva del origen en Google Drive, verificación criptográfica SHA-256 sin reentrenar ni alterar resultados científicos, extracción fiel de pesos Encoder+Decoder y pruebas cruzadas R ↔ Node.js (`max_abs_diff = 0.0000e+0`). |
| [`sql-clinical-database`](file:///C:/Users/saraq/.gemini/config/skills/sql-clinical-database/SKILL.md) | Persistencia clínica e integridad | Diseño de la migración [`002_intelligence_engines.sql`](file:///c:/Users/saraq/Mi%20unidad%20(zarakaeldiosdelcaos@gmail.com)/GITHUB_REPOS/SISAP-by-CENIVRA/sisap-by-cenivra-%E2%80%94-sistema-de-informaci%C3%B3n-cl%C3%ADnica-y-gobernanza/backend/migrations/002_intelligence_engines.sql) con claves foráneas `ON DELETE RESTRICT`, restricciones `CHECK`, auditoría con `audit_database.py`, y prohibición de imputación silenciosa ante faltantes. |
| [`analisis-sesion-clinica`](file:///C:/Users/saraq/.gemini/config/skills/analisis-sesion-clinica/SKILL.md) | Psicometría e inteligencia narrativa | Adopción estricta de la taxonomía `E1_explicit`..`E5_insufficient` y del estado obligatorio `pending_human_review` en Motor 3 (`narrativeService.js`), Motor 5 (`decisionSupportService.js`) y `clinical_formulations`. |
| [`ui-craft`](file:///C:/Users/saraq/.gemini/config/skills/ui-craft/SKILL.md) (+ `dataviz.md`, `recipe-dashboard.md`) | Diseño de producto y visualización | Diseño de `LatentIntervalChart.tsx` (gráfico de puntos e intervalos Cleveland-McGill sobre escala común alineada frente a `p05–p95` y IQR `p25–p75`) y `ReconstructionBarsChart.tsx` (barras horizontales ordenadas desde cero, etiquetado directo, `tabular-nums`, sin arcoíris ni tarjetas KPI decorativas). |
| [`tasteful-ui`](file:///C:/Users/saraq/.gemini/config/skills/tasteful-ui/SKILL.md) | Producto analítico profesional | Arquitectura orientada a preguntas analíticas por motor (`IntelligenceEcosystemView.tsx`) en lugar de un tablero genérico de KPIs, separando inferencia validada de hipótesis exploratorias. |
| [`ui-ux-pro-max`](file:///C:/Users/saraq/.gemini/config/skills/ui-ux-pro-max/SKILL.md) | UX clínica y legibilidad | Jerarquía tabular con `tabular-nums`, contraste accesible sobre paleta clínica limpia y flujos claros entre captura (`InitialEvaluationView`, `FollowUpScalesView`) y análisis (`ecosistema`). |

---

## 2. Brechas / Herramientas No Instaladas Documentadas (Sin Duplicación)

- **`onnxruntime-node` / pesos completos RoBERTa `bsc-bio-ehr-es`:** El artefacto presente en `data/modelo/nlp/bsc-bio-ehr-es/modelo.onnx` tiene 1,378,358 bytes y no dispone de tensores completos ni librería `onnxruntime-node` en `package.json`. Se documenta explícitamente como brecha pendiente de paquete/artefacto y NO se simuló inferencia neuronal falsa; el Motor 3 opera con análisis léxico-funcional determinista transparente.
- **No se instalaron skills duplicadas** ni dependencias nativas innecesarias en Node.js.
