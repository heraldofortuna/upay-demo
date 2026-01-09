/**
 * Script para matar procesos en un puerto específico
 * Uso: node scripts/kill-port.js 3000
 */

const port = process.argv[2] || 3000;

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function killPort(port) {
  try {
    console.log(`🔍 Buscando proceso en puerto ${port}...`);
    
    // Windows: encontrar PID
    const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
    
    if (!stdout) {
      console.log(`✅ Puerto ${port} está libre`);
      return;
    }
    
    // Extraer PID (última columna)
    const lines = stdout.trim().split('\n');
    const pids = new Set();
    
    lines.forEach(line => {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && !isNaN(pid)) {
        pids.add(pid);
      }
    });
    
    if (pids.size === 0) {
      console.log(`✅ Puerto ${port} está libre`);
      return;
    }
    
    console.log(`🛑 Encontrados ${pids.size} proceso(s) usando el puerto ${port}`);
    
    // Matar procesos
    for (const pid of pids) {
      try {
        console.log(`   Matando proceso ${pid}...`);
        await execAsync(`taskkill /PID ${pid} /F`);
        console.log(`   ✅ Proceso ${pid} terminado`);
      } catch (error) {
        console.log(`   ⚠️ No se pudo terminar proceso ${pid}: ${error.message}`);
      }
    }
    
    console.log(`✅ Puerto ${port} liberado`);
  } catch (error) {
    if (error.message.includes('findstr')) {
      console.log(`✅ Puerto ${port} está libre`);
    } else {
      console.error(`❌ Error: ${error.message}`);
      process.exit(1);
    }
  }
}

killPort(port);