import React from 'react';
import { UserAccount } from '../types/clinical';
import { ROLES } from '../constants/clinicalConstants';
import { User as FirebaseUser } from 'firebase/auth';

interface FooterProps {
  currentUser: UserAccount;
  googleUser: FirebaseUser | null;
  appMode?: 'demo' | 'institutional';
  activeGovernedModelId?: string;
}

export const Footer: React.FC<FooterProps> = ({
  currentUser,
  googleUser,
  appMode = 'demo',
}) => {
  const role = ROLES[currentUser.rol];
  const isDesktop = typeof window !== 'undefined' && Boolean(window.sisapDesktop?.isDesktop);

  return (
    <footer className="shrink-0 bg-[var(--panel)] border-t border-[var(--sep)] px-4 py-1 text-[11px] text-[var(--texto-tenue)] flex flex-wrap items-center gap-3 justify-between">
      <div className="flex items-center gap-2.5 flex-wrap">
        <span>
          Sesión: <b className="text-[var(--texto-sec)]">{currentUser.u}</b> ({role?.n || currentUser.rol})
        </span>
        <span className="hidden sm:inline text-[var(--sep-claro)]">·</span>
        <span className="hidden sm:inline">
          Almacenamiento: <span className="text-[var(--normal)]">{isDesktop ? 'Local seguro (%APPDATA%)' : 'Local SQLite'}</span>
        </span>
        {appMode === 'demo' && (
          <>
            <span className="hidden md:inline text-[var(--sep-claro)]">·</span>
            <span className="hidden md:inline text-[var(--advertencia)]">Modo Evaluación</span>
          </>
        )}
        {role?.exportar_drive && (
          <>
            <span className="hidden lg:inline text-[var(--sep-claro)]">·</span>
            <span className="hidden lg:inline">
              Drive: {googleUser ? 'Sincronizado' : 'Opcional'}
            </span>
          </>
        )}
      </div>

      <div className="flex items-center gap-3 text-[11px]">
        <span className="hidden md:inline">NOM-004-SSA3-2012 · NOM-024-SSA3-2012 · NOM-028-SSA2</span>
        <span className="text-[var(--texto-sec)] font-medium">SISAP by CENIVRA</span>
      </div>
    </footer>
  );
};
