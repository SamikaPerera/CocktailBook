// Generates a VAPID key pair for Web Push.  Run with:  npm run generate-vapid
//
// VAPID ("Voluntary Application Server Identification") keys prove to the
// browser's push service (Google, Mozilla, Microsoft, Apple) that push
// messages really come from OUR server.
//   - The PUBLIC key is given to the browser when it subscribes.
//   - The PRIVATE key stays secret on the server and signs every push.
//
// Generate them ONCE. If you change them, every existing subscription stops
// working and users must enable notifications again.
import webpush from 'web-push';

const { publicKey, privateKey } = webpush.generateVAPIDKeys();

console.log('\nCopy these lines into server/.env:\n');
console.log(`VAPID_PUBLIC_KEY=${publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${privateKey}`);
console.log('VAPID_SUBJECT=mailto:you@example.com   <- use a real contact email\n');
