# 🏗️ Arquitectura del Proyecto

Este documento describe la arquitectura del proyecto y cómo mantener la separación entre los modos **SDUI (BFF)** y **OTA**.

---

## 📐 Visión General

El proyecto soporta **dos modos de ejecución independientes** que comparten código común pero tienen fuentes de datos diferentes:

1. **SDUI (Server-Driven UI)**: Pantallas definidas dinámicamente desde el servidor BFF
2. **OTA (Over-The-Air)**: Pantallas definidas en archivos JSON locales actualizables vía OTA

Ambos modos usan el mismo motor de renderizado (`SDUIRenderer`) pero cargan las definiciones desde fuentes diferentes.

---

## 🔀 Separación de Flujos

### Modo SDUI (BFF) - Por Defecto

**Características:**
- ✅ Pantallas definidas dinámicamente desde el servidor
- ✅ Cambios instantáneos sin actualizar la app
- ✅ Requiere servidor BFF corriendo
- ✅ Ideal para A/B testing y personalización

**Componentes Clave:**
- **Servicio**: `src/services/bffClient.ts`
  - Método: `bffClient.getScreenDefinition()`
  - Fuente: Servidor BFF en `http://localhost:3000/api/screens/:screenId`
  
- **Navegador**: `src/navigation/AppNavigator.tsx` o `AppNavigatorSDUI.tsx`
  
- **Variable de Entorno**: `EXPO_PUBLIC_APP_MODE=sdui` (o sin definir, es el default)
  
- **Definiciones**: 
  - Servidor BFF (MongoDB o JSON en `server/data/screenDefinitions.json`)
  - Endpoint: `GET /api/screens/:screenId`
  - Admin: `PATCH /api/admin/screens/:screenId/text`

**Flujo de Datos:**
```
App.tsx
  └─> AppNavigator (SDUI)
       └─> SDUIScreen
            └─> bffClient.getScreenDefinition()
                 └─> Servidor BFF (puerto 3000)
                      └─> MongoDB o JSON
                           └─> SDUIRenderer
```

**Scripts:**
```bash
npm run dev:sdui              # Desarrollo local
npm run dev:android:sdui      # Android con BFF
```

---

### Modo OTA

**Características:**
- ✅ Pantallas definidas en archivos JSON locales
- ✅ Actualizaciones vía OTA sin rebuild
- ✅ No requiere servidor BFF
- ✅ Más control sobre el código

**Componentes Clave:**
- **Servicio**: `src/services/localScreenService.ts`
  - Método: `getLocalScreenDefinition()`
  - Fuente: `src/config/screenDefinitions.json`
  
- **Navegador**: `src/navigation/AppNavigatorOTA.tsx`
  
- **Variable de Entorno**: `EXPO_PUBLIC_APP_MODE=ota`
  
- **Definiciones**: 
  - Archivo local: `src/config/screenDefinitions.json`
  - Actualizable vía OTA (Expo Updates)
  - No requiere servidor

**Flujo de Datos:**
```
App.tsx
  └─> AppNavigatorOTA
       └─> SDUIScreen
            └─> getLocalScreenDefinition()
                 └─> screenDefinitions.json (local)
                      └─> SDUIRenderer
```

**Scripts:**
```bash
npm run start:ota             # Desarrollo local
npm run dev:android:ota       # Android
npm run publish:ota           # Publicar actualización OTA
```

---

## 🎯 Punto de Separación Crítico

El punto donde se decide qué flujo usar está en `src/screens/SDUIScreen.tsx`:

```typescript
// Líneas 177-188
const appMode = process.env.EXPO_PUBLIC_APP_MODE || 'sdui';
const useLocalDefinitions = appMode === 'ota';

let def: SDUIDefinition;
if (useLocalDefinitions) {
  // OTA: Carga desde JSON local
  console.log('[SDUIScreen] Using local definitions (OTA mode)');
  def = await getLocalScreenDefinition(screenId, stateRef.current);
} else {
  // SDUI: Carga desde servidor BFF
  console.log('[SDUIScreen] Using BFF definitions (SDUI mode)');
  def = await bffClient.getScreenDefinition(screenId, stateRef.current);
}
```

**⚠️ IMPORTANTE**: Esta lógica debe mantenerse intacta. Cualquier cambio aquí afecta ambos flujos.

---

## 📁 Estructura de Archivos

### Archivos Compartidos (Usados por Ambos Modos)

```
src/
├── engine/
│   └── SDUIRenderer.tsx          # Motor de renderizado (compartido)
├── screens/
│   └── SDUIScreen.tsx            # Pantalla genérica (compartida)
└── components/                   # Componentes UI (compartidos)
```

### Archivos Específicos de SDUI (BFF)

```
src/
├── services/
│   └── bffClient.ts              # Cliente para servidor BFF
└── navigation/
    ├── AppNavigator.tsx          # Navegador SDUI (default)
    └── AppNavigatorSDUI.tsx      # Navegador SDUI alternativo

server/
├── src/
│   ├── definitions/
│   │   └── screens.js            # Definiciones por defecto (servidor)
│   ├── models/
│   │   └── ScreenDefinition*.js  # Modelos de datos (MongoDB/JSON)
│   ├── routes/
│   │   ├── screens.js            # API: GET /api/screens/:screenId
│   │   └── admin.js              # API: PATCH /api/admin/screens/:screenId/text
│   └── services/
│       └── screenService.js      # Servicio de definiciones
```

### Archivos Específicos de OTA

```
src/
├── services/
│   └── localScreenService.ts     # Servicio para cargar JSON local
├── config/
│   └── screenDefinitions.json    # Definiciones actualizables vía OTA
└── navigation/
    └── AppNavigatorOTA.tsx       # Navegador OTA
```

---

## 🔒 Reglas para Mantener la Separación

### ✅ DO (Hacer)

1. **Cambios en OTA:**
   - Modificar solo `localScreenService.ts` y `screenDefinitions.json`
   - Probar con `npm run dev:android:ota`
   - Verificar que no afecta el modo SDUI

2. **Cambios en SDUI:**
   - Modificar solo `bffClient.ts` y código del servidor BFF
   - Probar con `npm run dev:android:sdui`
   - Verificar que no afecta el modo OTA

3. **Cambios Compartidos:**
   - Mantener la lógica condicional en `SDUIScreen.tsx`
   - Probar ambos modos después de cambios
   - Documentar cambios que afecten ambos flujos

4. **Nuevas Funcionalidades:**
   - Si es específica de un modo, implementarla solo en ese flujo
   - Si es compartida, usar la detección de modo (`appMode === 'ota'`)

### ❌ DON'T (No Hacer)

1. **Nunca mezclar servicios:**
   ```typescript
   // ❌ MAL
   const def = appMode === 'ota' 
     ? await bffClient.getScreenDefinition()  // ERROR: OTA no usa BFF
     : await getLocalScreenDefinition();
   ```

2. **Nunca cambiar la lógica de detección sin verificar ambos flujos:**
   ```typescript
   // ❌ MAL - Cambiar el default sin verificar
   const appMode = process.env.EXPO_PUBLIC_APP_MODE || 'ota';  // ERROR
   ```

3. **Nunca modificar archivos compartidos sin considerar ambos modos:**
   - `SDUIRenderer.tsx` - Usado por ambos
   - `SDUIScreen.tsx` - Usado por ambos
   - Componentes UI - Usados por ambos

4. **Nunca hardcodear valores específicos de un modo:**
   ```typescript
   // ❌ MAL
   const baseUrl = 'http://localhost:3000';  // Solo funciona en SDUI
   ```

---

## 🧪 Testing de Separación

Antes de hacer cambios, verifica que ambos modos funcionan:

### Test SDUI (BFF)
```bash
# Terminal 1: Iniciar BFF
npm run dev:bff

# Terminal 2: Iniciar app en modo SDUI
npm run dev:android:sdui

# Verificar:
# - La app carga correctamente
# - Las definiciones vienen del servidor
# - Los cambios PATCH se reflejan
```

### Test OTA
```bash
# Iniciar app en modo OTA (sin BFF)
npm run dev:android:ota

# Verificar:
# - La app carga correctamente
# - Las definiciones vienen del JSON local
# - No hay errores de conexión al BFF
```

---

## 🔄 Flujo de Actualización de Definiciones

### SDUI (BFF) - Cambios Instantáneos

```
1. Hacer PATCH a /api/admin/screens/:screenId/text
   {
     "search": "uPOS",
     "replace": "Hera"
   }

2. Servidor guarda en MongoDB/JSON
   └─> saveDefinition(screenId, updated)

3. App recarga automáticamente:
   - Al volver al foco de la pantalla
   - Al navegar y volver
   - Con cache busting (timestamp en URL)

4. Cambios visibles inmediatamente
```

### OTA - Cambios vía Actualización

```
1. Editar src/config/screenDefinitions.json
   {
     "LinkingStep1": {
       "layout": {
         "children": [
           {
             "type": "text",
             "props": {
               "text": "¡Bienvenido a Hera!"
             }
           }
         ]
       }
     }
   }

2. Publicar actualización OTA
   npm run publish:ota

3. App descarga actualización automáticamente
   └─> Expo Updates detecta nueva versión

4. App se reinicia con nueva versión
   └─> Cambios visibles después del reinicio
```

---

## 🐛 Troubleshooting

### Problema: Cambios en OTA no se ven en SDUI

**Causa**: Estás editando `screenDefinitions.json` pero el modo SDUI usa el servidor BFF.

**Solución**: 
- Para SDUI: Hacer PATCH al servidor BFF
- Para OTA: Editar `screenDefinitions.json` y publicar OTA

### Problema: Cambios en BFF no se ven en la app

**Causa**: Caché o la app no está recargando.

**Solución**:
1. Verificar que estás en modo SDUI (`EXPO_PUBLIC_APP_MODE=sdui`)
2. Navegar a otra pantalla y volver
3. Verificar logs: `[SDUIScreen] Using BFF definitions (SDUI mode)`
4. Verificar que el servidor BFF está corriendo

### Problema: La app carga definiciones incorrectas

**Causa**: Variable de entorno incorrecta o lógica de detección rota.

**Solución**:
1. Verificar `EXPO_PUBLIC_APP_MODE` en los scripts de `package.json`
2. Verificar logs en consola: `🔧 EXPO_PUBLIC_APP_MODE: sdui` o `ota`
3. Verificar logs en `SDUIScreen`: `Using local definitions` vs `Using BFF definitions`

---

## 📝 Checklist para Cambios

Antes de hacer cambios, verifica:

- [ ] ¿El cambio afecta solo OTA? → Modificar solo archivos OTA
- [ ] ¿El cambio afecta solo SDUI? → Modificar solo archivos SDUI
- [ ] ¿El cambio afecta ambos? → Mantener lógica condicional
- [ ] ¿Probé ambos modos después del cambio?
- [ ] ¿Los logs muestran el modo correcto?
- [ ] ¿Las definiciones se cargan desde la fuente correcta?

---

## 📚 Referencias

- [OTA_GUIDE.md](./OTA_GUIDE.md) - Guía completa de OTA
- [README.md](./README.md) - Documentación general
- [server/README.md](./server/README.md) - Documentación del BFF

---

**Última actualización**: 2026-01-09
