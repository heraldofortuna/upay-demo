@echo off
REM Script batch para iniciar ngrok en Windows
REM Uso: scripts\start-ngrok.bat

set PORT=3000

echo 🌐 Iniciando ngrok en puerto %PORT%...

REM Intentar encontrar ngrok
where ngrok >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ ngrok encontrado en PATH
    ngrok http %PORT%
    goto :end
)

REM Buscar en ubicaciones comunes
if exist "C:\ngrok\ngrok.exe" (
    echo ✅ ngrok encontrado en C:\ngrok\
    C:\ngrok\ngrok.exe http %PORT%
    goto :end
)

echo ❌ ngrok no encontrado.
echo 💡 Descarga ngrok desde: https://ngrok.com/download
echo 💡 O instala con: choco install ngrok
pause
exit /b 1

:end