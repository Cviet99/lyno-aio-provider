<div align="center">

# Lyno AIO Provider Assistant

**Trình quản lý cấu hình API provider tập trung cho các công cụ AI CLI và IDE**

Đọc và ghi config trực tiếp trên máy, tự động sao lưu trước khi sửa, khóa API lưu hoàn toàn cục bộ.

![Platform](https://img.shields.io/badge/platform-Windows-0A84FF)
![Electron](https://img.shields.io/badge/Electron-33.x-47848F)
![License](https://img.shields.io/badge/license-MIT-22C55E)

</div>

---

## Giới thiệu

Mỗi công cụ AI dùng một định dạng cấu hình khác nhau — JSON, JSONC, TOML, dotenv, mỗi loại nằm ở một đường dẫn riêng với schema riêng. Việc thêm hay đổi một provider thường phải mở từng file, nhớ đúng cú pháp và dễ ghi sai.

Lyno AIO Provider Assistant gom toàn bộ việc đó về một nơi. Một giao diện duy nhất để khai báo provider, model và endpoint cho bảy công cụ, ứng dụng tự lo phần đọc/ghi đúng định dạng cho từng loại.

## Tính năng chính

- **Quản lý tập trung** — cấu hình provider cho 7 công cụ AI từ một cửa sổ
- **Đọc/ghi đúng schema** — JSON, JSONC, TOML, dotenv đều được xử lý tự động
- **Kiểm tra endpoint** — test kết nối ngay trong app (hỗ trợ Anthropic native và OpenAI-compatible)
- **Hệ thống Preset** — lưu cấu hình hay dùng, áp nhanh cho nhiều công cụ
- **Sao lưu tự động** — mỗi lần ghi đều backup file cũ thành `<file>.lyno-bak`
- **Bảo mật cục bộ** — khóa API che khi hiển thị, không gửi bất kỳ dữ liệu nào ra ngoài
- **Giao diện hiện đại** — frameless, bo góc, hiệu ứng aurora, thao tác mượt

## Công cụ được hỗ trợ

| Công cụ | Định dạng | Đường dẫn cấu hình | Provider hỗ trợ |
|---------|-----------|--------------------|-----------------|
| **Droid CLI** (Factory) | JSON | `~/.factory/settings.local.json` | Anthropic, OpenAI, Generic Chat Completion |
| **OpenCode** | JSONC | `~/.config/opencode/opencode.jsonc` | AI SDK (OpenAI-compatible, Anthropic, OpenAI) |
| **Codex CLI** (OpenAI) | TOML | `~/.codex/config.toml` | OpenAI, OSS, Azure |
| **Claude Code** | JSON | `~/.claude/settings.json` | Anthropic native, Bedrock, Vertex |
| **Gemini CLI** | JSON + dotenv | `~/.gemini/settings.json` | Google, OpenAI-compatible, Vertex |
| **Claude Desktop** | JSON + launcher | `%APPDATA%/Claude/` | MCP servers, LLM proxy |
| **Warp** | TOML | `%LOCALAPPDATA%/warp/Warp/config/settings.toml` | BYOK (Anthropic/OpenAI/Google), Custom Endpoint |

### Lưu ý theo từng công cụ

- **Claude Code** dùng Anthropic API native (`/v1/messages`), không phải OpenAI-compatible. Có thể trỏ qua proxy bằng `ANTHROPIC_AUTH_TOKEN`, hoặc dùng khóa Anthropic thật qua `ANTHROPIC_API_KEY`.
- **Claude Desktop** hỗ trợ hai chế độ: MCP servers (chính thức) và LLM proxy. Với chế độ proxy, ứng dụng tạo một launcher `.bat` để set biến môi trường trước khi mở Claude.exe.
- **Warp** lưu khóa API trong Windows Credential Manager. Ứng dụng ghi endpoint và model vào `settings.toml`, sau đó bạn dán khóa qua **Warp Settings → API keys / inference endpoint**.

## Cài đặt

Tải installer từ [Releases](https://github.com/Cviet99/lyno-aio-provider/releases) và chạy. Ứng dụng yêu cầu quyền Administrator để ghi config vào thư mục người dùng.

## Chạy từ mã nguồn

```bash
npm install
npm start
```

## Đóng gói installer

```bash
npm run dist
```

Kết quả nằm trong thư mục `build/` (NSIS installer cho Windows x64).

## Bảo mật và an toàn

- Mỗi lần ghi đều sao lưu file cũ thành `<file>.lyno-bak` trước khi thay đổi
- Khóa API được che (mask) khi hiển thị, chỉ lưu nguyên bản trong config gốc của từng công cụ
- `contextIsolation` được bật, không dùng `nodeIntegration` ở renderer
- Hoạt động hoàn toàn offline — không có dữ liệu nào rời khỏi máy của bạn

## Công nghệ

Electron 33 · GSAP · @iarna/toml · electron-builder

## Tác giả

**Lyno**

## Giấy phép

MIT
