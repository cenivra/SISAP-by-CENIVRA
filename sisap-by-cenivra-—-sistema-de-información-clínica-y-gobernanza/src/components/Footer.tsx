import React from 'react';
import { UserAccount } from '../types/clinical';
import { ROLES } from '../constants/clinicalConstants';
import { User as FirebaseUser } from 'firebase/auth';

interface FooterProps {
  currentUser: UserAccount;
  googleUser: FirebaseUser | null;
}

export const Footer: React.FC<FooterProps> = ({ currentUser, googleUser }) => {
  const role = ROLES[currentUser.rol];

  return (
    <footer className="shrink-0 bg-[var(--panel)] border-t border-[var(--sep-claro)] px-4 py-1.5 text-[11px] text-[var(--texto-tenue)] flex flex-wrap items-center gap-4 justify-between">
      <div className="flex items-center gap-3">
        <span>
          Sesión: <b className="text-[var(--texto)]">{currentUser.u}</b> ({role.n})
        </span>
        <span className="hidden sm:inline text-[var(--sep-claro)]">|</span>
        <span className="hidden sm:inline">
          Almacenamiento: <span className="text-[var(--normal)]">Local Persistente</span>
        </span>
        <span className="hidden md:inline text-[var(--sep-claro)]">|</span>
        <span className="hidden md:inline">
          Google Drive:{' '}
          <span className={googleUser ? 'text-[var(--normal)]' : 'text-[var(--advertencia)]'}>
            {googleUser ? 'Sincronizado' : 'Sin vincular'}
          </span>
        </span>
      </div>

      <div className="flex items-center gap-3 text-[10.5px]">
        <span className="hidden lg:inline text-[var(--texto-tenue)]">
          Cumplimiento: NOM-004-SSA3-2012 (Expediente Clínico) y NOM-028-SSA2 (Adicciones)
        </span>
        <span className="text-[var(--texto-sec)] font-mono">CENIVRA © 2026</span>
      </div>
    </footer>
  );
};
