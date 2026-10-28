/**
 * SISAP by CENIVRA — Preload script para Electron
 *
 * Principios de seguridad aplicados:
 *  - contextIsolation activado (aislamiento estricto de contexto)
 *  - nodeIntegration desactivado
 *  - Sin exposición de fs, child_process ni comandos de sistema
 *  - Solo puente mínimo y seguro mediante contextBridge
 */
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('sisapDesktop', {
  isDesktop: true,
  platform: process.platform,
  openExternal: (url) => ipcRenderer.invoke('sisap:open-external', url),
  getBackendInfo: () => ipcRenderer.invoke('sisap:get-backend-info'),
  closeApp: () => ipcRenderer.invoke('sisap:close-app'),
});
