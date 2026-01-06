import { screenDefinitions } from '../definitions/screens.js';

/**
 * Obtiene la definición de UI para una pantalla específica
 * @param {string} screenId - ID de la pantalla
 * @param {object} context - Contexto adicional (datos del usuario, estado, etc.)
 * @returns {Promise<object>} Definición de la pantalla en formato SDUI
 */
export async function getScreenDefinition(screenId, context = {}) {
  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 100));

  const definition = screenDefinitions[screenId];

  if (!definition) {
    throw new Error(`Pantalla ${screenId} no encontrada`);
  }

  // Si la definición es una función, ejecutarla con el contexto
  if (typeof definition === 'function') {
    return definition(context);
  }

  // Si es un objeto, retornarlo directamente (con posible procesamiento de contexto)
  return processDefinition(definition, context);
}

/**
 * Procesa una definición aplicando el contexto
 */
function processDefinition(definition, context) {
  // Deep clone para no modificar el original
  const processed = JSON.parse(JSON.stringify(definition));

  // Procesar variables dinámicas en texto (ej: {{variable}})
  const processText = (text) => {
    if (typeof text !== 'string') return text;
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return context[key] || match;
    });
  };

  const processObject = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = processText(obj[key]);
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        processObject(obj[key]);
      }
    }
  };

  processObject(processed);
  return processed;
}