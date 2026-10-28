import React from 'react';
import { UserAccount } from '../types/clinical';
import { ROLES } from '../constants/clinicalConstants';
import { Cloud, Eye, EyeOff, Sun, Moon, LogOut, FileText, Activity } from 'lucide-react';
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
  isTelemetryEnabled?: boolean;
  googleUser: FirebaseUser | null;
  onLogout: () => void;
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
  onOpenTelemetryModal,
  isTelemetryEnabled,
  googleUser,
  onLogout,
}) => {
  const roleConfig = ROLES[currentUser.rol];

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 bg-[var(--panel)] border-b border-[var(--sep-claro)] px-4 py-2.5 shadow-xs">
      <div className="flex items-center gap-2.5">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-bold text-base tracking-tight text-[var(--texto)]">SISAP</span>
            <span className="text-[10px] text-[var(--texto-sec)] px-1.5 py-0.5 rounded border border-[var(--sep)]">by CENIVRA</span>
            <span className="text-[11px] text-[var(--texto-tenue)] border border-[var(--sep-claro)] rounded-full px-2 py-0.5 hidden sm:inline-block">
              v1.0 institucional
            </span>
          </div>
        </div>
      </div>

      {/* Role & User badge */}
      <div className="hidden md:flex items-center gap-2 border-l border-[var(--sep)] pl-3 ml-1">
        <span className="text-xs font-medium text-[var(--texto)]">{currentUser.nombre || currentUser.u}</span>
        <span className="text-[11px] bg-[var(--captura)] text-[var(--accion)] border border-[var(--borde)]/40 rounded-full px-2 py-0.5 font-mono">
          {roleConfig?.n || currentUser.rol}
        </span>
      </div>

      {/* Right controls */}
      <div className="ml-auto flex items-center gap-2">
        {/* Drafts badge */}
        <button
          onClick={onOpenDrafts}
          className="flex items-center gap-1.5 text-xs text-[var(--texto-sec)] bg-[var(--campo)] border border-[var(--borde)] hover:border-[var(--accion)] rounded-full px-2.5 py-1 transition-colors cursor-pointer"
          title="Ver y recuperar borradores en curso"
        >
          <FileText className="w-3.5 h-3.5 text-[var(--advertencia)]" />
          <span className="font-mono">Borradores: {draftsCount}</span>
        </button>

        {/* Anonymous Mode switch */}
        <button
          onClick={onToggleAnonymous}
          className={`flex items-center gap-1.5 text-xs rounded-full px-2.5 py-1 border transition-colors cursor-pointer ${
            isAnonymousMode
              ? 'bg-[var(--advertencia)]/10 text-[var(--advertencia)] border-[var(--advertencia)]'
              : 'bg-[var(--campo)] text-[var(--texto-sec)] border-[var(--borde)] hover:text-[var(--texto)]'
          }`}
          title={isAnonymousMode ? 'Modo anónimo activo: nombres ocultos' : 'Modo clínico: nombres visibles según permisos'}
        >
          {isAnonymousMode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{isAnonymousMode ? 'Vista anónima' : 'Vista clínica'}</span>
        </button>

        {/* Google Drive Status Button */}
        <button
          onClick={onOpenDriveModal}
          className={`flex items-center gap-1.5 text-xs rounded-full px-2.5 py-1 border transition-all cursor-pointer ${
            googleUser
              ? 'bg-[var(--normal)]/10 text-[var(--normal)] border-[var(--normal)] hover:bg-[var(--normal)]/20'
              : 'bg-[var(--campo)] text-[var(--texto-sec)] border-[var(--borde)] hover:border-[var(--accion)] hover:text-[var(--accion)]'
          }`}
          title={googleUser ? `Google Drive conectado como ${googleUser.email}` : 'Conectar con Google Drive para respaldos'}
        >
          <Cloud className="w-3.5 h-3.5" />
          <span className="hidden sm:inline font-mono">
            {googleUser ? 'Drive Activo' : 'Conectar Drive'}
          </span>
        </button>

        {/* Telemetry Opt-in Status Button */}
        {onOpenTelemetryModal && (
          <button
            onClick={onOpenTelemetryModal}
            className={`flex items-center gap-1.5 text-xs rounded-full px-2.5 py-1 border transition-all cursor-pointer ${
              isTelemetryEnabled
                ? 'bg-[var(--normal)]/10 text-[var(--normal)] border-[var(--normal)]/40 hover:bg-[var(--normal)]/20'
                : 'bg-[var(--campo)] text-[var(--texto-sec)] border-[var(--borde)] hover:text-[var(--texto)]'
            }`}
            title={
              isTelemetryEnabled
                ? 'Telemetría anónima activa (Opt-in). Haga clic para configurar.'
                : 'Telemetría desactivada. Haga clic para revisar opciones de privacidad.'
            }
          >
            <Activity className="w-3.5 h-3.5" />
            <span className="hidden lg:inline font-mono">
              {isTelemetryEnabled ? 'Métricas ON' : 'Métricas OFF'}
            </span>
          </button>
        )}

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className="sisap-btn-sec p-1.5 rounded-full"
          title={isLightMode ? 'Cambiar a modo oscuro (contraste clínico)' : 'Cambiar a modo claro'}
          aria-label="Alternar tema"
        >
          {isLightMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="sisap-btn-sec px-2 py-1 text-xs"
          title="Cerrar sesión actual"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Salir</span>
        </button>
      </div>
    </header>
  );
};
