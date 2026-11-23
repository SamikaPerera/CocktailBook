// Routes for /api/auth: validation rules + rate limiting + controllers.
import { Router } from 'express';
import { body } from 'express-validator';
import rateLimit from 'express-rate-limit';

import { register, login, getMe } from '../controllers/authController.js';
import { validate } from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// Rate limiting: max 20 login/register attempts per IP every 15 minutes.
// This slows down brute-force password guessing.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Too many attempts, please try again in 15 minutes' },
});

// Reusable validation rules
const emailRule = body('email')
  .trim()
  .isEmail().withMessage('Please enter a valid email')
  .toLowerCase();

const registerRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 50 }).withMessage('Name must be 50 characters or fewer'),
  emailRule,
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Za-z]/).withMessage('Password must contain a letter')
    .matches(/\d/).withMessage('Password must contain a number'),
];

const loginRules = [
  emailRule,
  body('password').notEmpty().withMessage('Password is required'),
];

router.post('/register', authLimiter, registerRules, validate, register);
router.post('/login', authLimiter, loginRules, validate, login);
router.get('/me', protect, getMe);

export default router;
