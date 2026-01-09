# uPay Demo - Server-Driven UI (SDUI) + Backend for Frontend (BFF)

Aplicación React Native con arquitectura **Server-Driven UI (SDUI)** y **Backend for Frontend (BFF)**. El servidor define dinámicamente la estructura y contenido de las pantallas mediante definiciones JSON, y el frontend las renderiza automáticamente.

---

## 📋 Tabla de Contenidos

- [Arquitectura](#-arquitectura)
- [Flujo de la Aplicación](#-flujo-de-la-aplicación)
- [Cómo Funciona SDUI](#-cómo-funciona-sdui)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Instalación](#-instalación)
- [Uso](#-uso)
- [Desarrollo](#-desarrollo)
- [API Admin](#-api-admin)

---

## 🏗️ Arquitectura

### Conceptos Clave

#### **Server-Driven UI (SDUI)**
El servidor define la estructura y contenido de las pantallas mediante definiciones JSON. El frontend renderiza dinámicamente estas definiciones sin necesidad de actualizar la app.

**Ventajas:**
- ✅ Cambios de UI sin actualizar la app
- ✅ A/B testing fácil
- ✅ Personalización por usuario/región
- ✅ Rollback inmediato de cambios

#### **Backend for Frontend (BFF)**
Capa intermedia (Node.js + Express) que adapta los servicios backend para las necesidades específicas del frontend móvil.

**Responsabilidades:**
- 📱 Proporcionar definiciones SDUI de pantallas
- 🔄 Adaptar respuestas de APIs backend
- 🎭 Proporcionar mocks para desarrollo
- 🔐 Manejar autenticación y autorización
- 📊 Agregar lógica de negocio específica del frontend

### Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                    DISPOSITIVO MÓVIL                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         React Native App (Frontend)                   │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │  SDUIScreen (Pantalla Genérica)                │  │  │
│  │  │  - Carga definición desde BFF                   │  │  │
│  │  │  - Renderiza con SDUIRenderer                   │  │  │
│  │  │  - Ejecuta acciones y hooks                     │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │  SDUIRenderer (Motor de Renderizado)           │  │  │
│  │  │  - Convierte JSON → Componentes React Native   │  │  │
│  │  │  - Maneja estilos, eventos, navegación         │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │  bffClient (Cliente HTTP)                       │  │  │
│  │  │  - GET /api/screens/:screenId                  │  │  │
│  │  │  - POST /api/pos/* (APIs de negocio)           │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/JSON
┌─────────────────────────────────────────────────────────────┐
│              BFF SERVER (Node.js + Express)                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Routes                                              │  │
│  │  - /api/screens/:screenId → screenService           │  │
│  │  - /api/pos/* → posService                          │  │
│  │  - /api/admin/* → adminRoutes (con auth)           │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Services                                            │  │
│  │  - screenService: Obtiene definiciones SDUI          │  │
│  │  - posService: Lógica de negocio POS                │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Storage (Definiciones SDUI)                         │  │
│  │  - MongoDB (si MONGODB_URI configurado)              │  │
│  │  - JSON File (fallback)                              │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Flujo de la Aplicación

### 1. Inicio de la App

```
App.tsx
  └─> AppNavigatorSDUI
       └─> SDUIScreen (screenId: "Initializing")
```

### 2. Carga de Pantalla SDUI

Cuando `SDUIScreen` se monta o cambia el `screenId`:

1. **Fetch de Definición:**
   ```
   SDUIScreen → bffClient.getScreenDefinition("Initializing")
                → GET http://localhost:3000/api/screens/Initializing
                → screenService.getScreenDefinition()
                → ScreenDefinition.getDefinitionById() (MongoDB o JSON)
                → Retorna definición JSON
   ```

2. **Renderizado:**
   ```
   SDUIScreen recibe definición
     └─> SDUIRenderer.renderComponent(definition.layout)
          └─> Convierte JSON a componentes React Native:
              - container → <View>
              - text → <Text>
              - button → <Button>
              - loader → <Loader>
   ```

3. **Ejecución de Acciones Automáticas:**
   ```
   Si definition.actions tiene auto: true
     └─> executeAction(action)
          └─> api_call → bffClient.callApi()
               └─> Actualiza estado o navega
   ```

4. **Ejecución de Hooks:**
   ```
   Si definition.hooks existe
     └─> timer → setInterval (ej: contador OTP)
     └─> delay → setTimeout
     └─> nfc_detection → useNfcDetection hook
   ```

### 3. Flujo Completo de Usuario

```
┌─────────────┐
│ Initializing│ ← App inicia aquí
└──────┬──────┘
       │ POST /api/pos/initialize
       │
       ├─ Si isLinked = true
       │  └─> ┌─────────┐
       │      │ Waiting │ ← Espera tarjetas
       │      └─────────┘
       │
       └─ Si isLinked = false
          └─> ┌──────────────┐
              │ LinkingStep1 │ ← Pantalla de bienvenida
              └──────┬───────┘
                     │ Usuario presiona "Comenzar"
                     │
                     └─> ┌──────────────┐
                         │ LinkingStep2 │ ← Instrucciones
                         └──────┬───────┘
                                │ Usuario presiona "Comenzar"
                                │
                                └─> ┌──────────────┐
                                    │ LinkingStep3 │ ← Confirmación
                                    └──────┬───────┘
                                           │ Usuario presiona "Comenzar"
                                           │ GET /api/pos/otp
                                           │
                                           └─> ┌───────────┐
                                               │ OtpScreen │ ← Ingreso de OTP
                                               └─────┬─────┘
                                                     │ Usuario ingresa OTP
                                                     │ POST /api/pos/link
                                                     │
                                                     └─> ┌─────────┐
                                                         │ Linking │ ← Procesando
                                                         └────┬────┘
                                                              │ onSuccess
                                                              │
                                                              └─> ┌─────────┐
                                                                  │ Waiting │ ← Listo para operar
                                                                  └─────────┘
```

---

## 🎨 Cómo Funciona SDUI

### Estructura de una Definición SDUI

Una definición SDUI es un objeto JSON que describe completamente una pantalla:

```javascript
{
  id: 'OtpScreen',              // ID único de la pantalla
  type: 'screen',                // Tipo: 'screen'
  layout: {                      // Estructura de UI
    type: 'container',           // Componente raíz
    style: { ... },              // Estilos React Native
    children: [                  // Componentes hijos
      {
        type: 'text',
        props: {
          text: 'Ingresá el código',
          style: { ... }
        }
      },
      {
        type: 'button',
        props: {
          title: 'Confirmar',
          onPress: {             // Acción al presionar
            type: 'api_call',
            method: 'POST',
            endpoint: '/api/pos/link',
            onSuccess: {
              type: 'navigate',
              screen: 'Waiting'
            }
          }
        }
      }
    ]
  },
  actions: [                     // Acciones disponibles
    {
      id: 'fetchOtp',
      type: 'api_call',
      method: 'GET',
      endpoint: '/api/pos/otp',
      auto: true,                // Se ejecuta automáticamente
      onSuccess: {
        type: 'update_state',
        state: {
          otp: 'response.otp',
          timeLeft: 'response.expiresIn'
        }
      }
    }
  ],
  hooks: [                       // Hooks de ciclo de vida
    {
      type: 'timer',
      interval: 1000,            // Cada 1 segundo
      condition: {
        field: 'timeLeft',
        operator: 'greaterThan',
        value: 0
      },
      onTick: {                  // Cada tick
        type: 'update_state',
        state: {
          timeLeft: 'timeLeft - 1'
        }
      },
      onExpire: {                // Cuando timeLeft = 0
        type: 'trigger_action',
        actionId: 'fetchOtp'    // Renovar OTP
      }
    }
  ]
}
```

### Componentes SDUI Soportados

| Tipo SDUI | Componente React Native | Descripción |
|-----------|------------------------|-------------|
| `container` | `<View>` | Contenedor genérico, puede tener hijos |
| `text` | `<Text>` | Texto con estilos |
| `button` | `<Button>` | Botón con acciones `onPress` |
| `loader` | `<Loader>` | Indicador de carga (ActivityIndicator) |

### Acciones SDUI

Las acciones definen qué sucede cuando el usuario interactúa o cuando ocurre un evento:

#### 1. `api_call`
Realiza una llamada HTTP al BFF:

```javascript
{
  type: 'api_call',
  method: 'POST',
  endpoint: '/api/pos/link',
  body: { otp: '{{otp}}' },      // Interpolación de variables
  onSuccess: {
    type: 'navigate',
    screen: 'Waiting'
  },
  onError: {
    type: 'update_state',
    state: { error: 'response.message' }
  }
}
```

#### 2. `navigate`
Navega a otra pantalla:

```javascript
{
  type: 'navigate',
  screen: 'Waiting',
  params: { userId: '{{userId}}' }
}
```

#### 3. `update_state`
Actualiza el estado local de la pantalla:

```javascript
{
  type: 'update_state',
  state: {
    otp: 'response.otp',                    // De la respuesta API
    timeLeft: 'response.expiresIn',         // De la respuesta API
    counter: 'timeLeft - 1',                // Expresión matemática
    message: '{{userName}} - Bienvenido'   // Interpolación
  }
}
```

#### 4. `conditional`
Ejecuta acciones condicionalmente:

```javascript
{
  type: 'conditional',
  condition: {
    field: 'response.isLinked',
    operator: 'equals',
    value: true
  },
  then: {
    type: 'navigate',
    screen: 'Waiting'
  },
  else: {
    type: 'navigate',
    screen: 'LinkingStep1'
  }
}
```

#### 5. `trigger_action`
Ejecuta otra acción por ID:

```javascript
{
  type: 'trigger_action',
  actionId: 'fetchOtp'
}
```

### Hooks SDUI

Los hooks se ejecutan automáticamente durante el ciclo de vida de la pantalla:

#### 1. `timer`
Timer con intervalos:

```javascript
{
  type: 'timer',
  interval: 1000,                // Milisegundos
  condition: {                   // Condición para continuar
    field: 'timeLeft',
    operator: 'greaterThan',
    value: 0
  },
  onTick: {                      // Cada intervalo
    type: 'update_state',
    state: { timeLeft: 'timeLeft - 1' }
  },
  onExpire: {                    // Cuando condición es falsa
    type: 'trigger_action',
    actionId: 'fetchOtp'
  }
}
```

#### 2. `delay`
Delay con callback:

```javascript
{
  type: 'delay',
  duration: 2000,                // Milisegundos
  onComplete: {
    type: 'navigate',
    screen: 'NextScreen'
  }
}
```

#### 3. `nfc_detection`
Detección NFC (requiere implementación nativa):

```javascript
{
  type: 'nfc_detection',
  enabled: true,
  onDetect: {
    type: 'api_call',
    endpoint: '/api/pos/readCard',
    body: { nfcData: '{{nfcData}}' }
  }
}
```

### Interpolación de Variables

Puedes usar variables del estado en textos y valores:

```javascript
{
  type: 'text',
  props: {
    text: 'Código: {{otp}}'      // Reemplaza {{otp}} con state.otp
  }
}

{
  type: 'api_call',
  body: {
    userId: '{{userId}}',        // Reemplaza con state.userId
    otp: '{{otp}}'               // Reemplaza con state.otp
  }
}
```

### Operadores de Condición

| Operador | Descripción | Ejemplo |
|----------|-------------|---------|
| `equals` | Igual a | `{ field: 'status', operator: 'equals', value: 'active' }` |
| `notEquals` | Diferente de | `{ field: 'status', operator: 'notEquals', value: 'error' }` |
| `greaterThan` | Mayor que | `{ field: 'timeLeft', operator: 'greaterThan', value: 0 }` |
| `lessThan` | Menor que | `{ field: 'timeLeft', operator: 'lessThan', value: 60 }` |
| `greaterThanOrEqual` | Mayor o igual | `{ field: 'count', operator: 'greaterThanOrEqual', value: 10 }` |
| `lessThanOrEqual` | Menor o igual | `{ field: 'count', operator: 'lessThanOrEqual', value: 100 }` |
| `contains` | Contiene (string) | `{ field: 'message', operator: 'contains', value: 'error' }` |
| `exists` | Existe (no null/undefined) | `{ field: 'userId', operator: 'exists' }` |

---

## 📁 Estructura del Proyecto

```
upay-demo/
├── src/                          # Frontend React Native
│   ├── components/               # Componentes reutilizables
│   │   ├── Button/
│   │   └── Loader/
│   ├── engine/                   # Motor SDUI
│   │   └── SDUIRenderer.tsx      # Convierte JSON → React Native
│   ├── screens/                  # Pantallas
│   │   ├── SDUIScreen.tsx        # Pantalla genérica SDUI
│   │   └── ErrorScreen.tsx       # Pantalla de error
│   ├── services/                 # Servicios
│   │   ├── bffClient.ts          # Cliente HTTP para BFF
│   │   └── api.ts                 # API legacy (deprecated)
│   ├── navigation/               # Navegación
│   │   └── AppNavigatorSDUI.tsx  # Navegador principal
│   ├── hooks/                    # React Hooks
│   │   └── useNfcDetection.ts    # Hook para NFC
│   └── utils/                    # Utilidades
│       ├── getLocalIP.ts         # Detección de IP local
│       └── constants.ts          # Constantes
│
├── server/                       # Backend BFF
│   ├── src/
│   │   ├── definitions/          # Definiciones SDUI (fallback)
│   │   │   └── screens.js        # Definiciones en código
│   │   ├── routes/               # Rutas Express
│   │   │   ├── screens.js        # GET /api/screens/:screenId
│   │   │   ├── api.js            # APIs de negocio (/api/pos/*)
│   │   │   ├── admin.js          # APIs admin (/api/admin/*)
│   │   │   └── mocks.js          # Mocks (/mocks/*)
│   │   ├── services/             # Lógica de negocio
│   │   │   ├── screenService.js  # Obtiene definiciones SDUI
│   │   │   ├── posService.js     # Lógica POS
│   │   │   └── mockService.js    # Servicios mock
│   │   ├── models/               # Modelos de datos
│   │   │   ├── ScreenDefinition.js      # Abstracción (MongoDB/JSON)
│   │   │   ├── ScreenDefinitionMongo.js # Implementación MongoDB
│   │   │   ├── ScreenDefinitionJSON.js  # Implementación JSON
│   │   │   ├── ScreenDefinitionSchema.js # Schema Mongoose
│   │   │   └── db.js             # Conexión MongoDB
│   │   ├── middleware/           # Middleware Express
│   │   │   └── auth.js           # Autenticación API Key
│   │   ├── utils/                # Utilidades
│   │   │   └── screenUtils.js    # Utilidades para definiciones
│   │   ├── mocks/                 # Mocks
│   │   │   └── posService.js     # Mock de servicio POS
│   │   ├── scripts/               # Scripts
│   │   │   └── migrateToMongoDB.js # Migración a MongoDB
│   │   └── index.js              # Entry point del servidor
│   ├── data/                     # Datos JSON (fallback)
│   │   └── screenDefinitions.json
│   └── package.json
│
├── App.tsx                       # Entry point de la app
├── package.json                  # Dependencias frontend
└── README.md                     # Este archivo
```

---

## 🚀 Instalación

### 1. Instalar Dependencias

```bash
npm run install:all
```

Esto instalará las dependencias tanto del frontend como del backend.

### 2. Configurar el Backend

```bash
cd server
cp .env.example .env
# Editar .env si es necesario
```

Variables de entorno importantes:
- `PORT`: Puerto del servidor (default: 3000)
- `MONGODB_URI`: URI de MongoDB (opcional, si no se usa, usa JSON)
- `ADMIN_API_KEY`: Clave para APIs admin (opcional)

### 3. (Opcional) Configurar MongoDB

Si quieres usar MongoDB para almacenar definiciones SDUI:

```bash
# 1. Instalar MongoDB localmente o usar MongoDB Atlas
# 2. Configurar MONGODB_URI en server/.env
# 3. Migrar definiciones existentes:
cd server
npm run migrate:mongo
```

### 4. Iniciar el Servidor BFF

```bash
npm run dev:bff
```

El servidor estará disponible en `http://localhost:3000`

### 5. Iniciar la App React Native

#### Opción A: Desarrollo Normal (Emulador/Simulador)

```bash
npm start
# Luego presiona 'a' para Android o 'i' para iOS
```

#### Opción B: Dispositivo Físico Android (USB)

```bash
npm run dev:android
```

Este script:
1. Configura `adb reverse` para puertos 3000 y 8081
2. Inicia el servidor BFF
3. Inicia Expo con `--localhost`

#### Opción C: Dispositivo Físico Android (WiFi)

```bash
# 1. Configurar adb reverse manualmente
adb reverse tcp:3000 tcp:3000
adb reverse tcp:8081 tcp:8081

# 2. Iniciar servidor y app
npm run dev
```

### 6. Iniciar Ambos Simultáneamente (Recomendado)

```bash
npm run dev
```

Esto inicia el servidor BFF y Expo en paralelo.

---

## 💻 Uso

### Endpoints del BFF

#### SDUI - Definiciones de Pantallas

```
GET /api/screens/:screenId?context={...}
```

Obtiene la definición de UI para una pantalla específica.

**Ejemplo:**
```bash
curl http://localhost:3000/api/screens/Initializing
curl http://localhost:3000/api/screens/OtpScreen?context={"userId":"123"}
```

#### API de Negocio

```
POST /api/pos/initialize    # Inicializa el POS
GET  /api/pos/otp           # Obtiene un nuevo OTP
POST /api/pos/link          # Vincula el POS con un OTP
```

#### Health Check

```
GET /health
```

#### Mocks (Desarrollo)

```
GET /mocks/card
GET /mocks/posStatus
GET /mocks/otp
```

### Flujo de la Aplicación

1. **Initializing** - Inicializa el POS y verifica si está vinculado
2. Si está vinculado → **Waiting** - Espera para leer tarjetas
3. Si no está vinculado → **LinkingStep1** → **LinkingStep2** → **LinkingStep3** → **OtpScreen** → **Linking** → **Waiting**

---

## 🛠️ Desarrollo

### Agregar una Nueva Pantalla SDUI

#### Opción 1: Agregar en Código (screens.js)

1. Agregar la definición en `server/src/definitions/screens.js`:

```javascript
export const screenDefinitions = {
  MyNewScreen: {
    id: 'MyNewScreen',
    type: 'screen',
    layout: {
      type: 'container',
      style: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        padding: 24,
      },
      children: [
        {
          type: 'text',
          props: {
            text: 'Mi Nueva Pantalla',
            style: {
              fontSize: 24,
              fontWeight: 'bold',
            },
          },
        },
        {
          type: 'button',
          props: {
            title: 'Ir a Siguiente',
            variant: 'primary',
            onPress: {
              type: 'navigate',
              screen: 'NextScreen',
            },
          },
        },
      ],
    },
    actions: [
      {
        id: 'loadData',
        type: 'api_call',
        method: 'GET',
        endpoint: '/api/data',
        auto: true,
        onSuccess: {
          type: 'update_state',
          state: {
            data: 'response.data',
          },
        },
      },
    ],
  },
};
```

2. El frontend la renderizará automáticamente cuando se navegue a ella:

```javascript
// En una acción:
{
  type: 'navigate',
  screen: 'MyNewScreen'
}
```

#### Opción 2: Agregar vía API Admin (MongoDB)

Si usas MongoDB, puedes crear/actualizar pantallas vía API:

```bash
curl -X PUT http://localhost:3000/api/admin/screens/MyNewScreen \
  -H "Content-Type: application/json" \
  -H "X-API-Key: tu-api-key" \
  -d @my-screen-definition.json
```

### Modificar una Pantalla Existente

#### Opción 1: Editar en Código

Edita `server/src/definitions/screens.js` y reinicia el servidor.

#### Opción 2: Usar API Admin (MongoDB)

```bash
# Cambiar texto en una pantalla
curl -X PATCH http://localhost:3000/api/admin/screens/OtpScreen/text \
  -H "Content-Type: application/json" \
  -H "X-API-Key: tu-api-key" \
  -d '{
    "search": "Ingresá el código",
    "replace": "Ingresá tu código de seguridad"
  }'
```

### Almacenamiento de Definiciones

El sistema soporta dos formas de almacenamiento:

1. **MongoDB** (Recomendado para producción):
   - Definiciones almacenadas en base de datos
   - Modificables vía API Admin
   - Persistencia y versionado

2. **JSON File** (Fallback):
   - Definiciones en `server/src/definitions/screens.js`
   - Se usa si `MONGODB_URI` no está configurado
   - Requiere reiniciar servidor para cambios

El sistema automáticamente:
- Intenta usar MongoDB si `MONGODB_URI` está configurado
- Si MongoDB falla o no está configurado, usa JSON como fallback

---

## 🔧 API Admin

El BFF incluye una API Admin para gestionar definiciones SDUI remotamente (requiere MongoDB).

### Autenticación

Todas las rutas admin requieren un header:

```
X-API-Key: tu-api-key
```

Configura `ADMIN_API_KEY` en `server/.env`.

### Endpoints Principales

#### Listar Pantallas

```bash
GET /api/admin/screens
```

#### Obtener una Pantalla

```bash
GET /api/admin/screens/:screenId
```

#### Crear/Actualizar Pantalla

```bash
PUT /api/admin/screens/:screenId
Content-Type: application/json
X-API-Key: tu-api-key

{
  "id": "MyScreen",
  "type": "screen",
  "layout": { ... },
  "actions": [ ... ],
  "hooks": [ ... ]
}
```

#### Eliminar Pantalla

```bash
DELETE /api/admin/screens/:screenId
```

### Endpoints Avanzados

#### Cambiar Texto en Pantalla

```bash
PATCH /api/admin/screens/:screenId/text
Content-Type: application/json
X-API-Key: tu-api-key

{
  "search": "Texto a buscar",
  "replace": "Texto nuevo",
  "path": "layout.children.0.props.text"  // Opcional: ruta específica
}
```

#### Listar Todos los Textos

```bash
GET /api/admin/screens/:screenId/texts
```

#### Buscar Componentes por Tipo

```bash
GET /api/admin/screens/:screenId/components/:type
# Ejemplo: GET /api/admin/screens/OtpScreen/components/button
```

#### Duplicar Pantalla

```bash
POST /api/admin/screens/:screenId/duplicate
Content-Type: application/json
X-API-Key: tu-api-key

{
  "newId": "MyScreenCopy"
}
```

### Exponer Servidor Remotamente

Para que otros puedan usar la API Admin desde fuera de tu red local:

#### Opción 1: ngrok (Recomendado para desarrollo)

```bash
# 1. Instalar ngrok: https://ngrok.com/download
# 2. Configurar authtoken:
ngrok.cmd config add-authtoken tu-authtoken

# 3. Exponer puerto 3000:
ngrok.cmd http 3000

# 4. Usar la URL pública en lugar de localhost:3000
```

#### Opción 2: Configurar Router

Configura port forwarding en tu router para exponer el puerto 3000.

### Postman Collection

Incluimos una colección de Postman para facilitar el uso de la API:

- `server/postman_collection.json` - Colección con todos los endpoints
- `server/postman_environment.json` - Variables de entorno

Importa ambos en Postman para empezar a usar la API.

---

## 📝 Notas

- El frontend usa `localhost:3000` en desarrollo. Asegúrate de ajustar la URL en producción.
- Para Android físico, configura `adb reverse` para acceder a `localhost` desde el dispositivo.
- Los mocks están activos por defecto. En producción, reemplázalos con llamadas reales al backend.
- Las definiciones SDUI se cachean en el frontend. Si cambias una definición, recarga la app.
- MongoDB es opcional. Si no lo configuras, el sistema usa JSON como fallback.

---

## 🐛 Troubleshooting

### Error: "Network request failed"

**Causa:** El dispositivo no puede conectarse al servidor BFF.

**Solución:**
```bash
# Configurar adb reverse
adb reverse tcp:3000 tcp:3000
adb reverse tcp:8081 tcp:8081

# Verificar
adb reverse --list
```

### Error: "Pantalla no encontrada"

**Causa:** La definición no existe en el servidor.

**Solución:**
- Verifica que la pantalla esté definida en `server/src/definitions/screens.js`
- O verifica en MongoDB si estás usando base de datos
- Revisa los logs del servidor para más detalles

### Error: "Maximum update depth exceeded"

**Causa:** Loop infinito de re-renders.

**Solución:**
- Verifica que las acciones no se ejecuten infinitamente
- Asegúrate de que los hooks tengan condiciones correctas
- Revisa que `previousScreenIdRef` esté funcionando correctamente

### Puerto 3000 en uso

**Solución:**
```bash
cd server
npm run kill-port
```

---

## 📄 Licencia

MIT
