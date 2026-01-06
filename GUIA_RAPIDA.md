# 🚀 Guía Rápida - Cómo Ejecutar la App

## 📋 ¿Qué hice?

Reestructuré tu aplicación para usar **Server-Driven UI (SDUI)** + **Backend for Frontend (BFF)**:

### Antes:
- ❌ Pantallas hardcodeadas en React Native
- ❌ Lógica de negocio mezclada con UI
- ❌ Cambios de UI requerían actualizar la app

### Ahora:
- ✅ **Backend define las pantallas** (SDUI)
- ✅ **Frontend renderiza dinámicamente** lo que el servidor envía
- ✅ **BFF** maneja toda la lógica de negocio
- ✅ **Mocks incluidos** para desarrollo
- ✅ **Mismo flujo** que tenías antes, pero con arquitectura moderna

## 🏗️ Estructura Creada

```
upay-demo/
├── server/                    # ← NUEVO: Backend BFF
│   ├── src/
│   │   ├── definitions/       # Definiciones de pantallas SDUI
│   │   ├── routes/            # Endpoints del API
│   │   ├── services/          # Lógica de negocio
│   │   └── mocks/             # Datos mock
│   └── package.json
│
└── src/                       # Frontend React Native (modificado)
    ├── engine/                # ← NUEVO: Motor de renderizado SDUI
    │   └── SDUIRenderer.tsx   # Renderiza definiciones del servidor
    ├── screens/
    │   └── SDUIScreen.tsx     # ← NUEVO: Pantalla genérica SDUI
    └── services/
        └── bffClient.ts       # ← NUEVO: Cliente para comunicarse con BFF
```

## 🎯 Cómo Ejecutar

### Opción 1: Todo junto (Recomendado para desarrollo)

```bash
# 1. Instalar dependencias (solo la primera vez)
npm run install:all

# 2. Iniciar backend + frontend juntos
npm run dev
```

Esto iniciará:
- ✅ Backend BFF en `http://localhost:3000`
- ✅ Frontend React Native (Expo)

### Opción 2: Por separado (Más control)

**Terminal 1 - Backend:**
```bash
# Instalar dependencias del backend (solo primera vez)
cd server
npm install

# Iniciar el servidor
npm start
# o con watch mode (recarga automática):
npm run dev
```

**Terminal 2 - Frontend:**
```bash
# Desde la raíz del proyecto
npm start
# o para Android:
npm run android
# o para iOS:
npm run ios
```

## 🔍 Verificar que Funciona

### 1. Verificar Backend

Abre en tu navegador:
- `http://localhost:3000/health` → Debe responder `{"status":"ok"}`
- `http://localhost:3000/api/screens/Initializing` → Debe devolver la definición JSON de la pantalla

### 2. Verificar Frontend

La app debería:
- ✅ Cargar la pantalla "Initializing"
- ✅ Hacer llamada al backend para inicializar
- ✅ Navegar según el flujo (Waiting o LinkingStep1)

## 📱 Flujo de la App (Se mantiene igual)

1. **Initializing** → Verifica si el POS está vinculado
2. Si está vinculado → **Waiting** (espera tarjetas)
3. Si NO está vinculado → **LinkingStep1** → **LinkingStep2** → **LinkingStep3** → **OtpScreen** → **Linking** → **Waiting**

## 🛠️ Comandos Disponibles

```bash
# Instalación
npm run install:all          # Instala dependencias de todo

# Backend
npm run start:bff            # Inicia solo el backend
npm run dev:bff              # Backend con watch mode

# Frontend
npm start                    # Inicia Expo
npm run android              # Android
npm run ios                  # iOS

# Desarrollo (ambos)
npm run dev                  # Backend + Frontend juntos
```

## 🔧 Configuración

### Backend (server/.env)
```env
PORT=3000
NODE_ENV=development
```

### Frontend (src/services/bffClient.ts)
```typescript
const BFF_BASE_URL = __DEV__ 
  ? 'http://localhost:3000'  // Desarrollo
  : 'https://api.upay.com';   // Producción
```

**⚠️ Para Android:** Si usas dispositivo físico, necesitas:
```bash
adb reverse tcp:3000 tcp:3000
```

O cambia `localhost` por la IP de tu máquina en `bffClient.ts`.

## 📚 Archivos Clave

### Backend
- `server/src/definitions/screens.js` - **Definiciones de todas las pantallas**
- `server/src/services/posService.js` - Lógica de negocio del POS
- `server/src/mocks/posService.js` - Mocks para desarrollo

### Frontend
- `src/engine/SDUIRenderer.tsx` - **Motor que renderiza las definiciones**
- `src/screens/SDUIScreen.tsx` - **Pantalla genérica que usa SDUI**
- `src/services/bffClient.ts` - Cliente para comunicarse con el BFF

## 🎨 Cómo Funciona SDUI

1. **Frontend pide una pantalla:**
   ```
   GET /api/screens/Initializing
   ```

2. **Backend responde con la definición:**
   ```json
   {
     "id": "Initializing",
     "layout": {
       "type": "container",
       "children": [...]
     },
     "actions": [...]
   }
   ```

3. **Frontend renderiza dinámicamente:**
   - `SDUIRenderer` lee la definición
   - Crea componentes React Native
   - Ejecuta acciones (API calls, navegación, etc.)

## 🐛 Troubleshooting

### Backend no inicia
```bash
cd server
npm install
npm start
```

### Frontend no conecta al backend
- Verifica que el backend esté corriendo en puerto 3000
- En Android físico, usa `adb reverse` o cambia a IP de tu máquina

### Error "Cannot find module"
```bash
npm run install:all
```

## ✨ Ventajas de esta Arquitectura

1. **Cambios de UI sin actualizar la app** - Solo actualiza el backend
2. **A/B Testing fácil** - El servidor decide qué UI mostrar
3. **Lógica centralizada** - Todo en el BFF
4. **Mocks incluidos** - Desarrollo sin backend real
5. **Mismo flujo** - No cambiaste nada del flujo original

---

¿Problemas? Revisa los logs del backend y del frontend para ver errores específicos.