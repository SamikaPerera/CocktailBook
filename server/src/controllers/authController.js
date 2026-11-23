// Handlers for /api/auth. Express 5 automatically passes errors thrown
// in async functions to our error handler, so no try/catch is needed.
import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';

// POST /api/auth/register
// Anyone can sign up, but ALWAYS as a bartender. Letting people choose
// their own role would let anyone make themselves a manager.
// Manager accounts are created by the seed script.
export async function register(req, res) {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ message: 'An account with this email already exists' });
  }

  const user = await User.create({ name, email, password, role: 'bartender' });

  res.status(201).json({ token: generateToken(user), user });
}

// POST /api/auth/login
export async function login(req, res) {
  const { email, password } = req.body;

  // The password field is hidden by default (select: false), so ask for it here.
  const user = await User.findOne({ email }).select('+password');

  // Same message whether the email or the password is wrong, so attackers
  // can't use the login form to find out which emails are registered.
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  res.json({ token: generateToken(user), user });
}

// GET /api/auth/me - returns the logged-in user (used by the client on page load).
export async function getMe(req, res) {
  res.json({ user: req.user });
}
