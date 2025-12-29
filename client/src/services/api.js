import axios from 'axios';

// URL del API - En producción usar la variable de entorno de Vercel
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Crear instancia de axios con configuración para producción
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Importante para CORS con cookies
  timeout: 30000, // 30 segundos timeout
});

// Interceptor para agregar token a las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si el token expiró, intentar refrescarlo
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh-token`, {
            refreshToken,
          });

          const { accessToken } = response.data.data;
          localStorage.setItem('accessToken', accessToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Si falla el refresh, limpiar tokens y redirigir a login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }

    // Manejo de errores de red/servidor caído
    if (!error.response) {
      console.error('Error de red o servidor no disponible');
    }

    return Promise.reject(error);
  }
);

export default api;

// ===== Servicios de Autenticación =====
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/me', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

// ===== Servicios de Restaurantes =====
export const restaurantService = {
  getAll: (params) => api.get('/restaurants', { params }),
  getBySlug: (slug) => api.get(`/restaurants/${slug}`),
  getById: (id) => api.get(`/restaurants/id/${id}`),
  create: (data) => api.post('/restaurants', data),
  update: (id, data) => api.put(`/restaurants/${id}`, data),
  delete: (id) => api.delete(`/restaurants/${id}`),
  getStats: (id, params) => api.get(`/restaurants/${id}/stats`, { params }),
};

// ===== Servicios de Menú =====
export const menuService = {
  getFullMenu: (restaurantId) => api.get(`/menu/restaurant/${restaurantId}`),
  getCategories: (restaurantId) => api.get(`/menu/restaurant/${restaurantId}/categories`),
  getProductsByCategory: (categoryId) => api.get(`/menu/category/${categoryId}/products`),
  getProduct: (productId) => api.get(`/menu/product/${productId}`),
  getFeaturedProducts: (restaurantId) => api.get(`/menu/restaurant/${restaurantId}/featured`),
  searchProducts: (restaurantId, query) => api.get(`/menu/restaurant/${restaurantId}/search`, { params: { q: query } }),

  // Categorías (requiere auth)
  createCategory: (restaurantId, data) => api.post(`/menu/restaurant/${restaurantId}/categories`, data),
  updateCategory: (categoryId, data) => api.put(`/menu/category/${categoryId}`, data),
  deleteCategory: (categoryId) => api.delete(`/menu/category/${categoryId}`),

  // Productos (requiere auth)
  createProduct: (restaurantId, data) => api.post(`/menu/restaurant/${restaurantId}/products`, data),
  updateProduct: (productId, data) => api.put(`/menu/product/${productId}`, data),
  deleteProduct: (productId) => api.delete(`/menu/product/${productId}`),
  toggleAvailability: (productId) => api.patch(`/menu/product/${productId}/availability`),
  toggleFeatured: (productId) => api.patch(`/menu/product/${productId}/featured`),
};

// ===== Servicios de Reservas =====
export const reservationService = {
  create: (data) => api.post('/reservations', data),
  checkAvailability: (restaurantId, params) => api.get(`/reservations/availability/${restaurantId}`, { params }),
  getByCode: (code) => api.get(`/reservations/code/${code}`),
  getMyReservations: () => api.get('/reservations/my-reservations'),
  cancelMy: (id) => api.put(`/reservations/${id}/cancel`),

  // Para restaurantes
  getRestaurantReservations: (restaurantId, params) => api.get(`/reservations/restaurant/${restaurantId}`, { params }),
  getByDate: (restaurantId, date) => api.get(`/reservations/restaurant/${restaurantId}/date/${date}`),
  updateStatus: (id, status) => api.put(`/reservations/${id}/status`, { status }),
  getById: (id) => api.get(`/reservations/${id}`),
};

// ===== Servicios de Pedidos =====
export const orderService = {
  create: (data) => api.post('/orders', data),
  track: (trackingNumber) => api.get(`/orders/track/${trackingNumber}`),
  calculateDelivery: (data) => api.post('/orders/calculate-delivery', data),
  getMyOrders: (params) => api.get('/orders/my-orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  cancel: (id) => api.put(`/orders/${id}/cancel`),

  // Para restaurantes
  getRestaurantOrders: (restaurantId, params) => api.get(`/orders/restaurant/${restaurantId}`, { params }),
  getActiveOrders: (restaurantId) => api.get(`/orders/restaurant/${restaurantId}/active`),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
  getHistory: (restaurantId, params) => api.get(`/orders/restaurant/${restaurantId}/history`, { params }),
};

// ===== Servicios de Pagos =====
export const paymentService = {
  createPreference: (data) => api.post('/payments/create-preference', data),
  getStatus: (paymentId) => api.get(`/payments/status/${paymentId}`),
  getByOrder: (orderId) => api.get(`/payments/order/${orderId}`),
  getMyPayments: () => api.get('/payments/my-payments'),
  requestRefund: (paymentId, reason) => api.post(`/payments/${paymentId}/refund`, { reason }),
};

// ===== Servicios de Usuario =====
export const userService = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getAddresses: () => api.get('/users/addresses'),
  addAddress: (data) => api.post('/users/addresses', data),
  deleteAddress: (id) => api.delete(`/users/addresses/${id}`),
  getOrderHistory: (params) => api.get('/users/order-history', { params }),
  getReservationHistory: (params) => api.get('/users/reservation-history', { params }),
  getFavorites: () => api.get('/users/favorites'),
  addFavorite: (restaurantId) => api.post(`/users/favorites/${restaurantId}`),
  removeFavorite: (restaurantId) => api.delete(`/users/favorites/${restaurantId}`),
};

// ===== Servicios de Delivery =====
export const deliveryService = {
  register: (data) => api.post('/delivery/register', data),
  getProfile: () => api.get('/delivery/profile'),
  updateLocation: (data) => api.put('/delivery/location', data),
  toggleAvailability: () => api.put('/delivery/availability'),
  getAssignedOrders: () => api.get('/delivery/my-orders'),
  getCurrentOrder: () => api.get('/delivery/current-order'),
  acceptOrder: (orderId) => api.put(`/delivery/orders/${orderId}/accept`),
  rejectOrder: (orderId, reason) => api.put(`/delivery/orders/${orderId}/reject`, { reason }),
  markAsPickedUp: (orderId) => api.put(`/delivery/orders/${orderId}/picked-up`),
  markAsDelivered: (orderId) => api.put(`/delivery/orders/${orderId}/delivered`),
  getHistory: (params) => api.get('/delivery/history', { params }),
  getEarnings: (params) => api.get('/delivery/earnings', { params }),
};

// ===== Servicios de Admin =====
export const adminService = {
  getDashboard: () => api.get('/admin/dashboard'),
  getRealtimeStats: () => api.get('/admin/realtime-stats'),
  getRevenueReport: (params) => api.get('/admin/reports/revenue', { params }),
  getOrdersReport: (params) => api.get('/admin/reports/orders', { params }),
  getRestaurantsReport: () => api.get('/admin/reports/restaurants'),
  getUsersReport: () => api.get('/admin/reports/users'),
  getDeliveryReport: () => api.get('/admin/reports/delivery'),
  getPlatformConfig: () => api.get('/admin/config'),
  updatePlatformConfig: (data) => api.put('/admin/config', data),
  updateCommissions: (data) => api.put('/admin/config/commissions', data),
  getPendingRestaurants: () => api.get('/admin/restaurants/pending'),
  approveRestaurant: (id) => api.put(`/admin/restaurants/${id}/approve`),
  rejectRestaurant: (id, reason) => api.put(`/admin/restaurants/${id}/reject`, { reason }),
  suspendRestaurant: (id, reason) => api.put(`/admin/restaurants/${id}/suspend`, { reason }),
};

// ===== Servicios de Reseñas =====
export const reviewService = {
  getProductReviews: (productId, params) => api.get(`/reviews/product/${productId}`, { params }),
  getProductRatingSummary: (productId) => api.get(`/reviews/product/${productId}/rating-summary`),
  getMyReviews: () => api.get('/reviews/my-reviews'),
  createReview: (data) => api.post('/reviews', data),
  updateReview: (reviewId, data) => api.put(`/reviews/${reviewId}`, data),
  deleteReview: (reviewId) => api.delete(`/reviews/${reviewId}`),
  getAllReviews: (params) => api.get('/reviews', { params }),
  moderateReview: (reviewId, status) => api.patch(`/reviews/${reviewId}/status`, { status }),
};

// ===== Servicios de Upload =====
export const uploadService = {
  uploadImage: (file, folder = 'boris') => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', folder);
    return api.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadMultipleImages: (files, folder = 'boris') => {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));
    formData.append('folder', folder);
    return api.post('/upload/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadProductImage: (productId, file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post(`/upload/product/${productId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteImage: (publicId) => api.delete(`/upload/image/${publicId}`),
};

// ===== Servicios de Notificaciones =====
export const notificationService = {
  getMyNotifications: (params) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (notificationId) => api.patch(`/notifications/${notificationId}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
  deleteNotification: (notificationId) => api.delete(`/notifications/${notificationId}`),
  clearAll: () => api.delete('/notifications'),
};

// ===== Servicios de Wishlist =====
export const wishlistService = {
  getMyWishlist: () => api.get('/wishlist'),
  addToWishlist: (productId) => api.post(`/wishlist/${productId}`),
  removeFromWishlist: (productId) => api.delete(`/wishlist/${productId}`),
  checkInWishlist: (productId) => api.get(`/wishlist/check/${productId}`),
  clearWishlist: () => api.delete('/wishlist'),
};

// ===== Servicios de Settings =====
export const settingsService = {
  getSettings: () => api.get('/settings'),
  updateSettings: (data) => api.put('/settings', data),
  exportToCSV: (type, params) => api.get(`/settings/export/csv`, { params: { type, ...params }, responseType: 'blob' }),
};

// ===== Servicios de Comisiones =====
export const commissionService = {
  getMyCommissions: (params) => api.get('/commissions/my-commissions', { params }),
  getMySummary: () => api.get('/commissions/my-summary'),
  getAllCommissions: (params) => api.get('/commissions', { params }),
  getSummary: () => api.get('/commissions/summary'),
  getTeamMembers: () => api.get('/commissions/team-members'),
  createTeamMember: (data) => api.post('/commissions/team-members', data),
  updateTeamMember: (memberId, data) => api.put(`/commissions/team-members/${memberId}`, data),
  updateCommissionStatus: (commissionId, status) => api.patch(`/commissions/${commissionId}/status`, { status }),
  recordPayment: (data) => api.post('/commissions/payments', data),
};

// ===== Servicios de Chat =====
export const chatService = {
  getConversations: () => api.get('/chat/conversations'),
  getMessages: (conversationId) => api.get(`/chat/conversations/${conversationId}/messages`),
  sendMessage: (conversationId, data) => api.post(`/chat/conversations/${conversationId}/messages`, data),
  createConversation: (data) => api.post('/chat/conversations', data),
  markAsRead: (conversationId) => api.post(`/chat/conversations/${conversationId}/read`),
  updateStatus: (conversationId, status) => api.patch(`/chat/conversations/${conversationId}/status`, { status }),
  editMessage: (messageId, data) => api.put(`/chat/messages/${messageId}`, data),
  deleteMessage: (messageId) => api.delete(`/chat/messages/${messageId}`),
};

// ===== Socket Service =====
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect(token) {
    if (this.socket?.connected) return;

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('Socket conectado:', this.socket.id);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket desconectado');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Error de conexión socket:', error.message);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinRoom(room) {
    if (this.socket) {
      this.socket.emit(`join-${room.type}`, room.id);
    }
  }

  sendMessage(data) {
    if (this.socket) {
      this.socket.emit('chat-message', data);
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }
}

export const socketService = new SocketService();
