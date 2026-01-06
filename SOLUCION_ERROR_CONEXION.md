# 🔧 Solución: Error de Conexión SocketTimeoutException

## ❌ Error que estás viendo:
```
SocketTimeoutException: failed to connect to /192.168.0.100 (port 8081)
```

## 🎯 Problema

El dispositivo está intentando conectarse a `192.168.0.100:8081` (Metro Bundler) pero:
- Si está conectado por **USB**, debe usar `localhost` con `adb reverse`
- Si está en **WiFi**, necesita la IP correcta y que ambos estén en la misma red

## ✅ Solución para USB (Tu caso)

Ya ejecuté los comandos para configurar `adb reverse`. Ahora:

### 1. Verifica que los puertos estén configurados:
```bash
adb reverse --list
```

Debería mostrar:
```
3000 tcp:3000
8081 tcp:8081
```

### 2. Cambié la configuración a `localhost`

Ya actualicé `src/utils/getLocalIP.ts` para usar `localhost:3000` en lugar de la IP.

### 3. Reinicia la app

**Opción A: Desde la terminal de Expo**
- Presiona `r` para recargar
- O presiona `a` para ejecutar de nuevo en Android

**Opción B: Reiniciar todo**
```bash
# Detén npm run dev (Ctrl+C)
# Luego ejecuta:
npm run dev:android
```

## 🔍 Verificar que Funciona

### 1. Verificar adb reverse:
```bash
adb reverse --list
```

### 2. Verificar backend desde el dispositivo:
Abre el navegador del dispositivo y ve a:
- `http://localhost:3000/health` → Debe responder `{"status":"ok"}`

### 3. Verificar en la app:
- La app debería cargar sin errores de conexión
- Debería mostrar la pantalla "Initializing"
- No debería haber errores de red en la consola

## 🐛 Si Sigue Fallando

### Error: "Connection refused"
```bash
# Verifica que el backend esté corriendo
curl http://localhost:3000/health

# Si no responde, reinicia el backend:
npm run dev:bff
```

### Error: "Device not found"
```bash
# Verifica que el dispositivo esté conectado
adb devices

# Si no aparece:
# 1. Activa "Depuración USB" en el dispositivo
# 2. Acepta el diálogo de autorización
# 3. Prueba otro cable USB
```

### Error: "Port already in use"
```bash
# Limpia los port forwards
adb reverse --remove-all

# Luego configura de nuevo
adb reverse tcp:3000 tcp:3000
adb reverse tcp:8081 tcp:8081
```

## 📝 Nota sobre WiFi

Si más adelante quieres usar WiFi en lugar de USB:

1. Obtén tu IP local:
   ```bash
   ipconfig
   ```

2. Cambia en `src/utils/getLocalIP.ts`:
   ```typescript
   return 'http://TU_IP:3000'; // Ejemplo: 'http://192.168.1.100:3000'
   ```

3. Asegúrate de que el firewall permita conexiones en el puerto 3000

## ✅ Estado Actual

- ✅ Dispositivo conectado: `NCC804386438`
- ✅ `adb reverse` configurado para puertos 3000 y 8081
- ✅ Configuración cambiada a `localhost:3000`
- ⏳ **Siguiente paso:** Reinicia la app

---

**Reinicia la app ahora y debería funcionar.** Si sigue fallando, comparte el nuevo error.