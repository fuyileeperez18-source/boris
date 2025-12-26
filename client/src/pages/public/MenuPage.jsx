import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search, Filter, Star, Plus, Minus, ShoppingCart,
  ChevronDown, Flame, Leaf, Fish, Award
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

// Categorías del menú
const categories = [
  { id: 'todos', name: 'Todos', icon: '🍽️' },
  { id: 'ceviches', name: 'Ceviches', icon: '🥣' },
  { id: 'mariscos', name: 'Mariscos', icon: '🦐' },
  { id: 'langosta', name: 'Langosta', icon: '🦞' },
  { id: 'pescados', name: 'Pescados', icon: '🐟' },
  { id: 'arroces', name: 'Arroces', icon: '🍚' },
  { id: 'sopas', name: 'Sopas y Cazuelas', icon: '🥘' },
  { id: 'entradas', name: 'Entradas', icon: '🥗' },
  { id: 'bebidas', name: 'Bebidas', icon: '🍹' },
  { id: 'postres', name: 'Postres', icon: '🍮' },
];

// Datos del menú completo
const menuItems = [
  // Ceviches
  {
    id: 1,
    name: 'Ceviche Clásico',
    description: 'Corvina fresca marinada en limón con cebolla morada, cilantro, ají y camote',
    price: 38000,
    image: 'https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?w=400&h=300&fit=crop',
    category: 'ceviches',
    tags: ['popular', 'sin-gluten'],
    rating: 4.9,
    reviews: 124
  },
  {
    id: 2,
    name: 'Ceviche Mixto',
    description: 'Combinación de corvina, camarón y pulpo en leche de tigre con choclo',
    price: 48000,
    image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400&h=300&fit=crop',
    category: 'ceviches',
    tags: ['popular'],
    rating: 4.8,
    reviews: 89
  },
  {
    id: 3,
    name: 'Ceviche de Camarón',
    description: 'Camarones frescos en limón con tomate, aguacate y cilantro',
    price: 45000,
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop',
    category: 'ceviches',
    tags: ['sin-gluten'],
    rating: 4.7,
    reviews: 67
  },
  {
    id: 4,
    name: 'Tiradito de Pescado',
    description: 'Finas láminas de corvina con salsa de ají amarillo y leche de tigre',
    price: 42000,
    image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
    category: 'ceviches',
    tags: ['chef-choice'],
    rating: 4.9,
    reviews: 56
  },

  // Mariscos
  {
    id: 5,
    name: 'Camarones al Ajillo',
    description: 'Camarones jumbo salteados en aceite de oliva, ajo y guindilla',
    price: 55000,
    image: 'https://images.unsplash.com/photo-1625943553852-781c6dd46faa?w=400&h=300&fit=crop',
    category: 'mariscos',
    tags: ['popular', 'picante'],
    rating: 4.8,
    reviews: 98
  },
  {
    id: 6,
    name: 'Pulpo a la Parrilla',
    description: 'Pulpo tierno a la brasa con papas al romero y chimichurri',
    price: 68000,
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop',
    category: 'mariscos',
    tags: ['chef-choice'],
    rating: 4.9,
    reviews: 72
  },
  {
    id: 7,
    name: 'Calamares Fritos',
    description: 'Aros de calamar empanizados con salsa tártara y limón',
    price: 42000,
    image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&h=300&fit=crop',
    category: 'mariscos',
    tags: ['popular'],
    rating: 4.6,
    reviews: 145
  },
  {
    id: 8,
    name: 'Parrillada de Mariscos',
    description: 'Selección de camarones, langostinos, mejillones, pulpo y pescado',
    price: 125000,
    image: 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=400&h=300&fit=crop',
    category: 'mariscos',
    tags: ['para-compartir', 'premium'],
    rating: 4.9,
    reviews: 83
  },

  // Langosta
  {
    id: 9,
    name: 'Langosta al Ajillo',
    description: 'Media langosta del Caribe salteada en mantequilla de ajo y hierbas finas',
    price: 125000,
    image: 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=400&h=300&fit=crop',
    category: 'langosta',
    tags: ['premium', 'chef-choice'],
    rating: 5.0,
    reviews: 62
  },
  {
    id: 10,
    name: 'Langosta Thermidor',
    description: 'Langosta gratinada con salsa cremosa de champiñones y queso gruyere',
    price: 145000,
    image: 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=400&h=300&fit=crop',
    category: 'langosta',
    tags: ['premium'],
    rating: 4.9,
    reviews: 41
  },
  {
    id: 11,
    name: 'Langosta a la Plancha',
    description: 'Langosta entera a la plancha con mantequilla de limón y hierbas',
    price: 135000,
    image: 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=400&h=300&fit=crop',
    category: 'langosta',
    tags: ['premium', 'sin-gluten'],
    rating: 4.8,
    reviews: 38
  },

  // Pescados
  {
    id: 12,
    name: 'Pargo Rojo Frito',
    description: 'Pargo entero frito con patacones, arroz con coco y ensalada',
    price: 75000,
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop',
    category: 'pescados',
    tags: ['popular', 'tradicional'],
    rating: 4.8,
    reviews: 156
  },
  {
    id: 13,
    name: 'Mojarra Frita',
    description: 'Mojarra fresca frita con yuca, arroz y ensalada caribeña',
    price: 58000,
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&h=300&fit=crop',
    category: 'pescados',
    tags: ['tradicional'],
    rating: 4.7,
    reviews: 98
  },
  {
    id: 14,
    name: 'Robalo en Salsa de Maracuyá',
    description: 'Filete de robalo con salsa de maracuyá, puré de plátano y vegetales',
    price: 68000,
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop',
    category: 'pescados',
    tags: ['chef-choice'],
    rating: 4.9,
    reviews: 67
  },

  // Arroces
  {
    id: 15,
    name: 'Arroz con Mariscos',
    description: 'Arroz cremoso con camarones, calamares, mejillones, pulpo y langostinos',
    price: 65000,
    image: 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=400&h=300&fit=crop',
    category: 'arroces',
    tags: ['popular', 'para-compartir'],
    rating: 4.9,
    reviews: 187
  },
  {
    id: 16,
    name: 'Arroz con Camarones',
    description: 'Arroz caldoso con camarones jumbo y sofrito caribeño',
    price: 52000,
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop',
    category: 'arroces',
    tags: ['popular'],
    rating: 4.7,
    reviews: 134
  },
  {
    id: 17,
    name: 'Arroz con Coco y Camarón',
    description: 'Arroz de coco tradicional con camarones salteados',
    price: 48000,
    image: 'https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2?w=400&h=300&fit=crop',
    category: 'arroces',
    tags: ['tradicional'],
    rating: 4.6,
    reviews: 89
  },

  // Sopas y Cazuelas
  {
    id: 18,
    name: 'Cazuela de Mariscos',
    description: 'Sopa cremosa con variedad de mariscos frescos y leche de coco',
    price: 58000,
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop',
    category: 'sopas',
    tags: ['popular', 'chef-choice'],
    rating: 4.9,
    reviews: 142
  },
  {
    id: 19,
    name: 'Sancocho de Pescado',
    description: 'Sopa tradicional de pescado con yuca, plátano y verduras',
    price: 45000,
    image: 'https://images.unsplash.com/photo-1603105037880-880cd4edfb0d?w=400&h=300&fit=crop',
    category: 'sopas',
    tags: ['tradicional'],
    rating: 4.7,
    reviews: 78
  },
  {
    id: 20,
    name: 'Sopa de Camarón',
    description: 'Caldo de camarón con verduras, cilantro y toques de limón',
    price: 42000,
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop',
    category: 'sopas',
    tags: [],
    rating: 4.6,
    reviews: 56
  },

  // Entradas
  {
    id: 21,
    name: 'Coctel de Camarón',
    description: 'Camarones cocidos con salsa coctelera, aguacate y galletas',
    price: 32000,
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop',
    category: 'entradas',
    tags: ['popular'],
    rating: 4.7,
    reviews: 92
  },
  {
    id: 22,
    name: 'Patacones con Hogao',
    description: 'Plátano verde frito con salsa de tomate y cebolla criolla',
    price: 18000,
    image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&h=300&fit=crop',
    category: 'entradas',
    tags: ['vegetariano'],
    rating: 4.5,
    reviews: 67
  },
  {
    id: 23,
    name: 'Empanadas de Camarón',
    description: 'Empanadas crujientes rellenas de camarón con ají',
    price: 22000,
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop',
    category: 'entradas',
    tags: [],
    rating: 4.6,
    reviews: 54
  },

  // Bebidas
  {
    id: 24,
    name: 'Limonada de Coco',
    description: 'Limonada refrescante con leche de coco y hierbabuena',
    price: 12000,
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&h=300&fit=crop',
    category: 'bebidas',
    tags: ['popular'],
    rating: 4.8,
    reviews: 234
  },
  {
    id: 25,
    name: 'Jugo de Maracuyá',
    description: 'Jugo natural de maracuyá con hielo',
    price: 10000,
    image: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=400&h=300&fit=crop',
    category: 'bebidas',
    tags: [],
    rating: 4.6,
    reviews: 178
  },
  {
    id: 26,
    name: 'Mojito Clásico',
    description: 'Ron blanco, limón, hierbabuena, azúcar y soda',
    price: 25000,
    image: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400&h=300&fit=crop',
    category: 'bebidas',
    tags: ['alcohol'],
    rating: 4.7,
    reviews: 89
  },
  {
    id: 27,
    name: 'Piña Colada',
    description: 'Cóctel tropical con ron, piña y crema de coco',
    price: 28000,
    image: 'https://images.unsplash.com/photo-1587223962930-cb7f31384c19?w=400&h=300&fit=crop',
    category: 'bebidas',
    tags: ['alcohol', 'popular'],
    rating: 4.8,
    reviews: 112
  },

  // Postres
  {
    id: 28,
    name: 'Cocada',
    description: 'Postre tradicional de coco rallado con panela',
    price: 12000,
    image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop',
    category: 'postres',
    tags: ['tradicional'],
    rating: 4.6,
    reviews: 78
  },
  {
    id: 29,
    name: 'Flan de Coco',
    description: 'Flan cremoso de coco con caramelo',
    price: 15000,
    image: 'https://images.unsplash.com/photo-1528975604071-b4dc52a2d18c?w=400&h=300&fit=crop',
    category: 'postres',
    tags: ['popular'],
    rating: 4.8,
    reviews: 96
  },
  {
    id: 30,
    name: 'Tres Leches',
    description: 'Bizcocho bañado en tres leches con crema chantilly',
    price: 18000,
    image: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=400&h=300&fit=crop',
    category: 'postres',
    tags: [],
    rating: 4.7,
    reviews: 84
  },
];

const MenuPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState(searchParams.get('categoria') || 'todos');
  const [sortBy, setSortBy] = useState('popular');
  const [quantities, setQuantities] = useState({});
  const { addItem } = useCart();

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash && categories.some(c => c.id === hash)) {
      setActiveCategory(hash);
    }
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const filteredItems = menuItems
    .filter(item => {
      const matchesCategory = activeCategory === 'todos' || item.category === activeCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'popular') {
        return b.reviews - a.reviews;
      } else if (sortBy === 'price-low') {
        return a.price - b.price;
      } else if (sortBy === 'price-high') {
        return b.price - a.price;
      } else if (sortBy === 'rating') {
        return b.rating - a.rating;
      }
      return 0;
    });

  const handleQuantityChange = (itemId, delta) => {
    setQuantities(prev => {
      const current = prev[itemId] || 1;
      const newQty = Math.max(1, current + delta);
      return { ...prev, [itemId]: newQty };
    });
  };

  const handleAddToCart = (item) => {
    const qty = quantities[item.id] || 1;
    addItem(item, { id: 1, name: 'Mar de Sabores' }, qty);
    toast.success(`${qty}x ${item.name} agregado al carrito`);
    setQuantities(prev => ({ ...prev, [item.id]: 1 }));
  };

  const getTagBadge = (tag) => {
    const badges = {
      'popular': { bg: 'bg-accent-100', text: 'text-accent-700', label: 'Popular' },
      'chef-choice': { bg: 'bg-secondary-100', text: 'text-secondary-700', label: "Chef's Choice" },
      'premium': { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Premium' },
      'sin-gluten': { bg: 'bg-green-100', text: 'text-green-700', label: 'Sin Gluten' },
      'vegetariano': { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Vegetariano' },
      'picante': { bg: 'bg-red-100', text: 'text-red-700', label: 'Picante' },
      'tradicional': { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Tradicional' },
      'para-compartir': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Para Compartir' },
    };
    return badges[tag];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-ocean-900 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1920&h=600&fit=crop"
            alt="Fondo"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container-custom relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-4">
            Nuestro Menú
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Descubre los sabores más frescos del mar Caribe. Cada plato es preparado
            con ingredientes seleccionados y la pasión de nuestros chefs.
          </p>
        </div>
      </section>

      {/* Filters Section */}
      <section className="sticky top-20 z-30 bg-white shadow-md">
        <div className="container-custom py-4">
          {/* Search and Sort */}
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar platos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              >
                <option value="popular">Más Popular</option>
                <option value="rating">Mejor Valorado</option>
                <option value="price-low">Precio: Menor a Mayor</option>
                <option value="price-high">Precio: Mayor a Menor</option>
              </select>
            </div>
          </div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  activeCategory === category.id
                    ? 'bg-primary-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{category.icon}</span>
                <span className="font-medium">{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Menu Items */}
      <section className="section-padding">
        <div className="container-custom">
          {/* Results count */}
          <p className="text-gray-500 mb-6">
            {filteredItems.length} {filteredItems.length === 1 ? 'plato encontrado' : 'platos encontrados'}
          </p>

          {filteredItems.length === 0 ? (
            <div className="text-center py-20">
              <Fish className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-600 mb-2">
                No encontramos platos
              </h3>
              <p className="text-gray-500">
                Intenta con otra búsqueda o categoría
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group"
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {/* Tags */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                      {item.tags.slice(0, 2).map((tag) => {
                        const badge = getTagBadge(tag);
                        if (!badge) return null;
                        return (
                          <span
                            key={tag}
                            className={`px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}
                          >
                            {badge.label}
                          </span>
                        );
                      })}
                    </div>
                    {/* Rating */}
                    <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
                      <Star className="w-4 h-4 text-secondary-500 fill-secondary-500" />
                      <span className="text-sm font-medium">{item.rating}</span>
                      <span className="text-xs text-gray-500">({item.reviews})</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-serif font-bold text-gray-900">
                        {item.name}
                      </h3>
                      <span className="text-lg font-bold text-primary-600">
                        {formatPrice(item.price)}
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                      {item.description}
                    </p>

                    {/* Add to Cart */}
                    <div className="flex items-center gap-3">
                      {/* Quantity */}
                      <div className="flex items-center bg-gray-100 rounded-full">
                        <button
                          onClick={() => handleQuantityChange(item.id, -1)}
                          className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-primary-600 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-medium">
                          {quantities[item.id] || 1}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.id, 1)}
                          className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-primary-600 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Add Button */}
                      <Button
                        onClick={() => handleAddToCart(item)}
                        className="flex-1 btn btn-primary"
                        size="sm"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Agregar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Info Banner */}
      <section className="bg-primary-50 py-12">
        <div className="container-custom">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <Fish className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <p className="font-bold text-gray-900">100% Fresco</p>
                <p className="text-sm text-gray-500">Pesca del día</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center">
                <Award className="w-6 h-6 text-secondary-600" />
              </div>
              <div>
                <p className="font-bold text-gray-900">Calidad Premium</p>
                <p className="text-sm text-gray-500">Ingredientes selectos</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center">
                <Flame className="w-6 h-6 text-accent-600" />
              </div>
              <div>
                <p className="font-bold text-gray-900">Preparación Artesanal</p>
                <p className="text-sm text-gray-500">Recetas tradicionales</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MenuPage;
