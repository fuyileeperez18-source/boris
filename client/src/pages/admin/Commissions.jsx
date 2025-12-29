import { useState, useEffect } from 'react';
import { commissionService } from '../../services/api';
import toast from 'react-hot-toast';
import {
  DollarSign,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Edit2,
  Search,
  Download
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const CommissionsPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [commissions, setCommissions] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [showModal, setShowModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [filters, setFilters] = useState({ status: '', search: '' });

  useEffect(() => {
    fetchData();
  }, [activeTab, pagination.page, filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        const response = await commissionService.getSummary();
        setSummary(response.data.data);
      } else if (activeTab === 'commissions') {
        const response = await commissionService.getAllCommissions({
          page: pagination.page,
          limit: 20,
          status: filters.status || undefined
        });
        setCommissions(response.data.data);
        setPagination(response.data.pagination);
      } else if (activeTab === 'team') {
        const response = await commissionService.getTeamMembers();
        setTeamMembers(response.data.data);
      }
    } catch (error) {
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-blue-100 text-blue-700',
      paid: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const tabs = [
    { id: 'overview', label: 'Resumen', icon: TrendingUp },
    { id: 'commissions', label: 'Comisiones', icon: DollarSign },
    { id: 'team', label: 'Equipo', icon: Users }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Comisiones</h1>
        <p className="text-gray-600 mt-1">Administra las comisiones del equipo</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
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

      {/* Overview Tab */}
      {activeTab === 'overview' && summary && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Comisiones</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(summary.overall?.total_commissions || 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pendiente</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(summary.overall?.pending_total || 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Aprobado</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(summary.overall?.approved_total || 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pagado</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(summary.overall?.paid_total || 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Por miembro */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Comisiones por Miembro</h3>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Miembro</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Porcentaje</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Total</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Pendiente</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.by_member?.map((member) => (
                      <tr key={member.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-gray-900">{member.name}</p>
                            <p className="text-sm text-gray-500">{member.email}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2 py-1 bg-primary-100 text-primary-700 rounded text-sm">
                            {member.percentage}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-medium">
                          {formatCurrency(member.total)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {formatCurrency(member.pending)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Commissions Tab */}
      {activeTab === 'commissions' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          {/* Filtros */}
          <div className="p-4 border-b border-gray-100 flex flex-wrap gap-4">
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="input max-w-xs"
            >
              <option value="">Todos los estados</option>
              <option value="pending">Pendiente</option>
              <option value="approved">Aprobado</option>
              <option value="paid">Pagado</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
              </div>
            ) : commissions.length === 0 ? (
              <div className="text-center py-12">
                <DollarSign className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">Sin comisiones</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Orden</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Miembro</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Monto</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Estado</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Fecha</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {commissions.map((commission) => (
                    <tr key={commission.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{commission.tracking_number}</p>
                          <p className="text-sm text-gray-500">{commission.customer_name}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-gray-900">{commission.member_name}</p>
                        <p className="text-sm text-gray-500">{commission.member_email}</p>
                      </td>
                      <td className="py-3 px-4 text-right font-medium">
                        {formatCurrency(commission.amount)}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${getStatusColor(commission.status)}`}>
                          {commission.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500">
                        {format(new Date(commission.created_at), 'dd MMM yyyy', { locale: es })}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {commission.status === 'pending' && (
                            <button
                              onClick={() => {
                                // Aquí implementar aprobación
                              }}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                              Aprobar
                            </button>
                          )}
                          {commission.status === 'approved' && (
                            <button
                              onClick={() => {
                                // Aquí implementar pago
                              }}
                              className="text-green-600 hover:text-green-700 text-sm font-medium"
                            >
                              Marcar Pagado
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Paginación */}
          {pagination.pages > 1 && (
            <div className="p-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-sm text-gray-500">
                Página {pagination.page} de {pagination.pages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="btn btn-outline btn-sm"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.pages}
                  className="btn btn-outline btn-sm"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Team Tab */}
      {activeTab === 'team' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              onClick={() => {
                setSelectedMember(null);
                setShowModal(true);
              }}
              className="btn btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar Miembro
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              <div className="col-span-full flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
              </div>
            ) : teamMembers.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">Sin miembros en el equipo</p>
              </div>
            ) : (
              teamMembers.map((member) => (
                <div key={member.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{member.name}</h3>
                      <p className="text-sm text-gray-500">{member.email}</p>
                      <span className="inline-flex items-center px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs mt-2">
                        {member.role}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedMember(member);
                        setShowModal(true);
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <Edit2 className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Porcentaje</p>
                      <p className="font-semibold text-gray-900">{member.percentage}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Ganado</p>
                      <p className="font-semibold text-gray-900">{formatCurrency(member.total_earned)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Pagado</p>
                      <p className="font-semibold text-green-600">{formatCurrency(member.total_paid)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Estado</p>
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs ${member.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {member.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modal para agregar/editar miembro */}
      {showModal && (
        <TeamMemberModal
          member={selectedMember}
          onClose={() => {
            setShowModal(false);
            setSelectedMember(null);
          }}
          onSave={() => {
            setShowModal(false);
            setSelectedMember(null);
            fetchData();
          }}
        />
      )}
    </div>
  );
};

const TeamMemberModal = ({ member, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: member?.name || '',
    email: member?.email || '',
    role: member?.role || 'manager',
    percentage: member?.percentage || 5,
    is_active: member?.is_active ?? true
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (member) {
        await commissionService.updateTeamMember(member.id, formData);
        toast.success('Miembro actualizado');
      } else {
        // Aquí necesitaríamos primero crear el usuario o seleccionarlo
        toast.error('Primero debe crear el usuario en el sistema');
      }
      onSave();
    } catch (error) {
      toast.error('Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {member ? 'Editar Miembro' : 'Agregar Miembro del Equipo'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="input"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="input"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rol
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
              className="input"
            >
              <option value="developer">Desarrollador</option>
              <option value="manager">Manager</option>
              <option value="marketing">Marketing</option>
              <option value="support">Soporte</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Porcentaje de Comisión (%)
            </label>
            <input
              type="number"
              value={formData.percentage}
              onChange={(e) => setFormData(prev => ({ ...prev, percentage: parseFloat(e.target.value) || 0 }))}
              className="input"
              min="0"
              max="100"
              step="0.5"
              required
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
              className="rounded border-gray-300"
            />
            <label htmlFor="is_active" className="text-sm text-gray-700">
              Miembro activo
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary flex-1"
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommissionsPage;
