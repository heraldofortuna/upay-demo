/**
 * Servicio local para cargar definiciones SDUI desde archivos JSON
 * Estas definiciones pueden ser actualizadas vía OTA sin necesidad de servidor BFF
 */

import { ScreenDefinition } from './bffClient';

// Importar definiciones desde archivo JSON local
// Este archivo puede ser actualizado vía OTA
import screenDefinitions from '../config/screenDefinitions.json';

/**
 * Obtiene la definición de UI para una pantalla desde el archivo JSON local
 * @param screenId - ID de la pantalla
 * @param context - Contexto adicional (datos del usuario, estado, etc.)
 * @returns Definición de la pantalla en formato SDUI
 */
export async function getLocalScreenDefinition(
  screenId: string,
  context: Record<string, any> = {}
): Promise<ScreenDefinition> {
  // Simular delay mínimo para mantener consistencia con BFF
  await new Promise(resolve => setTimeout(resolve, 50));

  const definition = (screenDefinitions as any)[screenId];

  if (!definition) {
    throw new Error(`Pantalla ${screenId} no encontrada en definiciones locales`);
  }

  // Procesar la definición aplicando el contexto
  return processDefinition(definition, context);
}

/**
 * Procesa una definición aplicando el contexto (interpolación de variables)
 */
function processDefinition(
  definition: any,
  context: Record<string, any>
): ScreenDefinition {
  // Deep clone para no modificar el original
  const processed = JSON.parse(JSON.stringify(definition));

  // Interpolar valores en la definición usando el contexto
  // Esto permite usar {{variable}} en textos y otros campos
  return interpolateDefinition(processed, context);
}

/**
 * Interpola valores en una definición usando el contexto
 */
function interpolateDefinition(obj: any, context: Record<string, any>): any {
  if (typeof obj === 'string') {
    // Interpolar strings con {{variable}}
    return obj.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, key) => {
      const value = getNestedValue(context, key);
      return value !== undefined && value !== null ? String(value) : match;
    });
  }

  if (Array.isArray(obj)) {
    return obj.map(item => interpolateDefinition(item, context));
  }

  if (obj && typeof obj === 'object') {
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = interpolateDefinition(value, context);
    }
    return result;
  }

  return obj;
}

/**
 * Obtiene un valor anidado usando notación de punto
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}

/**
 * Obtiene todas las definiciones disponibles
 */
export function getAllLocalScreenDefinitions(): Record<string, ScreenDefinition> {
  return screenDefinitions as any;
}
