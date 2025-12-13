import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingCart, User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import Button from '../ui/Button';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">P</span>
            </div>
            <span className="font-bold text-xl text-gray-900">
              [PLATAFORMA]
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/restaurantes" className="text-gray-600 hover:text-primary-600 transition-colors">
              Restaurantes
            </Link>

            {/* Carrito */}
            <Link to="/carrito" className="relative">
              <ShoppingCart className="w-6 h-6 text-gray-600 hover:text-primary-600 transition-colors" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>

            {/* Usuario */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
                >
                  <User className="w-6 h-6" />
                  <span className="text-sm">{user?.name?.split(' ')[0]}</span>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-2 z-50">
                    <Link
                      to="/perfil"
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      Mi Perfil
                    </Link>
                    <Link
                      to="/mis-pedidos"
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Mis Pedidos
                    </Link>

                    {/* Enlaces para roles específicos */}
                    {user?.role === 'restaurant' && (
                      <Link
                        to="/restaurante/dashboard"
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Settings className="w-4 h-4" />
                        Panel de Restaurante
                      </Link>
                    )}
                    {user?.role === 'admin' && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Settings className="w-4 h-4" />
                        Panel Admin
                      </Link>
                    )}

                    <hr className="my-2" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-gray-100 w-full"
                    >
                      <LogOut className="w-4 h-4" />
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">Ingresar</Button>
                </Link>
                <Link to="/registro">
                  <Button size="sm">Registrarse</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col gap-4">
              <Link
                to="/restaurantes"
                className="text-gray-600 hover:text-primary-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Restaurantes
              </Link>
              <Link
                to="/carrito"
                className="flex items-center gap-2 text-gray-600 hover:text-primary-600"
                onClick={() => setIsMenuOpen(false)}
              >
                <ShoppingCart className="w-5 h-5" />
                Carrito ({itemCount})
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    to="/perfil"
                    className="text-gray-600 hover:text-primary-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Mi Perfil
                  </Link>
                  <Link
                    to="/mis-pedidos"
                    className="text-gray-600 hover:text-primary-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Mis Pedidos
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="text-red-600 text-left"
                  >
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <div className="flex gap-2">
                  <Link to="/login" className="flex-1">
                    <Button variant="outline" fullWidth onClick={() => setIsMenuOpen(false)}>
                      Ingresar
                    </Button>
                  </Link>
                  <Link to="/registro" className="flex-1">
                    <Button fullWidth onClick={() => setIsMenuOpen(false)}>
                      Registrarse
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
