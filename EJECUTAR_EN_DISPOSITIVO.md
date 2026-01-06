# 📱 Cómo Ejecutar la App en tu Dispositivo POS

## ✅ Tu Backend ya está corriendo correctamente ✅

Veo que el backend está funcionando en el puerto 3000. Ahora solo necesitas ejecutar la app en el dispositivo.

## 🎯 Opción 1: Ejecutar Directamente en Android (Recomendado)

Si tu dispositivo POS está conectado por USB:

```bash
# 1. Configurar port forwarding (solo una vez por sesión)
adb reverse tcp:3000 tcp:3000
adb reverse tcp:8081 tcp:8081

# 2. Verificar que el dispositivo está conectado
adb devices

# 3. Ejecutar (en una nueva terminal, o detén el npm run dev actual)
npm run dev:android
```

Esto:
- ✅ Iniciará el backend
- ✅ Iniciará Expo
- ✅ Ejecutará automáticamente la app en tu dispositivo Android

## 🎯 Opción 2: Usar Expo Go (Escanear QR)

Si prefieres usar la app Expo Go:

1. **Detén el `npm run dev` actual** (Ctrl+C)

2. **Instala Expo Go** en tu dispositivo POS desde Google Play Store

3. **Ejecuta:**
   ```bash
   npm run dev
   ```

4. **Busca el QR code** en la terminal. Debería aparecer algo como:
   ```
   › Metro waiting on exp://192.168.0.100:8081
   › Scan the QR code above with Expo Go (Android) or the Camera app (iOS)
   ```

5. **Abre Expo Go** en tu dispositivo y escanea el QR

6. Si no ves el QR, presiona `s` en la terminal de Expo para mostrarlo

## 🎯 Opción 3: Modo Tunnel (Funciona desde cualquier red)

Si tu dispositivo está en una red diferente:

```bash
# Detén el npm run dev actual
# Luego ejecuta:
npm run start:tunnel
```

Esto creará un túnel que funciona desde cualquier red (más lento pero más confiable).

## 🔧 Si no ves el QR o el menú de Expo

En la terminal donde corre Expo, presiona:
- `a` - Para ejecutar en Android
- `s` - Para mostrar el QR code
- `w` - Para abrir en web
- `r` - Para recargar
- `m` - Para toggle menu

## 📋 Pasos Completos (Resumen)

### Para Dispositivo USB (Más Rápido):

```bash
# Terminal 1: Configurar puertos
adb reverse tcp:3000 tcp:3000
adb reverse tcp:8081 tcp:8081

# Terminal 2: Ejecutar todo
npm run dev:android
```

### Para Dispositivo WiFi (Misma red):

1. Ya configuraste la IP `192.168.0.100:3000` en `getLocalIP.ts` ✅
2. Asegúrate de que el firewall permita conexiones en el puerto 3000
3. Ejecuta:
   ```bash
   npm run dev
   ```
4. Presiona `a` en la terminal de Expo para ejecutar en Android
5. O escanea el QR con Expo Go

## 🐛 Troubleshooting

### "No devices found"
```bash
adb devices
# Si no aparece tu dispositivo:
# 1. Activa "Depuración USB" en el dispositivo
# 2. Acepta el diálogo de autorización
# 3. Prueba otro cable USB
```

### "Connection refused" o "Network error"
- Verifica que el backend esté corriendo: `http://localhost:3000/health`
- Si usas IP local, verifica que sea la correcta: `http://192.168.0.100:3000/health`
- Verifica el firewall de Windows

### La app carga pero no se conecta al backend
- Revisa la consola de React Native (en la terminal de Expo)
- Verifica que la URL en `bffClient.ts` sea correcta
- Si usas IP local, prueba desde el navegador del dispositivo: `http://192.168.0.100:3000/health`

## ✅ Verificación Final

Cuando la app esté corriendo, deberías ver:
1. ✅ La pantalla "Initializing" en el dispositivo
2. ✅ En la terminal de Expo: logs de React Native
3. ✅ En la terminal del backend: logs de las peticiones API
4. ✅ La app navega correctamente según el flujo

---

**¿Qué método prefieres usar?** USB es más rápido, WiFi es más flexible.