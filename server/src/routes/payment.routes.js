import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middlewares/validate.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import * as paymentController from '../controllers/payment.controller.js';

const router = Router();

// Validaciones
const createPreferenceValidation = [
  body('order_id')
    .notEmpty()
    .withMessage('El ID del pedido es requerido'),
  body('items')
    .isArray({ min: 1 })
    .withMessage('Debe incluir al menos un producto'),
  body('items.*.title')
    .notEmpty()
    .withMessage('Título del producto requerido'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Cantidad inválida'),
  body('items.*.unit_price')
    .isFloat({ min: 0 })
    .withMessage('Precio inválido')
];

// ===== RUTAS PARA MERCADO PAGO =====

// Crear preferencia de pago (checkout)
router.post(
  '/create-preference',
  createPreferenceValidation,
  validate,
  paymentController.createPreference
);

// Webhook de Mercado Pago (notificaciones IPN)
router.post(
  '/webhook',
  paymentController.handleWebhook
);

// Verificar estado de pago
router.get(
  '/status/:paymentId',
  paymentController.getPaymentStatus
);

// ===== RUTAS PROTEGIDAS =====

// Obtener pagos de un pedido
router.get(
  '/order/:orderId',
  authenticate,
  paymentController.getPaymentsByOrder
);

// Obtener mis pagos
router.get(
  '/my-payments',
  authenticate,
  paymentController.getMyPayments
);

// Solicitar reembolso
router.post(
  '/:paymentId/refund',
  authenticate,
  paymentController.requestRefund
);

// ===== RUTAS ADMIN =====

// Obtener todos los pagos
router.get(
  '/admin/all',
  authenticate,
  authorize('admin'),
  paymentController.getAllPayments
);

// Estadísticas de pagos
router.get(
  '/admin/stats',
  authenticate,
  authorize('admin'),
  paymentController.getPaymentStats
);

// Procesar reembolso manualmente
router.post(
  '/admin/:paymentId/process-refund',
  authenticate,
  authorize('admin'),
  paymentController.processRefund
);

export default router;
