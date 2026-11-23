import React, { useState, useEffect, useMemo } from 'react';
import {
  Activity,
  AlertTriangle,
  BrainCircuit,
  CheckCircle2,
  Cpu,
  Download,
  FileText,
  GitCompare,
  Layers,
  MessageSquareText,
  Scale,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { RoleConfig, UserAccount } from '../../types/clinical';
import { StorageService } from '../../services/storageService';
import {
  AutoencoderEngine,
  AutoencoderInferenceResult,
  VerifiedModelId,
} from '../../services/autoencoderEngine';
import {
  assemble24Vector,
  computeBads,
  computeBis11,
  computeBsl23,
  computeEros,
  computeGad7,
  computeStaxi2,
  parseRawNumbers,
  validateCompleteEvaluationD06,
  ScoringMode,
} from '../../services/scalesEngine';
import { PatientApiService, EnginesStatusResponse } from '../../services/patientApiService';
import { PERCENTILES_REFERENCIA_12D } from '../../data/autoencoderData';
import { LatentIntervalChart } from '../LatentIntervalChart';
import { ReconstructionBarsChart } from '../ReconstructionBarsChart';

interface IntelligenceEcosystemViewProps {
  currentUser: UserAccount;
  roleConfig: RoleConfig;
  selectedPseudonym: string;
}

type MotorTab = 'motor1' | 'motor2' | 'motor3' | 'motor4' | 'motor5';

const PROCESS_LEXICON = [
  {
    id: 'craving_impulso',
    label: 'Señales de craving / urgencia de consumo',
    keywords: ['craving', 'ansia', 'ganas de consumir', 'urgencia', 'recaida', 'recaída', 'impulso', 'tentacion', 'tentación', 'consumir'],
    polarity: 'riesgo',
  },
  {
    id: 'evitacion_experiencial',
    label: 'Evitación experiencial / aislamiento',
    keywords: ['evitar', 'evitacion', 'evitación', 'aislar', 'aislado', 'no salir', 'encerr', 'rumia', 'miedo', 'bloqueo'],
    polarity: 'riesgo',
  },
  {
    id: 'disregulacion_afectiva',
    label: 'Desregulación afectiva / sobrecarga',
    keywords: ['enojo', 'rabia', 'ira', 'ansiedad', 'angustia', 'desesper', 'vacio', 'vacío', 'culpa', 'tristeza', 'estres', 'estrés', 'insomnio'],
    polarity: 'riesgo',
  },
  {
    id: 'activacion_afrontamiento',
    label: 'Activación conductual / afrontamiento',
    keywords: ['ejercicio', 'familia', 'trabajo', 'dormir mejor', 'tecnica', 'técnica', 'respiracion', 'respiración', 'logre', 'logré', 'apoyo', 'rutina', 'afrontar', 'avance'],
    polarity: 'protector',
  },
];

const RCI_PARAMS: Record<string, { sd: number; rxx: number; higherIsWorse: boolean }> = {
  'GAD-7': { sd: 5.853773711604051, rxx: 0.83, higherIsWorse: true },
  'BSL-23': { sd: 24.56472699502826, rxx: 0.82, higherIsWorse: true },
  EROS: { sd: 6.95, rxx: 0.85, higherIsWorse: false },
  BADS: { sd: 22.4, rxx: 0.74, higherIsWorse: false },
};

function normalizeText(raw: string): string {
  return raw
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export const IntelligenceEcosystemView: React.FC<IntelligenceEcosystemViewProps> = ({
  currentUser,
  roleConfig,
  selectedPseudonym,
}) => {
  const [activeTab, setActiveTab] = useState<MotorTab>('motor1');
  const [selectedModelId, setSelectedModelId] = useState<VerifiedModelId>('encoder_22_checkpoint_fase2');
  const [compareTargetExp, setCompareTargetExp] = useState<string>('COHORT_MEDIAN_P50');
  const [engineStatus, setEngineStatus] = useState<EnginesStatusResponse | null>(null);
  const [backendConnected, setBackendConnected] = useState<boolean>(false);

  // Motor 5 formulación trazable
  const [formulationSummary, setFormulationSummary] = useState<string>('');
  const [formulationEvidence, setFormulationEvidence] = useState<
    'E1_explicit' | 'E2_contextual' | 'E3_observational' | 'E4_latent_hypothesis' | 'E5_insufficient'
  >('E4_latent_hypothesis');
  const [formulationSavedMsg, setFormulationSavedMsg] = useState<string | null>(null);
  const [localFormulations, setLocalFormulations] = useState<
    Array<{
      id: string;
      fecha: string;
      evidence: string;
      review_status: string;
      summary: string;
      author: string;
    }>
  >([]);

  useEffect(() => {
    let active = true;
    PatientApiService.getEnginesStatus()
      .then((res) => {
        if (!active) return;
        setEngineStatus(res);
        setBackendConnected(true);
      })
      .catch(() => {
        if (!active) return;
        setBackendConnected(false);
      });
    return () => {
      active = false;
    };
  }, [selectedPseudonym]);

  const allPatients = StorageService.getPatients();
  const activePatient = StorageService.getPatient(selectedPseudonym);
  const initialEvals = StorageService.getEvaluations(selectedPseudonym);
  const latestEval = initialEvals[0];
  const followUps = StorageService.getFollowUpEvaluations(selectedPseudonym);
  const weeklyNarratives = StorageService.getWeeklyNarratives(selectedPseudonym);
  const evolutionNotes = StorageService.getEvolutionNotes(selectedPseudonym);

  // Evaluar Motor 1 (Autoencoder) estrictamente bajo compuerta D-06
  const motor1State = useMemo(() => {
    if (!latestEval) {
      return { ready: false, reason: 'Sin evaluación psicométrica inicial registrada para este expediente.', result: null };
    }
    const mode: ScoringMode = latestEval.modo_scoring || 'excel_canonico';
    const behRaw = latestEval.raw_bsl_23_conductual || '';
    const bslGen = latestEval.bsl_general_0_1 ?? latestEval.calculados?.bsl_general ?? Number.NaN;

    const d06 = validateCompleteEvaluationD06({
      edad: latestEval.edad,
      tiempo_consumo: latestEval.tiempo_consumo_anios,
      trat_previos: latestEval.tratamientos_previos_cuenta,
      raw_bis_11: latestEval.raw_bis_11 || '',
      raw_bsl_23: latestEval.raw_bsl_23 || '',
      raw_bsl_23_conductual: behRaw,
      bsl_general_0_1: bslGen,
      raw_gad_7: latestEval.raw_gad_7 || '',
      raw_staxi_2: latestEval.raw_staxi_2 || '',
      raw_bads: latestEval.raw_bads || '',
      raw_eros: latestEval.raw_eros || '',
      modo_scoring: mode,
    });

    if (!d06.valido) {
      return {
        ready: false,
        reason: `Captura inicial incompleta bajo regla D-06 (${d06.n_incidencias} incidencias: ej. ${d06.incidencias[0]?.mensaje || 'faltan reactivos'}).`,
        incidents: d06.incidencias,
        result: null,
      };
    }

    const bis = computeBis11(parseRawNumbers(latestEval.raw_bis_11, 30, 2), mode);
    const bsl = computeBsl23(
      parseRawNumbers(latestEval.raw_bsl_23, 23, 0),
      parseRawNumbers(behRaw, 11, 0),
      bslGen
    );
    const gad = computeGad7(parseRawNumbers(latestEval.raw_gad_7, 7, 0));
    const staxi = computeStaxi2(parseRawNumbers(latestEval.raw_staxi_2, 49, 1));
    const bads = computeBads(parseRawNumbers(latestEval.raw_bads, 25, 0));
    const eros = computeEros(parseRawNumbers(latestEval.raw_eros, 10, 1), mode);

    const v24 = assemble24Vector({
      bis,
      staxi,
      bsl,
      gad,
      bads,
      erosTotal: eros,
      edad: latestEval.edad,
      tiempoConsumo: latestEval.tiempo_consumo_anios,
      tratPrevios: latestEval.tratamientos_previos_cuenta,
      sustanciaPrincipal: latestEval.sustancia_principal,
    });

    const result: AutoencoderInferenceResult = AutoencoderEngine.runVerifiedInference(v24, selectedModelId);
    return { ready: true, reason: 'Pipeline D-06 completo y pesos verificados.', result };
  }, [latestEval, selectedModelId]);

  // Motor 2: Series longitudinales + RCI
  const motor2Trajectories = useMemo(() => {
    const series: Record<
      string,
      Array<{ date: string; label: string; value: number; source: string }>
    > = {};

    if (latestEval?.calculados) {
      const baseDate = latestEval.fecha_eval;
      series['GAD-7'] = [
        { date: baseDate, label: 'T0 Basal', value: latestEval.calculados.gad_total, source: 'Evaluación inicial' },
      ];
      series['BSL-23'] = [
        { date: baseDate, label: 'T0 Basal', value: latestEval.calculados.bsl_total_integrado, source: 'Evaluación inicial' },
      ];
      series['EROS'] = [
        { date: baseDate, label: 'T0 Basal', value: latestEval.calculados.eros_total, source: 'Evaluación inicial' },
      ];
      const badsSum =
        latestEval.calculados.bads_activation +
        latestEval.calculados.bads_avoidance +
        latestEval.calculados.bads_work +
        latestEval.calculados.bads_social;
      series['BADS'] = [{ date: baseDate, label: 'T0 Basal', value: badsSum, source: 'Evaluación inicial' }];
    }

    for (const fu of followUps) {
      if (!series[fu.instrument]) series[fu.instrument] = [];
      series[fu.instrument].push({
        date: fu.evaluation_date,
        label: fu.session_number ? `S${fu.session_number}` : fu.evaluation_date,
        value: fu.total_score,
        source: 'Seguimiento longitudinal',
      });
    }

    return Object.entries(series).map(([instrument, points]) => {
      const sorted = [...points].sort((a, b) => a.date.localeCompare(b.date));
      const first = sorted[0];
      const last = sorted[sorted.length - 1];
      const delta = sorted.length >= 2 ? Number((last.value - first.value).toFixed(2)) : null;
      let rci: number | null = null;
      let rciLabel = sorted.length < 2 ? 'E5 · < 2 mediciones' : 'Sin parámetros RCI normativos';
      const p = RCI_PARAMS[instrument];
      if (sorted.length >= 2 && p) {
        const seDiff = p.sd * Math.sqrt(2 * (1 - p.rxx));
        rci = Number(((last.value - first.value) / seDiff).toFixed(3));
        if (Math.abs(rci) >= 1.96) {
          const improved = p.higherIsWorse ? rci < -1.96 : rci > 1.96;
          rciLabel = improved ? `Cambio confiable favorable (RCI=${rci})` : `Deterioro confiable (RCI=${rci})`;
        } else {
          rciLabel = `Sin cambio confiable (|RCI|<1.96 · ${rci})`;
        }
      }
      return { instrument, points: sorted, first, last, delta, rci, rciLabel };
    });
  }, [latestEval, followUps]);

  // Motor 3: Evidencia léxica y conductual E1..E5
  const motor3Analysis = useMemo(() => {
    const entries = [
      ...weeklyNarratives.map((w) => ({
        id: w.id,
        label: `Semana ${w.semana} (${w.fecha_entrega})`,
        sourceType: 'E1_explicit' as const,
        text: [
          w.q1_descripcion,
          w.q2_desafios,
          w.q3_estrategias,
          w.q4_emociones,
          w.q5_progresos,
          w.q6_reflexiones,
          w.q7_metas,
          w.q8_comentarios,
        ]
          .filter(Boolean)
          .join(' '),
      })),
      ...evolutionNotes.map((e) => ({
        id: e.id,
        label: `Nota sesión ${e.sesion} (${e.fecha})`,
        sourceType: 'E3_observational' as const,
        text: `${e.objetivo} ${e.resumen} ${e.resultado} ${e.observaciones}`,
      })),
    ];

    const analyzed = entries.map((entry) => {
      const clean = entry.text.trim();
      const tokens = clean ? clean.split(/\s+/).filter(Boolean) : [];
      const unique = new Set(tokens.map((t) => normalizeText(t).replace(/[^a-z0-9]/g, '')).filter(Boolean));
      const ttr = tokens.length > 0 ? Number((unique.size / tokens.length).toFixed(3)) : 0;
      const norm = normalizeText(clean);

      const markers = PROCESS_LEXICON.map((proc) => {
        const matched = proc.keywords.filter((kw) => norm.includes(normalizeText(kw)));
        return matched.length > 0
          ? {
              id: proc.id,
              label: proc.label,
              polarity: proc.polarity,
              matched,
              evidenceLevel: tokens.length < 8 ? 'E5_insufficient' : entry.sourceType,
              reviewStatus: 'pending_human_review',
            }
          : null;
      }).filter(Boolean);

      return {
        ...entry,
        tokenCount: tokens.length,
        ttr,
        markers,
      };
    });

    return {
      totalEntries: analyzed.length,
      analyzed,
      onnxStatusText:
        engineStatus?.motors.motor_3_narrative_behavioral.onnx_artifact.reason ||
        'modelo.onnx (1.38 MB) sin pesos completos de RoBERTa ni onnxruntime-node en ejecución; módulo léxico determinista E1..E5 activo.',
    };
  }, [weeklyNarratives, evolutionNotes, engineStatus]);

  // Motor 4: Matriz multimodal
  const motor4Matrix = [
    {
      fuente: 'Sociodemográfico y Consumo',
      tablas: 'patients · clinical_records',
      granularidad: 'Fijo / Episodio',
      temporalidad: activePatient?.ingreso || '—',
      completitud: activePatient ? '100%' : '0%',
      calidad: activePatient ? 'Verificado' : 'E5_insufficient',
    },
    {
      fuente: 'Batería Inicial (6 Escalas)',
      tablas: 'initial_evaluations · scale_responses',
      granularidad: 'Ítem crudo (144+) + Subescalas',
      temporalidad: latestEval?.fecha_eval || '—',
      completitud: motor1State.ready ? '100% (D-06 OK)' : latestEval ? 'Parcial (falta D-06)' : '0%',
      calidad: motor1State.ready ? 'E1_explicit · EROS separado' : 'Bloqueado D-06',
    },
    {
      fuente: 'Representación Latente 12D',
      tablas: 'model_runs · model_outputs',
      granularidad: 'Vector continuo 12D + MSE_z',
      temporalidad: motor1State.result?.timestamp.slice(0, 10) || '—',
      completitud: motor1State.ready ? '100%' : '0%',
      calidad: motor1State.ready ? `E4_latent · ${selectedModelId}` : 'E5_insufficient',
    },
    {
      fuente: 'Seguimientos Longitudinales',
      tablas: 'follow_up_evaluations',
      granularidad: 'Sesión y Fecha',
      temporalidad: followUps.length > 0 ? `${followUps.length} mediciones` : '—',
      completitud: followUps.length > 0 ? 'Activa' : '0%',
      calidad: followUps.length > 0 ? 'E1_explicit · Series RCI' : 'E5_insufficient',
    },
    {
      fuente: 'Narrativas y Evolución Clínica',
      tablas: 'weekly_observations · notas',
      granularidad: 'Semanal textual q1..q8',
      temporalidad: weeklyNarratives.length + evolutionNotes.length > 0 ? `${weeklyNarratives.length} sem · ${evolutionNotes.length} notas` : '—',
      completitud: weeklyNarratives.length + evolutionNotes.length > 0 ? 'Activa' : '0%',
      calidad: 'Léxico E1/E3 · Revisión humana pendiente',
    },
  ];

  // Comparador geométrico de vectores latentes (Motor 5)
  const comparisonResult = useMemo(() => {
    if (!motor1State.ready || !motor1State.result) return null;
    const vecA = motor1State.result.latentDimensions.map((d) => d.rawValue);
    let vecB: number[] = PERCENTILES_REFERENCIA_12D.map((p) => p.p50);
    let targetLabel = 'Mediana empírica cohorte N=166 (p50)';

    if (compareTargetExp !== 'COHORT_MEDIAN_P50') {
      const targetEval = StorageService.getEvaluations(compareTargetExp)[0];
      if (!targetEval?.latentes_autoencoder?.latentDimensions || targetEval.latentes_autoencoder.latentDimensions.length !== 12) {
        return { error: `El expediente ${compareTargetExp} aún no tiene vector latente 12D completo.` };
      }
      vecB = targetEval.latentes_autoencoder.latentDimensions.map((d) => d.rawValue);
      targetLabel = `Expediente ${compareTargetExp}`;
    }

    let sumSq = 0;
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < 12; i++) {
      const diff = vecA[i] - vecB[i];
      sumSq += diff * diff;
      dot += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    return {
      targetLabel,
      l2Distance: Math.sqrt(sumSq),
      cosineSimilarity: denom > 1e-12 ? dot / denom : 0,
    };
  }, [motor1State, compareTargetExp]);

  const handleSaveFormulation = async () => {
    if (formulationSummary.trim().length < 10) {
      setFormulationSavedMsg('Describa la formulación o hipótesis clínica (mínimo 10 caracteres).');
      return;
    }
    const newEntry = {
      id: `FORM-${Date.now()}`,
      fecha: new Date().toISOString().slice(0, 16).replace('T', ' '),
      evidence: formulationEvidence,
      review_status: 'pending_human_review',
      summary: formulationSummary.trim(),
      author: currentUser.nombre || currentUser.u,
    };
    setLocalFormulations((prev) => [newEntry, ...prev]);
    StorageService.logAction({
      usuario: currentUser.u,
      rol: currentUser.rol,
      accion: 'Registro de formulación clínica trazable (Motor 5)',
      exp: selectedPseudonym,
      detalles: `evidencia=${formulationEvidence} review_status=pending_human_review`,
    });

    try {
      const search = await PatientApiService.searchPatients(selectedPseudonym);
      const match = search.find((p) => p.pseudonym === selectedPseudonym || p.patient_id === selectedPseudonym);
      if (match) {
        await PatientApiService.createClinicalFormulation(match.patient_id, {
          summary_text: formulationSummary.trim(),
          evidence_level: formulationEvidence,
          review_status: 'pending_human_review',
          domains: ['autoencoder_12d', 'longitudinal_rci', 'narrative_process'],
        });
      }
    } catch {
      // Sin bloqueo si se opera sin backend local conectado
    }

    setFormulationSummary('');
    setFormulationSavedMsg(
      'Formulación registrada con evidencia explícita y estado obligatorio pending_human_review.'
    );
  };

  const handleExportReport = () => {
    const mdLines = [
      `# Síntesis de Inteligencia Clínica Trazable — ${selectedPseudonym}`,
      `Fecha UTC: ${new Date().toISOString()}`,
      `Modelo Autoencoder: ${selectedModelId}`,
      '',
      '## 1. Motor 1 — Representación Latente 12D (MOD-03 Opaca)',
      motor1State.ready && motor1State.result
        ? `- MSE_z: ${motor1State.result.verifiedMetrics.mse_z.toFixed(4)} | Norma L2: ${motor1State.result.verifiedMetrics.l2_norm.toFixed(4)} | Dist. mediana p50: ${motor1State.result.verifiedMetrics.distance_to_cohort_median_p50.toFixed(4)}`
        : `- Estado: ${motor1State.reason}`,
      '',
      '## 2. Motor 2 — Trayectorias Longitudinales',
      ...motor2Trajectories.map(
        (t) => `- ${t.instrument}: ${t.points.length} mediciones | Última=${t.last.value} | Delta=${t.delta ?? 'N/A'} | ${t.rciLabel}`
      ),
      '',
      '## 3. Motor 3 — Evidencia Léxica y Conductual (Revisión Humana Obligatoria)',
      `- Registros analizados: ${motor3Analysis.totalEntries} | ONNX runtime: ${motor3Analysis.onnxStatusText}`,
      '',
      '## 4. Guardarraíles Epistemológicos',
      '- Sin diagnóstico automático ni prescripción terapéutica algorítmica.',
      '- Dimensiones latentes sin etiqueta clínica nosológica (MOD-03).',
    ];
    const blob = new Blob([mdLines.join('\n')], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SISAP_Inteligencia_${selectedPseudonym}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const tabs: Array<{ id: MotorTab; label: string; icon: React.ReactNode }> = [
    { id: 'motor1', label: '1 · Autoencoder Latente', icon: <Cpu className="w-3.5 h-3.5" /> },
    { id: 'motor2', label: '2 · Analítica Longitudinal', icon: <Activity className="w-3.5 h-3.5" /> },
    { id: 'motor3', label: '3 · Narrativa y Procesos', icon: <MessageSquareText className="w-3.5 h-3.5" /> },
    { id: 'motor4', label: '4 · Alineación Multimodal', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'motor5', label: '5 · Apoyo a Decisiones', icon: <Scale className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-4">
      {/* Encabezado de Plataforma */}
      <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-[var(--sep-claro)]">
        <div>
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-[var(--accion)]" />
            <h2 className="text-base font-bold text-[var(--texto)]">
              Ecosistema de Inteligencia Funcional, Analítica y Multimodal
            </h2>
          </div>
          <p className="text-xs text-[var(--texto-sec)] mt-0.5">
            Expediente activo: <span className="font-mono font-bold text-[var(--texto)]">{selectedPseudonym}</span> ·{' '}
            {activePatient?.droga_impacto || 'Sin sustancia de impacto registrada'} · Rol: {currentUser.rol}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
          <span className="est-ok inline-flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            SHA-256 Autoencoder Verificado
          </span>
          <span className={backendConnected ? 'est-ok' : 'est-pend'}>
            Backend SQLite: {backendConnected ? 'Conectado (127.0.0.1:8080)' : 'Modo local navegador'}
          </span>
        </div>
      </div>

      {/* Barra de Navegación por Motores */}
      <div className="flex flex-wrap gap-1.5 border-b border-[var(--sep-claro)] pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded text-xs font-semibold inline-flex items-center gap-1.5 transition-colors border ${
              activeTab === tab.id
                ? 'bg-[var(--accion)] text-white border-[var(--accion)]'
                : 'bg-[var(--panel)] text-[var(--texto)] border-[var(--sep)] hover:bg-[var(--nav-hover)]'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* MOTOR 1: Autoencoder y Representación Latente */}
      {activeTab === 'motor1' && (
        <div className="space-y-4">
          <div className="sisap-captura flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-[var(--texto)]">Selección de Arquitectura Verificada (Capa 5 SELU)</div>
              <div className="text-[11px] text-[var(--texto-sec)]">
                Paridad numérica verificada frente a R 4.6.1 y cohorte canónica N=166. EROS_raw excluido e independiente.
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <select
                value={selectedModelId}
                onChange={(e) => setSelectedModelId(e.target.value as VerifiedModelId)}
                className="sisap-select text-xs"
              >
                <option value="encoder_22_checkpoint_fase2">
                  encoder_22_checkpoint_fase2 (22→32→24→12 · Verificado Exacto)
                </option>
                <option value="encoder_24_deployed">
                  encoder_24_deployed (24→32→24→12 · Validación externa pendiente)
                </option>
              </select>
            </div>
          </div>

          {!motor1State.ready || !motor1State.result ? (
            <div className="sisap-tarjeta border border-[var(--advertencia)]/50 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[var(--advertencia)]">
                <AlertTriangle className="w-4 h-4" />
                <span>Compuerta D-06 · Representación Latente No Disponible (E5_insufficient)</span>
              </div>
              <p className="text-xs text-[var(--texto-sec)]">{motor1State.reason}</p>
              <p className="text-[11px] text-[var(--texto-tenue)]">
                Complete los 6 instrumentos (incluidos 49 reactivos STAXI-2, 23+11 ítems BSL-23 y GENERAL 0–1) en "Evaluación Inicial" para generar la representación latente verificada sin imputación silenciosa.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Barra de métricas geométricas sobrias (tabular-nums) */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs tabular-nums">
                <div className="sisap-tarjeta">
                  <div className="text-[11px] text-[var(--texto-tenue)]">Error Reconstrucción MSE_z</div>
                  <div className="text-lg font-mono font-bold text-[var(--texto)] mt-0.5">
                    {motor1State.result.verifiedMetrics.mse_z.toFixed(4)}
                  </div>
                  <div className="text-[10.5px] text-[var(--texto-sec)]">
                    RMSE_z = {motor1State.result.verifiedMetrics.rmse_z.toFixed(4)}
                  </div>
                </div>
                <div className="sisap-tarjeta">
                  <div className="text-[11px] text-[var(--texto-tenue)]">Distancia a mediana p50</div>
                  <div className="text-lg font-mono font-bold text-[var(--accion)] mt-0.5">
                    {motor1State.result.verifiedMetrics.distance_to_cohort_median_p50.toFixed(4)}
                  </div>
                  <div className="text-[10.5px] text-[var(--texto-sec)]">Espacio euclidiano 12D</div>
                </div>
                <div className="sisap-tarjeta">
                  <div className="text-[11px] text-[var(--texto-tenue)]">Norma L2 Latente</div>
                  <div className="text-lg font-mono font-bold text-[var(--texto)] mt-0.5">
                    {motor1State.result.verifiedMetrics.l2_norm.toFixed(4)}
                  </div>
                  <div className="text-[10.5px] text-[var(--texto-sec)]">
                    {motor1State.result.verifiedMetrics.architecture_str}
                  </div>
                </div>
                <div className="sisap-tarjeta">
                  <div className="text-[11px] text-[var(--texto-tenue)]">Dimensiones fuera IQR</div>
                  <div className="text-lg font-mono font-bold text-[var(--texto)] mt-0.5">
                    {motor1State.result.verifiedMetrics.n_outside_iqr} / 12
                  </div>
                  <div className="text-[10.5px] text-[var(--texto-sec)]">Banda central p25–p75</div>
                </div>
                <div className="sisap-tarjeta">
                  <div className="text-[11px] text-[var(--texto-tenue)]">Colas extremas (&lt;p05 / &gt;p95)</div>
                  <div className="text-lg font-mono font-bold text-[var(--advertencia)] mt-0.5">
                    {motor1State.result.verifiedMetrics.n_outside_p05_p95} / 12
                  </div>
                  <div className="text-[10.5px] font-mono text-[var(--texto-tenue)]">
                    SHA: {motor1State.result.verifiedMetrics.model_sha256_prefix}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
                <div className="xl:col-span-7">
                  <LatentIntervalChart dimensions={motor1State.result.latentDimensions} />
                </div>
                <div className="xl:col-span-5">
                  <ReconstructionBarsChart items={motor1State.result.perVariableReconstruction} maxBars={10} />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MOTOR 2: Inteligencia Analítica Longitudinal */}
      {activeTab === 'motor2' && (
        <div className="space-y-4">
          <div className="sisap-tarjeta">
            <h3 className="text-sm font-bold mb-1">
              Trayectorias Intraindividuales y Cambio Confiable (Jacobson-Truax RCI)
            </h3>
            <p className="text-xs text-[var(--texto-sec)]">
              Combina evaluación inicial (T0) con mediciones registradas en "Seguimiento y Escalas". Umbral de cambio confiable |RCI| ≥ 1.96.
            </p>
          </div>

          {motor2Trajectories.length === 0 ? (
            <div className="sisap-tarjeta text-xs text-[var(--texto-sec)]">
              No existen mediciones cuantitativas registradas para construir series longitudinales en {selectedPseudonym}.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {motor2Trajectories.map((traj) => {
                const vals = traj.points.map((p) => p.value);
                const minV = Math.min(...vals);
                const maxV = Math.max(...vals);
                const span = Math.max(maxV - minV, 1);
                return (
                  <div key={traj.instrument} className="sisap-tarjeta space-y-2 tabular-nums">
                    <div className="flex items-center justify-between pb-1.5 border-b border-[var(--sep-claro)]">
                      <div>
                        <span className="text-sm font-bold">{traj.instrument}</span>
                        <span className="ml-2 text-[11px] font-mono text-[var(--texto-tenue)]">
                          {traj.points.length} punto(s)
                        </span>
                      </div>
                      <span className="font-mono text-xs font-bold text-[var(--accion)]">
                        Actual: {traj.last.value}
                        {traj.delta !== null && ` (${traj.delta >= 0 ? '+' : ''}${traj.delta})`}
                      </span>
                    </div>

                    {/* Sparkline alineado SVG */}
                    {traj.points.length >= 2 && (
                      <svg viewBox="0 0 320 68" className="w-full h-16">
                        <polyline
                          fill="none"
                          stroke="#0F766E"
                          strokeWidth="2"
                          points={traj.points
                            .map((pt, idx) => {
                              const x = 18 + (idx / Math.max(traj.points.length - 1, 1)) * 284;
                              const y = 50 - ((pt.value - minV) / span) * 34;
                              return `${x},${y}`;
                            })
                            .join(' ')}
                        />
                        {traj.points.map((pt, idx) => {
                          const x = 18 + (idx / Math.max(traj.points.length - 1, 1)) * 284;
                          const y = 50 - ((pt.value - minV) / span) * 34;
                          return (
                            <g key={idx}>
                              <circle cx={x} cy={y} r={3.5} fill="#0F766E" />
                              <text x={x} y={64} textAnchor="middle" className="fill-[var(--texto-tenue)] font-mono text-[9px]">
                                {pt.label}
                              </text>
                            </g>
                          );
                        })}
                      </svg>
                    )}

                    <div className="text-[11px] font-mono text-[var(--texto-sec)]">
                      Estado RCI: <b>{traj.rciLabel}</b>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MOTOR 3: Inteligencia Narrativa y Conductual */}
      {activeTab === 'motor3' && (
        <div className="space-y-4">
          <div className="sisap-captura border border-[var(--advertencia)]/40 space-y-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-[var(--texto)]">
                Estado del Motor Narrativo (Taxonomía E1–E5 · Revisión Humana Obligatoria)
              </span>
              <span className="est-pend font-mono text-[10.5px]">review_status: pending_human_review</span>
            </div>
            <p className="text-[11px] text-[var(--texto-sec)]">
              Diagnóstico artefacto ONNX: <span className="font-mono">{motor3Analysis.onnxStatusText}</span>
            </p>
          </div>

          {motor3Analysis.totalEntries === 0 ? (
            <div className="sisap-tarjeta text-xs text-[var(--texto-sec)]">
              E5_insufficient · No hay narraciones semanales (q1..q8) ni notas de evolución registradas para analizar en {selectedPseudonym}.
            </div>
          ) : (
            <div className="space-y-3">
              {motor3Analysis.analyzed.map((entry) => (
                <div key={entry.id} className="sisap-tarjeta space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-1.5 border-b border-[var(--sep-claro)]">
                    <span className="text-xs font-bold">{entry.label}</span>
                    <div className="flex items-center gap-2 text-[11px] font-mono text-[var(--texto-sec)] tabular-nums">
                      <span>{entry.sourceType}</span>
                      <span>· {entry.tokenCount} palabras</span>
                      <span>· TTR {entry.ttr}</span>
                    </div>
                  </div>
                  {entry.markers.length === 0 ? (
                    <p className="text-xs text-[var(--texto-tenue)]">
                      Sin marcadores léxicos de proceso conductual detectados automáticamente.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {entry.markers.map((m) => (
                        <div
                          key={m!.id}
                          className="p-2 rounded bg-[var(--campo)] border border-[var(--sep-claro)] text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-[var(--texto)]">{m!.label}</span>
                            <span className={m!.polarity === 'protector' ? 'est-ok' : 'est-warn'}>
                              {m!.evidenceLevel}
                            </span>
                          </div>
                          <div className="text-[11px] font-mono text-[var(--texto-sec)]">
                            Coincidencias: {m!.matched.join(', ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MOTOR 4: Integración y Procedencia Multimodal */}
      {activeTab === 'motor4' && (
        <div className="space-y-4">
          <div className="sisap-tarjeta overflow-x-auto">
            <h3 className="text-sm font-bold mb-2">
              Matriz de Alineación, Procedencia y Granularidad Multimodal
            </h3>
            <table className="w-full text-xs border-collapse tabular-nums">
              <thead>
                <tr className="border-b border-[var(--sep)] text-left text-[var(--texto-sec)]">
                  <th className="py-2 pr-3">Fuente / Modalidad</th>
                  <th className="py-2 pr-3">Tablas de Origen</th>
                  <th className="py-2 pr-3">Granularidad</th>
                  <th className="py-2 pr-3">Temporalidad</th>
                  <th className="py-2 pr-3">Completitud</th>
                  <th className="py-2">Calidad y Guardarraíl</th>
                </tr>
              </thead>
              <tbody>
                {motor4Matrix.map((row) => (
                  <tr key={row.fuente} className="border-b border-[var(--sep-claro)]">
                    <td className="py-2 pr-3 font-semibold">{row.fuente}</td>
                    <td className="py-2 pr-3 font-mono text-[11px] text-[var(--texto-sec)]">{row.tablas}</td>
                    <td className="py-2 pr-3">{row.granularidad}</td>
                    <td className="py-2 pr-3 font-mono">{row.temporalidad}</td>
                    <td className="py-2 pr-3 font-mono">{row.completitud}</td>
                    <td className="py-2 font-mono text-[11px]">{row.calidad}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="sisap-captura text-xs space-y-1">
            <div className="font-bold text-[var(--texto)]">Separación Semántica Verificada (Sección 5)</div>
            <p className="text-[var(--texto-sec)]">
              En todos los registros integrados, la puntuación de refuerzo ambiental <code>EROS_raw</code> se mantiene independiente de{' '}
              <code>tiempo_consumo_raw</code> y <code>tiempo_consumoEROS</code>; ninguna escala se mezcla silenciosamente.
            </p>
          </div>
        </div>
      )}

      {/* MOTOR 5: Apoyo a Decisiones Basadas en Evidencia */}
      {activeTab === 'motor5' && (
        <div className="space-y-4">
          <div className="p-3 rounded border border-[var(--riesgo)]/40 bg-[var(--riesgo)]/5 text-xs flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-[var(--riesgo)] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[var(--texto)]">Restricción Clínica Obligatoria:</span> SISAP no emite diagnósticos automáticos ni prescripciones terapéuticas. Toda síntesis computacional sirve como insumo descriptivo sujeto a validación profesional (<code>pending_human_review</code>).
            </div>
          </div>

          {/* Comparador geométrico de perfiles */}
          <div className="sisap-tarjeta space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[var(--sep-claro)]">
              <div className="flex items-center gap-2">
                <GitCompare className="w-4 h-4 text-[var(--accion)]" />
                <h3 className="text-sm font-bold">Comparador de Perfiles en Espacio Latente 12D</h3>
              </div>
              <select
                value={compareTargetExp}
                onChange={(e) => setCompareTargetExp(e.target.value)}
                className="sisap-select text-xs"
              >
                <option value="COHORT_MEDIAN_P50">Referencia: Mediana Cohorte N=166 (p50)</option>
                {allPatients
                  .filter((p) => p.seudonimo !== selectedPseudonym)
                  .map((p) => (
                    <option key={p.seudonimo} value={p.seudonimo}>
                      Expediente {p.seudonimo} ({p.estado})
                    </option>
                  ))}
              </select>
            </div>

            {!comparisonResult ? (
              <p className="text-xs text-[var(--texto-sec)]">
                Se requiere vector latente 12D válido en el expediente actual para ejecutar la comparación geométrica.
              </p>
            ) : 'error' in comparisonResult ? (
              <p className="text-xs text-[var(--advertencia)]">{comparisonResult.error}</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs tabular-nums">
                <div className="p-2.5 bg-[var(--campo)] border border-[var(--sep)] rounded">
                  <div className="text-[11px] text-[var(--texto-tenue)]">Objetivo comparado</div>
                  <div className="font-bold mt-0.5">{comparisonResult.targetLabel}</div>
                </div>
                <div className="p-2.5 bg-[var(--campo)] border border-[var(--sep)] rounded">
                  <div className="text-[11px] text-[var(--texto-tenue)]">Distancia Euclidiana L2</div>
                  <div className="font-mono text-base font-bold text-[var(--accion)] mt-0.5">
                    {comparisonResult.l2Distance.toFixed(4)}
                  </div>
                </div>
                <div className="p-2.5 bg-[var(--campo)] border border-[var(--sep)] rounded">
                  <div className="text-[11px] text-[var(--texto-tenue)]">Similitud Coseno [-1, +1]</div>
                  <div className="font-mono text-base font-bold text-[var(--texto)] mt-0.5">
                    {comparisonResult.cosineSimilarity.toFixed(4)}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Registro de hipótesis clínica trazable + Exportación */}
          <div className="sisap-captura space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[var(--sep-claro)]">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[var(--accion)]" />
                <h3 className="text-sm font-bold">Formulación Funcional Trazable y Reporte Dinámico</h3>
              </div>
              <button
                type="button"
                onClick={handleExportReport}
                className="sisap-btn-sec text-xs py-1.5 px-3 inline-flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar síntesis (.md)</span>
              </button>
            </div>

            {formulationSavedMsg && (
              <div className="p-2 rounded bg-[var(--normal)]/10 border border-[var(--normal)]/40 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[var(--normal)]" />
                <span>{formulationSavedMsg}</span>
              </div>
            )}

            {roleConfig.escribe && (
              <div className="space-y-2 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[var(--texto-sec)] mb-1">Nivel de evidencia (E1–E5)</label>
                    <select
                      value={formulationEvidence}
                      onChange={(e) => setFormulationEvidence(e.target.value as any)}
                      className="sisap-select"
                    >
                      <option value="E1_explicit">E1_explicit · Dato psicométrico / cita directa</option>
                      <option value="E2_contextual">E2_contextual · Antecedente clínico / temporal</option>
                      <option value="E3_observational">E3_observational · Observación del terapeuta</option>
                      <option value="E4_latent_hypothesis">E4_latent_hypothesis · Hipótesis derivada del Autoencoder</option>
                      <option value="E5_insufficient">E5_insufficient · Evidencia insuficiente</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[var(--texto-sec)] mb-1">
                      Síntesis analítica descriptiva (sin diagnóstico automático)
                    </label>
                    <input
                      type="text"
                      value={formulationSummary}
                      onChange={(e) => setFormulationSummary(e.target.value)}
                      placeholder="Ej. Discrepancia en BSL_total_integrado coincide con incremento de señales de evitación en semana 2..."
                      className="sisap-input"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button type="button" onClick={handleSaveFormulation} className="sisap-btn text-xs py-1.5 px-3">
                    Registrar formulación (pending_human_review)
                  </button>
                </div>
              </div>
            )}

            {localFormulations.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-[var(--sep-claro)]">
                {localFormulations.map((f) => (
                  <div key={f.id} className="p-2 rounded bg-[var(--campo)] border border-[var(--sep-claro)] text-xs">
                    <div className="flex flex-wrap justify-between gap-2 font-mono text-[10.5px] text-[var(--texto-sec)]">
                      <span>
                        {f.fecha} · {f.author}
                      </span>
                      <span>
                        {f.evidence} · {f.review_status}
                      </span>
                    </div>
                    <p className="mt-1 text-[var(--texto)]">{f.summary}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
