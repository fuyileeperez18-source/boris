import { v2 as cloudinary } from 'cloudinary';
import { query } from '../config/database.js';
import { AppError } from '../middlewares/errorHandler.js';

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Subir imagen individual
export const uploadImage = async (req, res, next) => {
  try {
    if (!req.files || !req.files.image) {
      throw new AppError('No se proporcionó ninguna imagen', 400);
    }

    const file = req.files.image;
    const { folder = 'boris' } = req.body;

    // Subir a Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `boris/${folder}`,
          resource_type: 'image',
          transformation: [
            { width: 1200, height: 1200, crop: 'limit', quality: 'auto:good' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(file.data);
    });

    res.json({
      success: true,
      data: {
        url: result.secure_url,
        public_id: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format
      }
    });
  } catch (error) {
    next(error);
  }
};

// Subir múltiples imágenes
export const uploadMultipleImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      throw new AppError('No se proporcionó ninguna imagen', 400);
    }

    const { folder = 'boris' } = req.body;
    const uploadPromises = Array.from(req.files).map(file => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `boris/${folder}`,
            resource_type: 'image',
            transformation: [
              { width: 1200, height: 1200, crop: 'limit', quality: 'auto:good' }
            ]
          },
          (error, result) => {
            if (error) reject(error);
            else resolve({
              url: result.secure_url,
              public_id: result.public_id,
              width: result.width,
              height: result.height,
              format: result.format
            });
          }
        );

        uploadStream.end(file.data);
      });
    });

    const results = await Promise.all(uploadPromises);

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    next(error);
  }
};

// Subir imagen de producto
export const uploadProductImage = async (req, res, next) => {
  try {
    const { productId } = req.params;

    if (!req.files || !req.files.image) {
      throw new AppError('No se proporcionó ninguna imagen', 400);
    }

    // Verificar que el producto existe
    const product = await query('SELECT id, restaurant_id FROM products WHERE id = $1', [productId]);
    if (product.rows.length === 0) {
      throw new AppError('Producto no encontrado', 404);
    }

    // Verificar permisos
    if (req.user.role !== 'admin' && product.rows[0].restaurant_id !== req.user.restaurant_id) {
      throw new AppError('No tienes permisos sobre este producto', 403);
    }

    const file = req.files.image;

    // Subir a Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `boris/products`,
          resource_type: 'image',
          transformation: [
            { width: 800, height: 800, crop: 'fill', gravity: 'center', quality: 'auto:good' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(file.data);
    });

    // Guardar referencia en la base de datos
    const imageId = result.public_id;
    await query(
      `INSERT INTO product_images (id, product_id, url, public_id, display_order, created_at)
       VALUES ($1, $2, $3, $4, (
         SELECT COALESCE(MAX(display_order), 0) + 1 FROM product_images WHERE product_id = $2
       ), NOW())`,
      [imageId, productId, result.secure_url, result.public_id]
    );

    // Actualizar image_url principal del producto si es la primera imagen
    const imageCount = await query(
      'SELECT COUNT(*) FROM product_images WHERE product_id = $1',
      [productId]
    );

    if (parseInt(imageCount.rows[0].count) === 1) {
      await query(
        'UPDATE products SET image_url = $1, updated_at = NOW() WHERE id = $2',
        [result.secure_url, productId]
      );
    }

    res.json({
      success: true,
      message: 'Imagen subida exitosamente',
      data: {
        id: imageId,
        url: result.secure_url,
        public_id: result.public_id
      }
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar imagen
export const deleteImage = async (req, res, next) => {
  try {
    const { publicId } = req.params;

    // Verificar que la imagen existe
    const image = await query(
      'SELECT pi.*, p.restaurant_id FROM product_images pi JOIN products p ON pi.product_id = p.id WHERE pi.public_id = $1',
      [publicId]
    );

    if (image.rows.length === 0) {
      throw new AppError('Imagen no encontrada', 404);
    }

    // Verificar permisos
    if (req.user.role !== 'admin' && image.rows[0].restaurant_id !== req.user.restaurant_id) {
      throw new AppError('No tienes permisos para eliminar esta imagen', 403);
    }

    // Eliminar de Cloudinary
    await cloudinary.uploader.destroy(publicId);

    // Eliminar de la base de datos
    await query('DELETE FROM product_images WHERE public_id = $1', [publicId]);

    res.json({
      success: true,
      message: 'Imagen eliminada'
    });
  } catch (error) {
    next(error);
  }
};
