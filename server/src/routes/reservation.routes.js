import { Router } from 'express';
import { body, query } from 'express-validator';
import { validate } from '../middlewares/validate.js';
import { authenticate, isRestaurantOwner } from '../middlewares/auth.js';
import * as reservationController from '../controllers/reservation.controller.js';

const router = Router();

// Validaciones
const createReservationValidation = [
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
  body('customer_email')
    .optional()
    .isEmail()
    .withMessage('Debe ser un email válido'),
  body('reservation_date')
    .isISO8601()
    .withMessage('Fecha inválida'),
  body('reservation_time')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Hora inválida (formato HH:MM)'),
  body('number_of_people')
    .isInt({ min: 1, max: 50 })
    .withMessage('Número de personas debe ser entre 1 y 50'),
  body('special_requests')
    .optional()
    .trim()
];

const updateStatusValidation = [
  body('status')
    .isIn(['pending', 'confirmed', 'cancelled', 'completed'])
    .withMessage('Estado inválido')
];

// ===== RUTAS PÚBLICAS =====

// Crear reserva (no requiere autenticación para facilitar uso)
router.post(
  '/',
  createReservationValidation,
  validate,
  reservationController.createReservation
);

// Verificar disponibilidad
router.get(
  '/availability/:restaurantId',
  reservationController.checkAvailability
);

// Consultar reserva por código de confirmación
router.get(
  '/code/:confirmationCode',
  reservationController.getReservationByCode
);

// ===== RUTAS PROTEGIDAS - CLIENTE =====

// Obtener mis reservas (requiere autenticación)
router.get(
  '/my-reservations',
  authenticate,
  reservationController.getMyReservations
);

// Cancelar mi reserva
router.put(
  '/:reservationId/cancel',
  authenticate,
  reservationController.cancelMyReservation
);

// ===== RUTAS PROTEGIDAS - RESTAURANTE =====

// Obtener todas las reservas del restaurante
router.get(
  '/restaurant/:restaurantId',
  authenticate,
  isRestaurantOwner,
  reservationController.getRestaurantReservations
);

// Obtener reservas por fecha
router.get(
  '/restaurant/:restaurantId/date/:date',
  authenticate,
  isRestaurantOwner,
  reservationController.getReservationsByDate
);

// Actualizar estado de reserva
router.put(
  '/:reservationId/status',
  authenticate,
  updateStatusValidation,
  validate,
  reservationController.updateReservationStatus
);

// Obtener una reserva específica
router.get(
  '/:reservationId',
  authenticate,
  reservationController.getReservationById
);

// Configurar capacidad y horarios de reservas
router.put(
  '/restaurant/:restaurantId/config',
  authenticate,
  isRestaurantOwner,
  reservationController.updateReservationConfig
);

export default router;
