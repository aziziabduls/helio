import { Router } from 'express';
import { eventController } from '../controllers/event.controller';
import { registrationController } from '../controllers/registration.controller';
import { optionalAuthMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// GET /api/events - List events with optional filters & pagination
router.get('/', (req, res) => eventController.getEvents(req, res));

// GET /api/events/:slug - Single event details
router.get('/:slug', (req, res) => eventController.getEventBySlug(req, res));

// POST /api/events - Create new event (authenticated if token provided)
router.post('/', optionalAuthMiddleware, (req, res) => eventController.createEvent(req, res));

// PATCH /api/events/:slug - Update event (if not ongoing)
router.patch('/:slug', optionalAuthMiddleware, (req, res) => eventController.updateEvent(req, res));
router.put('/:slug', optionalAuthMiddleware, (req, res) => eventController.updateEvent(req, res));

// GET /api/events/:id/guests - Manage guest list for an event
router.get('/:id/guests', (req, res) => eventController.getEventGuests(req, res));

// POST /api/events/:id/register - Register for event
router.post('/:id/register', (req, res) => registrationController.register(req, res));

export default router;
