# Lyno AIO Provider Assistant

Công cụ desktop (Electron) quản lý API provider cho nhiều AI IDE/CLI cùng lúc. Đọc/ghi config trực tiếp trên máy, tự động backup trước khi sửa, key lưu local không gửi đi đâu.

## Công cụ hỗ trợ

| Tool | Schema | File config | Ghi |
|------|--------|-------------|-----|
| Droid CLI (Factory) | JSON `customModels` | `~/.factory/settings.local.json` | co |
| OpenCode | JSONC `provider` | `~/.config/opencode/opencode.jsonc` | co |
| Codex CLI (OpenAI) | TOML `model_providers` | `~/.codex/config.toml` | co |
| Claude Code | JSON `env` | `~/.claude/settings.json` | co |
| Gemini CLI | dotenv | `~/.gemini/.env` | co |
| Claude Desktop | JSON `mcpServers` + launcher | `%APPDATA%/Claude/...` | co (MCP + LLM proxy) |
| Warp | TOML `custom_endpoints` | `%LOCALAPPDATA%/warp/Warp/config/settings.toml` | co |

## Tính năng

- Giao diện frameless, bo góc, viền aurora
- Quản lý provider cho 7 tool AI từ 1 nơi duy nhất
- Test endpoint trực tiếp từ app (Anthropic native + OpenAI-compatible)
- Hệ thống Preset: lưu cấu hình hay dùng, áp nhanh cho nhiều tool
- Backup tự động trước mỗi lần ghi (`<file>.lyno-bak`)
- API key che (mask) khi hiển thị, chỉ lưu raw trong config gốc

## Chạy từ source

Bấm đôi `Launch-LynoAIO.bat` — tự xin quyền Administrator, tự cài dependencies lần đầu, rồi mở app.

Hoặc thủ công:
```
npm install
npm start
```

## Đóng gói installer .exe
```
npm run dist
```
Output ở `build/` (NSIS installer, ~80 MB).

## An toàn

- Mỗi lần ghi đều backup file cũ thành `<file>.lyno-bak`
- API key che (mask) khi hiển thị, chỉ lưu raw trong config gốc
- `contextIsolation` bật, không `nodeIntegration` ở renderer
- Không gửi bất kỳ dữ liệu nào ra ngoài — hoàn toàn offline

## Tác giả

Lyno
