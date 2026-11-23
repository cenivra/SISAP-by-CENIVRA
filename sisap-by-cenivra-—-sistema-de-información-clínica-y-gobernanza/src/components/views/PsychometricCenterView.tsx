import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Clock,
  Eye,
  FileCheck2,
  Filter,
  History,
  Info,
  Layers,
  Lock,
  Play,
  RefreshCw,
  Save,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import {
  LongitudinalInstrumentSummary,
  PsychometricEvaluationBundle,
  RoleConfig,
  UserAccount,
} from '../../types/clinical';
import { StorageService } from '../../services/storageService';
import { PatientApiService } from '../../services/patientApiService';
import {
  ACTIVE_INSTRUMENT_IDS,
  ActiveInstrumentId,
  CATALOG_METADATA,
  PsychometricItemSpec,
  ResolvedInstrumentConfig,
  getOptionsForItem,
  resolveInstrumentConfig,
} from '../../psychometrics/instrumentCatalog';
import {
  DigitalItemResponseInput,
  PsychometricOptionalComplements,
  StructuredPsychometricScoreResult,
  scorePsychometricEvaluation,
} from '../../psychometrics/scoringEngine';
import { ScoringMode } from '../../services/scalesEngine';

interface PsychometricCenterViewProps {
  currentUser: UserAccount;
  roleConfig: RoleConfig;
  selectedPseudonym: string;
  onSelectPseudonym?: (pseudonym: string) => void;
  isAnonymousMode?: boolean;
  onNavigate?: (screen: any, pseudonym?: string) => void;
}

type CenterSubView = 'catalog' | 'apply' | 'review' | 'history';
type NavMode = 'single_page' | 'blocks';

export const PsychometricCenterView: React.FC<PsychometricCenterViewProps> = ({
  currentUser,
  roleConfig,
  selectedPseudonym,
  onSelectPseudonym,
  isAnonymousMode = false,
  onNavigate,
}) => {
  // Selección de paciente y contexto
  const [patientQuery, setPatientQuery] = useState<string>('');
  const [evaluatorName, setEvaluatorName] = useState<string>(currentUser.nombre || currentUser.u);
  const [sessionContext, setSessionContext] = useState<string>('evaluacion_clinica');
  const [sessionNumber, setSessionNumber] = useState<string>('1');
  const [notes, setNotes] = useState<string>('');

  // Navegación principal del Centro
  const [subView, setSubView] = useState<CenterSubView>('catalog');
  const [statusBanner, setStatusBanner] = useState<{ type: 'ok' | 'warn' | 'err'; text: string } | null>(null);

  // Versiones seleccionadas por instrumento en el catálogo
  const [selectedVersions, setSelectedVersions] = useState<Record<ActiveInstrumentId, string>>(() => {
    const map: any = {};
    for (const id of ACTIVE_INSTRUMENT_IDS) {
      map[id] = resolveInstrumentConfig(id).defaultVersion;
    }
    return map;
  });

  // Estado de aplicación digital activa
  const [activeInstrumentId, setActiveInstrumentId] = useState<ActiveInstrumentId>('BADS');
  const [activeVersion, setActiveVersion] = useState<string>(resolveInstrumentConfig('BADS').defaultVersion);
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  const [scoringMode, setScoringMode] = useState<ScoringMode>('manual_estandar');
  const [navMode, setNavMode] = useState<NavMode>('blocks');
  const [activeBlockIdx, setActiveBlockIdx] = useState<number>(0);
  const [showOnlyPending, setShowOnlyPending] = useState<boolean>(false);
  const [responsesByItemId, setResponsesByItemId] = useState<Record<string, DigitalItemResponseInput>>({});
  const [bslGeneral01, setBslGeneral01] = useState<string>('');
  const [bslBehavioral11, setBslBehavioral11] = useState<Array<number | null>>(new Array(11).fill(null));
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Historial y trazabilidad de 3 niveles
  const [bundles, setBundles] = useState<PsychometricEvaluationBundle[]>([]);
  const [longitudinalSummary, setLongitudinalSummary] = useState<Record<string, LongitudinalInstrumentSummary>>({});
  const [historyFilterInst, setHistoryFilterInst] = useState<string>('ALL');
  const [inspectedBundle, setInspectedBundle] = useState<PsychometricEvaluationBundle | null>(null);

  const patients = StorageService.getPatients();
  const padron = StorageService.getPadron();

  const filteredPatients = useMemo(() => {
    const q = patientQuery.trim().toLowerCase();
    return patients.filter((p) => {
      if (!q) return true;
      const pd = padron.find((x) => x.seudonimo === p.seudonimo);
      const pseudoMatch = p.seudonimo.toLowerCase().includes(q);
      const expMatch = (pd?.expediente_fisico || '').toLowerCase().includes(q);
      const nameMatch =
        roleConfig.ve_identidad && !isAnonymousMode
          ? (pd?.nombre_completo || '').toLowerCase().includes(q)
          : false;
      return pseudoMatch || expMatch || nameMatch;
    });
  }, [patients, padron, patientQuery, roleConfig.ve_identidad, isAnonymousMode]);

  const activePatientPadron = padron.find((x) => x.seudonimo === selectedPseudonym);
  const activePatientClinico = patients.find((x) => x.seudonimo === selectedPseudonym);

  const refreshPatientHistory = () => {
    setBundles(StorageService.getPsychometricEvaluationBundles(selectedPseudonym));
    setLongitudinalSummary(StorageService.getLongitudinalPsychometricSummary(selectedPseudonym));
  };

  useEffect(() => {
    refreshPatientHistory();
    setInspectedBundle(null);
  }, [selectedPseudonym]);

  const activeConfig: ResolvedInstrumentConfig = useMemo(
    () => resolveInstrumentConfig(activeInstrumentId, activeVersion),
    [activeInstrumentId, activeVersion]
  );

  const optionalComplements: PsychometricOptionalComplements = useMemo(() => {
    if (activeInstrumentId !== 'BSL-23') return {};
    const parsedGen = bslGeneral01.trim() !== '' ? Number(bslGeneral01) : undefined;
    const hasAllBeh = bslBehavioral11.every((v) => v !== null && Number.isFinite(v));
    return {
      bslGeneral01: parsedGen !== undefined && Number.isFinite(parsedGen) ? parsedGen : undefined,
      bslBehavioral11: hasAllBeh ? bslBehavioral11 : undefined,
    };
  }, [activeInstrumentId, bslGeneral01, bslBehavioral11]);

  // Evaluación automática en tiempo real de las 5 capas psicométricas
  const liveScore: StructuredPsychometricScoreResult = useMemo(() => {
    return scorePsychometricEvaluation({
      instrumentId: activeConfig.id,
      instrumentVersion: activeConfig.version,
      responses: Object.values(responsesByItemId),
      optionalComplements,
      scoringMode,
    });
  }, [activeConfig, responsesByItemId, optionalComplements, scoringMode]);

  const startNewApplication = (instId: ActiveInstrumentId, overrideVersion?: string) => {
    const ver = overrideVersion || selectedVersions[instId] || resolveInstrumentConfig(instId).defaultVersion;
    setActiveInstrumentId(instId);
    setActiveVersion(ver);
    setEditingDraftId(null);
    setResponsesByItemId({});
    setBslGeneral01('');
    setBslBehavioral11(new Array(11).fill(null));
    setNotes('');
    setActiveBlockIdx(0);
    setShowOnlyPending(false);
    setStatusBanner(null);
    setSubView('apply');
  };

  const resumeDraftBundle = (bundle: PsychometricEvaluationBundle) => {
    const evalRec = bundle.evaluation;
    setActiveInstrumentId(evalRec.instrument_id);
    setActiveVersion(evalRec.instrument_version);
    setSelectedVersions((prev) => ({ ...prev, [evalRec.instrument_id]: evalRec.instrument_version }));
    setEditingDraftId(evalRec.evaluation_id);
    setScoringMode(evalRec.scoring_mode || 'manual_estandar');
    setSessionContext(evalRec.session_context || 'evaluacion_clinica');
    setNotes(evalRec.notes || '');

    const map: Record<string, DigitalItemResponseInput> = {};
    for (const r of bundle.responses) {
      if (r.numeric_code !== null && r.numeric_code !== undefined) {
        map[r.item_id] = {
          itemId: r.item_id,
          numericCode: r.numeric_code,
          selectedOptionLabel: r.selected_label,
          modifiedAt: r.modified_at,
        };
      }
    }
    setResponsesByItemId(map);
    if (evalRec.complements) {
      setBslGeneral01(
        evalRec.complements.bslGeneral01 !== null && evalRec.complements.bslGeneral01 !== undefined
          ? String(evalRec.complements.bslGeneral01)
          : ''
      );
      setBslBehavioral11(
        Array.isArray(evalRec.complements.bslBehavioral11) && evalRec.complements.bslBehavioral11.length === 11
          ? evalRec.complements.bslBehavioral11
          : new Array(11).fill(null)
      );
    }
    setActiveBlockIdx(0);
    setShowOnlyPending(false);
    setStatusBanner({
      type: 'ok',
      text: `Borrador ${evalRec.evaluation_id} cargado (${evalRec.instrument_id} · ${evalRec.instrument_version}).`,
    });
    setSubView('apply');
  };

  const handleSelectOption = (item: PsychometricItemSpec, val: number, label: string) => {
    setResponsesByItemId((prev) => ({
      ...prev,
      [item.itemId]: {
        itemId: item.itemId,
        numericCode: val,
        selectedOptionLabel: label,
        modifiedAt: new Date().toISOString(),
      },
    }));
  };

  const handleClearOption = (itemId: string) => {
    setResponsesByItemId((prev) => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
  };

  const jumpToItem = (displayNumber: number) => {
    setShowOnlyPending(false);
    const blockIdx = activeConfig.recommendedBlocks.findIndex(
      (b) => displayNumber >= b.start && displayNumber <= b.end
    );
    if (blockIdx >= 0) {
      setActiveBlockIdx(blockIdx);
    }
    setSubView('apply');
    setTimeout(() => {
      const el = document.getElementById(`psych-item-card-${displayNumber}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 60);
  };

  const persistEvaluation = async (targetStatus: 'draft' | 'completed') => {
    if (!roleConfig.escribe) {
      setStatusBanner({ type: 'err', text: 'Su rol actual no tiene permisos de escritura clínica.' });
      return;
    }
    setIsSaving(true);
    try {
      const savedLocal = StorageService.savePsychometricEvaluationLocal({
        evaluationId: editingDraftId || undefined,
        patientId: selectedPseudonym,
        instrumentId: activeConfig.id,
        instrumentVersion: activeConfig.version,
        evaluator: evaluatorName.trim() || currentUser.u,
        applicationStatus: targetStatus,
        captureMode: 'digital_form',
        scoringMode,
        sessionContext,
        sessionNumber: sessionNumber ? Number(sessionNumber) : null,
        responses: Object.values(responsesByItemId),
        optionalComplements,
        notes: notes.trim() || undefined,
      });

      // Intentar sincronización transparente con API SQLite local si está levantada y el paciente existe allí
      let syncedSqlite = false;
      try {
        const search = await PatientApiService.searchPatients(selectedPseudonym);
        const match = search.find((p) => p.pseudonym === selectedPseudonym || p.patient_id === selectedPseudonym);
        if (match) {
          await PatientApiService.savePsychometricEvaluation({
            evaluation_id: savedLocal.evaluation.evaluation_id,
            patient_id: match.patient_id,
            instrument_id: activeConfig.id,
            instrument_version: activeConfig.version,
            evaluator: evaluatorName.trim() || currentUser.u,
            application_status: targetStatus,
            capture_mode: 'digital_form',
            scoring_mode: scoringMode,
            session_context: sessionContext,
            session_number: sessionNumber ? Number(sessionNumber) : null,
            responses: Object.values(responsesByItemId),
            optional_complements: optionalComplements,
            notes: notes.trim() || undefined,
          });
          syncedSqlite = true;
        }
      } catch {
        syncedSqlite = false;
      }

      refreshPatientHistory();
      if (targetStatus === 'draft') {
        setEditingDraftId(savedLocal.evaluation.evaluation_id);
        setStatusBanner({
          type: 'ok',
          text: `Borrador guardado en almacenamiento de 3 niveles (${savedLocal.evaluation.evaluation_id})${
            syncedSqlite ? ' y sincronizado en SQLite.' : ' (almacenamiento local).'
          }`,
        });
      } else {
        setEditingDraftId(null);
        setInspectedBundle(savedLocal);
        setStatusBanner({
          type: 'ok',
          text: `Evaluación ${activeConfig.id} (${activeConfig.version}) completada, cerrada e incorporada al historial longitudinal y motores analíticos${
            syncedSqlite ? ' + SQLite' : ''
          }.`,
        });
        setSubView('history');
      }
    } catch (err: any) {
      setStatusBanner({ type: 'err', text: err.message || 'No fue posible guardar la evaluación.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRecalculateBundle = (evalId: string) => {
    const updated = StorageService.recalculatePsychometricEvaluationLocal(evalId, scoringMode);
    if (updated) {
      refreshPatientHistory();
      setInspectedBundle(updated);
      setStatusBanner({
        type: 'ok',
        text: `Resultados recalculados bajo algoritmo ${updated.latestResult?.algorithm_version}; respuestas originales preservadas íntegramente.`,
      });
    }
  };

  const currentBlock = activeConfig.recommendedBlocks[activeBlockIdx] || {
    id: 'all',
    title: 'Todos los reactivos',
    start: 1,
    end: activeConfig.itemCount,
  };

  const visibleItems: PsychometricItemSpec[] = useMemo(() => {
    let list = activeConfig.items;
    if (navMode === 'blocks') {
      list = list.filter((it) => it.displayNumber >= currentBlock.start && it.displayNumber <= currentBlock.end);
    }
    if (showOnlyPending) {
      list = list.filter((it) => !responsesByItemId[it.itemId]);
    }
    return list;
  }, [activeConfig.items, navMode, currentBlock, showOnlyPending, responsesByItemId]);

  const completedInstrumentsSet = useMemo(() => {
    const s = new Set<string>();
    for (const b of bundles) {
      if (b.evaluation.application_status === 'completed') {
        s.add(b.evaluation.instrument_id);
      }
    }
    return s;
  }, [bundles]);

  // ========================== RENDER PRINCIPAL ===============================
  return (
    <div className="space-y-4">
      {/* Cabecera Institucional */}
      <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-[var(--sep-claro)]">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-[var(--accion)]" />
            <h1 className="text-lg font-bold text-[var(--texto)]">
              Centro de Evaluación Psicométrica
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--accion)]/15 text-[var(--accion)] border border-[var(--accion)]/30">
              Catálogo {CATALOG_METADATA.catalogVersion} · 6 Instrumentos Activos
            </span>
          </div>
          <p className="text-xs text-[var(--texto-sec)] mt-0.5">
            Aplicación digital directa reactivo por reactivo con puntuación automática desacoplada, almacenamiento en 3 niveles e integración con motores longitudinales.
          </p>
        </div>

        {/* Pestañas principales del módulo */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSubView('catalog')}
            className={`px-3 py-1.5 text-xs rounded-[var(--r)] border cursor-pointer flex items-center gap-1.5 ${
              subView === 'catalog'
                ? 'bg-[var(--accion)] text-white border-[var(--accion)] font-semibold'
                : 'bg-[var(--panel)] text-[var(--texto-sec)] border-[var(--borde)] hover:bg-[var(--captura)]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Catálogo ({ACTIVE_INSTRUMENT_IDS.length})
          </button>
          <button
            onClick={() => setSubView('apply')}
            className={`px-3 py-1.5 text-xs rounded-[var(--r)] border cursor-pointer flex items-center gap-1.5 ${
              subView === 'apply' || subView === 'review'
                ? 'bg-[var(--accion)] text-white border-[var(--accion)] font-semibold'
                : 'bg-[var(--panel)] text-[var(--texto-sec)] border-[var(--borde)] hover:bg-[var(--captura)]'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            Aplicación Activa ({activeConfig.shortName})
          </button>
          <button
            onClick={() => setSubView('history')}
            className={`px-3 py-1.5 text-xs rounded-[var(--r)] border cursor-pointer flex items-center gap-1.5 ${
              subView === 'history'
                ? 'bg-[var(--accion)] text-white border-[var(--accion)] font-semibold'
                : 'bg-[var(--panel)] text-[var(--texto-sec)] border-[var(--borde)] hover:bg-[var(--captura)]'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Historial y Longitudinal ({bundles.length})
          </button>
          {onNavigate && (
            <button
              onClick={() => onNavigate('ecosistema', selectedPseudonym)}
              className="px-3 py-1.5 text-xs rounded-[var(--r)] border border-[var(--normal)]/40 bg-[var(--normal)]/10 text-[var(--normal)] hover:bg-[var(--normal)]/20 cursor-pointer flex items-center gap-1.5"
            >
              <BrainCircuit className="w-3.5 h-3.5" />
              Ecosistema 5 Motores
            </button>
          )}
        </div>
      </div>

      {/* Selector Clínico de Paciente y Sesión */}
      <div className="bg-[var(--panel)] border border-[var(--borde)] rounded-[var(--r)] p-3 grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
        <div className="md:col-span-4">
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-[var(--texto-tenue)] mb-1">
            Buscar y seleccionar paciente
          </label>
          <div className="flex gap-1.5">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-[var(--texto-tenue)] absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={patientQuery}
                onChange={(e) => setPatientQuery(e.target.value)}
                placeholder="Buscar por TUS-XXXX o expediente..."
                className="w-full pl-8 pr-2 py-1.5 text-xs bg-[var(--fondo)] border border-[var(--borde)] rounded-[var(--r)] text-[var(--texto)]"
              />
            </div>
            <select
              value={selectedPseudonym}
              onChange={(e) => onSelectPseudonym && onSelectPseudonym(e.target.value)}
              className="px-2 py-1.5 text-xs font-mono font-bold bg-[var(--fondo)] border border-[var(--borde)] rounded-[var(--r)] text-[var(--texto)]"
            >
              {filteredPatients.map((p) => {
                const pd = padron.find((x) => x.seudonimo === p.seudonimo);
                const label =
                  roleConfig.ve_identidad && !isAnonymousMode && pd?.nombre_completo
                    ? `${p.seudonimo} — ${pd.nombre_completo}`
                    : p.seudonimo;
                return (
                  <option key={p.seudonimo} value={p.seudonimo}>
                    {label}
                  </option>
                );
              })}
            </select>
          </div>
          <p className="text-[10px] text-[var(--texto-tenue)] mt-1">
            Estado actual: <span className="font-semibold text-[var(--texto-sec)]">{activePatientClinico?.estado || 'Activo'}</span>
            {roleConfig.ve_identidad && !isAnonymousMode && activePatientPadron?.nombre_completo
              ? ` · ${activePatientPadron.nombre_completo}`
              : ' · Modo seudonimizado'}
          </p>
        </div>

        <div className="md:col-span-3">
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-[var(--texto-tenue)] mb-1">
            Evaluador responsable
          </label>
          <input
            type="text"
            value={evaluatorName}
            onChange={(e) => setEvaluatorName(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs bg-[var(--fondo)] border border-[var(--borde)] rounded-[var(--r)] text-[var(--texto)]"
          />
        </div>

        <div className="md:col-span-3">
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-[var(--texto-tenue)] mb-1">
            Contexto y sesión
          </label>
          <div className="flex gap-1.5">
            <select
              value={sessionContext}
              onChange={(e) => setSessionContext(e.target.value)}
              className="flex-1 px-2 py-1.5 text-xs bg-[var(--fondo)] border border-[var(--borde)] rounded-[var(--r)] text-[var(--texto)]"
            >
              <option value="ingreso_basal">Ingreso / Evaluación Basal</option>
              <option value="evaluacion_clinica">Evaluación Clínica</option>
              <option value="seguimiento_longitudinal">Seguimiento Longitudinal</option>
              <option value="egreso_alta">Valoración de Egreso / Alta</option>
            </select>
            <input
              type="number"
              min={1}
              value={sessionNumber}
              onChange={(e) => setSessionNumber(e.target.value)}
              title="Número de sesión"
              className="w-16 px-2 py-1.5 text-xs bg-[var(--fondo)] border border-[var(--borde)] rounded-[var(--r)] text-[var(--texto)] font-mono"
            />
          </div>
        </div>

        <div className="md:col-span-2 flex flex-col items-end justify-center">
          <span className="text-[10px] uppercase tracking-wider text-[var(--texto-tenue)]">
            Batería completada
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-base font-bold font-mono text-[var(--normal)]">
              {completedInstrumentsSet.size} / 6
            </span>
            <span className="text-[10px] text-[var(--texto-tenue)]">instrumentos</span>
          </div>
        </div>
      </div>

      {/* Banner de retroalimentación */}
      {statusBanner && (
        <div
          className={`p-3 rounded-[var(--r)] border text-xs flex items-center justify-between gap-2 ${
            statusBanner.type === 'ok'
              ? 'bg-[var(--normal)]/10 border-[var(--normal)]/40 text-[var(--texto)]'
              : statusBanner.type === 'warn'
              ? 'bg-[var(--advertencia)]/10 border-[var(--advertencia)]/40 text-[var(--texto)]'
              : 'bg-[var(--riesgo)]/10 border-[var(--riesgo)]/40 text-[var(--riesgo)]'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusBanner.type === 'ok' ? (
              <CheckCircle2 className="w-4 h-4 text-[var(--normal)] shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            <span>{statusBanner.text}</span>
          </div>
          <button
            onClick={() => setStatusBanner(null)}
            className="text-[10px] underline opacity-80 hover:opacity-100 cursor-pointer"
          >
            Ocultar
          </button>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SUB-VISTA 1: CATÁLOGO DE INSTRUMENTOS ACTIVOS                         */}
      {/* ===================================================================== */}
      {subView === 'catalog' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {ACTIVE_INSTRUMENT_IDS.map((instId) => {
              const selVer = selectedVersions[instId];
              const spec = resolveInstrumentConfig(instId, selVer);
              const draftForInst = bundles.find(
                (b) => b.evaluation.instrument_id === instId && b.evaluation.application_status === 'draft'
              );
              const completedForInst = bundles.filter(
                (b) => b.evaluation.instrument_id === instId && b.evaluation.application_status === 'completed'
              );
              const latestCompleted = completedForInst[0] || null;
              const pendingTextCount = spec.items.filter((it) => it.pendingAuthorizedText).length;

              return (
                <div
                  key={instId}
                  className="bg-[var(--panel)] border border-[var(--borde)] rounded-[var(--r)] p-4 flex flex-col justify-between gap-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-sm font-bold text-[var(--texto)]">{spec.shortName}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--captura)] border border-[var(--borde)] text-[var(--texto-sec)]">
                            {spec.itemCount} reactivos
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--fondo)] border border-[var(--borde)] text-[var(--texto-tenue)]">
                            {spec.language.toUpperCase()}
                          </span>
                        </div>
                        <h3 className="text-xs font-medium text-[var(--texto-sec)] mt-0.5">
                          {spec.name}
                        </h3>
                      </div>

                      {completedForInst.length > 0 ? (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[var(--normal)]/15 text-[var(--normal)] border border-[var(--normal)]/30 shrink-0">
                          {completedForInst.length} aplicada(s)
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--fondo)] text-[var(--texto-tenue)] border border-[var(--borde)] shrink-0">
                          Sin registro
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-[var(--texto-sec)] leading-relaxed">
                      {spec.description}
                    </p>

                    <div className="p-2 rounded bg-[var(--fondo)] border border-[var(--sep-claro)] text-[10.5px] space-y-1">
                      <div>
                        <span className="font-semibold text-[var(--texto-tenue)]">Periodo de referencia: </span>
                        <span className="text-[var(--texto)]">{spec.referencePeriod}</span>
                      </div>
                      {spec.supportedVersions.length > 1 ? (
                        <div>
                          <label className="block font-semibold text-[var(--texto-tenue)] mb-0.5">
                            Versión activa a aplicar:
                          </label>
                          <select
                            value={selVer}
                            onChange={(e) =>
                              setSelectedVersions((prev) => ({ ...prev, [instId]: e.target.value }))
                            }
                            className="w-full px-2 py-1 text-[11px] bg-[var(--panel)] border border-[var(--borde)] rounded text-[var(--texto)]"
                          >
                            {spec.supportedVersions.map((v) => (
                              <option key={v.version} value={v.version}>
                                {v.label} ({v.version})
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <div>
                          <span className="font-semibold text-[var(--texto-tenue)]">Versión: </span>
                          <span className="font-mono text-[var(--texto)]">{spec.version}</span>
                        </div>
                      )}
                    </div>

                    {pendingTextCount > 0 && (
                      <div className="p-2 rounded bg-[var(--advertencia)]/10 border border-[var(--advertencia)]/30 text-[10px] text-[var(--advertencia)] flex items-start gap-1.5">
                        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>
                          Incluye 49 reactivos literales TEA autorizados y {pendingTextCount} posiciones técnicas (50–57) pendientes de texto autorizado PAR.
                        </span>
                      </div>
                    )}

                    {latestCompleted && (
                      <div className="p-2 rounded bg-[var(--normal)]/5 border border-[var(--normal)]/25 text-[10.5px]">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[var(--normal)]">Última completada:</span>
                          <span className="font-mono text-[var(--texto-tenue)]">
                            {(latestCompleted.evaluation.completed_at || latestCompleted.evaluation.started_at).slice(0, 10)}
                          </span>
                        </div>
                        <div className="text-[var(--texto-sec)] mt-0.5">
                          {latestCompleted.latestResult?.interpretation.level}
                          {latestCompleted.latestResult?.total_score !== null &&
                            latestCompleted.latestResult?.total_score !== undefined &&
                            ` · Total: ${latestCompleted.latestResult.total_score}`}
                        </div>
                      </div>
                    )}

                    {draftForInst && (
                      <div className="p-2 rounded bg-[var(--accion)]/10 border border-[var(--accion)]/30 text-[10.5px] flex items-center justify-between gap-2">
                        <span className="text-[var(--texto)]">
                          Borrador pendiente ({draftForInst.responses.filter((r) => r.numeric_code !== null).length}/
                          {draftForInst.responses.length} reactivos)
                        </span>
                        <button
                          onClick={() => resumeDraftBundle(draftForInst)}
                          className="px-2 py-0.5 rounded bg-[var(--accion)] text-white text-[10px] font-semibold cursor-pointer"
                        >
                          Retomar
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2 border-t border-[var(--sep-claro)]">
                    <button
                      onClick={() => startNewApplication(instId, selVer)}
                      className="flex-1 px-3 py-2 rounded-[var(--r)] bg-[var(--accion)] text-white text-xs font-semibold hover:opacity-95 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5" />
                      Iniciar aplicación
                    </button>
                    {completedForInst.length > 0 && (
                      <button
                        onClick={() => {
                          setHistoryFilterInst(instId);
                          setInspectedBundle(completedForInst[0]);
                          setSubView('history');
                        }}
                        className="px-3 py-2 rounded-[var(--r)] bg-[var(--captura)] border border-[var(--borde)] text-xs text-[var(--texto)] hover:bg-[var(--fondo)] cursor-pointer flex items-center gap-1"
                      >
                        <History className="w-3.5 h-3.5" />
                        Ver ({completedForInst.length})
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Nota de Exclusión OCI-R y Fuentes */}
          <div className="p-3 bg-[var(--panel)] border border-[var(--borde)] rounded-[var(--r)] text-xs flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-[var(--texto-sec)]">
              <ShieldCheck className="w-4 h-4 text-[var(--normal)] shrink-0" />
              <span>
                <strong>Control de catálogo:</strong>{' '}
                {CATALOG_METADATA.excludedInstruments.map((ex) => `${ex.id} (${ex.reason})`).join(' · ')}
              </span>
            </div>
            <span className="text-[10px] font-mono text-[var(--texto-tenue)]">
              Algoritmo vigente: {CATALOG_METADATA.algorithmVersion}
            </span>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SUB-VISTA 2: FORMULARIO DIGITAL DE APLICACIÓN                         */}
      {/* ===================================================================== */}
      {subView === 'apply' && (
        <div className="space-y-4">
          {/* Encabezado del instrumento e instrucciones */}
          <div className="bg-[var(--panel)] border border-[var(--borde)] rounded-[var(--r)] p-4 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setSubView('catalog')}
                    className="p-1.5 rounded border border-[var(--borde)] bg-[var(--fondo)] hover:bg-[var(--captura)] cursor-pointer"
                    title="Volver al catálogo"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                  <h2 className="text-base font-bold text-[var(--texto)]">{activeConfig.name}</h2>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--captura)] border border-[var(--borde)] text-[var(--texto-sec)]">
                    {activeConfig.version}
                  </span>
                  {editingDraftId && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--advertencia)]/15 text-[var(--advertencia)] border border-[var(--advertencia)]/30">
                      Editando borrador {editingDraftId}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[var(--texto-sec)] mt-1">{activeConfig.description}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="px-2.5 py-1 rounded bg-[var(--fondo)] border border-[var(--borde)] text-[11px]">
                  <span className="text-[var(--texto-tenue)] font-semibold">Periodo: </span>
                  <span className="text-[var(--texto)]">{activeConfig.referencePeriod}</span>
                </div>
                {(activeConfig.id === 'BIS-11' || activeConfig.id === 'EROS') && (
                  <select
                    value={scoringMode}
                    onChange={(e) => setScoringMode(e.target.value as ScoringMode)}
                    className="px-2 py-1 rounded bg-[var(--fondo)] border border-[var(--borde)] text-[11px] text-[var(--texto)]"
                    title="Regla de puntuación para BIS-11 / EROS"
                  >
                    <option value="manual_estandar">Puntuación manual oficial (con inversión)</option>
                    <option value="excel_canonico">Compatibilidad canónica Excel (Autoencoder N=166)</option>
                  </select>
                )}
              </div>
            </div>

            {/* Instrucciones originales */}
            <div className="p-3 rounded-[var(--r)] bg-[var(--accion)]/8 border border-[var(--accion)]/25 space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--accion)]">
                <Info className="w-3.5 h-3.5" />
                Instrucciones de aplicación
                {activeConfig.instructionsSourceStatus !== 'verbatim_authorized' && (
                  <span className="font-normal normal-case text-[var(--texto-tenue)]">
                    (encuadre neutro · reactivos y opciones literales verificados)
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--texto)] leading-relaxed">{activeConfig.instructions}</p>
              {activeConfig.instructionsNote && (
                <p className="text-[10px] text-[var(--texto-tenue)]">{activeConfig.instructionsNote}</p>
              )}
            </div>
          </div>

          {/* Barra fija de progreso y controles de navegación */}
          <div className="sticky top-0 z-20 bg-[var(--panel)]/95 backdrop-blur border border-[var(--borde)] rounded-[var(--r)] p-3 shadow-sm space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-4 text-xs">
                <div>
                  <span className="text-[var(--texto-tenue)]">Contestados: </span>
                  <span className="font-mono font-bold text-[var(--normal)]">
                    {liveScore.derivedIndicators.completeness.answeredItems}
                  </span>
                  <span className="text-[var(--texto-tenue)]"> / {activeConfig.itemCount}</span>
                </div>
                <div>
                  <span className="text-[var(--texto-tenue)]">Pendientes requeridos: </span>
                  <span
                    className={`font-mono font-bold ${
                      liveScore.derivedIndicators.completeness.missingAuthorizedItems > 0
                        ? 'text-[var(--advertencia)]'
                        : 'text-[var(--normal)]'
                    }`}
                  >
                    {liveScore.derivedIndicators.completeness.missingAuthorizedItems}
                  </span>
                </div>
                <span className="font-mono text-xs font-bold text-[var(--accion)]">
                  {liveScore.derivedIndicators.completeness.authorizedCompletionPct.toFixed(0)}%
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => setNavMode(navMode === 'blocks' ? 'single_page' : 'blocks')}
                  className="px-2.5 py-1 rounded text-[11px] bg-[var(--fondo)] border border-[var(--borde)] hover:bg-[var(--captura)] cursor-pointer"
                >
                  {navMode === 'blocks' ? 'Ver todos en 1 página' : 'Navegar por bloques'}
                </button>
                <button
                  onClick={() => setShowOnlyPending((v) => !v)}
                  className={`px-2.5 py-1 rounded text-[11px] border cursor-pointer flex items-center gap-1 ${
                    showOnlyPending
                      ? 'bg-[var(--advertencia)]/20 border-[var(--advertencia)] text-[var(--advertencia)] font-semibold'
                      : 'bg-[var(--fondo)] border-[var(--borde)] text-[var(--texto-sec)]'
                  }`}
                >
                  <Filter className="w-3 h-3" />
                  {showOnlyPending ? 'Mostrando pendientes' : 'Filtrar pendientes'}
                </button>
                {liveScore.derivedIndicators.completeness.missingDisplayNumbers.length > 0 && (
                  <button
                    onClick={() => jumpToItem(liveScore.derivedIndicators.completeness.missingDisplayNumbers[0])}
                    className="px-2.5 py-1 rounded text-[11px] bg-[var(--accion)]/15 border border-[var(--accion)]/40 text-[var(--accion)] font-semibold cursor-pointer"
                  >
                    Ir al siguiente pendiente (#
                    {liveScore.derivedIndicators.completeness.missingDisplayNumbers[0]})
                  </button>
                )}
              </div>
            </div>

            {/* Barra visual de progreso */}
            <div className="w-full h-2 bg-[var(--fondo)] rounded-full overflow-hidden border border-[var(--sep-claro)]">
              <div
                className="h-full bg-[var(--accion)] transition-all duration-200"
                style={{
                  width: `${Math.min(100, liveScore.derivedIndicators.completeness.authorizedCompletionPct)}%`,
                }}
              />
            </div>

            {/* Navegador de bloques y mapa rápido por número */}
            {navMode === 'blocks' && activeConfig.recommendedBlocks.length > 1 && (
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex flex-wrap gap-1">
                  {activeConfig.recommendedBlocks.map((b, idx) => {
                    const blockItems = activeConfig.items.filter(
                      (it) => it.displayNumber >= b.start && it.displayNumber <= b.end
                    );
                    const done = blockItems.filter((it) => Boolean(responsesByItemId[it.itemId])).length;
                    return (
                      <button
                        key={b.id}
                        onClick={() => setActiveBlockIdx(idx)}
                        className={`px-2.5 py-1 rounded text-[11px] border cursor-pointer ${
                          activeBlockIdx === idx
                            ? 'bg-[var(--accion)] text-white border-[var(--accion)] font-semibold'
                            : 'bg-[var(--fondo)] text-[var(--texto-sec)] border-[var(--borde)] hover:bg-[var(--captura)]'
                        }`}
                      >
                        {b.title} ({done}/{blockItems.length})
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Mapa compacto de reactivos 1..N */}
            <div className="flex flex-wrap gap-1 pt-1">
              {activeConfig.items.map((it) => {
                const answered = Boolean(responsesByItemId[it.itemId]);
                const inBlock =
                  navMode === 'single_page' ||
                  (it.displayNumber >= currentBlock.start && it.displayNumber <= currentBlock.end);
                return (
                  <button
                    key={it.itemId}
                    onClick={() => jumpToItem(it.displayNumber)}
                    title={`Reactivo ${it.displayNumber} (${it.canonicalCode})${
                      it.pendingAuthorizedText ? ' · Texto pendiente autorizado' : ''
                    }`}
                    className={`w-6 h-6 text-[10px] font-mono rounded border cursor-pointer transition-colors ${
                      answered
                        ? 'bg-[var(--normal)]/20 border-[var(--normal)] text-[var(--normal)] font-bold'
                        : it.pendingAuthorizedText
                        ? 'bg-[var(--fondo)] border-dashed border-[var(--texto-tenue)] text-[var(--texto-tenue)]'
                        : inBlock
                        ? 'bg-[var(--advertencia)]/15 border-[var(--advertencia)]/50 text-[var(--advertencia)]'
                        : 'bg-[var(--fondo)] border-[var(--borde)] text-[var(--texto-tenue)]'
                    }`}
                  >
                    {it.displayNumber}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Listado de Reactivos */}
          <div className="space-y-3">
            {visibleItems.length === 0 ? (
              <div className="p-6 text-center bg-[var(--panel)] border border-[var(--borde)] rounded-[var(--r)] text-xs text-[var(--texto-sec)]">
                Todos los reactivos visibles en este filtro ya cuentan con respuesta.
              </div>
            ) : (
              visibleItems.map((item, idx) => {
                const prevSection = idx > 0 ? visibleItems[idx - 1].section : null;
                const showSectionHeader = item.section !== prevSection;
                const options = getOptionsForItem(activeConfig, item);
                const selectedVal = responsesByItemId[item.itemId]?.numericCode ?? null;
                const sectionInstr = activeConfig.instructionsBySection?.[item.section];

                return (
                  <React.Fragment key={item.itemId}>
                    {showSectionHeader && (
                      <div className="p-3 bg-[var(--captura)] border border-[var(--borde)] rounded-[var(--r)]">
                        <div className="text-xs font-bold text-[var(--texto)]">{item.section}</div>
                        {sectionInstr && (
                          <p className="text-[11px] text-[var(--texto-sec)] mt-0.5">{sectionInstr}</p>
                        )}
                      </div>
                    )}

                    <div
                      id={`psych-item-card-${item.displayNumber}`}
                      className={`bg-[var(--panel)] border rounded-[var(--r)] p-4 transition-colors ${
                        selectedVal !== null
                          ? 'border-[var(--normal)]/40'
                          : item.pendingAuthorizedText
                          ? 'border-dashed border-[var(--borde)]'
                          : 'border-[var(--borde)]'
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                        <div className="space-y-1 flex-1 min-w-[240px]">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 rounded bg-[var(--captura)] text-[11px] font-mono font-bold text-[var(--texto)]">
                              #{item.displayNumber}
                            </span>
                            <span className="text-[10px] font-mono text-[var(--texto-tenue)]">
                              {item.canonicalCode}
                            </span>
                            {item.reverse && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--fondo)] border border-[var(--borde)] text-[var(--texto-tenue)]">
                                Inversión automática
                              </span>
                            )}
                            {item.clinicalAlertFlag && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--riesgo)]/10 border border-[var(--riesgo)]/30 text-[var(--riesgo)]">
                                Reactivo de seguimiento de riesgo
                              </span>
                            )}
                            {item.pendingAuthorizedText && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--advertencia)]/15 border border-[var(--advertencia)]/40 text-[var(--advertencia)]">
                                Texto literal pendiente de fuente PAR
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-medium text-[var(--texto)] leading-snug pt-0.5">
                            {item.text}
                          </p>
                          {item.pendingNotice && (
                            <p className="text-[10.5px] text-[var(--texto-tenue)]">{item.pendingNotice}</p>
                          )}
                        </div>

                        {selectedVal !== null && (
                          <button
                            onClick={() => handleClearOption(item.itemId)}
                            className="text-[10px] text-[var(--texto-tenue)] hover:text-[var(--riesgo)] underline cursor-pointer shrink-0"
                          >
                            Limpiar respuesta
                          </button>
                        )}
                      </div>

                      {/* Botones seleccionables táctiles (Desktop & Tablet) */}
                      <div
                        className={`grid gap-2 ${
                          options.length <= 4
                            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
                            : 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-7'
                        }`}
                      >
                        {options.map((opt) => {
                          const isChosen = selectedVal === opt.value;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => handleSelectOption(item, opt.value, opt.label)}
                              className={`min-h-[46px] px-3 py-2 rounded-[var(--r)] border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                                isChosen
                                  ? 'bg-[var(--accion)] text-white border-[var(--accion)] font-semibold shadow-sm'
                                  : 'bg-[var(--fondo)] text-[var(--texto)] border-[var(--borde)] hover:bg-[var(--captura)]'
                              }`}
                            >
                              <span className="text-xs leading-tight">{opt.label}</span>
                              <span
                                className={`text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0 ${
                                  isChosen
                                    ? 'bg-white/20 text-white'
                                    : 'bg-[var(--panel)] text-[var(--texto-tenue)] border border-[var(--sep-claro)]'
                                }`}
                              >
                                {opt.value}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </React.Fragment>
                );
              })
            )}
          </div>

          {/* Complementos opcionales de BSL-23 para compatibilidad Autoencoder */}
          {activeConfig.id === 'BSL-23' && (
            <div className="bg-[var(--panel)] border border-[var(--borde)] rounded-[var(--r)] p-4 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-xs font-bold text-[var(--texto)]">
                    Complementos opcionales de BSL-23 para vector canónico 24v (Autoencoder)
                  </h3>
                  <p className="text-[11px] text-[var(--texto-sec)]">
                    La escala central consta de los 23 reactivos anteriores. Capture opcionalmente el estado global (0–1) y el suplemento conductual (11 reactivos) si desea paridad exacta con el vector transversal.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--texto-sec)] mb-1">
                    Valoración Global del Estado (0.00 = hundido a 1.00 = excelente)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={1}
                    step={0.05}
                    value={bslGeneral01}
                    onChange={(e) => setBslGeneral01(e.target.value)}
                    placeholder="Opcional (ej. 0.55)"
                    className="w-full px-2.5 py-1.5 text-xs bg-[var(--fondo)] border border-[var(--borde)] rounded-[var(--r)] font-mono"
                  />
                </div>

                <div className="md:col-span-2">
                  <div className="text-[11px] font-semibold text-[var(--texto-sec)] mb-1">
                    Suplemento Conductual (11 ítems · 0=Nada a 4=Diariamente o más a menudo · enunciados pendientes de cuadernillo autorizado)
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
                    {bslBehavioral11.map((val, i) => (
                      <div key={i} className="space-y-0.5">
                        <span className="block text-[10px] font-mono text-[var(--texto-tenue)]">
                          Cond #{i + 1}
                        </span>
                        <select
                          value={val === null ? '' : String(val)}
                          onChange={(e) => {
                            const next = [...bslBehavioral11];
                            next[i] = e.target.value === '' ? null : Number(e.target.value);
                            setBslBehavioral11(next);
                          }}
                          className="w-full px-1.5 py-1 text-xs bg-[var(--fondo)] border border-[var(--borde)] rounded font-mono"
                        >
                          <option value="">—</option>
                          <option value="0">0 (Nada)</option>
                          <option value="1">1 (Una vez)</option>
                          <option value="2">2 (2-3 v.)</option>
                          <option value="3">3 (4-6 v.)</option>
                          <option value="4">4 (Diario+)</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notas clínicas de la sesión y barra inferior */}
          <div className="bg-[var(--panel)] border border-[var(--borde)] rounded-[var(--r)] p-4 space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-[var(--texto-sec)] mb-1">
                Observaciones clínicas de la aplicación (opcional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Condiciones de aplicación, comprensión de reactivos, aclaraciones relevantes..."
                className="w-full px-2.5 py-1.5 text-xs bg-[var(--fondo)] border border-[var(--borde)] rounded-[var(--r)] text-[var(--texto)]"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[var(--sep-claro)]">
              <div className="flex items-center gap-2">
                {navMode === 'blocks' && activeConfig.recommendedBlocks.length > 1 && (
                  <>
                    <button
                      disabled={activeBlockIdx === 0}
                      onClick={() => setActiveBlockIdx((i) => Math.max(0, i - 1))}
                      className="px-3 py-2 rounded-[var(--r)] bg-[var(--fondo)] border border-[var(--borde)] text-xs disabled:opacity-40 cursor-pointer flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Bloque anterior
                    </button>
                    <button
                      disabled={activeBlockIdx >= activeConfig.recommendedBlocks.length - 1}
                      onClick={() =>
                        setActiveBlockIdx((i) => Math.min(activeConfig.recommendedBlocks.length - 1, i + 1))
                      }
                      className="px-3 py-2 rounded-[var(--r)] bg-[var(--fondo)] border border-[var(--borde)] text-xs disabled:opacity-40 cursor-pointer flex items-center gap-1"
                    >
                      Siguiente bloque
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  disabled={isSaving}
                  onClick={() => persistEvaluation('draft')}
                  className="px-3.5 py-2 rounded-[var(--r)] bg-[var(--captura)] border border-[var(--borde)] text-xs font-semibold text-[var(--texto)] hover:bg-[var(--fondo)] cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  Guardar como borrador
                </button>
                <button
                  onClick={() => setSubView('review')}
                  className="px-4 py-2 rounded-[var(--r)] bg-[var(--accion)] text-white text-xs font-semibold hover:opacity-95 cursor-pointer flex items-center gap-1.5"
                >
                  <FileCheck2 className="w-3.5 h-3.5" />
                  Revisar respuestas antes de finalizar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SUB-VISTA 3: REVISIÓN FINAL Y SEPARACIÓN EN 5 CAPAS ANTES DE CERRAR   */}
      {/* ===================================================================== */}
      {subView === 'review' && (
        <div className="space-y-4">
          <div className="bg-[var(--panel)] border border-[var(--borde)] rounded-[var(--r)] p-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[var(--texto)]">
                Revisión Final Pre-Envío — {activeConfig.shortName} ({activeConfig.version})
              </h2>
              <p className="text-xs text-[var(--texto-sec)]">
                Paciente: <span className="font-mono font-bold">{selectedPseudonym}</span> · Evaluador: {evaluatorName} · Contestados:{' '}
                <strong>
                  {liveScore.derivedIndicators.completeness.answeredItems}/{activeConfig.itemCount}
                </strong>
              </p>
            </div>
            <button
              onClick={() => setSubView('apply')}
              className="px-3 py-1.5 rounded-[var(--r)] bg-[var(--captura)] border border-[var(--borde)] text-xs cursor-pointer flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Regresar al formulario
            </button>
          </div>

          {!liveScore.derivedIndicators.completeness.isValidForScoring && (
            <div className="p-4 bg-[var(--advertencia)]/10 border border-[var(--advertencia)]/40 rounded-[var(--r)] space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[var(--advertencia)]">
                <AlertTriangle className="w-4 h-4" />
                Hay reactivos requeridos pendientes de responder
              </div>
              <p className="text-xs text-[var(--texto-sec)]">
                {liveScore.derivedIndicators.completeness.warnings.join(' ')}
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {liveScore.derivedIndicators.completeness.missingDisplayNumbers.map((dn) => (
                  <button
                    key={dn}
                    onClick={() => jumpToItem(dn)}
                    className="px-2 py-1 rounded bg-[var(--panel)] border border-[var(--advertencia)]/50 text-[11px] font-mono text-[var(--advertencia)] cursor-pointer hover:bg-[var(--advertencia)]/15"
                  >
                    Ir al reactivo #{dn}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Separación estricta de resultados psicométricos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Puntuaciones calculadas e indicadores */}
            <div className="bg-[var(--panel)] border border-[var(--borde)] rounded-[var(--r)] p-4 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--texto-tenue)]">
                3. Puntuaciones Calculadas y 4. Indicadores Derivados
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded bg-[var(--fondo)] border border-[var(--sep-claro)]">
                  <div className="text-[10px] text-[var(--texto-tenue)]">Puntuación Total Principal</div>
                  <div className="text-lg font-bold font-mono text-[var(--texto)]">
                    {liveScore.calculatedScores.totalScore !== null
                      ? liveScore.calculatedScores.totalScore
                      : 'Perfil multidimensional'}
                  </div>
                </div>
                <div className="p-2.5 rounded bg-[var(--fondo)] border border-[var(--sep-claro)]">
                  <div className="text-[10px] text-[var(--texto-tenue)]">Media / Total Técnico</div>
                  <div className="text-lg font-bold font-mono text-[var(--texto)]">
                    {liveScore.calculatedScores.meanScore !== null ? liveScore.calculatedScores.meanScore : '—'}
                    {liveScore.calculatedScores.technicalReferenceTotal !== null &&
                      ` (Ref: ${liveScore.calculatedScores.technicalReferenceTotal})`}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                {liveScore.calculatedScores.subscales.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded bg-[var(--fondo)] border border-[var(--sep-claro)]"
                  >
                    <span className="text-[var(--texto-sec)]">{sub.name}</span>
                    <span className="font-mono font-bold text-[var(--texto)]">
                      {sub.score !== null ? sub.score : 'Pendiente'}{' '}
                      <span className="text-[10px] font-normal text-[var(--texto-tenue)]">
                        [{sub.range[0]}–{sub.range[1]}]
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Interpretación descriptiva (no diagnóstica) */}
            <div className="bg-[var(--panel)] border border-[var(--borde)] rounded-[var(--r)] p-4 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--texto-tenue)]">
                5. Interpretación Descriptiva y Preparación Analítica
              </h3>
              <div className="p-3 rounded bg-[var(--accion)]/10 border border-[var(--accion)]/30 space-y-1">
                <div className="text-xs font-bold text-[var(--texto)]">{liveScore.interpretations.level}</div>
                <p className="text-xs text-[var(--texto-sec)]">{liveScore.interpretations.summary}</p>
                {liveScore.interpretations.descriptiveNotes.map((n, i) => (
                  <p key={i} className="text-[11px] text-[var(--texto-sec)] pt-1">
                    {n}
                  </p>
                ))}
              </div>

              <div className="p-2.5 rounded bg-[var(--fondo)] border border-[var(--sep-claro)] text-[11px] space-y-1">
                <div className="font-semibold text-[var(--texto)]">Integración Autoencoder 24v / Motores:</div>
                <p className="text-[var(--texto-sec)]">{liveScore.derivedIndicators.autoencoderReadiness.modeNote}</p>
              </div>

              <div className="p-2.5 rounded bg-[var(--advertencia)]/10 border border-[var(--advertencia)]/30 text-[10.5px] text-[var(--texto-sec)] flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-[var(--advertencia)] shrink-0 mt-0.5" />
                <span>{liveScore.interpretations.nonDiagnosticNotice}</span>
              </div>
            </div>
          </div>

          {/* Tabla compacta de respuestas originales vs recodificadas */}
          <div className="bg-[var(--panel)] border border-[var(--borde)] rounded-[var(--r)] p-4 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--texto-tenue)]">
              1. Respuestas Originales y 2. Valores Recodificados (clic en # para corregir)
            </h3>
            <div className="max-h-72 overflow-y-auto border border-[var(--sep-claro)] rounded">
              <table className="w-full text-xs text-left">
                <thead className="bg-[var(--fondo)] text-[10px] uppercase text-[var(--texto-tenue)] sticky top-0">
                  <tr>
                    <th className="px-2.5 py-1.5">#</th>
                    <th className="px-2.5 py-1.5">Reactivo</th>
                    <th className="px-2.5 py-1.5">Opción seleccionada</th>
                    <th className="px-2.5 py-1.5">Código original</th>
                    <th className="px-2.5 py-1.5">Recodificado</th>
                    <th className="px-2.5 py-1.5">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--sep-claro)]">
                  {liveScore.rawResponses.map((rawRow, i) => {
                    const rec = liveScore.recodedResponses[i];
                    return (
                      <tr key={rawRow.itemId} className={rawRow.isMissing ? 'bg-[var(--advertencia)]/5' : ''}>
                        <td className="px-2.5 py-1.5 font-mono">{rawRow.displayNumber}</td>
                        <td className="px-2.5 py-1.5 max-w-md truncate">{activeConfig.items[i].text}</td>
                        <td className="px-2.5 py-1.5">
                          {rawRow.selectedOptionLabel || (
                            <span className="text-[var(--advertencia)] font-semibold">Sin responder</span>
                          )}
                        </td>
                        <td className="px-2.5 py-1.5 font-mono">{rawRow.numericCode ?? '—'}</td>
                        <td className="px-2.5 py-1.5 font-mono">
                          {rec.recodedValue ?? '—'}
                          {rec.wasInverted && (
                            <span className="ml-1 text-[9.5px] text-[var(--accion)]">(inv {rec.inversionFormulaApplied})</span>
                          )}
                        </td>
                        <td className="px-2.5 py-1.5">
                          <button
                            onClick={() => jumpToItem(rawRow.displayNumber)}
                            className="text-[11px] text-[var(--accion)] underline cursor-pointer"
                          >
                            Corregir
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Botones de cierre final */}
          <div className="flex flex-wrap items-center justify-end gap-3">
            <button
              disabled={isSaving}
              onClick={() => persistEvaluation('draft')}
              className="px-4 py-2.5 rounded-[var(--r)] bg-[var(--captura)] border border-[var(--borde)] text-xs font-semibold cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              Guardar como borrador
            </button>
            <button
              disabled={isSaving || !liveScore.derivedIndicators.completeness.isValidForScoring}
              onClick={() => persistEvaluation('completed')}
              className="px-5 py-2.5 rounded-[var(--r)] bg-[var(--normal)] text-white text-xs font-bold disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              Completar y cerrar evaluación (Inmutable)
            </button>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SUB-VISTA 4: HISTORIAL, LONGITUDINAL CON CONTROL DE VERSIONES Y MOTOR */}
      {/* ===================================================================== */}
      {subView === 'history' && (
        <div className="space-y-4">
          {/* Filtro por instrumento */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-[var(--panel)] border border-[var(--borde)] rounded-[var(--r)] p-3">
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setHistoryFilterInst('ALL')}
                className={`px-2.5 py-1 rounded text-xs border cursor-pointer ${
                  historyFilterInst === 'ALL'
                    ? 'bg-[var(--accion)] text-white border-[var(--accion)] font-semibold'
                    : 'bg-[var(--fondo)] text-[var(--texto-sec)] border-[var(--borde)]'
                }`}
              >
                Todos ({bundles.length})
              </button>
              {ACTIVE_INSTRUMENT_IDS.map((id) => {
                const cnt = bundles.filter((b) => b.evaluation.instrument_id === id).length;
                return (
                  <button
                    key={id}
                    onClick={() => setHistoryFilterInst(id)}
                    className={`px-2.5 py-1 rounded text-xs border cursor-pointer ${
                      historyFilterInst === id
                        ? 'bg-[var(--accion)] text-white border-[var(--accion)] font-semibold'
                        : 'bg-[var(--fondo)] text-[var(--texto-sec)] border-[var(--borde)]'
                    }`}
                  >
                    {id} ({cnt})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Alertas y trayectorias longitudinales por instrumento */}
          {Object.values(longitudinalSummary)
            .filter((s) => historyFilterInst === 'ALL' || s.instrument_id === historyFilterInst)
            .filter((s) => s.completed_count > 0)
            .map((summary) => (
              <div
                key={summary.instrument_id}
                className="bg-[var(--panel)] border border-[var(--borde)] rounded-[var(--r)] p-4 space-y-2.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[var(--accion)]" />
                    <h3 className="text-xs font-bold text-[var(--texto)]">
                      Trayectoria Longitudinal — {summary.instrument_id}
                    </h3>
                    <span className="text-[10px] font-mono text-[var(--texto-tenue)]">
                      {summary.completed_count} mediciones cerradas · Versiones: {summary.versionsObserved.join(', ')}
                    </span>
                  </div>
                </div>

                {summary.versionMismatchWarning && summary.versionWarningMessage && (
                  <div className="p-2.5 rounded bg-[var(--advertencia)]/10 border border-[var(--advertencia)]/40 text-xs text-[var(--advertencia)] flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{summary.versionWarningMessage}</span>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[var(--fondo)] text-[10px] uppercase text-[var(--texto-tenue)]">
                      <tr>
                        <th className="px-2.5 py-1.5">Fecha</th>
                        <th className="px-2.5 py-1.5">Versión</th>
                        <th className="px-2.5 py-1.5">Evaluador</th>
                        <th className="px-2.5 py-1.5">Puntaje Principal</th>
                        <th className="px-2.5 py-1.5">Media / Ref. Técnico</th>
                        <th className="px-2.5 py-1.5">Cambio vs. anterior</th>
                        <th className="px-2.5 py-1.5">Detalle</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--sep-claro)]">
                      {summary.timeline.map((pt) => {
                        const matchBundle = bundles.find((b) => b.evaluation.evaluation_id === pt.evaluation_id);
                        return (
                          <tr key={pt.evaluation_id}>
                            <td className="px-2.5 py-1.5 font-mono">{pt.date}</td>
                            <td className="px-2.5 py-1.5 font-mono text-[11px]">{pt.version}</td>
                            <td className="px-2.5 py-1.5">{pt.evaluator}</td>
                            <td className="px-2.5 py-1.5 font-mono font-bold">
                              {pt.total_score !== null ? pt.total_score : 'Perfil'}
                            </td>
                            <td className="px-2.5 py-1.5 font-mono">
                              {pt.mean_score ?? '—'}
                              {pt.technical_total_score !== null ? ` (Ref: ${pt.technical_total_score})` : ''}
                            </td>
                            <td className="px-2.5 py-1.5 font-mono">
                              {pt.delta_from_previous === null
                                ? 'Basal'
                                : pt.delta_from_previous > 0
                                ? `+${pt.delta_from_previous}`
                                : String(pt.delta_from_previous)}
                            </td>
                            <td className="px-2.5 py-1.5">
                              {matchBundle && (
                                <button
                                  onClick={() => setInspectedBundle(matchBundle)}
                                  className="text-[11px] text-[var(--accion)] underline cursor-pointer flex items-center gap-1"
                                >
                                  <Eye className="w-3 h-3" />
                                  Inspeccionar
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}

          {/* Lista de evaluaciones (incluye borradores) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-5 bg-[var(--panel)] border border-[var(--borde)] rounded-[var(--r)] p-3 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--texto-tenue)]">
                Evaluaciones Registradas (3 Niveles)
              </h3>
              {bundles.filter((b) => historyFilterInst === 'ALL' || b.evaluation.instrument_id === historyFilterInst)
                .length === 0 ? (
                <p className="text-xs text-[var(--texto-tenue)] py-4 text-center">
                  No existen aplicaciones psicométricas digitales registradas todavía para {selectedPseudonym}.
                </p>
              ) : (
                <div className="space-y-2 max-h-[520px] overflow-y-auto">
                  {bundles
                    .filter((b) => historyFilterInst === 'ALL' || b.evaluation.instrument_id === historyFilterInst)
                    .map((b) => {
                      const isSel = inspectedBundle?.evaluation.evaluation_id === b.evaluation.evaluation_id;
                      const isDraft = b.evaluation.application_status === 'draft';
                      return (
                        <div
                          key={b.evaluation.evaluation_id}
                          onClick={() => setInspectedBundle(b)}
                          className={`p-3 rounded-[var(--r)] border cursor-pointer transition-colors ${
                            isSel
                              ? 'bg-[var(--captura)] border-[var(--accion)]'
                              : 'bg-[var(--fondo)] border-[var(--borde)] hover:bg-[var(--captura)]'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-[var(--texto)]">
                              {b.evaluation.instrument_id}{' '}
                              <span className="font-mono font-normal text-[10px] text-[var(--texto-tenue)]">
                                {b.evaluation.instrument_version}
                              </span>
                            </span>
                            {isDraft ? (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--advertencia)]/15 text-[var(--advertencia)] border border-[var(--advertencia)]/30">
                                Borrador
                              </span>
                            ) : (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--normal)]/15 text-[var(--normal)] border border-[var(--normal)]/30 flex items-center gap-1">
                                <Lock className="w-2.5 h-2.5" />
                                Completada
                              </span>
                            )}
                          </div>
                          <div className="text-[10.5px] text-[var(--texto-sec)] mt-1">
                            Fecha: {(b.evaluation.completed_at || b.evaluation.started_at).slice(0, 16).replace('T', ' ')} ·{' '}
                            {b.evaluation.evaluator}
                          </div>
                          {isDraft && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                resumeDraftBundle(b);
                              }}
                              className="mt-2 px-2 py-1 rounded bg-[var(--accion)] text-white text-[10px] font-semibold cursor-pointer"
                            >
                              Continuar aplicación
                            </button>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Inspector de 3 niveles */}
            <div className="lg:col-span-7 bg-[var(--panel)] border border-[var(--borde)] rounded-[var(--r)] p-4 space-y-3">
              {!inspectedBundle ? (
                <div className="py-12 text-center text-xs text-[var(--texto-tenue)]">
                  Seleccione una evaluación del historial para auditar sus respuestas individuales por reactivo y sus resultados versionados.
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-start justify-between gap-2 pb-2 border-b border-[var(--sep-claro)]">
                    <div>
                      <h3 className="text-sm font-bold text-[var(--texto)]">
                        {inspectedBundle.evaluation.instrument_id} — {inspectedBundle.evaluation.instrument_version}
                      </h3>
                      <p className="text-[10.5px] font-mono text-[var(--texto-tenue)]">
                        ID: {inspectedBundle.evaluation.evaluation_id} · Algoritmo:{' '}
                        {inspectedBundle.latestResult?.algorithm_version || 'N/A'} · Estado:{' '}
                        {inspectedBundle.evaluation.application_status}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRecalculateBundle(inspectedBundle.evaluation.evaluation_id)}
                      className="px-2.5 py-1.5 rounded bg-[var(--captura)] border border-[var(--borde)] text-[11px] cursor-pointer flex items-center gap-1"
                      title="Recalcula sin modificar las respuestas originales guardadas"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Recalcular versión algoritmo ({inspectedBundle.resultsHistory.length} cálc.)
                    </button>
                  </div>

                  {inspectedBundle.latestResult && (
                    <div className="p-3 rounded bg-[var(--fondo)] border border-[var(--sep-claro)] space-y-1.5 text-xs">
                      <div className="font-bold text-[var(--texto)]">
                        {inspectedBundle.latestResult.interpretation.level}
                      </div>
                      <p className="text-[var(--texto-sec)]">
                        {inspectedBundle.latestResult.interpretation.summary}
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {inspectedBundle.latestResult.subscales.subscales.map((s: any) => (
                          <span
                            key={s.id}
                            className="px-2 py-0.5 rounded bg-[var(--panel)] border border-[var(--borde)] text-[10.5px] font-mono"
                          >
                            {s.name}: {s.score ?? '—'}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--texto-tenue)]">
                      Nivel 2 · Respuestas individuales conservadas ({inspectedBundle.responses.length} reactivos)
                    </div>
                    <div className="max-h-72 overflow-y-auto border border-[var(--sep-claro)] rounded">
                      <table className="w-full text-[11px] text-left">
                        <thead className="bg-[var(--fondo)] text-[10px] uppercase text-[var(--texto-tenue)] sticky top-0">
                          <tr>
                            <th className="px-2 py-1">#</th>
                            <th className="px-2 py-1">ID</th>
                            <th className="px-2 py-1">Respuesta seleccionada</th>
                            <th className="px-2 py-1">Valor</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--sep-claro)]">
                          {inspectedBundle.responses.map((r) => (
                            <tr key={r.response_row_id}>
                              <td className="px-2 py-1 font-mono">{r.item_number}</td>
                              <td className="px-2 py-1 font-mono text-[var(--texto-tenue)]">{r.canonical_code || r.item_id}</td>
                              <td className="px-2 py-1">{r.selected_label || 'Sin responder'}</td>
                              <td className="px-2 py-1 font-mono font-bold">{r.numeric_code ?? '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
