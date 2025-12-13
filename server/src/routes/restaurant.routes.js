import { Router } from 'express';
import { body, param } from 'express-validator';
import { validate } from '../middlewares/validate.js';
import { authenticate, authorize, isRestaurantOwner } from '../middlewares/auth.js';
import * as restaurantController from '../controllers/restaurant.controller.js';

const router = Router();

// Validaciones
const createRestaurantValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('El nombre del restaurante es requerido'),
  body('description')
    .optional()
    .trim(),
  body('address')
    .trim()
    .notEmpty()
    .withMessage('La dirección es requerida'),
  body('phone')
    .notEmpty()
    .withMessage('El teléfono es requerido'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Debe ser un email válido')
];

const updateRestaurantValidation = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('El nombre no puede estar vacío'),
  body('description')
    .optional()
    .trim(),
  body('address')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('La dirección no puede estar vacía'),
  body('opening_hours')
    .optional()
    .isObject()
    .withMessage('Horarios deben ser un objeto válido'),
  body('delivery_zones')
    .optional()
    .isArray()
    .withMessage('Zonas de delivery deben ser un arreglo')
];

// Rutas públicas
router.get('/', restaurantController.getAllRestaurants);
router.get('/:slug', restaurantController.getRestaurantBySlug);
router.get('/id/:id', restaurantController.getRestaurantById);

// Rutas protegidas - Solo admin puede crear restaurantes
router.post(
  '/',
  authenticate,
  authorize('admin'),
  createRestaurantValidation,
  validate,
  restaurantController.createRestaurant
);

// Rutas protegidas - Dueño del restaurante o admin
router.put(
  '/:restaurantId',
  authenticate,
  isRestaurantOwner,
  updateRestaurantValidation,
  validate,
  restaurantController.updateRestaurant
);

router.delete(
  '/:restaurantId',
  authenticate,
  authorize('admin'),
  restaurantController.deleteRestaurant
);

// Estadísticas del restaurante (solo dueño o admin)
router.get(
  '/:restaurantId/stats',
  authenticate,
  isRestaurantOwner,
  restaurantController.getRestaurantStats
);

// Configuración de comisiones (solo admin)
router.put(
  '/:restaurantId/commission',
  authenticate,
  authorize('admin'),
  restaurantController.updateCommission
);

export default router;
