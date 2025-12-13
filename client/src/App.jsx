import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Layout
import Layout from './components/layout/Layout';

// Páginas públicas
import HomePage from './pages/public/HomePage';
import RestaurantsPage from './pages/public/RestaurantsPage';
import RestaurantPage from './pages/public/RestaurantPage';
import CartPage from './pages/public/CartPage';
import CheckoutPage from './pages/public/CheckoutPage';
import TrackOrderPage from './pages/public/TrackOrderPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';

// Páginas de usuario autenticado
import ProfilePage from './pages/public/ProfilePage';
import MyOrdersPage from './pages/public/MyOrdersPage';
import MyReservationsPage from './pages/public/MyReservationsPage';

// Páginas de restaurante
import RestaurantDashboard from './pages/restaurant/Dashboard';
import RestaurantOrders from './pages/restaurant/Orders';
import RestaurantMenu from './pages/restaurant/Menu';
import RestaurantReservations from './pages/restaurant/Reservations';

// Páginas de admin
import AdminDashboard from './pages/admin/Dashboard';
import AdminRestaurants from './pages/admin/Restaurants';
import AdminUsers from './pages/admin/Users';
import AdminReports from './pages/admin/Reports';

// Páginas de domiciliario
import DeliveryDashboard from './pages/delivery/Dashboard';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                style: {
                  background: '#10b981',
                },
              },
              error: {
                style: {
                  background: '#ef4444',
                },
              },
            }}
          />

          <Routes>
            {/* Rutas públicas */}
            <Route path="/" element={<Layout><HomePage /></Layout>} />
            <Route path="/restaurantes" element={<Layout><RestaurantsPage /></Layout>} />
            <Route path="/restaurante/:slug" element={<Layout><RestaurantPage /></Layout>} />
            <Route path="/carrito" element={<Layout><CartPage /></Layout>} />
            <Route path="/checkout" element={<Layout showFooter={false}><CheckoutPage /></Layout>} />
            <Route path="/pedido/:trackingNumber" element={<Layout><TrackOrderPage /></Layout>} />
            <Route path="/login" element={<Layout><LoginPage /></Layout>} />
            <Route path="/registro" element={<Layout><RegisterPage /></Layout>} />

            {/* Rutas de usuario autenticado */}
            <Route path="/perfil" element={<Layout><ProfilePage /></Layout>} />
            <Route path="/mis-pedidos" element={<Layout><MyOrdersPage /></Layout>} />
            <Route path="/mis-reservas" element={<Layout><MyReservationsPage /></Layout>} />

            {/* Rutas de restaurante */}
            <Route path="/restaurante/dashboard" element={<RestaurantDashboard />} />
            <Route path="/restaurante/pedidos" element={<RestaurantOrders />} />
            <Route path="/restaurante/menu" element={<RestaurantMenu />} />
            <Route path="/restaurante/reservas" element={<RestaurantReservations />} />

            {/* Rutas de admin */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/restaurantes" element={<AdminRestaurants />} />
            <Route path="/admin/usuarios" element={<AdminUsers />} />
            <Route path="/admin/reportes" element={<AdminReports />} />

            {/* Rutas de domiciliario */}
            <Route path="/domiciliario" element={<DeliveryDashboard />} />

            {/* 404 */}
            <Route path="*" element={
              <Layout>
                <div className="min-h-[60vh] flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-6xl font-bold text-gray-300">404</h1>
                    <p className="text-xl text-gray-600 mt-4">Página no encontrada</p>
                  </div>
                </div>
              </Layout>
            } />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
