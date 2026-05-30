// preset-manager.js — Quản lý preset cấu hình của riêng app (lưu tách biệt, không đụng config tool)
const fs = require('fs');
const path = require('path');
const os = require('os');

const APP_DIR = path.join(os.homedir(), '.lyno-aio');
const PRESET_FILE = path.join(APP_DIR, 'presets.json');

function ensureDir() { if (!fs.existsSync(APP_DIR)) fs.mkdirSync(APP_DIR, { recursive: true }); }

// Preset mặc định: TRỐNG. App deploy ra ngoài KHÔNG mang data local của Lyno.
// User tu them preset cua minh qua tab "Preset".
const SEED = [];

function load() {
  ensureDir();
  if (!fs.existsSync(PRESET_FILE)) {
    fs.writeFileSync(PRESET_FILE, JSON.stringify({ presets: SEED }, null, 2), 'utf8');
    return { presets: SEED };
  }
  try { return JSON.parse(fs.readFileSync(PRESET_FILE, 'utf8')); }
  catch { return { presets: SEED }; }
}

function save(data) {
  ensureDir();
  fs.writeFileSync(PRESET_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function listPresets() {
  return load().presets || [];
}

function upsertPreset(p) {
  const data = load();
  data.presets = data.presets || [];
  const slug = (s) => (s || 'preset').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
  if (!p.id) p.id = 'preset-' + slug(p.name) + '-' + Date.now().toString(36);
  const idx = data.presets.findIndex(x => x.id === p.id);
  // nếu set làm default thì bỏ default các preset khác
  if (p.isDefault) data.presets.forEach(x => { x.isDefault = false; });
  const entry = {
    id: p.id, name: p.name, baseUrl: p.baseUrl, provider: p.provider || 'generic-chat-completion-api',
    model: p.model || '', apiKey: p.apiKey || '', isDefault: !!p.isDefault, builtin: p.builtin || false
  };
  if (idx >= 0) entry.builtin = data.presets[idx].builtin || false, data.presets[idx] = entry;
  else data.presets.push(entry);
  save(data);
  return { ok: true, preset: entry };
}

function deletePreset(id) {
  const data = load();
  data.presets = (data.presets || []).filter(x => x.id !== id);
  save(data);
  return { ok: true };
}

function setDefault(id) {
  const data = load();
  data.presets = (data.presets || []).map(x => ({ ...x, isDefault: x.id === id }));
  save(data);
  return { ok: true };
}

function getDefault() {
  return (load().presets || []).find(x => x.isDefault) || null;
}

module.exports = { listPresets, upsertPreset, deletePreset, setDefault, getDefault, PRESET_FILE };
