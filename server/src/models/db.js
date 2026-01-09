/**
 * Conexión a MongoDB
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Usar 127.0.0.1 en lugar de localhost para evitar problemas IPv6/IPv4
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/upay-demo';

let isConnected = false;

/**
 * Conecta a MongoDB
 */
export async function connectDB() {
  if (isConnected) {
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI);
    
    // Esperar a que la conexión esté lista
    await new Promise((resolve, reject) => {
      if (mongoose.connection.readyState === 1) {
        resolve();
      } else {
        mongoose.connection.once('connected', resolve);
        mongoose.connection.once('error', reject);
      }
    });

    isConnected = true;
    console.log('✅ MongoDB conectado:', MONGODB_URI);
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    throw error;
  }
}

/**
 * Desconecta de MongoDB
 */
export async function disconnectDB() {
  if (!isConnected) {
    return;
  }

  await mongoose.disconnect();
  isConnected = false;
  console.log('MongoDB desconectado');
}

// Conectar automáticamente al importar
connectDB().catch(console.error);