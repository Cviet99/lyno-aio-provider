// modal.js — Modal them/sua provider, MCP server, LLM proxy launcher, Warp endpoint
// Tach theo tool de moi tool co schema rieng. Khong emoji.

window.openModal = function(toolId, existing, preset) {
  const root = document.getElementById('modal-root');
  const tool = state.tools.find(t => t.id === toolId);
  const e = existing || preset || {};

  // Phan loai schema
  const isClaudeDesktop = tool.id === 'claudedesktop';
  const isWarp = tool.id === 'warp';
  const isClaudeCli = tool.id === 'claudecli';
  const showProviderSelect = tool.id === 'droid' || tool.id === 'opencode';

  // Mode cho Claude Desktop: 'mcp' hoac 'llm-proxy'
  const cdMode = isClaudeDesktop ? (e.type === 'llm-proxy' ? 'llm-proxy' : (e.command ? 'mcp' : 'mcp')) : null;

  // Render fields theo loai
  let body = '';
  if (isClaudeDesktop) body = window.modalFieldsClaudeDesktop(e, cdMode);
  else if (isWarp) body = window.modalFieldsWarp(e);
  else if (isClaudeCli) body = window.modalFieldsClaudeCli(e);
  else body = window.modalFieldsLLM(e, showProviderSelect);

  const presetButtons = (!isClaudeDesktop && !isWarp && !existing && state.presets && state.presets.length) ? `
    <div class="preset-pick">
      <span class="pp-label">Mẫu nhanh:</span>
      ${state.presets.map(p => `<button class="btn btn-ghost btn-sm" data-preset-id="${esc(p.id)}">+ ${esc(p.name)}</button>`).join('')}
    </div>` : '';

  const logoHtml = window.logoHTML ? window.logoHTML(tool.id, tool.accent, tool.name) : '';
  const titleNoun = isClaudeDesktop ? (cdMode === 'llm-proxy' ? 'LLM proxy launcher' : 'MCP server') : (isWarp ? 'endpoint' : 'provider');
  const showTestBtn = !isClaudeDesktop && !isWarp; // Warp + LLM proxy khong test truc tiep

  root.innerHTML = `<div class="modal-bg"></div><div class="modal">
    <div class="modal-head"><div class="mh-logo">${logoHtml}</div>
      <div><h3>${existing ? 'Sửa' : 'Thêm'} ${titleNoun}</h3></div></div>
    <div class="msub">${esc(tool.name)} · ${esc(tool.configPath || '')}</div>
    ${presetButtons}
    ${body}
    <div class="modal-foot">
      ${showTestBtn ? '<button class="btn btn-ghost left" id="m-test"><svg viewBox="0 0 20 20" width="14" height="14"><path d="M10 2v6l4 8H6l4-8z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg> Kiểm tra kết nối</button>' : ''}
      <button class="btn btn-ghost" id="m-cancel">Hủy</button>
      <button class="btn btn-primary" id="m-save">${existing ? 'Lưu thay đổi' : 'Thêm'}</button>
    </div></div>`;
  root.classList.add('open');

  window.modalWireCommon(root, toolId, existing, e, { isClaudeDesktop, isWarp, isClaudeCli, cdMode });
};
