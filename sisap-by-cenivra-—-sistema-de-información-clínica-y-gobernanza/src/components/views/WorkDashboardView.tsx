import React, { useMemo, useState } from 'react';
import { ClinicalDraft, PatientClinico, UserAccount } from '../../types/clinical';
import { StorageService } from '../../services/storageService';
import { NavScreen } from '../Sidebar';
import { ConfirmationModal } from '../ConfirmationModal';
import {
  Users,
  FileEdit,
  ArrowRight,
  Trash2,
  FolderOpen,
  BrainCircuit,
  ClipboardCheck,
  Search,
  AlertCircle,
  CheckCircle2,
  FileSignature,
  BookOpen,
} from 'lucide-react';

interface WorkDashboardViewProps {
  currentUser: UserAccount;
  patients: PatientClinico[];
  selectedPseudonym?: string;
  isAnonymousMode: boolean;
  onNavigate: (screen: NavScreen, patientPseudonym?: string) => void;
  onResumeDraft: (draft: ClinicalDraft) => void;
  onOpenDriveModal: () => void;
  onSelectPatient: (pseudonym: string) => void;
}

const BASELINE_KEYS: Array<{ key: keyof PatientClinico['escalas']; label: string }> = [
  { key: 'BIS_11', label: 'BIS-11' },
  { key: 'BSL_23', label: 'BSL-23' },
  { key: 'GAD_7', label: 'GAD-7' },
  { key: 'EROS', label: 'EROS' },
  { key: 'BADS', label: 'BADS' },
  { key: 'STAXI_2', label: 'STAXI-2' },
];

function getMissingBaselineLabels(p?: PatientClinico): string[] {
  if (!p?.escalas) return BASELINE_KEYS.map((k) => k.label);
  return BASELINE_KEYS.filter((k) => !p.escalas[k.key]).map((k) => k.label);
}

function countBaselineCompleted(p?: PatientClinico): number {
  return 6 - getMissingBaselineLabels(p).length;
}

export const WorkDashboardView: React.FC<WorkDashboardViewProps> = ({
  currentUser,
  patients,
  selectedPseudonym,
  isAnonymousMode,
  onNavigate,
  onResumeDraft,
  onSelectPatient,
}) => {
  const [drafts, setDrafts] = useState<ClinicalDraft[]>(StorageService.getDrafts());
  const [draftToDelete, setDraftToDelete] = useState<ClinicalDraft | null>(null);
  const [previewDraft, setPreviewDraft] = useState<ClinicalDraft | null>(null);
  const [rosterFilter, setRosterFilter] = useState<'all' | 'attention' | 'complete'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const activePatient =
    patients.find((p) => p.seudonimo === selectedPseudonym) || patients[0];
  const activeMissing = getMissingBaselineLabels(activePatient);
  const activeNotes = activePatient ? StorageService.getEvolutionNotes(activePatient.seudonimo) : [];
  const activeNarratives = activePatient ? StorageService.getWeeklyNarratives(activePatient.seudonimo) : [];
  const activeFollowUps = activePatient ? StorageService.getFollowUpEvaluations(activePatient.seudonimo) : [];

  const reloadDrafts = () => {
    setDrafts(StorageService.getDrafts());
  };

  const handleConfirmDeleteDraft = () => {
    if (!draftToDelete) return;
    StorageService.deleteDraft(draftToDelete.clave);
    StorageService.logAction({
      usuario: currentUser.u,
      rol: currentUser.rol,
      accion: 'Borrador descartado',
      exp: draftToDelete.paciente,
      detalles: `Formulario: ${draftToDelete.formulario}`,
    });
    setDraftToDelete(null);
    reloadDrafts();
  };

  // Real clinical priorities derived solely from actual patient/draft/evaluation state
  const attentionQueue = useMemo(() => {
    return patients
      .map((p) => {
        const missing = getMissingBaselineLabels(p);
        const patientDrafts = drafts.filter((d) => d.paciente.includes(p.seudonimo));
        const followUps = StorageService.getFollowUpEvaluations(p.seudonimo);
        const reasons: string[] = [];
        if (missing.length > 0) {
          reasons.push(`Faltan ${missing.length} escalas basales (${missing.slice(0, 3).join(', ')}${missing.length > 3 ? '…' : ''})`);
        }
        if (patientDrafts.length > 0) {
          reasons.push(`${patientDrafts.length} borrador(es) sin finalizar`);
        }
        if (missing.length === 0 && followUps.length === 0 && p.sesiones > 0) {
          reasons.push('Sin medición longitudinal de seguimiento registrada');
        }
        return {
          patient: p,
          missingCount: missing.length,
          draftCount: patientDrafts.length,
          reasons,
          needsAttention: missing.length > 0 || patientDrafts.length > 0,
        };
      })
      .filter((item) => item.reasons.length > 0);
  }, [patients, drafts]);

  const filteredPatients = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return patients.filter((p) => {
      const done = countBaselineCompleted(p);
      if (rosterFilter === 'attention' && done === 6) return false;
      if (rosterFilter === 'complete' && done < 6) return false;
      if (!q) return true;
      return (
        p.seudonimo.toLowerCase().includes(q) ||
        (p.estado || '').toLowerCase().includes(q) ||
        (p.droga_impacto || '').toLowerCase().includes(q)
      );
    });
  }, [patients, rosterFilter, searchTerm]);

  const totalSessions = patients.reduce((acc, p) => acc + (p.sesiones || 0), 0);
  const fullD06Count = patients.filter((p) => countBaselineCompleted(p) === 6).length;

  return (
    <div className="space-y-4">
      {/* Workbench Title Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5 border-b border-[var(--sep)]">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-[var(--texto)]">Central de trabajo</h2>
          <p className="text-xs text-[var(--texto-sec)]">
            Continuidad clínica, expedientes que requieren atención y acceso directo a evaluación e inteligencia funcional.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate('centro_psicometrico', activePatient?.seudonimo)}
            className="sisap-btn-sec text-xs py-1.5 px-3"
          >
            <ClipboardCheck className="w-3.5 h-3.5" />
            <span>Aplicar instrumento</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('ecosistema', activePatient?.seudonimo)}
            className="sisap-btn text-xs py-1.5 px-3"
          >
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>Inteligencia funcional</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Work Layout: 8-col Clinical Queue + 4-col Active Case Continuity & Compact Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left / Primary Column (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* 1. Expedientes que requieren atención o continuidad */}
          <section className="wb-surface p-4 space-y-3">
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-[var(--sep)]">
              <div>
                <h3 className="text-sm font-semibold text-[var(--texto)]">
                  Expedientes que requieren atención y continuidad
                </h3>
                <p className="text-xs text-[var(--texto-tenue)]">
                  Priorizados según evaluaciones basales pendientes, borradores sin cerrar o seguimiento longitudinal.
                </p>
              </div>
              <span className="text-xs font-medium text-[var(--texto-sec)] tabular-nums">
                {attentionQueue.length} caso{attentionQueue.length !== 1 ? 's' : ''}
              </span>
            </div>

            {attentionQueue.length === 0 ? (
              <div className="p-3 rounded bg-[var(--campo)] border border-[var(--sep)] text-xs text-[var(--normal)] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Todos los expedientes tienen batería basal completa y sin borradores pendientes.</span>
              </div>
            ) : (
              <div className="divide-y divide-[var(--sep)]">
                {attentionQueue.map(({ patient, missingCount, reasons }) => (
                  <div
                    key={patient.seudonimo}
                    className="py-2.5 flex flex-wrap items-center justify-between gap-3"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="sisap-mono font-semibold text-xs text-[var(--accion)]">
                          {isAnonymousMode ? '(anónimo)' : patient.seudonimo}
                        </span>
                        <span className="text-xs text-[var(--texto-sec)]">{patient.estado}</span>
                        <span
                          className={
                            missingCount > 0 ? 'est-warn' : 'est-pend'
                          }
                        >
                          {6 - missingCount}/6 escalas
                        </span>
                      </div>
                      <p className="text-xs text-[var(--texto-sec)]">{reasons.join(' · ')}</p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          onSelectPatient(patient.seudonimo);
                          onNavigate(missingCount > 0 ? 'centro_psicometrico' : 'seguimiento', patient.seudonimo);
                        }}
                        className="sisap-btn-sec py-1 px-2.5 text-xs"
                      >
                        {missingCount > 0 ? 'Completar escalas' : 'Registrar seguimiento'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onSelectPatient(patient.seudonimo);
                          onNavigate('pacientes', patient.seudonimo);
                        }}
                        className="sisap-btn-sec py-1 px-2.5 text-xs"
                      >
                        <FolderOpen className="w-3.5 h-3.5" />
                        <span>Expediente</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* 2. Borradores y registros pendientes */}
          <section className="wb-surface p-4 space-y-3">
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-[var(--sep)]">
              <div className="flex items-center gap-2">
                <FileEdit className="w-4 h-4 text-[var(--advertencia)]" />
                <h3 className="text-sm font-semibold text-[var(--texto)]">Borradores sin terminar</h3>
              </div>
              <span className="text-xs text-[var(--texto-tenue)] tabular-nums">
                {drafts.length} pendiente{drafts.length !== 1 ? 's' : ''}
              </span>
            </div>

            {drafts.length === 0 ? (
              <p className="text-xs text-[var(--texto-tenue)]">
                No hay borradores pendientes. Al capturar formularios extensos use «Guardar y continuar después» para retomar su avance aquí.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--sep-claro)] text-[var(--texto-tenue)]">
                      <th className="py-2 pr-3 font-medium">Formulario</th>
                      <th className="py-2 pr-3 font-medium">Expediente</th>
                      <th className="py-2 pr-3 font-medium">Guardado</th>
                      <th className="py-2 pr-3 font-medium">Avance</th>
                      <th className="py-2 text-right font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--sep)]">
                    {drafts.map((d) => (
                      <tr key={d.clave} className="hover:bg-[var(--panel-elev)] transition-colors">
                        <td className="py-2 pr-3 font-medium text-[var(--texto)]">{d.formulario}</td>
                        <td className="py-2 pr-3 sisap-mono text-[var(--accion)]">
                          {isAnonymousMode ? '(anónimo)' : d.paciente}
                        </td>
                        <td className="py-2 pr-3 text-[var(--texto-sec)] tabular-nums">{d.sello}</td>
                        <td className="py-2 pr-3 tabular-nums">
                          <span className="est-ok">{d.campos} valores</span>
                        </td>
                        <td className="py-2 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => onResumeDraft(d)}
                            className="sisap-btn py-1 px-2.5 text-xs"
                          >
                            <span>Continuar</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setPreviewDraft(d)}
                            className="sisap-btn-sec py-1 px-2 text-xs"
                          >
                            Ver
                          </button>
                          <button
                            type="button"
                            onClick={() => setDraftToDelete(d)}
                            className="sisap-btn-danger py-1 px-2 text-xs"
                            title="Descartar borrador"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* 3. Expedientes Clínicos Activos */}
          <section className="wb-surface p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[var(--sep)]">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[var(--accion)]" />
                <h3 className="text-sm font-semibold text-[var(--texto)]">Expedientes Clínicos Activos</h3>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-[var(--texto-tenue)]" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Filtrar expediente..."
                    className="sisap-input pl-8 py-1 text-xs w-44"
                  />
                </div>

                <div className="inline-flex rounded border border-[var(--sep-claro)] bg-[var(--campo)] p-0.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setRosterFilter('all')}
                    className={`px-2 py-0.5 rounded-sm cursor-pointer ${
                      rosterFilter === 'all' ? 'bg-[var(--accion)] text-white font-medium' : 'text-[var(--texto-sec)]'
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    type="button"
                    onClick={() => setRosterFilter('attention')}
                    className={`px-2 py-0.5 rounded-sm cursor-pointer ${
                      rosterFilter === 'attention' ? 'bg-[var(--advertencia)] text-[var(--foco-texto)] font-medium' : 'text-[var(--texto-sec)]'
                    }`}
                  >
                    Incompletos
                  </button>
                  <button
                    type="button"
                    onClick={() => setRosterFilter('complete')}
                    className={`px-2 py-0.5 rounded-sm cursor-pointer ${
                      rosterFilter === 'complete' ? 'bg-[var(--normal)] text-white font-medium' : 'text-[var(--texto-sec)]'
                    }`}
                  >
                    Completos
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigate('pacientes')}
                  className="text-xs text-[var(--accion)] hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Ver padrón completo</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--sep-claro)] text-[var(--texto-tenue)]">
                    <th className="py-2 pr-3 font-medium">Expediente</th>
                    <th className="py-2 pr-3 font-medium">Fase / Estado</th>
                    <th className="py-2 pr-3 font-medium">Sustancia</th>
                    <th className="py-2 pr-3 font-medium text-center">Sesiones</th>
                    <th className="py-2 pr-3 font-medium">Evaluación basal</th>
                    <th className="py-2 text-right font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--sep)]">
                  {filteredPatients.map((p) => {
                    const done = countBaselineCompleted(p);
                    const isFocused = activePatient?.seudonimo === p.seudonimo;
                    return (
                      <tr
                        key={p.seudonimo}
                        onClick={() => onSelectPatient(p.seudonimo)}
                        className={`cursor-pointer transition-colors ${
                          isFocused ? 'bg-[var(--captura)]' : 'hover:bg-[var(--panel-elev)]'
                        }`}
                      >
                        <td className="py-2 pr-3 sisap-mono font-semibold text-[var(--accion)]">
                          {isAnonymousMode ? '(anónimo)' : p.seudonimo}
                        </td>
                        <td className="py-2 pr-3 text-[var(--texto)]">{p.estado}</td>
                        <td className="py-2 pr-3 text-[var(--texto-sec)]">{p.droga_impacto || '—'}</td>
                        <td className="py-2 pr-3 tabular-nums text-center font-medium">{p.sesiones}</td>
                        <td className="py-2 pr-3 tabular-nums">
                          <span className={done === 6 ? 'est-ok' : 'est-warn'}>
                            {done}/6 {done === 6 ? 'Completa' : 'Parcial'}
                          </span>
                        </td>
                        <td className="py-2 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectPatient(p.seudonimo);
                              onNavigate('ecosistema', p.seudonimo);
                            }}
                            className="sisap-btn-sec py-1 px-2 text-xs"
                          >
                            Análisis
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectPatient(p.seudonimo);
                              onNavigate('pacientes', p.seudonimo);
                            }}
                            className="sisap-btn-sec py-1 px-2 text-xs"
                          >
                            Abrir
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Right Column (4 cols): Next Clinical Step for Active Case + Secondary Compact Summary */}
        <div className="lg:col-span-4 space-y-4">
          <section className="wb-surface p-4 space-y-3">
            <div className="pb-2 border-b border-[var(--sep)]">
              <div className="wb-eyebrow">Continuidad del caso seleccionado</div>
              <h3 className="text-sm font-semibold text-[var(--texto)] mt-0.5">
                {isAnonymousMode ? 'Expediente protegido' : activePatient?.seudonimo || 'Sin selección'} · {activePatient?.estado}
              </h3>
            </div>

            {activeMissing.length > 0 ? (
              <div className="p-3 rounded bg-[var(--advertencia)]/10 border border-[var(--advertencia)]/30 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-semibold text-[var(--advertencia)]">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Evaluación basal incompleta</span>
                </div>
                <p className="text-[var(--texto-sec)]">
                  Faltan por aplicar: <strong className="text-[var(--texto)]">{activeMissing.join(', ')}</strong>. Complete los 6 instrumentos para habilitar el perfil funcional transversal.
                </p>
              </div>
            ) : (
              <div className="p-3 rounded bg-[var(--normal)]/10 border border-[var(--normal)]/30 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-[var(--normal)]">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Evaluación basal completa</span>
                </div>
                <p className="text-[var(--texto-sec)]">
                  {activeNotes.length} nota(s) de evolución · {activeFollowUps.length} seguimiento(s) · {activeNarratives.length} narrativa(s).
                </p>
              </div>
            )}

            <div className="space-y-1.5 pt-1">
              <div className="text-xs font-medium text-[var(--texto-tenue)] mb-1">Acciones clínicas directas</div>
              <button
                type="button"
                onClick={() => onNavigate('entrevista', activePatient?.seudonimo)}
                className="w-full sisap-btn-sec justify-start text-xs py-2"
              >
                <span>Entrevista exploratoria</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('evolucion', activePatient?.seudonimo)}
                className="w-full sisap-btn-sec justify-start text-xs py-2"
              >
                <FileSignature className="w-3.5 h-3.5" />
                <span>Registrar nota de evolución</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('narracion', activePatient?.seudonimo)}
                className="w-full sisap-btn-sec justify-start text-xs py-2"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Capturar narrativa semanal</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('apoyo_decisiones', activePatient?.seudonimo)}
                className="w-full sisap-btn-sec justify-start text-xs py-2"
              >
                <span>Formulación y apoyo a decisiones</span>
              </button>
            </div>
          </section>

          {/* Secondary Compact Global Summary */}
          <section className="wb-surface p-4 space-y-2.5 text-xs">
            <div className="wb-eyebrow">Resumen del centro</div>
            <div className="divide-y divide-[var(--sep)] tabular-nums">
              <div className="py-1.5 flex items-center justify-between">
                <span className="text-[var(--texto-sec)]">Expedientes en padrón</span>
                <span className="font-semibold text-[var(--texto)]">{patients.length}</span>
              </div>
              <div className="py-1.5 flex items-center justify-between">
                <span className="text-[var(--texto-sec)]">Batería inicial completa (6/6)</span>
                <span className="font-semibold text-[var(--normal)]">
                  {fullD06Count} / {patients.length}
                </span>
              </div>
              <div className="py-1.5 flex items-center justify-between">
                <span className="text-[var(--texto-sec)]">Sesiones clínicas registradas</span>
                <span className="font-semibold text-[var(--texto)]">{totalSessions}</span>
              </div>
              <div className="py-1.5 flex items-center justify-between">
                <span className="text-[var(--texto-sec)]">Borradores activos</span>
                <span className="font-semibold text-[var(--advertencia)]">{drafts.length}</span>
              </div>
            </div>
            <p className="text-[11px] text-[var(--texto-tenue)] pt-1 border-t border-[var(--sep)]">
              Principio de disociación: el expediente clínico opera exclusivamente mediante seudónimo <span className="sisap-mono text-[var(--accion)]">TUS-XXXX</span>.
            </p>
          </section>
        </div>
      </div>

      {/* Draft Preview Modal */}
      {previewDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-[var(--panel)] border border-[var(--sep-claro)] rounded-[var(--r)] shadow-2xl p-5 text-[var(--texto)]">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--sep)] mb-3">
              <h3 className="font-semibold text-sm">Vista previa de borrador: {previewDraft.formulario}</h3>
              <button
                type="button"
                onClick={() => setPreviewDraft(null)}
                className="text-[var(--texto-tenue)] hover:text-[var(--texto)]"
              >
                ×
              </button>
            </div>
            <div className="text-xs text-[var(--texto-sec)] mb-2">
              Expediente: <b className="sisap-mono">{previewDraft.paciente}</b> | Guardado: {previewDraft.sello} | Total: {previewDraft.campos} campos
            </div>
            <pre className="p-3 bg-[var(--fondo)] border border-[var(--sep)] rounded text-[11px] sisap-mono max-h-72 overflow-y-auto text-[var(--texto-sec)]">
              {JSON.stringify(previewDraft.datos, null, 2)}
            </pre>
            <div className="flex justify-end gap-2 mt-4 pt-2 border-t border-[var(--sep-claro)]">
              <button
                type="button"
                onClick={() => {
                  const d = previewDraft;
                  setPreviewDraft(null);
                  onResumeDraft(d);
                }}
                className="sisap-btn text-xs py-1.5"
              >
                Continuar Capturando
              </button>
              <button type="button" onClick={() => setPreviewDraft(null)} className="sisap-btn-sec text-xs py-1.5">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={!!draftToDelete}
        title="¿Descartar borrador?"
        message={`¿Está seguro de eliminar el borrador "${draftToDelete?.formulario}" del paciente ${draftToDelete?.paciente}? Se perderán los ${draftToDelete?.campos} campos capturados sin registrar.`}
        confirmLabel="Sí, descartar borrador"
        cancelLabel="Conservar"
        isDestructive={true}
        onConfirm={handleConfirmDeleteDraft}
        onCancel={() => setDraftToDelete(null)}
      />
    </div>
  );
};
