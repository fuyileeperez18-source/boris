/**
 * Utilidades para formateo de datos
 */

// Formatear precio en pesos colombianos
export const formatPrice = (price) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

// Formatear número con separador de miles
export const formatNumber = (number) => {
  return new Intl.NumberFormat('es-CO').format(number);
};

// Formatear fecha
export const formatDate = (date, options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  };

  return new Intl.DateTimeFormat('es-CO', defaultOptions).format(new Date(date));
};

// Formatear fecha corta
export const formatDateShort = (date) => {
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(date));
};

// Formatear hora
export const formatTime = (time) => {
  // Si es string HH:MM, convertir
  if (typeof time === 'string' && time.includes(':')) {
    const [hours, minutes] = time.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return new Intl.DateTimeFormat('es-CO', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  }

  return new Intl.DateTimeFormat('es-CO', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(time));
};

// Formatear fecha y hora juntas
export const formatDateTime = (date) => {
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(date));
};

// Formatear tiempo relativo (hace X minutos, etc.)
export const formatRelativeTime = (date) => {
  const now = new Date();
  const then = new Date(date);
  const diff = now - then;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Justo ahora';
  if (minutes < 60) return `Hace ${minutes} minuto${minutes !== 1 ? 's' : ''}`;
  if (hours < 24) return `Hace ${hours} hora${hours !== 1 ? 's' : ''}`;
  if (days < 7) return `Hace ${days} día${days !== 1 ? 's' : ''}`;

  return formatDate(date);
};

// Formatear teléfono colombiano
export const formatPhone = (phone) => {
  if (!phone) return '';

  // Remover caracteres no numéricos
  const cleaned = phone.replace(/\D/g, '');

  // Si tiene 10 dígitos, formatear como 300 123 4567
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }

  return phone;
};

// Formatear dirección (truncar si es muy larga)
export const formatAddress = (address, maxLength = 50) => {
  if (!address) return '';
  if (address.length <= maxLength) return address;
  return `${address.slice(0, maxLength)}...`;
};

// Formatear estado del pedido
export const formatOrderStatus = (status) => {
  const statusMap = {
    received: 'Recibido',
    preparing: 'En preparación',
    ready: 'Listo',
    on_the_way: 'En camino',
    delivered: 'Entregado',
    cancelled: 'Cancelado',
  };
  return statusMap[status] || status;
};

// Formatear estado de reserva
export const formatReservationStatus = (status) => {
  const statusMap = {
    pending: 'Pendiente',
    confirmed: 'Confirmada',
    completed: 'Completada',
    cancelled: 'Cancelada',
  };
  return statusMap[status] || status;
};

// Formatear estado de pago
export const formatPaymentStatus = (status) => {
  const statusMap = {
    pending: 'Pendiente',
    paid: 'Pagado',
    approved: 'Aprobado',
    failed: 'Fallido',
    rejected: 'Rechazado',
    refunded: 'Reembolsado',
  };
  return statusMap[status] || status;
};

// Obtener color de estado del pedido
export const getOrderStatusColor = (status) => {
  const colorMap = {
    received: 'bg-blue-100 text-blue-800',
    preparing: 'bg-yellow-100 text-yellow-800',
    ready: 'bg-green-100 text-green-800',
    on_the_way: 'bg-purple-100 text-purple-800',
    delivered: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return colorMap[status] || 'bg-gray-100 text-gray-800';
};

// Obtener color de estado de reserva
export const getReservationStatusColor = (status) => {
  const colorMap = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return colorMap[status] || 'bg-gray-100 text-gray-800';
};
