import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler.js';
import { query } from '../config/database.js';

// Middleware para verificar JWT
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No se proporcionó token de autenticación', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verificar que el usuario existe
    const result = await query(
      'SELECT id, email, name, role, restaurant_id FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      throw new AppError('Usuario no encontrado', 401);
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(error);
    }
    next(error);
  }
};

// Middleware para verificar roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('No autenticado', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('No tienes permisos para realizar esta acción', 403));
    }

    next();
  };
};

// Middleware para verificar que el usuario es dueño del restaurante
export const isRestaurantOwner = async (req, res, next) => {
  try {
    const restaurantId = req.params.restaurantId || req.body.restaurant_id;

    if (!restaurantId) {
      return next(new AppError('ID de restaurante requerido', 400));
    }

    const result = await query(
      'SELECT user_id FROM restaurants WHERE id = $1',
      [restaurantId]
    );

    if (result.rows.length === 0) {
      return next(new AppError('Restaurante no encontrado', 404));
    }

    // Admin tiene acceso a todos los restaurantes
    if (req.user.role === 'admin') {
      return next();
    }

    if (result.rows[0].user_id !== req.user.id) {
      return next(new AppError('No tienes permisos sobre este restaurante', 403));
    }

    next();
  } catch (error) {
    next(error);
  }
};
