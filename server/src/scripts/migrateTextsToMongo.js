/**
 * Script para migrar textos del JSON a MongoDB
 */

import { connectDB, disconnectDB } from '../models/db.js';
import { migrateTextsToMongo } from '../models/TextConfigMongo.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  try {
    console.log('🔄 Iniciando migración de textos a MongoDB...');
    
    await connectDB();
    const result = await migrateTextsToMongo();
    
    console.log(`✅ Migración completada: ${result.count} textos migrados`);
    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en la migración:', error);
    await disconnectDB();
    process.exit(1);
  }
}

main();
