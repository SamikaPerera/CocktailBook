// One push subscription = one browser/device that agreed to receive notifications.
// The browser gives us these values when the user taps "Enable notifications".
import mongoose from 'mongoose';

const pushSubscriptionSchema = new mongoose.Schema(
  {
    // Unique URL at the push service (e.g. fcm.googleapis.com/...) for this device.
    endpoint: { type: String, required: true, unique: true },
    // Encryption keys: push messages are end-to-end encrypted for this browser.
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true },
    },
    // Which user enabled notifications on this device.
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

export default mongoose.model('PushSubscription', pushSubscriptionSchema);
