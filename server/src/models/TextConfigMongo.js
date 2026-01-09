/**
 * Modelo MongoDB para textos de la app OTA
 */

import mongoose from 'mongoose';
import { connectDB } from './db.js';
import { TextConfig } from './TextConfigSchema.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar textos del JSON como fallback
let textsData = null;
function getTextsData() {
  if (!textsData) {
    try {
      const textsPath = join(__dirname, '../../../src/config/texts.json');
      const fileContent = readFileSync(textsPath, 'utf-8');
      textsData = JSON.parse(fileContent);
    } catch (error) {
      console.warn('No se pudo cargar texts.json, usando objeto vacío');
      textsData = { screens: {}, errors: {} };
    }
  }
  return textsData;
}

/**
 * Obtiene todos los textos desde MongoDB
 */
export async function getAllTexts() {
  await connectDB();
  
  try {
    const docs = await TextConfig.find({}).lean();
    const texts = {};
    
    // Organizar por pantalla
    docs.forEach(doc => {
      if (!texts[doc.screen]) {
        texts[doc.screen] = {};
      }
      // El key tiene formato "ScreenName.fieldName", extraer solo fieldName
      const keyParts = doc.key.split('.');
      const fieldName = keyParts.length > 1 ? keyParts.slice(1).join('.') : doc.key;
      texts[doc.screen][fieldName] = doc.value;
    });
    
    return texts;
  } catch (error) {
    console.error('Error reading texts from MongoDB:', error);
    // Fallback a JSON
    return getTextsData().screens || {};
  }
}

/**
 * Obtiene textos de una pantalla específica
 */
export async function getTextsByScreen(screenName) {
  await connectDB();
  
  try {
    const docs = await TextConfig.find({ screen: screenName }).lean();
    const texts = {};
    
    docs.forEach(doc => {
      // El key tiene formato "ScreenName.fieldName", extraer solo fieldName
      const keyParts = doc.key.split('.');
      const fieldName = keyParts.length > 1 ? keyParts.slice(1).join('.') : doc.key;
      texts[fieldName] = doc.value;
    });
    
    return texts;
  } catch (error) {
    console.error(`Error reading texts for screen ${screenName}:`, error);
    // Fallback a JSON
    return getTextsData().screens?.[screenName] || {};
  }
}

/**
 * Obtiene un texto específico por key
 */
export async function getTextByKey(key) {
  await connectDB();
  
  try {
    const doc = await TextConfig.findOne({ key }).lean();
    return doc ? doc.value : null;
  } catch (error) {
    console.error(`Error reading text ${key}:`, error);
    return null;
  }
}

/**
 * Guarda o actualiza un texto
 */
export async function saveText(key, screen, value, description = '') {
  await connectDB();
  
  try {
    const existing = await TextConfig.findOne({ key });
    
    if (existing) {
      existing.value = value;
      existing.screen = screen;
      existing.description = description || existing.description;
      existing.version = (existing.version || 1) + 1;
      await existing.save();
      return existing;
    } else {
      const newText = new TextConfig({
        key,
        screen,
        value,
        description,
        version: 1,
      });
      await newText.save();
      return newText;
    }
  } catch (error) {
    console.error(`Error saving text ${key}:`, error);
    throw error;
  }
}

/**
 * Guarda múltiples textos de una pantalla
 */
export async function saveScreenTexts(screenName, texts) {
  await connectDB();
  
  try {
    const operations = Object.entries(texts).map(([key, value]) => ({
      updateOne: {
        filter: { key: `${screenName}.${key}` },
        update: {
          $set: {
            key: `${screenName}.${key}`,
            screen: screenName,
            value,
            $inc: { version: 1 },
          },
          $setOnInsert: {
            version: 1,
            createdAt: new Date(),
          },
        },
        upsert: true,
      },
    }));
    
    await TextConfig.bulkWrite(operations);
    return { success: true, count: operations.length };
  } catch (error) {
    console.error(`Error saving texts for screen ${screenName}:`, error);
    throw error;
  }
}

/**
 * Elimina un texto
 */
export async function deleteText(key) {
  await connectDB();
  
  try {
    const result = await TextConfig.deleteOne({ key });
    return result.deletedCount > 0;
  } catch (error) {
    console.error(`Error deleting text ${key}:`, error);
    throw error;
  }
}

/**
 * Lista todos los textos con metadatos
 */
export async function listTexts() {
  await connectDB();
  
  try {
    const docs = await TextConfig.find({}).lean();
    return docs.map(doc => ({
      key: doc.key,
      screen: doc.screen,
      value: doc.value,
      version: doc.version,
      description: doc.description,
      updatedAt: doc.updatedAt,
    }));
  } catch (error) {
    console.error('Error listing texts:', error);
    return [];
  }
}

/**
 * Migra textos del JSON a MongoDB
 */
export async function migrateTextsToMongo() {
  await connectDB();
  
  try {
    const data = getTextsData();
    const screens = data.screens || {};
    const errors = data.errors || {};
    let count = 0;
    
    // Migrar textos de pantallas
    for (const [screenName, texts] of Object.entries(screens)) {
      for (const [key, value] of Object.entries(texts)) {
        await saveText(`${screenName}.${key}`, screenName, value);
        count++;
      }
    }
    
    // Migrar mensajes de error
    for (const [key, value] of Object.entries(errors)) {
      await saveText(`errors.${key}`, 'errors', value);
      count++;
    }
    
    console.log(`✅ Migrados ${count} textos a MongoDB`);
    return { success: true, count };
  } catch (error) {
    console.error('Error migrating texts:', error);
    throw error;
  }
}
