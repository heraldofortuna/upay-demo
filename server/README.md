# uPay BFF - Backend for Frontend

Backend para la aplicación uPay Demo con arquitectura Server-Driven UI (SDUI).

## Instalación

```bash
npm install
```

## Configuración

Copia `.env.example` a `.env` y configura las variables necesarias:

```bash
cp .env.example .env
```

Variables disponibles:
- `PORT` - Puerto del servidor (default: 3000)
- `NODE_ENV` - Entorno (development/production)

## Uso

### Desarrollo

```bash
npm run dev
```

Inicia el servidor con watch mode (recarga automática al cambiar archivos).

### Producción

```bash
npm start
```

## Endpoints

### Health Check
```
GET /health
```

### SDUI - Pantallas
```
GET /api/screens/:screenId?context={...}
```

Obtiene la definición de UI para una pantalla específica.

**Ejemplo:**
```bash
curl http://localhost:3000/api/screens/Initializing
curl http://localhost:3000/api/screens/OtpScreen?context={"userId":"123"}
```

### API de Negocio
```
POST /api/pos/initialize
GET  /api/pos/otp
POST /api/pos/link
```

### Mocks (Desarrollo)
```
GET /mocks/:mockId
```

## Estructura

```
server/
├── src/
│   ├── definitions/    # Definiciones SDUI de pantallas
│   ├── routes/         # Rutas del API
│   ├── services/       # Lógica de negocio
│   └── mocks/          # Datos mock
└── package.json
```

## Agregar una Nueva Pantalla SDUI

1. Agrega la definición en `src/definitions/screens.js`:

```javascript
export const screenDefinitions = {
  MyNewScreen: {
    id: 'MyNewScreen',
    type: 'screen',
    layout: {
      type: 'container',
      // ... definición
    },
    actions: [
      // ... acciones
    ],
  },
};
```

2. El frontend la renderizará automáticamente al navegar a ella.

## Mocks

Los mocks están en `src/mocks/` y simulan respuestas de servicios reales para desarrollo.

Para usar mocks personalizados, agrega nuevos en `src/services/mockService.js`.