# Script PowerShell para iniciar ngrok
# Uso: .\scripts\start-ngrok.ps1

$PORT = 3000

Write-Host "🌐 Iniciando ngrok en puerto $PORT..." -ForegroundColor Cyan

# Intentar encontrar ngrok
$ngrokPath = $null

# Buscar en PATH
if (Get-Command ngrok -ErrorAction SilentlyContinue) {
    $ngrokPath = "ngrok"
} 
# Buscar en ubicaciones comunes
elseif (Test-Path "C:\ngrok\ngrok.exe") {
    $ngrokPath = "C:\ngrok\ngrok.exe"
}
elseif (Test-Path "$env:LOCALAPPDATA\Microsoft\WindowsApps\ngrok.exe") {
    $ngrokPath = "$env:LOCALAPPDATA\Microsoft\WindowsApps\ngrok.exe"
}
else {
    Write-Host "❌ ngrok no encontrado." -ForegroundColor Red
    Write-Host "💡 Descarga ngrok desde: https://ngrok.com/download" -ForegroundColor Yellow
    Write-Host "💡 O instala con: choco install ngrok" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ ngrok encontrado: $ngrokPath" -ForegroundColor Green
Write-Host "🚀 Iniciando túnel..." -ForegroundColor Cyan
Write-Host ""

# Iniciar ngrok
& $ngrokPath http $PORT