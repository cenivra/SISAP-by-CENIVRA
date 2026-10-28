/**
 * Enrutador del backend local. Todas las consultas son parametrizadas.
 */
import {
  searchPatients,
  getRecord,
  getPatientById,
  createPatient,
  findDuplicates,
} from '../services/patientService.js';
import { createEvaluation, createWeeklyObservation } from '../services/evaluationService.js';
import { recordRun, listRuns } from '../services/modelRunService.js';
import { recordEvent, listEvents, verifyChain } from '../services/auditService.js';
import { healthCheck } from '../db/index.js';
import { Errors } from '../utils/errors.js';

/**
 * Define las rutas. Devuelve { matched, status, body } o null si no coincide.
 * `ctx` = { method, url, query, body, io }
 */
export async function route(ctx) {
  const { method, pathname, query, body } = ctx;

  // ---- Health -------------------------------------------------------------
  if (method === 'GET' && pathname === '/api/health') {
    const h = healthCheck();
    return { status: h.ok ? 200 : 503, body: h };
  }

  if (method === 'GET' && pathname === '/api/migrations/status') {
    const h = healthCheck();
    return {
      status: 200,
      body: {
        migrationsApplied: h.migrationsApplied,
        tablesPresent: h.tables,
        missingTables: h.missingTables,
        dbPath: h.dbPath,
      },
    };
  }

  // ---- Pacientes ----------------------------------------------------------
  if (method === 'GET' && pathname === '/api/patients/search') {
    const q = query.get('q') || '';
    const results = searchPatients(q, { limit: 10 });
    recordEvent({ action: 'patient.search', details: `resultados=${results.length}` });
    return { status: 200, body: { results, count: results.length } };
  }

  if (method === 'GET' && pathname === '/api/patients/duplicates') {
    const nombre = query.get('nombre_completo') || '';
    const curp = query.get('curp') || '';
    const results = findDuplicates({ nombre_completo: nombre, curp });
    return { status: 200, body: { results, count: results.length } };
  }

  let m;

  if (method === 'GET' && (m = pathname.match(/^\/api\/patients\/([^/]+)\/record$/))) {
    const patientId = decodeURIComponent(m[1]);
    const patient = getPatientById(patientId);
    if (!patient) throw Errors.notFound('Paciente no encontrado.');
    const record = getRecord(patientId);
    recordEvent({
      action: 'patient.record.read',
      subjectPseudonym: patient.pseudonym,
      details: 'lectura de expediente',
    });
    return { status: 200, body: record };
  }

  if (method === 'POST' && pathname === '/api/patients') {
    const allowDuplicate = body && body.allow_duplicate === true;
    const created = await createPatient(body, { allowDuplicate });
    recordEvent({
      action: 'patient.create',
      subjectPseudonym: created.patient.pseudonym,
      details: allowDuplicate ? 'creación con confirmación de duplicado' : 'creación',
    });
    return { status: 201, body: created };
  }

  // ---- Evaluaciones -------------------------------------------------------
  if (method === 'POST' && pathname === '/api/evaluations') {
    const res = createEvaluation(body, {});
    recordEvent({ action: 'evaluation.create', details: `evaluation_id=${res.evaluation_id}` });
    return { status: 201, body: res };
  }

  // ---- Observaciones semanales -------------------------------------------
  if (method === 'POST' && pathname === '/api/weekly-observations') {
    const res = createWeeklyObservation(body, {});
    recordEvent({ action: 'weekly.create', details: `observation_id=${res.observation_id}` });
    return { status: 201, body: res };
  }

  // ---- Model runs (trazabilidad) -----------------------------------------
  if (method === 'POST' && pathname === '/api/model-runs') {
    const res = recordRun(body, {});
    recordEvent({ action: 'model_run.record', details: `run_id=${res.run_id} state=${res.state}` });
    return { status: 201, body: res };
  }

  if (method === 'GET' && pathname === '/api/model-runs') {
    return { status: 200, body: { runs: listRuns({ limit: 50 }) } };
  }

  // ---- Auditoría ----------------------------------------------------------
  if (method === 'GET' && pathname === '/api/audit/events') {
    const limit = parseInt(query.get('limit') || '50', 10);
    return { status: 200, body: { events: listEvents({ limit }) } };
  }

  if (method === 'GET' && pathname === '/api/audit/verify') {
    return { status: 200, body: verifyChain() };
  }

  return null;
}
