import express from 'express';
import {
  getAllDefinitions,
  getDefinitionById,
  saveDefinition,
  deleteDefinition,
  listDefinitions,
} from '../models/ScreenDefinition.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import {
  findAndReplaceText,
  findAllTexts,
  updateTextByPath,
  findComponentsByType,
  validateDefinition,
} from '../utils/screenUtils.js';

const router = express.Router();

// Aplicar autenticación a todas las rutas de admin (excepto GET que es opcional)
router.use(optionalAuth);

/**
 * GET /api/admin/screens
 * Lista todas las definiciones de pantallas
 * Autenticación: Opcional (muestra más info si está autenticado)
 */
router.get('/screens', async (req, res, next) => {
  try {
    const definitions = await listDefinitions();
    
    if (req.authenticated) {
      // Si está autenticado, devolver más información
      res.json({ 
        definitions,
        authenticated: true,
        total: definitions.length,
      });
    } else {
      // Si no está autenticado, solo IDs
      res.json({ 
        definitions: definitions.map(d => ({ id: d.id, type: d.type })),
        authenticated: false,
        message: 'Usa X-API-Key header para ver más información',
      });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/screens/:screenId
 * Obtiene una definición específica
 * Autenticación: Opcional
 */
router.get('/screens/:screenId', async (req, res, next) => {
  try {
    const { screenId } = req.params;
    const definition = await getDefinitionById(screenId);
    
    if (!definition) {
      return res.status(404).json({
        error: {
          message: `Pantalla ${screenId} no encontrada`,
          code: 'SCREEN_NOT_FOUND',
        },
      });
    }
    
    res.json(definition);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/admin/screens/:screenId
 * Crea o actualiza una definición de pantalla completa
 * Autenticación: Requerida
 */
router.put('/screens/:screenId', requireAuth, async (req, res, next) => {
  try {
    const { screenId } = req.params;
    const definition = req.body;
    
    const errors = validateDefinition(definition);
    if (errors.length > 0) {
      return res.status(400).json({
        error: {
          message: 'Definición inválida',
          code: 'INVALID_DEFINITION',
          details: errors,
        },
      });
    }
    
    const saved = await saveDefinition(screenId, definition);
    res.json({
      success: true,
      definition: saved,
      message: `Pantalla ${screenId} guardada correctamente`,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/admin/screens/:screenId/text
 * Actualiza un texto específico en una pantalla
 * Autenticación: Requerida
 * 
 * Body: { search: "texto a buscar", replace: "nuevo texto" }
 * o: { path: "layout.children.0.props.text", value: "nuevo texto" }
 */
router.patch('/screens/:screenId/text', requireAuth, async (req, res, next) => {
  try {
    const { screenId } = req.params;
    const { search, replace, path, value } = req.body;
    
    const definition = await getDefinitionById(screenId);
    if (!definition) {
      return res.status(404).json({
        error: {
          message: `Pantalla ${screenId} no encontrada`,
          code: 'SCREEN_NOT_FOUND',
        },
      });
    }
    
    let updated;
    if (path && value !== undefined) {
      // Actualizar por path específico
      updated = updateTextByPath(JSON.parse(JSON.stringify(definition)), path, value);
    } else if (search && replace !== undefined) {
      // Buscar y reemplazar
      updated = findAndReplaceText(JSON.parse(JSON.stringify(definition)), search, replace);
    } else {
      return res.status(400).json({
        error: {
          message: 'Debe proporcionar "search" y "replace" o "path" y "value"',
          code: 'INVALID_REQUEST',
        },
      });
    }
    
    const saved = await saveDefinition(screenId, updated);
    res.json({
      success: true,
      message: `Texto actualizado en ${screenId}`,
      definition: saved,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/screens/:screenId/texts
 * Lista todos los textos en una pantalla
 * Autenticación: Requerida
 */
router.get('/screens/:screenId/texts', requireAuth, async (req, res, next) => {
  try {
    const { screenId } = req.params;
    const definition = await getDefinitionById(screenId);
    
    if (!definition) {
      return res.status(404).json({
        error: {
          message: `Pantalla ${screenId} no encontrada`,
          code: 'SCREEN_NOT_FOUND',
        },
      });
    }
    
    const texts = findAllTexts(definition);
    res.json({
      screenId,
      texts,
      total: texts.length,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/screens/:screenId/components/:type
 * Busca componentes de un tipo específico en una pantalla
 * Autenticación: Requerida
 */
router.get('/screens/:screenId/components/:type', requireAuth, async (req, res, next) => {
  try {
    const { screenId, type } = req.params;
    const definition = await getDefinitionById(screenId);
    
    if (!definition) {
      return res.status(404).json({
        error: {
          message: `Pantalla ${screenId} no encontrada`,
          code: 'SCREEN_NOT_FOUND',
        },
      });
    }
    
    const components = findComponentsByType(definition, type);
    res.json({
      screenId,
      type,
      components,
      total: components.length,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/admin/screens/:screenId
 * Elimina una definición (la restaura a la del archivo por defecto)
 * Autenticación: Requerida
 */
router.delete('/screens/:screenId', requireAuth, async (req, res, next) => {
  try {
    const { screenId } = req.params;
    await deleteDefinition(screenId);
    
    res.json({
      success: true,
      message: `Pantalla ${screenId} eliminada. Se usará la definición por defecto.`,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/screens/:screenId/reset
 * Restaura una definición a su valor por defecto del archivo
 * Autenticación: Requerida
 */
router.post('/screens/:screenId/reset', requireAuth, async (req, res, next) => {
  try {
    const { screenId } = req.params;
    const { screenDefinitions } = await import('../definitions/screens.js');
    
    if (!screenDefinitions[screenId]) {
      return res.status(404).json({
        error: {
          message: `No existe definición por defecto para ${screenId}`,
          code: 'DEFAULT_NOT_FOUND',
        },
      });
    }
    
    await deleteDefinition(screenId);
    
    res.json({
      success: true,
      message: `Pantalla ${screenId} restaurada a su valor por defecto`,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/screens/:screenId/duplicate
 * Duplica una pantalla con un nuevo ID
 * Autenticación: Requerida
 */
router.post('/screens/:screenId/duplicate', requireAuth, async (req, res, next) => {
  try {
    const { screenId } = req.params;
    const { newId } = req.body;
    
    if (!newId) {
      return res.status(400).json({
        error: {
          message: 'Debe proporcionar "newId" en el body',
          code: 'MISSING_NEW_ID',
        },
      });
    }
    
    const definition = await getDefinitionById(screenId);
    if (!definition) {
      return res.status(404).json({
        error: {
          message: `Pantalla ${screenId} no encontrada`,
          code: 'SCREEN_NOT_FOUND',
        },
      });
    }
    
    const duplicated = {
      ...definition,
      id: newId,
    };
    
    await saveDefinition(newId, duplicated);
    
    res.json({
      success: true,
      message: `Pantalla ${screenId} duplicada como ${newId}`,
      definition: duplicated,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/health
 * Health check de la API de administración
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    authenticated: req.authenticated || false,
    timestamp: new Date().toISOString(),
  });
});

export { router as adminRoutes };