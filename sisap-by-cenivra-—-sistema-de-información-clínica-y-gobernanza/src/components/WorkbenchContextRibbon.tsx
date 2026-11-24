import React from 'react';
import { PatientClinico, RoleConfig } from '../types/clinical';
import { StorageService } from '../services/storageService';
import { NavScreen } from './Sidebar';
import { BrainCircuit, ClipboardCheck, FolderOpen, UserRound } from 'lucide-react';

interface WorkbenchContextRibbonProps {
  selectedPseudonym: string;
  onSelectPseudonym: (pseudonym: string) => void;
  patients: PatientClinico[];
  isAnonymousMode: boolean;
  roleConfig: RoleConfig;
  currentScreen: NavScreen;
  onNavigate: (screen: NavScreen) => void;
  activeGovernedModelId?: string;
}

export const WorkbenchContextRibbon: React.FC<WorkbenchContextRibbonProps> = ({
  selectedPseudonym,
  onSelectPseudonym,
  patients,
  isAnonymousMode,
  roleConfig,
  currentScreen,
  onNavigate,
}) => {
  const activePatient = patients.find((p) => p.seudonimo === selectedPseudonym);
  const padron = StorageService.getPatientPadron(selectedPseudonym);
  const evalData = StorageService.getEvaluations(selectedPseudonym)[0];
  const followUps = StorageService.getFollowUpEvaluations(selectedPseudonym);
  const narratives = StorageService.getWeeklyNarratives(selectedPseudonym);

  const canSeeIdentity = roleConfig.ve_identidad && !isAnonymousMode;
  const displayName =
    canSeeIdentity && padron?.nombre_completo ? padron.nombre_completo : 'Identidad disociada';

  const completedCount = [
    Boolean(activePatient?.escalas?.BIS_11 || evalData?.calculados?.bis_total != null || evalData?.vector24?.BIS_11BIS_total_calculado != null),
    Boolean(activePatient?.escalas?.BSL_23 || evalData?.calculados?.bsl_general != null || evalData?.vector24?.BSL_23BSL_general != null),
    Boolean(activePatient?.escalas?.GAD_7 || evalData?.calculados?.gad_total != null || evalData?.vector24?.GAD_7GAD_zscore != null),
    Boolean(activePatient?.escalas?.EROS || evalData?.calculados?.eros_total != null),
    Boolean(activePatient?.escalas?.BADS || evalData?.calculados?.bads_activation != null || evalData?.vector24?.BADS_bads_activation != null),
    Boolean(activePatient?.escalas?.STAXI_2 || evalData?.calculados?.staxi_state != null || evalData?.vector24?.STAXI_2STAXI_state != null),
  ].filter(Boolean).length;

  const isComplete = completedCount === 6;

  return (
    <div className="bg-[var(--panel-elev)] border-b border-[var(--sep)] px-4 py-1.5 flex flex-wrap items-center justify-between gap-3 text-xs">
      {/* Unified Active Case Context */}
      <div className="flex flex-wrap items-center gap-2.5 min-w-0">
        <div className="flex items-center gap-1.5 shrink-0">
          <UserRound className="w-3.5 h-3.5 text-[var(--accion)]" />
          <span className="text-[var(--texto-tenue)] font-medium">Expediente:</span>
          <select
            aria-label="Seleccionar expediente clínico activo"
            value={selectedPseudonym}
            onChange={(e) => onSelectPseudonym(e.target.value)}
            className="bg-[var(--campo)] border border-[var(--sep-claro)] rounded px-2 py-0.5 text-xs sisap-mono font-semibold text-[var(--texto)] focus:border-[var(--accion)] outline-none"
          >
            {!activePatient && selectedPseudonym && (
              <option value={selectedPseudonym}>{selectedPseudonym}</option>
            )}
            {patients.map((p) => (
              <option key={p.seudonimo} value={p.seudonimo}>
                {p.seudonimo} · {p.estado}
              </option>
            ))}
          </select>
        </div>

        <span className="hidden md:inline text-[var(--texto-sec)] truncate max-w-[200px]">
          {displayName}
        </span>

        <span className="hidden sm:inline text-[var(--sep-claro)]">|</span>

        <div className="flex flex-wrap items-center gap-2.5 text-[11.5px] text-[var(--texto-sec)] tabular-nums">
          <span>
            <strong className="text-[var(--texto)]">{activePatient?.sesiones ?? 0}</strong> sesiones
          </span>
          <span>
            · <strong className={isComplete ? 'text-[var(--normal)]' : 'text-[var(--advertencia)]'}>{completedCount}/6</strong> escalas base
          </span>
          <span className="hidden lg:inline">
            · <strong className="text-[var(--texto)]">{followUps.length}</strong> seguimientos
          </span>
          <span className="hidden lg:inline">
            · <strong className="text-[var(--texto)]">{narratives.length}</strong> narrativas
          </span>
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-medium ${
              isComplete ? 'text-[var(--normal)]' : 'text-[var(--advertencia)]'
            }`}
          >
            · {isComplete ? 'Integridad completa' : 'Evaluación basal incompleta'}
          </span>
        </div>
      </div>

      {/* Contextual Shortcuts */}
      <div className="flex items-center gap-1.5 ml-auto shrink-0">
        {currentScreen !== 'pacientes' && (
          <button
            type="button"
            onClick={() => onNavigate('pacientes')}
            className="text-[11.5px] px-2 py-0.5 rounded border border-[var(--sep-claro)] bg-[var(--campo)] text-[var(--texto-sec)] hover:text-[var(--texto)] hover:border-[var(--accion)] transition-colors inline-flex items-center gap-1 cursor-pointer"
          >
            <FolderOpen className="w-3 h-3" />
            <span>Expediente</span>
          </button>
        )}
        {currentScreen !== 'centro_psicometrico' && (
          <button
            type="button"
            onClick={() => onNavigate('centro_psicometrico')}
            className="text-[11.5px] px-2 py-0.5 rounded border border-[var(--sep-claro)] bg-[var(--campo)] text-[var(--texto-sec)] hover:text-[var(--texto)] hover:border-[var(--accion)] transition-colors inline-flex items-center gap-1 cursor-pointer"
          >
            <ClipboardCheck className="w-3 h-3" />
            <span>Centro psicométrico</span>
          </button>
        )}
        {currentScreen !== 'ecosistema' && (
          <button
            type="button"
            onClick={() => onNavigate('ecosistema')}
            className="text-[11.5px] px-2 py-0.5 rounded border border-[var(--accion)]/45 bg-[var(--accion)]/10 text-[var(--accion)] hover:bg-[var(--accion)]/18 transition-colors inline-flex items-center gap-1 cursor-pointer font-medium"
          >
            <BrainCircuit className="w-3 h-3" />
            <span>Inteligencia funcional</span>
          </button>
        )}
      </div>
    </div>
  );
};
