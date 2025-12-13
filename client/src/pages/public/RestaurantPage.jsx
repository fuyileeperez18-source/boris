import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Phone, Clock, Plus, Minus, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';
import { restaurantService, menuService } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/formatters';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

const RestaurantPage = () => {
  const { slug } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const { addItem, items: cartItems, restaurantId: cartRestaurantId } = useCart();

  useEffect(() => {
    loadRestaurant();
  }, [slug]);

  const loadRestaurant = async () => {
    try {
      const response = await restaurantService.getBySlug(slug);
      const restaurantData = response.data.data;
      setRestaurant(restaurantData);

      // Cargar menú
      const menuResponse = await menuService.getFullMenu(restaurantData.id);
      setMenu(menuResponse.data.data || []);

      if (menuResponse.data.data?.length > 0) {
        setSelectedCategory(menuResponse.data.data[0].id);
      }
    } catch (error) {
      console.error('Error cargando restaurante:', error);
      toast.error('Error al cargar el restaurante');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    const success = addItem(product, restaurant);
    if (success) {
      toast.success(`${product.name} agregado al carrito`);
    }
  };

  const getCartQuantity = (productId) => {
    if (cartRestaurantId !== restaurant?.id) return 0;
    const item = cartItems.find(i => i.product.id === productId);
    return item?.quantity || 0;
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-gray-500 text-lg">Restaurante no encontrado</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header del restaurante */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Logo */}
            <div className="w-32 h-32 bg-white rounded-xl overflow-hidden flex-shrink-0">
              {restaurant.logo_url ? (
                <img
                  src={restaurant.logo_url}
                  alt={restaurant.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-300">
                  {restaurant.name[0]}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{restaurant.name}</h1>
              <p className="text-gray-300 mb-4">{restaurant.description}</p>

              <div className="flex flex-wrap gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {restaurant.address}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  {restaurant.phone}
                </span>
              </div>
            </div>

            {/* Botón de reserva */}
            <div className="flex-shrink-0">
              <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600">
                Reservar Mesa
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Menú */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Categorías */}
          <div className="md:col-span-1">
            <div className="sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4">Categorías</h3>
              <nav className="space-y-1">
                {menu.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-primary-100 text-primary-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {category.name}
                    <span className="text-sm text-gray-400 ml-2">
                      ({category.products?.length || 0})
                    </span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Productos */}
          <div className="md:col-span-3">
            {menu.map((category) => (
              <div
                key={category.id}
                id={`category-${category.id}`}
                className={selectedCategory === category.id ? '' : 'hidden md:block'}
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b">
                  {category.name}
                </h2>

                <div className="grid gap-4 mb-8">
                  {category.products?.map((product) => (
                    <Card key={product.id} className="flex gap-4">
                      {/* Imagen del producto */}
                      <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                            Sin imagen
                          </div>
                        )}
                      </div>

                      {/* Info del producto */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900">{product.name}</h3>
                        <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                          {product.description}
                        </p>
                        <p className="font-bold text-primary-600">
                          {formatPrice(product.price)}
                        </p>
                      </div>

                      {/* Botón agregar */}
                      <div className="flex-shrink-0 flex items-center">
                        {getCartQuantity(product.id) > 0 ? (
                          <div className="flex items-center gap-2 bg-primary-100 rounded-lg p-1">
                            <span className="px-3 font-medium text-primary-700">
                              {getCartQuantity(product.id)}
                            </span>
                          </div>
                        ) : null}
                        <Button
                          size="sm"
                          onClick={() => handleAddToCart(product)}
                          className="ml-2"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}

                  {(!category.products || category.products.length === 0) && (
                    <p className="text-gray-500 text-center py-4">
                      No hay productos en esta categoría
                    </p>
                  )}
                </div>
              </div>
            ))}

            {menu.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">Este restaurante aún no tiene menú disponible</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantPage;
