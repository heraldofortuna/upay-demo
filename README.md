# uPay Demo - Server-Driven UI (SDUI) + BFF

Aplicación React Native con arquitectura Server-Driven UI (SDUI) y Backend for Frontend (BFF).

## Arquitectura

### Estructura del Proyecto

```
upay-demo/
├── mobile/              # Frontend React Native (próximamente)
├── server/              # Backend BFF con Express
│   ├── src/
│   │   ├── definitions/ # Definiciones SDUI de pantallas
│   │   ├── routes/      # Rutas del API
│   │   ├── services/    # Lógica de negocio
│   │   └── mocks/       # Datos mock para desarrollo
│   └── package.json
└── src/                 # Frontend React Native (actual)
    ├── engine/          # Motor de renderizado SDUI
    ├── screens/         # Pantallas (ahora usando SDUI)
    ├── services/        # Cliente BFF
    └── ...
```

### Conceptos

**Server-Driven UI (SDUI):** El servidor define la estructura y contenido de las pantallas mediante definiciones JSON. El frontend renderiza dinámicamente estas definiciones.

**Backend for Frontend (BFF):** Capa intermedia que adapta los servicios backend para las necesidades específicas del frontend móvil.

## Instalación

### 1. Instalar dependencias

```bash
npm run install:all
```

Esto instalará las dependencias tanto del frontend como del backend.

### 2. Configurar el backend

```bash
cd server
cp .env.example .env
# Editar .env si es necesario (por defecto usa puerto 3000)
```

### 3. Iniciar el servidor BFF

En una terminal:

```bash
npm run start:bff
# o para desarrollo con watch mode:
npm run dev:bff
```

El servidor estará disponible en `http://localhost:3000`

### 4. Iniciar la app React Native

En otra terminal:

```bash
npm start
# o para Android:
npm run android
# o para iOS:
npm run ios
```

### 5. Iniciar ambos simultáneamente (desarrollo)

```bash
npm run dev
```

## Uso

### Endpoints del BFF

#### SDUI - Definiciones de Pantallas

```
GET /api/screens/:screenId?context={...}
```

Obtiene la definición de UI para una pantalla específica.

Ejemplo:
```
GET /api/screens/Initializing
GET /api/screens/OtpScreen?context={"userId":"123"}
```

#### API de Negocio

```
POST /api/pos/initialize
GET  /api/pos/otp
POST /api/pos/link
```

#### Health Check

```
GET /health
```

#### Mocks (Desarrollo)

```
GET /mocks/:mockId
```

### Flujo de la Aplicación

1. **Initializing** - Inicializa el POS y verifica si está vinculado
2. Si está vinculado → **Waiting** - Espera para leer tarjetas
3. Si no está vinculado → **LinkingStep1** → **LinkingStep2** → **LinkingStep3** → **OtpScreen** → **Linking** → **Waiting**

## Desarrollo

### Agregar una nueva pantalla SDUI

1. Agregar la definición en `server/src/definitions/screens.js`:

```javascript
export const screenDefinitions = {
  MyNewScreen: {
    id: 'MyNewScreen',
    type: 'screen',
    layout: {
      type: 'container',
      // ... definición de UI
    },
    actions: [
      // ... acciones
    ],
  },
};
```

2. El frontend la renderizará automáticamente cuando se navegue a ella.

### Componentes SDUI Soportados

- `container` - Contenedor genérico (View)
- `text` - Texto (Text)
- `button` - Botón (Button)
- `loader` - Indicador de carga (Loader)

### Acciones SDUI

- `api_call` - Realiza una llamada a la API
- `navigate` - Navega a otra pantalla
- `update_state` - Actualiza el estado local
- `conditional` - Ejecuta acciones condicionalmente

### Hooks SDUI

- `timer` - Timer con intervalos
- `delay` - Delay con callback
- `nfc_detection` - Detección NFC (requiere implementación específica)

## Estructura de una Definición SDUI

```javascript
{
  id: 'ScreenId',
  type: 'screen',
  layout: {
    type: 'container',
    style: { /* estilos React Native */ },
    children: [
      {
        type: 'text',
        props: {
          text: '{{variable}}', // Interpolación de variables
          style: { /* estilos */ }
        }
      }
    ]
  },
  actions: [
    {
      id: 'actionId',
      type: 'api_call',
      method: 'POST',
      endpoint: '/api/endpoint',
      onSuccess: {
        type: 'navigate',
        screen: 'NextScreen'
      }
    }
  ],
  hooks: [
    {
      type: 'timer',
      interval: 1000,
      condition: { /* condición */ },
      onTick: { /* acción */ }
    }
  ]
}
```

## Mocks

Los mocks están disponibles para desarrollo y testing:

- `/mocks/card` - Datos de tarjeta mock
- `/mocks/posStatus` - Estado del POS mock
- `/mocks/otp` - OTP mock

## Notas

- El frontend usa `localhost:3000` en desarrollo. Asegúrate de ajustar la URL en producción.
- Para Android, puede ser necesario configurar `adb reverse` para acceder a `localhost` desde el dispositivo.
- Los mocks están activos por defecto. En producción, reemplázalos con llamadas reales al backend.

## Licencia

MIT