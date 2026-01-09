# 📱 Guía de Aplicación OTA (Over-The-Air)

Esta guía explica cómo usar la aplicación con actualizaciones OTA, que convive con la aplicación SDUI en el mismo repositorio.

---

## 🎯 ¿Qué es OTA?

**Over-The-Air (OTA)** permite actualizar la aplicación sin pasar por las tiendas de aplicaciones (Google Play, App Store). Las actualizaciones se descargan y aplican automáticamente cuando hay nuevas versiones disponibles.

### Diferencias entre SDUI y OTA

| Característica | SDUI (BFF) | OTA |
|----------------|------------|-----|
| **Fuente de datos** | Backend BFF (servidor) | Archivos JSON locales (actualizables vía OTA) |
| **Actualizaciones** | Instantáneas (cambios en servidor) | Requiere publicación OTA |
| **Pantallas** | Renderizadas dinámicamente desde JSON del servidor | Renderizadas dinámicamente desde JSON local |
| **Backend** | Requiere servidor BFF corriendo | No requiere servidor (usa APIs directas) |
| **Flexibilidad** | Alta (cambios sin actualizar app) | Alta (cambios de UI sin rebuild, solo OTA) |
| **Cambios de UI** | ✅ Textos, botones, vistas (instantáneo) | ✅ Textos, botones, vistas (vía OTA) |

---

## 🚀 Inicio Rápido

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Ejecutar App OTA

#### Desarrollo Local

```bash
# Modo OTA (sin BFF)
npm run start:ota

# O con Android
npm run dev:android:ota
```

#### Con BFF (si necesitas APIs)

```bash
# El BFF sigue funcionando para APIs de negocio
npm run dev:bff  # En otra terminal
npm run start:ota
```

### 3. Publicar Actualización OTA

```bash
# Build inicial (solo la primera vez)
npm run build:ota

# Publicar actualización
npm run publish:ota
```

---

## 📋 Scripts Disponibles

### Desarrollo

| Script | Descripción |
|--------|-------------|
| `npm run start:ota` | Inicia Expo en modo OTA |
| `npm run dev:android:ota` | Inicia en Android con OTA |
| `npm run start:sdui` | Inicia Expo en modo SDUI |
| `npm run dev:sdui` | Inicia BFF + Expo en modo SDUI |

### Producción

| Script | Descripción |
|--------|-------------|
| `npm run build:ota` | Build de la app para producción |
| `npm run publish:ota` | Publica actualización OTA |

---

## 🔧 Configuración

### Variable de Entorno

La app elige entre SDUI y OTA mediante la variable `APP_MODE`:

```bash
# Modo OTA
APP_MODE=ota npm start

# Modo SDUI (por defecto)
APP_MODE=sdui npm start
# o simplemente
npm start
```

### app.json

La configuración de OTA está en `app.json`:

```json
{
  "expo": {
    "updates": {
      "enabled": true,
      "checkAutomatically": "ON_LOAD",
      "fallbackToCacheTimeout": 0,
      "url": "https://u.expo.dev/your-project-id"
    },
    "runtimeVersion": {
      "policy": "appVersion"
    }
  }
}
```

**Importante:** Necesitas configurar tu `projectId` de EAS en `app.json`.

---

## 📦 Cómo Funciona OTA

### 1. Estructura de la App OTA

```
App.tsx
  └─> AppNavigatorOTA (si APP_MODE=ota)
       └─> OTAWrapper (verifica actualizaciones)
            └─> NavigationContainer
                 └─> SDUIScreen (renderiza dinámicamente)
                      └─> localScreenService (carga desde JSON)
                           └─> screenDefinitions.json (actualizable vía OTA)
                                └─> SDUIRenderer (renderiza UI)
```

**Flujo de renderizado:**
1. `SDUIScreen` carga la definición desde `screenDefinitions.json`
2. `SDUIRenderer` renderiza los componentes según la definición
3. Al actualizar vía OTA, el JSON se actualiza y la UI cambia automáticamente

### 2. Flujo de Actualización

```
1. App inicia
   └─> OTAWrapper se monta
        └─> useOTAUpdates verifica actualizaciones
             └─> otaService.checkForUpdates()
                  └─> Si hay actualización:
                       ├─> Muestra alerta al usuario
                       ├─> Usuario acepta
                       └─> otaService.downloadAndApplyUpdate()
                            └─> Updates.reloadAsync() (reinicia app)
```

### 3. Servicios

#### `otaService.ts`
- `checkForUpdates()`: Verifica si hay actualizaciones
- `downloadAndApplyUpdate()`: Descarga y aplica actualización
- `getUpdateInfo()`: Obtiene info de la actualización actual

#### `useOTAUpdates.ts` (Hook)
- Maneja el estado de actualizaciones
- Verifica automáticamente al iniciar
- Verifica cuando la app vuelve al foreground
- Muestra alertas al usuario

---

## 🛠️ Desarrollo

### Agregar Nueva Pantalla OTA

**Método Recomendado: Usando SDUI (Sin código)**

1. Agrega la definición en `src/config/screenDefinitions.json`:

```json
{
  "MyNewScreen": {
    "id": "MyNewScreen",
    "type": "screen",
    "layout": {
      "type": "container",
      "style": {
        "flex": 1,
        "backgroundColor": "#FFFFFF",
        "padding": 24
      },
      "children": [
        {
          "type": "text",
          "props": {
            "text": "Mi Nueva Pantalla",
            "style": {
              "fontSize": 24,
              "fontWeight": "700",
              "color": "#333333"
            }
          }
        },
        {
          "type": "button",
          "props": {
            "title": "Volver",
            "variant": "primary",
            "onPress": {
              "type": "navigate",
              "screen": "Initializing"
            }
          }
        }
      ]
    }
  }
}
```

2. Agrega la ruta en `src/navigation/AppNavigatorOTA.tsx`:

```typescript
<Stack.Screen 
  name="MyNewScreen" 
  component={SDUIScreen}
  initialParams={{ screenId: 'MyNewScreen' }}
/>
```

3. Navegar desde otra pantalla:

```typescript
navigation.navigate('MyNewScreen');
// O usando SDUIScreen:
navigation.navigate('SDUIScreen', { screenId: 'MyNewScreen' });
```

**Método Alternativo: Componente React Native**

Si necesitas lógica compleja, puedes crear un componente tradicional en `src/screens/` y agregarlo al navegador.

### Modificar Pantalla Existente

#### Opción 1: Cambiar Código TypeScript/JavaScript

Edita el archivo de la pantalla en `src/screens/` y publica una actualización OTA:

```bash
npm run publish:ota
```

#### Opción 2: Cambiar Estructura UI (Recomendado) ✨

**¡Ahora puedes cambiar la estructura de UI sin tocar código!** Edita el archivo `src/config/screenDefinitions.json` para:

- ✅ **Añadir o quitar botones**
- ✅ **Añadir o quitar textos**
- ✅ **Cambiar el layout de vistas**
- ✅ **Modificar estilos**
- ✅ **Cambiar acciones y navegación**

**Ejemplo: Añadir un botón a LinkingStep1**

Edita `src/config/screenDefinitions.json`:

```json
{
  "LinkingStep1": {
    "id": "LinkingStep1",
    "type": "screen",
    "layout": {
      "type": "container",
      "children": [
        // ... contenido existente ...
        {
          "type": "container",
          "props": {
            "style": {
              "paddingBottom": 24
            },
            "children": [
              {
                "type": "button",
                "props": {
                  "title": "Comenzar",
                  "variant": "primary",
                  "onPress": {
                    "type": "navigate",
                    "screen": "LinkingStep2"
                  }
                }
              },
              {
                "type": "button",
                "props": {
                  "title": "Saltar",
                  "variant": "secondary",
                  "onPress": {
                    "type": "navigate",
                    "screen": "Waiting"
                  }
                }
              }
            ]
          }
        }
      ]
    }
  }
}
```

Luego publica la actualización:

```bash
npm run publish:ota
```

**Ejemplo: Quitar un texto**

Simplemente elimina el objeto del array `children`:

```json
{
  "LinkingStep1": {
    "layout": {
      "children": [
        {
          "type": "container",
          "props": {
            "children": [
              {
                "type": "text",
                "props": {
                  "text": "¡Te damos la bienvenida a tu uPOS!"
                }
              }
              // Eliminamos el segundo texto
            ]
          }
        }
      ]
    }
  }
}
```

**Ejemplo: Cambiar estilos**

Modifica cualquier propiedad `style`:

```json
{
  "type": "text",
  "props": {
    "text": "Nuevo texto",
    "style": {
      "fontSize": 32,
      "color": "#FF0000",
      "fontWeight": "700"
    }
  }
}
```

---

## 📤 Publicar Actualización OTA

### Requisitos Previos

1. **Cuenta de Expo/EAS:**
   ```bash
   npm install -g eas-cli
   eas login
   ```

2. **Configurar proyecto:**
   ```bash
   eas build:configure
   ```

3. **Configurar projectId en app.json:**
   ```json
   {
     "expo": {
       "extra": {
         "eas": {
           "projectId": "tu-project-id"
         }
       }
     }
   }
   ```

### Proceso de Publicación

#### 1. Build Inicial (Solo la Primera Vez)

```bash
# Build para Android
npm run build:ota

# O manualmente:
eas build --platform android --profile production
```

#### 2. Publicar Actualización

```bash
# Publicar actualización OTA
npm run publish:ota

# O manualmente:
eas update --branch production --message "Descripción de la actualización"
```

#### 3. Verificar Actualización

La app verificará automáticamente la actualización al iniciar. También puedes forzar la verificación:

```typescript
import { otaService } from './services/otaService';

// Verificar manualmente
const updateInfo = await otaService.checkForUpdates();
if (updateInfo.isAvailable) {
  await otaService.downloadAndApplyUpdate();
}
```

---

## 🔍 Debugging

### Verificar Estado de Actualizaciones

```typescript
import { otaService } from './services/otaService';

// Info de la actualización actual
const info = otaService.getUpdateInfo();
console.log('Update ID:', info.updateId);
console.log('Runtime Version:', info.runtimeVersion);
console.log('Channel:', info.channel);

// Verificar si OTA está habilitado
console.log('OTA Enabled:', otaService.isOTAEnabled());
```

### Logs

Las actualizaciones OTA generan logs en la consola:

```
📦 Nueva actualización disponible, descargando...
✅ Actualización OTA aplicada
❌ Error en actualización OTA: [error]
```

### Modo Desarrollo

En modo desarrollo (`__DEV__ = true`), las actualizaciones OTA están deshabilitadas. Solo funcionan en builds de producción.

---

## ⚠️ Consideraciones

### 1. Runtime Version

El `runtimeVersion` en `app.json` determina qué actualizaciones son compatibles:

```json
{
  "runtimeVersion": {
    "policy": "appVersion"  // Usa la versión de la app
  }
}
```

**Importante:** Si cambias el `runtimeVersion`, necesitas hacer un nuevo build. Las actualizaciones OTA solo funcionan dentro del mismo `runtimeVersion`.

### 2. Actualizaciones Nativas

Las actualizaciones OTA **NO** pueden cambiar:
- Código nativo (Java, Swift, Objective-C)
- Dependencias nativas
- Configuración de `app.json` que requiera rebuild

Solo pueden actualizar:
- Código JavaScript/TypeScript
- Assets (imágenes, fuentes, etc.)

### 3. Canales de Actualización

Puedes usar diferentes canales para diferentes entornos:

```bash
# Producción
eas update --branch production

# Staging
eas update --branch staging

# Desarrollo
eas update --branch development
```

Configura el canal en `app.json` o mediante variables de entorno.

---

## 📚 Recursos

- [Expo Updates Documentation](https://docs.expo.dev/versions/latest/sdk/updates/)
- [EAS Update Documentation](https://docs.expo.dev/eas-update/introduction/)
- [Runtime Versions](https://docs.expo.dev/eas-update/runtime-versions/)

---

## 🆘 Troubleshooting

### "Updates not enabled"

**Causa:** Estás en modo desarrollo o Updates no está configurado.

**Solución:**
- Verifica que `updates.enabled = true` en `app.json`
- Asegúrate de estar en un build de producción (no desarrollo)
- Verifica que `projectId` esté configurado

### "No updates available"

**Causa:** No hay actualizaciones publicadas o el `runtimeVersion` no coincide.

**Solución:**
- Verifica que hayas publicado una actualización: `eas update --branch production`
- Verifica que el `runtimeVersion` coincida entre el build y la actualización

### Actualización no se aplica

**Causa:** La actualización se descargó pero no se aplicó.

**Solución:**
- Verifica que `Updates.reloadAsync()` se haya llamado
- Revisa los logs de la consola
- Intenta reiniciar la app manualmente

---

## ✅ Checklist para Publicar

- [ ] Código probado localmente
- [ ] `app.json` configurado con `projectId`
- [ ] `runtimeVersion` correcto
- [ ] Build de producción creado (si es necesario)
- [ ] Actualización publicada: `npm run publish:ota`
- [ ] Verificado en dispositivo de prueba

---

¿Necesitas ayuda? Revisa la documentación de Expo Updates o consulta los logs de la consola.
