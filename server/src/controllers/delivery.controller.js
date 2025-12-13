import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { query } from '../config/database.js';
import { AppError } from '../middlewares/errorHandler.js';

// Registrar domiciliario
export const registerDeliveryPerson = async (req, res, next) => {
  try {
    const { name, email, phone, password, vehicle_type, vehicle_plate } = req.body;

    // Verificar si el email ya existe
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      throw new AppError('El email ya está registrado', 409);
    }

    const userId = uuidv4();
    const passwordHash = await bcrypt.hash(password, 12);

    // Crear usuario con rol delivery pero pendiente de aprobación
    await query(
      `INSERT INTO users (id, email, password_hash, name, phone, role, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, 'delivery', false, NOW(), NOW())`,
      [userId, email, passwordHash, name, phone]
    );

    // Crear perfil de domiciliario
    await query(
      `INSERT INTO delivery_persons (id, user_id, vehicle_type, vehicle_plate, is_approved, is_available, created_at, updated_at)
       VALUES ($1, $2, $3, $4, false, false, NOW(), NOW())`,
      [uuidv4(), userId, vehicle_type, vehicle_plate]
    );

    res.status(201).json({
      success: true,
      message: 'Solicitud enviada. Recibirás una notificación cuando sea aprobada.'
    });
  } catch (error) {
    next(error);
  }
};

// Obtener perfil de domiciliario
export const getDeliveryProfile = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT u.id, u.email, u.name, u.phone, d.*
       FROM users u
       JOIN delivery_persons d ON u.id = d.user_id
       WHERE u.id = $1`,
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

// Actualizar ubicación
export const updateLocation = async (req, res, next) => {
  try {
    const { latitude, longitude } = req.body;

    await query(
      `UPDATE delivery_persons
       SET current_latitude = $1, current_longitude = $2, last_location_update = NOW()
       WHERE user_id = $3`,
      [latitude, longitude, req.user.id]
    );

    // Emitir ubicación via WebSocket para tracking en tiempo real
    const io = req.app.get('io');

    // Obtener pedido activo del domiciliario
    const activeOrder = await query(
      `SELECT o.id, o.restaurant_id
       FROM orders o
       WHERE o.delivery_person_id = $1
       AND o.order_status = 'on_the_way'`,
      [req.user.id]
    );

    if (activeOrder.rows.length > 0) {
      const order = activeOrder.rows[0];
      io.to(`order-${order.id}`).emit('delivery-location', {
        orderId: order.id,
        latitude,
        longitude,
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      message: 'Ubicación actualizada'
    });
  } catch (error) {
    next(error);
  }
};

// Toggle disponibilidad
export const toggleAvailability = async (req, res, next) => {
  try {
    const result = await query(
      `UPDATE delivery_persons
       SET is_available = NOT is_available, updated_at = NOW()
       WHERE user_id = $1
       RETURNING is_available`,
      [req.user.id]
    );

    res.json({
      success: true,
      message: result.rows[0].is_available ? 'Ahora estás disponible' : 'Ya no estás disponible',
      data: { isAvailable: result.rows[0].is_available }
    });
  } catch (error) {
    next(error);
  }
};

// Obtener pedidos asignados
export const getAssignedOrders = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT o.*, r.name as restaurant_name, r.address as restaurant_address,
              r.phone as restaurant_phone
       FROM orders o
       JOIN restaurants r ON o.restaurant_id = r.id
       WHERE o.delivery_person_id = $1
       AND o.order_status IN ('ready', 'on_the_way')
       ORDER BY o.created_at ASC`,
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

// Obtener pedido actual
export const getCurrentOrder = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT o.*, r.name as restaurant_name, r.address as restaurant_address,
              r.phone as restaurant_phone, r.latitude as restaurant_lat, r.longitude as restaurant_lng
       FROM orders o
       JOIN restaurants r ON o.restaurant_id = r.id
       WHERE o.delivery_person_id = $1
       AND o.order_status IN ('ready', 'on_the_way')
       ORDER BY o.created_at ASC
       LIMIT 1`,
      [req.user.id]
    );

    res.json({
      success: true,
      data: result.rows[0] || null
    });
  } catch (error) {
    next(error);
  }
};

// Aceptar pedido
export const acceptOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const result = await query(
      `UPDATE orders
       SET delivery_person_id = $1, updated_at = NOW()
       WHERE id = $2 AND delivery_person_id IS NULL AND order_status = 'ready'
       RETURNING *`,
      [req.user.id, orderId]
    );

    if (result.rows.length === 0) {
      throw new AppError('El pedido ya fue tomado o no está disponible', 400);
    }

    res.json({
      success: true,
      message: 'Pedido aceptado',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Rechazar pedido
export const rejectOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    // Liberar el pedido para que otro domiciliario lo tome
    await query(
      `UPDATE orders
       SET delivery_person_id = NULL, updated_at = NOW()
       WHERE id = $1 AND delivery_person_id = $2`,
      [orderId, req.user.id]
    );

    // TODO: Registrar rechazo para métricas

    res.json({
      success: true,
      message: 'Pedido rechazado'
    });
  } catch (error) {
    next(error);
  }
};

// Marcar como recogido
export const markAsPickedUp = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const result = await query(
      `UPDATE orders
       SET order_status = 'on_the_way', updated_at = NOW()
       WHERE id = $1 AND delivery_person_id = $2 AND order_status = 'ready'
       RETURNING *`,
      [orderId, req.user.id]
    );

    if (result.rows.length === 0) {
      throw new AppError('No se puede actualizar el pedido', 400);
    }

    // Notificar al cliente
    const io = req.app.get('io');
    io.to(`order-${orderId}`).emit('order-status-update', {
      orderId,
      status: 'on_the_way'
    });

    res.json({
      success: true,
      message: 'Pedido en camino',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Marcar como entregado
export const markAsDelivered = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const result = await query(
      `UPDATE orders
       SET order_status = 'delivered', delivered_at = NOW(), updated_at = NOW()
       WHERE id = $1 AND delivery_person_id = $2 AND order_status = 'on_the_way'
       RETURNING *`,
      [orderId, req.user.id]
    );

    if (result.rows.length === 0) {
      throw new AppError('No se puede actualizar el pedido', 400);
    }

    // Registrar entrega
    await query(
      `INSERT INTO deliveries (id, order_id, delivery_person_id, delivery_time, delivery_fee_for_driver, status, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), $4, 'delivered', NOW(), NOW())`,
      [uuidv4(), orderId, req.user.id, result.rows[0].delivery_fee || 4000]
    );

    // Notificar al cliente
    const io = req.app.get('io');
    io.to(`order-${orderId}`).emit('order-status-update', {
      orderId,
      status: 'delivered'
    });

    res.json({
      success: true,
      message: 'Pedido entregado',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Historial de entregas
export const getDeliveryHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const result = await query(
      `SELECT d.*, o.tracking_number, o.total, r.name as restaurant_name
       FROM deliveries d
       JOIN orders o ON d.order_id = o.id
       JOIN restaurants r ON o.restaurant_id = r.id
       WHERE d.delivery_person_id = $1
       ORDER BY d.created_at DESC
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

// Obtener ganancias
export const getEarnings = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const result = await query(
      `SELECT
        COUNT(*) as total_deliveries,
        SUM(delivery_fee_for_driver) as total_earnings,
        AVG(delivery_fee_for_driver) as avg_per_delivery
       FROM deliveries
       WHERE delivery_person_id = $1
       AND status = 'delivered'
       AND created_at >= COALESCE($2, created_at)
       AND created_at <= COALESCE($3, created_at)`,
      [req.user.id, startDate || null, endDate || null]
    );

    // Ganancias por día de la semana actual
    const weeklyEarnings = await query(
      `SELECT
        DATE(created_at) as date,
        COUNT(*) as deliveries,
        SUM(delivery_fee_for_driver) as earnings
       FROM deliveries
       WHERE delivery_person_id = $1
       AND status = 'delivered'
       AND created_at >= NOW() - INTERVAL '7 days'
       GROUP BY DATE(created_at)
       ORDER BY date`,
      [req.user.id]
    );

    res.json({
      success: true,
      data: {
        summary: result.rows[0],
        weekly: weeklyEarnings.rows
      }
    });
  } catch (error) {
    next(error);
  }
};

// ===== ADMIN =====

// Listar todos los domiciliarios
export const getAllDeliveryPersons = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let queryText = `
      SELECT u.id, u.email, u.name, u.phone, u.is_active, d.*
      FROM users u
      JOIN delivery_persons d ON u.id = d.user_id
      WHERE u.role = 'delivery'
    `;
    const params = [];
    let paramCount = 1;

    if (status === 'pending') {
      queryText += ' AND d.is_approved = false';
    } else if (status === 'approved') {
      queryText += ' AND d.is_approved = true';
    } else if (status === 'available') {
      queryText += ' AND d.is_approved = true AND d.is_available = true';
    }

    queryText += ` ORDER BY d.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
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

// Aprobar domiciliario
export const approveDeliveryPerson = async (req, res, next) => {
  try {
    const { deliveryPersonId } = req.params;
    const { approved } = req.body;

    // Actualizar aprobación
    await query(
      `UPDATE delivery_persons SET is_approved = $1, updated_at = NOW() WHERE id = $2`,
      [approved, deliveryPersonId]
    );

    // Activar usuario si se aprueba
    const dp = await query('SELECT user_id FROM delivery_persons WHERE id = $1', [deliveryPersonId]);

    if (dp.rows.length > 0 && approved) {
      await query(
        'UPDATE users SET is_active = true, updated_at = NOW() WHERE id = $1',
        [dp.rows[0].user_id]
      );
    }

    res.json({
      success: true,
      message: approved ? 'Domiciliario aprobado' : 'Domiciliario rechazado'
    });
  } catch (error) {
    next(error);
  }
};

// Desactivar domiciliario
export const deactivateDeliveryPerson = async (req, res, next) => {
  try {
    const { deliveryPersonId } = req.params;

    const dp = await query('SELECT user_id FROM delivery_persons WHERE id = $1', [deliveryPersonId]);

    if (dp.rows.length > 0) {
      await query(
        'UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1',
        [dp.rows[0].user_id]
      );
    }

    await query(
      `UPDATE delivery_persons SET is_available = false, updated_at = NOW() WHERE id = $1`,
      [deliveryPersonId]
    );

    res.json({
      success: true,
      message: 'Domiciliario desactivado'
    });
  } catch (error) {
    next(error);
  }
};

// Asignar pedido
export const assignOrder = async (req, res, next) => {
  try {
    const { order_id, delivery_person_id } = req.body;

    // Obtener user_id del domiciliario
    const dp = await query(
      'SELECT user_id FROM delivery_persons WHERE id = $1 AND is_available = true',
      [delivery_person_id]
    );

    if (dp.rows.length === 0) {
      throw new AppError('Domiciliario no disponible', 400);
    }

    const result = await query(
      `UPDATE orders
       SET delivery_person_id = $1, delivery_method = 'platform_delivery', updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [dp.rows[0].user_id, order_id]
    );

    // TODO: Notificar al domiciliario

    res.json({
      success: true,
      message: 'Pedido asignado',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Ver domiciliarios disponibles
export const getAvailableDeliveryPersons = async (req, res, next) => {
  try {
    const { latitude, longitude } = req.query;

    let queryText = `
      SELECT u.id, u.name, u.phone, d.*
      FROM users u
      JOIN delivery_persons d ON u.id = d.user_id
      WHERE d.is_approved = true AND d.is_available = true
    `;

    // TODO: Ordenar por distancia si se proporciona ubicación

    const result = await query(queryText);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

// Estadísticas de delivery
export const getDeliveryStats = async (req, res, next) => {
  try {
    const stats = await query(
      `SELECT
        (SELECT COUNT(*) FROM delivery_persons) as total_delivery_persons,
        (SELECT COUNT(*) FROM delivery_persons WHERE is_approved = true) as approved,
        (SELECT COUNT(*) FROM delivery_persons WHERE is_available = true) as currently_available,
        (SELECT COUNT(*) FROM deliveries WHERE status = 'delivered' AND created_at >= NOW() - INTERVAL '24 hours') as deliveries_today,
        (SELECT SUM(delivery_fee_for_driver) FROM deliveries WHERE status = 'delivered' AND created_at >= NOW() - INTERVAL '24 hours') as earnings_today`
    );

    res.json({
      success: true,
      data: stats.rows[0]
    });
  } catch (error) {
    next(error);
  }
};
