import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database.js';
import { AppError } from '../middlewares/errorHandler.js';

// Obtener notificaciones del usuario
export const getMyNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, unread_only } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'user_id = $1';
    if (unread_only === 'true') {
      whereClause += ' AND is_read = false';
    }

    const result = await query(
      `SELECT * FROM user_notifications
       WHERE ${whereClause}
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, parseInt(limit), parseInt(offset)]
    );

    const count = await query(
      `SELECT COUNT(*) FROM user_notifications WHERE ${whereClause}`,
      [userId]
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

// Obtener contador de no leídas
export const getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await query(
      'SELECT COUNT(*) as count FROM user_notifications WHERE user_id = $1 AND is_read = false',
      [userId]
    );

    res.json({
      success: true,
      data: {
        unread_count: parseInt(result.rows[0].count)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Marcar como leída
export const markAsRead = async (req, res, next) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const result = await query(
      `UPDATE user_notifications
       SET is_read = true, read_at = NOW()
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [notificationId, userId]
    );

    if (result.rows.length === 0) {
      throw new AppError('Notificación no encontrada', 404);
    }

    res.json({
      success: true,
      message: 'Notificación marcada como leída'
    });
  } catch (error) {
    next(error);
  }
};

// Marcar todas como leídas
export const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;

    await query(
      `UPDATE user_notifications
       SET is_read = true, read_at = NOW()
       WHERE user_id = $1 AND is_read = false`,
      [userId]
    );

    res.json({
      success: true,
      message: 'Todas las notificaciones marcadas como leídas'
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar notificación
export const deleteNotification = async (req, res, next) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const result = await query(
      'DELETE FROM user_notifications WHERE id = $1 AND user_id = $2 RETURNING id',
      [notificationId, userId]
    );

    if (result.rows.length === 0) {
      throw new AppError('Notificación no encontrada', 404);
    }

    res.json({
      success: true,
      message: 'Notificación eliminada'
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar todas las notificaciones
export const clearAllNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;

    await query(
      'DELETE FROM user_notifications WHERE user_id = $1',
      [userId]
    );

    res.json({
      success: true,
      message: 'Todas las notificaciones eliminadas'
    });
  } catch (error) {
    next(error);
  }
};

// Crear notificación (uso interno)
export const createNotification = async (req, res, next) => {
  try {
    const { user_id, type, title, message, link, metadata } = req.body;

    const notificationId = uuidv4();

    const result = await query(
      `INSERT INTO user_notifications (
        id, user_id, type, title, message, link, metadata, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING *`,
      [notificationId, user_id, type, title, message, link || null, metadata ? JSON.stringify(metadata) : null]
    );

    // Emitir notificación en tiempo real si el usuario está conectado
    const io = req.app.get('io');
    io.to(`user-${user_id}`).emit('new-notification', result.rows[0]);

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};
