// GET /api/health - a simple "is the API alive?" endpoint.
// Useful for testing the setup and for Render's health checks later.
import { Router } from 'express';
import mongoose from 'mongoose';

const router = Router();

// Mongoose stores the connection state as a number; map it to readable text.
const DB_STATES = ['disconnected', 'connected', 'connecting', 'disconnecting'];

router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    database: DB_STATES[mongoose.connection.readyState] || 'unknown',
    time: new Date().toISOString(),
  });
});

export default router;
