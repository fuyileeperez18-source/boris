import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, Lock, User, Phone, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      await registerUser({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
      });

      toast.success('¡Cuenta creada exitosamente!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Crear Cuenta</h1>
          <p className="text-gray-600 mt-2">
            Regístrate para pedir comida y hacer reservas
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Tu nombre completo"
                className="pl-10"
                error={errors.name?.message}
                {...register('name', {
                  required: 'El nombre es requerido',
                  minLength: {
                    value: 3,
                    message: 'Mínimo 3 caracteres',
                  },
                })}
              />
            </div>
          </div>

          <div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="email"
                placeholder="tu@email.com"
                className="pl-10"
                error={errors.email?.message}
                {...register('email', {
                  required: 'El email es requerido',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email inválido',
                  },
                })}
              />
            </div>
          </div>

          <div>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="tel"
                placeholder="300 123 4567"
                className="pl-10"
                error={errors.phone?.message}
                {...register('phone', {
                  required: 'El teléfono es requerido',
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: 'Debe ser un número de 10 dígitos',
                  },
                })}
              />
            </div>
          </div>

          <div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Contraseña (mínimo 6 caracteres)"
                className="pl-10 pr-10"
                error={errors.password?.message}
                {...register('password', {
                  required: 'La contraseña es requerida',
                  minLength: {
                    value: 6,
                    message: 'Mínimo 6 caracteres',
                  },
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Confirmar contraseña"
                className="pl-10"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword', {
                  required: 'Confirma tu contraseña',
                  validate: (value) =>
                    value === password || 'Las contraseñas no coinciden',
                })}
              />
            </div>
          </div>

          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              className="rounded border-gray-300 mt-1"
              {...register('terms', {
                required: 'Debes aceptar los términos',
              })}
            />
            <label className="text-sm text-gray-600">
              Acepto los{' '}
              <Link to="/terminos" className="text-primary-600 hover:underline">
                términos y condiciones
              </Link>{' '}
              y la{' '}
              <Link to="/privacidad" className="text-primary-600 hover:underline">
                política de privacidad
              </Link>
            </label>
          </div>
          {errors.terms && (
            <p className="text-red-500 text-sm">{errors.terms.message}</p>
          )}

          <Button type="submit" fullWidth loading={loading}>
            Crear Cuenta
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-primary-600 font-medium hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default RegisterPage;
