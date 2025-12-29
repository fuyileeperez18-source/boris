import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database.js';
import { AppError } from '../middlewares/errorHandler.js';

// Crear reseña
export const createReview = async (req, res, next) => {
  try {
    const { product_id, order_id, rating, title, comment } = req.body;
    const userId = req.user.id;

    // Verificar que el producto existe
    const product = await query('SELECT id, name FROM products WHERE id = $1', [product_id]);
    if (product.rows.length === 0) {
      throw new AppError('Producto no encontrado', 404);
    }

    // Verificar si el usuario ya reseñó este producto
    const existingReview = await query(
      'SELECT id FROM reviews WHERE user_id = $1 AND product_id = $2',
      [userId, product_id]
    );

    if (existingReview.rows.length > 0) {
      throw new AppError('Ya has reseñado este producto', 409);
    }

    // Si se proporciona order_id, verificar que la orden pertenece al usuario
    if (order_id) {
      const order = await query(
        'SELECT id FROM orders WHERE id = $1 AND user_id = $2',
        [order_id, userId]
      );
      if (order.rows.length === 0) {
        throw new AppError('Orden no encontrada o no pertenece al usuario', 404);
      }
    }

    const reviewId = uuidv4();

    const result = await query(
      `INSERT INTO reviews (
        id, user_id, product_id, order_id, rating, title, comment,
        status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'approved', NOW(), NOW())
      RETURNING *`,
      [reviewId, userId, product_id, order_id || null, rating, title || null, comment || null]
    );

    // Actualizar rating promedio del producto
    await updateProductRating(product_id);

    res.status(201).json({
      success: true,
      message: 'Reseña creada exitosamente',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Obtener reseñas de un producto
export const getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10, sort = 'newest' } = req.query;
    const offset = (page - 1) * limit;

    let orderBy = 'r.created_at DESC';
    if (sort === 'oldest') orderBy = 'r.created_at ASC';
    if (sort === 'highest') orderBy = 'r.rating DESC';
    if (sort === 'lowest') orderBy = 'r.rating ASC';

    const result = await query(
      `SELECT r.*, u.name as user_name, u.avatar_url as user_avatar
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.product_id = $1 AND r.status = 'approved'
       ORDER BY ${orderBy}
       LIMIT $2 OFFSET $3`,
      [productId, parseInt(limit), parseInt(offset)]
    );

    const count = await query(
      'SELECT COUNT(*) FROM reviews WHERE product_id = $1 AND status = $2',
      [productId, 'approved']
    );

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(count.rows[0].count),
        pages: Math.ceil(count.rows[0].count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Obtener resumen de rating de un producto
export const getProductRatingSummary = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const result = await query(
      `SELECT
        COUNT(*) as total_reviews,
        COALESCE(AVG(rating), 0)::numeric(10,2) as average_rating,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as rating_5,
        COUNT(CASE WHEN rating = 4 THEN 1 END) as rating_4,
        COUNT(CASE WHEN rating = 3 THEN 1 END) as rating_3,
        COUNT(CASE WHEN rating = 2 THEN 1 END) as rating_2,
        COUNT(CASE WHEN rating = 1 THEN 1 END) as rating_1
       FROM reviews
       WHERE product_id = $1 AND status = 'approved'`,
      [productId]
    );

    const summary = result.rows[0];

    res.json({
      success: true,
      data: {
        total_reviews: parseInt(summary.total_reviews),
        average_rating: parseFloat(summary.average_rating),
        rating_distribution: {
          5: parseInt(summary.rating_5),
          4: parseInt(summary.rating_4),
          3: parseInt(summary.rating_3),
          2: parseInt(summary.rating_2),
          1: parseInt(summary.rating_1)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Obtener mis reseñas
export const getMyReviews = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await query(
      `SELECT r.*, p.name as product_name, p.image_url as product_image
       FROM reviews r
       JOIN products p ON r.product_id = p.id
       WHERE r.user_id = $1
       ORDER BY r.created_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar reseña
export const updateReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { rating, title, comment } = req.body;
    const userId = req.user.id;

    // Verificar que la reseña pertenece al usuario
    const review = await query(
      'SELECT * FROM reviews WHERE id = $1',
      [reviewId]
    );

    if (review.rows.length === 0) {
      throw new AppError('Reseña no encontrada', 404);
    }

    if (review.rows[0].user_id !== userId) {
      throw new AppError('No tienes permisos para editar esta reseña', 403);
    }

    const result = await query(
      `UPDATE reviews
       SET rating = COALESCE($1, rating),
           title = COALESCE($2, title),
           comment = COALESCE($3, comment),
           updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [rating, title, comment, reviewId]
    );

    // Actualizar rating promedio del producto
    await updateProductRating(review.rows[0].product_id);

    res.json({
      success: true,
      message: 'Reseña actualizada',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar reseña
export const deleteReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Verificar que la reseña existe
    const review = await query(
      'SELECT * FROM reviews WHERE id = $1',
      [reviewId]
    );

    if (review.rows.length === 0) {
      throw new AppError('Reseña no encontrada', 404);
    }

    // Verificar permisos (dueño de la reseña o admin)
    if (review.rows[0].user_id !== userId && userRole !== 'admin') {
      throw new AppError('No tienes permisos para eliminar esta reseña', 403);
    }

    const productId = review.rows[0].product_id;

    await query('DELETE FROM reviews WHERE id = $1', [reviewId]);

    // Actualizar rating promedio del producto
    await updateProductRating(productId);

    res.json({
      success: true,
      message: 'Reseña eliminada'
    });
  } catch (error) {
    next(error);
  }
};

// Obtener todas las reseñas (admin)
export const getAllReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, product_id, user_id, status } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = '1=1';
    const params = [];
    let paramCount = 1;

    if (product_id) {
      whereClause += ` AND r.product_id = $${paramCount}`;
      params.push(product_id);
      paramCount++;
    }

    if (user_id) {
      whereClause += ` AND r.user_id = $${paramCount}`;
      params.push(user_id);
      paramCount++;
    }

    if (status) {
      whereClause += ` AND r.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    params.push(parseInt(limit), parseInt(offset));

    const result = await query(
      `SELECT r.*, u.name as user_name, u.email as user_email,
              p.name as product_name, p.restaurant_id
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       JOIN products p ON r.product_id = p.id
       WHERE ${whereClause}
       ORDER BY r.created_at DESC
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      params
    );

    const count = await query(
      `SELECT COUNT(*) FROM reviews r WHERE ${whereClause}`,
      params.slice(0, -2)
    );

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(count.rows[0].count),
        pages: Math.ceil(count.rows[0].count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Moderar reseña (aprobar/rechazar)
export const moderateReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { status } = req.body;
    const userRole = req.user.role;

    // Verificar que la reseña existe
    const review = await query(
      'SELECT * FROM reviews WHERE id = $1',
      [reviewId]
    );

    if (review.rows.length === 0) {
      throw new AppError('Reseña no encontrada', 404);
    }

    // Si es restaurant, solo puede moderar reseñas de sus productos
    if (userRole === 'restaurant') {
      const product = await query(
        'SELECT restaurant_id FROM products WHERE id = $1',
        [review.rows[0].product_id]
      );
      const restaurant = await query(
        'SELECT user_id FROM restaurants WHERE id = $1',
        [product.rows[0].restaurant_id]
      );

      if (restaurant.rows[0].user_id !== req.user.id) {
        throw new AppError('No tienes permisos para moderar esta reseña', 403);
      }
    }

    const result = await query(
      `UPDATE reviews
       SET status = $1, moderated_at = NOW(), moderated_by = $2, updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [status, req.user.id, reviewId]
    );

    // Actualizar rating promedio del producto
    await updateProductRating(review.rows[0].product_id);

    res.json({
      success: true,
      message: `Reseña ${status}`,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Helper para actualizar rating promedio del producto
async function updateProductRating(productId) {
  await query(
    `UPDATE products
     SET average_rating = (
       SELECT COALESCE(AVG(rating), 0)::numeric(10,2)
       FROM reviews
       WHERE product_id = $1 AND status = 'approved'
     ),
     review_count = (
       SELECT COUNT(*)
       FROM reviews
       WHERE product_id = $1 AND status = 'approved'
     ),
     updated_at = NOW()
     WHERE id = $1`,
    [productId]
  );
}
