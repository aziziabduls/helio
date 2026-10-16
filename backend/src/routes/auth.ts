import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// POST /api/auth/signup - Register new account
router.post('/signup', (req, res) => authController.signup(req, res));

// POST /api/auth/login - Authenticate and get JWT
router.post('/login', (req, res) => authController.login(req, res));

// GET /api/auth/me - Get current authenticated user profile
router.get('/me', authMiddleware, (req, res) => authController.getMe(req, res));

// PATCH /api/auth/profile - Update authenticated user profile
router.patch('/profile', authMiddleware, (req, res) => authController.updateProfile(req, res));

export default router;
