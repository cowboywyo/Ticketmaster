import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import config from './config/index.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './modules/auth/auth.routes.js';
import projectsRoutes from './modules/projects/projects.routes.js';
import ticketsRoutes from './modules/tickets/tickets.routes.js';
import commentsRoutes from './modules/comments/comments.routes.js';
import attachmentsRoutes from './modules/attachments/attachments.routes.js';
import labelsRoutes from './modules/labels/labels.routes.js';
import activityRoutes from './modules/activity/activity.routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(helmet());
app.use(cors({ origin: config.clientUrl, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Serve local uploads when OSS is not configured
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/projects', projectsRoutes);
app.use('/api/v1/projects/:projectId/tickets', ticketsRoutes);
app.use('/api/v1/projects/:projectId/labels', labelsRoutes);
app.use('/api/v1/tickets/:ticketId/comments', commentsRoutes);
app.use('/api/v1/tickets/:ticketId/attachments', attachmentsRoutes);
app.use('/api/v1/tickets/:ticketId/activity', activityRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use(errorHandler);

export default app;
