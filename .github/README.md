# SISAP by CENIVRA — Gobernanza Técnica, Calidad y Ciclo de Vida (.github)

**SISAP by CENIVRA** es una plataforma local-first de registro clínico estructurado, evaluación psicométrica digital, análisis longitudinal y representación dimensional para el contexto de Trastornos por Uso de Sustancias (TUS), desarrollada en **Electron + React + TypeScript + Vite + Node.js (`>=22.5.0`) + SQLite (WAL) + R (`>=4.0`)**.

> [!IMPORTANT]
> **Declaración normativa:** Desarrollado siguiendo procesos basados en **IEC 62304:2006 + AMD1:2015** e **ISO 14971:2019**. La adopción de estas prácticas **no constituye certificación sanitaria ni autorización regulatoria automática**.

---

## Arquitectura Activa (`v1.1.0` en `release/1.1.0`)

- **Aplicación principal:** [`sisap-by-cenivra-—-sistema-de-información-clínica-y-gobernanza/`](../sisap-by-cenivra-—-sistema-de-información-clínica-y-gobernanza/)
  - **Frontend SPA / Desktop:** Electron `45.0.0`, React `19.3.1`, TypeScript `7.0.2`, Vite `8.3.4`, Tailwind CSS `4.3.3`.
  - **Backend local loopback (`127.0.0.1:8080`):** Node.js ESM (`>=22.5.0`), `node:sqlite` en modo WAL (15 tablas en migraciones `001..003`), bitácora WORM con cadena SHA-256.
  - **Motores de Inteligencia (`engines/` y `backend/src/services/`):**
    1. Motor 1 — Autoencoder TUS (`encoder_22_checkpoint_fase2`, `encoder_24_deployed`, prototipo confirmatorio `ae_tus_17to12_m3k12`) con verificación SHA-256 y compuerta estricta `D-06`.
    2. Centro de Evaluación Psicométrica (`catalog_v1.json`: `BIS-11`, `BSL-23`, `GAD-7`, `EROS`, `BADS`, `STAXI-2`; `OCI-R` excluido).
    3. Motor 2 — Analítica longitudinal (`RCI` Jacobson-Truax).
    4. Motor 3 — Inteligencia narrativa léxica (`E1–E5`, estado ONNX transparente).
    5. Motor 4 — Integración multimodal de 5 dominios con procedencia.
    6. Motor 5 — Apoyo a decisiones (`pending_human_review` obligatorio, diagnóstico/prescripción automática deshabilitados).

## Preservación de Versiones y Control de Calidad CI/CD

- **Versión histórica `v1.0.0` (`main`, `ea500b34d9db37ee7c7c3e3f9f0b0345f2f2da1f`):** Preservada íntegramente sin modificaciones.
- **Línea candidata `release/1.1.0`:** Evolución verificada mediante:
  - `.github/workflows/ci-quality-gate.yml`: auditoría estática/secretos, TypeScript (`tsc --noEmit`), pruebas unitarias FE+BE, integración + cobertura LCOV, SonarQube Cloud, compilación Vite y E2E Playwright.
  - `.github/workflows/codeql.yml`: análisis SAST JavaScript/TypeScript.
  - `.github/dependabot.yml`: revisión semanal controlada de dependencias `npm` y `github-actions` sin auto-merge.
- **Documentación IEC 62304:** Consulte [`docs/lifecycle/`](../docs/lifecycle/) y [`docs/modules/`](../docs/modules/).
