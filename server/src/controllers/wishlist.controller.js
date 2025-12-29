import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database.js';
import { AppError } from '../middlewares/errorHandler.js';

// Obtener wishlist del usuario
export const getMyWishlist = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await query(
      `SELECT p.*, r.name as restaurant_name, r.slug as restaurant_slug,
              w.id as wishlist_id, w.created_at as added_at
       FROM wishlist w
       JOIN products p ON w.product_id = p.id
       JOIN restaurants r ON p.restaurant_id = r.id
       WHERE w.user_id = $1
       ORDER BY w.created_at DESC`,
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

// Agregar a wishlist
export const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    // Verificar que el producto existe
    const product = await query('SELECT id, name FROM products WHERE id = $1 AND is_available = true', [productId]);
    if (product.rows.length === 0) {
      throw new AppError('Producto no encontrado', 404);
    }

    // Verificar si ya está en wishlist
    const existing = await query(
      'SELECT id FROM wishlist WHERE user_id = $1 AND product_id = $2',
      [userId, productId]
    );

    if (existing.rows.length > 0) {
      throw new AppError('El producto ya está en tu wishlist', 409);
    }

    const wishlistId = uuidv4();

    await query(
      'INSERT INTO wishlist (id, user_id, product_id, created_at) VALUES ($1, $2, $3, NOW())',
      [wishlistId, userId, productId]
    );

    res.status(201).json({
      success: true,
      message: 'Producto agregado a wishlist'
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar de wishlist
export const removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    const result = await query(
      'DELETE FROM wishlist WHERE user_id = $1 AND product_id = $2 RETURNING id',
      [userId, productId]
    );

    if (result.rows.length === 0) {
      throw new AppError('Producto no encontrado en wishlist', 404);
    }

    res.json({
      success: true,
      message: 'Producto eliminado de wishlist'
    });
  } catch (error) {
    next(error);
  }
};

// Verificar si está en wishlist
export const checkInWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    const result = await query(
      'SELECT id FROM wishlist WHERE user_id = $1 AND product_id = $2',
      [userId, productId]
    );

    res.json({
      success: true,
      data: {
        in_wishlist: result.rows.length > 0
      }
    });
  } catch (error) {
    next(error);
  }
};

// Limpiar wishlist
export const clearWishlist = async (req, res, next) => {
  try {
    const userId = req.user.id;

    await query('DELETE FROM wishlist WHERE user_id = $1', [userId]);

    res.json({
      success: true,
      message: 'Wishlist limpiada'
    });
  } catch (error) {
    next(error);
  }
};
