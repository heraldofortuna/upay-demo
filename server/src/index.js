import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { screenRoutes } from './routes/screens.js';
import { apiRoutes } from './routes/api.js';
import { mockRoutes } from './routes/mocks.js';
import { adminRoutes } from './routes/admin.js';
import { textRoutes } from './routes/texts.js';
import { connectDB } from './models/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/screens', screenRoutes);
app.use('/api', apiRoutes);
app.use('/api/admin', adminRoutes); // Rutas de administración para gestionar definiciones SDUI
app.use('/api/admin/texts', textRoutes); // Rutas de administración para gestionar textos OTA
app.use('/mocks', mockRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: {
      message: err.message || 'Error interno del servidor',
      code: 'INTERNAL_ERROR',
    },
  });
});

// Connect to DB and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 BFF Server running on port ${PORT}`);
    console.log(`📱 SDUI API available at http://localhost:${PORT}/api/screens`);
    console.log(`🔌 Business API available at http://localhost:${PORT}/api`);
    console.log(`🔧 Admin API (SDUI) available at http://localhost:${PORT}/api/admin`);
    console.log(`📝 Admin API (Texts OTA) available at http://localhost:${PORT}/api/admin/texts`);
    console.log(`🎭 Mocks available at http://localhost:${PORT}/mocks`);
  });
}).catch(error => {
  console.error('Failed to start server due to database connection error:', error);
  process.exit(1);
});