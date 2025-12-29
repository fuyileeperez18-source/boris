import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// Check if in simulated mode
const IS_SIMULATED_MODE = !process.env.MERCADOPAGO_ACCESS_TOKEN && !process.env.WOMPI_PRIVATE_KEY;

// MercadoPago Configuration
const mpClient = process.env.MERCADOPAGO_ACCESS_TOKEN ? new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
  options: { timeout: 5000 }
}) : null;

const mpPreference = mpClient ? new Preference(mpClient) : null;
const mpPayment = mpClient ? new Payment(mpClient) : null;

// Wompi Configuration (para PSE y Nequi en Colombia)
const WOMPI_API_URL = process.env.NODE_ENV === 'production'
  ? 'https://production.wompi.co/v1'
  : 'https://sandbox.wompi.co/v1';
const WOMPI_PUBLIC_KEY = process.env.WOMPI_PUBLIC_KEY;
const WOMPI_PRIVATE_KEY = process.env.WOMPI_PRIVATE_KEY;

// In-memory storage for simulated payments
const simulatedPayments = new Map();

// Helper to generate fake IDs
const generateFakeId = (prefix) => `${prefix}_simulated_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Simulated payment delays (in ms)
const SIMULATED_DELAY = 2000;

class PaymentService {
  constructor() {
    this.currency = 'COP';
    this.webhookUrl = `${process.env.API_URL}/api/payments/webhook`;
  }

  // ==================== MERCADO PAGO ====================

  async createMercadoPagoPreference(order, user) {
    // SIMULATED MODE
    if (IS_SIMULATED_MODE) {
      console.log('🧪 [SIMULATED PAYMENT] Creating MercadoPago preference for order:', order.trackingNumber);

      const preferenceId = generateFakeId('mp_pref');
      const initPoint = `${process.env.CLIENT_URL}/checkout/simulated?preference=${preferenceId}&order=${order.trackingNumber}`;

      simulatedPayments.set(preferenceId, {
        id: preferenceId,
        orderId: order.id,
        trackingNumber: order.trackingNumber,
        amount: order.total,
        status: 'pending',
        provider: 'mercadopago',
        createdAt: Date.now()
      });

      return {
        success: true,
        provider: 'mercadopago',
        preferenceId,
        initPoint,
        sandboxInitPoint: initPoint,
        isSimulated: true
      };
    }

    // REAL MODE
    try {
      const items = order.items.map(item => ({
        id: item.id.toString(),
        title: item.name,
        description: item.description || item.name,
        quantity: item.quantity,
        unit_price: item.price,
        currency_id: this.currency,
      }));

      const preference = await mpPreference.create({
        body: {
          items,
          payer: {
            name: user?.name || order.customerName,
            email: user?.email || '',
            phone: {
              number: order.customerPhone
            }
          },
          back_urls: {
            success: `${process.env.CLIENT_URL}/pedido/${order.trackingNumber}?status=success`,
            failure: `${process.env.CLIENT_URL}/pedido/${order.trackingNumber}?status=failure`,
            pending: `${process.env.CLIENT_URL}/pedido/${order.trackingNumber}?status=pending`
          },
          auto_return: 'approved',
          notification_url: `${this.webhookUrl}/mercadopago`,
          external_reference: order.id.toString(),
          statement_descriptor: 'Mar de Sabores',
          metadata: {
            order_id: order.id,
            tracking_number: order.trackingNumber
          }
        }
      });

      return {
        success: true,
        provider: 'mercadopago',
        preferenceId: preference.id,
        initPoint: preference.init_point,
        sandboxInitPoint: preference.sandbox_init_point
      };
    } catch (error) {
      console.error('MercadoPago preference error:', error);
      throw error;
    }
  }

  async getMercadoPagoPayment(paymentId) {
    try {
      const payment = await mpPayment.get({ id: paymentId });
      return {
        id: payment.id,
        status: payment.status,
        statusDetail: payment.status_detail,
        amount: payment.transaction_amount,
        method: payment.payment_method_id,
        externalReference: payment.external_reference,
        metadata: payment.metadata
      };
    } catch (error) {
      console.error('MercadoPago get payment error:', error);
      throw error;
    }
  }

  async refundMercadoPago(paymentId, amount = null) {
    try {
      const refund = await mpPayment.refund({
        id: paymentId,
        body: amount ? { amount } : {}
      });
      return {
        success: true,
        refundId: refund.id,
        status: refund.status
      };
    } catch (error) {
      console.error('MercadoPago refund error:', error);
      throw error;
    }
  }

  // ==================== WOMPI (PSE & NEQUI) ====================

  async getWompiAcceptanceToken() {
    try {
      const response = await axios.get(
        `${WOMPI_API_URL}/merchants/${WOMPI_PUBLIC_KEY}`
      );
      return response.data.data.presigned_acceptance.acceptance_token;
    } catch (error) {
      console.error('Wompi acceptance token error:', error);
      throw error;
    }
  }

  async createWompiTransaction(order, paymentMethod, additionalData = {}) {
    // SIMULATED MODE
    if (IS_SIMULATED_MODE) {
      console.log(`🧪 [SIMULATED PAYMENT] Creating Wompi ${paymentMethod} transaction for order:`, order.trackingNumber);

      const transactionId = generateFakeId('wompi_tx');
      const redirectUrl = `${process.env.CLIENT_URL}/checkout/simulated?transaction=${transactionId}&order=${order.trackingNumber}&method=${paymentMethod}`;

      simulatedPayments.set(transactionId, {
        id: transactionId,
        orderId: order.id,
        trackingNumber: order.trackingNumber,
        amount: order.total,
        status: 'PENDING',
        provider: 'wompi',
        paymentMethod,
        createdAt: Date.now()
      });

      return {
        success: true,
        provider: 'wompi',
        transactionId,
        status: 'PENDING',
        redirectUrl,
        reference: order.trackingNumber,
        isSimulated: true
      };
    }

    // REAL MODE
    try {
      const acceptanceToken = await this.getWompiAcceptanceToken();

      const transactionData = {
        amount_in_cents: Math.round(order.total * 100),
        currency: this.currency,
        customer_email: additionalData.email || order.customerEmail,
        payment_method: {},
        reference: order.trackingNumber,
        acceptance_token: acceptanceToken,
        redirect_url: `${process.env.CLIENT_URL}/pedido/${order.trackingNumber}`
      };

      // Configure payment method
      if (paymentMethod === 'PSE') {
        transactionData.payment_method = {
          type: 'PSE',
          user_type: additionalData.userType || 0, // 0: Natural, 1: Jurídica
          user_legal_id_type: additionalData.documentType || 'CC',
          user_legal_id: additionalData.documentNumber,
          financial_institution_code: additionalData.bankCode,
          payment_description: `Pedido Mar de Sabores #${order.trackingNumber}`
        };
      } else if (paymentMethod === 'NEQUI') {
        transactionData.payment_method = {
          type: 'NEQUI',
          phone_number: additionalData.phoneNumber || order.customerPhone
        };
      } else if (paymentMethod === 'CARD') {
        transactionData.payment_method = {
          type: 'CARD',
          token: additionalData.cardToken,
          installments: additionalData.installments || 1
        };
      }

      const response = await axios.post(
        `${WOMPI_API_URL}/transactions`,
        transactionData,
        {
          headers: {
            'Authorization': `Bearer ${WOMPI_PRIVATE_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const transaction = response.data.data;

      return {
        success: true,
        provider: 'wompi',
        transactionId: transaction.id,
        status: transaction.status,
        redirectUrl: transaction.payment_method?.extra?.async_payment_url,
        reference: transaction.reference
      };
    } catch (error) {
      console.error('Wompi transaction error:', error.response?.data || error);
      throw error;
    }
  }

  async getWompiTransaction(transactionId) {
    try {
      const response = await axios.get(
        `${WOMPI_API_URL}/transactions/${transactionId}`,
        {
          headers: {
            'Authorization': `Bearer ${WOMPI_PRIVATE_KEY}`
          }
        }
      );

      const transaction = response.data.data;

      return {
        id: transaction.id,
        status: transaction.status,
        amount: transaction.amount_in_cents / 100,
        reference: transaction.reference,
        paymentMethod: transaction.payment_method_type,
        createdAt: transaction.created_at,
        finalizedAt: transaction.finalized_at
      };
    } catch (error) {
      console.error('Wompi get transaction error:', error);
      throw error;
    }
  }

  async getWompiBanks() {
    try {
      const response = await axios.get(
        `${WOMPI_API_URL}/pse/financial_institutions`,
        {
          headers: {
            'Authorization': `Bearer ${WOMPI_PUBLIC_KEY}`
          }
        }
      );

      return response.data.data.map(bank => ({
        code: bank.financial_institution_code,
        name: bank.financial_institution_name
      }));
    } catch (error) {
      console.error('Wompi get banks error:', error);
      throw error;
    }
  }

  async refundWompi(transactionId, amount = null) {
    try {
      const response = await axios.post(
        `${WOMPI_API_URL}/transactions/${transactionId}/void`,
        amount ? { amount_in_cents: Math.round(amount * 100) } : {},
        {
          headers: {
            'Authorization': `Bearer ${WOMPI_PRIVATE_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        status: response.data.data.status
      };
    } catch (error) {
      console.error('Wompi refund error:', error);
      throw error;
    }
  }

  // ==================== UNIFIED INTERFACE ====================

  async createPayment(order, method, additionalData = {}, user = null) {
    switch (method) {
      case 'mercadopago':
      case 'card_mp':
        return await this.createMercadoPagoPreference(order, user);

      case 'pse':
        return await this.createWompiTransaction(order, 'PSE', additionalData);

      case 'nequi':
        return await this.createWompiTransaction(order, 'NEQUI', additionalData);

      case 'card':
        return await this.createWompiTransaction(order, 'CARD', additionalData);

      case 'cash':
        return {
          success: true,
          provider: 'cash',
          message: 'Pago contra entrega',
          status: 'pending'
        };

      default:
        throw new Error(`Payment method ${method} not supported`);
    }
  }

  async getPaymentStatus(provider, paymentId) {
    switch (provider) {
      case 'mercadopago':
        return await this.getMercadoPagoPayment(paymentId);

      case 'wompi':
        return await this.getWompiTransaction(paymentId);

      default:
        throw new Error(`Provider ${provider} not supported`);
    }
  }

  async refund(provider, paymentId, amount = null) {
    switch (provider) {
      case 'mercadopago':
        return await this.refundMercadoPago(paymentId, amount);

      case 'wompi':
        return await this.refundWompi(paymentId, amount);

      default:
        throw new Error(`Provider ${provider} not supported`);
    }
  }

  // Process webhook
  async processWebhook(provider, payload) {
    switch (provider) {
      case 'mercadopago':
        if (payload.type === 'payment') {
          const payment = await this.getMercadoPagoPayment(payload.data.id);
          return {
            provider: 'mercadopago',
            paymentId: payment.id,
            orderId: payment.externalReference,
            status: this.normalizeStatus(payment.status, 'mercadopago'),
            amount: payment.amount,
            rawStatus: payment.status
          };
        }
        break;

      case 'wompi':
        if (payload.event === 'transaction.updated') {
          const transaction = payload.data.transaction;
          return {
            provider: 'wompi',
            paymentId: transaction.id,
            orderId: transaction.reference,
            status: this.normalizeStatus(transaction.status, 'wompi'),
            amount: transaction.amount_in_cents / 100,
            rawStatus: transaction.status
          };
        }
        break;
    }

    return null;
  }

  normalizeStatus(status, provider) {
    const statusMap = {
      mercadopago: {
        approved: 'completed',
        pending: 'pending',
        in_process: 'pending',
        rejected: 'failed',
        refunded: 'refunded',
        cancelled: 'cancelled'
      },
      wompi: {
        APPROVED: 'completed',
        PENDING: 'pending',
        DECLINED: 'failed',
        VOIDED: 'refunded',
        ERROR: 'failed'
      }
    };

    return statusMap[provider]?.[status] || 'unknown';
  }

  // ==================== SIMULATED MODE HELPERS ====================

  isSimulatedMode() {
    return IS_SIMULATED_MODE;
  }

  async confirmSimulatedPayment(paymentId) {
    if (!IS_SIMULATED_MODE) {
      throw new Error('Not in simulated mode');
    }

    const payment = simulatedPayments.get(paymentId);
    if (!payment) {
      throw new Error('Simulated payment not found');
    }

    console.log('✅ [SIMULATED PAYMENT] Confirming payment:', paymentId);

    // Update payment status
    payment.status = payment.provider === 'mercadopago' ? 'approved' : 'APPROVED';
    payment.finalizedAt = Date.now();
    simulatedPayments.set(paymentId, payment);

    return {
      success: true,
      paymentId,
      orderId: payment.orderId,
      trackingNumber: payment.trackingNumber,
      status: this.normalizeStatus(payment.status, payment.provider),
      provider: payment.provider
    };
  }

  getSimulatedPayment(paymentId) {
    return simulatedPayments.get(paymentId);
  }
}

export const paymentService = new PaymentService();
export default paymentService;
