/**
 * Servidor HTTP local de SISAP (solo pruebas).
 *
 * - Escucha SOLO en loopback (127.0.0.1) salvo override explícito.
 * - Sin dependencias externas: node:http + node:sqlite.
 * - Errores controlados: nunca filtra SQL, rutas ni stack al cliente.
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { config, getDbPath } from './config.js';
import { openDatabase, closeDatabase } from './db/index.js';
import { route } from './routes/index.js';
import { logger } from './utils/logger.js';
import { toSafeResponse } from './utils/errors.js';
import {
  applyCors,
  loopbackOnly,
  verifyOrigin,
  rateLimit,
  readJsonBody,
} from './middleware/security.js';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
};

function serveStatic(res, pathname) {
  const distDir = path.join(config.appRoot, 'dist');
  if (!fs.existsSync(distDir)) return false;

  let filePath = path.join(distDir, pathname === '/' ? 'index.html' : pathname.replace(/^\//, ''));
  if (!filePath.startsWith(distDir)) return false;

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  if (!fs.existsSync(filePath)) {
    filePath = path.join(distDir, 'index.html');
    if (!fs.existsSync(filePath)) return false;
  }

  const ext = path.extname(filePath).toLowerCase();
  const mime = MIME_TYPES[ext] || 'application/octet-stream';

  res.writeHead(200, {
    'Content-Type': mime,
    'X-Content-Type-Options': 'nosniff',
    'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable',
  });
  fs.createReadStream(filePath).pipe(res);
  return true;
}

function send(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload),
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
    'Cache-Control': 'no-store',
  });
  res.end(payload);
}

const handler = async (req, res) => {
  try {
    loopbackOnly(req);
    applyCors(req, res);

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    rateLimit(req);
    verifyOrigin(req);

    const url = new URL(req.url, `http://${req.headers.host || '127.0.0.1'}`);
    const pathname = url.pathname;
    const query = url.searchParams;

    if (req.method === 'GET' && !pathname.startsWith('/api')) {
      const served = serveStatic(res, pathname);
      if (served) return;
    }

    let body = {};
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
      body = await readJsonBody(req);
    }

    const result = await route({ method: req.method, pathname, query, body });
    if (!result) {
      return send(res, 404, { error: 'NOT_FOUND', message: 'Ruta no encontrada.' });
    }
    return send(res, result.status, result.body);
  } catch (err) {
    const safe = toSafeResponse(err);
    // Detalle interno solo al log del servidor (ya redactado).
    logger.error('error en solicitud', {
      code: err?.code || 'UNEXPECTED',
      internal: err?.internal || err?.message,
    });
    return send(res, safe.status, safe.body);
  }
};

export function createServer() {
  return http.createServer(handler);
}

export function startServer() {
  openDatabase();
  const server = createServer();
  server.listen(config.port, config.host, () => {
    logger.info('backend local iniciado', {
      host: config.host,
      port: config.port,
      db: getDbPath(),
      notaLoopback: config.host === '127.0.0.1' || config.host === 'localhost',
    });
  });
  return server;
}

// Arranque directo
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('server.js')) {
  const server = startServer();
  const shutdown = () => {
    logger.info('deteniendo backend local');
    server.close(() => {
      closeDatabase();
      process.exit(0);
    });
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}
