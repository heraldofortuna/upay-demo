import express from 'express';
import { getMockData } from '../services/mockService.js';

const router = express.Router();

/**
 * GET /mocks/:mockId
 * Obtiene datos mock para desarrollo
 */
router.get('/:mockId', (req, res) => {
  try {
    const { mockId } = req.params;
    const mockData = getMockData(mockId, req.query);
    res.json(mockData);
  } catch (error) {
    res.status(404).json({
      error: {
        message: `Mock ${req.params.mockId} no encontrado`,
        code: 'MOCK_NOT_FOUND',
      },
    });
  }
});

export { router as mockRoutes };