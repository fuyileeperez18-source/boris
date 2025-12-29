import { query } from '../config/database.js';
import { AppError } from '../middlewares/errorHandler.js';

// Obtener configuración
export const getSettings = async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM platform_settings LIMIT 1');

    let settings = result.rows[0] || {};

    // Valores por defecto si no hay configuración
    const defaults = {
      platform_name: 'BORIS',
      platform_logo: null,
      platform_favicon: null,
      primary_color: '#ff6b35',
      secondary_color: '#2d3436',
      contact_email: 'contacto@boris.com.co',
      contact_phone: '+57 300 123 4567',
      address: 'Colombia',
      facebook_url: null,
      instagram_url: null,
      twitter_url: null,
      default_commission_rate: 15,
      min_order_amount: 15000,
      delivery_fee_base: 5000,
      delivery_fee_per_km: 500,
      free_delivery_threshold: 50000,
      support_phone: '+57 300 123 4567',
      support_whatsapp: '+57 300 123 4567',
      business_hours: '10:00 - 22:00',
      about_text: 'BORIS es tu restaurante de mariscos favorito en Cartagena.',
      terms_url: null,
      privacy_url: null,
      refund_policy: null
    };

    // Merge con valores por defecto
    settings = { ...defaults, ...settings };

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar configuración
export const updateSettings = async (req, res, next) => {
  try {
    const updates = req.body;

    // Campos permitidos para actualización
    const allowedFields = [
      'platform_name', 'platform_logo', 'platform_favicon',
      'primary_color', 'secondary_color', 'contact_email',
      'contact_phone', 'address', 'facebook_url', 'instagram_url',
      'twitter_url', 'default_commission_rate', 'min_order_amount',
      'delivery_fee_base', 'delivery_fee_per_km', 'free_delivery_threshold',
      'support_phone', 'support_whatsapp', 'business_hours',
      'about_text', 'terms_url', 'privacy_url', 'refund_policy'
    ];

    const setClauses = [];
    const values = [];
    let paramCount = 1;

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        setClauses.push(`${field} = $${paramCount}`);
        values.push(updates[field]);
        paramCount++;
      }
    }

    if (setClauses.length === 0) {
      throw new AppError('No hay campos para actualizar', 400);
    }

    setClauses.push(`updated_at = NOW()`);
    values.push(req.user.id);

    // Upsert - insertar si no existe, actualizar si existe
    await query(
      `INSERT INTO platform_settings (id, ${setClauses.slice(0, -1).join(', ')}, updated_by)
       VALUES (1, ${Array.from({ length: setClauses.length - 1 }, (_, i) => `$${i + 1}`).join(', ')}, $${paramCount})
       ON CONFLICT (id) DO UPDATE SET ${setClauses.join(', ')}`,
      values
    );

    res.json({
      success: true,
      message: 'Configuración actualizada'
    });
  } catch (error) {
    next(error);
  }
};

// Exportar reportes a CSV
export const exportToCSV = async (req, res, next) => {
  try {
    const { type = 'orders', start_date, end_date } = req.query;

    let queryStr = '';
    let filename = '';

    switch (type) {
      case 'orders':
        queryStr = `
          SELECT
            o.tracking_number,
            o.customer_name,
            o.customer_phone,
            o.total,
            o.status,
            o.created_at,
            r.name as restaurant_name
          FROM orders o
          JOIN restaurants r ON o.restaurant_id = r.id
          ${start_date && end_date ? "WHERE o.created_at BETWEEN $1 AND $2" : ''}
          ORDER BY o.created_at DESC
        `;
        filename = 'orders.csv';
        break;

      case 'restaurants':
        queryStr = `
          SELECT
            r.name,
            r.slug,
            r.contact_email,
            r.contact_phone,
            r.address,
            r.commission_rate,
            r.is_active,
            r.created_at,
            (SELECT COUNT(*) FROM orders WHERE restaurant_id = r.id) as total_orders,
            (SELECT COALESCE(SUM(total), 0) FROM orders WHERE restaurant_id = r.id AND status = 'delivered') as total_revenue
          FROM restaurants r
          ORDER BY r.created_at DESC
        `;
        filename = 'restaurants.csv';
        break;

      case 'users':
        queryStr = `
          SELECT
            u.name,
            u.email,
            u.phone,
            u.role,
            u.is_active,
            u.created_at,
            (SELECT COUNT(*) FROM orders WHERE user_id = u.id) as total_orders
          FROM users u
          WHERE u.role = 'customer'
          ORDER BY u.created_at DESC
        `;
        filename = 'users.csv';
        break;

      case 'commissions':
        queryStr = `
          SELECT
            r.name as restaurant,
            r.commission_rate,
            o.tracking_number,
            o.total,
            (o.total * r.commission_rate / 100) as commission_amount,
            o.status,
            o.created_at
          FROM orders o
          JOIN restaurants r ON o.restaurant_id = r.id
          ${start_date && end_date ? "WHERE o.created_at BETWEEN $1 AND $2" : ''}
          ORDER BY o.created_at DESC
        `;
        filename = 'commissions.csv';
        break;

      default:
        throw new AppError('Tipo de reporte no válido', 400);
    }

    const params = start_date && end_date ? [start_date, end_date] : [];
    const result = await query(queryStr, params);

    // Generar CSV
    if (result.rows.length === 0) {
      return res.json({
        success: true,
        message: 'No hay datos para exportar',
        data: []
      });
    }

    const headers = Object.keys(result.rows[0]);
    const csvRows = [headers.join(',')];

    for (const row of result.rows) {
      const values = headers.map(header => {
        const value = row[header];
        if (value === null) return '';
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      csvRows.push(values.join(','));
    }

    const csv = csvRows.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.send(csv);
  } catch (error) {
    next(error);
  }
};
