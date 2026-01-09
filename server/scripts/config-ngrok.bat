@echo off
REM Script para configurar ngrok con authtoken
REM Uso: scripts\config-ngrok.bat TU_AUTHTOKEN

if "%1"=="" (
    echo ❌ Error: Debes proporcionar tu authtoken
    echo.
    echo Uso: scripts\config-ngrok.bat TU_AUTHTOKEN
    echo.
    echo Para obtener tu authtoken:
    echo 1. Crea cuenta en: https://dashboard.ngrok.com/signup
    echo 2. Obtén token en: https://dashboard.ngrok.com/get-started/your-authtoken
    echo 3. Ejecuta: scripts\config-ngrok.bat TU_TOKEN
    echo.
    pause
    exit /b 1
)

set AUTHTOKEN=%1

echo 🔑 Configurando ngrok con authtoken...
echo.

REM Intentar usar ngrok.cmd
where ngrok.cmd >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Usando ngrok.cmd
    ngrok.cmd config add-authtoken %AUTHTOKEN%
    if %errorlevel% == 0 (
        echo.
        echo ✅ ngrok configurado correctamente!
        echo.
        echo Ahora puedes usar: ngrok.cmd http 3000
    ) else (
        echo ❌ Error al configurar ngrok
    )
    goto :end
)

REM Buscar ngrok.exe
if exist "C:\ngrok\ngrok.exe" (
    echo ✅ Usando ngrok desde C:\ngrok\
    C:\ngrok\ngrok.exe config add-authtoken %AUTHTOKEN%
    if %errorlevel% == 0 (
        echo.
        echo ✅ ngrok configurado correctamente!
    ) else (
        echo ❌ Error al configurar ngrok
    )
    goto :end
)

echo ❌ ngrok no encontrado
echo 💡 Asegúrate de tener ngrok instalado
pause
exit /b 1

:end
pause