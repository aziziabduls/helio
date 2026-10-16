import { Router } from 'express';
import { categoryController } from '../controllers/category.controller';

const router = Router();

// GET /api/categories
router.get('/categories', (req, res) => categoryController.getCategories(req, res));

// GET /api/cities
router.get('/cities', (req, res) => categoryController.getCities(req, res));

export default router;
