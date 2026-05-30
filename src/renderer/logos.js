// logos.js — Logo gốc của vendor (SVG official-style) cho từng tool
// Theme nền: tối, accent đúng brand. Không emoji. Không tự chế.
window.APP_ICONS = { droid: 'icons/droid.png', opencode: 'icons/opencode.png', warp: 'icons/warp.png' };

// SVG bám sát logo official của hãng (đơn giản hóa, vẫn nhận diện được)
window.LOGOS = {
  // Codex / OpenAI — bông hoa 6 cánh xoắn
  codex: `<svg viewBox="0 0 48 48" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="44" height="44" rx="11" fill="#0F0F0F"/><g transform="translate(24,24)" fill="#FFFFFF"><path d="M-1 -10.5c0-2.5 2-4.5 4.5-4.5h0.6c2.5 0 4.5 2 4.5 4.5v3.5l-3 1.7v-5.2c0-1.1-0.9-2-2-2s-2 0.9-2 2v8.6l-2.6-1.5z"/><path d="M10.6 -7.6c2.2-1.3 5-0.5 6.2 1.6l0.3 0.5c1.3 2.2 0.5 5-1.6 6.2l-3 1.7l-3-1.7l4.5-2.6c1-0.6 1.3-1.8 0.7-2.7s-1.8-1.3-2.7-0.7l-7.4 4.3v-3z"/><path d="M16.5 4.7c0 2.5-2 4.5-4.5 4.5h-0.6c-2.5 0-4.5-2-4.5-4.5v-3.5l3-1.7v5.2c0 1.1 0.9 2 2 2s2-0.9 2-2v-8.6l2.6 1.5z"/><path d="M-9.1 7.5c-2.2 1.3-5 0.5-6.2-1.6l-0.3-0.5c-1.3-2.2-0.5-5 1.6-6.2l3-1.7 3 1.7-4.5 2.6c-1 0.6-1.3 1.8-0.7 2.7s1.8 1.3 2.7 0.7l7.4-4.3v3z"/><path d="M-5.6 -4.7c0-2.5 2-4.5 4.5-4.5h0.6c2.5 0 4.5 2 4.5 4.5l0 6.9-2.7 1.5l-2.6-1.5l3-1.7v-5.2c0-1.1-0.9-2-2-2s-2 0.9-2 2v8.6"/><path d="M-3.6 -1.7l3-1.7l5.7 3.3v6.6c0 0.4 0.2 0.7 0.5 0.9l5.4 3.1-2.7 1.5l-5.4-3.1c-0.6-0.4-1-1-1-1.7v-6.6z"/></g></svg>`,
  
  // Claude Code (Anthropic) — bông hoa 8 cánh xoay (Claude star)
  claudecli: `<svg viewBox="0 0 48 48" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="44" height="44" rx="11" fill="#D97757"/><g transform="translate(24,24)" fill="#FFFFFF"><path d="M0 -13c0.4 0 0.8 0.3 0.9 0.7l1.6 6.6c0.4 1.6 1.6 2.8 3.2 3.2l6.6 1.6c0.4 0.1 0.7 0.5 0.7 0.9s-0.3 0.8-0.7 0.9l-6.6 1.6c-1.6 0.4-2.8 1.6-3.2 3.2l-1.6 6.6c-0.1 0.4-0.5 0.7-0.9 0.7s-0.8-0.3-0.9-0.7l-1.6-6.6c-0.4-1.6-1.6-2.8-3.2-3.2l-6.6-1.6c-0.4-0.1-0.7-0.5-0.7-0.9s0.3-0.8 0.7-0.9l6.6-1.6c1.6-0.4 2.8-1.6 3.2-3.2l1.6-6.6c0.1-0.4 0.5-0.7 0.9-0.7z"/></g></svg>`,
  
  // Gemini CLI — viên ngọc 4 cánh (Google Bard/Gemini star)
  gemini: `<svg viewBox="0 0 48 48" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="44" height="44" rx="11" fill="#1E1F20"/><defs><linearGradient id="gem-g" x1="0" y1="0" x2="48" y2="48"><stop offset="0" stop-color="#4285F4"/><stop offset="0.5" stop-color="#9B72F8"/><stop offset="1" stop-color="#D96570"/></linearGradient></defs><path d="M24 8c0.6 6.4 3.6 11.4 7.7 13.8c2.5 1.4 5.4 2.2 8.3 2.2c-2.9 0-5.8 0.8-8.3 2.2c-4.1 2.4-7.1 7.4-7.7 13.8c-0.6-6.4-3.6-11.4-7.7-13.8c-2.5-1.4-5.4-2.2-8.3-2.2c2.9 0 5.8-0.8 8.3-2.2c4.1-2.4 7.1-7.4 7.7-13.8z" fill="url(#gem-g)"/></svg>`,
  
  // Claude Desktop — Claude star trên nền cam đậm
  claudedesktop: `<svg viewBox="0 0 48 48" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="44" height="44" rx="11" fill="#1A0F0A"/><g transform="translate(24,24)" fill="#D97757"><path d="M0 -11c0.3 0 0.7 0.2 0.8 0.6l1.4 5.6c0.3 1.4 1.4 2.4 2.7 2.7l5.6 1.4c0.4 0.1 0.6 0.4 0.6 0.8s-0.2 0.7-0.6 0.8l-5.6 1.4c-1.4 0.3-2.4 1.4-2.7 2.7l-1.4 5.6c-0.1 0.4-0.4 0.6-0.8 0.6s-0.7-0.2-0.8-0.6l-1.4-5.6c-0.3-1.4-1.4-2.4-2.7-2.7l-5.6-1.4c-0.4-0.1-0.6-0.4-0.6-0.8s0.2-0.7 0.6-0.8l5.6-1.4c1.4-0.3 2.4-1.4 2.7-2.7l1.4-5.6c0.1-0.4 0.4-0.6 0.8-0.6z"/></g><rect x="11" y="33" width="26" height="3" rx="1.5" fill="#D97757" opacity="0.5"/></svg>`
};

// Trả về HTML cho logo của tool (ưu tiên icon thật)
window.logoHTML = function(toolId, accent, name) {
  if (window.APP_ICONS[toolId]) return `<img src="${window.APP_ICONS[toolId]}" alt="" draggable="false" style="width:100%;height:100%;object-fit:contain">`;
  if (window.LOGOS[toolId]) return window.LOGOS[toolId];
  return `<div style="width:100%;height:100%;border-radius:9px;background:${accent}22;display:grid;place-items:center;color:${accent};font-weight:700">${(name||'?')[0]}</div>`;
};
