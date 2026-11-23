// Routes for /api/push - any logged-in user can subscribe their device.
import { Router } from 'express';
import { body } from 'express-validator';

import { getVapidPublicKey, subscribe, unsubscribe } from '../controllers/pushController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(protect);

// Push endpoints are always https URLs at a push service.
const endpointRule = body('endpoint')
  .isURL({ protocols: ['https'], require_protocol: true, require_tld: false })
  .withMessage('Invalid push subscription endpoint');

const subscriptionRules = [
  endpointRule,
  body('keys.p256dh').isString().notEmpty().withMessage('Missing subscription key p256dh'),
  body('keys.auth').isString().notEmpty().withMessage('Missing subscription key auth'),
];

router.get('/vapid-public-key', getVapidPublicKey);
router.post('/subscribe', subscriptionRules, validate, subscribe);
router.delete('/subscribe', endpointRule, validate, unsubscribe);

export default router;
