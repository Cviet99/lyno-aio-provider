// config-writer.js — Them/sua/xoa provider cho tung tool
const fs = require('fs');
const path = require('path');
const TOML = require('@iarna/toml');
const { TOOLS } = require('./tools-registry');
const { readFileSafe, parseJsonc, writeJson, backup, ensureDir } = require('./config-manager');

// payload: { displayName, model, baseUrl, apiKey, provider, maxOutputTokens, key(id), models[] }
function upsertProvider(toolId, payload) {
  const tool = TOOLS[toolId];
  if (!tool) return { ok: false, error: 'Unknown tool' };

  try {
    switch (tool.schema) {
      case 'droid': return writeDroid(tool, payload);
      case 'opencode': return writeOpencode(tool, payload);
      case 'codex': return writeCodex(tool, payload);
      case 'claudecli': return writeClaudeCli(tool, payload);
      case 'gemini': return writeGemini(tool, payload);
      case 'claudedesktop': return writeClaudeDesktop(tool, payload);
      case 'warp': return writeWarp(tool, payload);
      default: return { ok: false, error: 'Schema chưa hỗ trợ' };
    }
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

function deleteProvider(toolId, providerKey) {
  const tool = TOOLS[toolId];
  if (!tool) return { ok: false, error: 'Unknown tool' };
  try {
    const raw = readFileSafe(tool.configPath);
    if (!raw) return { ok: false, error: 'Config không tồn tại' };

    switch (tool.schema) {
      case 'droid': {
        const cfg = JSON.parse(raw);
        cfg.customModels = (cfg.customModels || []).filter(m => m.model !== providerKey);
        writeJson(tool.configPath, cfg);
        return { ok: true };
      }
      case 'opencode': {
        const cfg = parseJsonc(raw);
        if (cfg.provider) delete cfg.provider[providerKey];
        writeJson(tool.configPath, cfg);
        return { ok: true };
      }
      case 'codex': {
        const cfg = TOML.parse(raw);
        if (cfg.model_providers) delete cfg.model_providers[providerKey];
        backup(tool.configPath);
        fs.writeFileSync(tool.configPath, TOML.stringify(cfg), 'utf8');
        return { ok: true };
      }
      case 'claudecli': {
        const cfg = JSON.parse(raw);
        if (cfg.env) {
          delete cfg.env.ANTHROPIC_BASE_URL;
          delete cfg.env.ANTHROPIC_API_KEY;
          delete cfg.env.ANTHROPIC_AUTH_TOKEN;
          delete cfg.env.ANTHROPIC_MODEL;
        }
        writeJson(tool.configPath, cfg);
        return { ok: true };
      }
      case 'claudedesktop': {
        // Neu key la 'lyno-llm-proxy' -> xoa launcher .bat
        if (providerKey === 'lyno-llm-proxy') {
          if (fs.existsSync(tool.launcherPath)) {
            backup(tool.launcherPath);
            fs.unlinkSync(tool.launcherPath);
          }
          return { ok: true };
        }
        const cfg = JSON.parse(raw);
        if (cfg.mcpServers) delete cfg.mcpServers[providerKey];
        writeJson(tool.configPath, cfg);
        return { ok: true };
      }
      case 'warp': {
        const cfg = TOML.parse(raw);
        if (cfg.llm && cfg.llm.custom_endpoints) delete cfg.llm.custom_endpoints[providerKey];
        backup(tool.configPath);
        fs.writeFileSync(tool.configPath, TOML.stringify(cfg), 'utf8');
        return { ok: true };
      }
      default: return { ok: false, error: 'Schema chưa hỗ trợ xoá' };
    }
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

// --- Writers per tool ---
function writeDroid(tool, p) {
  const raw = readFileSafe(tool.configPath);
  const cfg = raw ? JSON.parse(raw) : {};
  if (!Array.isArray(cfg.customModels)) cfg.customModels = [];
  const entry = {
    model: p.model,
    displayName: p.displayName || p.model,
    baseUrl: p.baseUrl,
    apiKey: p.apiKey,
    provider: p.provider || 'generic-chat-completion-api',
    maxOutputTokens: p.maxOutputTokens || 16384
  };
  if (p.extraHeaders) entry.extraHeaders = p.extraHeaders;
  const idx = cfg.customModels.findIndex(m => m.model === (p.originalKey || p.model));
  if (idx >= 0) cfg.customModels[idx] = entry; else cfg.customModels.push(entry);
  writeJson(tool.configPath, cfg);
  return { ok: true };
}

function writeOpencode(tool, p) {
  const raw = readFileSafe(tool.configPath);
  const cfg = raw ? parseJsonc(raw) : { "$schema": "https://opencode.ai/config.json" };
  if (!cfg.provider) cfg.provider = {};
  const id = p.key || slug(p.displayName || p.model);
  const models = {};
  (p.models && p.models.length ? p.models : [p.model]).forEach(m => { models[m] = { name: m }; });
  cfg.provider[id] = {
    name: p.displayName || id,
    npm: p.npm || '@ai-sdk/openai-compatible',
    options: { baseURL: p.baseUrl, ...(p.apiKey ? { apiKey: p.apiKey } : {}) },
    models
  };
  writeJson(tool.configPath, cfg);
  return { ok: true };
}

function writeCodex(tool, p) {
  const raw = readFileSafe(tool.configPath);
  const cfg = raw ? TOML.parse(raw) : {};
  if (!cfg.model_providers) cfg.model_providers = {};
  const id = p.key || slug(p.displayName || p.model);
  cfg.model_providers[id] = {
    name: p.displayName || id,
    base_url: p.baseUrl,
    wire_api: p.wireApi || 'chat',
    ...(p.envKey ? { env_key: p.envKey } : {})
  };
  if (p.setActive && p.model) { cfg.model = p.model; cfg.model_provider = id; }
  backup(tool.configPath);
  ensureDir(tool.configPath);
  fs.writeFileSync(tool.configPath, TOML.stringify(cfg), 'utf8');
  return { ok: true, note: p.apiKey ? 'Codex đọc API key từ env_key/auth.json, không lưu trong config.toml' : undefined };
}

function writeClaudeCli(tool, p) {
  const raw = readFileSafe(tool.configPath);
  const cfg = raw ? JSON.parse(raw) : {};
  if (!cfg.env) cfg.env = {};

  // Base URL (proxy hoac de trong de dung https://api.anthropic.com)
  if (p.baseUrl) cfg.env.ANTHROPIC_BASE_URL = p.baseUrl;
  else delete cfg.env.ANTHROPIC_BASE_URL;

  // Auth mode: 'token' = AUTH_TOKEN (proxy/3rd-party), 'key' = API_KEY (Anthropic native)
  // Mac dinh: neu co baseUrl khac api.anthropic.com -> token; neu khong -> key
  const authMode = p.authMode || (p.baseUrl && !/api\.anthropic\.com/i.test(p.baseUrl) ? 'token' : 'key');
  if (p.apiKey) {
    if (authMode === 'token') {
      cfg.env.ANTHROPIC_AUTH_TOKEN = p.apiKey;
      delete cfg.env.ANTHROPIC_API_KEY;
    } else {
      cfg.env.ANTHROPIC_API_KEY = p.apiKey;
      delete cfg.env.ANTHROPIC_AUTH_TOKEN;
    }
  }

  // Model chinh + sub-models (Claude Code dung sonnet/haiku rieng cho task nhe)
  if (p.model) cfg.env.ANTHROPIC_MODEL = p.model;
  if (p.smallFastModel) cfg.env.ANTHROPIC_SMALL_FAST_MODEL = p.smallFastModel;
  else if (p.smallFastModel === '') delete cfg.env.ANTHROPIC_SMALL_FAST_MODEL;
  if (p.defaultOpusModel) cfg.env.ANTHROPIC_DEFAULT_OPUS_MODEL = p.defaultOpusModel;
  if (p.defaultSonnetModel) cfg.env.ANTHROPIC_DEFAULT_SONNET_MODEL = p.defaultSonnetModel;
  if (p.defaultHaikuModel) cfg.env.ANTHROPIC_DEFAULT_HAIKU_MODEL = p.defaultHaikuModel;

  writeJson(tool.configPath, cfg);
  return { ok: true, note: authMode === 'token' ? 'Đã ghi ANTHROPIC_AUTH_TOKEN (proxy mode)' : 'Đã ghi ANTHROPIC_API_KEY (Anthropic native)' };
}

function writeGemini(tool, p) {
  // Gemini CLI custom endpoint qua .env
  const envPath = tool.envPath;
  let envRaw = readFileSafe(envPath) || '';
  const setEnv = (k, v) => {
    const re = new RegExp('^' + k + '=.*$', 'm');
    if (re.test(envRaw)) envRaw = envRaw.replace(re, k + '=' + v);
    else envRaw += (envRaw.endsWith('\n') || !envRaw ? '' : '\n') + k + '=' + v + '\n';
  };
  if (p.baseUrl) setEnv('OPENAI_BASE_URL', p.baseUrl);
  if (p.apiKey) setEnv('OPENAI_API_KEY', p.apiKey);
  ensureDir(envPath); backup(envPath);
  fs.writeFileSync(envPath, envRaw, 'utf8');
  return { ok: true, note: 'Gemini CLI: dùng OPENAI_BASE_URL cho OpenAI-compatible mode' };
}

function writeClaudeDesktop(tool, p) {
  // 2 mode: 'llm-proxy' (tao launcher .bat) hoac 'mcp' (default - them MCP server)
  const mode = p.mode || (p.command ? 'mcp' : (p.baseUrl ? 'llm-proxy' : 'mcp'));

  if (mode === 'llm-proxy') {
    // Tao launcher .bat: set env -> start Claude.exe
    const exe = (tool.appExeCandidates || []).find(x => fs.existsSync(x)) || (tool.appExeCandidates || [])[0];
    if (!exe) return { ok: false, error: 'Không tìm thấy Claude.exe' };
    const lines = [
      '@echo off',
      'REM Lyno AIO Provider - Claude Desktop LLM proxy launcher',
      'REM Tu sinh, set env truoc khi chay Claude.exe'
    ];
    if (p.baseUrl) lines.push('set "ANTHROPIC_BASE_URL=' + p.baseUrl + '"');
    if (p.apiKey) lines.push('set "ANTHROPIC_AUTH_TOKEN=' + p.apiKey + '"');
    if (p.model) lines.push('set "ANTHROPIC_MODEL=' + p.model + '"');
    lines.push('start "" "' + exe + '"');
    ensureDir(tool.launcherPath);
    if (fs.existsSync(tool.launcherPath)) backup(tool.launcherPath);
    fs.writeFileSync(tool.launcherPath, lines.join('\r\n') + '\r\n', 'utf8');
    return {
      ok: true,
      note: 'Đã tạo launcher: ' + tool.launcherPath + '. Chạy file này thay vì Claude.exe gốc để route qua proxy.'
    };
  }

  // MCP mode (default)
  const raw = readFileSafe(tool.configPath);
  const cfg = raw ? JSON.parse(raw) : {};
  if (!cfg.mcpServers) cfg.mcpServers = {};
  const id = p.key || slug(p.displayName);
  cfg.mcpServers[id] = {
    command: p.command,
    args: p.args ? (Array.isArray(p.args) ? p.args : p.args.split(' ').filter(Boolean)) : []
  };
  if (p.envVars) cfg.mcpServers[id].env = p.envVars;
  writeJson(tool.configPath, cfg);
  return { ok: true };
}

// Warp BYOK / Custom Inference Endpoint
// Luu endpoint URL + model identifier vao settings.toml [llm.custom_endpoints]
// API key se duoc user dan qua Warp Settings (keychain)
function writeWarp(tool, p) {
  const raw = readFileSafe(tool.configPath);
  const cfg = raw ? TOML.parse(raw) : {};
  if (!cfg.llm) cfg.llm = {};
  if (!cfg.llm.custom_endpoints) cfg.llm.custom_endpoints = {};
  const id = p.key || slug(p.displayName || p.model);
  cfg.llm.custom_endpoints[id] = {
    name: p.displayName || id,
    base_url: p.baseUrl,
    model: p.model,
    ...(p.modelDisplayName ? { display_name: p.modelDisplayName } : {})
  };
  ensureDir(tool.configPath); backup(tool.configPath);
  fs.writeFileSync(tool.configPath, TOML.stringify(cfg), 'utf8');
  return {
    ok: true,
    note: 'Đã ghi endpoint vào settings.toml. Mở Warp -> Settings -> search "inference endpoint" hoặc "API keys" để dán API key (Warp lưu key trong Windows Credential Manager).'
  };
}

function slug(s) {
  return (s || 'provider').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
}

module.exports = { upsertProvider, deleteProvider };
