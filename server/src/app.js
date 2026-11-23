// Builds and configures the Express application.
// Kept separate from server.js so the app can be imported without
// starting a real server (handy for testing).
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';

import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import specRoutes from './routes/specRoutes.js';
import pushRoutes from './routes/pushRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const app = express();

// --- Security & utility middleware ---

// helmet sets secure HTTP headers (e.g. stops the API being framed by other sites).
app.use(helmet());

// CORS: only allow our own front-end to call the API from a browser.
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5180')
  .split(',')
  .map((url) => url.trim());

app.use(cors({
  origin(origin, callback) {
    // Requests with no origin (curl, Postman, server-to-server) are allowed.
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    const err = new Error(`Origin ${origin} is not allowed by CORS`);
    err.status = 403;
    callback(err);
  },
}));

// Parse JSON request bodies. The size limit protects against huge payloads.
app.use(express.json({ limit: '100kb' }));

// Log each request in the terminal during development (e.g. "GET /api/health 200").
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

// --- Routes ---
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/specs', specRoutes);
app.use('/api/push', pushRoutes);

// --- Error handling (must be registered last) ---
app.use(notFound);
app.use(errorHandler);

export default app;
