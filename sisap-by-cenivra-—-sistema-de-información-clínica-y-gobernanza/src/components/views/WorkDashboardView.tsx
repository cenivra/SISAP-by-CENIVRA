import React, { useState } from 'react';
import { ClinicalDraft, PatientClinico, UserAccount } from '../../types/clinical';
import { StorageService } from '../../services/storageService';
import { NavScreen } from '../Sidebar';
import { ConfirmationModal } from '../ConfirmationModal';
import {
  Users,
  FileEdit,
  Activity,
  Calendar,
  CloudUpload,
  ArrowRight,
  Clock,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FolderOpen,
} from 'lucide-react';

interface WorkDashboardViewProps {
  currentUser: UserAccount;
  patients: PatientClinico[];
  isAnonymousMode: boolean;
  onNavigate: (screen: NavScreen, patientPseudonym?: string) => void;
  onResumeDraft: (draft: ClinicalDraft) => void;
  onOpenDriveModal: () => void;
  onSelectPatient: (pseudonym: string) => void;
}

export const WorkDashboardView: React.FC<WorkDashboardViewProps> = ({
  currentUser,
  patients,
  isAnonymousMode,
  onNavigate,
  onResumeDraft,
  onOpenDriveModal,
  onSelectPatient,
}) => {
  const [drafts, setDrafts] = useState<ClinicalDraft[]>(StorageService.getDrafts());
  const [draftToDelete, setDraftToDelete] = useState<ClinicalDraft | null>(null);
  const [previewDraft, setPreviewDraft] = useState<ClinicalDraft | null>(null);

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

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Title */}
      <div>
        <h2 className="text-lg font-bold tracking-tight text-[var(--texto)]">Central de Trabajo</h2>
        <div className="text-xs text-[var(--texto-tenue)]">
          Panel de control clínico diario · Supervisión de expedientes, borradores activos y adherencia a protocolos
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="sisap-tarjeta p-3.5 mb-0 flex items-center gap-3">
          <div className="p-2.5 rounded bg-[var(--accion-fondo)]/15 text-[var(--accion)]">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold font-mono">{patients.length}</div>
            <div className="text-[11px] text-[var(--texto-tenue)]">Pacientes en Padrón</div>
          </div>
        </div>

        <div className="sisap-tarjeta p-3.5 mb-0 flex items-center gap-3">
          <div className="p-2.5 rounded bg-[var(--advertencia)]/15 text-[var(--advertencia)]">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold font-mono">{drafts.length}</div>
            <div className="text-[11px] text-[var(--texto-tenue)]">Borradores en Curso</div>
          </div>
        </div>

        <div className="sisap-tarjeta p-3.5 mb-0 flex items-center gap-3">
          <div className="p-2.5 rounded bg-[var(--normal)]/15 text-[var(--normal)]">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold font-mono">
              {patients.filter((p) => p.escalas.BIS_11).length} / {patients.length}
            </div>
            <div className="text-[11px] text-[var(--texto-tenue)]">Evaluaciones Base</div>
          </div>
        </div>

        <div className="sisap-tarjeta p-3.5 mb-0 flex items-center gap-3">
          <div className="p-2.5 rounded bg-[var(--accion)]/15 text-[var(--accion)]">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold font-mono">
              {patients.reduce((acc, p) => acc + (p.sesiones || 0), 0)}
            </div>
            <div className="text-[11px] text-[var(--texto-tenue)]">Sesiones Registradas</div>
          </div>
        </div>
      </div>

      {/* Pending Drafts Section */}
      <div className="sisap-tarjeta">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileEdit className="w-4 h-4 text-[var(--advertencia)]" />
            <h3 className="text-sm font-semibold text-[var(--texto)]">Borradores sin terminar</h3>
          </div>
          <span className="text-xs text-[var(--texto-tenue)] font-mono">
            {drafts.length} pendiente{drafts.length !== 1 ? 's' : ''}
          </span>
        </div>

        {drafts.length === 0 ? (
          <div className="p-4 text-center rounded bg-[var(--campo)] border border-[var(--sep)] text-xs text-[var(--texto-tenue)]">
            No hay borradores pendientes. Al capturar formularios extensos (como la Entrevista o Escalas), use{' '}
            <b className="text-[var(--texto)]">«Guardar y continuar después»</b> para no perder el avance.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--sep-claro)] text-[var(--texto-tenue)]">
                  <th className="py-2 px-3 font-semibold">Formulario</th>
                  <th className="py-2 px-3 font-semibold">Paciente</th>
                  <th className="py-2 px-3 font-semibold">Último Guardado</th>
                  <th className="py-2 px-3 font-semibold">Campos</th>
                  <th className="py-2 px-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--sep-claro)]">
                {drafts.map((d) => (
                  <tr key={d.clave} className="hover:bg-[var(--captura)] transition-colors">
                    <td className="py-2 px-3 font-medium text-[var(--texto)]">{d.formulario}</td>
                    <td className="py-2 px-3 font-mono text-[var(--accion)]">
                      {isAnonymousMode ? '(anónimo)' : d.paciente}
                    </td>
                    <td className="py-2 px-3 text-[var(--texto-sec)]">{d.sello}</td>
                    <td className="py-2 px-3 font-mono">
                      <span className="est-ok">{d.campos} valores</span>
                    </td>
                    <td className="py-2 px-3 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => onResumeDraft(d)}
                        className="sisap-btn py-1 px-2.5 text-xs inline-flex items-center gap-1"
                      >
                        <span>Continuar</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => setPreviewDraft(d)}
                        className="sisap-btn-sec py-1 px-2 text-xs"
                        title="Ver datos del borrador"
                      >
                        Ver
                      </button>
                      <button
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
      </div>

      {/* Patients Roster in Treatment */}
      <div className="sisap-tarjeta">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[var(--accion)]" />
            <h3 className="text-sm font-semibold text-[var(--texto)]">Expedientes Clínicos Activos</h3>
          </div>
          <button
            onClick={() => onNavigate('pacientes')}
            className="text-xs text-[var(--accion)] hover:underline flex items-center gap-1"
          >
            <span>Ver padrón completo</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--sep-claro)] text-[var(--texto-tenue)]">
                <th className="py-2 px-3 font-semibold">Expediente (Seudónimo)</th>
                <th className="py-2 px-3 font-semibold">Ingreso</th>
                <th className="py-2 px-3 font-semibold">Fase / Estado</th>
                <th className="py-2 px-3 font-semibold">Droga de Impacto</th>
                <th className="py-2 px-3 font-semibold">Sesiones</th>
                <th className="py-2 px-3 font-semibold">Batería Inicial</th>
                <th className="py-2 px-3 text-right">Ficha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--sep-claro)]">
              {patients.map((p) => {
                const isEvalComplete = p.escalas?.BIS_11 && p.escalas?.BSL_23 && p.escalas?.GAD_7;
                return (
                  <tr key={p.seudonimo} className="hover:bg-[var(--captura)] transition-colors">
                    <td className="py-2.5 px-3 font-mono font-medium text-[var(--accion)]">
                      {isAnonymousMode ? '(anónimo)' : p.seudonimo}
                    </td>
                    <td className="py-2.5 px-3 text-[var(--texto-sec)]">{p.ingreso}</td>
                    <td className="py-2.5 px-3">
                      <span className="text-[11px] px-2 py-0.5 rounded border border-[var(--borde)]/40 bg-[var(--campo)]">
                        {p.estado}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[var(--texto-sec)]">{p.droga_impacto || '—'}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-center">{p.sesiones}</td>
                    <td className="py-2.5 px-3">
                      {isEvalComplete ? (
                        <span className="est-ok inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Completa
                        </span>
                      ) : (
                        <span className="est-warn inline-flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Parcial
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => {
                          onSelectPatient(p.seudonimo);
                          onNavigate('pacientes', p.seudonimo);
                        }}
                        className="sisap-btn-sec py-1 px-2.5 text-xs inline-flex items-center gap-1"
                      >
                        <FolderOpen className="w-3 h-3" />
                        <span>Abrir</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-3 pt-3 border-t border-[var(--sep-claro)] text-[11px] text-[var(--texto-tenue)] flex flex-wrap items-center justify-between gap-2">
          <span>
            <b>Principio de Gobernanza:</b> El expediente clínico nunca transporta el nombre del usuario. Solo viaja el seudónimo <code className="font-mono text-[var(--accion)]">TUS-XXXX</code>.
          </span>
          <button
            onClick={onOpenDriveModal}
            className="sisap-btn-sec py-0.5 px-2 text-[11px] inline-flex items-center gap-1 text-[var(--accion)]"
          >
            <CloudUpload className="w-3 h-3" />
            <span>Sincronizar todo en Google Drive</span>
          </button>
        </div>
      </div>

      {/* Draft Preview Modal */}
      {previewDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-[var(--panel)] border border-[var(--sep-claro)] rounded-[var(--r)] shadow-2xl p-5 text-[var(--texto)]">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--sep)] mb-3">
              <h3 className="font-semibold text-sm">
                Vista previa de borrador: {previewDraft.formulario}
              </h3>
              <button
                onClick={() => setPreviewDraft(null)}
                className="text-[var(--texto-tenue)] hover:text-[var(--texto)]"
              >
                ×
              </button>
            </div>
            <div className="text-xs text-[var(--texto-sec)] mb-2">
              Paciente: <b className="font-mono">{previewDraft.paciente}</b> | Guardado: {previewDraft.sello} | Total:{' '}
              {previewDraft.campos} campos
            </div>
            <pre className="p-3 bg-[var(--fondo)] border border-[var(--sep)] rounded text-[11px] font-mono max-h-72 overflow-y-auto text-[var(--texto-sec)]">
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
              <button
                type="button"
                onClick={() => setPreviewDraft(null)}
                className="sisap-btn-sec text-xs py-1.5"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation for deleting draft */}
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
