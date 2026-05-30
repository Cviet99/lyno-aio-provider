// modal-wire.js — Wire event cho modal: close, test, save, tab switch
// Phu thuoc: api, state, $, $$, toast, refreshCurrent

window.modalWireCommon = function(root, toolId, existing, e, opts) {
  const { isClaudeDesktop, isWarp, isClaudeCli, cdMode } = opts;

  const close = () => root.classList.remove('open');
  $('.modal-bg', root).addEventListener('click', close);
  $('#m-cancel', root).addEventListener('click', close);
  document.addEventListener('keydown', function onEsc(ev){ if(ev.key==='Escape'){close();document.removeEventListener('keydown',onEsc);} });

  const rev = $('#f-reveal', root);
  if (rev) rev.addEventListener('click', () => { const k = $('#f-key'); k.type = k.type === 'password' ? 'text' : 'password'; });

  // Tab switch cho Claude Desktop (mcp <-> llm-proxy)
  $$('[data-cd-mode]', root).forEach(b => b.addEventListener('click', () => {
    close();
    window.openModal(toolId, existing, { ...e, type: b.dataset.cdMode === 'llm-proxy' ? 'llm-proxy' : undefined });
  }));

  // Bam preset -> dien san vao form (LLM tools)
  $$('[data-preset-id]', root).forEach(b => b.addEventListener('click', () => {
    const p = (state.presets || []).find(x => x.id === b.dataset.presetId);
    if (!p) return;
    if ($('#f-name')) $('#f-name').value = p.name || '';
    if ($('#f-model')) $('#f-model').value = p.model || '';
    if ($('#f-url')) $('#f-url').value = p.baseUrl || '';
    if ($('#f-key') && p.apiKey) $('#f-key').value = p.apiKey;
    if ($('#f-prov') && p.provider) $('#f-prov').value = p.provider;
    toast('Đã điền mẫu ' + p.name + (p.apiKey ? '' : ' — nhớ dán khóa API'), 'info');
  }));

  // Test endpoint button
  const testBtn = $('#m-test', root);
  if (testBtn) testBtn.addEventListener('click', async () => {
    const tr = $('#f-test'); tr.className = 'test-result show'; tr.textContent = 'Đang kiểm tra...';
    let provider = ($('#f-prov') && $('#f-prov').value) || 'generic-chat-completion-api';
    if (isClaudeCli) {
      const am = $('#f-authmode') && $('#f-authmode').value;
      provider = am === 'token' ? 'auth-token' : 'api-key';
    }
    const r = await api.testEndpoint({
      baseUrl: ($('#f-url') && $('#f-url').value) || (isClaudeCli ? 'https://api.anthropic.com' : ''),
      apiKey: $('#f-key') && $('#f-key').value,
      provider,
      model: $('#f-model') && $('#f-model').value
    });
    if (r.ok) { tr.className = 'test-result ok'; tr.textContent = 'OK (HTTP ' + r.status + ') — ' + (r.endpoint || 'endpoint phản hồi'); }
    else { tr.className = 'test-result err'; tr.textContent = 'Thất bại: ' + (r.error || ('HTTP ' + r.status)) + (r.endpoint ? ' [' + r.endpoint + ']' : ''); }
  });

  // Save button
  $('#m-save', root).addEventListener('click', async () => {
    const payload = window.modalBuildPayload(toolId, existing, e, opts);
    if (!payload) return; // validation đã toast
    const r = await api.upsert(toolId, payload);
    if (r && r.ok) { toast(r.note || 'Đã lưu', 'ok'); close(); await refreshCurrent(); }
    else toast('Lỗi: ' + (r && r.error || 'không xác định'), 'err');
  });
};
