import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database.js';
import { AppError } from '../middlewares/errorHandler.js';

// Generar slug único para URL
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

// Obtener todos los restaurantes activos
export const getAllRestaurants = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const offset = (page - 1) * limit;

    let queryText = `
      SELECT id, name, slug, description, address, phone, logo_url, cover_image_url,
             has_own_delivery, is_active, opening_hours
      FROM restaurants
      WHERE is_active = true
    `;
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      queryText += ` AND (name ILIKE $${params.length} OR description ILIKE $${params.length})`;
    }

    queryText += ` ORDER BY name LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await query(queryText, params);

    // Contar total
    let countQuery = 'SELECT COUNT(*) FROM restaurants WHERE is_active = true';
    if (search) {
      countQuery += ` AND (name ILIKE $1 OR description ILIKE $1)`;
    }
    const countResult = await query(countQuery, search ? [`%${search}%`] : []);

    res.json({
      success: true,
      data: {
        restaurants: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: parseInt(countResult.rows[0].count),
          totalPages: Math.ceil(countResult.rows[0].count / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Obtener restaurante por slug
export const getRestaurantBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const result = await query(
      `SELECT r.*, u.name as owner_name, u.email as owner_email
       FROM restaurants r
       LEFT JOIN users u ON r.user_id = u.id
       WHERE r.slug = $1`,
      [slug]
    );

    if (result.rows.length === 0) {
      throw new AppError('Restaurante no encontrado', 404);
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Obtener restaurante por ID
export const getRestaurantById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT r.*, u.name as owner_name, u.email as owner_email
       FROM restaurants r
       LEFT JOIN users u ON r.user_id = u.id
       WHERE r.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new AppError('Restaurante no encontrado', 404);
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Crear restaurante
export const createRestaurant = async (req, res, next) => {
  try {
    const {
      name, description, address, latitude, longitude, phone, email,
      logo_url, cover_image_url, delivery_zones, opening_hours,
      commission_rate, has_own_delivery, user_id
    } = req.body;

    const restaurantId = uuidv4();
    let slug = generateSlug(name);

    // Verificar si el slug ya existe
    const existingSlug = await query(
      'SELECT id FROM restaurants WHERE slug = $1',
      [slug]
    );

    if (existingSlug.rows.length > 0) {
      slug = `${slug}-${Date.now()}`;
    }

    const result = await query(
      `INSERT INTO restaurants (
        id, user_id, name, slug, description, address, latitude, longitude,
        phone, email, logo_url, cover_image_url, delivery_zones, opening_hours,
        commission_rate, has_own_delivery, is_active, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, true, NOW(), NOW())
      RETURNING *`,
      [
        restaurantId, user_id, name, slug, description, address, latitude, longitude,
        phone, email, logo_url, cover_image_url,
        JSON.stringify(delivery_zones || []),
        JSON.stringify(opening_hours || {}),
        commission_rate || 12.0,
        has_own_delivery || false
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Restaurante creado exitosamente',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar restaurante
export const updateRestaurant = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;
    const updates = req.body;

    // Construir query dinámicamente
    const fields = [];
    const values = [];
    let paramCount = 1;

    const allowedFields = [
      'name', 'description', 'address', 'latitude', 'longitude',
      'phone', 'email', 'logo_url', 'cover_image_url', 'delivery_zones',
      'opening_hours', 'has_own_delivery', 'is_active'
    ];

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        fields.push(`${field} = $${paramCount}`);
        values.push(
          field === 'delivery_zones' || field === 'opening_hours'
            ? JSON.stringify(updates[field])
            : updates[field]
        );
        paramCount++;
      }
    }

    if (fields.length === 0) {
      throw new AppError('No hay campos para actualizar', 400);
    }

    fields.push('updated_at = NOW()');
    values.push(restaurantId);

    const result = await query(
      `UPDATE restaurants SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    res.json({
      success: true,
      message: 'Restaurante actualizado',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar restaurante
export const deleteRestaurant = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;

    // Soft delete - solo desactivar
    await query(
      'UPDATE restaurants SET is_active = false, updated_at = NOW() WHERE id = $1',
      [restaurantId]
    );

    res.json({
      success: true,
      message: 'Restaurante eliminado'
    });
  } catch (error) {
    next(error);
  }
};

// Obtener estadísticas del restaurante
export const getRestaurantStats = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;
    const { startDate, endDate } = req.query;

    // Pedidos totales y por estado
    const ordersStats = await query(
      `SELECT
        COUNT(*) as total_orders,
        COUNT(*) FILTER (WHERE order_status = 'delivered') as delivered,
        COUNT(*) FILTER (WHERE order_status = 'cancelled') as cancelled,
        SUM(total) FILTER (WHERE payment_status = 'approved') as total_revenue,
        SUM(platform_commission) FILTER (WHERE payment_status = 'approved') as total_commission,
        AVG(total) FILTER (WHERE payment_status = 'approved') as avg_order_value
       FROM orders
       WHERE restaurant_id = $1
       ${startDate ? 'AND created_at >= $2' : ''}
       ${endDate ? `AND created_at <= $${startDate ? 3 : 2}` : ''}`,
      [restaurantId, ...(startDate ? [startDate] : []), ...(endDate ? [endDate] : [])]
    );

    // Reservas totales
    const reservationsStats = await query(
      `SELECT
        COUNT(*) as total_reservations,
        COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed,
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled
       FROM reservations
       WHERE restaurant_id = $1`,
      [restaurantId]
    );

    // Productos más vendidos
    const topProducts = await query(
      `SELECT p.id, p.name, COUNT(*) as order_count
       FROM orders o, jsonb_array_elements(o.items) as item
       JOIN products p ON p.id = (item->>'product_id')::uuid
       WHERE o.restaurant_id = $1 AND o.payment_status = 'approved'
       GROUP BY p.id, p.name
       ORDER BY order_count DESC
       LIMIT 5`,
      [restaurantId]
    );

    res.json({
      success: true,
      data: {
        orders: ordersStats.rows[0],
        reservations: reservationsStats.rows[0],
        topProducts: topProducts.rows
      }
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar comisión del restaurante (solo admin)
export const updateCommission = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;
    const { commission_rate } = req.body;

    if (commission_rate < 0 || commission_rate > 100) {
      throw new AppError('Comisión debe estar entre 0 y 100', 400);
    }

    const result = await query(
      'UPDATE restaurants SET commission_rate = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [commission_rate, restaurantId]
    );

    res.json({
      success: true,
      message: 'Comisión actualizada',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};
