// Routes for /api/specs.
//   Reading  -> any logged-in user (bartender or manager)
//   Writing  -> managers only
import { Router } from 'express';
import { body, param, query } from 'express-validator';

import {
  listSpecs, getSpec, getSpecHistory, createSpec, updateSpec, deleteSpec,
} from '../controllers/specController.js';
import { protect, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { CATEGORIES } from '../models/Spec.js';

const router = Router();

// Every spec route needs a logged-in user.
router.use(protect);

// Helper for the many "required text" fields.
const requiredText = (field, label, max) => body(field)
  .trim()
  .notEmpty().withMessage(`${label} is required`)
  .isLength({ max }).withMessage(`${label} must be ${max} characters or fewer`);

// Validation rules for creating AND updating a spec.
const specRules = [
  requiredText('name', 'Name', 80),
  body('category').isIn(CATEGORIES).withMessage('Please choose a valid category'),
  body('ingredients')
    .isArray({ min: 1, max: 30 }).withMessage('Add at least one ingredient'),
  requiredText('ingredients.*.name', 'Ingredient name', 80),
  requiredText('ingredients.*.measure', 'Ingredient measure', 40),
  requiredText('glass', 'Glass', 60),
  requiredText('ice', 'Ice', 60),
  requiredText('garnish', 'Garnish', 100),
  requiredText('method', 'Method', 2000),
  body('origin')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 60 }).withMessage('Origin must be 60 characters or fewer'),
  body('photoUrl')
    .optional({ values: 'falsy' }) // empty string = no photo
    .trim()
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage('Photo URL must be a valid http(s) link'),
];

// Reject malformed ids early with a clear 400 instead of a database error.
const idRule = param('id').isMongoId().withMessage('Invalid spec id');

const listRules = [
  query('search').optional().trim().isLength({ max: 80 }),
  query('category').optional({ values: 'falsy' }).isIn(CATEGORIES).withMessage('Unknown category'),
];

router.get('/', listRules, validate, listSpecs);
router.get('/:id', idRule, validate, getSpec);
router.get('/:id/history', idRule, validate, getSpecHistory);

router.post('/', requireRole('manager'), specRules, validate, createSpec);
router.put('/:id', requireRole('manager'), idRule, specRules, validate, updateSpec);
router.delete('/:id', requireRole('manager'), idRule, validate, deleteSpec);

export default router;
