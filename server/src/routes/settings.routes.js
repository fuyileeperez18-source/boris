import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middlewares/validate.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import * as settingsController from '../controllers/settings.controller.js';

const router = Router();

// Rutas protegidas (solo admin)
router.get('/', authenticate, authorize('admin'), settingsController.getSettings);
router.put('/', authenticate, authorize('admin'), settingsController.updateSettings);
router.get('/export/csv', authenticate, authorize('admin'), settingsController.exportToCSV);

export default router;
