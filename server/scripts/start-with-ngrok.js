/**
 * Script para iniciar servidor y ngrok automáticamente
 * Requiere: npm install -g ngrok
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SERVER_PORT = process.env.PORT || 3000;

console.log('🚀 Iniciando servidor y ngrok...\n');

// Iniciar servidor
const server = spawn('npm', ['run', 'dev'], {
  cwd: join(__dirname, '..'),
  stdio: 'inherit',
  shell: true,
});

// Esperar un poco para que el servidor inicie
setTimeout(() => {
  console.log('\n🌐 Iniciando túnel ngrok...\n');
  
  // Iniciar ngrok
  const ngrok = spawn('ngrok', ['http', SERVER_PORT.toString()], {
    stdio: 'inherit',
    shell: true,
  });
  
  ngrok.on('error', (error) => {
    console.error('❌ Error iniciando ngrok:', error.message);
    console.error('💡 Asegúrate de tener ngrok instalado: npm install -g ngrok');
  });
  
  // Limpiar al salir
  process.on('SIGINT', () => {
    console.log('\n🛑 Deteniendo servidor y ngrok...');
    server.kill();
    ngrok.kill();
    process.exit();
  });
  
}, 3000);

server.on('error', (error) => {
  console.error('❌ Error iniciando servidor:', error.message);
  process.exit(1);
});