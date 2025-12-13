import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database.js';
import { AppError } from '../middlewares/errorHandler.js';

// Generar código de confirmación
const generateConfirmationCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Crear reserva
export const createReservation = async (req, res, next) => {
  try {
    const {
      restaurant_id, customer_name, customer_email, customer_phone,
      reservation_date, reservation_time, number_of_people, special_requests
    } = req.body;

    // Verificar disponibilidad
    const existingReservations = await query(
      `SELECT COUNT(*) FROM reservations
       WHERE restaurant_id = $1
       AND reservation_date = $2
       AND reservation_time = $3
       AND status IN ('pending', 'confirmed')`,
      [restaurant_id, reservation_date, reservation_time]
    );

    // TODO: Validar contra capacidad configurada del restaurante

    const reservationId = uuidv4();
    const confirmationCode = generateConfirmationCode();

    const result = await query(
      `INSERT INTO reservations (
        id, restaurant_id, user_id, customer_name, customer_email, customer_phone,
        reservation_date, reservation_time, number_of_people, special_requests,
        confirmation_code, status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'pending', NOW(), NOW())
      RETURNING *`,
      [
        reservationId, restaurant_id, req.user?.id || null,
        customer_name, customer_email, customer_phone,
        reservation_date, reservation_time, number_of_people,
        special_requests, confirmationCode
      ]
    );

    // TODO: Enviar email de confirmación
    // TODO: Notificar al restaurante via WebSocket

    res.status(201).json({
      success: true,
      message: 'Reserva creada exitosamente',
      data: {
        ...result.rows[0],
        confirmationCode
      }
    });
  } catch (error) {
    next(error);
  }
};

// Verificar disponibilidad
export const checkAvailability = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;
    const { date, people } = req.query;

    // Obtener horarios del restaurante
    const restaurant = await query(
      'SELECT opening_hours FROM restaurants WHERE id = $1',
      [restaurantId]
    );

    if (restaurant.rows.length === 0) {
      throw new AppError('Restaurante no encontrado', 404);
    }

    // Obtener reservas existentes para ese día
    const existingReservations = await query(
      `SELECT reservation_time, SUM(number_of_people) as total_people
       FROM reservations
       WHERE restaurant_id = $1
       AND reservation_date = $2
       AND status IN ('pending', 'confirmed')
       GROUP BY reservation_time`,
      [restaurantId, date]
    );

    // TODO: Calcular horarios disponibles basado en capacidad
    // Por ahora, retornamos horarios fijos de ejemplo
    const availableSlots = [
      '12:00', '12:30', '13:00', '13:30', '14:00',
      '19:00', '19:30', '20:00', '20:30', '21:00'
    ];

    res.json({
      success: true,
      data: {
        date,
        availableSlots,
        existingReservations: existingReservations.rows
      }
    });
  } catch (error) {
    next(error);
  }
};

// Obtener reserva por código de confirmación
export const getReservationByCode = async (req, res, next) => {
  try {
    const { confirmationCode } = req.params;

    const result = await query(
      `SELECT r.*, rest.name as restaurant_name, rest.address as restaurant_address,
              rest.phone as restaurant_phone
       FROM reservations r
       JOIN restaurants rest ON r.restaurant_id = rest.id
       WHERE r.confirmation_code = $1`,
      [confirmationCode]
    );

    if (result.rows.length === 0) {
      throw new AppError('Reserva no encontrada', 404);
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Obtener mis reservas
export const getMyReservations = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await query(
      `SELECT r.*, rest.name as restaurant_name, rest.address as restaurant_address
       FROM reservations r
       JOIN restaurants rest ON r.restaurant_id = rest.id
       WHERE r.user_id = $1
       ORDER BY r.reservation_date DESC, r.reservation_time DESC`,
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

// Cancelar mi reserva
export const cancelMyReservation = async (req, res, next) => {
  try {
    const { reservationId } = req.params;
    const userId = req.user.id;

    const result = await query(
      `UPDATE reservations
       SET status = 'cancelled', updated_at = NOW()
       WHERE id = $1 AND (user_id = $2 OR $3 = 'admin')
       RETURNING *`,
      [reservationId, userId, req.user.role]
    );

    if (result.rows.length === 0) {
      throw new AppError('Reserva no encontrada o no tienes permisos', 404);
    }

    res.json({
      success: true,
      message: 'Reserva cancelada',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Obtener reservas del restaurante
export const getRestaurantReservations = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;
    const { status, startDate, endDate, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let queryText = `
      SELECT * FROM reservations
      WHERE restaurant_id = $1
    `;
    const params = [restaurantId];
    let paramCount = 2;

    if (status) {
      queryText += ` AND status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (startDate) {
      queryText += ` AND reservation_date >= $${paramCount}`;
      params.push(startDate);
      paramCount++;
    }

    if (endDate) {
      queryText += ` AND reservation_date <= $${paramCount}`;
      params.push(endDate);
      paramCount++;
    }

    queryText += ` ORDER BY reservation_date DESC, reservation_time DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
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

// Obtener reservas por fecha
export const getReservationsByDate = async (req, res, next) => {
  try {
    const { restaurantId, date } = req.params;

    const result = await query(
      `SELECT * FROM reservations
       WHERE restaurant_id = $1 AND reservation_date = $2
       ORDER BY reservation_time`,
      [restaurantId, date]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar estado de reserva
export const updateReservationStatus = async (req, res, next) => {
  try {
    const { reservationId } = req.params;
    const { status } = req.body;

    const result = await query(
      `UPDATE reservations
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [status, reservationId]
    );

    if (result.rows.length === 0) {
      throw new AppError('Reserva no encontrada', 404);
    }

    // TODO: Notificar al cliente sobre el cambio de estado

    res.json({
      success: true,
      message: `Reserva ${status === 'confirmed' ? 'confirmada' : status}`,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Obtener reserva por ID
export const getReservationById = async (req, res, next) => {
  try {
    const { reservationId } = req.params;

    const result = await query(
      `SELECT r.*, rest.name as restaurant_name
       FROM reservations r
       JOIN restaurants rest ON r.restaurant_id = rest.id
       WHERE r.id = $1`,
      [reservationId]
    );

    if (result.rows.length === 0) {
      throw new AppError('Reserva no encontrada', 404);
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Configurar capacidad y horarios de reservas
export const updateReservationConfig = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;
    const { reservation_config } = req.body;

    // Guardar configuración en el campo opening_hours o crear uno nuevo
    const result = await query(
      `UPDATE restaurants
       SET opening_hours = opening_hours || $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [JSON.stringify({ reservation_config }), restaurantId]
    );

    res.json({
      success: true,
      message: 'Configuración de reservas actualizada',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};
