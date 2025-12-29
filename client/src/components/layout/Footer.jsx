import { Link } from 'react-router-dom';
import {
  MapPin, Phone, Mail, Clock,
  Facebook, Instagram, Twitter, Youtube,
  Fish, Waves, CreditCard, Shield, Truck,
  ArrowRight
} from 'lucide-react';
import WhatsAppButton from '../ui/WhatsAppButton';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const menuLinks = [
    { href: '/menu#ceviches', label: 'Ceviches' },
    { href: '/menu#mariscos', label: 'Mariscos' },
    { href: '/menu#langosta', label: 'Langosta' },
    { href: '/menu#arroces', label: 'Arroces' },
    { href: '/menu#sopas', label: 'Sopas y Cazuelas' },
    { href: '/menu#bebidas', label: 'Bebidas' },
  ];

  const quickLinks = [
    { href: '/nosotros', label: 'Sobre Nosotros' },
    { href: '/reservas', label: 'Reservaciones' },
    { href: '/menu', label: 'Ver Menú' },
    { href: '/galeria', label: 'Galería' },
    { href: '/eventos', label: 'Eventos Privados' },
    { href: '/contacto', label: 'Contacto' },
  ];

  const legalLinks = [
    { href: '/terminos', label: 'Términos y Condiciones' },
    { href: '/privacidad', label: 'Política de Privacidad' },
    { href: '/cookies', label: 'Política de Cookies' },
  ];

  const socialLinks = [
    { href: 'https://facebook.com', icon: Facebook, label: 'Facebook' },
    { href: 'https://instagram.com', icon: Instagram, label: 'Instagram' },
    { href: 'https://twitter.com', icon: Twitter, label: 'Twitter' },
    { href: 'https://youtube.com', icon: Youtube, label: 'YouTube' },
  ];

  const features = [
    { icon: Truck, label: 'Delivery Rápido' },
    { icon: CreditCard, label: 'Pagos Seguros' },
    { icon: Shield, label: 'Garantía de Frescura' },
  ];

  return (
    <footer className="bg-ocean-900 text-white relative overflow-hidden">
      {/* Decorative wave at top */}
      <div className="absolute top-0 left-0 right-0 overflow-hidden">
        <svg viewBox="0 0 1440 120" fill="none" className="w-full transform rotate-180">
          <path d="M0,64L60,69.3C120,75,240,85,360,80C480,75,600,53,720,48C840,43,960,53,1080,58.7C1200,64,1320,64,1380,64L1440,64L1440,120L1380,120C1320,120,1200,120,1080,120C960,120,840,120,720,120C600,120,480,120,360,120C240,120,120,120,60,120L0,120Z" fill="#0c1929" fillOpacity="0.5"/>
        </svg>
      </div>

      {/* Newsletter Section */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-gradient-to-r from-primary-600/20 to-secondary-500/20 rounded-3xl p-8 md:p-12 backdrop-blur-sm border border-white/10">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl md:text-3xl font-serif font-bold mb-3">
                  Suscríbete a Nuestro Newsletter
                </h3>
                <p className="text-gray-300">
                  Recibe promociones exclusivas, nuevos platos y eventos especiales.
                </p>
              </div>
              <div>
                <form className="flex gap-3">
                  <input
                    type="email"
                    placeholder="Tu correo electrónico"
                    className="flex-1 px-5 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 bg-secondary-500 hover:bg-secondary-600 text-white rounded-full font-medium transition-colors flex items-center gap-2"
                  >
                    Suscribir
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
                <p className="text-xs text-gray-400 mt-3">
                  Al suscribirte aceptas nuestra política de privacidad.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center">
                <Fish className="w-7 h-7 text-primary-400" />
              </div>
              <div>
                <span className="font-serif font-bold text-xl block leading-tight">
                  BORIS
                </span>
                <span className="text-xs text-primary-300">
                  Restaurante de Mariscos
                </span>
              </div>
            </Link>

            <p className="text-gray-400 mb-6 leading-relaxed">
              BORIS - Tu destino para los mejores mariscos del Caribe colombiano.
              Una experiencia gastronómica única en el corazón de Cartagena.
            </p>

            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 hover:bg-primary-500 rounded-full flex items-center justify-center transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Menu Links */}
          <div>
            <h4 className="font-serif font-bold text-lg mb-6 flex items-center gap-2">
              <span className="w-8 h-0.5 bg-primary-500" />
              Nuestro Menú
            </h4>
            <ul className="space-y-3">
              {menuLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-primary-400 transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-primary-500 transition-all duration-300" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif font-bold text-lg mb-6 flex items-center gap-2">
              <span className="w-8 h-0.5 bg-secondary-500" />
              Enlaces Rápidos
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-secondary-400 transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-secondary-500 transition-all duration-300" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-serif font-bold text-lg mb-6 flex items-center gap-2">
              <span className="w-8 h-0.5 bg-accent-500" />
              Contáctanos
            </h4>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Dirección</p>
                  <p className="text-gray-400 text-sm">
                    Calle del Arsenal #10-43<br />
                    Centro Histórico, Cartagena
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Teléfono</p>
                  <a href="tel:+573001234567" className="text-gray-400 text-sm hover:text-primary-400 transition-colors">
                    +57 300 123 4567
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Email</p>
                  <a href="mailto:info@boris.com.co" className="text-gray-400 text-sm hover:text-primary-400 transition-colors">
                    info@boris.com.co
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Horario</p>
                  <p className="text-gray-400 text-sm">
                    Lun - Dom: 11:00 AM - 10:00 PM<br />
                    Vie - Sáb: hasta 11:00 PM
                  </p>
                </div>
              </div>

              {/* WhatsApp Button */}
              <WhatsAppButton
                message="Hola! Quisiera más información"
                className="w-full mt-4"
              >
                Escríbenos por WhatsApp
              </WhatsAppButton>
            </div>
          </div>
        </div>
      </div>

      {/* Features Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3 text-gray-400">
                <feature.icon className="w-6 h-6 text-primary-400" />
                <span>{feature.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm text-center md:text-left">
              © {currentYear} BORIS - Restaurante de Mariscos. Todos los derechos reservados.
            </p>

            <div className="flex flex-wrap justify-center gap-6 text-sm">
              {legalLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-gray-500 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Payment Methods */}
            <div className="flex items-center gap-3">
              <span className="text-gray-500 text-sm">Aceptamos:</span>
              <div className="flex gap-2">
                <div className="w-10 h-6 bg-white/10 rounded flex items-center justify-center">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/100px-Visa_Inc._logo.svg.png" alt="Visa" className="h-3" />
                </div>
                <div className="w-10 h-6 bg-white/10 rounded flex items-center justify-center">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/100px-Mastercard-logo.svg.png" alt="Mastercard" className="h-4" />
                </div>
                <div className="w-10 h-6 bg-white/10 rounded flex items-center justify-center text-xs text-gray-400">
                  PSE
                </div>
                <div className="w-10 h-6 bg-white/10 rounded flex items-center justify-center text-xs text-gray-400">
                  Nequi
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative wave element */}
      <div className="absolute bottom-0 right-0 opacity-5 pointer-events-none">
        <Waves className="w-96 h-96" />
      </div>
    </footer>
  );
};

export default Footer;
