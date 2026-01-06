# 📱 Configurar Dispositivo POS Físico

## 🎯 Problema

Cuando ejecutas la app en un dispositivo físico, `localhost` apunta al dispositivo, no a tu computadora. Necesitas configurar la conexión para que el dispositivo pueda acceder al backend.

## ✅ Solución 1: ADB Reverse (Recomendado para Android USB)

Si tu dispositivo POS está conectado por USB:

```bash
# Configurar port forwarding para el backend (puerto 3000)
adb reverse tcp:3000 tcp:3000

# También para Metro Bundler (puerto 8081) si es necesario
adb reverse tcp:8081 tcp:8081

# Verificar que el dispositivo está conectado
adb devices
```

Luego ejecuta la app normalmente:
```bash
npm run dev
# o
npm run android
```

**Ventaja:** Funciona con `localhost` sin cambios en el código.

## ✅ Solución 2: Usar IP Local (Para dispositivos en la misma red WiFi)

Si tu dispositivo está en la misma red WiFi que tu computadora:

### Paso 1: Obtener tu IP local

**Windows:**
```bash
ipconfig
# Busca "IPv4 Address" en la sección de tu adaptador WiFi/Ethernet
# Ejemplo: 192.168.1.100
```

**Mac/Linux:**
```bash
ifconfig
# o
ip addr show
```

### Paso 2: Configurar la URL en el código

Edita `src/services/bffClient.ts` y cambia:

```typescript
const BFF_BASE_URL = __DEV__ 
  ? 'http://TU_IP_AQUI:3000'  // Ejemplo: 'http://192.168.1.100:3000'
  : 'https://api.upay.com';
```

### Paso 3: Asegúrate de que el firewall permita conexiones

**Windows:**
- Abre "Firewall de Windows Defender"
- Permite Node.js a través del firewall
- O desactiva temporalmente el firewall para desarrollo

**Mac:**
- Sistema > Preferencias del Sistema > Seguridad y Privacidad > Firewall
- Permite conexiones entrantes para Node.js

### Paso 4: Ejecutar

```bash
npm run dev
```

Luego escanea el QR de Expo o ejecuta directamente en el dispositivo.

## ✅ Solución 3: Tunnel Mode (Más fácil, pero más lento)

Usa el modo tunnel de Expo que funciona desde cualquier red:

```bash
# En una terminal, inicia el backend
npm run dev:bff

# En otra terminal, inicia Expo en modo tunnel
npm run start:tunnel
# o
npm run android:tunnel
```

**Ventaja:** Funciona desde cualquier red, sin configuración.
**Desventaja:** Más lento porque pasa por los servidores de Expo.

## ✅ Solución 4: Script Automático (Windows)

He creado un script que configura todo automáticamente:

```bash
# Ejecuta este script antes de iniciar la app
.\start-android-usb.bat
```

O manualmente:
```bash
adb reverse tcp:3000 tcp:3000
adb reverse tcp:8081 tcp:8081
npm run dev
```

## 🔍 Verificar que Funciona

### 1. Verificar Backend
Desde tu navegador en la PC:
- `http://localhost:3000/health` → Debe responder `{"status":"ok"}`

### 2. Verificar desde el Dispositivo

**Si usas IP local:**
- Abre el navegador del dispositivo
- Ve a `http://TU_IP:3000/health`
- Debe responder `{"status":"ok"}`

**Si usas adb reverse:**
- Desde el dispositivo, `http://localhost:3000/health` debería funcionar

### 3. Verificar en la App

La app debería:
- ✅ Cargar la pantalla "Initializing"
- ✅ No mostrar errores de conexión en la consola
- ✅ Navegar correctamente según el flujo

## 🐛 Troubleshooting

### Error: "Network request failed"
- Verifica que el backend esté corriendo
- Verifica que la IP/URL sea correcta
- Verifica el firewall
- Prueba acceder desde el navegador del dispositivo

### Error: "Connection refused"
- El backend no está corriendo o no está escuchando en el puerto correcto
- Verifica con `netstat -an | findstr 3000` (Windows) o `lsof -i :3000` (Mac/Linux)

### El dispositivo no aparece en `adb devices`
- Activa "Depuración USB" en el dispositivo
- Acepta el diálogo de autorización en el dispositivo
- Prueba otro cable USB

### La app carga pero no se conecta al backend
- Revisa la consola de React Native para ver la URL que está usando
- Verifica que `bffClient.ts` tenga la URL correcta
- Reinicia el Metro Bundler: `npm start -- --reset-cache`

## 📝 Configuración Recomendada por Tipo de Dispositivo

### Android Físico (USB)
```bash
adb reverse tcp:3000 tcp:3000
npm run dev
```

### Android Físico (WiFi)
1. Obtén tu IP local
2. Edita `src/services/bffClient.ts` con tu IP
3. `npm run dev`

### Emulador Android
```bash
# Funciona directamente con localhost
npm run dev
```

### iOS Simulador
```bash
# Funciona directamente con localhost
npm run dev
```

### iOS Físico
1. Obtén tu IP local
2. Edita `src/services/bffClient.ts` con tu IP
3. Asegúrate de estar en la misma red WiFi
4. `npm run dev`

## 💡 Tip: Variable de Entorno

Puedes crear un archivo `.env` en la raíz del proyecto:

```env
EXPO_PUBLIC_BFF_URL=http://192.168.1.100:3000
```

Y modificar `getBFFBaseURL()` para leerlo. Esto evita cambiar el código cada vez.