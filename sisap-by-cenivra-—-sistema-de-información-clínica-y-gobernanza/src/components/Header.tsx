import React from 'react';
import { UserAccount } from '../types/clinical';
import { ROLES } from '../constants/clinicalConstants';
import {
  Cloud,
  Eye,
  EyeOff,
  Sun,
  Moon,
  LogOut,
  FileText,
  HardDrive,
  ChevronRight,
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';

interface HeaderProps {
  currentUser: UserAccount;
  draftsCount: number;
  isAnonymousMode: boolean;
  onToggleAnonymous: () => void;
  isLightMode: boolean;
  onToggleTheme: () => void;
  onOpenDrafts: () => void;
  onOpenDriveModal: () => void;
  onOpenTelemetryModal?: () => void;
  onOpenDesktopStorageModal?: () => void;
  isTelemetryEnabled?: boolean;
  googleUser: FirebaseUser | null;
  onLogout: () => void;
  currentScreenLabel?: string;
  appMode?: 'demo' | 'institutional';
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  draftsCount,
  isAnonymousMode,
  onToggleAnonymous,
  isLightMode,
  onToggleTheme,
  onOpenDrafts,
  onOpenDriveModal,
  onOpenDesktopStorageModal,
  googleUser,
  onLogout,
  currentScreenLabel = 'Central de trabajo',
  appMode = 'demo',
}) => {
  const roleConfig = ROLES[currentUser.rol];

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 bg-[var(--panel)] border-b border-[var(--sep)] px-4 py-1.5 overflow-hidden">
      {/* Brand & Breadcrumb */}
      <div className="flex items-center gap-2 min-w-0 shrink-1">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="font-bold text-sm tracking-tight text-[var(--texto)]">SISAP</span>
          <span className="text-[11px] text-[var(--texto-tenue)] hidden sm:inline">by CENIVRA</span>
        </div>

        <div className="hidden md:flex items-center gap-1 text-xs text-[var(--texto-tenue)] border-l border-[var(--sep-claro)] pl-2.5 ml-1 min-w-0">
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          <span className="text-[var(--texto)] font-medium truncate max-w-[220px]">
            {currentScreenLabel}
          </span>
        </div>
      </div>

      {/* Professional Identity & Mode */}
      <div className="hidden lg:flex items-center gap-2 border-l border-[var(--sep)] pl-3 min-w-0">
        <span
          className="text-xs text-[var(--texto-sec)] truncate max-w-[180px]"
          title={currentUser.nombre || currentUser.u}
        >
          {currentUser.nombre || currentUser.u}
        </span>
        <span className="text-[11px] text-[var(--accion)] bg-[var(--captura)] rounded px-2 py-0.5 font-medium whitespace-nowrap shrink-0">
          {roleConfig?.n || currentUser.rol}
        </span>
        {appMode === 'demo' && (
          <span className="text-[10.5px] text-[var(--advertencia)] font-medium whitespace-nowrap shrink-0">
            · Entorno de evaluación
          </span>
        )}
      </div>

      {/* Right Action Bar (calm, slim, single line) */}
      <div className="ml-auto flex items-center gap-1.5 shrink-0">
        {draftsCount > 0 && (
          <button
            type="button"
            onClick={onOpenDrafts}
            className="flex items-center gap-1.5 text-xs text-[var(--advertencia)] bg-[var(--advertencia)]/10 border border-[var(--advertencia)]/35 rounded px-2 py-1 transition-colors cursor-pointer tabular-nums whitespace-nowrap"
            title="Ver borradores pendientes"
          >
            <FileText className="w-3.5 h-3.5 shrink-0" />
            <span>{draftsCount} borrador{draftsCount !== 1 ? 'es' : ''}</span>
          </button>
        )}

        <button
          type="button"
          onClick={onToggleAnonymous}
          className={`flex items-center gap-1.5 text-xs rounded px-2 py-1 border transition-colors cursor-pointer whitespace-nowrap ${
            isAnonymousMode
              ? 'bg-[var(--advertencia)]/10 text-[var(--advertencia)] border-[var(--advertencia)]/40'
              : 'bg-[var(--campo)] text-[var(--texto-sec)] border-[var(--sep-claro)] hover:text-[var(--texto)]'
          }`}
          title={isAnonymousMode ? 'Modo anónimo activo' : 'Vista clínica'}
        >
          {isAnonymousMode ? <EyeOff className="w-3.5 h-3.5 shrink-0" /> : <Eye className="w-3.5 h-3.5 shrink-0" />}
          <span className="hidden sm:inline">{isAnonymousMode ? 'Vista anónima' : 'Vista clínica'}</span>
        </button>

        {roleConfig?.administra && onOpenDesktopStorageModal && (
          <button
            type="button"
            onClick={onOpenDesktopStorageModal}
            className="flex items-center gap-1.5 text-xs text-[var(--texto-sec)] bg-[var(--campo)] border border-[var(--sep-claro)] hover:border-[var(--accion)] rounded px-2 py-1 transition-colors cursor-pointer whitespace-nowrap"
            title="Almacenamiento local y respaldos"
          >
            <HardDrive className="w-3.5 h-3.5 text-[var(--normal)] shrink-0" />
            <span className="hidden xl:inline">Respaldos</span>
          </button>
        )}

        {roleConfig?.exportar_drive && (
          <button
            type="button"
            onClick={onOpenDriveModal}
            className={`flex items-center gap-1.5 text-xs rounded px-2 py-1 border transition-colors cursor-pointer whitespace-nowrap ${
              googleUser
                ? 'bg-[var(--normal)]/10 text-[var(--normal)] border-[var(--normal)]/40'
                : 'bg-[var(--campo)] text-[var(--texto-sec)] border-[var(--sep-claro)] hover:text-[var(--texto)]'
            }`}
            title={googleUser ? `Google Drive conectado como ${googleUser.email}` : 'Respaldo en Google Drive'}
          >
            <Cloud className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden xl:inline">{googleUser ? 'Drive activo' : 'Drive'}</span>
          </button>
        )}

        <button
          type="button"
          onClick={onToggleTheme}
          className="sisap-btn-sec p-1.5"
          title={isLightMode ? 'Cambiar a tema oscuro' : 'Cambiar a tema claro'}
          aria-label="Alternar tema"
        >
          {isLightMode ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
        </button>

        <button
          type="button"
          onClick={onLogout}
          className="sisap-btn-sec px-2.5 py-1 text-xs whitespace-nowrap"
          title="Cerrar sesión actual"
        >
          <LogOut className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline">Salir</span>
        </button>
      </div>
    </header>
  );
};
