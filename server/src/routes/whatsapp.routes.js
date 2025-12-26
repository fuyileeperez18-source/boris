import express from 'express';
import whatsappService from '../services/whatsapp.service.js';
import chatbotService from '../services/chatbot.service.js';

const router = express.Router();

// Webhook verification (GET)
router.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const result = whatsappService.verifyWebhook(mode, token, challenge);

  if (result) {
    console.log('WhatsApp webhook verified');
    res.status(200).send(result);
  } else {
    console.log('WhatsApp webhook verification failed');
    res.sendStatus(403);
  }
});

// Webhook messages (POST)
router.post('/webhook', async (req, res) => {
  try {
    // Always respond quickly to avoid timeout
    res.sendStatus(200);

    const body = req.body;

    // Verify it's a WhatsApp message
    if (body.object !== 'whatsapp_business_account') {
      return;
    }

    // Process the message
    const message = whatsappService.processWebhook(body);

    if (!message) {
      return;
    }

    console.log('Received WhatsApp message:', {
      from: message.from,
      type: message.type,
      text: message.text || message.buttonId || message.listId
    });

    // Mark as read
    await whatsappService.markAsRead(message.messageId);

    // Process with chatbot
    await chatbotService.processMessage(message);

  } catch (error) {
    console.error('WhatsApp webhook error:', error);
  }
});

// Send message endpoint (for testing/admin)
router.post('/send', async (req, res) => {
  try {
    const { to, message, type = 'text' } = req.body;

    if (!to || !message) {
      return res.status(400).json({ error: 'Missing required fields: to, message' });
    }

    let result;

    switch (type) {
      case 'text':
        result = await whatsappService.sendTextMessage(to, message);
        break;
      case 'template':
        result = await whatsappService.sendTemplateMessage(to, message.template, message.language);
        break;
      default:
        result = await whatsappService.sendTextMessage(to, message);
    }

    res.json({ success: true, result });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Send order confirmation
router.post('/send-order-confirmation', async (req, res) => {
  try {
    const { phone, order } = req.body;

    if (!phone || !order) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await whatsappService.sendOrderConfirmation(phone, order);

    res.json({ success: true });
  } catch (error) {
    console.error('Send order confirmation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Send order status update
router.post('/send-order-status', async (req, res) => {
  try {
    const { phone, order, status } = req.body;

    if (!phone || !order || !status) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await whatsappService.sendOrderStatusUpdate(phone, order, status);

    res.json({ success: true });
  } catch (error) {
    console.error('Send order status error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Send reservation confirmation
router.post('/send-reservation-confirmation', async (req, res) => {
  try {
    const { phone, reservation } = req.body;

    if (!phone || !reservation) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await whatsappService.sendReservationConfirmation(phone, reservation);

    res.json({ success: true });
  } catch (error) {
    console.error('Send reservation confirmation error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
