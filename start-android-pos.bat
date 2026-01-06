@echo off
echo ========================================
echo Configurando dispositivo POS Android
echo ========================================
echo.

echo Verificando dispositivo conectado...
adb devices
echo.

echo Configurando port forwarding para el backend (puerto 3000)...
adb reverse tcp:3000 tcp:3000
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: No se pudo configurar el port forwarding
    echo Asegurate de que el dispositivo este conectado y con depuracion USB activada
    pause
    exit /b 1
)

echo Configurando port forwarding para Metro Bundler (puerto 8081)...
adb reverse tcp:8081 tcp:8081
if %ERRORLEVEL% NEQ 0 (
    echo ADVERTENCIA: No se pudo configurar el port forwarding para Metro
)

echo.
echo ========================================
echo Port forwarding configurado correctamente
echo ========================================
echo.
echo Ahora puedes ejecutar: npm run dev
echo O presiona cualquier tecla para iniciar automaticamente...
pause > nul

echo.
echo Iniciando backend y frontend...
npm run dev