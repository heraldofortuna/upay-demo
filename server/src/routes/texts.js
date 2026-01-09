/**
 * Rutas para gestionar textos de la app OTA
 * Similar al Admin API de SDUI pero para textos
 */

import express from 'express';
import {
  getAllTexts,
  getTextsByScreen,
  getTextByKey,
  saveText,
  saveScreenTexts,
  deleteText,
  listTexts,
} from '../models/TextConfigMongo.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/admin/texts
 * Lista todos los textos
 * Autenticación: Requerida
 */
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const texts = await listTexts();
    res.json({
      success: true,
      texts,
      total: texts.length,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/texts/all
 * Obtiene todos los textos organizados por pantalla
 * Autenticación: Requerida
 */
router.get('/all', requireAuth, async (req, res, next) => {
  try {
    const texts = await getAllTexts();
    res.json({
      success: true,
      texts,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/texts/screen/:screenName
 * Obtiene todos los textos de una pantalla específica
 * Autenticación: Requerida
 */
router.get('/screen/:screenName', requireAuth, async (req, res, next) => {
  try {
    const { screenName } = req.params;
    const texts = await getTextsByScreen(screenName);
    res.json({
      success: true,
      screen: screenName,
      texts,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/texts/:key
 * Obtiene un texto específico por key
 * Autenticación: Requerida
 */
router.get('/:key', requireAuth, async (req, res, next) => {
  try {
    const { key } = req.params;
    const value = await getTextByKey(key);
    
    if (value === null) {
      return res.status(404).json({
        error: {
          message: `Texto ${key} no encontrado`,
          code: 'TEXT_NOT_FOUND',
        },
      });
    }
    
    res.json({
      success: true,
      key,
      value,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/admin/texts/:key
 * Crea o actualiza un texto específico
 * Autenticación: Requerida
 * 
 * Body: { screen: "ScreenName", value: "texto", description: "opcional" }
 */
router.put('/:key', requireAuth, async (req, res, next) => {
  try {
    const { key } = req.params;
    const { screen, value, description } = req.body;
    
    if (!screen || value === undefined) {
      return res.status(400).json({
        error: {
          message: 'Se requieren "screen" y "value"',
          code: 'INVALID_REQUEST',
        },
      });
    }
    
    const saved = await saveText(key, screen, value, description);
    res.json({
      success: true,
      message: `Texto ${key} guardado correctamente`,
      text: saved,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/admin/texts/screen/:screenName
 * Actualiza todos los textos de una pantalla
 * Autenticación: Requerida
 * 
 * Body: { title: "texto", subtitle: "texto", ... }
 */
router.put('/screen/:screenName', requireAuth, async (req, res, next) => {
  try {
    const { screenName } = req.params;
    const texts = req.body;
    
    if (!texts || typeof texts !== 'object') {
      return res.status(400).json({
        error: {
          message: 'Body debe ser un objeto con los textos',
          code: 'INVALID_REQUEST',
        },
      });
    }
    
    const result = await saveScreenTexts(screenName, texts);
    res.json({
      success: true,
      message: `Textos de ${screenName} guardados correctamente`,
      screen: screenName,
      count: result.count,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/admin/texts/:key
 * Actualiza solo el valor de un texto
 * Autenticación: Requerida
 * 
 * Body: { value: "nuevo texto" }
 */
router.patch('/:key', requireAuth, async (req, res, next) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    
    if (value === undefined) {
      return res.status(400).json({
        error: {
          message: 'Se requiere "value"',
          code: 'INVALID_REQUEST',
        },
      });
    }
    
    // Obtener texto existente para mantener screen
    const existing = await getTextByKey(key);
    if (!existing) {
      return res.status(404).json({
        error: {
          message: `Texto ${key} no encontrado`,
          code: 'TEXT_NOT_FOUND',
        },
      });
    }
    
    // Extraer screen del key (formato: "ScreenName.key")
    const parts = key.split('.');
    const screen = parts[0];
    
    const saved = await saveText(key, screen, value);
    res.json({
      success: true,
      message: `Texto ${key} actualizado`,
      text: saved,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/admin/texts/:key
 * Elimina un texto
 * Autenticación: Requerida
 */
router.delete('/:key', requireAuth, async (req, res, next) => {
  try {
    const { key } = req.params;
    const deleted = await deleteText(key);
    
    if (!deleted) {
      return res.status(404).json({
        error: {
          message: `Texto ${key} no encontrado`,
          code: 'TEXT_NOT_FOUND',
        },
      });
    }
    
    res.json({
      success: true,
      message: `Texto ${key} eliminado`,
    });
  } catch (error) {
    next(error);
  }
});

export { router as textRoutes };
