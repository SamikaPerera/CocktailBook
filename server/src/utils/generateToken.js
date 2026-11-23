// Creates a signed JWT (JSON Web Token) for a logged-in user.
// The token proves who the user is on every later request, so the
// server doesn't need to store sessions.
import jwt from 'jsonwebtoken';

export function generateToken(user) {
  // The payload is readable by anyone (it's only signed, not encrypted),
  // so we only put the user id and role in it - never the password.
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
  );
}
