/**
 * Script de migración: Copia definiciones de screens.js a MongoDB
 */

import dotenv from 'dotenv';
import { screenDefinitions } from '../definitions/screens.js';
import { saveAllDefinitions } from '../models/ScreenDefinitionMongo.js';
import { connectDB, disconnectDB } from '../models/db.js';

dotenv.config();

async function migrate() {
  try {
    console.log('🚀 Iniciando migración a MongoDB...');
    
    // Verificar que MongoDB esté corriendo
    console.log('🔍 Verificando conexión a MongoDB...');
    
    // Conectar a MongoDB
    await connectDB();
    
    // Esperar un momento para asegurar que la conexión esté estable
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Verificar que la conexión esté activa
    const mongoose = (await import('mongoose')).default;
    if (mongoose.connection.readyState !== 1) {
      throw new Error('MongoDB no está conectado. Verifica que MongoDB esté corriendo.');
    }
    
    console.log('✅ Conexión establecida');
    
    // Migrar todas las definiciones
    console.log(`📦 Migrando ${Object.keys(screenDefinitions).length} definiciones...`);
    await saveAllDefinitions(screenDefinitions);
    
    console.log('✅ Migración completada exitosamente!');
    console.log(`📊 ${Object.keys(screenDefinitions).length} pantallas ahora están en MongoDB`);
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error.message);
    console.error('\n💡 Verifica que:');
    console.error('   1. MongoDB esté instalado y corriendo');
    console.error('   2. La URI en .env sea correcta');
    console.error('   3. MongoDB esté accesible en el puerto 27017');
    process.exit(1);
  } finally {
    await disconnectDB();
  }
}

// Ejecutar migración
migrate();