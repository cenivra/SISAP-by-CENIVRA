import React, { useEffect, useState } from 'react';
import { RoleConfig, UserAccount } from '../../types/clinical';
import {
  Cpu,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  FileWarning,
  Sliders,
  Layers,
  Database,
  Download,
  Copy,
  RefreshCw,
  Upload,
  Sparkles,
  Zap,
  TrendingUp,
  FileText,
  Activity,
  Check,
  Lock,
} from 'lucide-react';
import {
  AutoencoderEngine,
  AutoencoderInferenceResult,
} from '../../services/autoencoderEngine';
import {
  CANONICAL_VARIABLES_24,
  LATENT_DIMENSIONS_METADATA,
  NORMALIZATION_PARAMS,
} from '../../data/autoencoderData';
import {
  parseRawNumbers,
  computeBis11,
  computeBsl23,
  computeGad7,
  computeStaxi2,
  computeBads,
  computeEros,
  assemble24Vector,
} from '../../services/scalesEngine';
import { LatentRadarChart } from '../LatentRadarChart';
import { StorageService } from '../../services/storageService';
import {
  PatientApiService,
  ModelGovernanceRegistryPayload,
} from '../../services/patientApiService';

interface AnalysisModelViewProps {
  currentUser: UserAccount;
  roleConfig: RoleConfig;
  onGovernanceUpdated?: (activeModelId: string) => void;
}

export const AnalysisModelView: React.FC<AnalysisModelViewProps> = ({
  currentUser,
  roleConfig,
  onGovernanceUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'gobernanza' | 'estado' | 'pesos' | 'sandbox' | 'longitudinal'>('gobernanza');

  // Gobernanza central de modelos (SQLite model_governance_registry)
  const [governanceData, setGovernanceData] = useState<ModelGovernanceRegistryPayload | null>(null);
  const [governanceLoading, setGovernanceLoading] = useState<boolean>(false);
  const [governanceError, setGovernanceError] = useState<string | null>(null);
  const [governanceSuccess, setGovernanceSuccess] = useState<string | null>(null);
  const [activationJustification, setActivationJustification] = useState<string>('');
  const [activatingModelId, setActivatingModelId] = useState<string | null>(null);

  const loadGovernance = async () => {
    setGovernanceLoading(true);
    setGovernanceError(null);
    try {
      const gov = await PatientApiService.getAutoencoderGovernance();
      setGovernanceData(gov);
      if (gov.active_model_id && onGovernanceUpdated) {
        onGovernanceUpdated(gov.active_model_id);
      }
    } catch (err: unknown) {
      setGovernanceError(
        err instanceof Error ? err.message : 'Backend SQLite no disponible para consultar gobernanza.'
      );
    } finally {
      setGovernanceLoading(false);
    }
  };

  useEffect(() => {
    void loadGovernance();
  }, []);

  const handleActivateModel = async (modelId: string) => {
    if (!roleConfig.administra) {
      setGovernanceError(
        'Acceso denegado: solo Superadministración o Administración pueden cambiar el modelo clínico activo.'
      );
      return;
    }
    setActivatingModelId(modelId);
    setGovernanceError(null);
    setGovernanceSuccess(null);
    try {
      const res = await PatientApiService.setActiveGovernanceModel(
        modelId,
        activationJustification.trim() || `Activación administrativa desde Arquitectura y Pesos (${currentUser.u})`
      );
      setGovernanceSuccess(
        `Modelo autorizado actualizado a ${res.active_model_id || modelId}. Toda inferencia clínica automática ejecutará esta versión.`
      );
      setActivationJustification('');
      await loadGovernance();
    } catch (err: unknown) {
      setGovernanceError(err instanceof Error ? err.message : 'No fue posible actualizar el modelo activo.');
    } finally {
      setActivatingModelId(null);
    }
  };

  // Weights management state
  const [currentWeights, setCurrentWeights] = useState<number[][]>(AutoencoderEngine.getActiveWeights());
  const [isCustom, setIsCustom] = useState<boolean>(AutoencoderEngine.hasCustomWeights());
  const [showEditWeightsModal, setShowEditWeightsModal] = useState<boolean>(false);
  const [weightsJsonInput, setWeightsJsonInput] = useState<string>('');
  const [weightsError, setWeightsError] = useState<string | null>(null);
  const [weightsSuccess, setWeightsSuccess] = useState<string | null>(null);

  // Sandbox state (STAXI-2 usa 49 reactivos reales)
  const [sandboxBis, setSandboxBis] = useState<string>('3 2 4 3 2 1 4 2 3 4 3 2 4 3 2 3 4 2 3 2 4 3 2 4 3 2 3 4 2 3');
  const [sandboxBsl, setSandboxBsl] = useState<string>('2 3 1 2 4 3 2 1 2 3 4 2 1 3 2 2 3 4 1 2 3 2 1');
  const [sandboxGad, setSandboxGad] = useState<string>('2 3 2 3 1 2 2');
  const [sandboxStaxi, setSandboxStaxi] = useState<string>(
    Array(49).fill(0).map((_, i) => (i % 3) + 1).join(' ')
  );
  const [sandboxBads, setSandboxBads] = useState<string>(
    Array(25).fill(0).map((_, i) => ((i * 2) % 6) + 1).join(' ')
  );
  const [sandboxEros, setSandboxEros] = useState<string>('4 5 3 6 4 5 3 4 5 4');
  const [sandboxEdad, setSandboxEdad] = useState<number>(38);
  const [sandboxTiempo, setSandboxTiempo] = useState<number>(7);
  const [sandboxTratamientos, setSandboxTratamientos] = useState<number>(2);

  // Longitudinal export state
  const [copiedLongitudinal, setCopiedLongitudinal] = useState<boolean>(false);
  const [copiedPytorchCode, setCopiedPytorchCode] = useState<boolean>(false);

  // Re-run sandbox inference on inputs change
  const bisCalculated = computeBis11(parseRawNumbers(sandboxBis, 30, 2));
  const bslCalculated = computeBsl23(parseRawNumbers(sandboxBsl, 23, 1));
  const gadCalculated = computeGad7(parseRawNumbers(sandboxGad, 7, 1));
  const staxiCalculated = computeStaxi2(parseRawNumbers(sandboxStaxi, 49, 2));
  const badsCalculated = computeBads(parseRawNumbers(sandboxBads, 25, 3));
  const erosTotal = computeEros(parseRawNumbers(sandboxEros, 10, 4));

  const sandboxVector24 = assemble24Vector({
    bis: bisCalculated,
    staxi: staxiCalculated,
    bsl: bslCalculated,
    gad: gadCalculated,
    bads: badsCalculated,
    edad: sandboxEdad,
    tiempoConsumoAnios: sandboxTiempo,
    tratamientosPrevios: sandboxTratamientos,
  });

  const sandboxInference: AutoencoderInferenceResult = AutoencoderEngine.runTransversalInference(sandboxVector24);

  // Longitudinal corpus generation
  const allPatients = StorageService.getPatients();
  const allEvaluations = StorageService.getEvaluations();
  const allNarratives = StorageService.getWeeklyNarratives();
  const allEvolutions = StorageService.getEvolutionNotes();
  const longitudinalCorpus = AutoencoderEngine.exportLongitudinalTrainingCorpus(
    allPatients.map((p) => p.seudonimo),
    {
      evaluations: allEvaluations,
      narratives: allNarratives,
      evolutions: allEvolutions,
    }
  );

  const handleOpenEditWeights = () => {
    setWeightsJsonInput(JSON.stringify(currentWeights, null, 2));
    setWeightsError(null);
    setWeightsSuccess(null);
    setShowEditWeightsModal(true);
  };

  const handleSaveCustomWeights = () => {
    setWeightsError(null);
    try {
      const parsed = JSON.parse(weightsJsonInput);
      const res = AutoencoderEngine.setCustomWeights(parsed);
      if (!res.success) {
        setWeightsError(res.message);
        return;
      }
      setCurrentWeights(AutoencoderEngine.getActiveWeights());
      setIsCustom(true);
      setWeightsSuccess('¡Matriz de pesos guardada exitosamente!');
      setTimeout(() => {
        setShowEditWeightsModal(false);
        setWeightsSuccess(null);
      }, 1200);
    } catch (err: any) {
      setWeightsError(`Formato JSON inválido: ${err.message}`);
    }
  };

  const handleResetWeights = () => {
    if (confirm('¿Desea restablecer los pesos a la configuración original de fábrica entrenada por CENIVRA?')) {
      AutoencoderEngine.resetToDefaultWeights();
      setCurrentWeights(AutoencoderEngine.getActiveWeights());
      setIsCustom(false);
      alert('Pesos restablecidos a los valores canónicos de CENIVRA.');
    }
  };

  const handleDownloadWeightsJson = () => {
    const data = {
      model_type: 'CENIVRA_Transversal_Autoencoder',
      dimensions: { input: 24, latent: 12 },
      canonical_variables: CANONICAL_VARIABLES_24,
      latent_metadata: LATENT_DIMENSIONS_METADATA,
      normalization_params: AutoencoderEngine.getActiveNormalizationParams(),
      weights_matrix_24x12: currentWeights,
      exported_at: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cenivra_autoencoder_weights_24x12_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const pytorchSnippet = `# Arquitectura PyTorch del Autoencoder Transversal CENIVRA (24 -> 12 -> 24)
import torch
import torch.nn as nn

class CENIVRATransversalAutoencoder(nn.Module):
    def __init__(self):
        super().__init__()
        # Capa de codificación a espacio latente
        self.encoder = nn.Sequential(
            nn.Linear(24, 12, bias=False),
            nn.LeakyReLU(negative_slope=0.1)
        )
        # Capa de decodificación para reconstrucción
        self.decoder = nn.Sequential(
            nn.Linear(12, 24),
            nn.Identity()
        )

    def forward(self, x):
        latent = self.encoder(x)
        reconstruction = self.decoder(latent)
        return latent, reconstruction

# Cargar pesos del modelo desde SISAP:
# model.encoder[0].weight.data = torch.tensor(weights_24x12).T.float()
`;

  const handleCopyPytorch = () => {
    navigator.clipboard.writeText(pytorchSnippet);
    setCopiedPytorchCode(true);
    setTimeout(() => setCopiedPytorchCode(false), 2000);
  };

  const handleDownloadLongitudinalCsv = () => {
    const blob = new Blob([longitudinalCorpus.csvCorpus], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `corpus_longitudinal_cenivra_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadLongitudinalJson = () => {
    const blob = new Blob([longitudinalCorpus.jsonCorpus], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `corpus_longitudinal_cenivra_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Permanent Warning Banner for Sandbox / Theoretical Architecture */}
      <div className="wb-surface border-l-4 border-l-[var(--advertencia)] p-3.5 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-[var(--advertencia)] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-xs tracking-wide uppercase text-[var(--advertencia)] flex flex-wrap items-center gap-2">
            <span>Entorno de Gobernanza, Matriz Teórica y Sandbox Técnico</span>
          </div>
          <p className="text-xs text-[var(--texto-sec)] leading-relaxed">
            La pestaña <b>Gobernanza y Registro Central</b> administra el modelo clínico autorizado en SQLite (exclusivo para Administración). Las pestañas <b>Matriz de Pesos (24 × 12)</b> y <b>Sandbox</b> operan con datos de laboratorio sin afectar los expedientes clínicos.
          </p>
        </div>
      </div>

      {/* View Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg font-bold tracking-tight text-[var(--texto)]">
              Centro del Motor Neuronal y Autoencoders · CENIVRA
            </h2>
            <span className="est-warn inline-flex items-center gap-1 font-bold text-xs px-2 py-0.5 rounded border border-amber-500/40 bg-amber-500/10 text-amber-300">
              <AlertTriangle className="w-3.5 h-3.5" /> Entorno de Auditoría y Sandbox
            </span>
          </div>
          <div className="text-xs text-[var(--texto-tenue)]">
            Integración de pesos de autoencoder transversal (24→12), banco de inferencia en tiempo real y preparación del pipeline longitudinal
          </div>
        </div>

        {/* Global actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadWeightsJson}
            className="sisap-btn-sec text-xs py-1.5 inline-flex items-center gap-1.5"
            title="Descargar matriz en JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar Pesos (JSON)</span>
          </button>
          <button
            onClick={handleOpenEditWeights}
            className="sisap-btn text-xs py-1.5 inline-flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Importar / Ajustar Pesos</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-[var(--sep-claro)] pb-2 text-xs">
        <button
          onClick={() => setActiveTab('gobernanza')}
          className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'gobernanza'
              ? 'bg-[var(--captura)] text-[var(--accion)] font-bold border-b-2 border-[var(--accion)]'
              : 'text-[var(--texto-sec)] hover:bg-[var(--panel)]'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Gobernanza y Registro Central de Modelos</span>
        </button>

        <button
          onClick={() => setActiveTab('pesos')}
          className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'pesos'
              ? 'bg-[var(--captura)] text-[var(--accion)] font-bold border-b-2 border-[var(--accion)]'
              : 'text-[var(--texto-sec)] hover:bg-[var(--panel)]'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Matriz de Pesos (24 × 12)</span>
          {isCustom && <span className="bg-[var(--accion)] text-black text-[9px] px-1 py-0.2 rounded font-bold">Personalizada</span>}
        </button>

        <button
          onClick={() => setActiveTab('sandbox')}
          className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'sandbox'
              ? 'bg-[var(--captura)] text-[var(--accion)] font-bold border-b-2 border-[var(--accion)]'
              : 'text-[var(--texto-sec)] hover:bg-[var(--panel)]'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Banco de Pruebas e Inferencia (Sandbox)</span>
        </button>

        <button
          onClick={() => setActiveTab('longitudinal')}
          className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'longitudinal'
              ? 'bg-[var(--captura)] text-[var(--accion)] font-bold border-b-2 border-[var(--accion)]'
              : 'text-[var(--texto-sec)] hover:bg-[var(--panel)]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Pipeline y Datos para Autoencoder Longitudinal</span>
          <span className="bg-[var(--advertencia)]/20 text-[var(--advertencia)] text-[9px] px-1 py-0.2 rounded font-semibold">En desarrollo</span>
        </button>

        <button
          onClick={() => setActiveTab('estado')}
          className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'estado'
              ? 'bg-[var(--captura)] text-[var(--accion)] font-bold border-b-2 border-[var(--accion)]'
              : 'text-[var(--texto-sec)] hover:bg-[var(--panel)]'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Auditoría Científica DICO / DCSA</span>
        </button>
      </div>

      {/* TAB 0: GOBERNANZA Y REGISTRO CENTRAL DE MODELOS */}
      {activeTab === 'gobernanza' && (
        <div className="space-y-4">
          <div className="wb-surface p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[var(--sep)]">
              <div>
                <div className="wb-eyebrow">Registro Persistente en SQLite · model_governance_registry</div>
                <h3 className="text-sm font-bold text-[var(--texto)]">
                  Gobernanza de Versiones del Autoencoder y Control de Acceso (RBAC)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {governanceData?.active_model_id && (
                  <span className="est-ok font-mono">
                    Activo: {governanceData.active_model_id}
                  </span>
                )}
                <button
                  type="button"
                  onClick={loadGovernance}
                  disabled={governanceLoading}
                  className="sisap-btn-sec text-xs py-1 px-2.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${governanceLoading ? 'animate-spin' : ''}`} />
                  <span>Actualizar</span>
                </button>
              </div>
            </div>

            {!roleConfig.administra && (
              <div className="p-2.5 rounded bg-[var(--campo)] border border-[var(--sep-claro)] text-xs text-[var(--texto-sec)] flex items-center gap-2">
                <Lock className="w-4 h-4 text-[var(--advertencia)] shrink-0" />
                <span>
                  Vista de solo lectura para rol <b>{currentUser.rol}</b>. La activación o sustitución de modelos está reservada a Superadministración / Administración del Centro.
                </span>
              </div>
            )}

            {governanceError && (
              <div className="p-2.5 rounded bg-[var(--riesgo)]/10 border border-[var(--riesgo)]/40 text-xs text-[var(--riesgo)]">
                {governanceError}
              </div>
            )}

            {governanceSuccess && (
              <div className="p-2.5 rounded bg-[var(--normal)]/10 border border-[var(--normal)]/40 text-xs text-[var(--normal)]">
                {governanceSuccess}
              </div>
            )}

            {roleConfig.administra && (
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <input
                  type="text"
                  value={activationJustification}
                  onChange={(e) => setActivationJustification(e.target.value)}
                  placeholder="Justificación técnica / regulatoria para cambio de modelo activo..."
                  className="sisap-input flex-1 min-w-[240px]"
                />
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse tabular-nums">
                <thead>
                  <tr className="border-b border-[var(--sep-claro)] text-[var(--texto-tenue)] font-mono text-[10.5px] uppercase">
                    <th className="py-2 px-2.5">Modelo</th>
                    <th className="py-2 px-2.5">Arquitectura</th>
                    <th className="py-2 px-2.5">Estado Gobernanza</th>
                    <th className="py-2 px-2.5">Integridad SHA-256</th>
                    <th className="py-2 px-2.5">Uso Clínico</th>
                    <th className="py-2 px-2.5 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--sep)]">
                  {(governanceData?.models || []).map((entry) => {
                    const isActive = entry.governance_state === 'ACTIVE_DEFAULT';
                    const integrityOk = Boolean(entry.disk_integrity?.ok ?? entry.disk_integrity?.verified);
                    const canPromote =
                      roleConfig.administra &&
                      !isActive &&
                      entry.clinical_use_allowed &&
                      integrityOk;
                    return (
                      <tr key={entry.model_id} className={isActive ? 'bg-[var(--captura)]' : 'hover:bg-[var(--panel-elev)]'}>
                        <td className="py-2 px-2.5">
                          <div className="font-mono font-bold text-[var(--accion)]">{entry.model_id}</div>
                          <div className="text-[11px] text-[var(--texto-sec)]">{entry.display_name}</div>
                        </td>
                        <td className="py-2 px-2.5 font-mono text-[11px]">
                          <div className="font-semibold text-[var(--texto)]">
                            {entry.input_variables_count}→{entry.latent_dim}D
                          </div>
                          <div className="text-[10px] text-[var(--texto-tenue)] truncate max-w-[230px]" title={entry.architecture_spec}>
                            {entry.architecture_spec}
                          </div>
                        </td>
                        <td className="py-2 px-2.5">
                          <span
                            className={
                              isActive
                                ? 'est-ok'
                                : entry.governance_state === 'VALIDATED_ELIGIBLE'
                                ? 'est-warn'
                                : 'est-pend'
                            }
                          >
                            {entry.governance_state}
                          </span>
                        </td>
                        <td className="py-2 px-2.5 font-mono text-[10.5px]">
                          {integrityOk ? (
                            <span className="text-[var(--normal)]" title={entry.artifact_sha256 || ''}>
                              ✓ {(entry.disk_integrity?.observedSha256 || entry.artifact_sha256 || '').slice(0, 14)}…
                            </span>
                          ) : (
                            <span className="text-[var(--texto-tenue)]">
                              {entry.disk_integrity?.reason || 'Sin artefacto clínico'}
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-2.5 font-mono">
                          {entry.clinical_use_allowed ? (
                            <span className="text-[var(--normal)]">Autorizado</span>
                          ) : (
                            <span className="text-[var(--riesgo)]">Bloqueado</span>
                          )}
                        </td>
                        <td className="py-2 px-2.5 text-right">
                          {isActive ? (
                            <span className="est-ok">Predeterminado</span>
                          ) : canPromote ? (
                            <button
                              type="button"
                              disabled={activatingModelId === entry.model_id}
                              onClick={() => handleActivateModel(entry.model_id)}
                              className="sisap-btn py-1 px-2 text-[11px]"
                            >
                              {activatingModelId === entry.model_id ? 'Aplicando...' : 'Activar'}
                            </button>
                          ) : (
                            <span className="text-[10.5px] font-mono text-[var(--texto-tenue)]">No elegible / Bloq.</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Auditoría Reciente de model_runs (8 campos obligatorios) */}
          <div className="wb-surface p-4 space-y-2">
            <div className="wb-eyebrow">Auditoría de Inferencias Recientes (SQLite model_runs · 8 Campos Trazables)</div>
            <div className="overflow-x-auto max-h-64">
              <table className="w-full text-[11px] font-mono text-left border-collapse tabular-nums">
                <thead>
                  <tr className="border-b border-[var(--sep-claro)] text-[var(--texto-tenue)]">
                    <th className="py-1.5 px-2">Fecha</th>
                    <th className="py-1.5 px-2">Expediente</th>
                    <th className="py-1.5 px-2">Modelo</th>
                    <th className="py-1.5 px-2">Preproc / Schema</th>
                    <th className="py-1.5 px-2">SHA-256</th>
                    <th className="py-1.5 px-2">Actor</th>
                    <th className="py-1.5 px-2">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--sep)]">
                  {(governanceData?.recent_runs || []).slice(0, 10).map((run) => (
                    <tr key={run.run_id} className="hover:bg-[var(--panel-elev)]">
                      <td className="py-1.5 px-2">{(run.executed_at || '').slice(0, 16).replace('T', ' ')}</td>
                      <td className="py-1.5 px-2 text-[var(--accion)]">{run.patient_pseudonym || run.patient_or_evaluation_id || '—'}</td>
                      <td className="py-1.5 px-2">{run.model_id}</td>
                      <td className="py-1.5 px-2">{run.preprocessing_version} / {run.input_schema_version}</td>
                      <td className="py-1.5 px-2">{run.artifact_sha256 ? `${run.artifact_sha256.slice(0, 12)}…` : '—'}</td>
                      <td className="py-1.5 px-2">{run.executed_by} ({run.actor_role})</td>
                      <td className="py-1.5 px-2">
                        <span className={run.execution_status === 'completed' ? 'est-ok' : 'est-warn'}>
                          {run.execution_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {(!governanceData?.recent_runs || governanceData.recent_runs.length === 0) && (
                    <tr>
                      <td colSpan={7} className="py-3 text-center text-[var(--texto-tenue)]">
                        Sin corridas persistidas en model_runs todavía.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: MATRIZ DE PESOS */}
      {activeTab === 'pesos' && (
        <div className="space-y-5">
          <div className="p-3 rounded bg-[var(--campo)] border border-[var(--info)]/40 text-xs text-[var(--texto-sec)]">
            <b className="text-[var(--info)]">Aclaración Técnica:</b> La tabla <code>ENCODER_PROJECTION_WEIGHTS</code> (24×12) es una proyección lineal informativa/exploratoria para inspección estructural. Toda inferencia clínica real en el Ecosistema de Inteligencia ejecuta las <b>5 capas neuronales SELU</b> verificadas criptográficamente por SHA-256.
          </div>
          {/* Status card */}
          <div className="p-4 rounded bg-[var(--campo)] border border-[var(--borde)]/30 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[var(--texto)]">Estado de la Matriz de Proyección:</span>
                {isCustom ? (
                  <span className="est-warn font-semibold">Pesos Personalizados Cargados</span>
                ) : (
                  <span className="est-ok font-semibold">Pesos Originales Entrenados (CENIVRA)</span>
                )}
              </div>
              <p className="text-[var(--texto-sec)] text-[11px]">
                Dimensión de Entrada: <b>24 variables canónicas normalizadas</b> → Dimensión Latente: <b>12 componentes ortogonales</b>.
                Función de activación: <code>LeakyReLU(α=0.1)</code>.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {isCustom && (
                <button
                  onClick={handleResetWeights}
                  className="sisap-btn-sec text-xs py-1 px-2.5 text-[var(--advertencia)]"
                  title="Volver a los pesos de fábrica"
                >
                  <RefreshCw className="w-3 h-3 inline mr-1" />
                  Restablecer Originales
                </button>
              )}
              <button
                onClick={handleCopyPytorch}
                className="sisap-btn-sec text-xs py-1 px-2.5"
                title="Copiar código Python / PyTorch"
              >
                {copiedPytorchCode ? <Check className="w-3 h-3 text-[var(--normal)] inline mr-1" /> : <Copy className="w-3 h-3 inline mr-1" />}
                {copiedPytorchCode ? 'Copiado' : 'Script PyTorch'}
              </button>
            </div>
          </div>

          {/* Normalization parameters table */}
          <div className="sisap-captura">
            <h3 className="text-xs font-bold text-[var(--texto)] mb-2 uppercase tracking-wide">
              1. Parámetros de Normalización Z-Score (Media y Desviación Estándar empíricas)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 text-[11px]">
              {CANONICAL_VARIABLES_24.map((varName) => {
                const norm = NORMALIZATION_PARAMS[varName] || { media: 0, sd: 1 };
                return (
                  <div key={varName} className="p-2 rounded bg-[var(--panel)] border border-[var(--sep)]">
                    <div className="font-mono text-[var(--accion)] font-semibold truncate" title={varName}>
                      {varName}
                    </div>
                    <div className="text-[var(--texto-tenue)] flex justify-between mt-1">
                      <span>μ: {norm.media}</span>
                      <span>σ: {norm.sd}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Projection Matrix Table (24 x 12) */}
          <div className="sisap-captura">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-[var(--texto)] uppercase tracking-wide">
                2. Matriz de Proyección Encoder [24 Filas × 12 Dimensiones Latentes]
              </h3>
              <span className="text-[10px] text-[var(--texto-tenue)]">
                Pesos w_ij multiplicados por z_i: Σ(z_i * w_ij)
              </span>
            </div>

            <div className="overflow-x-auto max-h-96 border border-[var(--sep)] rounded">
              <table className="w-full text-[11px] font-mono text-left border-collapse">
                <thead className="sticky top-0 bg-[var(--campo)] border-b border-[var(--borde)] text-[var(--texto-tenue)] z-10">
                  <tr>
                    <th className="py-2 px-2.5 font-bold">Variable Canónica (i)</th>
                    {LATENT_DIMENSIONS_METADATA.map((meta, colIdx) => (
                      <th key={meta.id} className="py-2 px-2 text-right font-bold" title={meta.label}>
                        {meta.id}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--sep)] bg-[var(--fondo)]">
                  {CANONICAL_VARIABLES_24.map((varName, rowIdx) => {
                    const rowWeights = currentWeights[rowIdx] || Array(12).fill(0);
                    return (
                      <tr key={varName} className="hover:bg-[var(--panel)] transition-colors">
                        <td className="py-1.5 px-2.5 font-medium text-[var(--texto)] border-r border-[var(--sep)] whitespace-nowrap">
                          <span className="text-[var(--accion)] font-semibold mr-1.5">#{rowIdx + 1}</span>
                          {varName}
                        </td>
                        {rowWeights.map((w, colIdx) => {
                          const isHigh = Math.abs(w) > 0.25;
                          const isPositive = w > 0;
                          return (
                            <td
                              key={colIdx}
                              className={`py-1.5 px-2 text-right tabular-nums whitespace-nowrap ${
                                isHigh
                                  ? isPositive
                                    ? 'text-[var(--normal)] font-bold bg-[var(--normal)]/5'
                                    : 'text-[var(--advertencia)] font-bold bg-[var(--advertencia)]/5'
                                  : 'text-[var(--texto-sec)]'
                              }`}
                            >
                              {w >= 0 ? `+${w.toFixed(4)}` : w.toFixed(4)}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SANDBOX DE INFERENCIA EN VIVO */}
      {activeTab === 'sandbox' && (
        <div className="space-y-6">
          <div className="p-4 rounded bg-[var(--captura)] border border-[var(--accion)]/30 text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-[var(--accion)] flex items-center gap-1.5">
                <Zap className="w-4 h-4" /> Banco de Pruebas en Vivo (Live Autoencoder Forward Pass)
              </span>
              <button
                onClick={() => {
                  setSandboxBis('1 2 1 2 1 1 2 1 2 1 2 1 2 1 2 1 2 1 2 1 2 1 2 1 2 1 2 1 2 1');
                  setSandboxBsl('0 1 0 1 0 1 0 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 0');
                  setSandboxGad('1 0 1 1 0 1 0');
                  setSandboxStaxi(Array(49).fill(1).join(' '));
                  setSandboxBads(Array(25).fill(4).join(' '));
                  setSandboxEros('6 6 5 6 5 6 6 5 6 5');
                  setSandboxEdad(30);
                  setSandboxTiempo(2);
                  setSandboxTratamientos(0);
                }}
                className="text-[11px] text-[var(--accion)] underline hover:opacity-80"
              >
                Cargar Caso Leve/Estable
              </button>
            </div>
            <p className="text-[var(--texto-sec)]">
              Ingrese datos crudos de las 6 escalas iniciales y demografía. La inferencia matemática se ejecuta en tiempo real proyectando hacia las 12 dimensiones latentes y clasificando en clústeres clínicos.
            </p>
          </div>

          {/* Raw input matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div className="sisap-captura space-y-2">
              <div className="flex justify-between font-bold">
                <span>BIS-11 (30 reactivos, 1-4)</span>
                <span className="text-[var(--accion)]">Total: {bisCalculated.total}</span>
              </div>
              <textarea
                value={sandboxBis}
                onChange={(e) => setSandboxBis(e.target.value)}
                rows={2}
                className="w-full font-mono text-xs p-2 rounded bg-[var(--campo)] border border-[var(--borde)]"
                placeholder="Valores separados por espacios o comas"
              />
              <div className="text-[10px] text-[var(--texto-tenue)] flex justify-between">
                <span>Motora: {bisCalculated.motor}</span>
                <span>No-planeación: {bisCalculated.nonplanning}</span>
                <span>Inestabilidad: {bisCalculated.cognitive_instability}</span>
              </div>
            </div>

            <div className="sisap-captura space-y-2">
              <div className="flex justify-between font-bold">
                <span>BSL-23 (23 reactivos, 0-4)</span>
                <span className="text-[var(--accion)]">Media: {bslCalculated.general}</span>
              </div>
              <textarea
                value={sandboxBsl}
                onChange={(e) => setSandboxBsl(e.target.value)}
                rows={2}
                className="w-full font-mono text-xs p-2 rounded bg-[var(--campo)] border border-[var(--borde)]"
                placeholder="Valores 0 a 4"
              />
              <div className="text-[10px] text-[var(--texto-tenue)]">
                Total integrado: {bslCalculated.total_integrado}
              </div>
            </div>

            <div className="sisap-captura space-y-2">
              <div className="flex justify-between font-bold">
                <span>GAD-7 (7 reactivos, 0-3)</span>
                <span className="text-[var(--accion)]">Total: {gadCalculated.total} ({gadCalculated.severidad})</span>
              </div>
              <textarea
                value={sandboxGad}
                onChange={(e) => setSandboxGad(e.target.value)}
                rows={2}
                className="w-full font-mono text-xs p-2 rounded bg-[var(--campo)] border border-[var(--borde)]"
                placeholder="Valores 0 a 3"
              />
              <div className="text-[10px] text-[var(--texto-tenue)]">
                Z-Score: {gadCalculated.zscore}
              </div>
            </div>

            <div className="sisap-captura space-y-2">
              <div className="flex justify-between font-bold">
                <span>STAXI-2 (49 reactivos, 1-4)</span>
                <span className="text-[var(--accion)]">Estado: {staxiCalculated.state} / Rasgo: {staxiCalculated.trait}</span>
              </div>
              <textarea
                value={sandboxStaxi}
                onChange={(e) => setSandboxStaxi(e.target.value)}
                rows={2}
                className="w-full font-mono text-xs p-2 rounded bg-[var(--campo)] border border-[var(--borde)]"
              />
              <div className="text-[10px] text-[var(--texto-tenue)]">
                Temperamento: {staxiCalculated.temperamento}
              </div>
            </div>

            <div className="sisap-captura space-y-2">
              <div className="flex justify-between font-bold">
                <span>BADS (25 reactivos, 0-6)</span>
                <span className="text-[var(--accion)]">Activación: {badsCalculated.activation}</span>
              </div>
              <textarea
                value={sandboxBads}
                onChange={(e) => setSandboxBads(e.target.value)}
                rows={2}
                className="w-full font-mono text-xs p-2 rounded bg-[var(--campo)] border border-[var(--borde)]"
              />
              <div className="text-[10px] text-[var(--texto-tenue)] flex justify-between">
                <span>Evitación: {badsCalculated.avoidance}</span>
                <span>Social: {badsCalculated.social}</span>
              </div>
            </div>

            <div className="sisap-captura space-y-2">
              <div className="flex justify-between font-bold">
                <span>EROS (10 reactivos) & Demografía</span>
                <span className="text-[var(--accion)]">EROS: {erosTotal}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-[var(--texto-tenue)]">Edad</label>
                  <input
                    type="number"
                    value={sandboxEdad}
                    onChange={(e) => setSandboxEdad(parseInt(e.target.value, 10) || 0)}
                    className="w-full p-1 rounded bg-[var(--campo)] border border-[var(--borde)] font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[var(--texto-tenue)]">Años Consumo</label>
                  <input
                    type="number"
                    value={sandboxTiempo}
                    onChange={(e) => setSandboxTiempo(parseInt(e.target.value, 10) || 0)}
                    className="w-full p-1 rounded bg-[var(--campo)] border border-[var(--borde)] font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[var(--texto-tenue)]">Trat. Previos</label>
                  <input
                    type="number"
                    value={sandboxTratamientos}
                    onChange={(e) => setSandboxTratamientos(parseInt(e.target.value, 10) || 0)}
                    className="w-full p-1 rounded bg-[var(--campo)] border border-[var(--borde)] font-mono text-xs"
                  />
                </div>
              </div>
              <textarea
                value={sandboxEros}
                onChange={(e) => setSandboxEros(e.target.value)}
                rows={1}
                className="w-full font-mono text-xs p-1.5 rounded bg-[var(--campo)] border border-[var(--borde)] mt-1"
                placeholder="10 reactivos EROS"
              />
            </div>
          </div>

          {/* Results: Radar Chart + Latent Profiles */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-5 sisap-captura flex flex-col items-center justify-center">
              <h4 className="text-xs font-bold text-[var(--texto)] mb-2 uppercase tracking-wide self-start">
                Perfil de Proyección en Radar (12 Dimensiones)
              </h4>
              <LatentRadarChart dimensions={sandboxInference.latentDimensions} />
            </div>

            <div className="lg:col-span-7 space-y-4">
              {/* Verified Geometry Summary */}
              <div className="p-3.5 rounded bg-[var(--campo)] border border-[var(--borde)]/40 space-y-2 text-xs tabular-nums">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[var(--texto)]">
                    Representación Latente ({sandboxInference.modelId}):
                  </span>
                  <span className="est-ok font-mono font-bold">
                    {sandboxInference.verifiedMetrics.architecture_str}
                  </span>
                </div>
                <div className="text-xs font-mono text-[var(--accion)]">
                  {sandboxInference.summaryIndices.clase_latente_3b} · SHA {sandboxInference.verifiedMetrics.model_sha256_prefix}
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[var(--sep)] text-[11px]">
                  <div>
                    <span className="text-[var(--texto-tenue)] block">MSE Reconstrucción (Z):</span>
                    <span className="font-mono font-bold text-sm text-[var(--texto)]">
                      {sandboxInference.verifiedMetrics.mse_z.toFixed(4)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[var(--texto-tenue)] block">Dist. mediana p50:</span>
                    <span className="font-mono font-bold text-sm text-[var(--texto)]">
                      {sandboxInference.verifiedMetrics.distance_to_cohort_median_p50.toFixed(4)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[var(--texto-tenue)] block">Fuera de p05–p95:</span>
                    <span className="font-mono font-bold text-sm text-[var(--texto)]">
                      {sandboxInference.verifiedMetrics.n_outside_p05_p95} / 12
                    </span>
                  </div>
                </div>
              </div>

              {/* Latent dimensions list */}
              <div className="sisap-captura">
                <h4 className="text-xs font-bold text-[var(--texto)] mb-2 uppercase tracking-wide">
                  Desglose de Coordenadas Latentes y Percentiles
                </h4>
                <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                  {sandboxInference.latentDimensions.map((d) => (
                    <div
                      key={d.dimId}
                      className="p-2 rounded bg-[var(--panel)] border border-[var(--sep)] flex items-center justify-between text-xs"
                    >
                      <div className="truncate max-w-[240px]">
                        <span className="font-mono font-bold text-[var(--accion)] mr-2">{d.dimId}</span>
                        <span className="text-[var(--texto)]">{d.label}</span>
                      </div>
                      <div className="flex items-center gap-3 font-mono text-[11px] shrink-0">
                        <span className="tabular-nums">Z: {d.zScore >= 0 ? `+${d.zScore}` : d.zScore}</span>
                        <span className="tabular-nums text-[var(--texto-tenue)]">P{d.percentile}</span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            d.interpretation === 'Extremo'
                              ? 'bg-[var(--riesgo)]/20 text-[var(--riesgo)]'
                              : d.interpretation === 'Alto'
                              ? 'bg-[var(--advertencia)]/20 text-[var(--advertencia)]'
                              : 'bg-[var(--normal)]/20 text-[var(--normal)]'
                          }`}
                        >
                          {d.interpretation}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PIPELINE Y DATOS PARA AUTOENCODER LONGITUDINAL */}
      {activeTab === 'longitudinal' && (
        <div className="space-y-5">
          <div className="p-4 rounded bg-[var(--campo)] border border-[var(--advertencia)]/30 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-[var(--advertencia)] text-sm">
              <Layers className="w-5 h-5 shrink-0" />
              <span>Preparación de Datos para el Entrenamiento del Autoencoder Longitudinal</span>
            </div>
            <p className="text-[var(--texto)] leading-relaxed">
              Como actualmente estás entrenando el <b>Autoencoder Longitudinal</b> para las evaluaciones temporales y narraciones continuas, SISAP integra un módulo de compilación que extrae todas las secuencias cronológicas del centro (línea base, narraciones semanales, notas de evolución y escalas de seguimiento), calculando los días transcurridos (<code>days_since_admission</code>), secuencias temporales estructuradas y longitudes de tokens.
            </p>
          </div>

          {/* Quick stats on corpus */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded bg-[var(--captura)] border border-[var(--sep)]">
              <span className="text-[var(--texto-tenue)] block">Pacientes en Corpus</span>
              <span className="text-xl font-bold font-mono text-[var(--texto)]">{allPatients.length}</span>
            </div>
            <div className="p-3 rounded bg-[var(--captura)] border border-[var(--sep)]">
              <span className="text-[var(--texto-tenue)] block">Eventos Temporales Compilados</span>
              <span className="text-xl font-bold font-mono text-[var(--accion)]">
                {longitudinalCorpus.totalSequences}
              </span>
            </div>
            <div className="p-3 rounded bg-[var(--captura)] border border-[var(--sep)]">
              <span className="text-[var(--texto-tenue)] block">Formato de Exportación</span>
              <span className="text-xl font-bold font-mono text-[var(--normal)]">CSV & JSON Time-Series</span>
            </div>
          </div>

          {/* Export buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleDownloadLongitudinalCsv}
              className="sisap-btn text-xs py-2 px-3 inline-flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Descargar Dataset Longitudinal (CSV)</span>
            </button>
            <button
              onClick={handleDownloadLongitudinalJson}
              className="sisap-btn-sec text-xs py-2 px-3 inline-flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Descargar Corpus Completo (JSON)</span>
            </button>
          </div>

          {/* Architecture reference recommendation for the user */}
          <div className="sisap-captura space-y-3">
            <h4 className="text-xs font-bold text-[var(--texto)] uppercase tracking-wide">
              Estructura Recomendada para el Autoencoder Longitudinal (PyTorch / TensorFlow)
            </h4>
            <div className="p-3 rounded bg-[var(--fondo)] border border-[var(--sep)] font-mono text-[11px] text-[var(--texto-sec)] leading-relaxed">
              <p className="text-[var(--accion)] font-bold mb-1">// Vector de secuencia temporal por sujeto:</p>
              <p>X_t = [bads_score, eros_score, gad_score, craving_score, text_embedding_dim, delta_days]</p>
              <p className="mt-2 text-[var(--normal)]">// Entrada de arquitectura: [Batch_Size, Max_Timesteps, Feature_Dim]</p>
              <p>Encoder: Bidirectional LSTM(hidden_size=64) → Dense Latent Bottleneck(latent_dim=16)</p>
              <p>Decoder: LSTM(hidden_size=64) → TimeDistributed Dense(Feature_Dim)</p>
              <p className="mt-2 text-[var(--advertencia)]">// Función de pérdida: MSE + β * KL-Divergence (Variational Time Series)</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AUDITORÍA CIENTÍFICA DICO / DCSA */}
      {activeTab === 'estado' && (
        <div className="space-y-5">
          {/* Active Transversal Engine Status Banner */}
          <div className="p-4 rounded bg-[var(--normal)]/10 border border-[var(--normal)]/30 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-[var(--normal)] text-sm">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>Motor del Autoencoder Transversal: Conectado y Operativo</span>
            </div>
            <p className="text-[var(--texto)] leading-relaxed">
              El <b>Autoencoder Transversal</b> para las 6 escalas iniciales (<b>BADS, EROS, GAD-7, STAXI-2, BIS-11 y BSL-23</b>) está plenamente integrado en el sistema. Los pesos entrenados proyectan los 24 reactivos canónicos normalizados hacia las <b>12 Dimensiones Latentes</b>, calculando la severidad multidominio, la desregulación emocional-impulsiva y la clase latente 3B en tiempo real desde la sección de <i>Evaluación Inicial</i>.
            </p>
          </div>

          {/* Primary notice for Longitudinal Model */}
          <div className="p-4 rounded bg-[var(--campo)] border border-[var(--advertencia)]/40 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-[var(--advertencia)] text-sm">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>Autoencoder Longitudinal (DICO / DCSA) · En Fase de Entrenamiento</span>
            </div>
            <p className="text-[var(--texto-sec)] leading-relaxed">
              Para el análisis temporal y longitudinal de las narraciones semanales, el espacio arquitectónico está reservado y resguarda los datos crudos en el corpus institucional. La inferencia automática para este pipeline temporal se mantiene pausada mientras concluye el entrenamiento y validación de sus artefactos neuronales.
            </p>
          </div>

          {/* The 5 Conditions Table */}
          <div className="sisap-captura">
            <h3 className="text-sm font-semibold mb-2">
              Condiciones Pendientes para la Conexión del Autoencoder Longitudinal
            </h3>
            <p className="text-xs text-[var(--texto-tenue)] mb-4">
              Criterios metodológicos que se completarán al concluir el entrenamiento de las narraciones temporales:
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--sep-claro)] text-[var(--texto-tenue)]">
                    <th className="py-2.5 px-3 font-semibold">#</th>
                    <th className="py-2.5 px-3 font-semibold">Criterio Temporal</th>
                    <th className="py-2.5 px-3 font-semibold">Requerimiento</th>
                    <th className="py-2.5 px-3 font-semibold">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--sep-claro)]">
                  <tr className="hover:bg-[var(--panel)] transition-colors">
                    <td className="py-3 px-3 font-mono font-bold">1</td>
                    <td className="py-3 px-3 font-medium">Contrato de Procedencia del Cálculo</td>
                    <td className="py-3 px-3 text-[var(--texto-sec)]">
                      Paso documentado de texto libre a codificación cuantitativa por dimensiones lingüísticas.
                    </td>
                    <td className="py-3 px-3">
                      <span className="est-pend inline-flex items-center gap-1">
                        <XCircle className="w-3 h-3 text-[var(--riesgo)]" /> En estructuración
                      </span>
                    </td>
                  </tr>

                  <tr className="hover:bg-[var(--panel)] transition-colors">
                    <td className="py-3 px-3 font-mono font-bold">2</td>
                    <td className="py-3 px-3 font-medium">Estandarización Intraindividual Verificada</td>
                    <td className="py-3 px-3 text-[var(--texto-sec)]">
                      Normalización z-score respecto a la línea base del propio sujeto longitudinalmente.
                    </td>
                    <td className="py-3 px-3">
                      <span className="est-warn inline-flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> En auditoría
                      </span>
                    </td>
                  </tr>

                  <tr className="hover:bg-[var(--panel)] transition-colors">
                    <td className="py-3 px-3 font-mono font-bold">3</td>
                    <td className="py-3 px-3 font-medium">Concordancia Inter-jueces Registrada</td>
                    <td className="py-3 px-3 text-[var(--texto-sec)]">
                      Coeficiente Kappa de Cohen ≥ 0.85 para la codificación cualitativa de las narraciones.
                    </td>
                    <td className="py-3 px-3">
                      <span className="est-pend inline-flex items-center gap-1">
                        <XCircle className="w-3 h-3 text-[var(--riesgo)]" /> En validación
                      </span>
                    </td>
                  </tr>

                  <tr className="hover:bg-[var(--panel)] transition-colors">
                    <td className="py-3 px-3 font-mono font-bold">4</td>
                    <td className="py-3 px-3 font-medium">Resolución de Discrepancia ATQ-8</td>
                    <td className="py-3 px-3 text-[var(--texto-sec)]">
                      Alineación entre el script analítico y el manuscrito formal respecto a la inclusión del ATQ-8.
                    </td>
                    <td className="py-3 px-3">
                      <span className="est-risk inline-flex items-center gap-1">
                        <FileWarning className="w-3 h-3" /> Discrepancia abierta
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit / Paste Custom Weights */}
      {showEditWeightsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-3xl rounded-lg bg-[var(--panel)] border border-[var(--borde)] shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--sep)]">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[var(--accion)]" />
                <h3 className="font-bold text-sm text-[var(--texto)]">
                  Editor de Pesos de Proyección Latente (Matriz 24 × 12)
                </h3>
              </div>
              <button
                onClick={() => setShowEditWeightsModal(false)}
                className="text-[var(--texto-tenue)] hover:text-[var(--texto)]"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[var(--texto-sec)]">
              Pegue un arreglo JSON de 24 filas por 12 columnas correspondiente a la matriz de pesos de proyección <code>W_encoder</code> obtenida del entrenamiento en PyTorch/TensorFlow.
            </p>

            {weightsError && (
              <div className="p-3 rounded bg-[var(--riesgo)]/15 border border-[var(--riesgo)]/40 text-[var(--riesgo)] text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{weightsError}</span>
              </div>
            )}

            {weightsSuccess && (
              <div className="p-3 rounded bg-[var(--normal)]/15 border border-[var(--normal)]/40 text-[var(--normal)] text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{weightsSuccess}</span>
              </div>
            )}

            <textarea
              value={weightsJsonInput}
              onChange={(e) => setWeightsJsonInput(e.target.value)}
              rows={12}
              className="w-full font-mono text-xs p-3 rounded bg-[var(--fondo)] border border-[var(--borde)] text-[var(--texto)]"
              placeholder="[[...12 valores...], [...24 filas...]]"
            />

            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--sep)]">
              <button
                onClick={() => setShowEditWeightsModal(false)}
                className="sisap-btn-sec text-xs py-1.5 px-3"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveCustomWeights}
                className="sisap-btn text-xs py-1.5 px-4 font-bold"
              >
                Guardar y Aplicar Pesos
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
