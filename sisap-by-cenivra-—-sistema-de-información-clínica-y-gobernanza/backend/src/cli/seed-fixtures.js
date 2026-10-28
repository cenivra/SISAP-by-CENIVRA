/**
 * CLI: carga de datos de PRUEBA sintéticos (fixtures).
 *
 * - Es una acción EXPLÍCITA de desarrollo; no se ejecuta en la inicialización.
 * - Todos los registros se marcan es_dato_prueba = 1.
 * - Nombres inequívocamente identificables como prueba (PACIENTE PRUEBA NN).
 * - NO se usan expedientes reales ni narraciones clínicas reales.
 */
import { openDatabase, closeDatabase } from '../db/index.js';
import { createPatient, searchPatients } from '../services/patientService.js';
import { createEvaluation, createWeeklyObservation } from '../services/evaluationService.js';
import { recordEvent } from '../services/auditService.js';

const FIXTURES = [
  {
    nombre_completo: 'PACIENTE PRUEBA UNO',
    curp: null,
    expediente_fisico: 'EXP-TEST-0001',
    fecha_nacimiento: '1990-01-01',
    edad: 35,
    sexo: 'M',
    estado: 'Residencial',
    droga_impacto: 'SIN DATO (PRUEBA)',
    diagnostico_cie: 'TEST-N/A',
    ingreso: '2026-01-01',
  },
  {
    nombre_completo: 'PACIENTE PRUEBA DOS',
    curp: null,
    expediente_fisico: 'EXP-TEST-0002',
    fecha_nacimiento: '1992-02-02',
    edad: 33,
    sexo: 'F',
    estado: 'Ambulatorio',
    droga_impacto: 'SIN DATO (PRUEBA)',
    diagnostico_cie: 'TEST-N/A',
    ingreso: '2026-02-01',
  },
  {
    nombre_completo: 'PACIENTE PRUEBA TRES',
    curp: null,
    expediente_fisico: 'EXP-TEST-0003',
    fecha_nacimiento: '1988-03-03',
    edad: 38,
    sexo: 'M',
    estado: 'Seguimiento',
    droga_impacto: 'SIN DATO (PRUEBA)',
    diagnostico_cie: 'TEST-N/A',
    ingreso: '2026-03-01',
  },
];

const db = openDatabase({ quiet: true });
const created = [];

for (const f of FIXTURES) {
  // Evita duplicar fixtures en ejecuciones repetidas
  const existing = searchPatients(f.nombre_completo, { limit: 10 });
  if (existing.length > 0) {
    created.push({ nombre: f.nombre_completo, skipped: true, pseudonym: existing[0].pseudonym });
    continue;
  }
  const rec = createPatient({ ...f, es_dato_prueba: true }, { allowDuplicate: true });
  created.push({ nombre: f.nombre_completo, pseudonym: rec.patient.pseudonym, patient_id: rec.patient.patient_id });

  // Evaluación sintética con respuestas y scores marcados como prueba
  createEvaluation({
    patient_id: rec.patient.patient_id,
    fecha_eval: '2026-04-01',
    aplico: 'fixture',
    vector24: Object.fromEntries(
      ['BIS_11BIS_motor','BIS_11BIS_nonplanning','BIS_11BIS_cognitive_instability','BIS_11BIS_perseverance',
       'BIS_11BIS_motor_impulsivity','BIS_11BIS_total_calculado','compuesto_bis','STAXI_2STAXI_state',
       'STAXI_2STAXI_trait','STAXI_2STAXI_temperamento','compuesto_staxi','BSL_23BSL_general',
       'BSL_23BSL_total_integrado','compuesto_bsl','GAD_7GAD_zscore','BADS_bads_activation',
       'BADS_bads_avoidance','BADS_bads_work','BADS_bads_social','edad','tiempo_consumo','trat_previos',
       'tiempo_consumoEROS','trat_previosEROS'].map((k) => [k, 0])
    ),
    responses: [
      { instrument: 'BIS_11', items: Array.from({ length: 30 }, (_, i) => (i % 4) + 1) },
      { instrument: 'BSL_23', items: Array.from({ length: 23 }, () => 1) },
      { instrument: 'GAD_7', items: Array.from({ length: 7 }, () => 1) },
      { instrument: 'STAXI_2', items: Array.from({ length: 49 }, () => 1) },
      { instrument: 'BADS', items: Array.from({ length: 25 }, () => 3) },
      { instrument: 'EROS', items: Array.from({ length: 10 }, () => 1) },
    ],
    scores: [
      { instrument: 'BIS_11', subscale: 'total', value: 0 },
      { instrument: 'BADS', subscale: 'activation', value: 21 },
    ],
  });

  // Observación semanal sintética (sin contenido clínico real)
  createWeeklyObservation({
    patient_id: rec.patient.patient_id,
    week_number: 1,
    fecha_entrega: '2026-04-08',
    text: {
      q1_descripcion: '[FIXTURE DE PRUEBA — texto sintético]',
      q2_desafios: '[FIXTURE DE PRUEBA]',
      q3_estrategias: '[FIXTURE DE PRUEBA]',
      q4_emociones: '[FIXTURE DE PRUEBA]',
      q5_progresos: '[FIXTURE DE PRUEBA]',
      q6_reflexiones: '[FIXTURE DE PRUEBA]',
      q7_metas: '[FIXTURE DE PRUEBA]',
      q8_comentarios: '[FIXTURE DE PRUEBA]',
    },
  });
}

recordEvent({ action: 'fixtures.seed', details: `creados/saltados=${created.length}` });
closeDatabase();

console.log(JSON.stringify({ ok: true, fixtures: created }, null, 2));
