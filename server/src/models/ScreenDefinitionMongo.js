/**
 * Modelo MongoDB para definiciones de pantallas SDUI
 */

import mongoose from 'mongoose';
import { connectDB } from './db.js';
import { ScreenDefinition } from './ScreenDefinitionSchema.js';

// Importar screenDefinitions de forma dinámica para evitar circular dependencies
let screenDefinitions = null;
async function getScreenDefinitions() {
  if (!screenDefinitions) {
    const module = await import('../definitions/screens.js');
    screenDefinitions = module.screenDefinitions;
  }
  return screenDefinitions;
}

/**
 * Obtiene todas las definiciones de pantallas desde MongoDB
 */
export async function getAllDefinitions() {
  await connectDB();
  
  try {
    const docs = await ScreenDefinition.find({}).lean();
    const definitions = {};
    
    docs.forEach(doc => {
      definitions[doc.id] = {
        id: doc.id,
        type: doc.type,
        layout: doc.layout,
        actions: doc.actions || [],
        hooks: doc.hooks || [],
      };
    });
    
    return definitions;
  } catch (error) {
    console.error('Error reading definitions from MongoDB:', error);
    // Fallback a definiciones del archivo
    return await getScreenDefinitions();
  }
}

/**
 * Obtiene una definición específica por ID desde MongoDB
 */
export async function getDefinitionById(screenId) {
  await connectDB();
  
  try {
    const doc = await ScreenDefinition.findOne({ id: screenId }).lean();
    
    if (!doc) {
      // Fallback a definición del archivo
      const defaults = await getScreenDefinitions();
      return defaults[screenId] || null;
    }
    
    return {
      id: doc.id,
      type: doc.type,
      layout: doc.layout,
      actions: doc.actions || [],
      hooks: doc.hooks || [],
    };
  } catch (error) {
    console.error('Error reading definition from MongoDB:', error);
    // Fallback a definición del archivo
    const defaults = await getScreenDefinitions();
    return defaults[screenId] || null;
  }
}

/**
 * Guarda o actualiza una definición en MongoDB
 */
export async function saveDefinition(screenId, definition) {
  await connectDB();
  
  try {
    const doc = await ScreenDefinition.findOneAndUpdate(
      { id: screenId },
      {
        id: screenId,
        type: definition.type || 'screen',
        layout: definition.layout,
        actions: definition.actions || [],
        hooks: definition.hooks || [],
        updatedAt: new Date(),
        $setOnInsert: { createdAt: new Date() },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );
    
    return {
      id: doc.id,
      type: doc.type,
      layout: doc.layout,
      actions: doc.actions || [],
      hooks: doc.hooks || [],
      updatedAt: doc.updatedAt,
    };
  } catch (error) {
    console.error('Error saving definition to MongoDB:', error);
    throw error;
  }
}

/**
 * Guarda múltiples definiciones en MongoDB
 */
export async function saveAllDefinitions(definitions) {
  await connectDB();
  
  // Asegurar que la conexión esté lista
  if (mongoose.connection.readyState !== 1) {
    await new Promise((resolve) => {
      mongoose.connection.once('connected', resolve);
    });
  }
  
  try {
    const entries = Object.entries(definitions);
    let saved = 0;
    
    // Guardar en lotes para evitar timeout
    const batchSize = 3;
    for (let i = 0; i < entries.length; i += batchSize) {
      const batch = entries.slice(i, i + batchSize);
      
      const operations = batch.map(([id, definition]) => ({
        updateOne: {
          filter: { id },
          update: {
            $set: {
              id,
              type: definition.type || 'screen',
              layout: definition.layout,
              actions: definition.actions || [],
              hooks: definition.hooks || [],
              updatedAt: new Date(),
            },
            $setOnInsert: {
              createdAt: new Date(),
            },
          },
          upsert: true,
        },
      }));
      
      await ScreenDefinition.bulkWrite(operations, { ordered: false });
      saved += batch.length;
      console.log(`  ✓ ${saved}/${entries.length} definiciones guardadas...`);
    }
    
    console.log(`✅ ${saved} definiciones guardadas en MongoDB`);
  } catch (error) {
    console.error('Error saving definitions to MongoDB:', error);
    throw error;
  }
}

/**
 * Elimina una definición de MongoDB (se usará la del archivo como fallback)
 */
export async function deleteDefinition(screenId) {
  await connectDB();
  
  try {
    await ScreenDefinition.deleteOne({ id: screenId });
    return true;
  } catch (error) {
    console.error('Error deleting definition from MongoDB:', error);
    throw error;
  }
}

/**
 * Obtiene todas las definiciones con metadatos
 */
export async function listDefinitions() {
  await connectDB();
  
  try {
    const docs = await ScreenDefinition.find({}, 'id type createdAt updatedAt').lean();
    return docs.map(doc => ({
      id: doc.id,
      type: doc.type,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));
  } catch (error) {
    console.error('Error listing definitions from MongoDB:', error);
    // Fallback: listar desde archivo
    const defaults = await getScreenDefinitions();
    return Object.keys(defaults).map(id => ({
      id,
      type: defaults[id].type || 'screen',
      createdAt: null,
      updatedAt: null,
    }));
  }
}