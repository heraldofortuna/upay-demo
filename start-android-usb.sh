#!/bin/bash
# Script para iniciar Expo con conexión USB en dispositivos Android

echo "Configurando port forwarding USB..."
adb reverse tcp:8081 tcp:8081

echo "Verificando dispositivo conectado..."
adb devices

echo "Iniciando Expo en modo localhost para USB..."
EXPO_DEVTOOLS_LISTEN_ADDRESS=localhost expo start --localhost --android
