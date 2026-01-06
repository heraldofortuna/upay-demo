/**
 * Obtiene la IP local de la máquina para conexión con dispositivos físicos
 */

import { Platform } from 'react-native';

export function getLocalIP(): string | null {
  // En desarrollo, intentamos obtener la IP local
  // En producción, esto no se usará
  if (__DEV__) {
    // Para Android, podemos usar adb reverse o la IP de la máquina
    // Por ahora retornamos null para usar la configuración manual
    return null;
  }
  return null;
}

/**
 * Obtiene la URL base del BFF según el entorno
 */
export function getBFFBaseURL(): string {
  if (!__DEV__) {
    return 'https://api.upay.com'; // Producción
  }

  // En desarrollo, intentamos detectar automáticamente
  // Si hay una variable de entorno, la usamos
  const envUrl = process.env.EXPO_PUBLIC_BFF_URL;
  if (envUrl) {
    return envUrl;
  }

  // Por defecto, localhost (funciona con adb reverse o emulador)
  // Si usas USB: usa localhost con adb reverse
  // Si usas WiFi: cambia esto a tu IP local (ej: 'http://192.168.0.100:3000')
  return 'http://localhost:3000';
}

/**
 * Obtiene la IP local de Windows usando comandos del sistema
 * Esto es útil para dispositivos Android físicos en la misma red
 */
export async function getLocalIPWindows(): Promise<string | null> {
  // Esta función se puede llamar desde el código nativo o desde un script
  // Por ahora, retornamos null y el usuario debe configurarlo manualmente
  return null;
}