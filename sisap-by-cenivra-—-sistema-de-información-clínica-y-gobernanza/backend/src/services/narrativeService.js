/**
 * Motor 3: Servicio de Inteligencia Narrativa y Conductual.
 * Audita explícitamente la disponibilidad del artefacto ONNX (bsc-bio-ehr-es) y ejecuta
 * análisis léxico-funcional determinista y trazable sobre narrativas semanales (q1..q8)
 * y notas clínicas, clasificando cada hallazgo con taxonomía E1..E5 y review_status obligatorio
 * 'pending_human_review'.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getDatabase } from '../db/index.js';
import { Errors } from '../utils/errors.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../../../..');
const NLP_DIR = path.join(REPO_ROOT, 'data', 'modelo', 'nlp', 'bsc-bio-ehr-es');

const PROCESS_MARKERS = [
  {
    process_id: 'craving_impulso',
    label: 'Señales de craving / urgencia de consumo',
    keywords: ['craving', 'ansia', 'ganas de consumir', 'urgencia', 'recaida', 'recaída', 'impulso', 'tentacion', 'tentación', 'consumir', 'abstener'],
    polarity: 'risk_signal',
  },
  {
    process_id: 'evitacion_experiencial',
    label: 'Evitación experiencial o aislamiento conductual',
    keywords: ['evitar', 'evitacion', 'evitación', 'aislar', 'aislado', 'no salir', 'encerr', 'rumia', 'pensar demasiado', 'miedo', 'bloqueo', 'escapar'],
    polarity: 'risk_signal',
  },
  {
    process_id: 'disregulacion_afectiva',
    label: 'Desregulación afectiva / ira / sobrecarga',
    keywords: ['enojo', 'rabia', 'ira', 'ansiedad', 'angustia', 'desesper', 'vacio', 'vacío', 'culpa', 'tristeza', 'estres', 'estrés', 'insomnio'],
    polarity: 'risk_signal',
  },
  {
    process_id: 'activacion_conductual_afrontamiento',
    label: 'Conductas de activación, valores y afrontamiento adaptativo',
    keywords: ['ejercicio', 'familia', 'trabajo', 'dormir mejor', 'tecnica', 'técnica', 'respiracion', 'respiración', 'logre', 'logré', 'apoyo', 'rutina', 'calma', 'afrontar', 'avance'],
    polarity: 'protective_signal',
  },
];

export function getNarrativeEngineRuntimeStatus() {
  const onnxPath = path.join(NLP_DIR, 'modelo.onnx');
  const configPath = path.join(NLP_DIR, 'config.json');
  const vocabPath = path.join(NLP_DIR, 'vocab.json');

  const hasOnnxFile = fs.existsSync(onnxPath);
  const onnxBytes = hasOnnxFile ? fs.statSync(onnxPath).size : 0;
  const hasConfig = fs.existsSync(configPath);
  const hasVocab = fs.existsSync(vocabPath);

  // Nota técnica: RoBERTa 12 capas completo requiere >400MB de pesos. 1.38MB sin external_data ni onnxruntime-node
  // indica artefacto incompleto para inferencia neuronal directa en runtime.
  const onnxInferenceReady = hasOnnxFile && onnxBytes > 20_000_000;

  return {
    engine_id: 'motor_3_narrative_behavioral',
    status: onnxInferenceReady ? 'active_neural_and_lexical' : 'active_lexical_deterministic_onnx_unavailable',
    onnx_artifact: {
      present: hasOnnxFile,
      size_bytes: onnxBytes,
      config_present: hasConfig,
      vocab_present: hasVocab,
      inference_ready: onnxInferenceReady,
      reason: onnxInferenceReady
        ? 'ONNX completo disponible'
        : 'modelo.onnx (1.38 MB) no contiene pesos densos completos de RoBERTa 12 capas ni runtime onnxruntime-node; activo módulo léxico determinista E1..E5.',
    },
    epistemological_guardrail: {
      evidence_taxonomy: 'E1_explicit..E5_insufficient',
      review_status_required: 'pending_human_review',
      diagnostic_inference_allowed: false,
    },
  };
}

function normalizeForMatch(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function analyzeSingleTextEntry(textRaw) {
  const clean = String(textRaw || '').trim();
  const tokens = clean ? clean.split(/\s+/).filter(Boolean) : [];
  const normalizedTokens = tokens.map((t) => normalizeForMatch(t).replace(/[^a-z0-9]/g, '')).filter(Boolean);
  const uniqueTokens = new Set(normalizedTokens);
  const sentences = clean ? clean.split(/[.!?]+/).filter((s) => s.trim().length > 0).length : 0;
  const lexicalDiversity = normalizedTokens.length > 0 ? Number((uniqueTokens.size / normalizedTokens.length).toFixed(4)) : 0;

  const normFull = normalizeForMatch(clean);
  const markersFound = [];

  for (const marker of PROCESS_MARKERS) {
    const matchedKeywords = [];
    for (const kw of marker.keywords) {
      const normKw = normalizeForMatch(kw);
      if (normFull.includes(normKw)) {
        matchedKeywords.push(kw);
      }
    }
    if (matchedKeywords.length > 0) {
      markersFound.push({
        process_id: marker.process_id,
        label: marker.label,
        polarity: marker.polarity,
        matched_keywords: matchedKeywords,
        hits: matchedKeywords.length,
        evidence_level: 'E1_explicit',
        review_status: 'pending_human_review',
      });
    }
  }

  return {
    char_count: clean.length,
    token_count: tokens.length,
    sentence_count: sentences,
    type_token_ratio: lexicalDiversity,
    evidence_sufficiency: tokens.length >= 12 ? 'sufficient_for_lexical_extraction' : 'E5_insufficient',
    markers: markersFound,
  };
}

export function analyzePatientNarratives(patientId) {
  const db = getDatabase();
  const patient = db.prepare('SELECT patient_id, pseudonym FROM patients WHERE patient_id = ?').get(patientId);
  if (!patient) throw Errors.notFound('Paciente no encontrado.');

  const weeklyRows = db
    .prepare(
      `SELECT observation_id, week_number, fecha_entrega, text_json, validation_state, analysis_state, creado_en
       FROM weekly_observations WHERE patient_id = ? ORDER BY week_number ASC`
    )
    .all(patientId);

  const initialNotes = db
    .prepare(
      `SELECT evaluation_id, fecha_eval, notas FROM initial_evaluations
       WHERE patient_id = ? ORDER BY fecha_eval ASC`
    )
    .all(patientId);

  const weeklyAnalyses = weeklyRows.map((row) => {
    let parsed = {};
    try {
      parsed = JSON.parse(row.text_json || '{}');
    } catch {
      parsed = {};
    }
    const combinedText = Object.values(parsed)
      .filter((v) => typeof v === 'string' && v.trim().length > 0)
      .join(' ');
    const lexical = analyzeSingleTextEntry(combinedText);
    return {
      observation_id: row.observation_id,
      week_number: row.week_number,
      fecha_entrega: row.fecha_entrega,
      responded_fields_count: Object.values(parsed).filter((v) => typeof v === 'string' && v.trim().length > 0).length,
      lexical_metrics: {
        char_count: lexical.char_count,
        token_count: lexical.token_count,
        sentence_count: lexical.sentence_count,
        type_token_ratio: lexical.type_token_ratio,
        evidence_sufficiency: lexical.evidence_sufficiency,
      },
      process_markers: lexical.markers,
      excerpt_anonymized_length: lexical.char_count,
    };
  });

  const baselineNotesAnalysis = initialNotes
    .filter((n) => n.notas && n.notas.trim().length > 0)
    .map((n) => {
      const lexical = analyzeSingleTextEntry(n.notas);
      return {
        evaluation_id: n.evaluation_id,
        fecha_eval: n.fecha_eval,
        evidence_level: 'E3_observational',
        lexical_metrics: {
          char_count: lexical.char_count,
          token_count: lexical.token_count,
          type_token_ratio: lexical.type_token_ratio,
        },
        process_markers: lexical.markers,
      };
    });

  const aggregateProcessCounts = {};
  for (const w of weeklyAnalyses) {
    for (const m of w.process_markers) {
      aggregateProcessCounts[m.process_id] = (aggregateProcessCounts[m.process_id] || 0) + m.hits;
    }
  }

  return {
    engine_status: getNarrativeEngineRuntimeStatus(),
    patient_id: patient.patient_id,
    pseudonym: patient.pseudonym,
    summary: {
      weekly_observations_analyzed: weeklyAnalyses.length,
      clinician_notes_analyzed: baselineNotesAnalysis.length,
      aggregate_process_hits: aggregateProcessCounts,
      overall_evidence_status:
        weeklyAnalyses.length === 0 && baselineNotesAnalysis.length === 0
          ? 'E5_insufficient'
          : 'exploratory_lexical_evidence',
      review_status: 'pending_human_review',
    },
    weekly_series: weeklyAnalyses,
    baseline_notes: baselineNotesAnalysis,
  };
}
