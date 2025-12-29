import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BarChart3, Users, ShoppingBag, DollarSign, TrendingUp,
  Package, Clock, MapPin, Star, Calendar, ArrowUpRight,
  ArrowDownRight, RefreshCw, Settings, LogOut, ChevronRight,
  Utensils, Truck, Receipt
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
      <aside className="w-64 bg-ocean-900 text-white hidden lg:flex flex-col">
        <div className="p-6 border-b border-ocean-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Utensils className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg">BORIS</h1>
              <p className="text-xs text-ocean-300">Panel de Administración</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              activeTab === 'overview' ? 'bg-white/20 text-white' : 'text-ocean-300 hover:bg-white/10'
            }`}
          >
            <BarChart3 className="h-5 w-5" />
            <span>Resumen</span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              activeTab === 'orders' ? 'bg-white/20 text-white' : 'text-ocean-300 hover:bg-white/10'
            }`}
          >
            <ShoppingBag className="h-5 w-5" />
            <span>Pedidos</span>
            <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">12</span>
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              activeTab === 'products' ? 'bg-white/20 text-white' : 'text-ocean-300 hover:bg-white/10'
            }`}
          >
            <Package className="h-5 w-5" />
            <span>Menú</span>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              activeTab === 'users' ? 'bg-white/20 text-white' : 'text-ocean-300 hover:bg-white/10'
            }`}
          >
            <Users className="h-5 w-5" />
            <span>Usuarios</span>
          </button>
          <button
            onClick={() => setActiveTab('reservations')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              activeTab === 'reservations' ? 'bg-white/20 text-white' : 'text-ocean-300 hover:bg-white/10'
            }`}
          >
            <Calendar className="h-5 w-5" />
            <span>Reservas</span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              activeTab === 'analytics' ? 'bg-white/20 text-white' : 'text-ocean-300 hover:bg-white/10'
            }`}
          >
            <TrendingUp className="h-5 w-5" />
            <span>Analytics</span>
          </button>
        </nav>

        <div className="p-4 border-t border-ocean-800">
          <Link
            to="/admin/settings"
            className="flex items-center gap-3 px-4 py-3 text-ocean-300 hover:bg-white/10 rounded-xl transition-colors"
          >
            <Settings className="h-5 w-5" />
            <span>Configuración</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/20 rounded-xl transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white border-b px-8 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {activeTab === 'overview' && 'Resumen General'}
                {activeTab === 'orders' && 'Gestión de Pedidos'}
                {activeTab === 'products' && 'Gestión del Menú'}
                {activeTab === 'users' && 'Usuarios'}
                {activeTab === 'reservations' && 'Reservas'}
                {activeTab === 'analytics' && 'Analytics'}
              </h1>
              <p className="text-gray-500 text-sm">
                Bienvenido, {user?.name || 'Administrador'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsLoading(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RefreshCw className={`h-5 w-5 text-gray-500 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-ocean-600 rounded-full flex items-center justify-center text-white font-medium">
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
                <div className="bg-white rounded-2xl p-6 shadow-sm border">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                    <span className={`flex items-center gap-1 text-sm ${
                      stats.salesChange >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stats.salesChange >= 0 ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4" />
                      )}
                      {Math.abs(stats.salesChange)}%
                    </span>
                  </div>
                  <h3 className="text-gray-500 text-sm mb-1">Ventas Totales</h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(stats.totalSales)}
                  </p>
                </div>

                {/* Total Orders */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Receipt className="h-6 w-6 text-blue-600" />
                    </div>
                    <span className={`flex items-center gap-1 text-sm ${
                      stats.ordersChange >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stats.ordersChange >= 0 ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4" />
                      )}
                      {Math.abs(stats.ordersChange)}%
                    </span>
                  </div>
                  <h3 className="text-gray-500 text-sm mb-1">Pedidos</h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalOrders.toLocaleString()}
                  </p>
                </div>

                {/* Total Users */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                    <span className={`flex items-center gap-1 text-sm ${
                      stats.usersChange >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stats.usersChange >= 0 ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4" />
                      )}
                      {Math.abs(stats.usersChange)}%
                    </span>
                  </div>
                  <h3 className="text-gray-500 text-sm mb-1">Usuarios</h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalUsers.toLocaleString()}
                  </p>
                </div>

                {/* Avg Order Value */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-orange-600" />
                    </div>
                    <span className={`flex items-center gap-1 text-sm ${
                      stats.avgChange >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stats.avgChange >= 0 ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4" />
                      )}
                      {Math.abs(stats.avgChange)}%
                    </span>
                  </div>
                  <h3 className="text-gray-500 text-sm mb-1">Valor Promedio</h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(stats.avgOrderValue)}
                  </p>
                </div>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Sales Chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold text-gray-900">Ventas de la Semana</h3>
                    <select className="text-sm border rounded-lg px-3 py-1">
                      <option>Esta semana</option>
                      <option>Última semana</option>
                      <option>Este mes</option>
                    </select>
                  </div>
                  <div className="flex items-end gap-2 h-48">
                    {mockSalesData.map((day, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center gap-2">
                        <div
                          className="w-full bg-ocean-500 rounded-t-lg transition-all duration-500"
                          style={{ height: `${(day.value / maxSalesValue) * 100}%` }}
                        />
                        <span className="text-xs text-gray-500">{day.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Products */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold text-gray-900">Top Productos</h3>
                    <button className="text-ocean-600 text-sm hover:underline">Ver todos</button>
                  </div>
                  <div className="space-y-4">
                    {mockTopProducts.slice(0, 5).map((product, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-ocean-100 rounded-lg flex items-center justify-center text-ocean-600 font-medium text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{product.name}</p>
                          <p className="text-sm text-gray-500">{product.orders} pedidos</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">{formatCurrency(product.revenue)}</p>
                          <span className={`text-xs flex items-center gap-1 ${
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
              <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                <div className="px-6 py-4 border-b flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Pedidos Recientes</h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-ocean-600 text-sm hover:underline flex items-center gap-1"
                  >
                    Ver todos <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pedido</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tiempo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {recentOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <span className="font-medium text-ocean-600">{order.id}</span>
                          </td>
                          <td className="px-6 py-4 text-gray-900">{order.customer}</td>
                          <td className="px-6 py-4 text-gray-500">{order.items} items</td>
                          <td className="px-6 py-4 font-medium text-gray-900">{formatCurrency(order.total)}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {getStatusLabel(order.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-500">{order.time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeTab === 'orders' && (
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <p className="text-gray-600">Gestión de pedidos en desarrollo...</p>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <p className="text-gray-600">Gestión del menú en desarrollo...</p>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <p className="text-gray-600">Gestión de usuarios en desarrollo...</p>
            </div>
          )}

          {activeTab === 'reservations' && (
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <p className="text-gray-600">Gestión de reservas en desarrollo...</p>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <p className="text-gray-600">Analytics en desarrollo...</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
