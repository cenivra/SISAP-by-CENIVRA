import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  details?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  details,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  isDestructive = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="w-full max-w-md bg-[var(--panel)] border border-[var(--sep-claro)] rounded-[var(--r)] shadow-2xl p-6 text-[var(--texto)] animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-full ${
                isDestructive ? 'bg-[var(--riesgo)]/20 text-[var(--riesgo)]' : 'bg-[var(--advertencia)]/20 text-[var(--advertencia)]'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold leading-6">{title}</h3>
          </div>
          <button
            onClick={onCancel}
            className="text-[var(--texto-tenue)] hover:text-[var(--texto)] p-1 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-[var(--texto-sec)] mb-3 leading-relaxed">{message}</p>

        {details && (
          <div className="p-3 bg-[var(--fondo)] border border-[var(--sep)] rounded text-xs font-mono text-[var(--texto-tenue)] mb-4 break-all">
            {details}
          </div>
        )}

        <div className="flex justify-end gap-3 mt-5 pt-3 border-t border-[var(--sep-claro)]">
          <button type="button" onClick={onCancel} className="sisap-btn-sec">
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={isDestructive ? 'sisap-btn-danger' : 'sisap-btn'}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
