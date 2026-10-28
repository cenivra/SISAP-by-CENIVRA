# SISAP by CENIVRA


Plataforma inteligente de apoyo a la decisión clínica para trastornos por uso de sustancias
SISAP by CENIVRA es una plataforma de software diseñada para asistir en la evaluación, estratificación dimensional, seguimiento longitudinal y toma de decisiones clínicas en pacientes con trastornos por uso de sustancias (TUS).

## 📌 Estado del Proyecto
Actualmente en migración y consolidación desde R/Shiny hacia Python/Dash, con arquitectura modular y enfoque en reproducibilidad, trazabilidad y seguridad clínica.

## 🏛️ Marco Regulatorio
Desarrollado conforme a IEC 62304:2006 + AMD1:2015 (Software life cycle processes), complementado con:

1. ISO 14971 para gestión de riesgos

2. Principios de ciberseguridad y protección de datos (LFPDPPP)

3. Gestión de configuración y control de SOUP

              ⚠️ ** La adopción de IEC 62304 no constituye certificación ni autorización regulatoria.** ⚠️

## 🧩 Principios de Diseño
  * Separación de responsabilidades (configuración, lógica clínica, persistencia, utilidades, modelos, interfaz)

  * Reproducibilidad (dependencias versionadas, entornos controlados)

  * Trazabilidad (usuarios, pacientes, evaluaciones, versiones, resultados)

  * Seguridad por diseño (defensa en profundidad, RBAC, cifrado TLS/AES-256)

  * Privacidad por diseño (seudonimización, desacoplamiento de datos identificables y analíticos)

  * Equivalencia algorítmica R → Python (validación con tolerancia definida y pruebas automatizadas)

## 🗂️ Arquitectura General

```text
SISAP by CENIVRA
├── app/
│   ├── config.py
│   ├── clinical/constants.py
│   ├── database/ (connection, models)
│   ├── utils/helpers.py
│   └── scripts/init_db.py
├── assets/ (CSS, JS)
├── data/ (bases de datos, modelos, archivos auxiliares)
├── tests/
├── requirements.txt
└── .env
```
               **Módulos futuros: risk/, services/, validation/, audit/, reporting/, security/**

## 🧬 Constantes Clínicas
Define 12 dimensiones latentes que estructuran la capa semántica clínica:
- Desregulación Impulsiva Afectiva
- Reactividad de Ira
- Activación Conductual Regulada
- Carga Clínica Acumulada
- Desactivación Conductual General
- Disfunción Afectivo-Conductual Crónica
- Experiencia Terapéutica
- Cronicidad vs Inestabilidad Cognitiva
- Consumo Estabilizado
- Impulsividad vs Disforia BSL
- Ansiedad Internalizante No Impulsiva
- Ira Disposicional de Baja Intensidad

## 🗄️ Base de Datos
SQLite con entidades:

1. pacientes (identificador interno, datos mínimos)
2. evaluaciones (fecha, paciente, clúster, riesgo, representación latente, narrativa, alertas, plan, puntuaciones)
3. auditoría (trazabilidad de acciones)
4. usuarios (roles: admin, psicologo, consejero, viewer)

## 🤖 Modelos de Aprendizaje Automático
Artefactos integrados (versión controlada):
1. encoder.h5, gmm_model.pkl, autoencoder_completo.h5
2. mapeo_dominios.json, parametros_normalizacion.csv
3. Representación latente, clustering, estratificación de riesgo, métricas de error e incertidumbre

## 🔄 Flujo Conceptual
```text
Datos clínicos → Validación → Scoring psicométrico → Normalización
         ↓
Representación dimensional → Modelo ML → Perfil dimensional / Clúster / Riesgo /Incertidumbre
         ↓
Interpretación clínica → Alertas e hipótesis funcionales →  Apoyo a intervención
         ↓
Registro y seguimiento longitudinal
```

## 📋 Gestión del Ciclo de Vida (IEC 62304)
```text
- Desarrollo del software
           ↳ requisitos
                     ↳ arquitectura
                                ↳ implementación
                                            ↳ pruebas

- Mantenimiento (post-liberación, controlado)

- Gestión de riesgos (ISO 14971)

- Gestión de configuración (código, modelos, dependencias, documentación)

- Resolución de problemas (issue tracking, root cause analysis)
```

## 📈 Fases del Proyecto
| Fase | Objetivo |
| :--- | :--- |
| **Fase 2 (actual)** | Estructura modular, configuración, base de datos, autenticación, constantes clínicas |
| **Fase 3** | Migración de scoring y transformaciones clínicas |
| **Fase 4** | Integración de modelos ML |
| **Fases 5–13** | Interfaz y flujos clínicos en Dash |
| **Fase 14** | Equivalencia R → Python |
| **Fase 15** | Verificación y liberación |
| **Fase 16+** | Mantenimiento y evolución |

## 🔐 Seguridad y Cumplimiento
- **Autenticación:** hash de contraseñas (Argon2id/bcrypt), variables de entorno para secretos
- **Control de acceso:** RBAC con privilegios mínimos
- **Cifrado:** TLS 1.2+ en tránsito, AES-256 en reposo
- **Auditoría:** registro inmutable de eventos críticos
- **Prevención OWASP:** sanitización de entradas, mitigación de SQLi, XSS, CSRF
- **Datos sensibles:** excluidos de Git (.gitignore configurado)
- **Separación identidad/análisis:** seudonimización y desacoplamiento de capas

## ✅ Verificación y Validación
  1. Pruebas unitarias, integración, sistema, regresión
  2. Casos límite, datos faltantes, entradas inválidas
  3. Comparación R → Python con tolerancia definida
  4. Matriz de trazabilidad: requisitos ↔ riesgos ↔ diseño ↔ implementación ↔ pruebas

## 🚀 Instalación Rápida
bash
# Entorno virtual
python -m venv .venv
source .venv/bin/activate  # o .venv\Scripts\activate en Windows

# Dependencias
pip install -r requirements.txt

# Configuración
# Crear archivo .env con APP_SECRET_KEY

# Inicializar base de datos
python app/scripts/init_db.py

# Pruebas
pytest

## ⚠️ Limitaciones y Advertencias
SISAP by CENIVRA está en desarrollo activo

Es exclusivamente una herramienta de apoyo a la decisión clínica

**No sustituye el juicio clínico profesional**
**No constituye un diagnóstico médico o psicológico**
**Aún no está validado clínicamente ni autorizado regulatoriamente**

La conformidad con IEC 62304 es un marco de referencia, no una certificación

## 📚 Referencias Normativas
IEC 62304:2006 + AMD1:2015 — Software life cycle processes for medical devices

ISO 14971 — Application of risk management to medical devices

LFPDPPP — Protección de datos personales en México

NOM-004-SSA3-2012 y NOM-024-SSA3-2012 — Expediente clínico y sistemas de información

## 👤 Contacto
SISAP by CENIVRA — Área de Psicología
Comunidad Terapéutica Under The Tree Potrerillos
Responsable: Psic. Lauro Gutiérrez Castro

"Este README describe el marco de referencia adoptado para el desarrollo; no constituye una declaración de conformidad con IEC 62304 ni una autorización regulatoria."

