import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, MapPin, Clock, Star, Phone, Calendar,
  ChevronRight, Play, Award, Users, Utensils,
  Truck, MessageCircle, ArrowRight, Waves, Fish,
  Shell, Anchor
} from 'lucide-react';
import Button from '../../components/ui/Button';
import WhatsAppButton from '../../components/ui/WhatsAppButton';
import ReservationModal from '../../components/reservation/ReservationModal';

// Datos del menú destacado
const featuredDishes = [
  {
    id: 1,
    name: 'Ceviche Clásico',
    description: 'Corvina fresca marinada en limón con cebolla morada, cilantro y ají',
    price: 38000,
    image: 'https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?w=400&h=300&fit=crop',
    badge: 'Más Vendido',
    category: 'Ceviches'
  },
  {
    id: 2,
    name: 'Langosta al Ajillo',
    description: 'Media langosta del Caribe salteada en mantequilla de ajo y hierbas',
    price: 125000,
    image: 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=400&h=300&fit=crop',
    badge: 'Premium',
    category: 'Langosta'
  },
  {
    id: 3,
    name: 'Arroz con Mariscos',
    description: 'Arroz cremoso con camarones, calamares, mejillones y pulpo',
    price: 65000,
    image: 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=400&h=300&fit=crop',
    badge: 'Favorito',
    category: 'Arroces'
  },
  {
    id: 4,
    name: 'Cazuela de Mariscos',
    description: 'Sopa cremosa con variedad de mariscos frescos y leche de coco',
    price: 58000,
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop',
    badge: 'Chef\'s Choice',
    category: 'Sopas'
  }
];

// Testimonios
const testimonials = [
  {
    id: 1,
    name: 'María García',
    role: 'Cliente Frecuente',
    comment: 'El mejor ceviche de Cartagena, sin duda. Los mariscos siempre frescos y el servicio impecable.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop'
  },
  {
    id: 2,
    name: 'Carlos Rodríguez',
    role: 'Food Blogger',
    comment: 'Una experiencia gastronómica que trasciende. La langosta al ajillo es una obra maestra.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
  },
  {
    id: 3,
    name: 'Ana Martínez',
    role: 'Turista',
    comment: 'Vinimos de vacaciones y repetimos 3 veces. El arroz con mariscos es espectacular.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
  }
];

// Stats
const stats = [
  { value: '15+', label: 'Años de Experiencia', icon: Award },
  { value: '50K+', label: 'Clientes Satisfechos', icon: Users },
  { value: '100+', label: 'Platos en el Menú', icon: Utensils },
  { value: '4.8', label: 'Calificación Promedio', icon: Star }
];

const HomePage = () => {
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center bg-ocean-900">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1920&h=1080&fit=crop"
            alt="Mariscos frescos"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ocean-900/95 via-ocean-900/80 to-ocean-900/60" />
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 right-10 opacity-10 animate-float">
          <Waves className="w-32 h-32 text-primary-400" />
        </div>
        <div className="absolute bottom-32 left-10 opacity-10 animate-float" style={{ animationDelay: '1s' }}>
          <Shell className="w-24 h-24 text-secondary-400" />
        </div>

        <div className="relative z-10 container-custom py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <div className="inline-flex items-center gap-2 bg-primary-500/20 backdrop-blur-sm border border-primary-400/30 rounded-full px-4 py-2 mb-6">
                <Fish className="w-4 h-4 text-primary-400" />
                <span className="text-primary-300 text-sm font-medium">Mariscos Premium del Caribe</span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold mb-6 leading-tight">
                Sabores del
                <span className="block text-ocean-gradient bg-gradient-to-r from-primary-400 via-primary-300 to-secondary-400 bg-clip-text text-transparent">
                  Mar Caribe
                </span>
              </h1>

              <p className="text-xl text-gray-300 mb-8 max-w-lg leading-relaxed">
                Experimenta la frescura del océano en cada bocado. Mariscos selectos,
                preparados con pasión y servidos con la calidez del Caribe colombiano.
              </p>

              <div className="flex flex-wrap gap-4 mb-8">
                <Button
                  onClick={() => setIsReservationOpen(true)}
                  className="btn btn-secondary text-lg"
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  Reservar Mesa
                </Button>
                <Link to="/menu">
                  <Button className="btn btn-outline-white text-lg">
                    Ver Menú
                    <ChevronRight className="w-5 h-5 ml-1" />
                  </Button>
                </Link>
              </div>

              {/* Quick Info */}
              <div className="flex flex-wrap gap-6 text-gray-300">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary-400" />
                  <span>11:00 AM - 10:00 PM</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary-400" />
                  <span>Centro Histórico</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-secondary-400 fill-secondary-400" />
                  <span>4.8 (520 reseñas)</span>
                </div>
              </div>
            </div>

            {/* Hero Image Card */}
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute -top-6 -left-6 w-full h-full bg-primary-500/20 rounded-3xl" />
                <div className="absolute -bottom-6 -right-6 w-full h-full bg-secondary-500/20 rounded-3xl" />
                <div className="relative glass-dark rounded-3xl p-2 shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=600&h=700&fit=crop"
                    alt="Plato de mariscos premium"
                    className="rounded-2xl w-full h-[500px] object-cover"
                  />
                  {/* Floating Badge */}
                  <div className="absolute -bottom-4 -left-4 glass rounded-2xl p-4 shadow-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-secondary-500 rounded-full flex items-center justify-center">
                        <Award className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Premio 2024</p>
                        <p className="font-bold text-gray-900">Mejor Marisquería</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" className="w-full">
            <path d="M0,64L60,69.3C120,75,240,85,360,80C480,75,600,53,720,48C840,43,960,53,1080,58.7C1200,64,1320,64,1380,64L1440,64L1440,120L1380,120C1320,120,1200,120,1080,120C960,120,840,120,720,120C600,120,480,120,360,120C240,120,120,120,60,120L0,120Z" fill="#f9fafb"/>
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl mb-4">
                  <stat.icon className="w-8 h-8 text-primary-600" />
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Menu Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="badge badge-primary mb-4">Nuestro Menú</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">
              Platos Destacados
            </h2>
            <p className="text-xl text-gray-600">
              Selección de nuestros platillos más aclamados,
              preparados con los mariscos más frescos del Caribe
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredDishes.map((dish) => (
              <div key={dish.id} className="card-seafood group cursor-pointer">
                <div className="relative mb-4 overflow-hidden rounded-xl">
                  <img
                    src={dish.image}
                    alt={dish.name}
                    className="w-full h-48 object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="badge bg-secondary-500 text-white">
                      {dish.badge}
                    </span>
                  </div>
                </div>
                <span className="text-sm text-primary-600 font-medium">{dish.category}</span>
                <h3 className="text-xl font-serif font-bold text-gray-900 mt-1 mb-2">
                  {dish.name}
                </h3>
                <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                  {dish.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary-600">
                    {formatPrice(dish.price)}
                  </span>
                  <button className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 hover:bg-primary-600 hover:text-white transition-colors">
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/menu">
              <Button className="btn btn-primary text-lg">
                Ver Menú Completo
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="section-padding bg-sand-gradient">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="badge badge-secondary mb-4">Servicios</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">
              Tu Experiencia, Tu Elección
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Reservaciones */}
            <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-shadow">
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mb-6">
                <Calendar className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-gray-900 mb-4">
                Reservaciones
              </h3>
              <p className="text-gray-600 mb-6">
                Reserva tu mesa para disfrutar de una experiencia gastronómica
                inolvidable en nuestro restaurante frente al mar.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2 text-gray-600">
                  <div className="w-5 h-5 bg-primary-100 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  Confirmación instantánea
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <div className="w-5 h-5 bg-primary-100 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  Mesas con vista al mar
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <div className="w-5 h-5 bg-primary-100 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  Eventos especiales
                </li>
              </ul>
              <Button
                onClick={() => setIsReservationOpen(true)}
                className="btn btn-primary w-full"
              >
                Reservar Ahora
              </Button>
            </div>

            {/* Delivery */}
            <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-shadow">
              <div className="w-16 h-16 bg-accent-100 rounded-2xl flex items-center justify-center mb-6">
                <Truck className="w-8 h-8 text-accent-600" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-gray-900 mb-4">
                Delivery
              </h3>
              <p className="text-gray-600 mb-6">
                Disfruta de nuestros mariscos frescos en la comodidad de tu hogar.
                Entrega rápida en todo Cartagena.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2 text-gray-600">
                  <div className="w-5 h-5 bg-accent-100 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-accent-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  Entrega en 30-45 min
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <div className="w-5 h-5 bg-accent-100 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-accent-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  Rastreo en tiempo real
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <div className="w-5 h-5 bg-accent-100 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-accent-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  Empaques especiales
                </li>
              </ul>
              <Link to="/menu">
                <Button className="btn btn-accent w-full">
                  Pedir Ahora
                </Button>
              </Link>
            </div>

            {/* WhatsApp */}
            <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
                <MessageCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-gray-900 mb-4">
                WhatsApp
              </h3>
              <p className="text-gray-600 mb-6">
                Comunícate directamente con nosotros por WhatsApp para pedidos,
                reservas o cualquier consulta.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2 text-gray-600">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  Respuesta inmediata
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  Atención personalizada
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  Chatbot 24/7
                </li>
              </ul>
              <WhatsAppButton
                message="Hola! Me gustaría hacer un pedido"
                className="w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="section-padding bg-white overflow-hidden">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Images Grid */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <img
                    src="https://images.unsplash.com/photo-1579631542720-3a87824fff86?w=400&h=500&fit=crop"
                    alt="Chef preparando mariscos"
                    className="rounded-2xl shadow-lg w-full h-64 object-cover"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop"
                    alt="Interior del restaurante"
                    className="rounded-2xl shadow-lg w-full h-48 object-cover"
                  />
                </div>
                <div className="pt-8">
                  <img
                    src="https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&h=600&fit=crop"
                    alt="Mariscos frescos"
                    className="rounded-2xl shadow-lg w-full h-80 object-cover"
                  />
                </div>
              </div>
              {/* Floating element */}
              <div className="absolute -bottom-6 -right-6 bg-primary-600 text-white rounded-2xl p-6 shadow-xl hidden md:block">
                <div className="text-4xl font-bold mb-1">15+</div>
                <div className="text-primary-200">Años de Tradición</div>
              </div>
            </div>

            {/* Content */}
            <div>
              <span className="badge badge-primary mb-4">Nuestra Historia</span>
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">
                Tradición Marinera desde 2009
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Mar de Sabores nació del amor por el mar y la gastronomía caribeña.
                Cada día, nuestros pescadores artesanales traen los mariscos más frescos
                directamente del mar a nuestra cocina.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Nuestra filosofía es simple: ingredientes frescos, recetas tradicionales
                con un toque contemporáneo, y un servicio que te hace sentir en casa.
              </p>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Fish className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">100% Fresco</h4>
                    <p className="text-sm text-gray-500">Pesca del día</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Award className="w-6 h-6 text-secondary-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Premiados</h4>
                    <p className="text-sm text-gray-500">Múltiples reconocimientos</p>
                  </div>
                </div>
              </div>

              <Link to="/nosotros">
                <Button className="btn btn-outline">
                  Conoce Nuestra Historia
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section-padding bg-ocean-900 text-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 opacity-5">
          <Anchor className="w-96 h-96" />
        </div>

        <div className="container-custom relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="badge bg-primary-500/20 text-primary-300 mb-4">Testimonios</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">
              Lo Que Dicen Nuestros Clientes
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 md:p-12 relative">
              <div className="absolute -top-4 left-8 text-8xl text-primary-400/30 font-serif">"</div>

              <div className="text-center">
                <p className="text-xl md:text-2xl text-gray-200 mb-8 relative z-10">
                  {testimonials[currentTestimonial].comment}
                </p>

                <div className="flex items-center justify-center gap-4">
                  <img
                    src={testimonials[currentTestimonial].image}
                    alt={testimonials[currentTestimonial].name}
                    className="w-16 h-16 rounded-full border-2 border-primary-400"
                  />
                  <div className="text-left">
                    <div className="font-bold text-white">
                      {testimonials[currentTestimonial].name}
                    </div>
                    <div className="text-gray-400 text-sm">
                      {testimonials[currentTestimonial].role}
                    </div>
                    <div className="flex gap-1 mt-1">
                      {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-secondary-400 fill-secondary-400" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Dots navigation */}
              <div className="flex justify-center gap-2 mt-8">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentTestimonial
                        ? 'bg-primary-400'
                        : 'bg-white/30 hover:bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gradient-to-r from-primary-600 to-primary-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 animate-float">
            <Shell className="w-20 h-20" />
          </div>
          <div className="absolute bottom-10 right-10 animate-float" style={{ animationDelay: '1.5s' }}>
            <Waves className="w-24 h-24" />
          </div>
        </div>

        <div className="container-custom text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">
            ¿Listo para una Experiencia Única?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Reserva tu mesa ahora y déjate llevar por los sabores más
            exquisitos del mar Caribe colombiano.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              onClick={() => setIsReservationOpen(true)}
              className="btn bg-white text-primary-700 hover:bg-gray-100 text-lg"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Reservar Mesa
            </Button>
            <a href="tel:+573001234567">
              <Button className="btn btn-outline-white text-lg">
                <Phone className="w-5 h-5 mr-2" />
                +57 300 123 4567
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="badge badge-primary mb-4">Ubicación</span>
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">
                Encuéntranos
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Ubicados en el corazón del Centro Histórico de Cartagena,
                con una vista privilegiada al mar Caribe.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Dirección</h4>
                    <p className="text-gray-600">
                      Calle del Arsenal #10-43, Centro Histórico<br />
                      Cartagena de Indias, Colombia
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Horarios</h4>
                    <p className="text-gray-600">
                      Lunes a Domingo: 11:00 AM - 10:00 PM<br />
                      Viernes y Sábado: 11:00 AM - 11:00 PM
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Contacto</h4>
                    <p className="text-gray-600">
                      Teléfono: +57 300 123 4567<br />
                      Email: info@mardesabores.com
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="btn btn-primary">
                    <MapPin className="w-5 h-5 mr-2" />
                    Ver en Google Maps
                  </Button>
                </a>
              </div>
            </div>

            {/* Map placeholder */}
            <div className="relative h-[400px] md:h-[500px] rounded-3xl overflow-hidden shadow-xl">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3924.0!2d-75.5499!3d10.4236!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTDCsDI1JzI1LjAiTiA3NcKwMzInNTkuNiJX!5e0!3m2!1ses!2sco!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="grayscale hover:grayscale-0 transition-all duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Reservation Modal */}
      <ReservationModal
        isOpen={isReservationOpen}
        onClose={() => setIsReservationOpen(false)}
      />

      {/* Floating WhatsApp Button */}
      <WhatsAppButton
        floating
        message="Hola! Me gustaría hacer una consulta"
      />
    </div>
  );
};

export default HomePage;
