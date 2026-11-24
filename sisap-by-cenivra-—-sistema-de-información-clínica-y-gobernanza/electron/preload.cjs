/**
 * SISAP by CENIVRA — Preload script para Electron
 *
 * Principios de seguridad aplicados:
 *  - contextIsolation activado (aislamiento estricto de contexto)
 *  - nodeIntegration desactivado
 *  - Sin exposición de fs, child_process ni comandos arbitrarios de sistema
 *  - Solo puente IPC mínimo, tipado y auditado mediante contextBridge
 */
const { contextBridge, ipcRenderer } = require('electron');

const apiBaseArg =
  typeof process !== 'undefined' && Array.isArray(process.argv)
    ? process.argv.find((arg) => typeof arg === 'string' && arg.startsWith('--sisap-api-base='))
    : undefined;
const resolvedApiBase = apiBaseArg
  ? apiBaseArg.slice('--sisap-api-base='.length)
  : 'http://127.0.0.1:8080/api';

contextBridge.exposeInMainWorld('sisapDesktop', {
  isDesktop: true,
  platform: process.platform,
  apiBase: resolvedApiBase,
  openExternal: (url) => ipcRenderer.invoke('sisap:open-external', url),
  getBackendInfo: () => ipcRenderer.invoke('sisap:get-backend-info'),
  createDbBackup: () => ipcRenderer.invoke('sisap:create-db-backup'),
  listDbBackups: () => ipcRenderer.invoke('sisap:list-db-backups'),
  openDataDir: (target) => ipcRenderer.invoke('sisap:open-data-dir', target),
  readDesktopLog: () => ipcRenderer.invoke('sisap:read-desktop-log'),
  closeApp: () => ipcRenderer.invoke('sisap:close-app'),
});
