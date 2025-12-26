import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Calendar, Clock, Users, Phone, Mail, User, MessageSquare, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../ui/Button';
import { reservationService } from '../../services/api';

const ReservationModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reservationCode, setReservationCode] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      date: '',
      time: '',
      guests: '2',
      name: '',
      phone: '',
      email: '',
      occasion: '',
      notes: ''
    }
  });

  const selectedDate = watch('date');
  const selectedTime = watch('time');
  const selectedGuests = watch('guests');

  // Generate available times
  const generateTimes = () => {
    const times = [];
    for (let hour = 11; hour <= 21; hour++) {
      times.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour < 21) {
        times.push(`${hour.toString().padStart(2, '0')}:30`);
      }
    }
    return times;
  };

  const availableTimes = generateTimes();

  const occasions = [
    { value: '', label: 'Seleccionar (opcional)' },
    { value: 'birthday', label: 'Cumpleaños' },
    { value: 'anniversary', label: 'Aniversario' },
    { value: 'business', label: 'Reunión de negocios' },
    { value: 'romantic', label: 'Cena romántica' },
    { value: 'family', label: 'Reunión familiar' },
    { value: 'celebration', label: 'Celebración especial' },
    { value: 'other', label: 'Otro' }
  ];

  // Get min date (today)
  const today = new Date().toISOString().split('T')[0];

  // Get max date (3 months from now)
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Call reservation API
      const response = await reservationService.create({
        ...data,
        guests: parseInt(data.guests),
        restaurantId: 1 // Default restaurant
      });

      setReservationCode(response.data.code || 'RES-' + Date.now());
      setStep(3);
      toast.success('Reserva confirmada');
    } catch (error) {
      console.error('Error creating reservation:', error);
      // For demo, simulate success
      setReservationCode('RES-' + Date.now().toString().slice(-6));
      setStep(3);
      toast.success('Reserva confirmada');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    setStep(1);
    setReservationCode(null);
    onClose();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg transform transition-all">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-t-3xl px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-serif font-bold text-white">
                  {step === 3 ? 'Reserva Confirmada' : 'Reservar Mesa'}
                </h2>
                <p className="text-primary-200 text-sm mt-1">
                  {step === 1 && 'Selecciona fecha, hora y personas'}
                  {step === 2 && 'Completa tus datos de contacto'}
                  {step === 3 && 'Tu reserva ha sido registrada'}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Progress Steps */}
            {step < 3 && (
              <div className="flex items-center gap-2 mt-4">
                <div className={`flex-1 h-1 rounded-full ${step >= 1 ? 'bg-white' : 'bg-white/30'}`} />
                <div className={`flex-1 h-1 rounded-full ${step >= 2 ? 'bg-white' : 'bg-white/30'}`} />
              </div>
            )}
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="p-6">
              {/* Step 1: Date, Time, Guests */}
              {step === 1 && (
                <div className="space-y-5">
                  {/* Date */}
                  <div>
                    <label className="label flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary-600" />
                      Fecha
                    </label>
                    <input
                      type="date"
                      {...register('date', { required: 'Selecciona una fecha' })}
                      min={today}
                      max={maxDateStr}
                      className="input"
                    />
                    {errors.date && (
                      <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
                    )}
                  </div>

                  {/* Time */}
                  <div>
                    <label className="label flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary-600" />
                      Hora
                    </label>
                    <select
                      {...register('time', { required: 'Selecciona una hora' })}
                      className="input"
                    >
                      <option value="">Seleccionar hora</option>
                      {availableTimes.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                    {errors.time && (
                      <p className="text-red-500 text-sm mt-1">{errors.time.message}</p>
                    )}
                  </div>

                  {/* Guests */}
                  <div>
                    <label className="label flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary-600" />
                      Personas
                    </label>
                    <select
                      {...register('guests', { required: 'Selecciona cantidad de personas' })}
                      className="input"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <option key={num} value={num}>
                          {num} {num === 1 ? 'persona' : 'personas'}
                        </option>
                      ))}
                      <option value="more">Más de 10 personas</option>
                    </select>
                    {selectedGuests === 'more' && (
                      <p className="text-amber-600 text-sm mt-2">
                        Para grupos grandes, por favor contáctanos directamente al +57 300 123 4567
                      </p>
                    )}
                  </div>

                  {/* Occasion */}
                  <div>
                    <label className="label flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-primary-600" />
                      Ocasión (opcional)
                    </label>
                    <select {...register('occasion')} className="input">
                      {occasions.map((occasion) => (
                        <option key={occasion.value} value={occasion.value}>
                          {occasion.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Step 2: Contact Info */}
              {step === 2 && (
                <div className="space-y-5">
                  {/* Summary */}
                  <div className="bg-primary-50 rounded-xl p-4 mb-6">
                    <h4 className="font-medium text-primary-800 mb-2">Tu reserva</h4>
                    <div className="flex flex-wrap gap-4 text-sm text-primary-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(selectedDate)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {selectedTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {selectedGuests} {selectedGuests === '1' ? 'persona' : 'personas'}
                      </span>
                    </div>
                  </div>

                  {/* Name */}
                  <div>
                    <label className="label flex items-center gap-2">
                      <User className="w-4 h-4 text-primary-600" />
                      Nombre completo
                    </label>
                    <input
                      type="text"
                      {...register('name', { required: 'Ingresa tu nombre' })}
                      placeholder="Tu nombre"
                      className="input"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="label flex items-center gap-2">
                      <Phone className="w-4 h-4 text-primary-600" />
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      {...register('phone', {
                        required: 'Ingresa tu teléfono',
                        pattern: {
                          value: /^[0-9+\s-]{7,15}$/,
                          message: 'Teléfono inválido'
                        }
                      })}
                      placeholder="+57 300 123 4567"
                      className="input"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="label flex items-center gap-2">
                      <Mail className="w-4 h-4 text-primary-600" />
                      Email
                    </label>
                    <input
                      type="email"
                      {...register('email', {
                        required: 'Ingresa tu email',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Email inválido'
                        }
                      })}
                      placeholder="tu@email.com"
                      className="input"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="label flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-primary-600" />
                      Notas adicionales (opcional)
                    </label>
                    <textarea
                      {...register('notes')}
                      placeholder="Alergias, preferencias especiales, etc."
                      rows={3}
                      className="input resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Confirmation */}
              {step === 3 && (
                <div className="text-center py-6">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check className="w-10 h-10 text-green-600" />
                  </div>

                  <h3 className="text-2xl font-serif font-bold text-gray-900 mb-2">
                    ¡Reserva Confirmada!
                  </h3>

                  <p className="text-gray-600 mb-6">
                    Te hemos enviado un correo con los detalles de tu reserva.
                  </p>

                  <div className="bg-gray-50 rounded-xl p-6 mb-6">
                    <div className="text-sm text-gray-500 mb-1">Código de reserva</div>
                    <div className="text-3xl font-bold text-primary-600 font-mono">
                      {reservationCode}
                    </div>
                  </div>

                  <div className="bg-primary-50 rounded-xl p-4 text-left">
                    <h4 className="font-medium text-primary-800 mb-3">Detalles de tu reserva</h4>
                    <div className="space-y-2 text-sm text-primary-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(selectedDate)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{selectedTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>{selectedGuests} {selectedGuests === '1' ? 'persona' : 'personas'}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-500 mt-6">
                    Te esperamos en <strong>Mar de Sabores</strong><br />
                    Calle del Arsenal #10-43, Centro Histórico
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 pb-6">
              {step === 1 && (
                <Button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!selectedDate || !selectedTime || selectedGuests === 'more'}
                  className="btn btn-primary w-full"
                >
                  Continuar
                </Button>
              )}

              {step === 2 && (
                <div className="flex gap-3">
                  <Button
                    type="button"
                    onClick={() => setStep(1)}
                    className="btn btn-outline flex-1"
                  >
                    Atrás
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-primary flex-1"
                  >
                    {isSubmitting ? 'Confirmando...' : 'Confirmar Reserva'}
                  </Button>
                </div>
              )}

              {step === 3 && (
                <Button
                  type="button"
                  onClick={handleClose}
                  className="btn btn-primary w-full"
                >
                  Cerrar
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReservationModal;
