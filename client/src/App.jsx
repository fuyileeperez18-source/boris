import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Layout
import Layout from './components/layout/Layout';

// Chat Widget
import ChatWidget from './components/chat/ChatWidget';

// Páginas públicas
import HomePage from './pages/public/HomePage';
import MenuPage from './pages/public/MenuPage';
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
          <ChatWidget />
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
                iconTheme: {
                  primary: '#fff',
                  secondary: '#10b981',
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
            <Route path="/menu" element={<Layout><MenuPage /></Layout>} />
            <Route path="/restaurantes" element={<Layout><RestaurantsPage /></Layout>} />
            <Route path="/restaurante/:slug" element={<Layout><RestaurantPage /></Layout>} />
            <Route path="/carrito" element={<Layout><CartPage /></Layout>} />
            <Route path="/checkout" element={<Layout showFooter={false}><CheckoutPage /></Layout>} />
            <Route path="/pedido/:trackingNumber" element={<Layout><TrackOrderPage /></Layout>} />
            <Route path="/login" element={<Layout><LoginPage /></Layout>} />
            <Route path="/registro" element={<Layout><RegisterPage /></Layout>} />

            {/* Rutas de información */}
            <Route path="/nosotros" element={<Layout><AboutPage /></Layout>} />
            <Route path="/contacto" element={<Layout><ContactPage /></Layout>} />
            <Route path="/reservas" element={<Layout><ReservationsPage /></Layout>} />

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

            {/* Páginas legales */}
            <Route path="/terminos" element={<Layout><LegalPage type="terms" /></Layout>} />
            <Route path="/privacidad" element={<Layout><LegalPage type="privacy" /></Layout>} />
            <Route path="/cookies" element={<Layout><LegalPage type="cookies" /></Layout>} />

            {/* 404 */}
            <Route path="*" element={
              <Layout>
                <div className="min-h-[60vh] flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <h1 className="text-8xl font-bold text-primary-200">404</h1>
                    <h2 className="text-2xl font-serif font-bold text-gray-900 mt-4">Página no encontrada</h2>
                    <p className="text-gray-600 mt-2 mb-6">Lo sentimos, la página que buscas no existe.</p>
                    <a href="/" className="btn btn-primary inline-flex items-center gap-2">
                      Volver al inicio
                    </a>
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

// Placeholder components for pages that don't exist yet
const AboutPage = () => (
  <div className="min-h-screen bg-gray-50 py-20">
    <div className="container-custom text-center">
      <h1 className="text-4xl font-serif font-bold">Sobre Nosotros</h1>
      <p className="text-gray-600 mt-4">Página en construcción</p>
    </div>
  </div>
);

const ContactPage = () => (
  <div className="min-h-screen bg-gray-50 py-20">
    <div className="container-custom text-center">
      <h1 className="text-4xl font-serif font-bold">Contacto</h1>
      <p className="text-gray-600 mt-4">Página en construcción</p>
    </div>
  </div>
);

const ReservationsPage = () => (
  <div className="min-h-screen bg-gray-50 py-20">
    <div className="container-custom text-center">
      <h1 className="text-4xl font-serif font-bold">Reservaciones</h1>
      <p className="text-gray-600 mt-4">Página en construcción</p>
    </div>
  </div>
);

const LegalPage = ({ type }) => {
  const titles = {
    terms: 'Términos y Condiciones',
    privacy: 'Política de Privacidad',
    cookies: 'Política de Cookies'
  };

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="container-custom">
        <h1 className="text-4xl font-serif font-bold text-center">{titles[type]}</h1>
        <div className="max-w-3xl mx-auto mt-8 bg-white rounded-2xl p-8 shadow-sm">
          <p className="text-gray-600">Contenido legal en construcción.</p>
        </div>
      </div>
    </div>
  );
};

export default App;
