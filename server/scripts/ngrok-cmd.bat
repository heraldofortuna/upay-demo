@echo off
REM Script para iniciar ngrok usando ngrok.cmd (evita problemas de PowerShell)
REM Uso: scripts\ngrok-cmd.bat

set PORT=3000

echo 🌐 Iniciando ngrok en puerto %PORT%...
echo.

REM Intentar usar ngrok.cmd primero
where ngrok.cmd >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Usando ngrok.cmd
    ngrok.cmd http %PORT%
    goto :end
)

REM Intentar ngrok normal
where ngrok >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Usando ngrok
    ngrok http %PORT%
    goto :end
)

REM Buscar en ubicaciones comunes
if exist "C:\ngrok\ngrok.exe" (
    echo ✅ Usando ngrok desde C:\ngrok\
    C:\ngrok\ngrok.exe http %PORT%
    goto :end
)

echo ❌ ngrok no encontrado.
echo 💡 Descarga ngrok desde: https://ngrok.com/download
echo 💡 O instala con: choco install ngrok
pause
exit /b 1

:end