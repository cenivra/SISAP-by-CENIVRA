import React, { useState } from 'react';
import {
  AlertTriangle,
  Cpu,
  Layers,
  Sparkles,
  Sliders,
  ShieldAlert,
  FileCheck,
  Send,
  HelpCircle,
  Copy,
  Check,
  FileText,
  Activity,
  ArrowRight,
  Database,
  Lock,
} from 'lucide-react';
import { LatentRadarChart } from '../LatentRadarChart';
import {
  AutoencoderEngine,
  AutoencoderInferenceResult,
  LatentDimensionScore,
} from '../../services/autoencoderEngine';
import { LATENT_DIMENSIONS_METADATA } from '../../data/autoencoderData';

interface SyntheticArchetype {
  id: string;
  name: string;
  tag: string;
  severity: 'Alta' | 'Moderada' | 'Baja' | 'Crónica';
  description: string;
  rawScores: {
    bis_motor: number;
    bis_nonplanning: number;
    bis_instability: number;
    bis_perseverance: number;
    bis_motor_impulsivity: number;
    bis_total: number;
    compuesto_bis: number;
    staxi_state: number;
    staxi_trait: number;
    staxi_temperament: number;
    compuesto_staxi: number;
    bsl_general: number;
    bsl_total: number;
    compuesto_bsl: number;
    gad_zscore: number;
    bads_activation: number;
    bads_avoidance: number;
    bads_work: number;
    bads_social: number;
    edad: number;
    tiempo_consumo: number;
    trat_previos: number;
    tiempo_consumoEROS: number;
    trat_previosEROS: number;
  };
}

const SYNTHETIC_ARCHETYPES: SyntheticArchetype[] = [
  {
    id: 'archetype_a',
    name: 'Arquetipo A: Desregulación Emocional e Impulsividad Severa',
    tag: 'Riesgo Clínico Alto (Sintético)',
    severity: 'Alta',
    description:
      'Perfil sintético caracterizado por elevadas puntuaciones en impulsividad motora (BIS-11), reactividad ante la ira (STAXI-2), desregulación afectiva borderline (BSL-23) y ansiedad somática (GAD-7).',
    rawScores: {
      bis_motor: 32,
      bis_nonplanning: 33,
      bis_instability: 25,
      bis_perseverance: 14,
      bis_motor_impulsivity: 30,
      bis_total: 88,
      compuesto_bis: 29.3,
      staxi_state: 36,
      staxi_trait: 31,
      staxi_temperament: 14,
      compuesto_staxi: 27.0,
      bsl_general: 3.25,
      bsl_total: 75.0,
      compuesto_bsl: 32.5,
      gad_zscore: 2.1,
      bads_activation: 11,
      bads_avoidance: 34,
      bads_work: 7,
      bads_social: 8,
      edad: 29,
      tiempo_consumo: 6.5,
      trat_previos: 2,
      tiempo_consumoEROS: 6.5,
      trat_previosEROS: 2,
    },
  },
  {
    id: 'archetype_b',
    name: 'Arquetipo B: Inhibición Conductual, Evitación y Apatía',
    tag: 'Riesgo Intermedio / Evitación (Sintético)',
    severity: 'Moderada',
    description:
      'Perfil sintético orientado al aislamiento social y parálisis funcional. Presenta marcada evitación experiencial (BADS), baja activación conductual y rumiación ansiosa sin reactividad hostil.',
    rawScores: {
      bis_motor: 17,
      bis_nonplanning: 28,
      bis_instability: 19,
      bis_perseverance: 8,
      bis_motor_impulsivity: 18,
      bis_total: 58,
      compuesto_bis: 19.3,
      staxi_state: 16,
      staxi_trait: 15,
      staxi_temperament: 6,
      compuesto_staxi: 12.3,
      bsl_general: 1.95,
      bsl_total: 44.0,
      compuesto_bsl: 19.5,
      gad_zscore: 1.2,
      bads_activation: 8,
      bads_avoidance: 36,
      bads_work: 8,
      bads_social: 6,
      edad: 42,
      tiempo_consumo: 8.0,
      trat_previos: 1,
      tiempo_consumoEROS: 8.0,
      trat_previosEROS: 1,
    },
  },
  {
    id: 'archetype_c',
    name: 'Arquetipo C: Remisión Temprana y Estabilidad Afectiva',
    tag: 'Perfil Compensado / Adaptativo (Sintético)',
    severity: 'Baja',
    description:
      'Perfil sintético que simula un paciente en etapa de consolidación de abstinencia, con preservación de activación conductual, modulación emocional adecuada y ausencia de urgencia negativa.',
    rawScores: {
      bis_motor: 16,
      bis_nonplanning: 20,
      bis_instability: 12,
      bis_perseverance: 6,
      bis_motor_impulsivity: 15,
      bis_total: 48,
      compuesto_bis: 16.0,
      staxi_state: 14,
      staxi_trait: 14,
      staxi_temperament: 5,
      compuesto_staxi: 11.0,
      bsl_general: 0.65,
      bsl_total: 15.0,
      compuesto_bsl: 6.5,
      gad_zscore: -0.8,
      bads_activation: 26,
      bads_avoidance: 12,
      bads_work: 20,
      bads_social: 22,
      edad: 35,
      tiempo_consumo: 4.0,
      trat_previos: 0,
      tiempo_consumoEROS: 4.0,
      trat_previosEROS: 0,
    },
  },
  {
    id: 'archetype_d',
    name: 'Arquetipo D: Cronicidad Prolongada y Multitratamiento Resistente',
    tag: 'Resistencia / Deterioro Funcional (Sintético)',
    severity: 'Crónica',
    description:
      'Perfil sintético caracterizado por larga evolución de consumo (>12 años), múltiples internamientos previos sin remisión sostenida, fatiga motivacional y rigidez cognitiva.',
    rawScores: {
      bis_motor: 26,
      bis_nonplanning: 34,
      bis_instability: 23,
      bis_perseverance: 12,
      bis_motor_impulsivity: 25,
      bis_total: 78,
      compuesto_bis: 26.0,
      staxi_state: 26,
      staxi_trait: 25,
      staxi_temperament: 10,
      compuesto_staxi: 20.3,
      bsl_general: 2.30,
      bsl_total: 52.0,
      compuesto_bsl: 23.0,
      gad_zscore: 1.4,
      bads_activation: 12,
      bads_avoidance: 29,
      bads_work: 9,
      bads_social: 11,
      edad: 51,
      tiempo_consumo: 16.0,
      trat_previos: 5,
      tiempo_consumoEROS: 16.0,
      trat_previosEROS: 5,
    },
  },
];

export const AutoencoderSimulatorView: React.FC = () => {
  const [selectedArchetypeId, setSelectedArchetypeId] = useState<string>('archetype_a');
  const [activeSubTab, setActiveSubTab] = useState<'simulador' | 'pipeline' | 'solicitud'>('simulador');
  const [copiedRequest, setCopiedRequest] = useState<boolean>(false);

  // Form state for institutional access request template
  const [instName, setInstName] = useState<string>('');
  const [instInvestigator, setInstInvestigator] = useState<string>('');
  const [instEmail, setInstEmail] = useState<string>('');
  const [instEthicsApproval, setInstEthicsApproval] = useState<string>('');
  const [instProjectScope, setInstProjectScope] = useState<string>('Evaluación de viabilidad y validación de software clínico (SensorLab / Incubación)');

  const currentArchetype = SYNTHETIC_ARCHETYPES.find((a) => a.id === selectedArchetypeId) || SYNTHETIC_ARCHETYPES[0];

  // Map raw scores to the canonical 24 vector format
  const rawVector24: Record<string, number> = {
    BIS_11BIS_motor: currentArchetype.rawScores.bis_motor,
    BIS_11BIS_nonplanning: currentArchetype.rawScores.bis_nonplanning,
    BIS_11BIS_cognitive_instability: currentArchetype.rawScores.bis_instability,
    BIS_11BIS_perseverance: currentArchetype.rawScores.bis_perseverance,
    BIS_11BIS_motor_impulsivity: currentArchetype.rawScores.bis_motor_impulsivity,
    BIS_11BIS_total_calculado: currentArchetype.rawScores.bis_total,
    compuesto_bis: currentArchetype.rawScores.compuesto_bis,
    STAXI_2STAXI_state: currentArchetype.rawScores.staxi_state,
    STAXI_2STAXI_trait: currentArchetype.rawScores.staxi_trait,
    STAXI_2STAXI_temperamento: currentArchetype.rawScores.staxi_temperament,
    compuesto_staxi: currentArchetype.rawScores.compuesto_staxi,
    BSL_23BSL_general: currentArchetype.rawScores.bsl_general,
    BSL_23BSL_total_integrado: currentArchetype.rawScores.bsl_total,
    compuesto_bsl: currentArchetype.rawScores.compuesto_bsl,
    GAD_7GAD_zscore: currentArchetype.rawScores.gad_zscore,
    BADS_bads_activation: currentArchetype.rawScores.bads_activation,
    BADS_bads_avoidance: currentArchetype.rawScores.bads_avoidance,
    BADS_bads_work: currentArchetype.rawScores.bads_work,
    BADS_bads_social: currentArchetype.rawScores.bads_social,
    edad: currentArchetype.rawScores.edad,
    tiempo_consumo: currentArchetype.rawScores.tiempo_consumo,
    trat_previos: currentArchetype.rawScores.trat_previos,
    tiempo_consumoEROS: currentArchetype.rawScores.tiempo_consumoEROS,
    trat_previosEROS: currentArchetype.rawScores.trat_previosEROS,
  };

  const simulatedInference: AutoencoderInferenceResult = AutoencoderEngine.runTransversalInference(rawVector24);

  const requestTemplateMarkdown = `# SOLICITUD FORMAL DE ACCESO A LA INFERENCIA CANÓNICA DE AUTOENCODERS
**Proyecto SISAP by CENIVRA — Módulo de Inteligencia Artificial Clínica**
**Estado del canal:** [CANAL OFICIAL PENDIENTE DE ASIGNACIÓN INSTITUCIONAL]

Fecha de Solicitud: ${new Date().toLocaleDateString('es-MX')}
Institución Solicitante: ${instName || '[NOMBRE DE LA INSTITUCIÓN / CENTRO / INCUBADORA]'}
Investigador / Responsable Técnico: ${instInvestigator || '[NOMBRE COMPLETO Y CÉDULA/CARGO]'}
Correo de Contacto Institucional: ${instEmail || '[CORREO ELECTRÓNICO OFICIAL]'}
Registro de Aprobación de Comité de Ética (CEI): ${instEthicsApproval || '[FOLIO DE APROBACIÓN CEI / CONBIOÉTICA O N/A POR PROTOCOLO TECNOLÓGICO]'}
Alcance del Proyecto: ${instProjectScope}

---

### Compromisos Éticos y Técnicos:
1. Reconocimiento de que los pesos canónicos (Keras .h5, ONNX) entrenados por CENIVRA constituyen propiedad intelectual protegida y material confidencial de investigación clínica.
2. Garantía de procesamiento local (on-premise) en equipos que cumplan con la NOM-024-SSA3-2012 y LFPDPPP, sin exfiltración de vectores clínicos ni expedientes hacia servicios de nube no autorizados.
3. Validación de que toda inferencia generada por el autoencoder canónico será empleada como sistema de soporte y auxilio diagnóstico, bajo supervisión humana indelegable por parte de profesionales de la salud acreditados.
4. Compromiso de reporte responsable de anomalías y métricas de calibración para la retroalimentación de la investigación de modelos latentes.

Firma del Responsable Institucional: _______________________________
Sello Institucional / SensorLab / Centro de Investigación`;

  const handleCopyRequest = () => {
    navigator.clipboard.writeText(requestTemplateMarkdown);
    setCopiedRequest(true);
    setTimeout(() => setCopiedRequest(false), 2500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* 1. MANDATORY PERMANENT WARNING BANNER */}
      <div className="bg-amber-950/40 border-2 border-amber-500/80 text-amber-200 p-4 rounded-md shadow-md flex items-start gap-3.5">
        <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-sm tracking-wide uppercase text-amber-300 flex items-center gap-2">
            <span>MODO DEMOSTRACIÓN. Datos sintéticos. No ejecuta el autoencoder canónico ni genera resultados clínicos</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 border border-amber-400/30 text-amber-300">
              SIMULADOR EDUCATIVO
            </span>
          </div>
          <p className="text-xs text-amber-200/90 leading-relaxed">
            Este simulador tiene fines exclusivamente metodológicos y didácticos para evaluación técnica en SensorLab, comités de bioética y evaluadores de software. Los datos procesados corresponden a <b>arquetipos sintéticos precomputados</b>. Los modelos canónicos de deep learning (pesos entrenados en formato <code>.h5</code> / <code>.onnx</code> sobre cohortes clínicas de CENIVRA) se encuentran <b>estrictamente desacoplados, desactivados y excluidos de este repositorio público</b> para salvaguardar la privacidad de los pacientes y la integridad de la investigación.
          </p>
        </div>
      </div>

      {/* Header and Subnavigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--sep-claro)] pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Cpu className="w-5 h-5 text-[var(--accion)]" />
            <h1 className="text-lg font-bold text-[var(--texto)]">
              Simulador Demostrativo del Autoencoder Latente (12D)
            </h1>
          </div>
          <p className="text-xs text-[var(--texto-tenue)] mt-0.5">
            Exploración de la topología latente de 12 dimensiones y agregación dimensional con datos 100% sintéticos
          </p>
        </div>

        {/* Subtabs */}
        <div className="flex items-center gap-1 bg-[var(--campo)] p-1 rounded-md border border-[var(--sep)]">
          <button
            onClick={() => setActiveSubTab('simulador')}
            className={`px-3 py-1.5 text-xs rounded transition-colors font-medium cursor-pointer ${
              activeSubTab === 'simulador'
                ? 'bg-[var(--panel)] text-[var(--texto)] shadow-xs'
                : 'text-[var(--texto-sec)] hover:text-[var(--texto)]'
            }`}
          >
            Simulador y Arquetipos
          </button>
          <button
            onClick={() => setActiveSubTab('pipeline')}
            className={`px-3 py-1.5 text-xs rounded transition-colors font-medium cursor-pointer ${
              activeSubTab === 'pipeline'
                ? 'bg-[var(--panel)] text-[var(--texto)] shadow-xs'
                : 'text-[var(--texto-sec)] hover:text-[var(--texto)]'
            }`}
          >
            Pipeline Conceptual 24D → 12D
          </button>
          <button
            onClick={() => setActiveSubTab('solicitud')}
            className={`px-3 py-1.5 text-xs rounded transition-colors font-medium cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'solicitud'
                ? 'bg-[var(--panel)] text-[var(--accion)] shadow-xs'
                : 'text-[var(--texto-sec)] hover:text-[var(--texto)]'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Acceso a IA Canónica</span>
          </button>
        </div>
      </div>

      {/* SUBTAB 1: SIMULADOR Y ARQUETIPOS */}
      {activeSubTab === 'simulador' && (
        <div className="space-y-6">
          {/* Archetype Selector Cards */}
          <div>
            <label className="text-xs font-semibold text-[var(--texto)] block mb-2">
              Seleccionar Arquetipo Clínico Sintético:
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {SYNTHETIC_ARCHETYPES.map((arch) => {
                const isSelected = arch.id === selectedArchetypeId;
                return (
                  <button
                    key={arch.id}
                    onClick={() => setSelectedArchetypeId(arch.id)}
                    className={`p-3 text-left rounded border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[var(--captura)] border-[var(--accion)] shadow-sm'
                        : 'bg-[var(--panel)] border-[var(--sep)] hover:border-[var(--sep-claro)]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span
                          className={`text-[9.5px] font-mono px-1.5 py-0.2 rounded border ${
                            arch.severity === 'Alta'
                              ? 'text-[var(--riesgo)] border-[var(--riesgo)]/40 bg-[var(--riesgo)]/10'
                              : arch.severity === 'Moderada'
                              ? 'text-[var(--advertencia)] border-[var(--advertencia)]/40 bg-[var(--advertencia)]/10'
                              : arch.severity === 'Crónica'
                              ? 'text-purple-400 border-purple-400/40 bg-purple-400/10'
                              : 'text-[var(--normal)] border-[var(--normal)]/40 bg-[var(--normal)]/10'
                          }`}
                        >
                          {arch.tag}
                        </span>
                        {isSelected && <Sparkles className="w-3.5 h-3.5 text-[var(--accion)]" />}
                      </div>
                      <h3 className="text-xs font-bold text-[var(--texto)] line-clamp-1">{arch.name}</h3>
                      <p className="text-[11px] text-[var(--texto-sec)] mt-1 line-clamp-2 leading-relaxed">
                        {arch.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-[var(--sep-claro)] flex items-center justify-between text-[10px] text-[var(--texto-tenue)] font-mono">
                      <span>BIS: {arch.rawScores.bis_total} pts</span>
                      <span>GAD: z={arch.rawScores.gad_zscore}</span>
                      <span>BADS Act: {arch.rawScores.bads_activation}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Epistemological and Methodological Disclaimer */}
            <div className="mt-3 p-3 bg-[var(--campo)] border border-[var(--sep)] rounded text-[11px] text-[var(--texto-tenue)] flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <b className="text-[var(--texto-sec)]">Aviso metodológico sobre los arquetipos y dimensiones:</b> Los perfiles clínicos (A, B, C, D), las 12 dimensiones y sus clasificaciones teóricas constituyen constructos matemáticos <b>exclusivamente ilustrativos</b> diseñados para evaluación de interfaz, pruebas de estabilidad algorítmica y demostración de arquitectura en SensorLab. <b>No cuentan con validación clínica independiente ni autorización regulatoria como dispositivo médico o software de diagnóstico.</b>
              </div>
            </div>
          </div>

          {/* Results: Radar & Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Radar Chart */}
            <div className="lg:col-span-5 bg-[var(--panel)] border border-[var(--sep)] rounded p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-[var(--texto)]">
                    Proyección Latente en Radar 12D (Simulada)
                  </h3>
                  <p className="text-[11px] text-[var(--texto-tenue)]">
                    Normalización centrada en el origen (z = 0)
                  </p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--campo)] border border-[var(--sep)] text-[var(--texto-tenue)]">
                  12 Ejes Bipolares
                </span>
              </div>

              <div className="flex justify-center py-2">
                <LatentRadarChart dimensions={simulatedInference.latentDimensions} size={310} />
              </div>

              {/* Verified Geometric Indices (MOD-03 / D-03) */}
              <div className="bg-[var(--campo)] border border-[var(--sep)] rounded p-3 space-y-2 tabular-nums">
                <div className="text-[11px] font-semibold text-[var(--texto)]">
                  Métricas Geométricas Verificadas ({simulatedInference.modelId}):
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-[var(--panel)] rounded border border-[var(--sep-claro)]">
                    <span className="text-[10px] text-[var(--texto-tenue)] block">MSE Reconstrucción (Z):</span>
                    <span className="text-sm font-bold font-mono text-[var(--accion)]">
                      {simulatedInference.verifiedMetrics.mse_z.toFixed(4)}
                    </span>
                  </div>
                  <div className="p-2 bg-[var(--panel)] rounded border border-[var(--sep-claro)]">
                    <span className="text-[10px] text-[var(--texto-tenue)] block">Distancia mediana p50:</span>
                    <span className="text-sm font-bold font-mono text-[var(--advertencia)]">
                      {simulatedInference.verifiedMetrics.distance_to_cohort_median_p50.toFixed(4)}
                    </span>
                  </div>
                </div>
                <div className="p-2 bg-[var(--panel)] rounded border border-[var(--sep-claro)] text-xs">
                  <span className="text-[10px] text-[var(--texto-tenue)] block">Estado Epistemológico (D-03):</span>
                  <span className="font-semibold text-[var(--texto)]">
                    {simulatedInference.summaryIndices.clase_latente_3b}
                  </span>
                  <div className="text-[10px] text-[var(--texto-tenue)] mt-0.5 font-mono">
                    Colas extremas (&lt;p05 o &gt;p95): {simulatedInference.verifiedMetrics.n_outside_p05_p95} / 12 · Norma L2: {simulatedInference.verifiedMetrics.l2_norm.toFixed(4)}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Table of 12 Latent Dimensions */}
            <div className="lg:col-span-7 bg-[var(--panel)] border border-[var(--sep)] rounded p-5 space-y-4">
              <div>
                <h3 className="text-xs font-bold text-[var(--texto)]">
                  Desglose de las 12 Dimensiones Latentes (Arquetipo Activo)
                </h3>
                <p className="text-[11px] text-[var(--texto-tenue)]">
                  Descomposición ortogonal y percentiles teóricos calculados sobre datos sintéticos
                </p>
              </div>

              <div className="overflow-x-auto max-h-[460px] overflow-y-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="sticky top-0 bg-[var(--panel)] border-b border-[var(--sep)] text-[var(--texto-tenue)]">
                    <tr>
                      <th className="py-2 px-2 font-semibold">Dim</th>
                      <th className="py-2 px-2 font-semibold">Nombre y Eje Bipolar</th>
                      <th className="py-2 px-2 font-semibold font-mono text-center">Score Z</th>
                      <th className="py-2 px-2 font-semibold font-mono text-center">Percentil</th>
                      <th className="py-2 px-2 font-semibold text-right">Nivel</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--sep-claro)]">
                    {simulatedInference.latentDimensions.map((dim) => (
                      <tr key={dim.dimId} className="hover:bg-[var(--campo)] transition-colors">
                        <td className="py-2 px-2 font-mono font-bold text-[var(--accion)]">
                          {dim.dimId}
                        </td>
                        <td className="py-2 px-2">
                          <div className="font-medium text-[var(--texto)]">{dim.label}</div>
                          <div className="text-[10px] text-[var(--texto-tenue)]">{dim.bipolar}</div>
                        </td>
                        <td className="py-2 px-2 font-mono text-center">
                          <span
                            className={
                              Math.abs(dim.zScore) >= 1.5
                                ? 'text-[var(--riesgo)] font-bold'
                                : 'text-[var(--texto)]'
                            }
                          >
                            {dim.zScore > 0 ? `+${dim.zScore.toFixed(2)}` : dim.zScore.toFixed(2)}
                          </span>
                        </td>
                        <td className="py-2 px-2 font-mono text-center text-[var(--texto-sec)]">
                          P{dim.percentile}
                        </td>
                        <td className="py-2 px-2 text-right">
                          <span
                            className={`text-[9.5px] font-mono px-1.5 py-0.2 rounded border ${
                              dim.interpretation === 'Extremo'
                                ? 'text-[var(--riesgo)] border-[var(--riesgo)]/40 bg-[var(--riesgo)]/10'
                                : dim.interpretation === 'Alto'
                                ? 'text-[var(--advertencia)] border-[var(--advertencia)]/40 bg-[var(--advertencia)]/10'
                                : dim.interpretation === 'Bajo'
                                ? 'text-[var(--normal)] border-[var(--normal)]/40 bg-[var(--normal)]/10'
                                : 'text-[var(--texto-tenue)] border-[var(--borde)]/40'
                            }`}
                          >
                            {dim.interpretation}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: PIPELINE CONCEPTUAL */}
      {activeSubTab === 'pipeline' && (
        <div className="space-y-6 bg-[var(--panel)] border border-[var(--sep)] rounded p-6">
          <div>
            <h2 className="text-sm font-bold text-[var(--texto)]">
              Arquitectura del Pipeline de Inferencia Teórica (24D → 12D)
            </h2>
            <p className="text-xs text-[var(--texto-tenue)] mt-0.5">
              Representación esquemática del procesamiento de variables clínicas psicométricas en espacios latentes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Step 1 */}
            <div className="p-4 bg-[var(--campo)] border border-[var(--sep)] rounded space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--panel)] text-[var(--accion)] font-bold">
                  FASE 1
                </span>
                <Database className="w-4 h-4 text-[var(--accion)]" />
              </div>
              <h3 className="text-xs font-bold text-[var(--texto)]">Ingesta Multidominio (24D)</h3>
              <p className="text-[11px] text-[var(--texto-sec)] leading-relaxed">
                Captura de subescalas de BIS-11 (impulsividad), STAXI-2 (ira/temperamento), BSL-23 (inestabilidad), GAD-7 (ansiedad), BADS (activación conductual) y covariables temporales.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-4 bg-[var(--campo)] border border-[var(--sep)] rounded space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--panel)] text-[var(--accion)] font-bold">
                  FASE 2
                </span>
                <Sliders className="w-4 h-4 text-[var(--accion)]" />
              </div>
              <h3 className="text-xs font-bold text-[var(--texto)]">Normalización Z-Score</h3>
              <p className="text-[11px] text-[var(--texto-sec)] leading-relaxed">
                Estandarización basada en medias y desviaciones estándar empíricas: <code>z = (x - μ) / σ</code>, garantizando que ninguna escala domine la varianza por diferencias métricas.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-4 bg-[var(--campo)] border border-[var(--sep)] rounded space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--panel)] text-[var(--accion)] font-bold">
                  FASE 3
                </span>
                <Layers className="w-4 h-4 text-[var(--accion)]" />
              </div>
              <h3 className="text-xs font-bold text-[var(--texto)]">Espacio Latente (12D)</h3>
              <p className="text-[11px] text-[var(--texto-sec)] leading-relaxed">
                Compresión dimensional no lineal (LeakyReLU). Las dimensiones representan ejes clínicos bipolares latentes (e.g. reactividad afectiva, evitación experiencial, impulsividad motora).
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-4 bg-[var(--campo)] border border-[var(--sep)] rounded space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--panel)] text-[var(--accion)] font-bold">
                  FASE 4
                </span>
                <Activity className="w-4 h-4 text-[var(--accion)]" />
              </div>
              <h3 className="text-xs font-bold text-[var(--texto)]">Fenotipificación Teórica</h3>
              <p className="text-[11px] text-[var(--texto-sec)] leading-relaxed">
                Asignación a clústeres dimensionales teóricos (GMM) e índices de severidad global para guiar la priorización psicoterapéutica (TCC, ACT, DBT, FAP).
              </p>
            </div>
          </div>

          <div className="p-4 bg-[var(--campo)] border border-[var(--sep)] rounded space-y-3">
            <h3 className="text-xs font-bold text-[var(--texto)]">
              Diferencia entre Simulador Demostrativo e Inferencia Canónica Real
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-[var(--panel)] rounded border border-amber-500/30">
                <div className="font-semibold text-amber-300 mb-1 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Simulador Demostrativo (Versión Pública)
                </div>
                <ul className="list-disc list-inside space-y-1 text-[var(--texto-sec)] text-[11px]">
                  <li>Utiliza datos y perfiles 100% sintéticos.</li>
                  <li>Proyección matemática lineal de aproximación.</li>
                  <li>Objetivo: evaluación de UX, diseño de dashboards e incubación técnica.</li>
                  <li>Completamente abierto y libre de datos clínicos reales.</li>
                </ul>
              </div>

              <div className="p-3 bg-[var(--panel)] rounded border border-blue-500/30">
                <div className="font-semibold text-blue-300 mb-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  Inferencia Canónica (Investigación Restringida)
                </div>
                <ul className="list-disc list-inside space-y-1 text-[var(--texto-sec)] text-[11px]">
                  <li>Pesos neuronales profundos (Keras .h5 / ONNX) entrenados en CENIVRA.</li>
                  <li>Evaluado con cross-validation y rigurosidad psicométrica.</li>
                  <li>Requiere convenio formal y aprobación por Comité de Ética (CEI).</li>
                  <li>Instalación local certificada bajo NOM-024-SSA3-2012.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: SOLICITUD DE ACCESO A IA CANÓNICA */}
      {activeSubTab === 'solicitud' && (
        <div className="space-y-6">
          <div className="p-5 bg-[var(--panel)] border border-[var(--sep)] rounded space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[var(--campo)] border border-[var(--sep)] rounded text-[var(--accion)]">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-[var(--texto)]">
                    Protocolo de Acceso Autorizado a Inferencia Canónica de Autoencoders
                  </h2>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-amber-500/20 border border-amber-400/40 text-amber-300">
                    CANAL OFICIAL PENDIENTE DE ASIGNACIÓN INSTITUCIONAL
                  </span>
                </div>
                <p className="text-xs text-[var(--texto-tenue)] mt-0.5">
                  Procedimiento de gobernanza para comités de ética, instituciones de salud, universidades y evaluadores de SensorLab
                </p>
              </div>
            </div>

            <p className="text-xs text-[var(--texto-sec)] leading-relaxed">
              Para salvaguardar la seguridad de los pacientes, prevenir el uso indebido de modelos diagnósticos experimentales y dar cumplimiento a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) y la Norma Oficial Mexicana NOM-024-SSA3-2012, los pesos binarios y artefactos canónicos de la red neuronal de CENIVRA <b>no se distribuyen en repositorios abiertos</b>.
            </p>

            <div className="p-4 bg-[var(--campo)] border border-[var(--sep)] rounded space-y-3">
              <h3 className="text-xs font-bold text-[var(--texto)]">Requisitos Mandatorios de Elegibilidad:</h3>
              <ol className="list-decimal list-inside space-y-1.5 text-xs text-[var(--texto-sec)]">
                <li>
                  <b>Acreditación Institucional:</b> Ser una institución hospitalaria, centro de investigación o entidad participante en programas formales de incubación o validación tecnológica (e.g. SensorLab).
                </li>
                <li>
                  <b>Dictamen de Comité de Ética (CEI):</b> Contar con protocolo de investigación aprobado por un Comité de Ética en Investigación registrado ante CONBIOÉTICA / COFEPRIS (o carta de excepción fundamentada en investigación de usabilidad de software sin sujetos humanos).
                </li>
                <li>
                  <b>Convenio de Transferencia de Tecnología:</b> Firma de convenio de colaboración o acuerdo de licencia académica restringida con CENIVRA.
                </li>
                <li>
                  <b>Entorno Computacional Seguro:</b> Compromiso de despliegue en servidores o estaciones de trabajo locales (on-premise) aisladas de la red pública, con cifrado en reposo para las bases SQLite.
                </li>
                <li>
                  <b>Emisión de Llave Criptográfica:</b> Los pesos del modelo canónico se entregarán cifrados mediante un archivo de sobre criptográfico (.enc) verificable únicamente contra el token de estación local autorizado.
                </li>
              </ol>
            </div>

            {/* Template Generator */}
            <div className="pt-2 space-y-3">
              <h3 className="text-xs font-bold text-[var(--texto)]">
                Generador Local de Solicitud de Acceso Institucional:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[11px] text-[var(--texto-tenue)] block mb-1">
                    Institución o Centro Solicitante:
                  </label>
                  <input
                    type="text"
                    value={instName}
                    onChange={(e) => setInstName(e.target.value)}
                    placeholder="Ej. SensorLab / Hospital Psiquiátrico Universitario"
                    className="w-full p-2 bg-[var(--campo)] border border-[var(--sep)] rounded text-xs text-[var(--texto)]"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[var(--texto-tenue)] block mb-1">
                    Investigador Responsable:
                  </label>
                  <input
                    type="text"
                    value={instInvestigator}
                    onChange={(e) => setInstInvestigator(e.target.value)}
                    placeholder="Ej. Dr. / Mtro. Responsable de Proyecto"
                    className="w-full p-2 bg-[var(--campo)] border border-[var(--sep)] rounded text-xs text-[var(--texto)]"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[var(--texto-tenue)] block mb-1">
                    Correo Electrónico Institucional:
                  </label>
                  <input
                    type="email"
                    value={instEmail}
                    onChange={(e) => setInstEmail(e.target.value)}
                    placeholder="investigador@institucion.edu.mx"
                    className="w-full p-2 bg-[var(--campo)] border border-[var(--sep)] rounded text-xs text-[var(--texto)]"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[var(--texto-tenue)] block mb-1">
                    Folio CEI / Dictamen Ético:
                  </label>
                  <input
                    type="text"
                    value={instEthicsApproval}
                    onChange={(e) => setInstEthicsApproval(e.target.value)}
                    placeholder="Ej. CEI-CENIVRA-2026-004 o N/A Tecnológico"
                    className="w-full p-2 bg-[var(--campo)] border border-[var(--sep)] rounded text-xs text-[var(--texto)]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-[var(--texto-tenue)] block mb-1">
                  Alcance y Justificación del Proyecto:
                </label>
                <textarea
                  value={instProjectScope}
                  onChange={(e) => setInstProjectScope(e.target.value)}
                  rows={2}
                  className="w-full p-2 bg-[var(--campo)] border border-[var(--sep)] rounded text-xs text-[var(--texto)]"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[10px] text-[var(--texto-tenue)] font-mono">
                  * Este formulario se procesa 100% en memoria local y no envía datos a ningún servidor externo.
                </span>
                <button
                  onClick={handleCopyRequest}
                  className="px-4 py-2 bg-[var(--accion)] text-white text-xs font-medium rounded flex items-center gap-1.5 hover:opacity-90 transition-opacity cursor-pointer"
                >
                  {copiedRequest ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedRequest ? 'Copiado al Portapapeles' : 'Copiar Plantilla de Solicitud'}</span>
                </button>
              </div>

              {/* Preview Box */}
              <div className="mt-3">
                <div className="text-[11px] font-semibold text-[var(--texto-tenue)] mb-1">
                  Previsualización del Documento de Solicitud:
                </div>
                <pre className="p-3 bg-[var(--campo)] border border-[var(--sep)] rounded text-[10.5px] font-mono text-[var(--texto-sec)] whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {requestTemplateMarkdown}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
