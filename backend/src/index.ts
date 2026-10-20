import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import authRouter from './routes/auth';
import calendarsRouter from './routes/calendars';
import categoriesRouter from './routes/categories';
import eventsRouter from './routes/events';
import registrationsRouter from './routes/registrations';
import usersRouter from './routes/users';
import swaggerUi from 'swagger-ui-express';
import { openApiSpec } from './docs/openapi';
import { sendError, sendSuccess } from './utils/response';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);
// Support base64 image uploads up to 10MB (comfortably covers 2MB raw images)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Payload too large error catcher
app.use((err: any, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err.type === 'entity.too.large' || err.status === 413) {
    return sendError(
      res,
      'Request entity too large. The file exceeds the maximum allowed size (2 MB).',
      413,
      'VALIDATION_ERROR'
    );
  }
  next(err);
});

// Request logger
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check
app.get('/api/health', (_req, res) => {
  return sendSuccess(res, 'helio Events backend is operational', {
    status: 'ok',
    service: 'helio-events-backend',
    database: 'postgresql',
  });
});

// Mount Routes
app.use('/api/auth', authRouter);
app.use('/api/events', eventsRouter);
app.use('/api/registrations', registrationsRouter);
app.use('/api/calendars', calendarsRouter);
app.use('/api', categoriesRouter);
app.use('/api/users', usersRouter);

// Swagger API Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));
app.get('/api/docs.json', (_req, res) => res.json(openApiSpec));
app.get('/docs', (_req, res) => res.redirect('/api/docs'));

// 404 fallback
app.use((_req, res) => {
  return sendError(res, 'Endpoint not found', 404, 'NOT_FOUND');
});

app.listen(PORT, () => {
  console.log(`🚀 helio Events Express backend running on http://localhost:${PORT}`);
});
