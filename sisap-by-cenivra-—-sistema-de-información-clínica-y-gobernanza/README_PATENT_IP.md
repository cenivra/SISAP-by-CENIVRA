# SISAP by CENIVRA — Estrategia de Propiedad Intelectual, Activos Digitales y Protección Regulatoria

## 1. Esquema General de Protección de Activos

SISAP utiliza un esquema tripartito de protección de propiedad intelectual conforme a la legislación mexicana (LFPPI e LFDA) y tratados internacionales (OMPI/WIPO, T-MEC):

```
                    ┌─────────────────────────────────────────┐
                    │      ACTIVOS DE PROPIEDAD DE SISAP     │
                    └────────────────────┬────────────────────┘
                                         │
  ┌──────────────────────────────────────┼──────────────────────────────────────┐
  ▼                                      ▼                                      ▼
┌───────────────┐                    ┌───────────────┐                      ┌───────────────┐
│   INDAUTOR    │                    │     IMPI      │                      │    SECRETO    │
│Derecho de Autor│                   │Invenciones/Pat│                      │  INDUSTRIAL   │
└───────┬───────┘                    └───────┬───────┘                      └───────┬───────┘
        │                                    │                                      │
  • Código Fuente                      • Arquitectura de                      • Pesos y matriz
  TypeScript/Python                    Seudonimización TTL                    del Autoencoder
  • Manuales Operativos                • Proceso de Cadena                    • Bóveda de llaves
  • Interfaz Gráfica (UI)                Merkle WORM en EDE                   • Vectores latentes
```

---

## 2. Registro de Código Fuente (INDAUTOR)
- **Titular:** Comunidad Terapéutica Under The Tree Miller A.C. / Creadores Autorizados.
- **Ramo:** Programa de Cómputo (Software).
- **Marco Legal:** Ley Federal del Derecho de Autor (LFDA), Artículos 13 Fracción XI, 101 al 114.
- **Elementos Protegidos:**
  - Repositorio del frontend y módulos de ciberseguridad (`cryptoService.ts`, `storageService.ts`, `fhirExporter.ts`).
  - Módulos de captura psicométrica (HAM-D, HAM-A, DAST-20, AUDIT, BIS-11, OCDS) y motor de visualización reactivo.
  - Manual de Usuario, Manual de Operación y Manual de Arquitectura de Blindaje.

---

## 3. Invención Implementada en Computadora y Sistema (IMPI / LFPPI)
- **Marco Legal:** Ley Federal de Protección a la Propiedad Industrial (LFPPI).
- **Criterio de Patentabilidad:** Conforme al Artículo 47 Fracción IV de la LFPPI, el software y métodos matemáticos *per se* no son patentables. Sin embargo, se protegen como **Invenciones Implementadas en Computadora (IIC)** al producir un efecto técnico tangible sobre la seguridad física y lógica de la información clínica.
- **Figura Jurídica Target:** Patente de Invención / Modelo de Utilidad para Invenciones Implementadas en Computadora (IIC).
- **Título Sugerido de la Invención:**
  > *"Sistema ciberseguro de arquitectura distribuida para la seudonimización dinámica con control temporal de acceso y verificación criptográfica inmutable en tiempo real de registros clínicos"*.
- **Materia Reclamable (Estructura de Reivindicaciones):**
  1. *Método implementado en computadora para el resguardo y des-anonimización temporal revocable de expedientes de salud mediante bóveda lógica aislada con temporizador de vida útil (TTL).*
  2. *Sistema de auditoría clínica distribuida que integra una cadena de hashes acoplados tipo Merkle con verificación de integridad en tiempo real para el cumplimiento no-repudiable de la NOM-024-SSA3-2012.*

---

## 4. Protección por Secreto Industrial (LFPPI Arts. 260 al 266)
Toda la información técnica y científica relativa a:
- La arquitectura y topología de la red neuronal del autoencoder transversal (vector canónico de 24 variables a espacio latente de 12 dimensiones).
- Los algoritmos de regularización y umbrales ponderados de criticidad psicométrica (Craving, Impulsividad, Desesperanza).
- El algoritmo de mapeo y seudonimización estricto entre el ID clínico `TUS-XXXX` y el Padrón Nominal.
- Las llaves maestras de derivación sintética y gestión del material criptográfico en la Web Crypto API.

Está catalogada formalmente como **SECRETO INDUSTRIAL**. 

Conforme al Artículo 262 de la LFPPI, dicha información se conserva en medios físicos y lógicos que previenen su divulgación o acceso no autorizado. Su divulgación, apoderamiento, transmisión o uso comercial sin autorización expresa por escrito constituye un delito federal grave sancionado con penas privativas de libertad y reparación de daños y perjuicios.

---

## 5. Licencia y Uso del Software
El uso de este sistema está estrictamente restringido a terminales autorizadas y personal clínico acreditado de la institución. Queda estrictamente prohibida su ingeniería inversa, descompilación, extracción de modelos o redistribución no autorizada.
