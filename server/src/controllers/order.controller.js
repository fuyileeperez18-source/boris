import { v4 as uuidv4 } from 'uuid';
import { query, getClient } from '../config/database.js';
import { AppError } from '../middlewares/errorHandler.js';

// Generar número de seguimiento
const generateTrackingNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
};

// Crear pedido
export const createOrder = async (req, res, next) => {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    const {
      restaurant_id, customer_name, customer_phone, customer_email,
      delivery_address, delivery_latitude, delivery_longitude,
      delivery_instructions, order_type, delivery_method, items,
      payment_method
    } = req.body;

    // Obtener información del restaurante y comisión
    const restaurantResult = await client.query(
      'SELECT commission_rate, has_own_delivery FROM restaurants WHERE id = $1',
      [restaurant_id]
    );

    if (restaurantResult.rows.length === 0) {
      throw new AppError('Restaurante no encontrado', 404);
    }

    const restaurant = restaurantResult.rows[0];

    // Calcular subtotal obteniendo precios actuales
    let subtotal = 0;
    const itemsWithPrices = [];

    for (const item of items) {
      const productResult = await client.query(
        'SELECT id, name, price FROM products WHERE id = $1 AND is_available = true',
        [item.product_id]
      );

      if (productResult.rows.length === 0) {
        throw new AppError(`Producto no disponible: ${item.product_id}`, 400);
      }

      const product = productResult.rows[0];
      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      itemsWithPrices.push({
        product_id: product.id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        total: itemTotal,
        notes: item.notes || ''
      });
    }

    // Calcular costo de envío
    let deliveryFee = 0;
    if (order_type === 'delivery') {
      // TODO: Calcular según distancia y zona
      deliveryFee = 4000; // Valor fijo por ahora
    }

    // Calcular comisión de la plataforma
    const commissionRate = restaurant.commission_rate / 100;
    const platformCommission = Math.round(subtotal * commissionRate);

    const total = subtotal + deliveryFee;

    const orderId = uuidv4();
    const trackingNumber = generateTrackingNumber();

    const result = await client.query(
      `INSERT INTO orders (
        id, restaurant_id, user_id, customer_name, customer_phone, customer_email,
        delivery_address, delivery_latitude, delivery_longitude, delivery_instructions,
        order_type, delivery_method, items, subtotal, delivery_fee, platform_commission,
        total, payment_method, payment_status, order_status, tracking_number,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, 'pending', 'received', $19, NOW(), NOW())
      RETURNING *`,
      [
        orderId, restaurant_id, req.user?.id || null,
        customer_name, customer_phone, customer_email,
        delivery_address, delivery_latitude, delivery_longitude,
        delivery_instructions, order_type, delivery_method,
        JSON.stringify(itemsWithPrices), subtotal, deliveryFee,
        platformCommission, total, payment_method, trackingNumber
      ]
    );

    await client.query('COMMIT');

    // Notificar al restaurante via WebSocket
    const io = req.app.get('io');
    io.to(`restaurant-${restaurant_id}`).emit('new-order', result.rows[0]);

    res.status(201).json({
      success: true,
      message: 'Pedido creado exitosamente',
      data: result.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

// Rastrear pedido
export const trackOrder = async (req, res, next) => {
  try {
    const { trackingNumber } = req.params;

    const result = await query(
      `SELECT o.*, r.name as restaurant_name, r.phone as restaurant_phone,
              r.address as restaurant_address
       FROM orders o
       JOIN restaurants r ON o.restaurant_id = r.id
       WHERE o.tracking_number = $1`,
      [trackingNumber]
    );

    if (result.rows.length === 0) {
      throw new AppError('Pedido no encontrado', 404);
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Calcular costo de envío
export const calculateDeliveryFee = async (req, res, next) => {
  try {
    const { restaurant_id, delivery_latitude, delivery_longitude } = req.body;

    // Obtener ubicación del restaurante
    const restaurant = await query(
      'SELECT latitude, longitude FROM restaurants WHERE id = $1',
      [restaurant_id]
    );

    if (restaurant.rows.length === 0) {
      throw new AppError('Restaurante no encontrado', 404);
    }

    // TODO: Calcular distancia real usando API de Google Maps o similar
    // Por ahora, valor fijo
    const deliveryFee = 4000;

    res.json({
      success: true,
      data: {
        deliveryFee,
        estimatedTime: '30-45 min'
      }
    });
  } catch (error) {
    next(error);
  }
};

// Obtener mis pedidos
export const getMyOrders = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let queryText = `
      SELECT o.*, r.name as restaurant_name, r.logo_url as restaurant_logo
       FROM orders o
       JOIN restaurants r ON o.restaurant_id = r.id
       WHERE o.user_id = $1
    `;
    const params = [userId];

    if (status) {
      queryText += ' AND o.order_status = $2';
      params.push(status);
    }

    queryText += ` ORDER BY o.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
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

// Obtener pedido por ID
export const getOrderById = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const result = await query(
      `SELECT o.*, r.name as restaurant_name, r.phone as restaurant_phone,
              r.address as restaurant_address
       FROM orders o
       JOIN restaurants r ON o.restaurant_id = r.id
       WHERE o.id = $1`,
      [orderId]
    );

    if (result.rows.length === 0) {
      throw new AppError('Pedido no encontrado', 404);
    }

    // Verificar permisos
    const order = result.rows[0];
    if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
      throw new AppError('No tienes permisos para ver este pedido', 403);
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// Cancelar pedido
export const cancelOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    // Solo se puede cancelar si está en estado 'received'
    const result = await query(
      `UPDATE orders
       SET order_status = 'cancelled', updated_at = NOW()
       WHERE id = $1 AND order_status = 'received'
       AND (user_id = $2 OR $3 = 'admin')
       RETURNING *`,
      [orderId, req.user.id, req.user.role]
    );

    if (result.rows.length === 0) {
      throw new AppError('No se puede cancelar este pedido', 400);
    }

    // TODO: Procesar reembolso si ya se pagó

    res.json({
      success: true,
      message: 'Pedido cancelado',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Obtener pedidos del restaurante
export const getRestaurantOrders = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;
    const { status, startDate, endDate, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let queryText = 'SELECT * FROM orders WHERE restaurant_id = $1';
    const params = [restaurantId];
    let paramCount = 2;

    if (status) {
      queryText += ` AND order_status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (startDate) {
      queryText += ` AND created_at >= $${paramCount}`;
      params.push(startDate);
      paramCount++;
    }

    if (endDate) {
      queryText += ` AND created_at <= $${paramCount}`;
      params.push(endDate);
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

// Obtener pedidos activos
export const getActiveOrders = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;

    const result = await query(
      `SELECT * FROM orders
       WHERE restaurant_id = $1
       AND order_status IN ('received', 'preparing', 'ready', 'on_the_way')
       ORDER BY created_at ASC`,
      [restaurantId]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar estado del pedido
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const result = await query(
      `UPDATE orders
       SET order_status = $1, updated_at = NOW(),
           delivered_at = CASE WHEN $1 = 'delivered' THEN NOW() ELSE delivered_at END
       WHERE id = $2
       RETURNING *`,
      [status, orderId]
    );

    if (result.rows.length === 0) {
      throw new AppError('Pedido no encontrado', 404);
    }

    const order = result.rows[0];

    // Notificar via WebSocket
    const io = req.app.get('io');
    io.to(`order-${orderId}`).emit('order-status-update', {
      orderId,
      status,
      updatedAt: order.updated_at
    });

    res.json({
      success: true,
      message: `Estado actualizado a: ${status}`,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// Obtener historial de pedidos
export const getOrderHistory = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const result = await query(
      `SELECT * FROM orders
       WHERE restaurant_id = $1
       AND order_status IN ('delivered', 'cancelled')
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [restaurantId, limit, offset]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

// Obtener todos los pedidos (admin)
export const getAllOrders = async (req, res, next) => {
  try {
    const { status, restaurant_id, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let queryText = `
      SELECT o.*, r.name as restaurant_name
      FROM orders o
      JOIN restaurants r ON o.restaurant_id = r.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (status) {
      queryText += ` AND o.order_status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (restaurant_id) {
      queryText += ` AND o.restaurant_id = $${paramCount}`;
      params.push(restaurant_id);
      paramCount++;
    }

    queryText += ` ORDER BY o.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
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

// Estadísticas de pedidos (admin)
export const getOrderStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const stats = await query(
      `SELECT
        COUNT(*) as total_orders,
        COUNT(*) FILTER (WHERE order_status = 'delivered') as delivered,
        COUNT(*) FILTER (WHERE order_status = 'cancelled') as cancelled,
        SUM(total) FILTER (WHERE payment_status = 'approved') as total_revenue,
        SUM(platform_commission) FILTER (WHERE payment_status = 'approved') as total_commission,
        AVG(total) FILTER (WHERE payment_status = 'approved') as avg_order_value,
        COUNT(DISTINCT restaurant_id) as active_restaurants
       FROM orders
       WHERE created_at >= COALESCE($1, created_at)
       AND created_at <= COALESCE($2, created_at)`,
      [startDate || null, endDate || null]
    );

    res.json({
      success: true,
      data: stats.rows[0]
    });
  } catch (error) {
    next(error);
  }
};
