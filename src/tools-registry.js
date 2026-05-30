// tools-registry.js — Dinh nghia tat ca AI IDE/CLI tools va config paths
const path = require('path');
const os = require('os');

const HOME = os.homedir();
const APPDATA = process.env.APPDATA || path.join(HOME, 'AppData', 'Roaming');
const LOCALAPPDATA = process.env.LOCALAPPDATA || path.join(HOME, 'AppData', 'Local');

// Moi tool: id, ten, mo ta, format config, duong dan, kieu schema
const TOOLS = {
  droid: {
    id: 'droid',
    name: 'Droid CLI',
    vendor: 'Factory',
    desc: 'Factory Droid CLI - BYOK custom models',
    format: 'json',
    accent: '#FF6B35',
    configPath: path.join(HOME, '.factory', 'settings.local.json'),
    altPaths: [path.join(HOME, '.factory', 'settings.json'), path.join(HOME, '.factory', 'config.json')],
    schema: 'droid',
    docs: 'https://docs.factory.ai/bring-your-own-key/overview',
    providers: ['anthropic', 'openai', 'generic-chat-completion-api'],
    supported: true
  },
  opencode: {
    id: 'opencode',
    name: 'OpenCode',
    vendor: 'OpenCode AI',
    desc: 'OpenCode - provider qua AI SDK',
    format: 'jsonc',
    accent: '#10B981',
    configPath: path.join(HOME, '.config', 'opencode', 'opencode.jsonc'),
    altPaths: [path.join(HOME, '.config', 'opencode', 'opencode.json')],
    authPath: path.join(HOME, '.local', 'share', 'opencode', 'auth.json'),
    schema: 'opencode',
    docs: 'https://opencode.ai/docs/providers',
    providers: ['@ai-sdk/openai-compatible', '@ai-sdk/anthropic', '@ai-sdk/openai'],
    supported: true
  },
  codex: {
    id: 'codex',
    name: 'Codex CLI',
    vendor: 'OpenAI',
    desc: 'OpenAI Codex CLI - model_providers',
    format: 'toml',
    accent: '#000000',
    configPath: path.join(HOME, '.codex', 'config.toml'),
    authPath: path.join(HOME, '.codex', 'auth.json'),
    schema: 'codex',
    docs: 'https://developers.openai.com/codex/config-reference',
    providers: ['openai', 'oss', 'azure'],
    supported: true
  },
  claudecli: {
    id: 'claudecli',
    name: 'Claude Code',
    vendor: 'Anthropic',
    desc: 'Claude Code CLI - settings.json env (Anthropic native)',
    format: 'json',
    accent: '#D97757',
    configPath: path.join(HOME, '.claude', 'settings.json'),
    altPaths: [path.join(HOME, '.claude.json')],
    credPath: path.join(HOME, '.claude', '.credentials.json'),
    schema: 'claudecli',
    docs: 'https://docs.anthropic.com/en/docs/claude-code/settings',
    providers: ['anthropic-native', 'bedrock', 'vertex'],
    supported: true,
    note: 'Claude Code dùng Anthropic API native (/v1/messages). Không phải OpenAI-compatible. Có thể dùng proxy qua ANTHROPIC_AUTH_TOKEN, hoặc key Anthropic thật qua ANTHROPIC_API_KEY.'
  },
  gemini: {
    id: 'gemini',
    name: 'Gemini CLI',
    vendor: 'Google',
    desc: 'Google Gemini CLI - settings + env',
    format: 'json',
    accent: '#4285F4',
    configPath: path.join(HOME, '.gemini', 'settings.json'),
    envPath: path.join(HOME, '.gemini', '.env'),
    schema: 'gemini',
    docs: 'https://github.com/google-gemini/gemini-cli',
    providers: ['google', 'openai-compatible', 'vertex'],
    supported: true
  },
  claudedesktop: {
    id: 'claudedesktop',
    name: 'Claude Desktop',
    vendor: 'Anthropic',
    desc: 'Claude Desktop - MCP servers + LLM proxy qua launcher',
    format: 'json',
    accent: '#D97757',
    configPath: path.join(APPDATA, 'Claude', 'claude_desktop_config.json'),
    launcherPath: path.join(APPDATA, 'Claude', 'lyno-launcher.bat'),
    appExeCandidates: [
      path.join(LOCALAPPDATA, 'AnthropicClaude', 'Claude.exe'),
      path.join(LOCALAPPDATA, 'Programs', 'claude-desktop', 'Claude.exe'),
      path.join(LOCALAPPDATA, 'AnthropicClaude', 'claude.exe')
    ],
    schema: 'claudedesktop',
    docs: 'https://modelcontextprotocol.io/quickstart/user',
    providers: ['mcp', 'llm-proxy'],
    supported: true,
    note: 'Claude Desktop hỗ trợ 2 chế độ: (1) MCP servers (chính thức, qua claude_desktop_config.json), (2) LLM proxy (qua launcher .bat set ANTHROPIC_BASE_URL + ANTHROPIC_AUTH_TOKEN trước khi chạy Claude.exe). App tự tạo launcher khi thêm LLM proxy.'
  },
  warp: {
    id: 'warp',
    name: 'Warp',
    vendor: 'Warp.dev',
    desc: 'Warp terminal - BYOK + Custom Inference Endpoint',
    format: 'toml',
    accent: '#01A8B6',
    configPath: path.join(LOCALAPPDATA, 'warp', 'Warp', 'config', 'settings.toml'),
    dbPath: path.join(LOCALAPPDATA, 'warp', 'Warp', 'data', 'warp.sqlite'),
    launcherPath: path.join(LOCALAPPDATA, 'warp', 'Warp', 'lyno-launcher.bat'),
    schema: 'warp',
    docs: 'https://docs.warp.dev/agent-platform/inference/bring-your-own-api-key/',
    providers: ['byok-anthropic', 'byok-openai', 'byok-google', 'custom-endpoint'],
    supported: true,
    note: 'Warp hỗ trợ BYOK (Anthropic/OpenAI/Google) + Custom Inference Endpoint (OpenAI-compatible). API key lưu trong Windows Credential Manager (keychain), app lưu endpoint URL + model identifier vào settings.toml. Sau khi lưu, mở Warp -> Settings -> search "API keys" hoặc "inference endpoint" để dán API key.'
  }
};

module.exports = { TOOLS, HOME, APPDATA, LOCALAPPDATA };
