import { io } from 'socket.io-client';

// URL del socket - usar misma URL que el API pero sin /api
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000');

class SocketService {
  socket = null;

  connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        transports: ['websocket', 'polling'], // Importante para Render
        withCredentials: true,
      });

      this.socket.on('connect', () => {
        console.log('Socket conectado:', this.socket.id);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Socket desconectado:', reason);
      });

      this.socket.on('connect_error', (error) => {
        console.error('Error de conexión socket:', error.message);
        // Si falla websocket, intentar polling
        if (this.socket.io.opts.transports[0] === 'websocket') {
          console.log('Reintentando con polling...');
          this.socket.io.opts.transports = ['polling', 'websocket'];
        }
      });
    }

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Verificar si está conectado
  isConnected() {
    return this.socket?.connected || false;
  }

  // Unirse a sala de restaurante
  joinRestaurant(restaurantId) {
    if (this.socket) {
      this.socket.emit('join-restaurant', restaurantId);
    }
  }

  // Unirse a sala de pedido
  joinOrder(orderId) {
    if (this.socket) {
      this.socket.emit('join-order', orderId);
    }
  }

  // Escuchar nuevos pedidos (para restaurantes)
  onNewOrder(callback) {
    if (this.socket) {
      this.socket.on('new-order', callback);
    }
  }

  // Escuchar actualizaciones de estado de pedido
  onOrderStatusUpdate(callback) {
    if (this.socket) {
      this.socket.on('order-status-update', callback);
    }
  }

  // Escuchar ubicación del domiciliario
  onDeliveryLocation(callback) {
    if (this.socket) {
      this.socket.on('delivery-location', callback);
    }
  }

  // Remover listener
  off(event) {
    if (this.socket) {
      this.socket.off(event);
    }
  }
}

export const socketService = new SocketService();
export default socketService;
