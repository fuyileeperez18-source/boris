import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middlewares/validate.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import * as userController from '../controllers/user.controller.js';

const router = Router();

// Validaciones
const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('El nombre no puede estar vacío'),
  body('phone')
    .optional()
    .isMobilePhone('es-CO')
    .withMessage('Teléfono inválido'),
  body('default_address')
    .optional()
    .trim()
];

// ===== RUTAS PROTEGIDAS - USUARIO =====

// Obtener perfil
router.get(
  '/profile',
  authenticate,
  userController.getProfile
);

// Actualizar perfil
router.put(
  '/profile',
  authenticate,
  updateProfileValidation,
  validate,
  userController.updateProfile
);

// Obtener direcciones guardadas
router.get(
  '/addresses',
  authenticate,
  userController.getAddresses
);

// Agregar dirección
router.post(
  '/addresses',
  authenticate,
  userController.addAddress
);

// Eliminar dirección
router.delete(
  '/addresses/:addressId',
  authenticate,
  userController.deleteAddress
);

// Obtener historial de pedidos
router.get(
  '/order-history',
  authenticate,
  userController.getOrderHistory
);

// Obtener historial de reservas
router.get(
  '/reservation-history',
  authenticate,
  userController.getReservationHistory
);

// Restaurantes favoritos
router.get(
  '/favorites',
  authenticate,
  userController.getFavorites
);

router.post(
  '/favorites/:restaurantId',
  authenticate,
  userController.addFavorite
);

router.delete(
  '/favorites/:restaurantId',
  authenticate,
  userController.removeFavorite
);

// ===== RUTAS ADMIN =====

// Listar todos los usuarios
router.get(
  '/admin/all',
  authenticate,
  authorize('admin'),
  userController.getAllUsers
);

// Obtener usuario específico
router.get(
  '/admin/:userId',
  authenticate,
  authorize('admin'),
  userController.getUserById
);

// Actualizar rol de usuario
router.put(
  '/admin/:userId/role',
  authenticate,
  authorize('admin'),
  userController.updateUserRole
);

// Desactivar usuario
router.put(
  '/admin/:userId/deactivate',
  authenticate,
  authorize('admin'),
  userController.deactivateUser
);

// Estadísticas de usuarios
router.get(
  '/admin/stats',
  authenticate,
  authorize('admin'),
  userController.getUserStats
);

export default router;
