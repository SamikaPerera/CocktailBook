// Entry point: load environment variables, connect to MongoDB, start listening.
import 'dotenv/config'; // reads server/.env into process.env (must come first)
import app from './app.js';
import { connectDB } from './config/db.js';
import { configurePush } from './services/pushService.js';

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    // Without a secret, JWTs can't be signed or verified, so refuse to start.
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is missing. Add it to server/.env (see .env.example).');
    }

    // Connect to the database BEFORE accepting requests, so routes
    // never run without a database.
    await connectDB(process.env.MONGODB_URI);

    // Set up Web Push with the VAPID keys (optional - warns if missing).
    configurePush();

    app.listen(PORT, () => {
      console.log(`🍸 CocktailBook API running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
