/**
 * Modelo para almacenar definiciones de pantallas en archivo JSON
 * (Fallback cuando MongoDB no está disponible)
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '../../data/screenDefinitions.json');

/**
 * Inicializa la base de datos con las definiciones por defecto
 */
async function initializeDatabase() {
  try {
    await fs.access(DB_PATH);
    // El archivo ya existe
  } catch {
    // El archivo no existe, crear con definiciones por defecto
    const { screenDefinitions } = await import('../definitions/screens.js');
    await saveAllDefinitions(screenDefinitions);
  }
}

/**
 * Obtiene todas las definiciones de pantallas
 */
export async function getAllDefinitions() {
  await initializeDatabase();
  
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading definitions from database:', error);
    // Fallback a definiciones del archivo
    const { screenDefinitions } = await import('../definitions/screens.js');
    return screenDefinitions;
  }
}

/**
 * Obtiene una definición específica por ID
 */
export async function getDefinitionById(screenId) {
  const definitions = await getAllDefinitions();
  return definitions[screenId] || null;
}

/**
 * Guarda o actualiza una definición
 */
export async function saveDefinition(screenId, definition) {
  await initializeDatabase();
  
  const definitions = await getAllDefinitions();
  definitions[screenId] = {
    ...definition,
    id: screenId,
    updatedAt: new Date().toISOString(),
  };
  
  // Asegurar que el directorio existe
  const dbDir = path.dirname(DB_PATH);
  await fs.mkdir(dbDir, { recursive: true });
  
  await fs.writeFile(DB_PATH, JSON.stringify(definitions, null, 2), 'utf-8');
  return definitions[screenId];
}

/**
 * Guarda múltiples definiciones
 */
export async function saveAllDefinitions(definitions) {
  const dbDir = path.dirname(DB_PATH);
  await fs.mkdir(dbDir, { recursive: true });
  
  await fs.writeFile(DB_PATH, JSON.stringify(definitions, null, 2), 'utf-8');
}

/**
 * Elimina una definición
 */
export async function deleteDefinition(screenId) {
  await initializeDatabase();
  
  const definitions = await getAllDefinitions();
  delete definitions[screenId];
  
  await fs.writeFile(DB_PATH, JSON.stringify(definitions, null, 2), 'utf-8');
}

/**
 * Obtiene todas las definiciones con metadatos
 */
export async function listDefinitions() {
  const definitions = await getAllDefinitions();
  return Object.keys(definitions).map(id => ({
    id,
    type: definitions[id].type,
    updatedAt: definitions[id].updatedAt || null,
  }));
}