import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo y descripción */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">P</span>
              </div>
              <span className="font-bold text-xl text-white">
                [PLATAFORMA]
              </span>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              Tu plataforma local de delivery y reservas para restaurantes en Cartagena.
              Apoyamos a los negocios locales con comisiones justas.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h3 className="text-white font-semibold mb-4">Enlaces</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/restaurantes" className="text-gray-400 hover:text-white transition-colors">
                  Restaurantes
                </Link>
              </li>
              <li>
                <Link to="/como-funciona" className="text-gray-400 hover:text-white transition-colors">
                  ¿Cómo funciona?
                </Link>
              </li>
              <li>
                <Link to="/para-restaurantes" className="text-gray-400 hover:text-white transition-colors">
                  Únete como restaurante
                </Link>
              </li>
              <li>
                <Link to="/ser-domiciliario" className="text-gray-400 hover:text-white transition-colors">
                  Sé domiciliario
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contacto</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary-500" />
                <span className="text-gray-400">Cartagena, Colombia</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary-500" />
                <a href="tel:+573001234567" className="text-gray-400 hover:text-white transition-colors">
                  +57 300 123 4567
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary-500" />
                <a href="mailto:info@plataforma.com" className="text-gray-400 hover:text-white transition-colors">
                  info@plataforma.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Línea divisoria */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              © {currentYear} [NOMBRE DE LA PLATAFORMA]. Todos los derechos reservados.
            </p>
            <div className="flex gap-6 text-sm">
              <Link to="/terminos" className="text-gray-500 hover:text-white transition-colors">
                Términos y Condiciones
              </Link>
              <Link to="/privacidad" className="text-gray-500 hover:text-white transition-colors">
                Política de Privacidad
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
