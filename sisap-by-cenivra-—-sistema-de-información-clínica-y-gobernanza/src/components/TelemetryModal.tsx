import React, { useState } from 'react';
import { TelemetryService, TelemetryPayload } from '../services/telemetryService';
import {
  Activity,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Send,
  Trash2,
  Lock,
  Layers,
  HelpCircle,
  Download,
} from 'lucide-react';

interface TelemetryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserRole?: string;
}

export const TelemetryModal: React.FC<TelemetryModalProps> = ({
  isOpen,
  onClose,
  currentUserRole = 'personal_salud',
}) => {
  const [isEnabled, setIsEnabled] = useState<boolean>(TelemetryService.isTelemetryEnabled());
  const [events, setEvents] = useState<TelemetryPayload[]>(TelemetryService.getRecentEvents());
  const [testSent, setTestSent] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleToggle = (checked: boolean) => {
    setIsEnabled(checked);
    TelemetryService.setTelemetryOptIn(checked);
    if (checked) {
      TelemetryService.trackEvent({
        event_type: 'feature_usage',
        action: 'opt_in_telemetry_enabled',
        user_role: currentUserRole,
      });
      setEvents(TelemetryService.getRecentEvents());
    }
  };

  const handleSendTestEvent = () => {
    TelemetryService.trackEvent({
      event_type: 'performance_metric',
      action: 'benchmark_crypto_api_test',
      latency_ms: Math.floor(Math.random() * 4) + 1,
      user_role: currentUserRole,
    });
    setEvents(TelemetryService.getRecentEvents());
    setTestSent(true);
    setTimeout(() => setTestSent(false), 2000);
  };

  const handleClearBuffer = () => {
    TelemetryService.clearBuffer();
    setEvents([]);
  };

  const handleDownloadTelemetryJson = () => {
    const data = {
      exported_at: new Date().toISOString(),
      governance: 'SISAP Telemetry Log (Sanitized, Local Buffer)',
      events: events,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sisap_telemetria_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="w-full max-w-2xl bg-[var(--panel)] border-2 border-[var(--borde)] rounded-[var(--r)] shadow-2xl p-6 text-[var(--texto)] animate-in zoom-in-95 my-8 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--sep-claro)] pb-3">
          <div className="flex items-center gap-2.5">
            <Activity className="w-5 h-5 text-[var(--accion)]" />
            <div>
              <h2 className="text-sm font-bold text-[var(--texto)]">
                Gobernanza de Telemetría y Métricas Anónimas (Opt-In Estricto)
              </h2>
              <p className="text-[11px] text-[var(--texto-tenue)]">
                Separación legal estricta conforme a LFPDPPP (INAI) e IEC 62304 Clase B
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-xs text-[var(--texto-tenue)] hover:text-[var(--texto)] p-1 cursor-pointer"
          >
            ✕ Cerrar
          </button>
        </div>

        {/* Legal Opt-in Consent Switch */}
        <div className="p-4 bg-[var(--campo)] border border-[var(--sep)] rounded space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-[var(--texto)]">
                Estado del Consentimiento de Telemetría:
              </span>
              <p className="text-[11px] text-[var(--texto-sec)] leading-relaxed">
                Por defecto el sistema mantiene la telemetría <b>DESACTIVADA</b>. Solo si usted lo autoriza explícitamente se recopilan métricas anónimas de rendimiento.
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer ml-4 shrink-0">
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={(e) => handleToggle(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[var(--sep)] peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accion)]"></div>
            </label>
          </div>

          <div
            className={`p-2.5 rounded border text-xs flex items-center gap-2 font-mono ${
              isEnabled
                ? 'bg-[var(--normal)]/10 text-[var(--normal)] border-[var(--normal)]/30'
                : 'bg-[var(--campo)] text-[var(--texto-tenue)] border-[var(--sep)]'
            }`}
          >
            {isEnabled ? (
              <>
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Telemetría anónima ACTIVA · Canal sendBeacon en segundo plano</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 shrink-0" />
                <span>Telemetría DESACTIVADA · Cero paquetes enviados al servidor</span>
              </>
            )}
          </div>
        </div>

        {/* Whitelist vs Blacklist breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-[var(--campo)] border border-[var(--normal)]/30 rounded space-y-1.5">
            <span className="font-bold text-[var(--normal)] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>¿Qué SÍ se recopila? (Whitelist)</span>
            </span>
            <ul className="list-disc pl-4 space-y-1 text-[11px] text-[var(--texto-sec)]">
              <li>Latencia de la Web Crypto API en milisegundos.</li>
              <li>Eventos de navegación interna (ej. vista cargada).</li>
              <li>Uso de botones de auditoría (WORM, Exportar FHIR).</li>
              <li>Tasa de expiración de tokens temporales TTL.</li>
              <li>Rol clínico genérico (ej. <code>psicologo</code>, <code>medico</code>).</li>
            </ul>
          </div>

          <div className="p-3 bg-[var(--campo)] border border-[var(--riesgo)]/30 rounded space-y-1.5">
            <span className="font-bold text-[var(--riesgo)] flex items-center gap-1.5">
              <XCircle className="w-3.5 h-3.5" />
              <span>¿Qué NO se recopila jamás? (Blacklist)</span>
            </span>
            <ul className="list-disc pl-4 space-y-1 text-[11px] text-[var(--texto-sec)]">
              <li>Textos escritos en notas de evolución o escalas.</li>
              <li>Identificadores de pacientes (<code>TUS-XXXX</code>).</li>
              <li>Nombres reales, CURP, firmas o contraseñas.</li>
              <li>Hashes o llaves criptográficas privadas.</li>
              <li>Cédula profesional del médico o psicólogo.</li>
            </ul>
          </div>
        </div>

        {/* Transparency Live Buffer */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[var(--texto)] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[var(--accion)]" />
              <span>Transparencia Total: Últimos eventos emitidos desde esta terminal</span>
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSendTestEvent}
                disabled={!isEnabled}
                className="sisap-btn text-[10.5px] py-1 px-2.5 flex items-center gap-1"
                title="Emitir un evento anónimo de prueba"
              >
                <Send className="w-3 h-3" />
                <span>{testSent ? '¡Emitido!' : 'Emitir Prueba sendBeacon'}</span>
              </button>

              <button
                onClick={handleDownloadTelemetryJson}
                disabled={events.length === 0}
                className="sisap-btn-sec text-[10.5px] py-1 px-2 text-[var(--texto-tenue)] flex items-center gap-1 cursor-pointer"
                title="Exportar buffer de telemetría en JSON para inspección local"
              >
                <Download className="w-3 h-3" />
                <span>Exportar JSON</span>
              </button>

              <button
                onClick={handleClearBuffer}
                disabled={events.length === 0}
                className="sisap-btn-sec text-[10.5px] py-1 px-2 text-[var(--texto-tenue)] flex items-center gap-1"
                title="Limpiar visor de eventos"
              >
                <Trash2 className="w-3 h-3" />
                <span>Limpiar</span>
              </button>
            </div>
          </div>

          <div className="p-3 bg-black/60 border border-[var(--sep)] rounded font-mono text-[11px] text-[var(--texto-sec)] max-h-40 overflow-y-auto space-y-1.5">
            {events.length > 0 ? (
              events.map((ev, idx) => (
                <div key={idx} className="pb-1 border-b border-white/5 last:border-0 leading-tight">
                  <div className="flex items-center justify-between text-[10px] text-[var(--texto-tenue)]">
                    <span>{ev.timestamp}</span>
                    <span className="text-[var(--accion)]">{ev.event_type}</span>
                  </div>
                  <div className="text-[var(--texto)]">
                    Acción: <span className="text-[var(--normal)]">{ev.action}</span>
                    {ev.latency_ms !== undefined && (
                      <span className="text-[var(--advertencia)] ml-2">({ev.latency_ms} ms)</span>
                    )}
                  </div>
                  <div className="text-[10px] text-[var(--texto-tenue)]">
                    SO: {ev.client_os} | Navegador: {ev.browser} | Rol: {ev.user_role}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-[var(--texto-tenue)] text-xs">
                {isEnabled
                  ? 'No hay eventos en el buffer local. Utilice el sistema o presione "Emitir Prueba sendBeacon".'
                  : 'Telemetría desactivada. No se emite ni almacena ninguna métrica.'}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-3 border-t border-[var(--sep-claro)] text-xs">
          <div className="text-[11px] text-[var(--texto-tenue)]">
            Transmisión mediante <code>navigator.sendBeacon()</code> en segundo plano sin bloqueo.
          </div>
          <button onClick={onClose} className="sisap-btn py-1.5 px-4 text-xs">
            Cerrar Ventana
          </button>
        </div>
      </div>
    </div>
  );
};

export const TelemetryOptInBanner: React.FC<{
  onDecided: (accepted: boolean) => void;
}> = ({ onDecided }) => {
  return (
    <div className="bg-[var(--campo)] border-b border-[var(--accion)]/40 p-3 text-xs text-[var(--texto)] flex flex-wrap items-center justify-between gap-3 animate-in fade-in">
      <div className="flex items-start gap-2.5 max-w-3xl">
        <Activity className="w-4 h-4 text-[var(--accion)] shrink-0 mt-0.5" />
        <p className="leading-snug text-[11.5px] text-[var(--texto-sec)]">
          <b>Ayúdanos a mejorar SISAP compartiendo datos anónimos de uso.</b> Solo recopilamos información sobre el rendimiento del sistema (tiempos de carga, uso de botones, reportes de error). <u>Jamás se transmite información clínica, textos de evolución ni datos de pacientes</u> conforme a los marcos de privacidad del INAI.
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => onDecided(false)}
          className="sisap-btn-sec text-xs py-1 px-3 cursor-pointer"
        >
          No, mantener desactivada
        </button>
        <button
          onClick={() => onDecided(true)}
          className="sisap-btn text-xs py-1 px-3 cursor-pointer"
        >
          Aceptar telemetría anónima
        </button>
      </div>
    </div>
  );
};
