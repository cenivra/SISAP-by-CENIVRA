# Declaración de Privacidad y Manejo de Información · SISAP by CENIVRA

## 1. Compromiso con la Privacidad del Paciente

SISAP by CENIVRA ha sido concebido desde sus cimientos arquitectónicos bajo el paradigma de **Privacidad por Diseño** (*Privacy by Design*) y conforme a la **Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP)** de México y la **NOM-024-SSA3-2012**.

En el tratamiento de personas con trastornos por uso de sustancias (TUS), los datos de salud revisten la categoría de **datos personales sensibles**, exigiendo salvaguardas de nivel máximo.

---

## 2. Principios Operativos de la Distribución Pública

### 2.1 Almacenamiento Local (Local-First)
- La aplicación de escritorio SISAP funciona de manera predeterminada como un sistema local. Todos los registros clínicos, evaluaciones psicométricas, escalas y notas de evolución se almacenan en una base de datos local SQLite en la estación del usuario o institución.
- No existe transmisión automática de datos clínicos a ningún servidor externo, API de terceros ni nube pública.

### 2.2 Seudonimización
- Los registros se vinculan a través de identificadores alfanuméricos seudonimizados (e.g. `TUS-XXXX`).
- La correspondencia entre el seudónimo clínico y la identidad civil del paciente queda bajo la exclusiva custodia física y legal de la institución tratante.

### 2.3 Desacoplamiento de Modelos e Inferencia Canónica
- Esta distribución pública **no incluye** pesos neuronales entrenados ni matrices derivadas de expedientes clínicos reales.
- El módulo de **Simulador del Autoencoder** incluido en esta versión opera de forma aislada y utiliza exclusivamente **arquetipos y datos 100% sintéticos**, sin conexión con expedientes reales.

---

## 3. Política de Telemetría Anónima (Opt-In Estricto)

SISAP incluye un mecanismo de telemetría orientado a métricas técnicas de rendimiento y estabilidad del sistema bajo las siguientes garantías legales y técnicas:

1. **Desactivada por Defecto:** La telemetría permanece inactiva de fábrica. No se recolecta ningún evento a menos que el usuario la active deliberadamente.
2. **Censura Automática de Datos (Blacklist Sanitization):** En caso de activarse, todo texto de evento es filtrado mediante expresiones regulares para censurar identificadores de pacientes (`TUS-\d+`), CURP, cédulas profesionales, diagnósticos y términos clínicos sensibles.
3. **Auditoría Local Transparente:** Los eventos registrados se guardan en un búfer local visible en la interfaz (`Gobernanza de Telemetría`), el cual puede ser inspeccionado en pantalla, exportado a JSON o borrado permanentemente por el usuario en cualquier momento.
4. **Sin Huella de Identificación:** No se transmiten cookies persistentes, nombres de usuario ni direcciones IP de red vinculadas a pacientes.

---

## 4. Contacto y Consultas de Gobernanza

Para consultas relacionadas con bioética, transferencia tecnológica o gobernanza de datos en SISAP by CENIVRA, consulte los lineamientos en el archivo [SECURITY.md](SECURITY.md).
