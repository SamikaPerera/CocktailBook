// Authentication & authorisation middleware.
//   protect           -> "are you logged in?"   (valid JWT required)
//   requireRole(...)  -> "are you allowed?"     (e.g. manager only)
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Small helper to create an error with an HTTP status code.
function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

// Checks the "Authorization: Bearer <token>" header and loads the user.
export async function protect(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw httpError(401, 'Not logged in');
  }

  let payload;
  try {
    // Throws if the token was tampered with, signed with another secret, or expired.
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw httpError(401, 'Session expired or invalid, please log in again');
  }

  // Look the user up again so deleted users can't keep using old tokens.
  const user = await User.findById(payload.id);
  if (!user) throw httpError(401, 'User no longer exists');

  req.user = user; // available to every route handler after this
  next();
}

// Usage: router.post('/', protect, requireRole('manager'), handler)
// Must run AFTER protect, because it relies on req.user.
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      throw httpError(403, 'You do not have permission to do this');
    }
    next();
  };
}
