/**
 * Logger del backend.
 *
 * REGLA DE PRIVACIDAD (ver 04_matriz_gobernanza_datos.md):
 *   NUNCA registrar nombres, CURP, narraciones ni contenido clínico.
 *   Este logger aplica una lista de claves sensibles que se enmascaran.
 */
const SENSITIVE_KEYS = new Set([
  'nombre_completo',
  'nombre',
  'curp',
  'contacto_emergencia',
  'telefono_emergencia',
  'text_json',
  'items_json',
  'vector24_json',
  'values_json',
  'diagnostico_impresion',
  'notas',
  'details',
  'q1_descripcion',
  'q2_desafios',
  'q3_estrategias',
  'q4_emociones',
  'q5_progresos',
  'q6_reflexiones',
  'q7_metas',
  'q8_comentarios',
]);

function redact(value, depth = 0) {
  if (depth > 4) return '[depth-limit]';
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map((v) => redact(v, depth + 1));
  if (typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = SENSITIVE_KEYS.has(k) ? '[REDACTED]' : redact(v, depth + 1);
    }
    return out;
  }
  return value;
}

function write(level, message, meta) {
  const line = {
    ts: new Date().toISOString(),
    level,
    msg: message,
  };
  if (meta !== undefined) line.meta = redact(meta);
  const out = JSON.stringify(line);
  if (level === 'error') process.stderr.write(out + '\n');
  else process.stdout.write(out + '\n');
}

export const logger = {
  info: (msg, meta) => write('info', msg, meta),
  warn: (msg, meta) => write('warn', msg, meta),
  error: (msg, meta) => write('error', msg, meta),
  debug: (msg, meta) => {
    if (!config_isProd()) write('debug', msg, meta);
  },
};

function config_isProd() {
  return process.env.NODE_ENV === 'production';
}
