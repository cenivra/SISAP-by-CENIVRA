/**
 * Errores controlados del backend.
 *
 * Regla: los errores internos (SQL, rutas, stack) NUNCA se envían al cliente.
 * Se expone un código estable + mensaje genérico; el detalle queda en el log
 * del servidor (ya redactado por el logger).
 */

export class AppError extends Error {
  constructor(code, publicMessage, httpStatus = 400, internal = undefined) {
    super(publicMessage);
    this.name = 'AppError';
    this.code = code;
    this.publicMessage = publicMessage;
    this.httpStatus = httpStatus;
    this.internal = internal;
  }
}

export const Errors = {
  badRequest: (msg = 'Solicitud inválida.') => new AppError('BAD_REQUEST', msg, 400),
  unauthorized: (msg = 'No autorizado.') => new AppError('UNAUTHORIZED', msg, 401),
  forbidden: (msg = 'Acceso denegado.') => new AppError('FORBIDDEN', msg, 403),
  notFound: (msg = 'Recurso no encontrado.') => new AppError('NOT_FOUND', msg, 404),
  conflict: (msg = 'Conflicto con un registro existente.') => new AppError('CONFLICT', msg, 409),
  tooMany: (msg = 'Demasiadas solicitudes.') => new AppError('RATE_LIMITED', msg, 429),
  internal: (internal) => new AppError('INTERNAL_ERROR', 'Error interno del servidor.', 500, internal),
};

/**
 * Convierte cualquier error en una respuesta segura para el cliente.
 */
export function toSafeResponse(err) {
  if (err instanceof AppError) {
    return { status: err.httpStatus, body: { error: err.code, message: err.publicMessage } };
  }
  return { status: 500, body: { error: 'INTERNAL_ERROR', message: 'Error interno del servidor.' } };
}
