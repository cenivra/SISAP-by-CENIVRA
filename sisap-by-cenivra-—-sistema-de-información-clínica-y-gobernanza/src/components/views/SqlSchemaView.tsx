import React, { useState } from 'react';
import { ESQUEMA_SQL_CENIVRA } from '../../constants/clinicalConstants';
import { SCRIPT_SQL_USUARIOS_CLAVES } from '../../constants/sqlScripts';
import { Database, Copy, Check, ShieldCheck, Download, KeyRound } from 'lucide-react';

export const SqlSchemaView: React.FC = () => {
  const [selectedScript, setSelectedScript] = useState<'clinico' | 'usuarios'>('clinico');
  const [copied, setCopied] = useState(false);

  const activeContent = selectedScript === 'clinico' ? ESQUEMA_SQL_CENIVRA : SCRIPT_SQL_USUARIOS_CLAVES;
  const fileName = selectedScript === 'clinico' ? 'esquema_cenivra_canonico.sql' : 'generar_usuarios_claves.sql';

  const handleCopy = () => {
    navigator.clipboard.writeText(activeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([activeContent], { type: 'text/sql;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-[var(--texto)]">
            Esquemas SQL de Base de Datos y Scripts de Siembra
          </h2>
          <div className="text-xs text-[var(--texto-tenue)]">
            Diseño DDL, disparadores de inmutabilidad (append-only) y generación criptográfica de usuarios con sal
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="sisap-btn-sec text-xs py-1.5 inline-flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[var(--normal)]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copiado al Portapapeles' : 'Copiar DDL'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="sisap-btn text-xs py-1.5 inline-flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar {fileName}</span>
          </button>
        </div>
      </div>

      {/* Selector Tabs */}
      <div className="flex gap-2 border-b border-[var(--sep-claro)] pb-2 text-xs">
        <button
          onClick={() => setSelectedScript('clinico')}
          className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center gap-1.5 ${
            selectedScript === 'clinico'
              ? 'bg-[var(--captura)] text-[var(--accion)] font-bold border-b-2 border-[var(--accion)]'
              : 'text-[var(--texto-sec)] hover:bg-[var(--panel)]'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Esquema Clínico y Gobernanza (esquema_cenivra_canonico.sql)</span>
        </button>

        <button
          onClick={() => setSelectedScript('usuarios')}
          className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center gap-1.5 ${
            selectedScript === 'usuarios'
              ? 'bg-[var(--captura)] text-[var(--accion)] font-bold border-b-2 border-[var(--accion)]'
              : 'text-[var(--texto-sec)] hover:bg-[var(--panel)]'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>Cuentas y Contraseñas con Sal (generar_usuarios_claves.sql)</span>
        </button>
      </div>

      {/* Mechanism summary */}
      <div className="sisap-tarjeta border-l-4 border-l-[var(--accion)]">
        <div className="flex items-center gap-2 mb-2 font-bold text-xs text-[var(--accion)]">
          <ShieldCheck className="w-4 h-4" />
          <span>Gobernanza Relacional y Criptográfica</span>
        </div>
        {selectedScript === 'clinico' ? (
          <>
            <p className="text-xs text-[var(--texto-sec)] leading-relaxed mb-2">
              El nombre completo y datos de contacto viven en una única tabla aislada: <code>padron_identidad</code>. Todo el ecosistema clínico (intervenciones, escalas psicométricas, notas de evolución, narraciones y modelo autoencoder) apunta exclusivamente a la clave ciega <code>seudonimo</code> (ej. <code className="font-mono text-[var(--accion)]">TUS-0007</code>).
            </p>
            <p className="text-xs text-[var(--texto-sec)] leading-relaxed">
              Anonimizar no consiste en borrar datos a posteriori: consiste simplemente en <b>no realizar el JOIN</b> con el padrón. Recuperar el nombre implica un JOIN explícito que requiere privilegios específicos de rol y dispara un registro inmutable en <code>bitacora_acceso</code>.
            </p>
          </>
        ) : (
          <>
            <p className="text-xs text-[var(--texto-sec)] leading-relaxed mb-2">
              La tabla <code>usuarios</code> resguarda <code>clave_hash</code> derivada con <b>PBKDF2-HMAC-SHA256 (100,000 iteraciones)</b> y una <code>clave_sal</code> aleatoria de 16 bytes. Ninguna contraseña viaja ni se guarda en texto claro.
            </p>
            <p className="text-xs text-[var(--texto-sec)] leading-relaxed">
              El trigger <code>tr_auditoria_usuario_update</code> registra en <code>bitacora_usuarios</code> cada cambio de credencial o estado activo, y <code>debe_cambiar_clave = 1</code> garantiza que el administrador nunca retenga acceso a las cuentas creadas.
            </p>
          </>
        )}
      </div>

      {/* SQL Code Block */}
      <div className="sisap-captura">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono font-semibold text-[var(--texto)]">
            {fileName}
          </span>
          <span className="text-[10.5px] text-[var(--texto-tenue)] font-mono">
            SQLite / PostgreSQL / MySQL Compatible
          </span>
        </div>
        <pre className="p-4 rounded bg-[var(--fondo)] border border-[var(--sep)] text-xs font-mono text-[var(--texto-sec)] overflow-x-auto max-h-96 leading-relaxed">
          {activeContent}
        </pre>
      </div>
    </div>
  );
};
