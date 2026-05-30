// modal-fields.js — Cac field render rieng cho tung loai tool
// Phu thuoc: esc() global

// LLM thong thuong (Droid, OpenCode, Codex, Gemini)
window.modalFieldsLLM = function(e, showProviderSelect) {
  return `
    <div class="field"><label>Tên hiển thị <span class="req">*</span></label>
      <input id="f-name" value="${esc(e.displayName || e.name || '')}" placeholder="VD: My Proxy Opus"></div>
    <div class="field"><label>Model ID <span class="req">*</span></label>
      <input id="f-model" value="${esc(e.model || '')}" placeholder="anthropic/claude-opus-4"></div>
    <div class="field"><label>Base URL <span class="req">*</span></label>
      <input id="f-url" value="${esc(e.baseUrl || '')}" placeholder="https://.../v1"></div>
    <div class="field field-key"><label>Khóa API</label>
      <input id="f-key" type="password" value="${esc(e.apiKeyRaw || e.apiKey || '')}" placeholder="sk-...">
      <button class="reveal" id="f-reveal" type="button" title="Hiện/ẩn">
        <svg viewBox="0 0 20 20" width="16" height="16"><path d="M2 10s3-5 8-5 8 5 8 5-3 5-8 5-8-5-8-5z" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="10" cy="10" r="2.4" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>
      </button></div>
    ${showProviderSelect ? `<div class="field"><label>Loại provider</label>
      <select id="f-prov">
        <option value="generic-chat-completion-api"${e.provider === 'generic-chat-completion-api' ? ' selected' : ''}>OpenAI-compatible (chung)</option>
        <option value="anthropic"${e.provider === 'anthropic' ? ' selected' : ''}>Anthropic</option>
        <option value="openai"${e.provider === 'openai' ? ' selected' : ''}>OpenAI</option>
      </select></div>` : ''}
    <div class="test-result" id="f-test"></div>`;
};

// Claude Code (Anthropic native) - co auth mode + sub-models
window.modalFieldsClaudeCli = function(e) {
  const authMode = e.authMode || 'token';
  return `
    <div class="field"><label>Tên hiển thị <span class="req">*</span></label>
      <input id="f-name" value="${esc(e.displayName || 'Custom Anthropic')}" placeholder="VD: My Proxy Anthropic"></div>
    <div class="field"><label>Phương thức auth</label>
      <select id="f-authmode">
        <option value="token"${authMode === 'token' ? ' selected' : ''}>Auth Token (proxy/3rd-party)</option>
        <option value="key"${authMode === 'key' ? ' selected' : ''}>API Key (Anthropic native)</option>
      </select>
      <div class="hint">Token cho proxy ghi vào ANTHROPIC_AUTH_TOKEN. Key gốc Anthropic ghi vào ANTHROPIC_API_KEY.</div>
    </div>
    <div class="field"><label>Base URL</label>
      <input id="f-url" value="${esc(e.baseUrl && e.baseUrl !== 'https://api.anthropic.com (default)' ? e.baseUrl : '')}" placeholder="Để trống = api.anthropic.com mặc định">
      <div class="hint">VD proxy: https://your-proxy.example.com/v1</div></div>
    <div class="field field-key"><label>Khóa</label>
      <input id="f-key" type="password" value="${esc(e.apiKeyRaw || '')}" placeholder="sk-ant-... hoặc token proxy">
      <button class="reveal" id="f-reveal" type="button"><svg viewBox="0 0 20 20" width="16" height="16"><path d="M2 10s3-5 8-5 8 5 8 5-3 5-8 5-8-5-8-5z" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="10" cy="10" r="2.4" fill="none" stroke="currentColor" stroke-width="1.5"/></svg></button></div>
    <div class="field"><label>Model chính (ANTHROPIC_MODEL)</label>
      <input id="f-model" value="${esc(e.model || '')}" placeholder="claude-opus-4-5 / claude-sonnet-4-5"></div>
    <details class="adv"><summary>Sub-models (tuỳ chọn — Claude Code dùng riêng cho task nhẹ/heavy)</summary>
      <div class="field"><label>Small Fast Model</label>
        <input id="f-small" value="${esc(e.smallFastModel || '')}" placeholder="claude-haiku-4-5"></div>
      <div class="field"><label>Default Opus Model</label>
        <input id="f-opus" value="${esc(e.defaultOpusModel || '')}" placeholder="claude-opus-4-5"></div>
      <div class="field"><label>Default Sonnet Model</label>
        <input id="f-sonnet" value="${esc(e.defaultSonnetModel || '')}" placeholder="claude-sonnet-4-5"></div>
      <div class="field"><label>Default Haiku Model</label>
        <input id="f-haiku" value="${esc(e.defaultHaikuModel || '')}" placeholder="claude-haiku-4-5"></div>
    </details>
    <div class="test-result" id="f-test"></div>`;
};

// Claude Desktop - 2 mode: MCP server hoac LLM proxy launcher
window.modalFieldsClaudeDesktop = function(e, mode) {
  const tabs = `
    <div class="cd-tabs">
      <button class="cd-tab${mode === 'mcp' ? ' active' : ''}" data-cd-mode="mcp">MCP Server</button>
      <button class="cd-tab${mode === 'llm-proxy' ? ' active' : ''}" data-cd-mode="llm-proxy">LLM Proxy (launcher)</button>
    </div>`;
  if (mode === 'llm-proxy') {
    return tabs + `
      <div class="hint" style="margin:8px 0 12px">App sẽ tạo file <code>lyno-launcher.bat</code> set env (ANTHROPIC_BASE_URL/AUTH_TOKEN/MODEL) rồi chạy Claude.exe. Dùng launcher đó thay vì shortcut Claude gốc.</div>
      <div class="field"><label>Base URL <span class="req">*</span></label>
        <input id="f-url" value="${esc(e.baseUrl || '')}" placeholder="https://your-proxy.example.com"></div>
      <div class="field field-key"><label>Auth Token <span class="req">*</span></label>
        <input id="f-key" type="password" value="${esc(e.apiKeyRaw || '')}" placeholder="Token proxy (ANTHROPIC_AUTH_TOKEN)">
        <button class="reveal" id="f-reveal" type="button"><svg viewBox="0 0 20 20" width="16" height="16"><path d="M2 10s3-5 8-5 8 5 8 5-3 5-8 5-8-5-8-5z" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="10" cy="10" r="2.4" fill="none" stroke="currentColor" stroke-width="1.5"/></svg></button></div>
      <div class="field"><label>Model</label>
        <input id="f-model" value="${esc(e.model || '')}" placeholder="claude-opus-4-5"></div>`;
  }
  // MCP mode
  return tabs + `
    <div class="field"><label>Tên server <span class="req">*</span></label>
      <input id="f-name" value="${esc(e.displayName || e.key || '')}" placeholder="filesystem"></div>
    <div class="field"><label>Lệnh chạy <span class="req">*</span></label>
      <input id="f-cmd" value="${esc(e.command || '')}" placeholder="npx"></div>
    <div class="field"><label>Tham số (args)</label>
      <input id="f-args" value="${esc(e.args || '')}" placeholder="-y @modelcontextprotocol/server-filesystem /path"></div>`;
};

// Warp - chi luu endpoint URL + model identifier (key dan qua Warp Settings)
window.modalFieldsWarp = function(e) {
  return `
    <div class="hint" style="margin-bottom:12px">Warp lưu API key trong Windows Credential Manager. App này chỉ lưu URL + model identifier. Sau khi lưu, mở Warp → Settings → search "inference endpoint" để dán key.</div>
    <div class="field"><label>Tên hiển thị <span class="req">*</span></label>
      <input id="f-name" value="${esc(e.displayName || '')}" placeholder="VD: My Endpoint GPT-5"></div>
    <div class="field"><label>Base URL <span class="req">*</span></label>
      <input id="f-url" value="${esc(e.baseUrl || '')}" placeholder="https://.../v1 (OpenAI-compatible)">
      <div class="hint">Warp gọi POST {URL}/chat/completions. URL phải public (không dùng localhost — dùng ngrok nếu cần).</div></div>
    <div class="field"><label>Model ID <span class="req">*</span></label>
      <input id="f-model" value="${esc(e.model || '')}" placeholder="openai/gpt-5 hoặc anthropic/claude-opus-4-5"></div>
    <div class="field"><label>Tên hiển thị model (tuỳ chọn)</label>
      <input id="f-modelname" value="${esc(e.modelDisplayName || '')}" placeholder="GPT-5 (custom)"></div>`;
};
