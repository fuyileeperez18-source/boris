import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { validate } from '../middlewares/validate.js';
import { authenticate } from '../middlewares/auth.js';
import * as notificationController from '../controllers/notification.controller.js';

const router = Router();

// Rutas protegidas
router.get('/', authenticate, notificationController.getMyNotifications);

router.get('/unread-count', authenticate, notificationController.getUnreadCount);

router.patch('/:notificationId/read',
  authenticate,
  param('notificationId').isUUID().withMessage('ID de notificación inválido'),
  validate,
  notificationController.markAsRead
);

router.patch('/read-all', authenticate, notificationController.markAllAsRead);

router.delete('/:notificationId',
  authenticate,
  param('notificationId').isUUID().withMessage('ID de notificación inválido'),
  validate,
  notificationController.deleteNotification
);

router.delete('/', authenticate, notificationController.clearAllNotifications);

// Rutas para crear notificaciones (uso interno por el sistema)
router.post('/',
  authenticate,
  body('user_id').isUUID().withMessage('ID de usuario inválido'),
  body('type').isIn(['order', 'reservation', 'promo', 'system', 'review', 'chat']).withMessage('Tipo inválido'),
  body('title').trim().notEmpty().withMessage('El título es requerido'),
  body('message').trim().notEmpty().withMessage('El mensaje es requerido'),
  body('link').optional().isURL().withMessage('Link inválido'),
  validate,
  notificationController.createNotification
);

export default router;
