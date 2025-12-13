import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database.js';
import { AppError } from '../middlewares/errorHandler.js';

// Obtener perfil
export const getProfile = async (req, res, next) => {
  try {
    const result = await query(
      'SELECT id, email, name, phone, role, default_address, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar perfil
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, default_address } = req.body;

    const result = await query(
      `UPDATE users
       SET name = COALESCE($1, name),
           phone = COALESCE($2, phone),
           default_address = COALESCE($3, default_address),
           updated_at = NOW()
       WHERE id = $4
       RETURNING id, email, name, phone, role, default_address`,
      [name, phone, default_address, req.user.id]
    );

    res.json({
      success: true,
      message: 'Perfil actualizado',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Obtener direcciones guardadas
export const getAddresses = async (req, res, next) => {
  try {
    const result = await query(
      'SELECT * FROM user_addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC',
      [req.user.id]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

// Agregar dirección
export const addAddress = async (req, res, next) => {
  try {
    const { label, address, latitude, longitude, instructions, is_default } = req.body;

    // Si es default, quitar default de las demás
    if (is_default) {
      await query(
        'UPDATE user_addresses SET is_default = false WHERE user_id = $1',
        [req.user.id]
      );
    }

    const result = await query(
      `INSERT INTO user_addresses (id, user_id, label, address, latitude, longitude, instructions, is_default, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
       RETURNING *`,
      [uuidv4(), req.user.id, label, address, latitude, longitude, instructions, is_default || false]
    );

    res.status(201).json({
      success: true,
      message: 'Dirección agregada',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar dirección
export const deleteAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;

    await query(
      'DELETE FROM user_addresses WHERE id = $1 AND user_id = $2',
      [addressId, req.user.id]
    );

    res.json({
      success: true,
      message: 'Dirección eliminada'
    });
  } catch (error) {
    next(error);
  }
};

// Historial de pedidos
export const getOrderHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const result = await query(
      `SELECT o.*, r.name as restaurant_name, r.logo_url
       FROM orders o
       JOIN restaurants r ON o.restaurant_id = r.id
       WHERE o.user_id = $1
       ORDER BY o.created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

// Historial de reservas
export const getReservationHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const result = await query(
      `SELECT r.*, rest.name as restaurant_name, rest.address as restaurant_address
       FROM reservations r
       JOIN restaurants rest ON r.restaurant_id = rest.id
       WHERE r.user_id = $1
       ORDER BY r.reservation_date DESC
       LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

// Restaurantes favoritos
export const getFavorites = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT r.*
       FROM user_favorites uf
       JOIN restaurants r ON uf.restaurant_id = r.id
       WHERE uf.user_id = $1 AND r.is_active = true
       ORDER BY uf.created_at DESC`,
      [req.user.id]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

// Agregar favorito
export const addFavorite = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;

    await query(
      `INSERT INTO user_favorites (id, user_id, restaurant_id, created_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (user_id, restaurant_id) DO NOTHING`,
      [uuidv4(), req.user.id, restaurantId]
    );

    res.json({
      success: true,
      message: 'Restaurante agregado a favoritos'
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar favorito
export const removeFavorite = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;

    await query(
      'DELETE FROM user_favorites WHERE user_id = $1 AND restaurant_id = $2',
      [req.user.id, restaurantId]
    );

    res.json({
      success: true,
      message: 'Restaurante eliminado de favoritos'
    });
  } catch (error) {
    next(error);
  }
};

// ===== ADMIN =====

// Listar todos los usuarios
export const getAllUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let queryText = 'SELECT id, email, name, phone, role, created_at FROM users WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (role) {
      queryText += ` AND role = $${paramCount}`;
      params.push(role);
      paramCount++;
    }

    if (search) {
      queryText += ` AND (name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    queryText += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await query(queryText, params);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

// Obtener usuario por ID
export const getUserById = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const result = await query(
      'SELECT id, email, name, phone, role, created_at, updated_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      throw new AppError('Usuario no encontrado', 404);
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar rol de usuario
export const updateUserRole = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    const validRoles = ['customer', 'restaurant', 'delivery', 'admin'];
    if (!validRoles.includes(role)) {
      throw new AppError('Rol inválido', 400);
    }

    const result = await query(
      'UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2 RETURNING id, email, name, role',
      [role, userId]
    );

    if (result.rows.length === 0) {
      throw new AppError('Usuario no encontrado', 404);
    }

    res.json({
      success: true,
      message: 'Rol actualizado',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Desactivar usuario
export const deactivateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    await query(
      'UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1',
      [userId]
    );

    res.json({
      success: true,
      message: 'Usuario desactivado'
    });
  } catch (error) {
    next(error);
  }
};

// Estadísticas de usuarios
export const getUserStats = async (req, res, next) => {
  try {
    const stats = await query(
      `SELECT
        COUNT(*) as total_users,
        COUNT(*) FILTER (WHERE role = 'customer') as customers,
        COUNT(*) FILTER (WHERE role = 'restaurant') as restaurant_owners,
        COUNT(*) FILTER (WHERE role = 'delivery') as delivery_persons,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as new_last_30_days,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as new_last_7_days
       FROM users`
    );

    res.json({
      success: true,
      data: stats.rows[0]
    });
  } catch (error) {
    next(error);
  }
};
