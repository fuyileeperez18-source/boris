import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { validate } from '../middlewares/validate.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import * as commissionController from '../controllers/commission.controller.js';

const router = Router();

// Rutas para miembros del equipo
router.get('/my-commissions', authenticate, commissionController.getMyCommissions);
router.get('/my-summary', authenticate, commissionController.getMyCommissionSummary);

// Rutas de admin
router.get('/', authenticate, authorize('admin'), commissionController.getAllCommissions);
router.get('/summary', authenticate, authorize('admin'), commissionController.getSummary);
router.get('/team-members', authenticate, authorize('admin'), commissionController.getTeamMembers);
router.post('/team-members', authenticate, authorize('admin'), commissionController.createTeamMember);
router.put('/team-members/:memberId', authenticate, authorize('admin'), commissionController.updateTeamMember);
router.patch('/:commissionId/status', authenticate, authorize('admin'), commissionController.updateCommissionStatus);
router.post('/payments', authenticate, authorize('admin'), commissionController.recordPayment);

export default router;
