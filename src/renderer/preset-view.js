// preset-view.js — Tab "Preset" - quan ly preset rieng cua app
// Phu thuoc: window.lyno (api), state, $, $$, esc, toast

window.renderPresetView = async function() {
  state.presets = await api.listPresets();
  const list = state.presets || [];
  const filtered = state.search
    ? list.filter(p => JSON.stringify(p).toLowerCase().includes(state.search))
    : list;

  const cards = filtered.map(p => {
    const isDef = p.isDefault;
    const builtin = p.builtin;
    const keyMask = p.apiKey ? (p.apiKey.length > 12 ? p.apiKey.slice(0,8) + '...' + p.apiKey.slice(-4) : p.apiKey.slice(0,3) + '***') : '(chưa có key)';
    return `<div class="preset-card${isDef ? ' is-default' : ''}" data-id="${esc(p.id)}">
      <div class="pc-top">
        <div class="pc-name">${esc(p.name)}</div>
        ${isDef ? '<span class="pc-default-chip">Mặc định</span>' : ''}
      </div>
      <div class="pc-row"><span class="k">URL</span><span class="v" title="${esc(p.baseUrl)}">${esc(p.baseUrl)}</span></div>
      <div class="pc-row"><span class="k">Model</span><span class="v">${esc(p.model || '—')}</span></div>
      <div class="pc-row"><span class="k">Loại</span><span class="v">${esc(p.provider || 'generic-chat-completion-api')}</span></div>
      <div class="pc-row"><span class="k">Key</span><span class="v">${esc(keyMask)}</span></div>
      <div class="pc-acts">
        ${!isDef ? '<button class="btn btn-ghost btn-sm" data-act="setdef">Đặt mặc định</button>' : ''}
        <button class="btn btn-ghost btn-sm" data-act="edit">Sửa</button>
        ${!builtin ? '<button class="btn btn-danger btn-sm" data-act="del">Xóa</button>' : '<span class="pc-builtin-tag">Built-in</span>'}
      </div>
    </div>`;
  }).join('');

  const empty = filtered.length ? '' : `<div class="empty"><p>${state.search ? 'Không tìm thấy preset' : 'Chưa có preset'}</p><small>${state.search ? 'Thử từ khóa khác' : 'Bấm "Thêm preset" để tạo mới'}</small></div>`;

  $('#pane').innerHTML = `
    <div class="pane-head">
      <div class="ph-top">
        <div class="ph-titles">
          <div class="ph-name">Preset của bạn</div>
          <div class="ph-vendor">${list.length} preset · áp nhanh vào mọi tool</div>
        </div>
      </div>
    </div>
    <div class="toolbar">
      <button class="btn btn-primary" id="pv-add">
        <svg viewBox="0 0 20 20" width="14" height="14"><path d="M10 5v10M5 10h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        Thêm preset
      </button>
      <div class="toolbar-spacer"></div>
      <span class="tb-note">Lưu tại ~/.lyno-aio/presets.json</span>
    </div>
    <div class="prov-wrap">
      ${empty || `<div class="preset-grid">${cards}</div>`}
    </div>`;

  $('#pv-add').addEventListener('click', () => openPresetEditor(null));
  $$('.preset-card').forEach(card => {
    const id = card.dataset.id;
    card.querySelectorAll('[data-act]').forEach(b => b.addEventListener('click', async () => {
      const act = b.dataset.act;
      const p = (state.presets || []).find(x => x.id === id);
      if (act === 'setdef') {
        await api.setDefaultPreset(id);
        toast('Đã đặt mặc định: ' + p.name, 'ok');
        await window.renderPresetView();
      } else if (act === 'edit') {
        openPresetEditor(p);
      } else if (act === 'del') {
        if (!window.confirm('Xóa preset "' + p.name + '"?')) return;
        await api.deletePreset(id);
        toast('Đã xóa preset', 'ok');
        await window.renderPresetView();
      }
    }));
  });

  if (window.gsap && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.gsap.from('.preset-card', { autoAlpha: 0, y: 12, duration: .35, stagger: .04, ease: 'power2.out' });
  }
};

function openPresetEditor(existing) {
  const root = document.getElementById('modal-root');
  const e = existing || {};
  root.innerHTML = `<div class="modal-bg"></div><div class="modal">
    <div class="modal-head">
      <div class="mh-logo"><svg viewBox="0 0 20 20" width="20" height="20"><path d="M10 2l2.4 5.3 5.6.5-4.2 3.7 1.2 5.5L10 15.6 4.9 18.5l1.2-5.5L2 9.3l5.6-.5z" fill="none" stroke="#00FF87" stroke-width="1.6" stroke-linejoin="round"/></svg></div>
      <div><h3>${existing ? 'Sửa' : 'Thêm'} preset</h3></div>
    </div>
    <div class="msub">Preset áp dụng nhanh cho mọi tool · lưu cục bộ</div>
    <div class="field"><label>Tên preset <span class="req">*</span></label>
      <input id="pe-name" value="${esc(e.name || '')}" placeholder="VD: My Proxy Opus"></div>
    <div class="field"><label>Base URL <span class="req">*</span></label>
      <input id="pe-url" value="${esc(e.baseUrl || '')}" placeholder="https://.../v1"></div>
    <div class="field"><label>Model mặc định</label>
      <input id="pe-model" value="${esc(e.model || '')}" placeholder="anthropic/claude-opus-4"></div>
    <div class="field"><label>Loại provider</label>
      <select id="pe-prov">
        <option value="generic-chat-completion-api"${(e.provider || 'generic-chat-completion-api') === 'generic-chat-completion-api' ? ' selected' : ''}>OpenAI-compatible (chung)</option>
        <option value="anthropic"${e.provider === 'anthropic' ? ' selected' : ''}>Anthropic</option>
        <option value="openai"${e.provider === 'openai' ? ' selected' : ''}>OpenAI</option>
      </select></div>
    <div class="field field-key"><label>Khóa API (tùy chọn)</label>
      <input id="pe-key" type="password" value="${esc(e.apiKey || '')}" placeholder="sk-...">
      <button class="reveal" id="pe-reveal" type="button"><svg viewBox="0 0 20 20" width="16" height="16"><path d="M2 10s3-5 8-5 8 5 8 5-3 5-8 5-8-5-8-5z" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="10" cy="10" r="2.4" fill="none" stroke="currentColor" stroke-width="1.5"/></svg></button></div>
    <label class="field-check"><input type="checkbox" id="pe-default" ${e.isDefault ? 'checked' : ''}> Đặt làm preset mặc định</label>
    <div class="modal-foot">
      <button class="btn btn-ghost" id="pe-cancel">Hủy</button>
      <button class="btn btn-primary" id="pe-save">${existing ? 'Lưu thay đổi' : 'Thêm preset'}</button>
    </div>
  </div>`;
  root.classList.add('open');

  const close = () => root.classList.remove('open');
  $('.modal-bg', root).addEventListener('click', close);
  $('#pe-cancel').addEventListener('click', close);
  document.addEventListener('keydown', function onEsc(ev){ if(ev.key==='Escape'){close();document.removeEventListener('keydown',onEsc);} });

  $('#pe-reveal').addEventListener('click', () => { const k = $('#pe-key'); k.type = k.type === 'password' ? 'text' : 'password'; });

  $('#pe-save').addEventListener('click', async () => {
    const name = $('#pe-name').value.trim();
    const url = $('#pe-url').value.trim();
    if (!name || !url) { toast('Tên và Base URL là bắt buộc', 'err'); return; }
    const payload = {
      id: existing ? existing.id : null,
      name,
      baseUrl: url,
      model: $('#pe-model').value.trim(),
      provider: $('#pe-prov').value,
      apiKey: $('#pe-key').value,
      isDefault: $('#pe-default').checked,
      builtin: existing ? !!existing.builtin : false
    };
    const r = await api.savePreset(payload);
    if (r && r.ok) { toast('Đã lưu preset', 'ok'); close(); await window.renderPresetView(); }
    else toast('Lỗi: ' + (r && r.error || 'không xác định'), 'err');
  });
}
