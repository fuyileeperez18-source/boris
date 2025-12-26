import express from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import { query } from '../config/database.js';

const router = express.Router();

// Get dashboard overview
router.get('/dashboard', authenticate, authorize('admin', 'restaurant'), async (req, res) => {
  try {
    const { startDate, endDate, restaurantId } = req.query;

    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const end = endDate || new Date().toISOString().split('T')[0];

    // Get total revenue
    const revenueResult = await query(
      `SELECT COALESCE(SUM(total), 0) as total_revenue,
              COUNT(*) as total_orders,
              COALESCE(AVG(total), 0) as avg_order_value
       FROM orders
       WHERE created_at >= $1 AND created_at <= $2
       ${restaurantId ? 'AND restaurant_id = $3' : ''}
       AND status NOT IN ('cancelled', 'refunded')`,
      restaurantId ? [start, end, restaurantId] : [start, end]
    );

    // Get total reservations
    const reservationsResult = await query(
      `SELECT COUNT(*) as total_reservations,
              COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed,
              COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed
       FROM reservations
       WHERE created_at >= $1 AND created_at <= $2
       ${restaurantId ? 'AND restaurant_id = $3' : ''}`,
      restaurantId ? [start, end, restaurantId] : [start, end]
    );

    // Get new customers
    const customersResult = await query(
      `SELECT COUNT(DISTINCT customer_phone) as unique_customers
       FROM orders
       WHERE created_at >= $1 AND created_at <= $2
       ${restaurantId ? 'AND restaurant_id = $3' : ''}`,
      restaurantId ? [start, end, restaurantId] : [start, end]
    );

    // Get orders by status
    const ordersByStatusResult = await query(
      `SELECT status, COUNT(*) as count
       FROM orders
       WHERE created_at >= $1 AND created_at <= $2
       ${restaurantId ? 'AND restaurant_id = $3' : ''}
       GROUP BY status`,
      restaurantId ? [start, end, restaurantId] : [start, end]
    );

    res.json({
      success: true,
      data: {
        revenue: {
          total: parseFloat(revenueResult.rows[0]?.total_revenue || 0),
          orders: parseInt(revenueResult.rows[0]?.total_orders || 0),
          avgOrderValue: parseFloat(revenueResult.rows[0]?.avg_order_value || 0)
        },
        reservations: {
          total: parseInt(reservationsResult.rows[0]?.total_reservations || 0),
          confirmed: parseInt(reservationsResult.rows[0]?.confirmed || 0),
          completed: parseInt(reservationsResult.rows[0]?.completed || 0)
        },
        customers: {
          unique: parseInt(customersResult.rows[0]?.unique_customers || 0)
        },
        ordersByStatus: ordersByStatusResult.rows
      },
      period: { start, end }
    });
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({ error: 'Error fetching dashboard data' });
  }
});

// Get revenue over time
router.get('/revenue', authenticate, authorize('admin', 'restaurant'), async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day', restaurantId } = req.query;

    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const end = endDate || new Date().toISOString().split('T')[0];

    let dateFormat;
    switch (groupBy) {
      case 'hour':
        dateFormat = 'YYYY-MM-DD HH24:00';
        break;
      case 'week':
        dateFormat = 'IYYY-IW';
        break;
      case 'month':
        dateFormat = 'YYYY-MM';
        break;
      default:
        dateFormat = 'YYYY-MM-DD';
    }

    const result = await query(
      `SELECT TO_CHAR(created_at, $1) as period,
              SUM(total) as revenue,
              COUNT(*) as orders
       FROM orders
       WHERE created_at >= $2 AND created_at <= $3
       ${restaurantId ? 'AND restaurant_id = $4' : ''}
       AND status NOT IN ('cancelled', 'refunded')
       GROUP BY period
       ORDER BY period`,
      restaurantId ? [dateFormat, start, end, restaurantId] : [dateFormat, start, end]
    );

    res.json({
      success: true,
      data: result.rows,
      period: { start, end, groupBy }
    });
  } catch (error) {
    console.error('Revenue analytics error:', error);
    res.status(500).json({ error: 'Error fetching revenue data' });
  }
});

// Get top selling products
router.get('/top-products', authenticate, authorize('admin', 'restaurant'), async (req, res) => {
  try {
    const { startDate, endDate, limit = 10, restaurantId } = req.query;

    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const end = endDate || new Date().toISOString().split('T')[0];

    const result = await query(
      `SELECT oi.product_id,
              mp.name as product_name,
              mp.price,
              SUM(oi.quantity) as total_quantity,
              SUM(oi.quantity * oi.price) as total_revenue
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       JOIN menu_products mp ON mp.id = oi.product_id
       WHERE o.created_at >= $1 AND o.created_at <= $2
       ${restaurantId ? 'AND o.restaurant_id = $3' : ''}
       AND o.status NOT IN ('cancelled', 'refunded')
       GROUP BY oi.product_id, mp.name, mp.price
       ORDER BY total_quantity DESC
       LIMIT $${restaurantId ? 4 : 3}`,
      restaurantId ? [start, end, restaurantId, limit] : [start, end, limit]
    );

    res.json({
      success: true,
      data: result.rows,
      period: { start, end }
    });
  } catch (error) {
    console.error('Top products analytics error:', error);
    res.status(500).json({ error: 'Error fetching top products' });
  }
});

// Get peak hours
router.get('/peak-hours', authenticate, authorize('admin', 'restaurant'), async (req, res) => {
  try {
    const { startDate, endDate, restaurantId } = req.query;

    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const end = endDate || new Date().toISOString().split('T')[0];

    const result = await query(
      `SELECT EXTRACT(HOUR FROM created_at) as hour,
              COUNT(*) as orders,
              SUM(total) as revenue
       FROM orders
       WHERE created_at >= $1 AND created_at <= $2
       ${restaurantId ? 'AND restaurant_id = $3' : ''}
       AND status NOT IN ('cancelled', 'refunded')
       GROUP BY hour
       ORDER BY hour`,
      restaurantId ? [start, end, restaurantId] : [start, end]
    );

    res.json({
      success: true,
      data: result.rows,
      period: { start, end }
    });
  } catch (error) {
    console.error('Peak hours analytics error:', error);
    res.status(500).json({ error: 'Error fetching peak hours' });
  }
});

// Get customer analytics
router.get('/customers', authenticate, authorize('admin', 'restaurant'), async (req, res) => {
  try {
    const { startDate, endDate, restaurantId } = req.query;

    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const end = endDate || new Date().toISOString().split('T')[0];

    // New vs returning customers
    const customerStats = await query(
      `WITH customer_orders AS (
         SELECT customer_phone,
                MIN(created_at) as first_order,
                COUNT(*) as order_count,
                SUM(total) as total_spent
         FROM orders
         WHERE status NOT IN ('cancelled', 'refunded')
         ${restaurantId ? 'AND restaurant_id = $3' : ''}
         GROUP BY customer_phone
       )
       SELECT
         COUNT(CASE WHEN first_order >= $1 AND first_order <= $2 THEN 1 END) as new_customers,
         COUNT(CASE WHEN first_order < $1 AND order_count > 1 THEN 1 END) as returning_customers,
         AVG(order_count) as avg_orders_per_customer,
         AVG(total_spent) as avg_customer_value
       FROM customer_orders`,
      restaurantId ? [start, end, restaurantId] : [start, end]
    );

    // Top customers
    const topCustomers = await query(
      `SELECT customer_name, customer_phone,
              COUNT(*) as order_count,
              SUM(total) as total_spent
       FROM orders
       WHERE created_at >= $1 AND created_at <= $2
       ${restaurantId ? 'AND restaurant_id = $3' : ''}
       AND status NOT IN ('cancelled', 'refunded')
       GROUP BY customer_name, customer_phone
       ORDER BY total_spent DESC
       LIMIT 10`,
      restaurantId ? [start, end, restaurantId] : [start, end]
    );

    res.json({
      success: true,
      data: {
        stats: customerStats.rows[0],
        topCustomers: topCustomers.rows
      },
      period: { start, end }
    });
  } catch (error) {
    console.error('Customer analytics error:', error);
    res.status(500).json({ error: 'Error fetching customer data' });
  }
});

// Get delivery analytics
router.get('/delivery', authenticate, authorize('admin', 'restaurant'), async (req, res) => {
  try {
    const { startDate, endDate, restaurantId } = req.query;

    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const end = endDate || new Date().toISOString().split('T')[0];

    const result = await query(
      `SELECT
         COUNT(CASE WHEN order_type = 'delivery' THEN 1 END) as delivery_orders,
         COUNT(CASE WHEN order_type = 'pickup' THEN 1 END) as pickup_orders,
         AVG(CASE WHEN order_type = 'delivery' THEN delivery_fee END) as avg_delivery_fee,
         COUNT(CASE WHEN status = 'delivered' THEN 1 END) as completed_deliveries
       FROM orders
       WHERE created_at >= $1 AND created_at <= $2
       ${restaurantId ? 'AND restaurant_id = $3' : ''}
       AND status NOT IN ('cancelled', 'refunded')`,
      restaurantId ? [start, end, restaurantId] : [start, end]
    );

    res.json({
      success: true,
      data: result.rows[0],
      period: { start, end }
    });
  } catch (error) {
    console.error('Delivery analytics error:', error);
    res.status(500).json({ error: 'Error fetching delivery data' });
  }
});

// Generate report (CSV/PDF)
router.get('/report', authenticate, authorize('admin', 'restaurant'), async (req, res) => {
  try {
    const { startDate, endDate, type = 'orders', format = 'json', restaurantId } = req.query;

    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const end = endDate || new Date().toISOString().split('T')[0];

    let result;

    switch (type) {
      case 'orders':
        result = await query(
          `SELECT o.id, o.tracking_number, o.customer_name, o.customer_phone,
                  o.order_type, o.status, o.total, o.created_at
           FROM orders o
           WHERE o.created_at >= $1 AND o.created_at <= $2
           ${restaurantId ? 'AND o.restaurant_id = $3' : ''}
           ORDER BY o.created_at DESC`,
          restaurantId ? [start, end, restaurantId] : [start, end]
        );
        break;

      case 'reservations':
        result = await query(
          `SELECT r.id, r.code, r.date, r.time, r.guests, r.status,
                  u.name as customer_name, u.phone as customer_phone,
                  r.created_at
           FROM reservations r
           LEFT JOIN users u ON u.id = r.user_id
           WHERE r.created_at >= $1 AND r.created_at <= $2
           ${restaurantId ? 'AND r.restaurant_id = $3' : ''}
           ORDER BY r.date DESC`,
          restaurantId ? [start, end, restaurantId] : [start, end]
        );
        break;

      case 'products':
        result = await query(
          `SELECT oi.product_id, mp.name, mp.category_id,
                  SUM(oi.quantity) as total_sold,
                  SUM(oi.quantity * oi.price) as revenue
           FROM order_items oi
           JOIN orders o ON o.id = oi.order_id
           JOIN menu_products mp ON mp.id = oi.product_id
           WHERE o.created_at >= $1 AND o.created_at <= $2
           ${restaurantId ? 'AND o.restaurant_id = $3' : ''}
           AND o.status NOT IN ('cancelled', 'refunded')
           GROUP BY oi.product_id, mp.name, mp.category_id
           ORDER BY total_sold DESC`,
          restaurantId ? [start, end, restaurantId] : [start, end]
        );
        break;

      default:
        return res.status(400).json({ error: 'Invalid report type' });
    }

    if (format === 'csv') {
      const csv = convertToCSV(result.rows);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${type}-report-${start}-${end}.csv`);
      return res.send(csv);
    }

    res.json({
      success: true,
      data: result.rows,
      period: { start, end },
      type
    });
  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({ error: 'Error generating report' });
  }
});

// Helper function to convert to CSV
function convertToCSV(data) {
  if (!data || data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header];
        if (value === null || value === undefined) return '';
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  return csv;
}

export default router;
