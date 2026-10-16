import { Router } from 'express';
import { userController } from '../controllers/user.controller';

const router = Router();

// GET /api/users/me - Current simulated user
router.get('/me', (req, res) => userController.getCurrentUser(req, res));

// GET /api/users/:username - Public user profile
router.get('/:username', (req, res) => userController.getUserByUsername(req, res));

export default router;
