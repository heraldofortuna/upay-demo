import React from 'react';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AppNavigatorOTA } from './src/navigation/AppNavigatorOTA';
import { ErrorBoundary } from './src/components/ErrorBoundary';

// Determinar qué app ejecutar basado en variable de entorno
// En Expo, las variables de entorno del cliente deben tener prefijo EXPO_PUBLIC_
// Estas se inyectan en tiempo de build por Metro Bundler
const APP_MODE = process.env.EXPO_PUBLIC_APP_MODE || 'sdui';

// Debug: mostrar qué modo se está usando
console.log('🔧 ========================================');
console.log('🔧 App.tsx: Iniciando aplicación');
console.log('🔧 APP_MODE detectado:', APP_MODE);
console.log('🔧 EXPO_PUBLIC_APP_MODE:', process.env.EXPO_PUBLIC_APP_MODE);
console.log('🔧 __DEV__:', __DEV__);
console.log('🔧 ========================================');

const App: React.FC = () => {
  // Si APP_MODE es 'ota', usar el navegador OTA
  if (APP_MODE === 'ota') {
    console.log('📱 App.tsx: Usando AppNavigatorOTA (modo OTA)');
    return (
      <ErrorBoundary>
        <AppNavigatorOTA />
      </ErrorBoundary>
    );
  }
  
  // Por defecto, usar SDUI
  console.log('📱 App.tsx: Usando AppNavigator (modo SDUI)');
  return (
    <ErrorBoundary>
      <AppNavigator />
    </ErrorBoundary>
  );
};

export default App;
