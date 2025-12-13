import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database.js';
import { preference, payment } from '../config/mercadopago.js';
import { AppError } from '../middlewares/errorHandler.js';

// Crear preferencia de pago (checkout de Mercado Pago)
export const createPreference = async (req, res, next) => {
  try {
    const { order_id, items, payer } = req.body;

    // Obtener información del pedido
    const orderResult = await query(
      'SELECT * FROM orders WHERE id = $1',
      [order_id]
    );

    if (orderResult.rows.length === 0) {
      throw new AppError('Pedido no encontrado', 404);
    }

    const order = orderResult.rows[0];

    // Crear preferencia en Mercado Pago
    const preferenceData = {
      items: items.map(item => ({
        title: item.title,
        quantity: item.quantity,
        unit_price: item.unit_price,
        currency_id: 'COP'
      })),
      payer: {
        name: payer?.name || order.customer_name,
        email: payer?.email || order.customer_email,
        phone: {
          number: order.customer_phone
        }
      },
      back_urls: {
        success: `${process.env.CLIENT_URL}/pedido/confirmado/${order.tracking_number}`,
        failure: `${process.env.CLIENT_URL}/pedido/error/${order.tracking_number}`,
        pending: `${process.env.CLIENT_URL}/pedido/pendiente/${order.tracking_number}`
      },
      auto_return: 'approved',
      external_reference: order_id,
      notification_url: `${process.env.API_URL || 'https://tudominio.com'}/api/payments/webhook`,
      statement_descriptor: 'DELIVERY PLATFORM'
    };

    const result = await preference.create({ body: preferenceData });

    // Guardar referencia del pago
    await query(
      `INSERT INTO payments (id, order_id, amount, payment_method, mercadopago_preference_id, payment_status, created_at, updated_at)
       VALUES ($1, $2, $3, 'mercadopago', $4, 'pending', NOW(), NOW())`,
      [uuidv4(), order_id, order.total, result.id]
    );

    res.json({
      success: true,
      data: {
        preferenceId: result.id,
        initPoint: result.init_point,
        sandboxInitPoint: result.sandbox_init_point
      }
    });
  } catch (error) {
    console.error('Error creando preferencia:', error);
    next(error);
  }
};

// Webhook de Mercado Pago
export const handleWebhook = async (req, res, next) => {
  try {
    const { type, data } = req.body;

    console.log('Webhook recibido:', type, data);

    if (type === 'payment') {
      const paymentId = data.id;

      // Obtener información del pago desde Mercado Pago
      const paymentInfo = await payment.get({ id: paymentId });

      const orderId = paymentInfo.external_reference;
      const status = paymentInfo.status; // approved, pending, rejected, etc.

      // Actualizar estado del pago
      await query(
        `UPDATE payments
         SET mercadopago_payment_id = $1, payment_status = $2, updated_at = NOW()
         WHERE order_id = $3`,
        [paymentId, status, orderId]
      );

      // Actualizar estado del pedido
      if (status === 'approved') {
        await query(
          `UPDATE orders SET payment_status = 'paid', updated_at = NOW() WHERE id = $1`,
          [orderId]
        );

        // TODO: Notificar al restaurante y al cliente
      } else if (status === 'rejected') {
        await query(
          `UPDATE orders SET payment_status = 'failed', updated_at = NOW() WHERE id = $1`,
          [orderId]
        );
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Error en webhook:', error);
    res.status(200).send('OK'); // Siempre responder 200 para evitar reintentos
  }
};

// Obtener estado de pago
export const getPaymentStatus = async (req, res, next) => {
  try {
    const { paymentId } = req.params;

    const paymentInfo = await payment.get({ id: paymentId });

    res.json({
      success: true,
      data: {
        id: paymentInfo.id,
        status: paymentInfo.status,
        statusDetail: paymentInfo.status_detail,
        amount: paymentInfo.transaction_amount,
        paymentMethod: paymentInfo.payment_method_id
      }
    });
  } catch (error) {
    next(error);
  }
};

// Obtener pagos de un pedido
export const getPaymentsByOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const result = await query(
      'SELECT * FROM payments WHERE order_id = $1 ORDER BY created_at DESC',
      [orderId]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

// Obtener mis pagos
export const getMyPayments = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await query(
      `SELECT p.*, o.tracking_number, o.total as order_total
       FROM payments p
       JOIN orders o ON p.order_id = o.id
       WHERE o.user_id = $1
       ORDER BY p.created_at DESC`,
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

// Solicitar reembolso
export const requestRefund = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const { reason } = req.body;

    // Verificar que el pago existe y pertenece al usuario
    const paymentResult = await query(
      `SELECT p.*, o.user_id
       FROM payments p
       JOIN orders o ON p.order_id = o.id
       WHERE p.id = $1`,
      [paymentId]
    );

    if (paymentResult.rows.length === 0) {
      throw new AppError('Pago no encontrado', 404);
    }

    const paymentRecord = paymentResult.rows[0];

    if (req.user.role !== 'admin' && paymentRecord.user_id !== req.user.id) {
      throw new AppError('No tienes permisos para esta acción', 403);
    }

    // Marcar como solicitud de reembolso pendiente
    await query(
      `UPDATE payments
       SET payment_status = 'refund_requested', refund_reason = $1, updated_at = NOW()
       WHERE id = $2`,
      [reason, paymentId]
    );

    res.json({
      success: true,
      message: 'Solicitud de reembolso enviada'
    });
  } catch (error) {
    next(error);
  }
};

// Obtener todos los pagos (admin)
export const getAllPayments = async (req, res, next) => {
  try {
    const { status, startDate, endDate, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let queryText = `
      SELECT p.*, o.tracking_number, r.name as restaurant_name
      FROM payments p
      JOIN orders o ON p.order_id = o.id
      JOIN restaurants r ON o.restaurant_id = r.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (status) {
      queryText += ` AND p.payment_status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (startDate) {
      queryText += ` AND p.created_at >= $${paramCount}`;
      params.push(startDate);
      paramCount++;
    }

    if (endDate) {
      queryText += ` AND p.created_at <= $${paramCount}`;
      params.push(endDate);
      paramCount++;
    }

    queryText += ` ORDER BY p.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
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

// Estadísticas de pagos (admin)
export const getPaymentStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const stats = await query(
      `SELECT
        COUNT(*) as total_payments,
        COUNT(*) FILTER (WHERE payment_status = 'approved') as approved,
        COUNT(*) FILTER (WHERE payment_status = 'rejected') as rejected,
        COUNT(*) FILTER (WHERE payment_status = 'pending') as pending,
        SUM(amount) FILTER (WHERE payment_status = 'approved') as total_amount,
        AVG(amount) FILTER (WHERE payment_status = 'approved') as avg_amount
       FROM payments
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

// Procesar reembolso manualmente (admin)
export const processRefund = async (req, res, next) => {
  try {
    const { paymentId } = req.params;

    const paymentResult = await query(
      'SELECT * FROM payments WHERE id = $1',
      [paymentId]
    );

    if (paymentResult.rows.length === 0) {
      throw new AppError('Pago no encontrado', 404);
    }

    const paymentRecord = paymentResult.rows[0];

    if (!paymentRecord.mercadopago_payment_id) {
      throw new AppError('No hay ID de pago de Mercado Pago', 400);
    }

    // TODO: Procesar reembolso via API de Mercado Pago
    // const refund = await payment.refund({ payment_id: paymentRecord.mercadopago_payment_id });

    await query(
      `UPDATE payments SET payment_status = 'refunded', updated_at = NOW() WHERE id = $1`,
      [paymentId]
    );

    await query(
      `UPDATE orders SET payment_status = 'refunded', updated_at = NOW() WHERE id = $1`,
      [paymentRecord.order_id]
    );

    res.json({
      success: true,
      message: 'Reembolso procesado'
    });
  } catch (error) {
    next(error);
  }
};
