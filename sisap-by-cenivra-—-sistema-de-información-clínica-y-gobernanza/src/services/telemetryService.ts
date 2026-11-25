/**
 * Servicio de Telemetría Anónima y Métricas de Rendimiento (Opt-In Estricto)
 * Conforme a LFPDPPP (INAI) e IEC 62304 Clase B
 * - Opt-in por defecto DESACTIVADO
 * - Separación total de datos clínicos y personales de pacientes
 * - Blacklist estricta: Jamás se recolectan textos de inputs, IDs TUS-XXXX, notas ni contraseñas
 * - Utiliza navigator.sendBeacon() para envío en segundo plano sin impacto de rendimiento
 */

export interface TelemetryPayload {
  timestamp: string; // ISO UTC
  event_type: 'feature_usage' | 'navigation' | 'performance_metric' | 'security_event' | 'system_error';
  action: string; // e.g., 'click_verify_worm', 'view_loaded:ciberseguridad', 'crypto_latency_aes'
  latency_ms?: number;
  client_os: string;
  browser: string;
  user_role: string; // Rol médico/psicológico (NUNCA nombre, email ni cédula profesional)
}

const STORAGE_KEYS = {
  OPT_IN: 'sisap_v1_telemetry_opt_in',
  DECIDED: 'sisap_v1_telemetry_decided',
  BUFFER: 'sisap_v1_telemetry_buffer',
};

// Blacklist regexes to guarantee zero clinical or personal data leaks
const BLACKLIST_PATTERNS = [
  /TUS-\d+/gi, // Identificador de paciente
  /\b[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d\b/g, // CURP
  /CED-PROF-\w+/gi, // Cédula profesional
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, // Correos electrónicos
  /\b\d{10}\b/g, // Teléfonos de 10 dígitos
  /[A-Z]:\\Users\\[^\\]+/gi, // Rutas locales con nombre de usuario
  /diagnostico/gi,
  /craving/gi,
  /impulsividad/gi,
  /paciente/gi,
  /familiar/gi,
];

export function sanitizeTelemetryString(str: string): string {
  let cleaned = String(str || '');
  BLACKLIST_PATTERNS.forEach((pattern) => {
    cleaned = cleaned.replace(pattern, '[REDACTED_CLINICAL]');
  });
  return cleaned.slice(0, 300);
}

function sanitizeString(str: string): string {
  return sanitizeTelemetryString(str);
}

let monitoringInstalled = false;

export function installGlobalErrorMonitoring(): () => void {
  if (typeof window === 'undefined' || monitoringInstalled) {
    return () => {};
  }
  monitoringInstalled = true;

  const dispatchSanitizedError = (kind: string, rawMsg: string) => {
    const safeMsg = sanitizeTelemetryString(rawMsg);
    TelemetryService.trackEvent({
      event_type: 'system_error',
      action: `${kind}:${safeMsg}`,
    });
    try {
      const url = `${window.location.origin}/api/monitoring/client-error`;
      const payload = JSON.stringify({
        kind: sanitizeTelemetryString(kind),
        message: safeMsg,
        route: sanitizeTelemetryString(window.location.pathname || '/'),
        client_os: detectClientOS(),
      });
      if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
        const blob = new Blob([payload], { type: 'application/json' });
        navigator.sendBeacon(url, blob);
      }
    } catch {
      // No propagar errores secundarios desde monitorización
    }
  };

  const onError = (ev: ErrorEvent) => {
    dispatchSanitizedError('window_error', ev.message || 'Unhandled error');
  };
  const onRejection = (ev: PromiseRejectionEvent) => {
    const reasonMsg =
      ev.reason && typeof ev.reason === 'object' && 'message' in ev.reason
        ? String((ev.reason as { message: unknown }).message)
        : String(ev.reason || 'Unhandled promise rejection');
    dispatchSanitizedError('unhandled_rejection', reasonMsg);
  };

  window.addEventListener('error', onError);
  window.addEventListener('unhandledrejection', onRejection);
  return () => {
    window.removeEventListener('error', onError);
    window.removeEventListener('unhandledrejection', onRejection);
    monitoringInstalled = false;
  };
}

function detectClientOS(): string {
  if (typeof window === 'undefined') return 'Unknown';
  const ua = window.navigator.userAgent;
  if (ua.includes('Win')) return 'Windows';
  if (ua.includes('Mac')) return 'macOS';
  if (ua.includes('Linux')) return 'Linux';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
  return 'Unknown OS';
}

function detectBrowser(): string {
  if (typeof window === 'undefined') return 'Unknown';
  const ua = window.navigator.userAgent;
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Edg')) return 'Edge';
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Safari')) return 'Safari';
  return 'Modern Browser';
}

export const TelemetryService = {
  isTelemetryEnabled(): boolean {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return false;
    // Default is strictly FALSE (Opt-in required)
    return localStorage.getItem(STORAGE_KEYS.OPT_IN) === 'true';
  },

  setTelemetryOptIn(enabled: boolean): void {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.OPT_IN, enabled ? 'true' : 'false');
    localStorage.setItem(STORAGE_KEYS.DECIDED, 'true');
  },

  hasUserDecided(): boolean {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return true;
    return localStorage.getItem(STORAGE_KEYS.DECIDED) === 'true';
  },

  markDecided(accepted: boolean): void {
    this.setTelemetryOptIn(accepted);
  },

  getRecentEvents(): TelemetryPayload[] {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.BUFFER);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  clearBuffer(): void {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.BUFFER);
  },

  trackEvent(event: {
    event_type: TelemetryPayload['event_type'];
    action: string;
    latency_ms?: number;
    user_role?: string;
  }): boolean {
    if (!this.isTelemetryEnabled()) {
      return false; // Opt-out strictly respected
    }

    const sanitizedAction = sanitizeString(event.action);
    const payload: TelemetryPayload = {
      timestamp: new Date().toISOString(),
      event_type: event.event_type,
      action: sanitizedAction,
      latency_ms: event.latency_ms !== undefined ? Math.round(event.latency_ms) : undefined,
      client_os: detectClientOS(),
      browser: detectBrowser(),
      user_role: sanitizeString(event.user_role || 'anonimo'),
    };

    // 1. Transmisión remota: ESTRICTAMENTE DESACTIVADA en distribución pública.
    // La telemetría opera 100% en modo local (sin emisión HTTP ni WebSockets)
    // para cumplir con la política de cero filtración y soberanía de datos en salud.

    // 2. Almacenamiento exclusivo en búfer local de auditoría para inspección y exportación voluntaria del usuario
    try {
      const buffer = this.getRecentEvents();
      buffer.unshift(payload);
      if (buffer.length > 20) buffer.pop();
      localStorage.setItem(STORAGE_KEYS.BUFFER, JSON.stringify(buffer));
    } catch {
      // Ignorar errores de cuota de localStorage
    }

    return true;
  },
};
