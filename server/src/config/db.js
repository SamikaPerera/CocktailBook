// Database connection helper.
// Mongoose manages a pool of connections to MongoDB Atlas for us;
// we only need to call connect() once when the server starts.
import mongoose from 'mongoose';

export async function connectDB(uri) {
  if (!uri) {
    throw new Error('MONGODB_URI is missing. Copy server/.env.example to server/.env and fill it in.');
  }

  // Log connection events so problems are easy to spot in the terminal.
  mongoose.connection.on('connected', () => console.log('✅ MongoDB connected'));
  mongoose.connection.on('error', (err) => console.error('❌ MongoDB error:', err.message));
  mongoose.connection.on('disconnected', () => console.warn('⚠️  MongoDB disconnected'));

  await mongoose.connect(uri);
}
