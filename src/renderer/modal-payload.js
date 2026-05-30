// modal-payload.js — Build payload tu form theo tung loai tool
// Phu thuoc: $, toast

window.modalBuildPayload = function(toolId, existing, e, opts) {
  const { isClaudeDesktop, isWarp, isClaudeCli, cdMode } = opts;

  // Claude Desktop - 2 mode
  if (isClaudeDesktop) {
    if (cdMode === 'llm-proxy') {
      const url = ($('#f-url') && $('#f-url').value || '').trim();
      const key = ($('#f-key') && $('#f-key').value || '').trim();
      if (!url || !key) { toast('Base URL + Auth Token bắt buộc', 'err'); return null; }
      return {
        mode: 'llm-proxy',
        baseUrl: url,
        apiKey: key,
        model: ($('#f-model') && $('#f-model').value || '').trim()
      };
    }
    // MCP mode
    const name = ($('#f-name') && $('#f-name').value || '').trim();
    const cmd = ($('#f-cmd') && $('#f-cmd').value || '').trim();
    if (!name || !cmd) { toast('Nhập tên + lệnh chạy', 'err'); return null; }
    return {
      mode: 'mcp',
      key: existing ? e.key : null,
      displayName: name,
      command: cmd,
      args: ($('#f-args') && $('#f-args').value || '').trim()
    };
  }

  // Warp
  if (isWarp) {
    const name = ($('#f-name') && $('#f-name').value || '').trim();
    const url = ($('#f-url') && $('#f-url').value || '').trim();
    const model = ($('#f-model') && $('#f-model').value || '').trim();
    if (!name || !url || !model) { toast('Tên, Base URL, Model bắt buộc', 'err'); return null; }
    return {
      key: existing ? e.key : null,
      displayName: name,
      baseUrl: url,
      model,
      modelDisplayName: ($('#f-modelname') && $('#f-modelname').value || '').trim()
    };
  }

  // Claude Code (Anthropic native)
  if (isClaudeCli) {
    const name = ($('#f-name') && $('#f-name').value || '').trim();
    const url = ($('#f-url') && $('#f-url').value || '').trim();
    const key = ($('#f-key') && $('#f-key').value || '').trim();
    const model = ($('#f-model') && $('#f-model').value || '').trim();
    const authMode = ($('#f-authmode') && $('#f-authmode').value) || 'token';
    if (!name) { toast('Nhập tên hiển thị', 'err'); return null; }
    if (!key && !existing) { toast('Nhập khóa', 'err'); return null; }
    return {
      key: 'custom-endpoint',
      displayName: name,
      baseUrl: url, // empty -> dung mac dinh api.anthropic.com
      apiKey: key,
      authMode,
      model,
      smallFastModel: ($('#f-small') && $('#f-small').value || '').trim(),
      defaultOpusModel: ($('#f-opus') && $('#f-opus').value || '').trim(),
      defaultSonnetModel: ($('#f-sonnet') && $('#f-sonnet').value || '').trim(),
      defaultHaikuModel: ($('#f-haiku') && $('#f-haiku').value || '').trim()
    };
  }

  // LLM thong thuong (Droid, OpenCode, Codex, Gemini)
  const name = ($('#f-name') && $('#f-name').value || '').trim();
  const model = ($('#f-model') && $('#f-model').value || '').trim();
  const url = ($('#f-url') && $('#f-url').value || '').trim();
  if (!name || !model || !url) { toast('Tên, Model, Base URL là bắt buộc', 'err'); return null; }
  return {
    displayName: name,
    model,
    baseUrl: url,
    apiKey: ($('#f-key') && $('#f-key').value) || '',
    provider: ($('#f-prov') && $('#f-prov').value) || 'generic-chat-completion-api',
    key: existing ? e.key : null,
    originalKey: existing ? e.key : null
  };
};
