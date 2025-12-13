import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/formatters';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

const CartPage = () => {
  const {
    items,
    restaurantName,
    subtotal,
    updateQuantity,
    removeItem,
    clearCart,
    isEmpty,
  } = useCart();

  if (isEmpty) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Tu carrito está vacío
        </h1>
        <p className="text-gray-600 mb-8">
          Explora los restaurantes y agrega productos a tu carrito
        </p>
        <Link to="/restaurantes">
          <Button>Ver Restaurantes</Button>
        </Link>
      </div>
    );
  }

  const deliveryFee = 4000;
  const total = subtotal + deliveryFee;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Tu Carrito</h1>
      <p className="text-gray-600 mb-8">Pedido de {restaurantName}</p>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Lista de productos */}
        <div className="md:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.product.id} className="flex gap-4">
              <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                {item.product.image_url ? (
                  <img
                    src={item.product.image_url}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                    Sin imagen
                  </div>
                )}
              </div>

              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{item.product.name}</h3>
                <p className="text-primary-600 font-medium">
                  {formatPrice(item.product.price)}
                </p>

                {/* Controles de cantidad */}
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center border rounded-lg">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="p-1 hover:bg-gray-100"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-3 font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="p-1 hover:bg-gray-100"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.product.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="text-right">
                <p className="font-bold text-gray-900">
                  {formatPrice(item.product.price * item.quantity)}
                </p>
              </div>
            </Card>
          ))}

          <button
            onClick={clearCart}
            className="text-red-500 hover:text-red-700 text-sm"
          >
            Vaciar carrito
          </button>
        </div>

        {/* Resumen */}
        <div>
          <Card className="sticky top-24">
            <h3 className="font-semibold text-gray-900 mb-4">Resumen del pedido</h3>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Domicilio</span>
                <span>{formatPrice(deliveryFee)}</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary-600">{formatPrice(total)}</span>
              </div>
            </div>

            <Link to="/checkout" className="block mt-6">
              <Button fullWidth>
                Continuar al pago
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
