import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import * as uploadController from '../controllers/upload.controller.js';

const router = Router();

// Rutas protegidas (admin/restaurant)
router.post('/image',
  authenticate,
  authorize('admin', 'restaurant'),
  uploadController.uploadImage
);

router.post('/images',
  authenticate,
  authorize('admin', 'restaurant'),
  uploadController.uploadMultipleImages
);

router.post('/product/:productId',
  authenticate,
  authorize('admin', 'restaurant'),
  uploadController.uploadProductImage
);

router.delete('/image/:publicId',
  authenticate,
  authorize('admin', 'restaurant'),
  uploadController.deleteImage
);

export default router;
