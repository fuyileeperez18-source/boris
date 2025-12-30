import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BarChart3, Users, ShoppingBag, DollarSign, TrendingUp,
  Package, Clock, MapPin, Star, Calendar, ArrowUpRight,
  ArrowDownRight, RefreshCw, Settings, LogOut, ChevronRight,
  Utensils, Truck, Receipt, Fish
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { socketService } from '../../services/socket';

// Mock data for demo
const mockStats = {
  totalSales: 24560000,
  totalOrders: 1247,
  totalUsers: 3420,
  avgOrderValue: 19700,
  salesChange: 12.5,
  ordersChange: 8.3,
  usersChange: 15.2,
  avgChange: -2.1
};

const mockRecentOrders = [
  { id: 'ORD-2024-1247', customer: 'Carlos García', items: 3, total: 85000, status: 'delivered', time: '5 min' },
  { id: 'ORD-2024-1246', customer: 'María López', items: 2, total: 62000, status: 'preparing', time: '12 min' },
  { id: 'ORD-2024-1245', customer: 'Juan Pérez', items: 5, total: 145000, status: 'on_the_way', time: '25 min' },
  { id: 'ORD-2024-1244', customer: 'Ana Martínez', items: 1, total: 38000, status: 'pending', time: '32 min' },
  { id: 'ORD-2024-1243', customer: 'Roberto Díaz', items: 4, total: 98000, status: 'delivered', time: '45 min' },
];

const mockTopProducts = [
  { name: 'Ceviche Clásico', orders: 245, revenue: 9310000, trend: 15 },
  { name: 'Arroz con Mariscos', orders: 198, revenue: 12870000, trend: 22 },
  { name: 'Langosta al Ajillo', orders: 87, revenue: 10875000, trend: 8 },
  { name: 'Cazuela de Mariscos', orders: 156, revenue: 9048000, trend: -5 },
  { name: 'Pescado Frito', orders: 134, revenue: 7772000, trend: 12 },
];

const mockSalesData = [
  { label: 'Lun', value: 3200000 },
  { label: 'Mar', value: 2800000 },
  { label: 'Mié', value: 3500000 },
  { label: 'Jue', value: 4100000 },
  { label: 'Vie', value: 5200000 },
  { label: 'Sáb', value: 6100000 },
  { label: 'Dom', value: 4800000 },
];

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(mockStats);
  const [recentOrders, setRecentOrders] = useState(mockRecentOrders);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Connect to admin socket room
    socketService.connect();
    socketService.socket?.emit('join-admin');

    // Listen for new orders
    socketService.onNewOrder((order) => {
      setRecentOrders(prev => [order, ...prev.slice(0, 4)]);
    });

    return () => {
      socketService.off('new-order');
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700',
      confirmed: 'bg-blue-100 text-blue-700',
      preparing: 'bg-orange-100 text-orange-700',
      ready: 'bg-purple-100 text-purple-700',
      on_the_way: 'bg-cyan-100 text-cyan-700',
      delivered: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pendiente',
      confirmed: 'Confirmado',
      preparing: 'Preparando',
      ready: 'Listo',
      on_the_way: 'En camino',
      delivered: 'Entregado',
      cancelled: 'Cancelado',
    };
    return labels[status] || status;
  };

  const maxSalesValue = Math.max(...mockSalesData.map(d => d.value));

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 shadow-xl hidden lg:flex flex-col">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-br from-primary-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Fish className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="font-serif font-bold text-xl text-primary-600">BORIS</h1>
              <p className="text-xs text-gray-500">Panel de Administración</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
              activeTab === 'overview'
                ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg transform hover:scale-105'
                : 'text-gray-700 hover:bg-primary-50 hover:text-primary-600'
            }`}
          >
            <BarChart3 className="h-5 w-5" />
            <span>Resumen</span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
              activeTab === 'orders'
                ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg transform hover:scale-105'
                : 'text-gray-700 hover:bg-primary-50 hover:text-primary-600'
            }`}
          >
            <ShoppingBag className="h-5 w-5" />
            <span>Pedidos</span>
            <span className="ml-auto bg-accent-500 text-white text-xs px-2 py-1 rounded-full shadow-md">12</span>
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
              activeTab === 'products'
                ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg transform hover:scale-105'
                : 'text-gray-700 hover:bg-primary-50 hover:text-primary-600'
            }`}
          >
            <Package className="h-5 w-5" />
            <span>Menú</span>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
              activeTab === 'users'
                ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg transform hover:scale-105'
                : 'text-gray-700 hover:bg-primary-50 hover:text-primary-600'
            }`}
          >
            <Users className="h-5 w-5" />
            <span>Usuarios</span>
          </button>
          <button
            onClick={() => setActiveTab('reservations')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
              activeTab === 'reservations'
                ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg transform hover:scale-105'
                : 'text-gray-700 hover:bg-primary-50 hover:text-primary-600'
            }`}
          >
            <Calendar className="h-5 w-5" />
            <span>Reservas</span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
              activeTab === 'analytics'
                ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg transform hover:scale-105'
                : 'text-gray-700 hover:bg-primary-50 hover:text-primary-600'
            }`}
          >
            <TrendingUp className="h-5 w-5" />
            <span>Analytics</span>
          </button>
        </nav>

        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <Link
            to="/admin/settings"
            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-white hover:text-primary-600 rounded-xl transition-all duration-300 font-medium mb-2"
          >
            <Settings className="h-5 w-5" />
            <span>Configuración</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-accent-600 hover:bg-accent-50 rounded-xl transition-all duration-300 font-medium"
          >
            <LogOut className="h-5 w-5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-gradient-to-br from-gray-50 to-primary-50/20">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 px-8 py-6 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-serif font-bold text-gray-900 mb-1">
                {activeTab === 'overview' && 'Resumen General'}
                {activeTab === 'orders' && 'Gestión de Pedidos'}
                {activeTab === 'products' && 'Gestión del Menú'}
                {activeTab === 'users' && 'Usuarios'}
                {activeTab === 'reservations' && 'Reservas'}
                {activeTab === 'analytics' && 'Analytics'}
              </h1>
              <p className="text-gray-600 text-sm flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Bienvenido, {user?.name || 'Administrador'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsLoading(true)}
                className="p-3 hover:bg-primary-50 rounded-xl transition-all duration-300 hover:scale-105"
              >
                <RefreshCw className={`h-5 w-5 text-primary-600 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {user?.name?.[0] || 'A'}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8">
          {activeTab === 'overview' && (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Sales */}
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl border border-primary-100 transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <DollarSign className="h-7 w-7 text-white" />
                    </div>
                    <span className={`flex items-center gap-1 text-sm font-semibold px-3 py-1 rounded-full ${
                      stats.salesChange >= 0
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {stats.salesChange >= 0 ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4" />
                      )}
                      {Math.abs(stats.salesChange)}%
                    </span>
                  </div>
                  <h3 className="text-gray-600 text-sm font-medium mb-2">Ventas Totales</h3>
                  <p className="text-3xl font-bold text-gray-900 font-serif">
                    {formatCurrency(stats.totalSales)}
                  </p>
                </div>

                {/* Total Orders */}
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl border border-primary-100 transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary-600 to-primary-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <Receipt className="h-7 w-7 text-white" />
                    </div>
                    <span className={`flex items-center gap-1 text-sm font-semibold px-3 py-1 rounded-full ${
                      stats.ordersChange >= 0
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {stats.ordersChange >= 0 ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4" />
                      )}
                      {Math.abs(stats.ordersChange)}%
                    </span>
                  </div>
                  <h3 className="text-gray-600 text-sm font-medium mb-2">Pedidos</h3>
                  <p className="text-3xl font-bold text-gray-900 font-serif">
                    {stats.totalOrders.toLocaleString()}
                  </p>
                </div>

                {/* Total Users */}
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl border border-primary-100 transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Users className="h-7 w-7 text-white" />
                    </div>
                    <span className={`flex items-center gap-1 text-sm font-semibold px-3 py-1 rounded-full ${
                      stats.usersChange >= 0
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {stats.usersChange >= 0 ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4" />
                      )}
                      {Math.abs(stats.usersChange)}%
                    </span>
                  </div>
                  <h3 className="text-gray-600 text-sm font-medium mb-2">Usuarios</h3>
                  <p className="text-3xl font-bold text-gray-900 font-serif">
                    {stats.totalUsers.toLocaleString()}
                  </p>
                </div>

                {/* Avg Order Value */}
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl border border-primary-100 transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-accent-500 to-accent-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <TrendingUp className="h-7 w-7 text-white" />
                    </div>
                    <span className={`flex items-center gap-1 text-sm font-semibold px-3 py-1 rounded-full ${
                      stats.avgChange >= 0
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {stats.avgChange >= 0 ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4" />
                      )}
                      {Math.abs(stats.avgChange)}%
                    </span>
                  </div>
                  <h3 className="text-gray-600 text-sm font-medium mb-2">Valor Promedio</h3>
                  <p className="text-3xl font-bold text-gray-900 font-serif">
                    {formatCurrency(stats.avgOrderValue)}
                  </p>
                </div>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Sales Chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-primary-100 hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-serif font-bold text-xl text-gray-900">Ventas de la Semana</h3>
                      <p className="text-sm text-gray-500">Últimos 7 días</p>
                    </div>
                    <select className="text-sm border border-primary-200 rounded-xl px-4 py-2 bg-primary-50 text-primary-700 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all">
                      <option>Esta semana</option>
                      <option>Última semana</option>
                      <option>Este mes</option>
                    </select>
                  </div>
                  <div className="flex items-end gap-3 h-48">
                    {mockSalesData.map((day, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
                        <div
                          className="w-full bg-gradient-to-t from-primary-600 to-primary-400 rounded-t-xl transition-all duration-500 hover:from-primary-700 hover:to-primary-500 shadow-md cursor-pointer"
                          style={{ height: `${(day.value / maxSalesValue) * 100}%` }}
                          title={formatCurrency(day.value)}
                        />
                        <span className="text-xs text-gray-600 font-medium group-hover:text-primary-600 transition-colors">{day.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Products */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-primary-100 hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-serif font-bold text-xl text-gray-900">Top Productos</h3>
                      <p className="text-sm text-gray-500">Más vendidos</p>
                    </div>
                    <button className="text-primary-600 text-sm hover:text-primary-700 font-medium hover:underline transition-colors">Ver todos</button>
                  </div>
                  <div className="space-y-4">
                    {mockTopProducts.slice(0, 5).map((product, index) => (
                      <div key={index} className="flex items-center gap-4 p-2 rounded-xl hover:bg-primary-50 transition-colors cursor-pointer">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center text-primary-700 font-bold text-sm shadow-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{product.name}</p>
                          <p className="text-sm text-gray-500">{product.orders} pedidos</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900 text-sm">{formatCurrency(product.revenue)}</p>
                          <span className={`text-xs flex items-center justify-end gap-1 font-semibold ${
                            product.trend >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {product.trend >= 0 ? '+' : ''}{product.trend}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="bg-white rounded-2xl shadow-lg border border-primary-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-white flex items-center justify-between">
                  <div>
                    <h3 className="font-serif font-bold text-xl text-gray-900">Pedidos Recientes</h3>
                    <p className="text-sm text-gray-500">Actividad en tiempo real</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-primary-600 text-sm hover:text-primary-700 font-medium hover:underline flex items-center gap-1 transition-colors"
                  >
                    Ver todos <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-primary-50 to-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Pedido</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Cliente</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Items</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Total</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Estado</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Tiempo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {recentOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-primary-50/50 transition-colors cursor-pointer">
                          <td className="px-6 py-4">
                            <span className="font-bold text-primary-600 hover:text-primary-700 transition-colors">{order.id}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-medium text-gray-900">{order.customer}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-gray-600">{order.items} items</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-bold text-gray-900">{formatCurrency(order.total)}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${getStatusColor(order.status)}`}>
                              {getStatusLabel(order.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {order.time}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeTab === 'orders' && (
            <div className="bg-white rounded-2xl shadow-lg border border-primary-100 p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-10 h-10 text-primary-600" />
              </div>
              <h3 className="font-serif font-bold text-2xl text-gray-900 mb-2">Gestión de Pedidos</h3>
              <p className="text-gray-600">Esta sección está en desarrollo...</p>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="bg-white rounded-2xl shadow-lg border border-primary-100 p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-secondary-100 to-secondary-200 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Utensils className="w-10 h-10 text-secondary-600" />
              </div>
              <h3 className="font-serif font-bold text-2xl text-gray-900 mb-2">Gestión del Menú</h3>
              <p className="text-gray-600">Esta sección está en desarrollo...</p>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-white rounded-2xl shadow-lg border border-primary-100 p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-primary-600" />
              </div>
              <h3 className="font-serif font-bold text-2xl text-gray-900 mb-2">Gestión de Usuarios</h3>
              <p className="text-gray-600">Esta sección está en desarrollo...</p>
            </div>
          )}

          {activeTab === 'reservations' && (
            <div className="bg-white rounded-2xl shadow-lg border border-primary-100 p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-accent-100 to-accent-200 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-10 h-10 text-accent-600" />
              </div>
              <h3 className="font-serif font-bold text-2xl text-gray-900 mb-2">Gestión de Reservas</h3>
              <p className="text-gray-600">Esta sección está en desarrollo...</p>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="bg-white rounded-2xl shadow-lg border border-primary-100 p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="font-serif font-bold text-2xl text-gray-900 mb-2">Analytics Avanzados</h3>
              <p className="text-gray-600">Esta sección está en desarrollo...</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
