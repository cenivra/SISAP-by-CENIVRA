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
import {
  getAutoencoderStatusAndReference,
  executeAutoencoderInference,
  inferCandidate17ForComparison,
} from '../services/autoencoderService.js';
import {
  createFollowUpEvaluation,
  listFollowUpEvaluations,
} from '../services/analyticalService.js';
import { getNarrativeEngineRuntimeStatus } from '../services/narrativeService.js';
import {
  getPatientDecisionSupportReport,
  createClinicalFormulation,
} from '../services/decisionSupportService.js';
import {
  isInstrumentExcluded,
  listActiveInstruments,
} from '../psychometrics/instrumentCatalog.js';
import { scorePsychometricEvaluation } from '../psychometrics/scoringEngine.js';
import {
  getPsychometricEvaluationById,
  listPatientPsychometricEvaluations,
  recalculateEvaluationResults,
  savePsychometricEvaluation,
} from '../services/psychometricService.js';

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

  // ---- Motores de Inteligencia (1..5) y Seguimiento ----------------------
  if (method === 'GET' && pathname === '/api/engines/status') {
    const ae = getAutoencoderStatusAndReference();
    const narr = getNarrativeEngineRuntimeStatus();
    return {
      status: 200,
      body: {
        motors: {
          motor_1_autoencoder: {
            status: ae.status,
            default_model_id: ae.default_model_id,
            canonical_reference_cohort_n: ae.canonical_reference_cohort_n,
            integrity_verified: ae.integrity.verified,
            verified_artifacts_count: ae.integrity.verified_artifacts_count,
            models: ae.models,
          },
          motor_2_analytical_longitudinal: { status: 'active_jacobson_truax_and_deltas' },
          motor_3_narrative_behavioral: narr,
          motor_4_multimodal_integration: { status: 'active_provenance_aligned' },
          motor_5_decision_support: {
            status: 'active_evidence_e1_e5_human_review_required',
            automatic_diagnosis_allowed: false,
          },
        },
      },
    };
  }

  if (method === 'GET' && pathname === '/api/engines/autoencoder/reference') {
    return { status: 200, body: getAutoencoderStatusAndReference() };
  }

  if (method === 'POST' && pathname === '/api/engines/autoencoder/infer') {
    const res = executeAutoencoderInference(body, {});
    const httpStatus = res.status === 'failed' ? 422 : 200;
    return { status: httpStatus, body: res };
  }

  if (method === 'POST' && pathname === '/api/engines/autoencoder/candidate17/infer') {
    const res = inferCandidate17ForComparison(body);
    return { status: res.status === 'REJECTED' ? 422 : 200, body: res };
  }

  if (method === 'POST' && pathname === '/api/follow-ups') {
    const res = createFollowUpEvaluation(body, {});
    return { status: 201, body: res };
  }

  if (method === 'GET' && (m = pathname.match(/^\/api\/patients\/([^/]+)\/follow-ups$/))) {
    const patientId = decodeURIComponent(m[1]);
    const patient = getPatientById(patientId);
    if (!patient) throw Errors.notFound('Paciente no encontrado.');
    const items = listFollowUpEvaluations(patientId);
    return { status: 200, body: { patient_id: patientId, count: items.length, follow_ups: items } };
  }

  if (method === 'GET' && (m = pathname.match(/^\/api\/patients\/([^/]+)\/intelligence$/))) {
    const patientId = decodeURIComponent(m[1]);
    const report = getPatientDecisionSupportReport(patientId);
    recordEvent({
      action: 'patient.intelligence.read',
      subjectPseudonym: report.patient.pseudonym,
      details: `modalities=${report.multimodal_alignment.active_modalities}/5`,
    });
    return { status: 200, body: report };
  }

  if (method === 'POST' && (m = pathname.match(/^\/api\/patients\/([^/]+)\/formulations$/))) {
    const patientId = decodeURIComponent(m[1]);
    const created = createClinicalFormulation(patientId, body, {});
    return { status: 201, body: created };
  }

  // ---- Centro de Evaluación Psicométrica (3 Niveles) ----------------------
  if (method === 'GET' && pathname === '/api/psychometrics/catalog') {
    return { status: 200, body: listActiveInstruments() };
  }

  if (method === 'POST' && pathname === '/api/psychometrics/score') {
    if (!body || typeof body !== 'object') {
      throw Errors.badRequest('Cuerpo JSON inválido para cálculo psicométrico.');
    }
    const inst = String(body.instrument_id || body.instrumentId || '').trim();
    if (isInstrumentExcluded(inst)) {
      throw Errors.badRequest(`El instrumento ${inst} está excluido del catálogo activo.`);
    }
    try {
      const scored = scorePsychometricEvaluation({
        instrumentId: inst,
        instrumentVersion: body.instrument_version || body.instrumentVersion,
        responses: body.responses || [],
        optionalComplements: body.optional_complements || body.complements || {},
        scoringMode: body.scoring_mode || 'manual_estandar',
      });
      return { status: 200, body: scored };
    } catch (err) {
      throw Errors.badRequest(err.message);
    }
  }

  if (method === 'POST' && pathname === '/api/psychometrics/evaluations') {
    const bundle = savePsychometricEvaluation(body, {});
    const isCompleted = bundle.evaluation?.application_status === 'completed';
    return { status: isCompleted ? 201 : 200, body: bundle };
  }

  if (method === 'GET' && (m = pathname.match(/^\/api\/patients\/([^/]+)\/psychometrics$/))) {
    const patientId = decodeURIComponent(m[1]);
    const data = listPatientPsychometricEvaluations(patientId);
    return { status: 200, body: data };
  }

  if (method === 'GET' && (m = pathname.match(/^\/api\/psychometrics\/evaluations\/([^/]+)$/))) {
    const evalId = decodeURIComponent(m[1]);
    const bundle = getPsychometricEvaluationById(evalId);
    return { status: 200, body: bundle };
  }

  if (method === 'POST' && (m = pathname.match(/^\/api\/psychometrics\/evaluations\/([^/]+)\/recalculate$/))) {
    const evalId = decodeURIComponent(m[1]);
    const bundle = recalculateEvaluationResults(evalId, { scoringMode: body?.scoring_mode });
    return { status: 200, body: bundle };
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
