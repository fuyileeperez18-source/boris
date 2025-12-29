import whatsappService from './whatsapp.service.js';
import { query } from '../config/database.js';

// Chatbot conversation states
const conversationStates = new Map();

// Menu data for chatbot
const menuData = {
  ceviches: [
    { id: 1, name: 'Ceviche Clásico', price: 38000, description: 'Corvina fresca marinada en limón' },
    { id: 2, name: 'Ceviche Mixto', price: 48000, description: 'Corvina, camarón y pulpo' },
    { id: 3, name: 'Ceviche de Camarón', price: 45000, description: 'Camarones frescos en limón' },
  ],
  mariscos: [
    { id: 5, name: 'Camarones al Ajillo', price: 55000, description: 'Camarones jumbo en aceite de ajo' },
    { id: 6, name: 'Pulpo a la Parrilla', price: 68000, description: 'Pulpo tierno a la brasa' },
    { id: 8, name: 'Parrillada de Mariscos', price: 125000, description: 'Selección premium para compartir' },
  ],
  langosta: [
    { id: 9, name: 'Langosta al Ajillo', price: 125000, description: 'Media langosta en mantequilla de ajo' },
    { id: 10, name: 'Langosta Thermidor', price: 145000, description: 'Langosta gratinada' },
  ],
  pescados: [
    { id: 12, name: 'Pargo Rojo Frito', price: 75000, description: 'Pargo entero con patacones' },
    { id: 13, name: 'Mojarra Frita', price: 58000, description: 'Mojarra con yuca y arroz' },
  ],
  arroces: [
    { id: 15, name: 'Arroz con Mariscos', price: 65000, description: 'Arroz cremoso con mariscos' },
    { id: 16, name: 'Arroz con Camarones', price: 52000, description: 'Arroz caldoso con camarones' },
  ]
};

class ChatbotService {
  constructor() {
    this.states = conversationStates;
  }

  // Get or create conversation state
  getState(phoneNumber) {
    if (!this.states.has(phoneNumber)) {
      this.states.set(phoneNumber, {
        step: 'initial',
        cart: [],
        orderData: {},
        reservationData: {},
        lastActivity: Date.now()
      });
    }
    const state = this.states.get(phoneNumber);
    state.lastActivity = Date.now();
    return state;
  }

  // Update conversation state
  setState(phoneNumber, updates) {
    const state = this.getState(phoneNumber);
    Object.assign(state, updates);
    this.states.set(phoneNumber, state);
  }

  // Clear old conversations (cleanup)
  clearOldConversations() {
    const oneHour = 60 * 60 * 1000;
    const now = Date.now();

    for (const [phone, state] of this.states.entries()) {
      if (now - state.lastActivity > oneHour) {
        this.states.delete(phone);
      }
    }
  }

  // Process incoming message
  async processMessage(message) {
    const { from, text, buttonId, listId, type } = message;
    const state = this.getState(from);

    try {
      // Handle button/list interactions
      if (buttonId || listId) {
        return await this.handleInteraction(from, buttonId || listId, state);
      }

      // Handle text messages based on current state
      switch (state.step) {
        case 'initial':
          return await this.handleInitial(from, text, state);

        case 'awaiting_order_items':
          return await this.handleOrderItemSelection(from, text, state);

        case 'awaiting_quantity':
          return await this.handleQuantity(from, text, state);

        case 'awaiting_address':
          return await this.handleAddress(from, text, state);

        case 'awaiting_name':
          return await this.handleName(from, text, state);

        case 'awaiting_reservation_date':
          return await this.handleReservationDate(from, text, state);

        case 'awaiting_reservation_time':
          return await this.handleReservationTime(from, text, state);

        case 'awaiting_reservation_guests':
          return await this.handleReservationGuests(from, text, state);

        case 'awaiting_confirmation':
          return await this.handleConfirmation(from, text, state);

        default:
          return await this.handleInitial(from, text, state);
      }
    } catch (error) {
      console.error('Chatbot error:', error);
      await whatsappService.sendTextMessage(from,
        'Lo siento, ocurrió un error. Por favor intenta de nuevo o escribe "menu" para ver las opciones.'
      );
    }
  }

  // Handle initial message
  async handleInitial(from, text, state) {
    const lowerText = text?.toLowerCase() || '';

    // Check for keywords
    if (lowerText.includes('menu') || lowerText.includes('menú') || lowerText.includes('carta')) {
      return await whatsappService.sendMenuOptions(from);
    }

    if (lowerText.includes('pedido') || lowerText.includes('ordenar') || lowerText.includes('pedir')) {
      return await this.startOrder(from, state);
    }

    if (lowerText.includes('reserv')) {
      return await this.startReservation(from, state);
    }

    if (lowerText.includes('horario')) {
      return await whatsappService.sendTextMessage(from,
        '*Horarios de BORIS:*\n\nLunes a Domingo: 11:00 AM - 10:00 PM\nViernes y Sábado: 11:00 AM - 11:00 PM'
      );
    }

    if (lowerText.includes('ubicacion') || lowerText.includes('ubicación') || lowerText.includes('direccion') || lowerText.includes('dirección')) {
      return await whatsappService.sendLocationMessage(
        from,
        10.4236,
        -75.5499,
        'BORIS',
        'Calle del Arsenal #10-43, Centro Histórico, Cartagena'
      );
    }

    if (lowerText.includes('precio') || lowerText.includes('costo')) {
      return await this.sendPriceInfo(from);
    }

    if (lowerText.includes('hola') || lowerText.includes('hi') || lowerText.includes('buenos')) {
      return await whatsappService.sendWelcomeMessage(from, state.orderData?.name);
    }

    if (lowerText.includes('humano') || lowerText.includes('persona') || lowerText.includes('ayuda')) {
      return await this.transferToHuman(from);
    }

    // Default: show menu
    return await whatsappService.sendWelcomeMessage(from);
  }

  // Handle button/list interactions
  async handleInteraction(from, actionId, state) {
    // Menu category selections
    if (actionId.startsWith('menu_')) {
      const category = actionId.replace('menu_', '');
      return await this.sendCategoryMenu(from, category);
    }

    // Order actions
    if (actionId === 'make_order') {
      return await this.startOrder(from, state);
    }

    // Reservation actions
    if (actionId === 'make_reservation') {
      return await this.startReservation(from, state);
    }

    // Track order
    if (actionId.startsWith('track_')) {
      const orderId = actionId.replace('track_', '');
      return await this.trackOrder(from, orderId);
    }

    // Contact human
    if (actionId === 'contact_human' || actionId === 'contact_support') {
      return await this.transferToHuman(from);
    }

    // Add item to cart
    if (actionId.startsWith('add_')) {
      const itemId = parseInt(actionId.replace('add_', ''));
      return await this.addToCart(from, itemId, state);
    }

    // Confirm order
    if (actionId === 'confirm_order') {
      return await this.confirmOrder(from, state);
    }

    // Cancel
    if (actionId === 'cancel') {
      this.setState(from, { step: 'initial', cart: [], orderData: {}, reservationData: {} });
      return await whatsappService.sendTextMessage(from, 'Operación cancelada. ¿En qué más puedo ayudarte?');
    }

    // View cart
    if (actionId === 'view_cart') {
      return await this.sendCartSummary(from, state);
    }

    // Checkout
    if (actionId === 'checkout') {
      return await this.startCheckout(from, state);
    }

    return await whatsappService.sendMenuOptions(from);
  }

  // Send category menu
  async sendCategoryMenu(from, category) {
    const items = menuData[category];

    if (!items || items.length === 0) {
      return await whatsappService.sendTextMessage(from, 'Categoría no disponible.');
    }

    const sections = [{
      title: category.charAt(0).toUpperCase() + category.slice(1),
      rows: items.map(item => ({
        id: `add_${item.id}`,
        title: item.name,
        description: `$${item.price.toLocaleString()} - ${item.description}`
      }))
    }];

    return await whatsappService.sendListMessage(
      from,
      `Menu - ${category.charAt(0).toUpperCase() + category.slice(1)}`,
      'Selecciona un plato para agregarlo a tu pedido:',
      'Ver Platos',
      sections
    );
  }

  // Start order process
  async startOrder(from, state) {
    this.setState(from, { step: 'awaiting_order_items', cart: [] });

    return await whatsappService.sendListMessage(
      from,
      'Hacer Pedido',
      '¿Qué te gustaría ordenar hoy? Selecciona una categoría:',
      'Ver Categorías',
      [{
        title: 'Categorías',
        rows: [
          { id: 'menu_ceviches', title: 'Ceviches', description: 'Frescos del mar' },
          { id: 'menu_mariscos', title: 'Mariscos', description: 'Camarones, pulpo y más' },
          { id: 'menu_langosta', title: 'Langosta', description: 'Platos premium' },
          { id: 'menu_pescados', title: 'Pescados', description: 'Del día' },
          { id: 'menu_arroces', title: 'Arroces', description: 'Con mariscos' }
        ]
      }]
    );
  }

  // Add item to cart
  async addToCart(from, itemId, state) {
    // Find item in menu
    let item = null;
    for (const category of Object.values(menuData)) {
      item = category.find(i => i.id === itemId);
      if (item) break;
    }

    if (!item) {
      return await whatsappService.sendTextMessage(from, 'Producto no encontrado.');
    }

    // Add to cart
    const cart = state.cart || [];
    const existingItem = cart.find(i => i.id === itemId);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...item, quantity: 1 });
    }

    this.setState(from, { cart });

    const total = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);

    await whatsappService.sendTextMessage(from,
      `${item.name} agregado al carrito.\n\n*Total actual:* $${total.toLocaleString()}`
    );

    return await whatsappService.sendButtonMessage(
      from,
      '¿Qué deseas hacer?',
      [
        { id: 'view_cart', title: 'Ver Carrito' },
        { id: 'make_order', title: 'Agregar Más' },
        { id: 'checkout', title: 'Finalizar Pedido' }
      ]
    );
  }

  // Send cart summary
  async sendCartSummary(from, state) {
    const cart = state.cart || [];

    if (cart.length === 0) {
      return await whatsappService.sendTextMessage(from, 'Tu carrito está vacío.');
    }

    const itemsList = cart.map(item =>
      `${item.quantity}x ${item.name}: $${(item.price * item.quantity).toLocaleString()}`
    ).join('\n');

    const total = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);

    await whatsappService.sendTextMessage(from,
      `*Tu Carrito:*\n\n${itemsList}\n\n*Total:* $${total.toLocaleString()}`
    );

    return await whatsappService.sendButtonMessage(
      from,
      '¿Qué deseas hacer?',
      [
        { id: 'checkout', title: 'Finalizar Pedido' },
        { id: 'make_order', title: 'Agregar Más' },
        { id: 'cancel', title: 'Cancelar' }
      ]
    );
  }

  // Start checkout
  async startCheckout(from, state) {
    const cart = state.cart || [];

    if (cart.length === 0) {
      return await whatsappService.sendTextMessage(from, 'Tu carrito está vacío. Agrega productos primero.');
    }

    this.setState(from, { step: 'awaiting_name' });

    return await whatsappService.sendTextMessage(from,
      'Para finalizar tu pedido, necesito algunos datos.\n\n¿Cuál es tu nombre completo?'
    );
  }

  // Handle name input
  async handleName(from, text, state) {
    if (!text || text.length < 2) {
      return await whatsappService.sendTextMessage(from, 'Por favor ingresa un nombre válido.');
    }

    this.setState(from, {
      step: 'awaiting_address',
      orderData: { ...state.orderData, name: text }
    });

    return await whatsappService.sendTextMessage(from,
      `Gracias ${text}.\n\n¿Cuál es la dirección de entrega? (Incluye barrio y referencias)`
    );
  }

  // Handle address input
  async handleAddress(from, text, state) {
    if (!text || text.length < 10) {
      return await whatsappService.sendTextMessage(from, 'Por favor ingresa una dirección completa.');
    }

    this.setState(from, {
      step: 'awaiting_confirmation',
      orderData: { ...state.orderData, address: text }
    });

    // Show order summary
    const cart = state.cart || [];
    const subtotal = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    const deliveryFee = 8000;
    const total = subtotal + deliveryFee;

    const itemsList = cart.map(item =>
      `${item.quantity}x ${item.name}: $${(item.price * item.quantity).toLocaleString()}`
    ).join('\n');

    await whatsappService.sendTextMessage(from,
      `*Resumen de tu Pedido:*\n\n*Nombre:* ${state.orderData.name}\n*Dirección:* ${text}\n\n${itemsList}\n\n*Subtotal:* $${subtotal.toLocaleString()}\n*Envío:* $${deliveryFee.toLocaleString()}\n*Total:* $${total.toLocaleString()}`
    );

    return await whatsappService.sendButtonMessage(
      from,
      '¿Confirmas tu pedido?',
      [
        { id: 'confirm_order', title: 'Confirmar' },
        { id: 'cancel', title: 'Cancelar' }
      ]
    );
  }

  // Confirm order
  async confirmOrder(from, state) {
    const cart = state.cart || [];
    const subtotal = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    const deliveryFee = 8000;
    const total = subtotal + deliveryFee;
    const trackingNumber = 'MDS-' + Date.now().toString().slice(-6);

    // Here you would save to database
    // const order = await orderService.create({ ... });

    // Clear cart
    this.setState(from, {
      step: 'initial',
      cart: [],
      orderData: {}
    });

    await whatsappService.sendTextMessage(from,
      `*¡Pedido Confirmado!*\n\nNúmero de seguimiento: *${trackingNumber}*\n\nTiempo estimado: 30-45 minutos\n\nGracias por tu pedido, ${state.orderData.name}. Te notificaremos cuando esté en camino.`
    );

    return await whatsappService.sendButtonMessage(
      from,
      '¿Necesitas algo más?',
      [
        { id: `track_${trackingNumber}`, title: 'Ver Estado' },
        { id: 'make_order', title: 'Nuevo Pedido' }
      ]
    );
  }

  // Start reservation
  async startReservation(from, state) {
    this.setState(from, { step: 'awaiting_reservation_date', reservationData: {} });

    return await whatsappService.sendTextMessage(from,
      '¡Genial! Vamos a reservar tu mesa.\n\n¿Para qué fecha deseas la reserva?\n(Ejemplo: 25 de diciembre, mañana, viernes)'
    );
  }

  // Handle reservation date
  async handleReservationDate(from, text, state) {
    // Parse date (simplified)
    this.setState(from, {
      step: 'awaiting_reservation_time',
      reservationData: { ...state.reservationData, date: text }
    });

    return await whatsappService.sendTextMessage(from,
      `Fecha: ${text}\n\n¿A qué hora? (Horario: 11:00 AM - 10:00 PM)`
    );
  }

  // Handle reservation time
  async handleReservationTime(from, text, state) {
    this.setState(from, {
      step: 'awaiting_reservation_guests',
      reservationData: { ...state.reservationData, time: text }
    });

    return await whatsappService.sendTextMessage(from,
      `Hora: ${text}\n\n¿Para cuántas personas?`
    );
  }

  // Handle reservation guests
  async handleReservationGuests(from, text, state) {
    const guests = parseInt(text);

    if (isNaN(guests) || guests < 1 || guests > 20) {
      return await whatsappService.sendTextMessage(from,
        'Por favor ingresa un número válido de personas (1-20).'
      );
    }

    this.setState(from, {
      step: 'awaiting_name',
      reservationData: { ...state.reservationData, guests: guests }
    });

    return await whatsappService.sendTextMessage(from,
      `Personas: ${guests}\n\n¿A nombre de quién es la reserva?`
    );
  }

  // Transfer to human
  async transferToHuman(from) {
    await whatsappService.sendTextMessage(from,
      'Un miembro de nuestro equipo se pondrá en contacto contigo pronto.\n\nTambién puedes llamarnos al +57 300 123 4567\n\nHorario de atención: 11:00 AM - 10:00 PM'
    );

    // Here you would notify staff about the request
    // await notificationService.notifyStaff({ type: 'human_requested', from });

    return true;
  }

  // Track order
  async trackOrder(from, trackingNumber) {
    // Here you would query the database
    // const order = await orderService.findByTrackingNumber(trackingNumber);

    // Mock response
    return await whatsappService.sendTextMessage(from,
      `*Estado del Pedido ${trackingNumber}*\n\nEstado: En preparación\nTiempo estimado: 25-35 minutos\n\nTe notificaremos cuando esté en camino.`
    );
  }

  // Send price info
  async sendPriceInfo(from) {
    return await whatsappService.sendTextMessage(from,
      `*Rangos de Precios - BORIS*\n\nCeviches: $38,000 - $48,000\nMariscos: $42,000 - $125,000\nLangosta: $125,000 - $145,000\nPescados: $58,000 - $75,000\nArroces: $48,000 - $65,000\n\nEnvío: $8,000 (Cartagena)\n\n¿Te gustaría ver el menú completo?`
    );
  }
}

export const chatbotService = new ChatbotService();
export default chatbotService;
