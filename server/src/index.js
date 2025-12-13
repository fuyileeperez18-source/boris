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

// Importar middlewares
import { errorHandler } from './middlewares/errorHandler.js';
import { notFound } from './middlewares/notFound.js';

const app = express();
const httpServer = createServer(app);

// Configuración de CORS para Render + Vercel
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

// En producción, también permitir el dominio de Vercel
if (process.env.NODE_ENV === 'production' && process.env.VERCEL_URL) {
  allowedOrigins.push(`https://${process.env.VERCEL_URL}`);
}

const corsOptions = {
  origin: function (origin, callback) {
    // Permitir requests sin origin (como mobile apps o Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.some(allowed => origin.startsWith(allowed) || allowed.includes(origin))) {
      callback(null, true);
    } else {
      // En desarrollo permitir cualquier origen
      if (process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('No permitido por CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Configurar Socket.io para notificaciones en tiempo real
const io = new Server(httpServer, {
  cors: corsOptions,
  transports: ['websocket', 'polling'],
});

// Middlewares globales
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use(cors(corsOptions));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Trust proxy para Render
app.set('trust proxy', 1);

// Hacer io disponible en las rutas
app.set('io', io);

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    name: '[NOMBRE DE LA PLATAFORMA] API',
    version: '1.0.0',
    status: 'running',
    environment: process.env.NODE_ENV || 'development',
    documentation: '/api/health',
  });
});

// Ruta de health check (importante para Render)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
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

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

// Puerto - Render asigna el puerto automáticamente via PORT
const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS habilitado para: ${allowedOrigins.join(', ')}`);
});

export { app, io };
