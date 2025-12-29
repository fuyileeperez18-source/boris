import { useState, useEffect } from 'react';
import { settingsService, adminService } from '../../services/api';
import toast from 'react-hot-toast';
import {
  Settings as SettingsIcon,
  Save,
  Upload,
  Globe,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  DollarSign,
  Truck,
  Clock,
  Info,
  FileText,
  Eye,
  Download
} from 'lucide-react';

const AdminSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    platform_name: '',
    platform_logo: null,
    primary_color: '#ff6b35',
    secondary_color: '#2d3436',
    contact_email: '',
    contact_phone: '',
    address: '',
    facebook_url: '',
    instagram_url: '',
    twitter_url: '',
    default_commission_rate: 15,
    min_order_amount: 15000,
    delivery_fee_base: 5000,
    delivery_fee_per_km: 500,
    free_delivery_threshold: 50000,
    support_phone: '',
    support_whatsapp: '',
    business_hours: '10:00 - 22:00',
    about_text: '',
    terms_url: '',
    privacy_url: '',
    refund_policy: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await settingsService.getSettings();
      setSettings(response.data.data);
    } catch (error) {
      toast.error('Error al cargar configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await settingsService.updateSettings(settings);
      toast.success('Configuración guardada');
    } catch (error) {
      toast.error('Error al guardar configuración');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Simular upload - en producción usar uploadService
    toast.success('Logo actualizado (simulado)');
    setSettings((prev) => ({
      ...prev,
      platform_logo: URL.createObjectURL(file)
    }));
  };

  const handleExport = async (type) => {
    try {
      const response = await settingsService.exportToCSV(type);

      // Crear blob y descargar
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success('Reporte descargado');
    } catch (error) {
      toast.error('Error al exportar reporte');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'contact', label: 'Contacto', icon: Globe },
    { id: 'commissions', label: 'Comisiones', icon: DollarSign },
    { id: 'delivery', label: 'Delivery', icon: Truck },
    { id: 'about', label: 'Información', icon: Info },
    { id: 'legal', label: 'Legal', icon: FileText },
    { id: 'reports', label: 'Reportes', icon: Download }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Configuración de la Plataforma</h1>
        <p className="text-gray-600 mt-1">Administra la configuración global de tu plataforma</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors
              ${activeTab === tab.id
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {/* General */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo de la Plataforma
              </label>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center">
                  {settings.platform_logo ? (
                    <img
                      src={settings.platform_logo}
                      alt="Logo"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <Upload className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <div>
                  <label className="btn btn-outline cursor-pointer">
                    <Upload className="w-4 h-4 mr-2" />
                    Subir Logo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-sm text-gray-500 mt-2">
                    PNG, JPG hasta 2MB
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la Plataforma
                </label>
                <input
                  type="text"
                  name="platform_name"
                  value={settings.platform_name}
                  onChange={handleChange}
                  className="input"
                  placeholder="BORIS"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color Primario
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    name="primary_color"
                    value={settings.primary_color}
                    onChange={handleChange}
                    className="w-12 h-12 rounded-lg cursor-pointer border border-gray-200"
                  />
                  <input
                    type="text"
                    name="primary_color"
                    value={settings.primary_color}
                    onChange={handleChange}
                    className="input flex-1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color Secundario
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    name="secondary_color"
                    value={settings.secondary_color}
                    onChange={handleChange}
                    className="w-12 h-12 rounded-lg cursor-pointer border border-gray-200"
                  />
                  <input
                    type="text"
                    name="secondary_color"
                    value={settings.secondary_color}
                    onChange={handleChange}
                    className="input flex-1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Horario de Atención
                </label>
                <input
                  type="text"
                  name="business_hours"
                  value={settings.business_hours}
                  onChange={handleChange}
                  className="input"
                  placeholder="10:00 - 22:00"
                />
              </div>
            </div>
          </div>
        )}

        {/* Contacto */}
        {activeTab === 'contact' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email de Contacto
                </label>
                <input
                  type="email"
                  name="contact_email"
                  value={settings.contact_email}
                  onChange={handleChange}
                  className="input"
                  placeholder="contacto@tusitio.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Teléfono de Contacto
                </label>
                <input
                  type="text"
                  name="contact_phone"
                  value={settings.contact_phone}
                  onChange={handleChange}
                  className="input"
                  placeholder="+57 300 123 4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono de Soporte
                </label>
                <input
                  type="text"
                  name="support_phone"
                  value={settings.support_phone}
                  onChange={handleChange}
                  className="input"
                  placeholder="+57 300 123 4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp de Soporte
                </label>
                <input
                  type="text"
                  name="support_whatsapp"
                  value={settings.support_whatsapp}
                  onChange={handleChange}
                  className="input"
                  placeholder="+57 300 123 4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Dirección
                </label>
                <input
                  type="text"
                  name="address"
                  value={settings.address}
                  onChange={handleChange}
                  className="input"
                  placeholder="Ciudad, País"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Facebook className="w-4 h-4 inline mr-2" />
                  Facebook
                </label>
                <input
                  type="url"
                  name="facebook_url"
                  value={settings.facebook_url}
                  onChange={handleChange}
                  className="input"
                  placeholder="https://facebook.com/tupagina"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Instagram className="w-4 h-4 inline mr-2" />
                  Instagram
                </label>
                <input
                  type="url"
                  name="instagram_url"
                  value={settings.instagram_url}
                  onChange={handleChange}
                  className="input"
                  placeholder="https://instagram.com/tucuenta"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Twitter className="w-4 h-4 inline mr-2" />
                  Twitter/X
                </label>
                <input
                  type="url"
                  name="twitter_url"
                  value={settings.twitter_url}
                  onChange={handleChange}
                  className="input"
                  placeholder="https://twitter.com/tucuenta"
                />
              </div>
            </div>
          </div>
        )}

        {/* Comisiones */}
        {activeTab === 'commissions' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 inline mr-2" />
                Comisión por Defecto (%)
              </label>
              <input
                type="number"
                name="default_commission_rate"
                value={settings.default_commission_rate}
                onChange={handleChange}
                className="input max-w-xs"
                min="0"
                max="100"
                step="0.5"
              />
              <p className="text-sm text-gray-500 mt-1">
                Porcentaje que se cobra a los restaurantes por cada pedido
              </p>
            </div>
          </div>
        )}

        {/* Delivery */}
        {activeTab === 'delivery' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Truck className="w-4 h-4 inline mr-2" />
                  Tarifa Base de Delivery
                </label>
                <input
                  type="number"
                  name="delivery_fee_base"
                  value={settings.delivery_fee_base}
                  onChange={handleChange}
                  className="input max-w-xs"
                  min="0"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Costo fijo por pedido (COP)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Costo por Kilómetro
                </label>
                <input
                  type="number"
                  name="delivery_fee_per_km"
                  value={settings.delivery_fee_per_km}
                  onChange={handleChange}
                  className="input max-w-xs"
                  min="0"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Costo adicional por cada km (COP)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pedido Mínimo
                </label>
                <input
                  type="number"
                  name="min_order_amount"
                  value={settings.min_order_amount}
                  onChange={handleChange}
                  className="input max-w-xs"
                  min="0"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Monto mínimo para realizar un pedido (COP)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Gratis Desde
                </label>
                <input
                  type="number"
                  name="free_delivery_threshold"
                  value={settings.free_delivery_threshold}
                  onChange={handleChange}
                  className="input max-w-xs"
                  min="0"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Pedidos con valor mayor a esto tienen delivery gratis (COP)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Información */}
        {activeTab === 'about' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Info className="w-4 h-4 inline mr-2" />
                Sobre Nosotros
              </label>
              <textarea
                name="about_text"
                value={settings.about_text}
                onChange={handleChange}
                className="input min-h-[150px]"
                placeholder="Cuéntanos sobre tu plataforma..."
              />
            </div>
          </div>
        )}

        {/* Legal */}
        {activeTab === 'legal' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
                URL Términos y Condiciones
              </label>
              <input
                type="url"
                name="terms_url"
                value={settings.terms_url}
                onChange={handleChange}
                className="input"
                placeholder="https://tupagina.com/terminos"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Eye className="w-4 h-4 inline mr-2" />
                URL Política de Privacidad
              </label>
              <input
                type="url"
                name="privacy_url"
                value={settings.privacy_url}
                onChange={handleChange}
                className="input"
                placeholder="https://tupagina.com/privacidad"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Política de Reembolsos
              </label>
              <textarea
                name="refund_policy"
                value={settings.refund_policy}
                onChange={handleChange}
                className="input min-h-[150px]"
                placeholder="Describe tu política de reembolsos..."
              />
            </div>
          </div>
        )}

        {/* Reportes */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <p className="text-gray-600">
              Exporta reportes de la plataforma en formato CSV
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                type="button"
                onClick={() => handleExport('orders')}
                className="btn btn-outline flex flex-col items-center gap-2 p-4 h-auto"
              >
                <Download className="w-6 h-6" />
                <span>Pedidos</span>
              </button>

              <button
                type="button"
                onClick={() => handleExport('restaurants')}
                className="btn btn-outline flex flex-col items-center gap-2 p-4 h-auto"
              >
                <Download className="w-6 h-6" />
                <span>Restaurantes</span>
              </button>

              <button
                type="button"
                onClick={() => handleExport('users')}
                className="btn btn-outline flex flex-col items-center gap-2 p-4 h-auto"
              >
                <Download className="w-6 h-6" />
                <span>Usuarios</span>
              </button>

              <button
                type="button"
                onClick={() => handleExport('commissions')}
                className="btn btn-outline flex flex-col items-center gap-2 p-4 h-auto"
              >
                <Download className="w-6 h-6" />
                <span>Comisiones</span>
              </button>
            </div>
          </div>
        )}

        {/* Botón guardar */}
        <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;
