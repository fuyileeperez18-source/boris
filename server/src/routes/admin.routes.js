import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import * as adminController from '../controllers/admin.controller.js';

const router = Router();

// Todas las rutas requieren autenticación y rol admin
router.use(authenticate);
router.use(authorize('admin'));

// ===== DASHBOARD =====

// Dashboard principal con métricas generales
router.get('/dashboard', adminController.getDashboard);

// Métricas en tiempo real
router.get('/realtime-stats', adminController.getRealtimeStats);

// ===== REPORTES =====

// Reporte de ingresos
router.get('/reports/revenue', adminController.getRevenueReport);

// Reporte de pedidos
router.get('/reports/orders', adminController.getOrdersReport);

// Reporte de restaurantes
router.get('/reports/restaurants', adminController.getRestaurantsReport);

// Reporte de usuarios
router.get('/reports/users', adminController.getUsersReport);

// Reporte de domiciliarios
router.get('/reports/delivery', adminController.getDeliveryReport);

// Exportar reporte a CSV/Excel
router.get('/reports/export', adminController.exportReport);

// ===== CONFIGURACIÓN GLOBAL =====

// Obtener configuración de la plataforma
router.get('/config', adminController.getPlatformConfig);

// Actualizar configuración
router.put('/config', adminController.updatePlatformConfig);

// Configurar comisiones por defecto
router.put('/config/commissions', adminController.updateDefaultCommissions);

// Configurar zonas de cobertura
router.put('/config/zones', adminController.updateDeliveryZones);

// ===== GESTIÓN DE RESTAURANTES =====

// Restaurantes pendientes de aprobación
router.get('/restaurants/pending', adminController.getPendingRestaurants);

// Aprobar restaurante
router.put('/restaurants/:restaurantId/approve', adminController.approveRestaurant);

// Rechazar restaurante
router.put('/restaurants/:restaurantId/reject', adminController.rejectRestaurant);

// Suspender restaurante
router.put('/restaurants/:restaurantId/suspend', adminController.suspendRestaurant);

// ===== SOPORTE =====

// Ver tickets de soporte
router.get('/support/tickets', adminController.getSupportTickets);

// Responder ticket
router.post('/support/tickets/:ticketId/respond', adminController.respondToTicket);

// Cerrar ticket
router.put('/support/tickets/:ticketId/close', adminController.closeTicket);

// ===== LOGS Y AUDITORÍA =====

// Ver logs del sistema
router.get('/logs', adminController.getSystemLogs);

// Ver actividad de usuarios
router.get('/activity', adminController.getUserActivity);

export default router;
