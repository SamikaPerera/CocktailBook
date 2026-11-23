// Handlers for /api/push.
import PushSubscription from '../models/PushSubscription.js';
import { isPushConfigured } from '../services/pushService.js';

// GET /api/push/vapid-public-key
// The browser needs the PUBLIC key to create a subscription.
export function getVapidPublicKey(req, res) {
  if (!isPushConfigured()) {
    return res.status(503).json({ message: 'Push notifications are not configured on the server' });
  }
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
}

// POST /api/push/subscribe   body: { endpoint, keys: { p256dh, auth } }
// "Upsert": update the subscription if this device already subscribed,
// otherwise create it. So pressing the button twice never creates duplicates.
export async function subscribe(req, res) {
  const { endpoint, keys } = req.body;

  await PushSubscription.findOneAndUpdate(
    { endpoint },
    { endpoint, keys: { p256dh: keys.p256dh, auth: keys.auth }, user: req.user._id },
    { upsert: true, new: true, runValidators: true },
  );

  res.status(201).json({ message: 'Notifications enabled' });
}

// DELETE /api/push/subscribe   body: { endpoint }
// Called when the user turns notifications off on this device.
export async function unsubscribe(req, res) {
  await PushSubscription.deleteOne({ endpoint: req.body.endpoint, user: req.user._id });
  res.json({ message: 'Notifications disabled' });
}
