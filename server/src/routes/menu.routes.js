import { Router } from 'express';
import { body, param } from 'express-validator';
import { validate } from '../middlewares/validate.js';
import { authenticate, isRestaurantOwner } from '../middlewares/auth.js';
import * as menuController from '../controllers/menu.controller.js';

const router = Router();

// Validaciones para categorías
const categoryValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('El nombre de la categoría es requerido'),
  body('display_order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('El orden debe ser un número entero positivo')
];

// Validaciones para productos
const productValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('El nombre del producto es requerido'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('El precio debe ser un número positivo'),
  body('description')
    .optional()
    .trim(),
  body('category_id')
    .notEmpty()
    .withMessage('La categoría es requerida')
];

// ===== RUTAS PÚBLICAS =====

// Obtener menú completo de un restaurante (categorías + productos)
router.get('/restaurant/:restaurantId', menuController.getFullMenu);

// Obtener categorías de un restaurante
router.get('/restaurant/:restaurantId/categories', menuController.getCategories);

// Obtener productos de una categoría
router.get('/category/:categoryId/products', menuController.getProductsByCategory);

// Obtener producto específico
router.get('/product/:productId', menuController.getProductById);

// Obtener productos destacados
router.get('/restaurant/:restaurantId/featured', menuController.getFeaturedProducts);

// Buscar productos
router.get('/restaurant/:restaurantId/search', menuController.searchProducts);

// ===== RUTAS PROTEGIDAS - CATEGORÍAS =====

router.post(
  '/restaurant/:restaurantId/categories',
  authenticate,
  isRestaurantOwner,
  categoryValidation,
  validate,
  menuController.createCategory
);

router.put(
  '/category/:categoryId',
  authenticate,
  menuController.updateCategory
);

router.delete(
  '/category/:categoryId',
  authenticate,
  menuController.deleteCategory
);

// Reordenar categorías
router.put(
  '/restaurant/:restaurantId/categories/reorder',
  authenticate,
  isRestaurantOwner,
  menuController.reorderCategories
);

// ===== RUTAS PROTEGIDAS - PRODUCTOS =====

router.post(
  '/restaurant/:restaurantId/products',
  authenticate,
  isRestaurantOwner,
  productValidation,
  validate,
  menuController.createProduct
);

router.put(
  '/product/:productId',
  authenticate,
  menuController.updateProduct
);

router.delete(
  '/product/:productId',
  authenticate,
  menuController.deleteProduct
);

// Cambiar disponibilidad de producto
router.patch(
  '/product/:productId/availability',
  authenticate,
  menuController.toggleProductAvailability
);

// Marcar/desmarcar como destacado
router.patch(
  '/product/:productId/featured',
  authenticate,
  menuController.toggleProductFeatured
);

export default router;
