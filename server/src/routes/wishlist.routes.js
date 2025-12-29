import { Router } from 'express';
import { param, query } from 'express-validator';
import { validate } from '../middlewares/validate.js';
import { authenticate } from '../middlewares/auth.js';
import * as wishlistController from '../controllers/wishlist.controller.js';

const router = Router();

// Rutas protegidas
router.get('/', authenticate, wishlistController.getMyWishlist);

router.post('/:productId',
  authenticate,
  param('productId').isUUID().withMessage('ID de producto inválido'),
  validate,
  wishlistController.addToWishlist
);

router.delete('/:productId',
  authenticate,
  param('productId').isUUID().withMessage('ID de producto inválido'),
  validate,
  wishlistController.removeFromWishlist
);

router.get('/check/:productId',
  authenticate,
  param('productId').isUUID().withMessage('ID de producto inválido'),
  validate,
  wishlistController.checkInWishlist
);

router.delete('/', authenticate, wishlistController.clearWishlist);

export default router;
