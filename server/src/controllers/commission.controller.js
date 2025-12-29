import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database.js';
import { AppError } from '../middlewares/errorHandler.js';

// Obtener comisiones del miembro actual
export const getMyCommissions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;

    // Obtener el miembro del equipo
    const member = await query(
      'SELECT id FROM team_members WHERE user_id = $1',
      [userId]
    );

    if (member.rows.length === 0) {
      throw new AppError('No eres miembro del equipo', 404);
    }

    const memberId = member.rows[0].id;

    let whereClause = 'member_id = $1';
    const params = [memberId];
    let paramCount = 2;

    if (status) {
      whereClause += ` AND status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    params.push(parseInt(limit), parseInt(offset));

    const result = await query(
      `SELECT c.*, o.tracking_number, o.customer_name
       FROM commissions c
       JOIN orders o ON c.order_id = o.id
       WHERE ${whereClause}
       ORDER BY c.created_at DESC
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      params
    );

    const count = await query(
      `SELECT COUNT(*) FROM commissions WHERE ${whereClause}`,
      params.slice(0, -2)
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

// Obtener resumen de comisiones del miembro
export const getMyCommissionSummary = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const member = await query(
      'SELECT id, percentage FROM team_members WHERE user_id = $1',
      [userId]
    );

    if (member.rows.length === 0) {
      throw new AppError('No eres miembro del equipo', 404);
    }

    const memberId = member.rows[0].id;
    const percentage = member.rows[0].percentage;

    const summary = await query(
      `SELECT
        COALESCE(SUM(amount), 0)::numeric(10,2) as total_earned,
        COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0)::numeric(10,2) as pending,
        COALESCE(SUM(CASE WHEN status = 'approved' THEN amount ELSE 0 END), 0)::numeric(10,2) as approved,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0)::numeric(10,2) as paid,
        COALESCE(SUM(CASE WHEN status = 'cancelled' THEN amount ELSE 0 END), 0)::numeric(10,2) as cancelled,
        COUNT(*) as total_commissions,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count
       FROM commissions
       WHERE member_id = $1`,
      [memberId]
    );

    // Comisiones del mes actual
    const currentMonth = await query(
      `SELECT COALESCE(SUM(amount), 0)::numeric(10,2) as current_month
       FROM commissions
       WHERE member_id = $1
       AND date_trunc('month', created_at) = date_trunc('month', NOW())`,
      [memberId]
    );

    res.json({
      success: true,
      data: {
        percentage,
        ...summary.rows[0],
        current_month: parseFloat(currentMonth.rows[0].current_month)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Obtener todas las comisiones (admin)
export const getAllCommissions = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, member_id, status, start_date, end_date } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = '1=1';
    const params = [];
    let paramCount = 1;

    if (member_id) {
      whereClause += ` AND c.member_id = $${paramCount}`;
      params.push(member_id);
      paramCount++;
    }

    if (status) {
      whereClause += ` AND c.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (start_date && end_date) {
      whereClause += ` AND c.created_at BETWEEN $${paramCount} AND $${paramCount + 1}`;
      params.push(start_date, end_date);
      paramCount += 2;
    }

    params.push(parseInt(limit), parseInt(offset));

    const result = await query(
      `SELECT c.*, tm.name as member_name, tm.email as member_email, o.tracking_number
       FROM commissions c
       JOIN team_members tm ON c.member_id = tm.id
       JOIN orders o ON c.order_id = o.id
       WHERE ${whereClause}
       ORDER BY c.created_at DESC
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      params
    );

    const count = await query(
      `SELECT COUNT(*) FROM commissions c WHERE ${whereClause}`,
      params.slice(0, -2)
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

// Obtener resumen general (admin)
export const getSummary = async (req, res, next) => {
  try {
    const summary = await query(
      `SELECT
        COALESCE(SUM(amount), 0)::numeric(10,2) as total_commissions,
        COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0)::numeric(10,2) as pending_total,
        COALESCE(SUM(CASE WHEN status = 'approved' THEN amount ELSE 0 END), 0)::numeric(10,2) as approved_total,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0)::numeric(10,2) as paid_total,
        COUNT(*) as total_commissions,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_count,
        COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_count
       FROM commissions`
    );

    const byMember = await query(
      `SELECT tm.id, tm.name, tm.email, tm.percentage,
        COALESCE(SUM(c.amount), 0)::numeric(10,2) as total,
        COALESCE(SUM(CASE WHEN c.status = 'pending' THEN c.amount ELSE 0 END), 0)::numeric(10,2) as pending
       FROM team_members tm
       LEFT JOIN commissions c ON tm.id = c.member_id
       GROUP BY tm.id
       ORDER BY total DESC`
    );

    res.json({
      success: true,
      data: {
        overall: summary.rows[0],
        by_member: byMember.rows
      }
    });
  } catch (error) {
    next(error);
  }
};

// Obtener miembros del equipo
export const getTeamMembers = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT tm.*, u.email,
        COALESCE(SUM(c.amount), 0)::numeric(10,2) as total_earned,
        COALESCE(SUM(CASE WHEN c.status = 'paid' THEN c.amount ELSE 0 END), 0)::numeric(10,2) as total_paid
       FROM team_members tm
       JOIN users u ON tm.user_id = u.id
       LEFT JOIN commissions c ON tm.id = c.member_id
       GROUP BY tm.id, u.email
       ORDER BY tm.created_at DESC`
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

// Crear miembro del equipo
export const createTeamMember = async (req, res, next) => {
  try {
    const { user_id, name, email, role, percentage } = req.body;

    // Verificar si el usuario existe
    const user = await query('SELECT id, email FROM users WHERE id = $1', [user_id]);
    if (user.rows.length === 0) {
      throw new AppError('Usuario no encontrado', 404);
    }

    // Verificar si ya es miembro
    const existing = await query(
      'SELECT id FROM team_members WHERE user_id = $1',
      [user_id]
    );

    if (existing.rows.length > 0) {
      throw new AppError('El usuario ya es miembro del equipo', 409);
    }

    const memberId = uuidv4();

    const result = await query(
      `INSERT INTO team_members (id, user_id, name, email, role, percentage, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING *`,
      [memberId, user_id, name || user.rows[0].email.split('@')[0], email || user.rows[0].email, role || 'manager', percentage || 5]
    );

    res.status(201).json({
      success: true,
      message: 'Miembro del equipo agregado',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar miembro del equipo
export const updateTeamMember = async (req, res, next) => {
  try {
    const { memberId } = req.params;
    const { name, email, role, percentage, is_active } = req.body;

    const result = await query(
      `UPDATE team_members
       SET name = COALESCE($1, name),
           email = COALESCE($2, email),
           role = COALESCE($3, role),
           percentage = COALESCE($4, percentage),
           is_active = COALESCE($5, is_active),
           updated_at = NOW()
       WHERE id = $6
       RETURNING *`,
      [name, email, role, percentage, is_active, memberId]
    );

    if (result.rows.length === 0) {
      throw new AppError('Miembro no encontrado', 404);
    }

    res.json({
      success: true,
      message: 'Miembro actualizado',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar estado de comisión
export const updateCommissionStatus = async (req, res, next) => {
  try {
    const { commissionId } = req.params;
    const { status } = req.body;

    const result = await query(
      `UPDATE commissions
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [status, commissionId]
    );

    if (result.rows.length === 0) {
      throw new AppError('Comisión no encontrada', 404);
    }

    res.json({
      success: true,
      message: `Comisión ${status}`,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Registrar pago de comisión
export const recordPayment = async (req, res, next) => {
  try {
    const { member_id, amount, payment_method, notes, commission_ids } = req.body;

    const paymentId = uuidv4();

    // Iniciar transacción
    const client = await (await import('../config/database.js')).getClient();
    try {
      await client.query('BEGIN');

      // Registrar pago
      await client.query(
        `INSERT INTO commission_payments (id, member_id, amount, payment_method, notes, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [paymentId, member_id, amount, payment_method, notes || null]
      );

      // Actualizar estado de las comisiones
      if (commission_ids && commission_ids.length > 0) {
        await client.query(
          `UPDATE commissions
           SET status = 'paid', payment_id = $1, updated_at = NOW()
           WHERE id = ANY($2)`,
          [paymentId, commission_ids]
        );
      } else {
        // Pagar todas las comisiones approved del miembro
        await client.query(
          `UPDATE commissions
           SET status = 'paid', payment_id = $1, updated_at = NOW()
           WHERE member_id = $2 AND status = 'approved'`,
          [paymentId, member_id]
        );
      }

      await client.query('COMMIT');

      res.status(201).json({
        success: true,
        message: 'Pago registrado',
        data: { payment_id: paymentId, amount }
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
};

// Función para crear comisión (usada internamente al completar una orden)
export const createCommissionForOrder = async (orderId, restaurantId) => {
  try {
    // Obtener porcentaje de comisión del restaurante
    const restaurant = await query(
      'SELECT commission_rate FROM restaurants WHERE id = $1',
      [restaurantId]
    );

    if (restaurant.rows.length === 0) return;

    const commissionRate = restaurant.rows[0].commission_rate;

    // Obtener miembros del equipo con su porcentaje
    const members = await query(
      'SELECT id, percentage FROM team_members WHERE is_active = true'
    );

    if (members.rows.length === 0) return;

    // Calcular y crear comisiones
    for (const member of members.rows) {
      const amount = 0; // Se calcula dinámicamente en las consultas

      await query(
        `INSERT INTO commissions (id, member_id, order_id, percentage, amount, status, created_at)
         VALUES ($1, $2, $3, $4, 0, 'pending', NOW())`,
        [uuidv4(), member.id, orderId, member.percentage]
      );
    }
  } catch (error) {
    console.error('Error al crear comisión:', error);
  }
};
