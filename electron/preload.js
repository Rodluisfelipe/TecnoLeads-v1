// TecnoLeads - Electron Preload Script
// Puente seguro entre el proceso principal y el renderer

const { contextBridge, ipcRenderer } = require('electron');

// Exponer APIs seguras al renderer
contextBridge.exposeInMainWorld('electron', {
  // Información de la app
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getBackendUrl: () => ipcRenderer.invoke('get-backend-url'),
  
  // Sistema de archivos
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
  showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),
  
  // Enlaces externos
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  
  // Utilidades de desarrollo
  clearStorage: () => {
    localStorage.clear();
    sessionStorage.clear();
    console.log('✅ Storage limpiado');
  },
  
  // Identificar que estamos en Electron
  isElectron: true,
  platform: process.platform,
});

console.log('🔌 Preload script cargado');
