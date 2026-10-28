# Política de Seguridad y Divulgación Responsable · SISAP by CENIVRA

## 1. Alcance y Filosofía de Seguridad

SISAP by CENIVRA es una plataforma de apoyo a la decisión clínica para el tratamiento de trastornos por uso de sustancias (TUS). Dado que el software está concebido para operar en entornos de atención a la salud mental y adicciones, la **confidencialidad médica, la integridad criptográfica y la trazabilidad inmutable** son directrices no negociables.

Esta política se alinea con:
- **NOM-024-SSA3-2012**: Sistemas de información de registro electrónico para la salud. Intercambio de información en salud.
- **Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP)** e lineamientos del INAI para datos sensibles de salud.
- **IEC 62304 / ISO 14971**: Ciclo de vida y gestión de riesgos en software de uso médico.

---

## 2. Versiones con Soporte Activo

| Versión | Soporte de Seguridad | Observaciones |
| :--- | :--- | :--- |
| **1.0.x (Escritorio Windows)** | :white_check_mark: Soportada | Versión canónica activa con persistencia local SQLite. |
| **< 1.0.0 (Prototipos Históricos)** | :x: No soportada | Versiones experimentales obsoletas (Dash/Streamlit). Retiradas. |

---

## 3. Principios de Protección de Datos en SISAP

1. **Local-First por Diseño:** La aplicación de escritorio almacena expedientes y notas en bases de datos SQLite locales dentro del entorno controlado del usuario o institución. No existe transmisión inadvertida a servidores remotos.
2. **Seudonimización Estricta:** La capa clínica opera mediante identificadores seudonimizados (e.g. `TUS-XXXX`), desacoplando los datos filiatorios de las evaluaciones psicométricas.
3. **Desacoplamiento de Modelos de IA:** Los pesos y parámetros del autoencoder canónico entrenado sobre pacientes reales están estrictamente excluidos de la distribución pública y resguardados en bóvedas institucionales de CENIVRA.
4. **Telemetría Responsable (Opt-In Estricto):** La telemetría de rendimiento está apagada de manera predeterminada. En caso de activación voluntaria, aplica filtros automáticos mediante listas de exclusión (*regex redaction*) para impedir la fuga de identificadores o notas clínicas.

---

## 4. Reporte Responsable de Vulnerabilidades

Si identifica una vulnerabilidad de seguridad o un vector potencial de fuga de información:

1. **NO abra un Issue público en GitHub** para describir vulnerabilidades de seguridad ni incidentes que involucren información confidencial.
2. Envíe un reporte detallado a través del canal privado de seguridad de GitHub:
   - Diríjase a la pestaña **Security** → **Advisories** → **Report a vulnerability**.
   - O bien, contacte directamente a la coordinación de gobernanza técnica de CENIVRA.
3. Proporcione una descripción técnica, vector de ataque teórico, pasos de reproducción con **datos sintéticos** y sugerencias de remediación.
4. El equipo confirmará la recepción en un plazo no mayor a 72 horas hábiles y coordinará una remediación antes de cualquier divulgación pública.
