// preload.js — IPC bridge an toan (contextIsolation)
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('lyno', {
  listTools: () => ipcRenderer.invoke('tools:list'),
  readTool: (toolId) => ipcRenderer.invoke('tool:read', toolId),
  upsert: (toolId, payload) => ipcRenderer.invoke('tool:upsert', toolId, payload),
  remove: (toolId, key) => ipcRenderer.invoke('tool:delete', toolId, key),
  testEndpoint: (cfg) => ipcRenderer.invoke('tool:testEndpoint', cfg),
  // skills
  listSkills: (toolId) => ipcRenderer.invoke('skills:list', toolId),
  readSkill: (toolId, name) => ipcRenderer.invoke('skills:read', toolId, name),
  saveSkill: (toolId, name, content) => ipcRenderer.invoke('skills:save', toolId, name, content),
  deleteSkill: (toolId, name) => ipcRenderer.invoke('skills:delete', toolId, name),
  // util
  openExternal: (url) => ipcRenderer.invoke('openExternal', url),
  openPath: (p) => ipcRenderer.invoke('openPath', p),
  // presets (riêng của app)
  listPresets: () => ipcRenderer.invoke('preset:list'),
  savePreset: (p) => ipcRenderer.invoke('preset:upsert', p),
  deletePreset: (id) => ipcRenderer.invoke('preset:delete', id),
  setDefaultPreset: (id) => ipcRenderer.invoke('preset:setDefault', id),
  getDefaultPreset: () => ipcRenderer.invoke('preset:getDefault'),
  // window controls (frameless)
  winMinimize: () => ipcRenderer.invoke('win:minimize'),
  winMaximize: () => ipcRenderer.invoke('win:maximize'),
  winClose: () => ipcRenderer.invoke('win:close')
});
