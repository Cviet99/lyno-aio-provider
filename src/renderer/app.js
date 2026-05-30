// app.js — Renderer (Aurora Boreal Nordica + GSAP). Tiếng Việt 100%.
const api = window.lyno;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s == null ? '' : s).replace(/[&<>\"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;' }[c]));
const logo = (id, accent, name) => window.logoHTML(id, accent, name);

const state = { tools: [], current: null, data: null, search: '', view: 'tools', presets: [] };

// Expose globals cho modal-wire, modal-payload, modal-fields (load truoc app.js)
window.$ = $; window.$$ = $$; window.esc = esc; window.state = state; window.api = api;
window.toast = function(msg, type) { return toast(msg, type); };
window.refreshCurrent = function() { return refreshCurrent(); };

// respect reduced motion
const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const dur = (d) => RM ? 0 : d;

// ===== Starfield =====
function initStarfield() {
  const cv = $('#starfield'); if (!cv) return;
  const ctx = cv.getContext('2d');
  let stars = [], w, h;
  function resize() { w = cv.width = window.innerWidth; h = cv.height = window.innerHeight;
    stars = Array.from({ length: Math.min(120, Math.round(w * h / 14000)) }, () => ({
      x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.3 + .3,
      a: Math.random() * .6 + .2, tw: Math.random() * .02 + .004, dir: 1 })); }
  resize(); window.addEventListener('resize', resize);
  (function draw() {
    ctx.clearRect(0, 0, w, h);
    for (const s of stars) {
      s.a += s.tw * s.dir; if (s.a > .85 || s.a < .15) s.dir *= -1;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 7);
      ctx.fillStyle = `rgba(232,244,248,${s.a})`; ctx.fill();
    }
    requestAnimationFrame(draw);
  })();
}

// ===== GSAP aurora wave =====
function initAurora() {
  if (RM || !window.gsap) return;
  gsap.to('.w1', { x: 60, y: 40, scale: 1.15, duration: 9, repeat: -1, yoyo: true, ease: 'sine.inOut' });
  gsap.to('.w2', { x: -50, y: 50, scale: 1.1, duration: 11, repeat: -1, yoyo: true, ease: 'sine.inOut' });
  gsap.to('.w3', { x: 40, y: -40, scale: 1.2, duration: 13, repeat: -1, yoyo: true, ease: 'sine.inOut' });
  gsap.to(['.w1', '.w2', '.w3'], { opacity: '+=0.08', duration: 6, repeat: -1, yoyo: true, ease: 'sine.inOut', stagger: 2 });
}

// stagger entrance cho list
function animateIn(sel, container) {
  if (RM || !window.gsap) return;
  gsap.from((container || document).querySelectorAll(sel), {
    autoAlpha: 0, y: 14, duration: dur(.42), ease: 'power2.out', stagger: .05, overwrite: true
  });
}

// hover lift (gắn 1 lần)
function bindHoverLift(els) {
  if (RM || !window.gsap) return;
  els.forEach(el => {
    el.addEventListener('mouseenter', () => gsap.to(el, { y: -3, duration: .2, ease: 'power2.out' }));
    el.addEventListener('mouseleave', () => gsap.to(el, { y: 0, duration: .2, ease: 'power2.out' }));
  });
}

// ===== Toast =====
function toast(msg, type = 'info') {
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  const ic = type === 'ok' ? 'M5 10l3 3 7-7' : type === 'err' ? 'M6 6l8 8M14 6l-8 8' : 'M10 6v5M10 14v.2';
  el.innerHTML = `<svg viewBox="0 0 20 20" width="16" height="16"><path d="${ic}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg><span>${esc(msg)}</span>`;
  $('#toast-root').appendChild(el);
  if (window.gsap && !RM) gsap.from(el, { autoAlpha: 0, x: 40, duration: .3, ease: 'power3.out' });
  setTimeout(() => {
    if (window.gsap && !RM) gsap.to(el, { autoAlpha: 0, x: 40, duration: .25, onComplete: () => el.remove() });
    else el.remove();
  }, 3000);
}

// ===== Rail (danh sách tool) =====
async function loadTools() {
  state.tools = await api.listTools();
  for (const t of state.tools) {
    if (t.supported && t.exists) {
      try { const d = await api.readTool(t.id); t._count = (d.providers || []).length; } catch { t._count = 0; }
    } else t._count = 0;
  }
  $('#tb-configured').textContent = state.tools.filter(t => t.supported && t.exists).length;
  renderRail();
}

function renderRail() {
  const rail = $('#rail');
  if (state.view === 'presets') { rail.innerHTML = railPresetInfo(); return; }
  const sup = state.tools.filter(t => t.supported);
  const ro = state.tools.filter(t => !t.supported);
  rail.innerHTML = `
    <div class="rail-label">Ghi cấu hình</div>
    <div class="rail-list">${sup.map(railItem).join('')}</div>
    <div class="rail-label">Chỉ đọc</div>
    <div class="rail-list">${ro.map(railItem).join('')}</div>
    <div class="rail-foot"><i class="dot ok"></i><div><div class="rf-title">Cục bộ &amp; riêng tư</div><div class="rf-sub">Khóa API không rời máy</div></div></div>`;
  $$('.rail-item', rail).forEach(el => {
    el.addEventListener('click', () => selectTool(el.dataset.tool));
    if (el.dataset.tool === state.current) el.classList.add('active');
  });
  animateIn('.rail-item', rail);
}

function railItem(t) {
  const cnt = t._count || 0;
  const badge = !t.supported ? `<span class="ri-count ro">RO</span>` : (cnt ? `<span class="ri-count">${cnt}</span>` : '');
  return `<div class="rail-item" data-tool="${t.id}">
    <div class="ri-logo">${logo(t.id, t.accent, t.name)}</div>
    <div class="ri-body"><div class="ri-name">${esc(t.name)}</div><div class="ri-vendor">${esc(t.vendor)}</div></div>
    ${badge}</div>`;
}

function railPresetInfo() {
  return `<div class="rail-label">Preset của bạn</div>
    <div class="rail-foot" style="margin-top:8px"><i class="dot ok"></i><div><div class="rf-title">${state.presets.length} preset</div><div class="rf-sub">Áp nhanh vào mọi tool</div></div></div>
    <div class="rail-foot" style="margin-top:auto"><i class="dot ok"></i><div><div class="rf-title">Lưu cục bộ</div><div class="rf-sub">~/.lyno-aio/presets.json</div></div></div>`;
}

// ===== Tab switching =====
function switchView(v) {
  state.view = v;
  $$('.tab').forEach(t => t.classList.toggle('active', t.dataset.view === v));
  renderRail();
  if (v === 'presets') renderPresetView();
  else { if (state.current) selectTool(state.current); else renderWelcome(); }
}

async function selectTool(toolId) {
  state.current = toolId;
  $$('.rail-item').forEach(el => el.classList.toggle('active', el.dataset.tool === toolId));
  state.data = await api.readTool(toolId);
  renderPane();
}

function renderWelcome() {
  state.current = null;
  $('#pane').innerHTML = `<div class="welcome">
    <div class="wlogo"><svg viewBox="0 0 64 64" width="64" height="64" fill="none"><defs><linearGradient id="wg" x1="0" y1="0" x2="64" y2="64"><stop offset="0" stop-color="#00FF87"/><stop offset="1" stop-color="#00D4FF"/></linearGradient></defs><rect x="8" y="8" width="48" height="48" rx="13" fill="none" stroke="url(#wg)" stroke-width="1.5" opacity="0.5"/><path d="M22 24v16M22 40h13" stroke="url(#wg)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
    <h2>Chọn một công cụ</h2><p>Chọn AI CLI/IDE ở thanh trái để quản lý API provider. Mọi thay đổi ghi trực tiếp vào file cấu hình và tự sao lưu.</p></div>`;
  if (window.gsap && !RM) gsap.from('.welcome > *', { autoAlpha: 0, y: 16, duration: .5, stagger: .08, ease: 'power2.out' });
}

// ===== Init =====
document.addEventListener('DOMContentLoaded', async () => {
  console.log('[app] DOMContentLoaded fired, api=', typeof api, 'lyno=', typeof window.lyno);
  initStarfield(); initAurora();
  if (window.gsap && !RM) gsap.defaults({ ease: 'power2.out' });
  try {
    state.presets = await api.listPresets();
    console.log('[app] presets loaded:', state.presets.length);
    await loadTools();
    console.log('[app] tools loaded:', state.tools.length);
    renderWelcome();
    console.log('[app] welcome rendered OK');
  } catch(e) {
    console.error('[app] INIT ERROR:', e.message, e.stack);
  }
  $$('.tab').forEach(t => t.addEventListener('click', () => switchView(t.dataset.view)));
  $('#global-search').addEventListener('input', (e) => {
    state.search = e.target.value.toLowerCase().trim();
    if (state.view === 'tools' && state.current) renderPane();
    if (state.view === 'presets') renderPresetView();
  });
  // Window controls (frameless)
  $('#wc-min').addEventListener('click', () => api.winMinimize());
  $('#wc-max').addEventListener('click', () => api.winMaximize());
  $('#wc-close').addEventListener('click', () => api.winClose());
});

// ===== Pane (chi tiết tool) =====
function renderPane() {
  const tool = state.tools.find(t => t.id === state.current);
  const data = state.data;
  const isMcp = tool.id === 'claudedesktop';
  const isRo = !tool.supported;
  let provs = data.providers || [];
  if (state.search) provs = provs.filter(p => JSON.stringify(p).toLowerCase().includes(state.search));

  const status = isRo ? `<span class="ph-status"><i class="dot warn"></i>Chỉ đọc</span>`
    : data.exists ? `<span class="ph-status"><i class="dot ok"></i>Đã cấu hình</span>`
    : `<span class="ph-status"><i class="dot off"></i>Chưa thiết lập</span>`;
  const banner = (data.note || tool.note) ? `<div class="banner"><svg viewBox="0 0 20 20" width="15" height="15"><circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M10 9v5M10 6.2v.2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg><span>${esc(data.note || tool.note)}</span></div>` : '';

  // nút áp preset mặc định nhanh
  const def = state.presets.find(p => p.isDefault);
  const quickPreset = (!isRo && def) ? `<button class="btn btn-preset" data-act="quickpreset"><svg viewBox="0 0 20 20" width="14" height="14"><path d="M10 2l2.4 5.3 5.6.5-4.2 3.7 1.2 5.5L10 15.6 4.9 18.5l1.2-5.5L2 9.3l5.6-.5z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg> Áp preset: ${esc(def.name)}</button>` : '';

  const addLabel = isMcp ? 'Thêm MCP' : 'Thêm Provider';
  const toolbar = isRo
    ? `<div class="toolbar"><button class="btn btn-ghost" data-act="reveal">Mở thư mục</button><button class="btn btn-ghost" data-act="docs">Tài liệu</button><div class="toolbar-spacer"></div><span class="tb-note">Chưa hỗ trợ ghi</span></div>`
    : `<div class="toolbar">
        <button class="btn btn-primary" data-act="add"><svg viewBox="0 0 20 20" width="14" height="14"><path d="M10 5v10M5 10h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg> ${addLabel}</button>
        ${quickPreset}
        <button class="btn btn-ghost" data-act="reveal">Mở thư mục</button>
        <button class="btn btn-ghost" data-act="docs">Tài liệu</button>
        <div class="toolbar-spacer"></div><span class="tb-note">${provs.length} mục</span></div>`;

  $('#pane').innerHTML = `<div class="pane-head"><div class="ph-top">
      <div class="ph-logo">${logo(tool.id, tool.accent, tool.name)}</div>
      <div class="ph-titles"><div class="ph-name">${esc(tool.name)}</div><div class="ph-vendor">${esc(tool.vendor)} · ${esc(tool.format.toUpperCase())}</div></div>${status}</div>
    <div class="ph-path"><span class="pp-tag">CONFIG</span><code title="${esc(data.configPath)}">${esc(data.configPath)}</code>
      <span class="ph-copy" data-act="copy"><svg viewBox="0 0 20 20" width="14" height="14"><rect x="6" y="6" width="10" height="10" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M4 12V4h8" fill="none" stroke="currentColor" stroke-width="1.5"/></svg></span></div>
    </div>${banner}${toolbar}${provTable(tool, provs, isMcp)}`;
  wirePane(tool, isMcp);
  if (window.gsap && !RM) gsap.from('.pane-head, .toolbar', { autoAlpha: 0, y: 12, duration: .4, stagger: .06 });
  animateIn('.prov-row');
  bindHoverLift($$('.prov-row'));
}

function provTable(tool, provs, isMcp) {
  if (!provs.length) {
    const msg = state.search ? 'Không tìm thấy' : (isMcp ? 'Chưa có MCP server' : 'Chưa có provider');
    const hint = state.search ? 'Thử từ khóa khác' : (tool.supported ? 'Bấm thêm để bắt đầu' : 'Chỉ hỗ trợ xem');
    return `<div class="prov-wrap"><div class="empty"><svg viewBox="0 0 48 48" width="50" height="50"><rect x="8" y="12" width="32" height="26" rx="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M16 22h16M16 28h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg><p>${esc(msg)}</p><small>${esc(hint)}</small></div></div>`;
  }
  const cols = isMcp ? ['SERVER', 'LỆNH', ''] : ['PROVIDER', 'KẾT NỐI', ''];
  const rows = provs.map(p => {
    const initial = (p.displayName || p.key || '?')[0].toUpperCase();
    const tags = [];
    if (p.provider) tags.push(p.provider);
    if (p.wireApi) tags.push('wire:' + p.wireApi);
    if (p.models && p.models.length) tags.push(p.models.length + ' model');
    if (p.authType) tags.push(p.authType);
    const tagHtml = tags.map(t => `<span class="ptag">${esc(t)}</span>`).join('');
    const conn = isMcp ? `<div class="pr-url">${esc(p.command || '')} ${esc(p.args || '')}</div>`
      : `<div class="pr-url">${esc(p.baseUrl || p.envKey || '—')}</div>${p.apiKey ? `<div class="pr-key">${esc(p.apiKey)}</div>` : ''}${tagHtml ? `<div class="pr-tags">${tagHtml}</div>` : ''}`;
    return `<div class="prov-row"><div class="pr-id"><div class="pr-badge">${esc(initial)}</div>
      <div style="min-width:0"><div class="pr-name">${esc(p.displayName || p.key)}</div>${p.model ? `<div class="pr-model">${esc(p.model)}</div>` : (isMcp ? '<div class="pr-model">MCP server</div>' : '')}</div></div>
      <div class="pr-conn">${conn}</div>
      <div class="pr-acts"><button class="icon-btn" data-edit="${esc(p.key)}"><svg viewBox="0 0 20 20" width="14" height="14"><path d="M13 4l3 3-8 8H5v-3z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg></button>
      <button class="icon-btn del" data-del="${esc(p.key)}"><svg viewBox="0 0 20 20" width="14" height="14"><path d="M5 6h10M8 6V4h4v2M6 6l1 9h6l1-9" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div></div>`;
  }).join('');
  return `<div class="prov-wrap"><div class="prov-thead"><span>${cols[0]}</span><span>${cols[1]}</span><span></span></div><div class="prov-list">${rows}</div></div>`;
}

function wirePane(tool, isMcp) {
  const pane = $('#pane'), data = state.data;
  $$('[data-act]', pane).forEach(b => b.addEventListener('click', () => {
    const a = b.dataset.act;
    if (a === 'add') openModal(tool.id, null);
    else if (a === 'reveal') api.openPath(data.configPath);
    else if (a === 'docs') api.openExternal(tool.docs);
    else if (a === 'copy') { navigator.clipboard.writeText(data.configPath); toast('Đã sao chép', 'ok'); }
    else if (a === 'quickpreset') applyPreset(tool.id, state.presets.find(p => p.isDefault));
  }));
  $$('[data-edit]', pane).forEach(b => b.addEventListener('click', () => openModal(tool.id, (data.providers || []).find(x => String(x.key) === b.dataset.edit))));
  $$('[data-del]', pane).forEach(b => b.addEventListener('click', () => confirmDelete(tool.id, b.dataset.del)));
}

// áp preset vào tool: mở modal đã điền sẵn để user xác nhận + thêm key
function applyPreset(toolId, preset) {
  if (!preset) { toast('Chưa có preset mặc định', 'info'); return; }
  openModal(toolId, null, preset);
}

async function confirmDelete(toolId, key) {
  if (!window.confirm('Xóa "' + key + '"?\nFile cấu hình sẽ được sao lưu (.lyno-bak) trước.')) return;
  const r = await api.remove(toolId, key);
  if (r && r.ok) { toast('Đã xóa', 'ok'); await refreshCurrent(); } else toast('Lỗi: ' + (r && r.error || '?'), 'err');
}

async function refreshCurrent() {
  state.data = await api.readTool(state.current);
  const t = state.tools.find(x => x.id === state.current);
  if (t) { t._count = (state.data.providers || []).length; t.exists = state.data.exists; }
  $('#tb-configured').textContent = state.tools.filter(t => t.supported && t.exists).length;
  renderRail(); renderPane();
}
