import { Router } from 'express';
import { calendarController } from '../controllers/calendar.controller';
import { optionalAuthMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// GET /api/calendars - List all featured calendars
router.get('/', (req, res) => calendarController.getCalendars(req, res));

// GET /api/calendars/:slug - Get single calendar with events
router.get('/:slug', (req, res) => calendarController.getCalendarBySlug(req, res));

// POST /api/calendars - Create new community calendar
router.post('/', optionalAuthMiddleware, (req, res) => calendarController.createCalendar(req, res));

// PATCH & PUT /api/calendars/:slug - Update calendar
router.patch('/:slug', optionalAuthMiddleware, (req, res) => calendarController.updateCalendar(req, res));
router.put('/:slug', optionalAuthMiddleware, (req, res) => calendarController.updateCalendar(req, res));

export default router;
