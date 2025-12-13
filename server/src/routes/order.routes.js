import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middlewares/validate.js';
import { authenticate, authorize, isRestaurantOwner } from '../middlewares/auth.js';
import * as orderController from '../controllers/order.controller.js';

const router = Router();

// Validaciones
const createOrderValidation = [
  body('restaurant_id')
    .notEmpty()
    .withMessage('El ID del restaurante es requerido'),
  body('customer_name')
    .trim()
    .notEmpty()
    .withMessage('El nombre del cliente es requerido'),
  body('customer_phone')
    .notEmpty()
    .withMessage('El teléfono es requerido'),
  body('items')
    .isArray({ min: 1 })
    .withMessage('Debe incluir al menos un producto'),
  body('items.*.product_id')
    .notEmpty()
    .withMessage('ID de producto requerido'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('La cantidad debe ser al menos 1'),
  body('order_type')
    .isIn(['delivery', 'pickup'])
    .withMessage('Tipo de pedido inválido'),
  body('delivery_address')
    .if(body('order_type').equals('delivery'))
    .notEmpty()
    .withMessage('La dirección de entrega es requerida para delivery'),
  body('delivery_method')
    .if(body('order_type').equals('delivery'))
    .isIn(['restaurant_delivery', 'platform_delivery'])
    .withMessage('Método de delivery inválido')
];

const updateStatusValidation = [
  body('status')
    .isIn(['received', 'preparing', 'ready', 'on_the_way', 'delivered', 'cancelled'])
    .withMessage('Estado inválido')
];

// ===== RUTAS PÚBLICAS =====

// Crear pedido (puede ser sin autenticación para facilitar uso)
router.post(
  '/',
  createOrderValidation,
  validate,
  orderController.createOrder
);

// Consultar pedido por número de seguimiento
router.get(
  '/track/:trackingNumber',
  orderController.trackOrder
);

// Calcular costo de envío
router.post(
  '/calculate-delivery',
  orderController.calculateDeliveryFee
);

// ===== RUTAS PROTEGIDAS - CLIENTE =====

// Obtener mis pedidos
router.get(
  '/my-orders',
  authenticate,
  orderController.getMyOrders
);

// Obtener pedido específico
router.get(
  '/:orderId',
  authenticate,
  orderController.getOrderById
);

// Cancelar mi pedido (solo si está en estado inicial)
router.put(
  '/:orderId/cancel',
  authenticate,
  orderController.cancelOrder
);

// ===== RUTAS PROTEGIDAS - RESTAURANTE =====

// Obtener pedidos del restaurante
router.get(
  '/restaurant/:restaurantId',
  authenticate,
  isRestaurantOwner,
  orderController.getRestaurantOrders
);

// Obtener pedidos pendientes/activos
router.get(
  '/restaurant/:restaurantId/active',
  authenticate,
  isRestaurantOwner,
  orderController.getActiveOrders
);

// Actualizar estado del pedido
router.put(
  '/:orderId/status',
  authenticate,
  updateStatusValidation,
  validate,
  orderController.updateOrderStatus
);

// Obtener historial de pedidos
router.get(
  '/restaurant/:restaurantId/history',
  authenticate,
  isRestaurantOwner,
  orderController.getOrderHistory
);

// ===== RUTAS PROTEGIDAS - ADMIN =====

// Obtener todos los pedidos (admin)
router.get(
  '/admin/all',
  authenticate,
  authorize('admin'),
  orderController.getAllOrders
);

// Estadísticas de pedidos (admin)
router.get(
  '/admin/stats',
  authenticate,
  authorize('admin'),
  orderController.getOrderStats
);

export default router;
