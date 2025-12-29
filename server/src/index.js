import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Importar rutas
import authRoutes from './routes/auth.routes.js';
import restaurantRoutes from './routes/restaurant.routes.js';
import menuRoutes from './routes/menu.routes.js';
import reservationRoutes from './routes/reservation.routes.js';
import orderRoutes from './routes/order.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import userRoutes from './routes/user.routes.js';
import deliveryRoutes from './routes/delivery.routes.js';
import adminRoutes from './routes/admin.routes.js';
import whatsappRoutes from './routes/whatsapp.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import reviewRoutes from './routes/review.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import wishlistRoutes from './routes/wishlist.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import commissionRoutes from './routes/commission.routes.js';

// Importar middlewares
import { errorHandler } from './middlewares/errorHandler.js';
import { notFound } from './middlewares/notFound.js';

const app = express();
const httpServer = createServer(app);

// Configuración de CORS para Railway + Vercel
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'https://mardesabores.com',
  'https://www.mardesabores.com',
].filter(Boolean);

// En producción, también permitir el dominio de Vercel
if (process.env.NODE_ENV === 'production') {
  if (process.env.VERCEL_URL) {
    allowedOrigins.push(`https://${process.env.VERCEL_URL}`);
  }
  // Permitir todos los subdominios de vercel.app
  allowedOrigins.push(/\.vercel\.app$/);
}

const corsOptions = {
  origin: function (origin, callback) {
    // Permitir requests sin origin (como mobile apps o Postman)
    if (!origin) return callback(null, true);

    // Check regex patterns
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return origin.startsWith(allowed) || allowed.includes(origin);
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      // En desarrollo permitir cualquier origen
      if (process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        console.warn('CORS blocked origin:', origin);
        callback(new Error('No permitido por CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

// Configurar Socket.io para notificaciones en tiempo real
const io = new Server(httpServer, {
  cors: corsOptions,
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Middlewares globales
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false,
}));
app.use(cors(corsOptions));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Trust proxy para Railway
app.set('trust proxy', 1);

// Hacer io disponible en las rutas
app.set('io', io);

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    name: 'BORIS API',
    version: '2.0.0',
    status: 'running',
    environment: process.env.NODE_ENV || 'development',
    documentation: '/api/health',
    features: [
      'WhatsApp Business API Integration',
      'Chatbot Conversacional',
      'Reservas en Tiempo Real',
      'Tracking de Pedidos',
      'Múltiples Pasarelas de Pago',
      'Analytics Dashboard'
    ]
  });
});

// Ruta de health check (importante para Railway)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/commissions', commissionRoutes);

// Manejo de rutas no encontradas
app.use(notFound);

// Manejo global de errores
app.use(errorHandler);

// Configuración de Socket.io
io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);

  // Unirse a sala de restaurante específico
  socket.on('join-restaurant', (restaurantId) => {
    socket.join(`restaurant-${restaurantId}`);
    console.log(`Socket ${socket.id} unido a restaurant-${restaurantId}`);
  });

  // Unirse a sala de pedido específico (para tracking)
  socket.on('join-order', (orderId) => {
    socket.join(`order-${orderId}`);
    console.log(`Socket ${socket.id} unido a order-${orderId}`);
  });

  // Unirse a sala de admin
  socket.on('join-admin', () => {
    socket.join('admin-dashboard');
    console.log(`Socket ${socket.id} unido a admin-dashboard`);
  });

  // Unirse a sala de delivery
  socket.on('join-delivery', (deliveryId) => {
    socket.join(`delivery-${deliveryId}`);
    console.log(`Socket ${socket.id} unido a delivery-${deliveryId}`);
  });

  // Unirse a sala de usuario (para notificaciones)
  socket.on('join-user', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`Socket ${socket.id} unido a user-${userId}`);
  });

  // Actualización de ubicación de domiciliario
  socket.on('delivery-location-update', (data) => {
    const { orderId, location } = data;
    io.to(`order-${orderId}`).emit('delivery-location', location);
  });

  // Unirse a sala de chat
  socket.on('join-chat', (conversationId) => {
    socket.join(`chat-${conversationId}`);
    console.log(`Socket ${socket.id} unido a chat-${conversationId}`);
  });

  // Enviar mensaje de chat
  socket.on('chat-message', (data) => {
    io.to(`chat-${data.conversationId}`).emit('new-message', data.message);
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

// Funciones helper para emitir eventos
export const emitOrderUpdate = (orderId, data) => {
  io.to(`order-${orderId}`).emit('order-updated', data);
};

export const emitNewOrder = (restaurantId, order) => {
  io.to(`restaurant-${restaurantId}`).emit('new-order', order);
  io.to('admin-dashboard').emit('new-order', order);
};

export const emitReservationUpdate = (restaurantId, reservation) => {
  io.to(`restaurant-${restaurantId}`).emit('reservation-updated', reservation);
};

// Puerto - Railway asigna el puerto automáticamente via PORT
const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS habilitado`);
  console.log(`📱 WhatsApp webhook: /api/whatsapp/webhook`);
});

export { app, io };
