import { query } from '../config/database.js';
import { AppError } from '../middlewares/errorHandler.js';

// Dashboard principal
export const getDashboard = async (req, res, next) => {
  try {
    // Métricas generales
    const stats = await query(`
      SELECT
        (SELECT COUNT(*) FROM restaurants WHERE is_active = true) as total_restaurants,
        (SELECT COUNT(*) FROM users WHERE role = 'customer') as total_customers,
        (SELECT COUNT(*) FROM orders WHERE created_at >= NOW() - INTERVAL '24 hours') as orders_today,
        (SELECT COUNT(*) FROM orders WHERE created_at >= NOW() - INTERVAL '7 days') as orders_week,
        (SELECT COALESCE(SUM(total), 0) FROM orders WHERE payment_status = 'paid' AND created_at >= NOW() - INTERVAL '24 hours') as revenue_today,
        (SELECT COALESCE(SUM(total), 0) FROM orders WHERE payment_status = 'paid' AND created_at >= NOW() - INTERVAL '7 days') as revenue_week,
        (SELECT COALESCE(SUM(platform_commission), 0) FROM orders WHERE payment_status = 'paid' AND created_at >= NOW() - INTERVAL '24 hours') as commission_today,
        (SELECT COALESCE(SUM(platform_commission), 0) FROM orders WHERE payment_status = 'paid' AND created_at >= NOW() - INTERVAL '7 days') as commission_week,
        (SELECT COUNT(*) FROM reservations WHERE created_at >= NOW() - INTERVAL '24 hours') as reservations_today,
        (SELECT COUNT(*) FROM delivery_persons WHERE is_available = true) as available_delivery_persons
    `);

    // Pedidos por estado
    const ordersByStatus = await query(`
      SELECT order_status, COUNT(*) as count
      FROM orders
      WHERE created_at >= NOW() - INTERVAL '24 hours'
      GROUP BY order_status
    `);

    // Top 5 restaurantes por pedidos
    const topRestaurants = await query(`
      SELECT r.id, r.name, COUNT(o.id) as order_count, COALESCE(SUM(o.total), 0) as total_revenue
      FROM restaurants r
      LEFT JOIN orders o ON r.id = o.restaurant_id AND o.created_at >= NOW() - INTERVAL '7 days'
      WHERE r.is_active = true
      GROUP BY r.id, r.name
      ORDER BY order_count DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      data: {
        overview: stats.rows[0],
        ordersByStatus: ordersByStatus.rows,
        topRestaurants: topRestaurants.rows
      }
    });
  } catch (error) {
    next(error);
  }
};

// Métricas en tiempo real
export const getRealtimeStats = async (req, res, next) => {
  try {
    const result = await query(`
      SELECT
        (SELECT COUNT(*) FROM orders WHERE order_status IN ('received', 'preparing', 'ready', 'on_the_way')) as active_orders,
        (SELECT COUNT(*) FROM delivery_persons WHERE is_available = true) as available_drivers,
        (SELECT COUNT(*) FROM orders WHERE created_at >= NOW() - INTERVAL '1 hour') as orders_last_hour
    `);

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Reporte de ingresos
export const getRevenueReport = async (req, res, next) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;

    let dateFormat;
    switch (groupBy) {
      case 'hour': dateFormat = 'YYYY-MM-DD HH24:00'; break;
      case 'week': dateFormat = 'IYYY-IW'; break;
      case 'month': dateFormat = 'YYYY-MM'; break;
      default: dateFormat = 'YYYY-MM-DD';
    }

    const result = await query(`
      SELECT
        TO_CHAR(created_at, $1) as period,
        COUNT(*) as total_orders,
        SUM(total) as total_revenue,
        SUM(platform_commission) as total_commission,
        AVG(total) as avg_order_value
      FROM orders
      WHERE payment_status = 'paid'
      AND created_at >= COALESCE($2, NOW() - INTERVAL '30 days')
      AND created_at <= COALESCE($3, NOW())
      GROUP BY period
      ORDER BY period
    `, [dateFormat, startDate, endDate]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

// Reporte de pedidos
export const getOrdersReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const result = await query(`
      SELECT
        order_status,
        order_type,
        delivery_method,
        COUNT(*) as count,
        AVG(total) as avg_value,
        AVG(EXTRACT(EPOCH FROM (delivered_at - created_at)) / 60) FILTER (WHERE delivered_at IS NOT NULL) as avg_delivery_time_minutes
      FROM orders
      WHERE created_at >= COALESCE($1, NOW() - INTERVAL '30 days')
      AND created_at <= COALESCE($2, NOW())
      GROUP BY order_status, order_type, delivery_method
    `, [startDate, endDate]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

// Reporte de restaurantes
export const getRestaurantsReport = async (req, res, next) => {
  try {
    const result = await query(`
      SELECT
        r.id, r.name, r.commission_rate,
        COUNT(o.id) as total_orders,
        SUM(o.total) as total_revenue,
        SUM(o.platform_commission) as commission_paid,
        AVG(o.total) as avg_order_value,
        COUNT(res.id) as total_reservations
      FROM restaurants r
      LEFT JOIN orders o ON r.id = o.restaurant_id AND o.payment_status = 'paid'
      LEFT JOIN reservations res ON r.id = res.restaurant_id
      WHERE r.is_active = true
      GROUP BY r.id, r.name, r.commission_rate
      ORDER BY total_revenue DESC NULLS LAST
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

// Reporte de usuarios
export const getUsersReport = async (req, res, next) => {
  try {
    const result = await query(`
      SELECT
        DATE_TRUNC('day', created_at) as date,
        COUNT(*) as new_users,
        COUNT(*) FILTER (WHERE role = 'customer') as new_customers
      FROM users
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY date
      ORDER BY date
    `);

    const summary = await query(`
      SELECT
        COUNT(*) as total_users,
        COUNT(*) FILTER (WHERE role = 'customer') as customers,
        COUNT(*) FILTER (WHERE role = 'restaurant') as restaurant_owners,
        COUNT(*) FILTER (WHERE role = 'delivery') as delivery_persons
      FROM users
    `);

    res.json({
      success: true,
      data: {
        summary: summary.rows[0],
        daily: result.rows
      }
    });
  } catch (error) {
    next(error);
  }
};

// Reporte de delivery
export const getDeliveryReport = async (req, res, next) => {
  try {
    const result = await query(`
      SELECT
        d.delivery_person_id,
        u.name as driver_name,
        COUNT(*) as total_deliveries,
        SUM(d.delivery_fee_for_driver) as total_earnings,
        AVG(EXTRACT(EPOCH FROM (d.delivery_time - d.pickup_time)) / 60) as avg_delivery_time_minutes
      FROM deliveries d
      JOIN users u ON d.delivery_person_id = u.id
      WHERE d.status = 'delivered'
      AND d.created_at >= NOW() - INTERVAL '30 days'
      GROUP BY d.delivery_person_id, u.name
      ORDER BY total_deliveries DESC
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

// Exportar reporte
export const exportReport = async (req, res, next) => {
  try {
    const { type, format, startDate, endDate } = req.query;

    // TODO: Implementar exportación a CSV/Excel
    res.json({
      success: true,
      message: 'Funcionalidad de exportación pendiente de implementar'
    });
  } catch (error) {
    next(error);
  }
};

// Obtener configuración de la plataforma
export const getPlatformConfig = async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM platform_config LIMIT 1');

    res.json({
      success: true,
      data: result.rows[0] || {}
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar configuración
export const updatePlatformConfig = async (req, res, next) => {
  try {
    const { config } = req.body;

    // Upsert configuración
    await query(`
      INSERT INTO platform_config (id, config, updated_at)
      VALUES (1, $1, NOW())
      ON CONFLICT (id) DO UPDATE SET config = $1, updated_at = NOW()
    `, [JSON.stringify(config)]);

    res.json({
      success: true,
      message: 'Configuración actualizada'
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar comisiones por defecto
export const updateDefaultCommissions = async (req, res, next) => {
  try {
    const { reservation_commission, delivery_own_commission, delivery_platform_commission } = req.body;

    await query(`
      UPDATE platform_config
      SET
        default_reservation_commission = COALESCE($1, default_reservation_commission),
        default_delivery_own_commission = COALESCE($2, default_delivery_own_commission),
        default_delivery_platform_commission = COALESCE($3, default_delivery_platform_commission),
        updated_at = NOW()
      WHERE id = 1
    `, [reservation_commission, delivery_own_commission, delivery_platform_commission]);

    res.json({
      success: true,
      message: 'Comisiones actualizadas'
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar zonas de delivery
export const updateDeliveryZones = async (req, res, next) => {
  try {
    const { zones } = req.body;

    await query(`
      UPDATE platform_config
      SET delivery_zones = $1, updated_at = NOW()
      WHERE id = 1
    `, [JSON.stringify(zones)]);

    res.json({
      success: true,
      message: 'Zonas actualizadas'
    });
  } catch (error) {
    next(error);
  }
};

// Restaurantes pendientes de aprobación
export const getPendingRestaurants = async (req, res, next) => {
  try {
    const result = await query(`
      SELECT r.*, u.name as owner_name, u.email as owner_email
      FROM restaurants r
      JOIN users u ON r.user_id = u.id
      WHERE r.is_active = false
      ORDER BY r.created_at DESC
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

// Aprobar restaurante
export const approveRestaurant = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;

    await query(
      'UPDATE restaurants SET is_active = true, updated_at = NOW() WHERE id = $1',
      [restaurantId]
    );

    res.json({
      success: true,
      message: 'Restaurante aprobado'
    });
  } catch (error) {
    next(error);
  }
};

// Rechazar restaurante
export const rejectRestaurant = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;
    const { reason } = req.body;

    // TODO: Enviar notificación con razón del rechazo
    await query(
      'DELETE FROM restaurants WHERE id = $1',
      [restaurantId]
    );

    res.json({
      success: true,
      message: 'Restaurante rechazado'
    });
  } catch (error) {
    next(error);
  }
};

// Suspender restaurante
export const suspendRestaurant = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;
    const { reason } = req.body;

    await query(
      'UPDATE restaurants SET is_active = false, updated_at = NOW() WHERE id = $1',
      [restaurantId]
    );

    res.json({
      success: true,
      message: 'Restaurante suspendido'
    });
  } catch (error) {
    next(error);
  }
};

// Tickets de soporte (placeholder)
export const getSupportTickets = async (req, res, next) => {
  res.json({ success: true, data: [], message: 'Sistema de soporte pendiente de implementar' });
};

export const respondToTicket = async (req, res, next) => {
  res.json({ success: true, message: 'Sistema de soporte pendiente de implementar' });
};

export const closeTicket = async (req, res, next) => {
  res.json({ success: true, message: 'Sistema de soporte pendiente de implementar' });
};

// Logs y auditoría (placeholder)
export const getSystemLogs = async (req, res, next) => {
  res.json({ success: true, data: [], message: 'Sistema de logs pendiente de implementar' });
};

export const getUserActivity = async (req, res, next) => {
  res.json({ success: true, data: [], message: 'Sistema de actividad pendiente de implementar' });
};
