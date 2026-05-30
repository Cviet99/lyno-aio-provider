// skills-manager.js — Quan ly skills/AGENTS.md cho tung tool
const fs = require('fs');
const path = require('path');
const os = require('os');
const { TOOLS, HOME } = require('./tools-registry');

// Moi tool co thu muc skills rieng
const SKILL_DIRS = {
  droid: path.join(HOME, '.factory', 'skills'),
  claudecli: path.join(HOME, '.claude', 'skills'),
  codex: path.join(HOME, '.codex', 'skills'),
  opencode: path.join(HOME, '.config', 'opencode', 'skill'),
  gemini: path.join(HOME, '.gemini', 'commands'),
  claudedesktop: null,
  warp: null
};

function ensureDir(p) { if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true }); }

function listSkills(toolId) {
  const dir = SKILL_DIRS[toolId];
  if (!dir) return { supported: false, skills: [] };
  if (!fs.existsSync(dir)) return { supported: true, dir, skills: [] };
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const skills = [];
    for (const e of entries) {
      if (e.isDirectory()) {
        const skillMd = path.join(dir, e.name, 'SKILL.md');
        if (fs.existsSync(skillMd)) {
          const head = fs.readFileSync(skillMd, 'utf8').slice(0, 400);
          const desc = (head.match(/description:\s*(.+)/) || [])[1] || '';
          skills.push({ name: e.name, type: 'dir', desc: desc.trim(), path: skillMd });
        }
      } else if (e.name.endsWith('.md') || e.name.endsWith('.toml')) {
        skills.push({ name: e.name, type: 'file', path: path.join(dir, e.name) });
      }
    }
    return { supported: true, dir, skills };
  } catch (e) {
    return { supported: true, dir, skills: [], error: e.message };
  }
}

function readSkill(toolId, name) {
  const dir = SKILL_DIRS[toolId];
  if (!dir) return { ok: false, error: 'Tool không hỗ trợ skills' };
  let p = path.join(dir, name);
  if (fs.existsSync(p) && fs.statSync(p).isDirectory()) p = path.join(p, 'SKILL.md');
  if (!fs.existsSync(p)) return { ok: false, error: 'Không tìm thấy skill' };
  return { ok: true, content: fs.readFileSync(p, 'utf8'), path: p };
}

function saveSkill(toolId, name, content) {
  const dir = SKILL_DIRS[toolId];
  if (!dir) return { ok: false, error: 'Tool không hỗ trợ skills' };
  ensureDir(dir);
  // name dang "myskill" -> tao folder/SKILL.md; name co .md -> file truc tiep
  let p;
  if (name.endsWith('.md') || name.endsWith('.toml')) {
    p = path.join(dir, name);
  } else {
    const skillDir = path.join(dir, name);
    ensureDir(skillDir);
    p = path.join(skillDir, 'SKILL.md');
  }
  fs.writeFileSync(p, content, 'utf8');
  return { ok: true, path: p };
}

function deleteSkill(toolId, name) {
  const dir = SKILL_DIRS[toolId];
  if (!dir) return { ok: false, error: 'Tool không hỗ trợ skills' };
  const p = path.join(dir, name);
  if (!fs.existsSync(p)) return { ok: false, error: 'Không tồn tại' };
  try {
    if (fs.statSync(p).isDirectory()) fs.rmSync(p, { recursive: true, force: true });
    else fs.unlinkSync(p);
    return { ok: true };
  } catch (e) { return { ok: false, error: e.message }; }
}

module.exports = { listSkills, readSkill, saveSkill, deleteSkill, SKILL_DIRS };
