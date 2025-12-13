import { Link } from 'react-router-dom';
import { Search, MapPin, Clock, Star, Utensils, CalendarCheck, Truck } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

const HomePage = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Pide comida de tus restaurantes favoritos en Cartagena
              </h1>
              <p className="text-xl text-primary-100 mb-8">
                Delivery y reservas de restaurantes locales con las comisiones más justas.
                Apoya a los negocios de tu ciudad.
              </p>

              {/* Barra de búsqueda */}
              <div className="bg-white rounded-lg p-2 flex gap-2 shadow-lg">
                <div className="flex-1 flex items-center gap-2 px-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tu dirección en Cartagena..."
                    className="w-full outline-none text-gray-700 placeholder:text-gray-400"
                  />
                </div>
                <Link to="/restaurantes">
                  <Button>
                    <Search className="w-4 h-4 mr-2" />
                    Buscar
                  </Button>
                </Link>
              </div>
            </div>

            <div className="hidden md:block">
              <div className="relative">
                <div className="absolute -top-4 -right-4 w-72 h-72 bg-primary-400/30 rounded-full blur-3xl" />
                <img
                  src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop"
                  alt="Comida deliciosa"
                  className="rounded-2xl shadow-2xl relative z-10"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ¿Cómo funciona?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Pedir comida o reservar mesa nunca fue tan fácil
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Busca</h3>
              <p className="text-gray-600">
                Explora los restaurantes locales de Cartagena y encuentra tu comida favorita
              </p>
            </Card>

            <Card className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Utensils className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Elige</h3>
              <p className="text-gray-600">
                Selecciona tus platos favoritos o reserva una mesa para comer en el local
              </p>
            </Card>

            <Card className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Disfruta</h3>
              <p className="text-gray-600">
                Recibe tu pedido en casa o disfruta de tu reserva en el restaurante
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Servicios */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Nuestros Servicios
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Delivery */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-8 border border-orange-200">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-orange-500 rounded-xl flex items-center justify-center">
                  <Truck className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Delivery</h3>
                  <p className="text-orange-600">Recibe en tu casa</p>
                </div>
              </div>
              <p className="text-gray-600 mb-6">
                Pide tus platos favoritos y recíbelos en la comodidad de tu hogar.
                Opciones de entrega rápida con seguimiento en tiempo real.
              </p>
              <ul className="space-y-2 text-gray-600 mb-6">
                <li className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-500" />
                  Entrega en 30-45 minutos
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-orange-500" />
                  Seguimiento GPS en tiempo real
                </li>
              </ul>
              <Link to="/restaurantes">
                <Button className="bg-orange-500 hover:bg-orange-600">
                  Pedir Ahora
                </Button>
              </Link>
            </div>

            {/* Reservas */}
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-8 border border-emerald-200">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-emerald-500 rounded-xl flex items-center justify-center">
                  <CalendarCheck className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Reservas</h3>
                  <p className="text-emerald-600">Come en el restaurante</p>
                </div>
              </div>
              <p className="text-gray-600 mb-6">
                Reserva tu mesa con anticipación y disfruta de la experiencia completa
                del restaurante sin esperas.
              </p>
              <ul className="space-y-2 text-gray-600 mb-6">
                <li className="flex items-center gap-2">
                  <CalendarCheck className="w-4 h-4 text-emerald-500" />
                  Confirmación inmediata
                </li>
                <li className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-emerald-500" />
                  Ocasiones especiales
                </li>
              </ul>
              <Link to="/restaurantes">
                <Button className="bg-emerald-500 hover:bg-emerald-600">
                  Reservar Mesa
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Por qué elegirnos */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              ¿Por qué elegirnos?
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Somos la alternativa local que apoya a los restaurantes de Cartagena
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold text-primary-500 mb-2">50%</div>
              <p className="text-xl text-gray-300">Menos comisiones</p>
              <p className="text-gray-500 mt-2">
                Cobramos hasta 50% menos que otras plataformas
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-primary-500 mb-2">100%</div>
              <p className="text-xl text-gray-300">Local</p>
              <p className="text-gray-500 mt-2">
                Enfocados en restaurantes de Cartagena
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-primary-500 mb-2">24/7</div>
              <p className="text-xl text-gray-300">Disponible</p>
              <p className="text-gray-500 mt-2">
                Servicio disponible cuando lo necesites
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA para restaurantes */}
      <section className="py-20 bg-primary-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            ¿Tienes un restaurante?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Únete a nuestra plataforma y llega a más clientes en Cartagena
            con las comisiones más justas del mercado.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/para-restaurantes">
              <Button size="lg">
                Quiero unirme
              </Button>
            </Link>
            <Link to="/como-funciona">
              <Button variant="outline" size="lg">
                Más información
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
