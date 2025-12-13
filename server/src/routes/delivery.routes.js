import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middlewares/validate.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import * as deliveryController from '../controllers/delivery.controller.js';

const router = Router();

// Validaciones
const registerDeliveryPersonValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('El nombre es requerido'),
  body('phone')
    .notEmpty()
    .withMessage('El teléfono es requerido'),
  body('email')
    .isEmail()
    .withMessage('Email inválido'),
  body('vehicle_type')
    .isIn(['moto', 'bicicleta', 'carro'])
    .withMessage('Tipo de vehículo inválido'),
  body('vehicle_plate')
    .optional()
    .trim()
];

const updateLocationValidation = [
  body('latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitud inválida'),
  body('longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitud inválida')
];

// ===== RUTAS PÚBLICAS =====

// Registrarse como domiciliario
router.post(
  '/register',
  registerDeliveryPersonValidation,
  validate,
  deliveryController.registerDeliveryPerson
);

// ===== RUTAS PROTEGIDAS - DOMICILIARIO =====

// Obtener perfil de domiciliario
router.get(
  '/profile',
  authenticate,
  authorize('delivery'),
  deliveryController.getDeliveryProfile
);

// Actualizar ubicación en tiempo real
router.put(
  '/location',
  authenticate,
  authorize('delivery'),
  updateLocationValidation,
  validate,
  deliveryController.updateLocation
);

// Cambiar estado de disponibilidad
router.put(
  '/availability',
  authenticate,
  authorize('delivery'),
  deliveryController.toggleAvailability
);

// Obtener pedidos asignados
router.get(
  '/my-orders',
  authenticate,
  authorize('delivery'),
  deliveryController.getAssignedOrders
);

// Obtener pedido actual
router.get(
  '/current-order',
  authenticate,
  authorize('delivery'),
  deliveryController.getCurrentOrder
);

// Aceptar pedido
router.put(
  '/orders/:orderId/accept',
  authenticate,
  authorize('delivery'),
  deliveryController.acceptOrder
);

// Rechazar pedido
router.put(
  '/orders/:orderId/reject',
  authenticate,
  authorize('delivery'),
  deliveryController.rejectOrder
);

// Marcar como recogido del restaurante
router.put(
  '/orders/:orderId/picked-up',
  authenticate,
  authorize('delivery'),
  deliveryController.markAsPickedUp
);

// Marcar como entregado
router.put(
  '/orders/:orderId/delivered',
  authenticate,
  authorize('delivery'),
  deliveryController.markAsDelivered
);

// Obtener historial de entregas
router.get(
  '/history',
  authenticate,
  authorize('delivery'),
  deliveryController.getDeliveryHistory
);

// Obtener ganancias
router.get(
  '/earnings',
  authenticate,
  authorize('delivery'),
  deliveryController.getEarnings
);

// ===== RUTAS ADMIN =====

// Listar todos los domiciliarios
router.get(
  '/admin/all',
  authenticate,
  authorize('admin'),
  deliveryController.getAllDeliveryPersons
);

// Aprobar/rechazar solicitud de domiciliario
router.put(
  '/admin/:deliveryPersonId/approve',
  authenticate,
  authorize('admin'),
  deliveryController.approveDeliveryPerson
);

// Desactivar domiciliario
router.put(
  '/admin/:deliveryPersonId/deactivate',
  authenticate,
  authorize('admin'),
  deliveryController.deactivateDeliveryPerson
);

// Asignar pedido a domiciliario
router.post(
  '/admin/assign',
  authenticate,
  authorize('admin'),
  deliveryController.assignOrder
);

// Ver domiciliarios disponibles cercanos
router.get(
  '/admin/available',
  authenticate,
  authorize('admin'),
  deliveryController.getAvailableDeliveryPersons
);

// Estadísticas de delivery
router.get(
  '/admin/stats',
  authenticate,
  authorize('admin'),
  deliveryController.getDeliveryStats
);

export default router;
