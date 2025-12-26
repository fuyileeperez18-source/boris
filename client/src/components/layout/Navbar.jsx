import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Menu, X, ShoppingCart, User, LogOut, Settings,
  Phone, Clock, MapPin, ChevronDown, Calendar,
  Utensils, Fish, Heart
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import Button from '../ui/Button';
import WhatsAppButton from '../ui/WhatsAppButton';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if we're on homepage for transparent navbar
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isProfileOpen && !event.target.closest('.profile-dropdown')) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLinks = [
    { href: '/', label: 'Inicio' },
    { href: '/menu', label: 'Menú' },
    { href: '/nosotros', label: 'Nosotros' },
    { href: '/reservas', label: 'Reservas' },
    { href: '/contacto', label: 'Contacto' },
  ];

  const navbarBg = isHomePage && !isScrolled
    ? 'bg-transparent'
    : 'bg-white shadow-md';

  const textColor = isHomePage && !isScrolled
    ? 'text-white'
    : 'text-gray-700';

  const logoColor = isHomePage && !isScrolled
    ? 'text-white'
    : 'text-primary-600';

  return (
    <>
      {/* Top Bar */}
      <div className="bg-ocean-900 text-white py-2 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-6">
              <a href="tel:+573001234567" className="flex items-center gap-2 hover:text-primary-300 transition-colors">
                <Phone className="w-4 h-4" />
                <span>+57 300 123 4567</span>
              </a>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Lun - Dom: 11:00 AM - 10:00 PM</span>
              </span>
            </div>
            <div className="flex items-center gap-4">
              <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary-300 transition-colors">
                <MapPin className="w-4 h-4" />
                <span>Centro Histórico, Cartagena</span>
              </a>
              <WhatsAppButton
                message="Hola! Me gustaría hacer una reserva"
                className="!py-1 !px-3 !text-sm !rounded-lg"
              >
                WhatsApp
              </WhatsAppButton>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className={`sticky top-0 z-40 transition-all duration-300 ${navbarBg}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                isHomePage && !isScrolled
                  ? 'bg-white/20 backdrop-blur-sm group-hover:bg-white/30'
                  : 'bg-primary-100 group-hover:bg-primary-200'
              }`}>
                <Fish className={`w-7 h-7 ${
                  isHomePage && !isScrolled ? 'text-white' : 'text-primary-600'
                }`} />
              </div>
              <div>
                <span className={`font-serif font-bold text-xl block leading-tight ${logoColor}`}>
                  Mar de Sabores
                </span>
                <span className={`text-xs ${
                  isHomePage && !isScrolled ? 'text-primary-200' : 'text-gray-500'
                }`}>
                  Restaurante de Mariscos
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`font-medium transition-colors relative group ${textColor} hover:text-primary-500`}
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-500 transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
            </div>

            {/* Right Section */}
            <div className="hidden lg:flex items-center gap-4">
              {/* Cart */}
              <Link
                to="/carrito"
                className={`relative p-2 rounded-full transition-colors ${
                  isHomePage && !isScrolled
                    ? 'hover:bg-white/20'
                    : 'hover:bg-gray-100'
                }`}
              >
                <ShoppingCart className={`w-6 h-6 ${textColor}`} />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </Link>

              {/* User Menu */}
              {isAuthenticated ? (
                <div className="relative profile-dropdown">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className={`flex items-center gap-2 p-2 rounded-full transition-colors ${
                      isHomePage && !isScrolled
                        ? 'hover:bg-white/20'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isHomePage && !isScrolled
                        ? 'bg-white/20'
                        : 'bg-primary-100'
                    }`}>
                      <User className={`w-5 h-5 ${
                        isHomePage && !isScrolled ? 'text-white' : 'text-primary-600'
                      }`} />
                    </div>
                    <span className={`text-sm font-medium ${textColor}`}>
                      {user?.name?.split(' ')[0]}
                    </span>
                    <ChevronDown className={`w-4 h-4 ${textColor}`} />
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-4 py-3 border-b">
                        <p className="font-medium text-gray-900">{user?.name}</p>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                      </div>

                      <div className="py-2">
                        <Link
                          to="/perfil"
                          className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <User className="w-4 h-4" />
                          Mi Perfil
                        </Link>
                        <Link
                          to="/mis-pedidos"
                          className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <Utensils className="w-4 h-4" />
                          Mis Pedidos
                        </Link>
                        <Link
                          to="/mis-reservas"
                          className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <Calendar className="w-4 h-4" />
                          Mis Reservas
                        </Link>
                        <Link
                          to="/favoritos"
                          className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <Heart className="w-4 h-4" />
                          Favoritos
                        </Link>
                      </div>

                      {/* Admin/Restaurant Links */}
                      {(user?.role === 'restaurant' || user?.role === 'admin') && (
                        <div className="py-2 border-t">
                          {user?.role === 'restaurant' && (
                            <Link
                              to="/restaurante/dashboard"
                              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                              onClick={() => setIsProfileOpen(false)}
                            >
                              <Settings className="w-4 h-4" />
                              Panel de Restaurante
                            </Link>
                          )}
                          {user?.role === 'admin' && (
                            <Link
                              to="/admin"
                              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                              onClick={() => setIsProfileOpen(false)}
                            >
                              <Settings className="w-4 h-4" />
                              Panel Admin
                            </Link>
                          )}
                        </div>
                      )}

                      <div className="pt-2 border-t">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors w-full"
                        >
                          <LogOut className="w-4 h-4" />
                          Cerrar Sesión
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login">
                    <Button
                      variant="ghost"
                      className={isHomePage && !isScrolled ? '!text-white hover:!bg-white/20' : ''}
                    >
                      Ingresar
                    </Button>
                  </Link>
                  <Link to="/registro">
                    <Button className="btn btn-primary">
                      Registrarse
                    </Button>
                  </Link>
                </div>
              )}

              {/* CTA Button */}
              <Link to="/reservas">
                <Button className="btn btn-secondary">
                  <Calendar className="w-4 h-4 mr-2" />
                  Reservar
                </Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center gap-4 lg:hidden">
              <Link to="/carrito" className="relative">
                <ShoppingCart className={`w-6 h-6 ${textColor}`} />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-accent-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`p-2 rounded-lg ${
                  isHomePage && !isScrolled
                    ? 'hover:bg-white/20'
                    : 'hover:bg-gray-100'
                }`}
              >
                {isMenuOpen ? (
                  <X className={`w-6 h-6 ${textColor}`} />
                ) : (
                  <Menu className={`w-6 h-6 ${textColor}`} />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="lg:hidden py-4 border-t bg-white rounded-b-2xl shadow-xl animate-in slide-in-from-top duration-200">
              <div className="flex flex-col gap-1 px-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="px-4 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-xl transition-colors font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="border-t my-3" />

              {isAuthenticated ? (
                <div className="px-2">
                  <div className="px-4 py-3 mb-2">
                    <p className="font-medium text-gray-900">{user?.name}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                  <Link
                    to="/perfil"
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-5 h-5" />
                    Mi Perfil
                  </Link>
                  <Link
                    to="/mis-pedidos"
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Utensils className="w-5 h-5" />
                    Mis Pedidos
                  </Link>
                  <Link
                    to="/mis-reservas"
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Calendar className="w-5 h-5" />
                    Mis Reservas
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl w-full"
                  >
                    <LogOut className="w-5 h-5" />
                    Cerrar Sesión
                  </button>
                </div>
              ) : (
                <div className="flex gap-2 px-4">
                  <Link to="/login" className="flex-1" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" className="w-full">
                      Ingresar
                    </Button>
                  </Link>
                  <Link to="/registro" className="flex-1" onClick={() => setIsMenuOpen(false)}>
                    <Button className="btn btn-primary w-full">
                      Registrarse
                    </Button>
                  </Link>
                </div>
              )}

              <div className="px-4 mt-4">
                <Link to="/reservas" onClick={() => setIsMenuOpen(false)}>
                  <Button className="btn btn-secondary w-full">
                    <Calendar className="w-4 h-4 mr-2" />
                    Reservar Mesa
                  </Button>
                </Link>
              </div>

              {/* Mobile contact info */}
              <div className="px-4 mt-4 pt-4 border-t">
                <div className="flex flex-col gap-2 text-sm text-gray-600">
                  <a href="tel:+573001234567" className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-primary-600" />
                    +57 300 123 4567
                  </a>
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary-600" />
                    11:00 AM - 10:00 PM
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
