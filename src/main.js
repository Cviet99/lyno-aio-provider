// main.js — Electron main process
const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { TOOLS } = require('./tools-registry');
const { readProviders } = require('./config-manager');
const { upsertProvider, deleteProvider } = require('./config-writer');
const skills = require('./skills-manager');
const presets = require('./preset-manager');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1120,
    height: 760,
    minWidth: 920,
    minHeight: 640,
    backgroundColor: '#050B1A',
    transparent: false,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  // Debug: log renderer errors to file (outside asar)
  const logPath = path.join(app.getPath('userData'), 'debug-renderer.log');
  mainWindow.webContents.on('console-message', (ev, level, msg, line, src) => {
    if (level < 2) return; // only warn + error
    const ts = new Date().toISOString();
    const lvl = ['V','I','W','E'][level] || '?';
    fs.appendFileSync(logPath, `[${ts}][${lvl}] ${msg} (${src}:${line})\n`);
  });
  mainWindow.webContents.on('did-fail-load', (ev, code, desc) => {
    fs.appendFileSync(logPath, `[FAIL-LOAD] code=${code} desc=${desc}\n`);
  });
  // Open devtools in dev mode
  if (process.argv.includes('--dev')) mainWindow.webContents.openDevTools();
}

app.whenReady().then(createWindow);

// Window controls (frameless)
ipcMain.handle('win:minimize', () => mainWindow.minimize());
ipcMain.handle('win:maximize', () => { mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize(); });
ipcMain.handle('win:close', () => mainWindow.close());
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });

// --- IPC handlers ---
ipcMain.handle('tools:list', () => {
  return Object.values(TOOLS).map(t => ({
    id: t.id, name: t.name, vendor: t.vendor, desc: t.desc,
    format: t.format, accent: t.accent, supported: t.supported,
    note: t.note, docs: t.docs, providers: t.providers,
    configPath: t.configPath, exists: fs.existsSync(t.configPath)
  }));
});

ipcMain.handle('tool:read', (e, toolId) => readProviders(toolId));
ipcMain.handle('tool:upsert', (e, toolId, payload) => upsertProvider(toolId, payload));
ipcMain.handle('tool:delete', (e, toolId, key) => deleteProvider(toolId, key));

ipcMain.handle('tool:testEndpoint', async (e, { baseUrl, apiKey, provider, model }) => {
  return await testEndpoint({ baseUrl, apiKey, provider, model });
});

ipcMain.handle('skills:list', (e, toolId) => skills.listSkills(toolId));
ipcMain.handle('skills:read', (e, toolId, name) => skills.readSkill(toolId, name));
ipcMain.handle('skills:save', (e, toolId, name, content) => skills.saveSkill(toolId, name, content));
ipcMain.handle('skills:delete', (e, toolId, name) => skills.deleteSkill(toolId, name));

ipcMain.handle('openExternal', (e, url) => shell.openExternal(url));
ipcMain.handle('openPath', (e, p) => shell.showItemInFolder(p));

// --- Preset handlers (lưu riêng của app, tách biệt config tool) ---
ipcMain.handle('preset:list', () => presets.listPresets());
ipcMain.handle('preset:upsert', (e, p) => presets.upsertPreset(p));
ipcMain.handle('preset:delete', (e, id) => presets.deletePreset(id));
ipcMain.handle('preset:setDefault', (e, id) => presets.setDefault(id));
ipcMain.handle('preset:getDefault', () => presets.getDefault());

// --- Endpoint health check ---
async function testEndpoint({ baseUrl, apiKey, provider, model }) {
  const https = require('https');
  const http = require('http');
  try {
    let url, body, headers = { 'Content-Type': 'application/json' };
    const cleanBase = (baseUrl || '').replace(/\/$/, '');

    // 'anthropic-native' / 'anthropic' / 'auth-token' / 'api-key' -> Anthropic /v1/messages
    const isAnthropic = /^(anthropic|auth-token|api-key)/i.test(provider || '');
    if (isAnthropic) {
      // Neu cleanBase chua ket thuc bang /v1 thi them /v1
      const base = /\/v1$/.test(cleanBase) ? cleanBase : (cleanBase + '/v1');
      url = base + '/messages';
      headers['x-api-key'] = apiKey;
      headers['anthropic-version'] = '2023-06-01';
      body = JSON.stringify({ model: model || 'claude-3-5-sonnet-latest', max_tokens: 5, messages: [{ role: 'user', content: 'hi' }] });
    } else {
      url = cleanBase + '/chat/completions';
      headers['Authorization'] = 'Bearer ' + apiKey;
      body = JSON.stringify({ model: model || 'gpt-4o', max_tokens: 5, messages: [{ role: 'user', content: 'hi' }] });
    }

    const lib = url.startsWith('https') ? https : http;
    return await new Promise((resolve) => {
      const u = new URL(url);
      const req = lib.request({
        hostname: u.hostname, port: u.port, path: u.pathname + u.search,
        method: 'POST', headers, timeout: 12000
      }, (res) => {
        let data = '';
        res.on('data', c => { data += c; if (data.length > 2000) req.destroy(); });
        res.on('end', () => {
          const ok = res.statusCode >= 200 && res.statusCode < 300;
          resolve({ ok, status: res.statusCode, sample: data.slice(0, 300), endpoint: url });
        });
      });
      req.on('error', (err) => resolve({ ok: false, error: err.message, endpoint: url }));
      req.on('timeout', () => { req.destroy(); resolve({ ok: false, error: 'Timeout 12s', endpoint: url }); });
      req.write(body);
      req.end();
    });
  } catch (e) {
    return { ok: false, error: e.message };
  }
}
