import express from 'express';
import { getScreenDefinition } from '../services/screenService.js';

const router = express.Router();

/**
 * GET /api/screens/:screenId
 * Obtiene la definición de UI para una pantalla específica
 */
router.get('/:screenId', async (req, res, next) => {
  try {
    const { screenId } = req.params;
    const { context } = req.query;

    const screenDefinition = await getScreenDefinition(screenId, {
      context: context ? JSON.parse(context) : {},
    });

    res.json(screenDefinition);
  } catch (error) {
    next(error);
  }
});

export { router as screenRoutes };