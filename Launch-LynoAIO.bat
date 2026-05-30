@echo off
REM Lyno AIO Provider Assistant - launcher (chay quyen Administrator de doc/ghi config)
cd /d "%~dp0"

REM Tu xin quyen admin neu chua co
net session >nul 2>&1
if %errorLevel% neq 0 (
  echo Dang xin quyen Administrator...
  powershell -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
  exit /b
)

REM Cai dependencies neu chua co node_modules
if not exist "node_modules\electron" (
  echo Lan dau chay - dang cai dependencies...
  call npm install --no-audit --no-fund
)

echo Khoi dong Lyno AIO Provider Assistant...
call npm start
