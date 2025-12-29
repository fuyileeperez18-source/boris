import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const WHATSAPP_API_URL = 'https://graph.facebook.com/v18.0';
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

class WhatsAppService {
  constructor() {
    this.apiUrl = WHATSAPP_API_URL;
    this.phoneId = WHATSAPP_PHONE_ID;
    this.token = WHATSAPP_TOKEN;
    this.verifyToken = WHATSAPP_VERIFY_TOKEN;
  }

  // Verify webhook
  verifyWebhook(mode, token, challenge) {
    if (mode === 'subscribe' && token === this.verifyToken) {
      return challenge;
    }
    return null;
  }

  // Send text message
  async sendTextMessage(to, text) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/${this.phoneId}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: to,
          type: 'text',
          text: { body: text }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('WhatsApp send message error:', error.response?.data || error.message);
      throw error;
    }
  }

  // Send template message
  async sendTemplateMessage(to, templateName, languageCode = 'es', components = []) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/${this.phoneId}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: to,
          type: 'template',
          template: {
            name: templateName,
            language: { code: languageCode },
            components: components
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('WhatsApp send template error:', error.response?.data || error.message);
      throw error;
    }
  }

  // Send interactive message with buttons
  async sendButtonMessage(to, bodyText, buttons) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/${this.phoneId}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: to,
          type: 'interactive',
          interactive: {
            type: 'button',
            body: { text: bodyText },
            action: {
              buttons: buttons.map((btn, index) => ({
                type: 'reply',
                reply: {
                  id: btn.id || `btn_${index}`,
                  title: btn.title.substring(0, 20)
                }
              }))
            }
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('WhatsApp send button message error:', error.response?.data || error.message);
      throw error;
    }
  }

  // Send interactive list message
  async sendListMessage(to, headerText, bodyText, buttonText, sections) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/${this.phoneId}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: to,
          type: 'interactive',
          interactive: {
            type: 'list',
            header: { type: 'text', text: headerText },
            body: { text: bodyText },
            action: {
              button: buttonText,
              sections: sections.map(section => ({
                title: section.title,
                rows: section.rows.map(row => ({
                  id: row.id,
                  title: row.title.substring(0, 24),
                  description: row.description?.substring(0, 72)
                }))
              }))
            }
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('WhatsApp send list error:', error.response?.data || error.message);
      throw error;
    }
  }

  // Send image message
  async sendImageMessage(to, imageUrl, caption = '') {
    try {
      const response = await axios.post(
        `${this.apiUrl}/${this.phoneId}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: to,
          type: 'image',
          image: {
            link: imageUrl,
            caption: caption
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('WhatsApp send image error:', error.response?.data || error.message);
      throw error;
    }
  }

  // Send location message
  async sendLocationMessage(to, latitude, longitude, name, address) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/${this.phoneId}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: to,
          type: 'location',
          location: {
            latitude: latitude,
            longitude: longitude,
            name: name,
            address: address
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('WhatsApp send location error:', error.response?.data || error.message);
      throw error;
    }
  }

  // Mark message as read
  async markAsRead(messageId) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/${this.phoneId}/messages`,
        {
          messaging_product: 'whatsapp',
          status: 'read',
          message_id: messageId
        },
        {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('WhatsApp mark as read error:', error.response?.data || error.message);
      throw error;
    }
  }

  // Process incoming webhook
  processWebhook(body) {
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    if (!value) return null;

    const message = value.messages?.[0];
    const contact = value.contacts?.[0];

    if (!message) return null;

    const result = {
      messageId: message.id,
      from: message.from,
      timestamp: message.timestamp,
      contactName: contact?.profile?.name,
      type: message.type
    };

    switch (message.type) {
      case 'text':
        result.text = message.text?.body;
        break;
      case 'interactive':
        if (message.interactive?.type === 'button_reply') {
          result.buttonId = message.interactive.button_reply?.id;
          result.buttonText = message.interactive.button_reply?.title;
        } else if (message.interactive?.type === 'list_reply') {
          result.listId = message.interactive.list_reply?.id;
          result.listTitle = message.interactive.list_reply?.title;
        }
        break;
      case 'location':
        result.location = {
          latitude: message.location?.latitude,
          longitude: message.location?.longitude,
          name: message.location?.name,
          address: message.location?.address
        };
        break;
      case 'image':
      case 'document':
      case 'audio':
      case 'video':
        result.mediaId = message[message.type]?.id;
        result.mimeType = message[message.type]?.mime_type;
        break;
    }

    return result;
  }

  // Restaurant specific messages

  // Send order confirmation
  async sendOrderConfirmation(to, order) {
    const itemsList = order.items.map(item =>
      `- ${item.quantity}x ${item.name}: $${item.price.toLocaleString()}`
    ).join('\n');

    const message = `*Confirmación de Pedido - BORIS*

Pedido #${order.trackingNumber}

${itemsList}

*Subtotal:* $${order.subtotal.toLocaleString()}
*Envío:* $${order.deliveryFee.toLocaleString()}
*Total:* $${order.total.toLocaleString()}

${order.deliveryType === 'delivery'
  ? `*Dirección de entrega:*\n${order.deliveryAddress}`
  : '*Tipo:* Recoger en restaurante'}

Tiempo estimado: ${order.estimatedTime} min

Gracias por tu pedido!`;

    await this.sendTextMessage(to, message);

    // Send tracking button
    await this.sendButtonMessage(
      to,
      '¿Deseas hacer seguimiento a tu pedido?',
      [
        { id: `track_${order.id}`, title: 'Ver Estado' },
        { id: 'contact_support', title: 'Contactar Soporte' }
      ]
    );
  }

  // Send order status update
  async sendOrderStatusUpdate(to, order, status) {
    const statusMessages = {
      'confirmed': 'Tu pedido ha sido confirmado y está siendo preparado.',
      'preparing': 'El chef está preparando tu delicioso pedido.',
      'ready': 'Tu pedido está listo.',
      'on_the_way': 'Tu pedido está en camino. ¡Casi llega!',
      'delivered': 'Tu pedido ha sido entregado. ¡Buen provecho!',
      'cancelled': 'Tu pedido ha sido cancelado.'
    };

    const message = `*Actualización de Pedido #${order.trackingNumber}*

${statusMessages[status] || `Estado: ${status}`}

${status === 'on_the_way' && order.driverPhone
  ? `Contacto del domiciliario: ${order.driverPhone}`
  : ''}`;

    return this.sendTextMessage(to, message);
  }

  // Send reservation confirmation
  async sendReservationConfirmation(to, reservation) {
    const message = `*Confirmación de Reserva - BORIS*

Tu reserva ha sido confirmada.

*Código:* ${reservation.code}
*Fecha:* ${reservation.date}
*Hora:* ${reservation.time}
*Personas:* ${reservation.guests}

*Ubicación:*
Calle del Arsenal #10-43
Centro Histórico, Cartagena

Te esperamos!

_Si necesitas modificar o cancelar tu reserva, responde a este mensaje._`;

    await this.sendTextMessage(to, message);

    // Send location
    await this.sendLocationMessage(
      to,
      10.4236,
      -75.5499,
      'BORIS',
      'Calle del Arsenal #10-43, Centro Histórico, Cartagena'
    );
  }

  // Send menu
  async sendMenuOptions(to) {
    const sections = [
      {
        title: 'Categorías',
        rows: [
          { id: 'menu_ceviches', title: 'Ceviches', description: 'Frescos del mar' },
          { id: 'menu_mariscos', title: 'Mariscos', description: 'Camarones, pulpo y más' },
          { id: 'menu_langosta', title: 'Langosta', description: 'Platos premium' },
          { id: 'menu_pescados', title: 'Pescados', description: 'Del día' },
          { id: 'menu_arroces', title: 'Arroces', description: 'Con mariscos' }
        ]
      },
      {
        title: 'Acciones',
        rows: [
          { id: 'make_order', title: 'Hacer Pedido', description: 'Ordena para delivery' },
          { id: 'make_reservation', title: 'Reservar Mesa', description: 'En restaurante' },
          { id: 'contact_human', title: 'Hablar con Alguien', description: 'Atención personalizada' }
        ]
      }
    ];

    return this.sendListMessage(
      to,
      'BORIS',
      '¡Bienvenido! ¿Qué deseas hacer hoy?',
      'Ver Opciones',
      sections
    );
  }

  // Send welcome message
  async sendWelcomeMessage(to, name) {
    const message = `¡Hola${name ? ` ${name}` : ''}!

Bienvenido a *BORIS*, el mejor restaurante de mariscos de Cartagena.

¿En qué podemos ayudarte?`;

    await this.sendTextMessage(to, message);
    await this.sendMenuOptions(to);
  }
}

export const whatsappService = new WhatsAppService();
export default whatsappService;
