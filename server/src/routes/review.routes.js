import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { validate } from '../middlewares/validate.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import * as reviewController from '../controllers/review.controller.js';

const router = Router();

// Validaciones
const createReviewValidation = [
  body('product_id')
    .isUUID()
    .withMessage('ID de producto inválido'),
  body('order_id')
    .optional()
    .isUUID()
    .withMessage('ID de orden inválido'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('La calificación debe ser entre 1 y 5'),
  body('title')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('El título no puede exceder 100 caracteres'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('El comentario no puede exceder 1000 caracteres')
];

// Rutas públicas
router.get('/product/:productId',
  param('productId').isUUID().withMessage('ID de producto inválido'),
  validate,
  reviewController.getProductReviews
);

router.get('/product/:productId/rating-summary',
  param('productId').isUUID().withMessage('ID de producto inválido'),
  validate,
  reviewController.getProductRatingSummary
);

// Rutas protegidas (autenticado)
router.get('/my-reviews', authenticate, reviewController.getMyReviews);

router.post('/',
  authenticate,
  createReviewValidation,
  validate,
  reviewController.createReview
);

router.put('/:reviewId',
  authenticate,
  param('reviewId').isUUID().withMessage('ID de reseña inválido'),
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('La calificación debe ser entre 1 y 5'),
  validate,
  reviewController.updateReview
);

router.delete('/:reviewId',
  authenticate,
  param('reviewId').isUUID().withMessage('ID de reseña inválido'),
  validate,
  reviewController.deleteReview
);

// Rutas de admin
router.get('/',
  authenticate,
  authorize('admin'),
  query('product_id').optional().isUUID(),
  query('user_id').optional().isUUID(),
  query('status').optional().isIn(['pending', 'approved', 'rejected']),
  validate,
  reviewController.getAllReviews
);

router.patch('/:reviewId/status',
  authenticate,
  authorize('admin', 'restaurant'),
  param('reviewId').isUUID().withMessage('ID de reseña inválido'),
  body('status')
    .isIn(['pending', 'approved', 'rejected'])
    .withMessage('Estado inválido'),
  validate,
  reviewController.moderateReview
);

export default router;
