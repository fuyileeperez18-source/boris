import { useState, useEffect } from 'react';
import { reviewService } from '../../services/api';
import toast from 'react-hot-toast';
import { Star, User, MessageSquare, ThumbsUp, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const StarRating = ({ rating, onChange, readonly = false, size = 'md' }) => {
  const [hover, setHover] = useState(0);

  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer'} focus:outline-none`}
          onClick={() => onChange && onChange(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
        >
          <Star
            className={`${sizes[size]} ${
              star <= (hover || rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

const ReviewCard = ({ review, onEdit, onDelete, canModify = false }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
          {review.user_avatar ? (
            <img
              src={review.user_avatar}
              alt={review.user_name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <User className="w-6 h-6 text-primary-600" />
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold text-gray-900">{review.user_name}</h4>
              <div className="flex items-center gap-2 mt-1">
                <StarRating rating={review.rating} readonly size="sm" />
                <span className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(review.created_at), { locale: es, addSuffix: true })}
                </span>
              </div>
            </div>

            {canModify && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onEdit(review)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4 text-gray-500" />
                </button>
                <button
                  onClick={() => onDelete(review.id)}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            )}
          </div>

          {review.title && (
            <h5 className="font-medium text-gray-800 mt-3">{review.title}</h5>
          )}

          {review.comment && (
            <p className="text-gray-600 mt-2">{review.comment}</p>
          )}

          <div className="flex items-center gap-4 mt-4">
            <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
              <ThumbsUp className="w-4 h-4" />
              <span>Útil</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const RatingSummary = ({ summary }) => {
  const total = summary.total_reviews || 0;
  const average = summary.average_rating || 0;

  if (total === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Sin reseñas todavía</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center gap-8">
        <div className="text-center">
          <div className="text-5xl font-bold text-gray-900">{average.toFixed(1)}</div>
          <StarRating rating={Math.round(average)} readonly size="lg" />
          <p className="text-sm text-gray-500 mt-1">{total} reseñas</p>
        </div>

        <div className="flex-1 space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = summary.rating_distribution?.[star] || 0;
            const percentage = total > 0 ? (count / total) * 100 : 0;

            return (
              <div key={star} className="flex items-center gap-2">
                <span className="text-sm text-gray-600 w-8">{star}</span>
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-500 w-8">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const ReviewForm = ({ productId, onSubmit, onCancel, initialData = null }) => {
  const [rating, setRating] = useState(initialData?.rating || 0);
  const [title, setTitle] = useState(initialData?.title || '');
  const [comment, setComment] = useState(initialData?.comment || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error('Por favor selecciona una calificación');
      return;
    }

    setLoading(true);

    try {
      await onSubmit({
        product_id: productId,
        rating,
        title,
        comment
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {initialData ? 'Editar tu reseña' : 'Escribe tu reseña'}
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tu calificación
          </label>
          <StarRating rating={rating} onChange={setRating} size="lg" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Título (opcional)
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Resume tu experiencia"
            maxLength={100}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tu experiencia
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Describe qué te gustó o no del producto..."
            rows={4}
            maxLength={1000}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={loading || rating === 0}
            className="btn btn-primary"
          >
            {loading ? 'Enviando...' : initialData ? 'Actualizar reseña' : 'Enviar reseña'}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-outline"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>
    </form>
  );
};

const ReviewSection = ({
  productId,
  canReview = false,
  onReviewCreated
}) => {
  const [reviews, setReviews] = useState([]);
  const [ratingSummary, setRatingSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [sort, setSort] = useState('newest');

  const fetchReviews = async (page = 1) => {
    setLoading(true);
    try {
      const [reviewsRes, summaryRes] = await Promise.all([
        reviewService.getProductReviews(productId, { page, limit: 10, sort }),
        reviewService.getProductRatingSummary(productId)
      ]);

      setReviews(reviewsRes.data.data);
      setRatingSummary(summaryRes.data.data);
      setPagination(reviewsRes.data.pagination);
    } catch (error) {
      toast.error('Error al cargar reseñas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId, sort]);

  const handleSubmitReview = async (data) => {
    try {
      if (editingReview) {
        await reviewService.updateReview(editingReview.id, data);
        toast.success('Reseña actualizada');
      } else {
        await reviewService.createReview(data);
        toast.success('Reseña publicada');
      }

      setShowForm(false);
      setEditingReview(null);
      onReviewCreated?.();
      fetchReviews();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al publicar reseña');
    }
  };

  const handleEdit = (review) => {
    setEditingReview(review);
    setShowForm(true);
  };

  const handleDelete = async (reviewId) => {
    if (!confirm('¿Estás seguro de eliminar tu reseña?')) return;

    try {
      await reviewService.deleteReview(reviewId);
      toast.success('Reseña eliminada');
      fetchReviews();
    } catch (error) {
      toast.error('Error al eliminar reseña');
    }
  };

  const handlePageChange = (newPage) => {
    fetchReviews(newPage);
  };

  return (
    <div className="space-y-6">
      {/* Resumen de rating */}
      <RatingSummary summary={ratingSummary} />

      {/* Botón para escribir reseña */}
      {canReview && !showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary w-full sm:w-auto"
        >
          <MessageSquare className="w-5 h-5 mr-2" />
          Escribir reseña
        </button>
      )}

      {/* Formulario de reseña */}
      {showForm && (
        <ReviewForm
          productId={productId}
          onSubmit={handleSubmitReview}
          onCancel={() => {
            setShowForm(false);
            setEditingReview(null);
          }}
          initialData={editingReview}
        />
      )}

      {/* Filtros */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Reseñas ({pagination?.total || 0})
        </h3>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="newest">Más recientes</option>
          <option value="oldest">Más antiguas</option>
          <option value="highest">Mejor calificación</option>
          <option value="lowest">Menor calificación</option>
        </select>
      </div>

      {/* Lista de reseñas */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <MessageSquare className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">Sin reseñas todavía</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onEdit={handleEdit}
              onDelete={handleDelete}
              canModify={canReview}
            />
          ))}
        </div>
      )}

      {/* Paginación */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="btn btn-outline btn-sm"
          >
            Anterior
          </button>

          <span className="text-sm text-gray-600">
            Página {pagination.page} de {pagination.pages}
          </span>

          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.pages}
            className="btn btn-outline btn-sm"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};

export { ReviewSection, ReviewForm, StarRating, RatingSummary, ReviewCard };
export default ReviewSection;
