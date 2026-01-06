import express from 'express';
import { initializePos, getOtp, linkPos } from '../services/posService.js';

const router = express.Router();

/**
 * POST /api/pos/initialize
 * Inicializa el POS y verifica si está vinculado
 */
router.post('/pos/initialize', async (req, res, next) => {
  try {
    const result = await initializePos();
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/pos/otp
 * Obtiene un código OTP para vinculación
 */
router.get('/pos/otp', async (req, res, next) => {
  try {
    const result = await getOtp();
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/pos/link
 * Vincula el POS usando un código OTP
 */
router.post('/pos/link', async (req, res, next) => {
  try {
    const { otp } = req.body;
    const result = await linkPos(otp);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export { router as apiRoutes };