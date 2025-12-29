import { useState, useEffect, useRef } from 'react';
import { notificationService, socketService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Bell,
  X,
  Check,
  ShoppingBag,
  Calendar,
  MessageSquare,
  Star,
  Megaphone,
  Settings,
  Trash2,
  CheckCheck
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const getNotificationIcon = (type) => {
  const icons = {
    order: <ShoppingBag className="w-5 h-5 text-blue-500" />,
    reservation: <Calendar className="w-5 h-5 text-green-500" />,
    chat: <MessageSquare className="w-5 h-5 text-purple-500" />,
    review: <Star className="w-5 h-5 text-yellow-500" />,
    promo: <Megaphone className="w-5 h-5 text-red-500" />,
    system: <Settings className="w-5 h-5 text-gray-500" />
  };
  return icons[type] || icons.system;
};

const NotificationItem = ({ notification, onRead, onDelete, onClick }) => {
  return (
    <div
      onClick={() => onClick(notification)}
      className={`
        flex items-start gap-3 p-4 border-b border-gray-100 cursor-pointer
        hover:bg-gray-50 transition-colors
        ${!notification.is_read ? 'bg-primary-50/50' : ''}
      `}
    >
      <div className="flex-shrink-0 mt-0.5">
        {getNotificationIcon(notification.type)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm ${!notification.is_read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
            {notification.title}
          </p>
          <span className="text-xs text-gray-400 flex-shrink-0">
            {formatDistanceToNow(new Date(notification.created_at), { locale: es, addSuffix: true })}
          </span>
        </div>

        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
          {notification.message}
        </p>

        {notification.link && (
          <a
            href={notification.link}
            className="text-sm text-primary-600 hover:underline mt-2 inline-block"
            onClick={(e) => e.stopPropagation()}
          >
            Ver más detalles
          </a>
        )}
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        {!notification.is_read && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRead(notification.id);
            }}
            className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
            title="Marcar como leída"
          >
            <Check className="w-4 h-4 text-gray-500" />
          </button>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(notification.id);
          }}
          className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
          title="Eliminar"
        >
          <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-500" />
        </button>
      </div>
    </div>
  );
};

const NotificationBell = () => {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Conectar socket para notificaciones en tiempo real
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      socketService.connect(localStorage.getItem('accessToken'));
      socketService.joinRoom({ type: 'user', id: user.id });

      socketService.on('new-notification', (notification) => {
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
        toast(notification.title, {
          icon: getNotificationIcon(notification.type),
          duration: 5000
        });
      });

      return () => {
        socketService.off('new-notification');
      };
    }
  }, [isAuthenticated, user?.id]);

  // Cargar notificaciones
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const [notifRes, countRes] = await Promise.all([
        notificationService.getMyNotifications({ limit: 10 }),
        notificationService.getUnreadCount()
      ]);

      setNotifications(notifRes.data.data);
      setUnreadCount(countRes.data.data.unread_count);
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar al abrir dropdown
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      toast.error('Error al marcar como leída');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
      toast.success('Todas marcadas como leídas');
    } catch (error) {
      toast.error('Error al marcar todas');
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      const notif = notifications.find((n) => n.id === notificationId);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      if (notif && !notif.is_read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  const handleClearAll = async () => {
    if (!confirm('¿Eliminar todas las notificaciones?')) return;

    try {
      await notificationService.clearAll();
      setNotifications([]);
      setUnreadCount(0);
      toast.success('Notificaciones eliminadas');
    } catch (error) {
      toast.error('Error al limpiar notificaciones');
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      handleMarkAsRead(notification.id);
    }

    if (notification.link) {
      window.location.href = notification.link;
    }

    setIsOpen(false);
  };

  if (!isAuthenticated) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón de campana */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        <Bell className="w-6 h-6 text-gray-700" />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Notificaciones</h3>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Marcar todas leídas
                </button>
              )}

              {notifications.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Eliminar todas"
                >
                  <Trash2 className="w-4 h-4 text-gray-500" />
                </button>
              )}

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Lista de notificaciones */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">Sin notificaciones</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onRead={handleMarkAsRead}
                  onDelete={handleDelete}
                  onClick={handleNotificationClick}
                />
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-100 bg-gray-50">
              <a
                href="/perfil/notificaciones"
                className="block text-center text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Ver todas las notificaciones
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
