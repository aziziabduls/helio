import { Router } from 'express';
import { registrationController } from '../controllers/registration.controller';

const router = Router();

// POST /api/events/:id/register (and /api/registrations/events/:id/register)
router.post('/events/:id/register', (req, res) => registrationController.register(req, res));

// GET /api/registrations/:ticketKey - View ticket details by ticketKey
router.get('/:ticketKey', (req, res) => registrationController.getTicket(req, res));

// PATCH /api/registrations/:id/status - Update attendee status (Approve, Reject, Check-in)
router.patch('/:id/status', (req, res) => registrationController.updateStatus(req, res));

export default router;
