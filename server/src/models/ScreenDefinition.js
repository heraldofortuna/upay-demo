/**
 * Modelo para almacenar definiciones de pantallas en base de datos
 * 
 * Usa MongoDB si está configurado (MONGODB_URI), 
 * si no, usa archivo JSON como fallback
 */

let dbModule = null;
let initPromise = null;

// Determinar qué módulo usar basado en la configuración
async function initializeDBModule() {
  if (process.env.MONGODB_URI) {
    try {
      const mongoModule = await import('./ScreenDefinitionMongo.js');
      dbModule = mongoModule;
      console.log('📦 Usando MongoDB para definiciones SDUI');
      return;
    } catch (error) {
      console.warn('⚠️ MongoDB no disponible, usando archivo JSON como fallback:', error.message);
    }
  }
  
  // Fallback a JSON
  const jsonModule = await import('./ScreenDefinitionJSON.js');
  dbModule = jsonModule;
  console.log('📄 Usando archivo JSON para definiciones SDUI');
}

// Inicializar al cargar el módulo
initPromise = initializeDBModule();

/**
 * Obtiene todas las definiciones de pantallas
 */
export async function getAllDefinitions() {
  await initPromise;
  return dbModule.getAllDefinitions();
}

/**
 * Obtiene una definición específica por ID
 */
export async function getDefinitionById(screenId) {
  await initPromise;
  return dbModule.getDefinitionById(screenId);
}

/**
 * Guarda o actualiza una definición
 */
export async function saveDefinition(screenId, definition) {
  await initPromise;
  return dbModule.saveDefinition(screenId, definition);
}

/**
 * Guarda múltiples definiciones
 */
export async function saveAllDefinitions(definitions) {
  await initPromise;
  return dbModule.saveAllDefinitions(definitions);
}

/**
 * Elimina una definición
 */
export async function deleteDefinition(screenId) {
  await initPromise;
  return dbModule.deleteDefinition(screenId);
}

/**
 * Obtiene todas las definiciones con metadatos
 */
export async function listDefinitions() {
  await initPromise;
  return dbModule.listDefinitions();
}