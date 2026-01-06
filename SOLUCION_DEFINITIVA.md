# 🔧 Solución Definitiva: Error Metro Bundler

## ❌ Error Actual:
```
SocketTimeoutException: failed to connect to /192.168.0.100 (port 8081)
```

## 🎯 Problema Real

Expo está detectando automáticamente tu IP (`192.168.0.100`) y la está usando para Metro Bundler, pero cuando el dispositivo está conectado por USB, debe usar `localhost` con `adb reverse`.

## ✅ Solución Aplicada

He actualizado los scripts para forzar a Expo a usar `localhost`:

1. ✅ `npm start` ahora usa `--localhost`
2. ✅ `npm run android` ahora usa `--localhost`
3. ✅ `npm run dev:android` ahora usa `--localhost`

## 🚀 Pasos para Solucionar

### 1. Detén todo (Ctrl+C en la terminal donde corre npm run dev)

### 2. Limpia el cache de Metro:
```bash
npx expo start --clear
```

O manualmente:
```bash
rm -rf node_modules/.cache
# En Windows:
rmdir /s /q node_modules\.cache
```

### 3. Verifica que adb reverse esté activo:
```bash
adb reverse --list
```

Debería mostrar:
```
UsbFfs tcp:8081 tcp:8081
UsbFfs tcp:3000 tcp:3000
```

### 4. Reinicia todo con el nuevo script:
```bash
npm run dev:android
```

Esto ahora:
- ✅ Iniciará el backend
- ✅ Iniciará Expo con `--localhost` (forzando localhost)
- ✅ Ejecutará en Android automáticamente

## 🔍 Verificación

### 1. En la terminal de Expo deberías ver:
```
Metro waiting on exp://localhost:8081
```

**NO debería decir:**
```
Metro waiting on exp://192.168.0.100:8081
```

### 2. En el dispositivo:
- La app debería cargar sin errores
- No debería haber timeout en el puerto 8081

### 3. Verifica backend desde el dispositivo:
Abre el navegador del dispositivo y ve a:
- `http://localhost:3000/health` → Debe responder `{"status":"ok"}`

## 🐛 Si Sigue Fallando

### Opción A: Limpiar todo y empezar de nuevo
```bash
# 1. Detén todo
# 2. Limpia cache
npx expo start --clear --localhost

# 3. En otra terminal, inicia backend
npm run dev:bff

# 4. En la terminal de Expo, presiona 'a' para Android
```

### Opción B: Usar modo tunnel (más lento pero funciona siempre)
```bash
# Detén todo
# Luego:
npm run start:tunnel
# En otra terminal:
npm run dev:bff
```

### Opción C: Verificar que el dispositivo puede acceder a localhost
```bash
# Desde el dispositivo, abre el navegador y prueba:
http://localhost:3000/health
http://localhost:8081

# Si no funciona, el problema es con adb reverse
# Prueba:
adb reverse --remove-all
adb reverse tcp:3000 tcp:3000
adb reverse tcp:8081 tcp:8081
```

## 📝 Cambios Realizados

1. ✅ `package.json` - Scripts actualizados con `--localhost`
2. ✅ `adb reverse` configurado para puertos 3000 y 8081
3. ✅ `getLocalIP.ts` configurado para usar `localhost:3000`

## ✅ Próximos Pasos

1. **Detén** `npm run dev` actual (Ctrl+C)
2. **Limpia cache**: `npx expo start --clear` (luego Ctrl+C)
3. **Ejecuta**: `npm run dev:android`
4. **Verifica** que en la terminal diga `exp://localhost:8081` (no la IP)

---

**Después de estos pasos, debería funcionar.** El problema era que Expo estaba usando la IP automáticamente en lugar de localhost.