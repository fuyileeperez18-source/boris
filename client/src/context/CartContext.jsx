import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe usarse dentro de un CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [restaurantId, setRestaurantId] = useState(null);
  const [restaurantName, setRestaurantName] = useState('');

  // Cargar carrito desde localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const { items, restaurantId, restaurantName } = JSON.parse(savedCart);
      setItems(items || []);
      setRestaurantId(restaurantId || null);
      setRestaurantName(restaurantName || '');
    }
  }, []);

  // Guardar carrito en localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify({
      items,
      restaurantId,
      restaurantName,
    }));
  }, [items, restaurantId, restaurantName]);

  // Agregar producto al carrito
  const addItem = (product, restaurant, quantity = 1, notes = '') => {
    // Si el carrito tiene productos de otro restaurante, preguntar si limpiar
    if (restaurantId && restaurantId !== restaurant.id) {
      const confirm = window.confirm(
        `Tu carrito tiene productos de ${restaurantName}. ¿Deseas vaciarlo y agregar productos de ${restaurant.name}?`
      );
      if (!confirm) return false;
      clearCart();
    }

    setRestaurantId(restaurant.id);
    setRestaurantName(restaurant.name);

    setItems(prevItems => {
      const existingIndex = prevItems.findIndex(item => item.product.id === product.id);

      if (existingIndex >= 0) {
        // Actualizar cantidad si ya existe
        const newItems = [...prevItems];
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: newItems[existingIndex].quantity + quantity,
          notes: notes || newItems[existingIndex].notes,
        };
        return newItems;
      }

      // Agregar nuevo item
      return [...prevItems, { product, quantity, notes }];
    });

    return true;
  };

  // Actualizar cantidad de un item
  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    setItems(prevItems =>
      prevItems.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  // Remover item del carrito
  const removeItem = (productId) => {
    setItems(prevItems => {
      const newItems = prevItems.filter(item => item.product.id !== productId);

      // Si el carrito queda vacío, limpiar restaurante
      if (newItems.length === 0) {
        setRestaurantId(null);
        setRestaurantName('');
      }

      return newItems;
    });
  };

  // Limpiar carrito
  const clearCart = () => {
    setItems([]);
    setRestaurantId(null);
    setRestaurantName('');
  };

  // Actualizar notas de un item
  const updateNotes = (productId, notes) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.product.id === productId
          ? { ...item, notes }
          : item
      )
    );
  };

  // Calcular subtotal
  const subtotal = items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  // Contar items totales
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

  const value = {
    items,
    restaurantId,
    restaurantName,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    updateNotes,
    subtotal,
    itemCount,
    isEmpty: items.length === 0,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
