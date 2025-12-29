import { useState, useEffect } from 'react';
import { wishlistService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Heart } from 'lucide-react';

const WishlistButton = ({ productId, size = 'md', showText = false }) => {
  const { isAuthenticated } = useAuth();
  const [inWishlist, setInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      checkWishlist();
    }
  }, [productId, isAuthenticated]);

  const checkWishlist = async () => {
    try {
      const response = await wishlistService.checkInWishlist(productId);
      setInWishlist(response.data.data.in_wishlist);
    } catch (error) {
      // Silenciosamente manejar error
    }
  };

  const toggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión para agregar a wishlist');
      return;
    }

    setLoading(true);

    try {
      if (inWishlist) {
        await wishlistService.removeFromWishlist(productId);
        setInWishlist(false);
        toast.success('Eliminado de tu wishlist');
      } else {
        await wishlistService.addToWishlist(productId);
        setInWishlist(true);
        toast.success('Agregado a tu wishlist');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al actualizar wishlist');
    } finally {
      setLoading(false);
    }
  };

  const sizesConfig = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  if (!isAuthenticated) return null;

  return (
    <button
      onClick={toggleWishlist}
      disabled={loading}
      className={`
        inline-flex items-center justify-center rounded-full transition-all
        ${inWishlist
          ? 'bg-red-50 text-red-500 hover:bg-red-100'
          : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'
        }
        ${loading ? 'opacity-50 cursor-wait' : ''}
      `}
      title={inWishlist ? 'Quitar de wishlist' : 'Agregar a wishlist'}
    >
      <Heart className={`${sizesConfig[size]} ${inWishlist ? 'fill-current' : ''}`} />

      {showText && (
        <span className="ml-2 text-sm font-medium">
          {inWishlist ? 'En wishlist' : 'Agregar a wishlist'}
        </span>
      )}
    </button>
  );
};

export default WishlistButton;
