import { useState, useRef } from 'react';
import { uploadService } from '../../services/api';
import toast from 'react-hot-toast';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';

const ImageUpload = ({
  onUpload,
  onRemove,
  images = [],
  maxImages = 5,
  accept = 'image/*',
  disabled = false
}) => {
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);

    if (images.length + files.length > maxImages) {
      toast.error(`Máximo ${maxImages} imágenes permitidas`);
      return;
    }

    setIsUploading(true);

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        toast.error('Solo se permiten imágenes');
        continue;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error('La imagen debe ser menor a 5MB');
        continue;
      }

      try {
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
        const response = await uploadService.uploadImage(file, 'products');
        const imageData = response.data.data;
        onUpload(imageData);
        toast.success('Imagen subida');
      } catch (error) {
        toast.error('Error al subir imagen');
      } finally {
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[file.name];
          return newProgress;
        });
      }
    }

    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = (image) => {
    if (onRemove) {
      onRemove(image);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);

    if (images.length + files.length > maxImages) {
      toast.error(`Máximo ${maxImages} imágenes permitidas`);
      return;
    }

    setIsUploading(true);

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        toast.error('Solo se permiten imágenes');
        continue;
      }

      try {
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
        const response = await uploadService.uploadImage(file, 'products');
        const imageData = response.data.data;
        onUpload(imageData);
        toast.success('Imagen subida');
      } catch (error) {
        toast.error('Error al subir imagen');
      } finally {
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[file.name];
          return newProgress;
        });
      }
    }

    setIsUploading(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-4">
      <div
        className={`
          border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
          ${disabled ? 'border-gray-200 bg-gray-50 cursor-not-allowed' : 'border-gray-300 hover:border-primary-500 hover:bg-primary-50'}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple
          onChange={handleFileChange}
          disabled={disabled}
          className="hidden"
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
            <p className="text-gray-600">Subiendo imágenes...</p>
            {Object.keys(uploadProgress).length > 0 && (
              <div className="w-full max-w-xs bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-primary-500 h-2 rounded-full transition-all"
                  style={{ width: '50%' }}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <Upload className="w-6 h-6 text-primary-600" />
            </div>
            <p className="font-medium text-gray-700">
              Arrastra y suelta imágenes o haz clic para seleccionar
            </p>
            <p className="text-sm text-gray-500">
              PNG, JPG hasta 5MB cada una (máx. {maxImages})
            </p>
          </div>
        )}
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {images.map((image, index) => (
            <div
              key={image.id || index}
              className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100"
            >
              <img
                src={image.url || image}
                alt={`Imagen ${index + 1}`}
                className="w-full h-full object-cover"
              />

              {!disabled && (
                <button
                  onClick={() => handleRemove(image)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {index === 0 && (
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 text-white text-xs rounded">
                  Principal
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
