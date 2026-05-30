// config-manager.js — Doc/ghi config cho tung tool theo dung schema
const fs = require('fs');
const path = require('path');
const TOML = require('@iarna/toml');
const { TOOLS } = require('./tools-registry');

// --- Helpers ---
function readFileSafe(p) {
  try { return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null; }
  catch (e) { return null; }
}
function ensureDir(p) {
  const dir = path.dirname(p);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}
function backup(p) {
  if (fs.existsSync(p)) {
    const bak = p + '.lyno-bak';
    try { fs.copyFileSync(p, bak); } catch (e) {}
  }
}
// JSONC: strip comments truoc khi parse
function parseJsonc(text) {
  if (!text) return {};
  const noComments = text
    .replace(/\\"|"(?:\\"|[^"])*"|(\/\/[^\n\r]*|\/\*[\s\S]*?\*\/)/g, (m, g) => g ? '' : m);
  try { return JSON.parse(noComments); } catch (e) { return JSON.parse(text); }
}
function writeJson(p, obj) {
  ensureDir(p); backup(p);
  fs.writeFileSync(p, JSON.stringify(obj, null, 2), 'utf8');
}

// --- READ: tra ve danh sach providers/models tu config hien tai ---
function readProviders(toolId) {
  const tool = TOOLS[toolId];
  if (!tool) return { error: 'Unknown tool', providers: [] };
  const raw = readFileSafe(tool.configPath);
  const exists = raw !== null;

  switch (tool.schema) {
    case 'droid': {
      const cfg = raw ? JSON.parse(raw) : {};
      const list = (cfg.customModels || []).map(m => ({
        key: m.model,
        displayName: m.displayName || m.model,
        model: m.model,
        baseUrl: m.baseUrl,
        provider: m.provider,
        apiKey: maskKey(m.apiKey),
        apiKeyRaw: m.apiKey,
        maxOutputTokens: m.maxOutputTokens
      }));
      return { exists, configPath: tool.configPath, providers: list };
    }
    case 'opencode': {
      const cfg = raw ? parseJsonc(raw) : {};
      const provObj = cfg.provider || {};
      const list = Object.entries(provObj).map(([id, p]) => ({
        key: id,
        displayName: p.name || id,
        npm: p.npm,
        baseUrl: p.options && p.options.baseURL,
        apiKey: maskKey(p.options && p.options.apiKey),
        apiKeyRaw: p.options && p.options.apiKey,
        models: Object.keys(p.models || {})
      }));
      return { exists, configPath: tool.configPath, providers: list };
    }
    case 'codex': {
      const cfg = raw ? TOML.parse(raw) : {};
      const mp = cfg.model_providers || {};
      const list = Object.entries(mp).map(([id, p]) => ({
        key: id,
        displayName: p.name || id,
        baseUrl: p.base_url,
        wireApi: p.wire_api,
        envKey: p.env_key,
        models: []
      }));
      return { exists, configPath: tool.configPath, activeModel: cfg.model, providers: list };
    }
    case 'claudecli': {
      const cfg = raw ? JSON.parse(raw) : {};
      const env = cfg.env || {};
      const list = [];
      const hasAny = env.ANTHROPIC_BASE_URL || env.ANTHROPIC_API_KEY || env.ANTHROPIC_AUTH_TOKEN || env.ANTHROPIC_MODEL;
      if (hasAny) {
        const usingToken = !!env.ANTHROPIC_AUTH_TOKEN;
        const rawKey = env.ANTHROPIC_AUTH_TOKEN || env.ANTHROPIC_API_KEY;
        const baseUrl = env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com (default)';
        const isProxy = env.ANTHROPIC_BASE_URL && !/api\.anthropic\.com/i.test(env.ANTHROPIC_BASE_URL);
        list.push({
          key: 'custom-endpoint',
          displayName: isProxy ? 'Proxy Endpoint' : 'Anthropic Native',
          baseUrl,
          apiKey: maskKey(rawKey),
          apiKeyRaw: rawKey,
          authMode: usingToken ? 'token' : 'key',
          model: env.ANTHROPIC_MODEL,
          smallFastModel: env.ANTHROPIC_SMALL_FAST_MODEL,
          defaultOpusModel: env.ANTHROPIC_DEFAULT_OPUS_MODEL,
          defaultSonnetModel: env.ANTHROPIC_DEFAULT_SONNET_MODEL,
          defaultHaikuModel: env.ANTHROPIC_DEFAULT_HAIKU_MODEL,
          provider: usingToken ? 'auth-token' : 'api-key'
        });
      }
      return { exists, configPath: tool.configPath, providers: list, env };
    }
    case 'gemini': {
      const cfg = raw ? JSON.parse(raw) : {};
      const envRaw = readFileSafe(tool.envPath);
      const list = [];
      if (cfg.security && cfg.security.auth) {
        list.push({ key: 'auth', displayName: 'Auth Config', authType: cfg.security.auth.selectedType });
      }
      // parse .env de tim custom endpoint
      if (envRaw) {
        const baseUrl = (envRaw.match(/(?:GOOGLE_GEMINI_BASE_URL|OPENAI_BASE_URL)=(.+)/) || [])[1];
        const apiKey = (envRaw.match(/(?:GEMINI_API_KEY|OPENAI_API_KEY|GOOGLE_API_KEY)=(.+)/) || [])[1];
        if (baseUrl || apiKey) {
          list.push({ key: 'env-endpoint', displayName: 'Env Endpoint', baseUrl: baseUrl || 'default', apiKey: maskKey(apiKey), apiKeyRaw: apiKey });
        }
      }
      return { exists, configPath: tool.configPath, providers: list };
    }
    case 'claudedesktop': {
      const cfg = raw ? JSON.parse(raw) : {};
      const mcp = cfg.mcpServers || {};
      const list = Object.entries(mcp).map(([id, s]) => ({
        key: id, displayName: id, command: s.command, args: (s.args || []).join(' '), type: 'mcp'
      }));
      // Doc launcher .bat (LLM proxy) neu co
      const launcher = readFileSafe(tool.launcherPath);
      if (launcher) {
        const baseUrl = (launcher.match(/ANTHROPIC_BASE_URL=([^"\r\n]+)/) || [])[1];
        const token = (launcher.match(/ANTHROPIC_AUTH_TOKEN=([^"\r\n]+)/) || [])[1];
        const model = (launcher.match(/ANTHROPIC_MODEL=([^"\r\n]+)/) || [])[1];
        if (baseUrl || token || model) {
          list.unshift({
            key: 'lyno-llm-proxy',
            displayName: 'LLM Proxy (launcher)',
            baseUrl: baseUrl || 'default',
            apiKey: maskKey(token),
            apiKeyRaw: token,
            model,
            type: 'llm-proxy',
            launcherPath: tool.launcherPath
          });
        }
      }
      return { exists, configPath: tool.configPath, providers: list, note: tool.note };
    }
    case 'warp': {
      const cfg = raw ? TOML.parse(raw) : {};
      const ep = (cfg.llm && cfg.llm.custom_endpoints) || {};
      const list = Object.entries(ep).map(([id, e]) => ({
        key: id,
        displayName: e.name || id,
        baseUrl: e.base_url,
        model: e.model,
        modelDisplayName: e.display_name,
        type: 'custom-endpoint',
        apiKey: '(luu trong Windows Credential Manager)',
        apiKeyRaw: ''
      }));
      return { exists: fs.existsSync(tool.configPath), configPath: tool.configPath, providers: list, note: tool.note };
    }
    default:
      return { exists, configPath: tool.configPath, providers: [] };
  }
}

function maskKey(k) {
  if (!k || typeof k !== 'string') return k;
  if (k.startsWith('${')) return k; // env var reference
  if (k.length <= 12) return k.slice(0, 3) + '***';
  return k.slice(0, 8) + '...' + k.slice(-4);
}

module.exports = { readProviders, readFileSafe, parseJsonc, writeJson, backup, ensureDir, maskKey, TOML };
