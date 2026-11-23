# 🍸 CocktailBook

A digital cocktail spec manual for a small bar, built as a full-stack **Progressive Web App (PWA)**.

- **Bar managers** create, edit and delete the house cocktail specs.
- **Bartenders** search and read specs on their phone during service, even **offline**, and get **push notifications** when a spec is added or changed.

## Tech stack

| Layer     | Technology |
|-----------|------------|
| Front-end | React 19 (Vite 6), React Router, mobile-first CSS |
| PWA       | Web App Manifest, Workbox service worker via `vite-plugin-pwa`, Web Push API |
| Back-end  | Node.js, Express 5 REST API |
| Database  | MongoDB (local for development, MongoDB Atlas for deployment) with Mongoose 8 |
| Security  | JWT, bcrypt password hashing, role-based middleware, express-validator, helmet, CORS, rate limiting |
| Push      | `web-push` with VAPID keys |

## Project structure

```
CocktailBook/
├── client/                     React + Vite PWA
│   ├── index.html
│   ├── vite.config.js          Vite config (port 5180, dev proxy /api -> :5000)
│   ├── .env.example
│   └── src/
│       ├── main.jsx            Entry point (router + AuthProvider)
│       ├── App.jsx             Layout and routes
│       ├── index.css           Mobile-first styles and design tokens
│       ├── api/client.js       fetch() wrapper: base URL, JSON, JWT header, errors
│       ├── context/            AuthContext (logged-in user, login/register/logout)
│       ├── api/specs.js        Spec API calls (list, get, create, update, delete)
│       ├── constants/          Spec categories (mirrors the server list)
│       ├── constants/cache.js  Cache names shared by the app and the service worker
│       ├── components/         Header, ProtectedRoute, ConfirmDialog, OfflineBanner
│       ├── hooks/              useOnlineStatus
│       ├── utils/              filterSpecs (offline-friendly search)
│       ├── sw.js               Service worker: precache, runtime caching (push in Phase 5)
│       └── pages/              One component per screen (Specs, SpecDetail, Manage, SpecForm, ...)
└── server/                     Express REST API
    ├── .env.example
    └── src/
        ├── server.js           Entry point: loads .env, connects DB, starts server
        ├── app.js              Express app: security middleware, routes, error handling
        ├── config/db.js        MongoDB connection
        ├── models/             Mongoose schemas (User, Spec)
        ├── controllers/        Request handling logic (auth, specs)
        ├── routes/             URL -> validation -> middleware -> controller
        ├── middleware/         auth (protect, requireRole), validate, errorHandler
        ├── services/           pushService (send Web Push, clean up expired)
        ├── utils/              generateToken (JWT)
        └── scripts/            seed.js (demo accounts + world cocktail library in data/), generateVapidKeys.js
```

## Prerequisites

- **Node.js 20 or later** (20.19+ or 22 LTS recommended)
- **MongoDB**: either a local install (`mongodb://127.0.0.1:27017/cocktailbook`, the default in `.env.example`) for development, or a free **MongoDB Atlas** account (https://www.mongodb.com/cloud/atlas), which is needed for deployment

## Setup

### 1. Create the database (MongoDB Atlas)

> Skip this step for local development if MongoDB is installed on your PC; the default `MONGODB_URI` already points to it.

1. Create a free **M0** cluster.
2. **Database Access**: add a database user with a username and password.
3. **Network Access**: add your IP address (or `0.0.0.0/0` for development/Render).
4. **Connect → Drivers**: copy the connection string. Add the database name `cocktailbook` before the `?`, e.g.
   `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/cocktailbook?retryWrites=true&w=majority`

### 2. Server

```bash
cd server
npm install
cp .env.example .env        # Windows PowerShell: Copy-Item .env.example .env
# edit .env: set MONGODB_URI and a long random JWT_SECRET
npm run generate-vapid      # prints VAPID keys for push - paste them into .env (once)
npm run seed                # creates the demo accounts (safe to re-run)
npm run dev                 # starts on http://localhost:5000 with auto-restart
```

Generate a JWT secret with:
`node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

Test it: open http://localhost:5000/api/health and you should see
`{ "status": "ok", "database": "connected", ... }`.

### 3. Client

In a **second terminal**:

```bash
cd client
npm install
cp .env.example .env        # leave VITE_API_URL empty for local development
npm run dev                 # opens on http://localhost:5180
```

### Demo accounts (created by `npm run seed`)

| Role      | Email                         | Password       |
|-----------|-------------------------------|----------------|
| Manager   | `manager@cocktailbook.test`   | `Manager123`   |
| Bartender | `bartender@cocktailbook.test` | `Bartender123` |

You can change these with the `SEED_*` variables in `server/.env`. Change them before deploying.

## Extra features

| Feature | Where | How it works |
|---------|-------|--------------|
| World cocktail library | `server/src/scripts/data/` | `npm run seed` loads **860 specs from 39 countries**: 60 hand-picked classics (`worldCocktails.js`), ~400 individually written specs (`libraryRows.js`) and variations generated from base recipes, e.g. *Strawberry Margarita*, *Vodka Collins*, *Frozen Mango Daiquiri* (`libraryBuilder.js`, assembled in `cocktailLibrary.js`). Drinks without an established recipe are house creations in the **Signature** category. Existing specs are never overwritten; library drinks are dated 30 days back so they don't show as NEW |
| Gallery paging | `SpecsPage.jsx`, `ManagePage.jsx` | 24 cards (manager list: 50 rows) at a time with a **Show more** button; search and filters always cover the whole library |
| Origin & regions | `Spec.origin`, `client/src/constants/countries.js` | Optional country per spec (suggestions in the form), shown with its flag (a globe on devices that can't draw flag emojis, e.g. Windows). Gallery filter by region; search also matches the country |
| Cocktail gallery | `pages/SpecsPage.jsx`, `components/SpecGalleryCard.jsx` | Responsive grid (2 / 3 / 4 per row) of tall cards with a dark spot-lit "bar" stage and the drink's glass; hovering lifts the glass and sets the liquid moving. Spec pages add a breadcrumb and a **More like this** strip |
| Change history | `server/src/models/SpecChange.js`, `utils/diffSpec.js`, `client/src/components/ChangeHistory.jsx` | Every create/update stores who changed what and when. Updates compare old and new values field by field (ingredients are matched by name: added / removed / measure changed). Saving without changes adds nothing and sends no notification |
| "What changed" | Spec detail page | If a spec changed in the last 7 days, the latest changes are shown at the top (old value struck through, new value highlighted). Push notifications for updates also say what changed |
| NEW / UPDATED badges | `client/src/utils/specFreshness.js` | Specs created or updated in the last 7 days are badged in the list and on the detail page |
| Batch scaler | `client/src/utils/scaleMeasure.js`, `components/BatchScaler.jsx` | ×1 / ×2 / ×4 / ×8 and ml ↔ oz (1 oz = 30 ml). Understands `50 ml`, `2 cl`, `3/4 oz`, `1 1/2 oz`, `1½ oz`, `2 dashes`; leaves `Top` / `Pinch` unchanged; shows the total batch volume. The chosen unit is remembered |
| Favourites & recently viewed | `client/src/hooks/useFavourites.js` | Star a spec on its page; filter with the **★ Favourites** chip; the last 5 viewed specs appear at the top of the list. Stored per user in `localStorage`, so it works offline |
| Service mode | `components/ServiceMode.jsx`, `hooks/useWakeLock.js` | Full-screen, high-contrast, extra-large spec (with the current batch size and unit). Uses the **Screen Wake Lock API** to keep the phone screen on, re-acquired when the user returns to the app |
| Light / dark theme | `hooks/useTheme.js`, `components/ThemeToggle.jsx`, colour tokens in `index.css` | Follows the phone's setting until the user chooses; the choice is saved and applied before the page draws (inline script in `index.html`) |
| Sort & quick stats | `pages/SpecsPage.jsx`, `components/ManageStats.jsx` | Sort by A–Z, recently updated or category (kept in the URL). Manager page: count-up stat cards and animated bars per category |
| Print | Spec page | A print stylesheet hides buttons and the background for a clean spec card |

## Animations

| Animation | Where | How it works |
|-----------|-------|--------------|
| Pouring cocktail glass | `components/CocktailGlass.jsx`, `utils/drinkColour.js` | SVG glass chosen from the spec's glass type. Ingredients are poured one by one; the liquid rises and its colour is a volume-weighted blend of real ingredient colours (clear spirits barely tint, Campari or espresso tint strongly). Wavy moving surface, ice from the *ice* field, bubbles for fizzy drinks, crema/foam for espresso or egg white, garnish from the *garnish* field drops onto the rim. Tap to pour again. A still version is used in the list |
| Login splash | `components/PourSplash.jsx` | A bottle tips and pours into a coupe, which fills; a cherry drops in. One 2.4 s CSS timeline; the form fades in at 0.9 s, so it never blocks login |
| Bar-light background | `components/BokehBackground.jsx` | Soft radial-gradient "bokeh" lights drifting slowly; surfaces use a frosted-glass blur |
| UI motion | `index.css`, `components/Skeleton.jsx`, `context/ToastContext.jsx` | Page transitions, staggered list items, shimmering skeletons while loading, star "burst", measures that pop when scaled, slide-in toasts, animated dialogs |
| Accessibility | `@media (prefers-reduced-motion)` + `utils/motion.js` | Users who turn on *Reduce motion* get the finished state without movement |

## PWA and offline support

| Feature | Where | How it works |
|---------|-------|--------------|
| Manifest | `vite.config.js` (`manifest`) | Name, colours, `display: standalone` and icons, so the app can be installed to the home screen |
| Icons | `public/logo.svg` → `npm run generate-pwa-assets` | Generates favicon, 64/192/512 px, maskable and Apple touch icons (`pwa-assets.config.js`) |
| Service worker | `src/sw.js` (Workbox, `injectManifest`) | Our own SW file, so push code can be added in Phase 5 |
| App shell | `precacheAndRoute(self.__WB_MANIFEST)` | HTML/JS/CSS/icons cached at install; every page URL falls back to cached `index.html` |
| Spec API cache | `NetworkFirst` on `GET /api/specs*` | Online: latest data (4 s timeout). Offline: last saved response. Only 200 responses are cached |
| Photos | `CacheFirst` on images | Photos viewed once are available offline |
| Offline search | `utils/filterSpecs.js` | The full list is loaded once and filtered in the browser, so any search works offline |
| Offline detail | `SpecDetailPage.jsx` | Uses the cached spec, or finds it in the cached full list if it was never opened |
| Offline banner | `hooks/useOnlineStatus.js` + `OfflineBanner.jsx` | `navigator.onLine` plus `online`/`offline` events |
| Logout | `AuthContext.jsx` | Deletes the API cache so a shared device doesn't keep the recipes |

### Testing the PWA

The service worker is only active in the **production build** (it's disabled in `npm run dev` so code changes aren't hidden behind a cache):

```bash
cd client
npm run build
npm run preview             # http://localhost:4180 (API still proxied to :5000)
```

1. Log in and open **Specs** (and a spec or two) while online.
2. DevTools → **Application → Service Workers**: `sw.js` should be *activated and running*. **Manifest** shows the icons.
3. DevTools → **Network** → set throttling to **Offline** (or stop the server).
4. Reload: the app still opens, the **offline banner** appears, search and spec details still work.
5. Chrome/Edge show an **Install** icon in the address bar; on Android use *Add to Home screen*.

## Push notifications

```
Manager saves spec ─► Express (specController) ─► pushService.sendToAll()
                                                   │  signs with VAPID private key,
                                                   │  encrypts for each subscription
                                                   ▼
                                Push service (Google FCM / Mozilla / Windows / Apple)
                                                   ▼
                         Bartender's phone: service worker "push" event ─► notification
                                 tap ─► "notificationclick" ─► opens /specs/:id
```

| Step | Where |
|------|-------|
| Generate VAPID keys (once) | `cd server && npm run generate-vapid`, then paste into `server/.env` |
| "Enable notifications" button | `client/src/components/NotificationToggle.jsx` (Home page) |
| Permission → subscribe → save | `client/src/utils/push.js` → `POST /api/push/subscribe` |
| Subscriptions stored | `server/src/models/PushSubscription.js` (unique `endpoint`, upserted) |
| Send on create/update | `notifySpecChange()` in `server/src/services/pushService.js`, called by `specController` (not awaited, so saving stays fast) |
| Expired subscriptions | Push service replies 404/410 → subscription deleted |
| Show + click | `push` and `notificationclick` handlers in `client/src/sw.js` |
| Turn off / logout | `DELETE /api/push/subscribe` + `subscription.unsubscribe()`; logout unsubscribes the device |

**Testing:** push needs the service worker, so use `npm run build && npm run preview` (http://localhost:4180). `localhost` counts as a secure origin; on a real phone the app must be served over **HTTPS** (e.g. the deployed Netlify/Vercel URL). On **iPhone** (iOS 16.4+) push only works after *Share → Add to Home Screen* and opening the installed app. Incognito/private windows don't support push.

## How the pieces talk to each other (development)

```
Browser (localhost:5180) --/api/...--> Vite dev proxy --> Express (localhost:5000) --> MongoDB
```

The Vite proxy makes the API look like it's on the same origin as the front-end, so there are no CORS problems in development. In production the client calls the API directly through `VITE_API_URL`, and the server's CORS setting (`CLIENT_URL`) allows that origin.

## Security design

| Concern | How it's handled |
|---------|------------------|
| Password storage | Hashed with **bcrypt** (12 salt rounds) in a Mongoose `pre('save')` hook; the hash is never returned (`select: false` + `toJSON`) |
| Authentication | **JWT** signed with `JWT_SECRET`, sent as `Authorization: Bearer <token>`, expires after `JWT_EXPIRES_IN` |
| Authorisation | `protect` middleware verifies the token and loads the user; `requireRole('manager')` blocks non-managers (403) |
| Role escalation | Public registration always creates a **bartender**; managers come from the seed script |
| Input validation | **express-validator** rules on every write route; errors return 400 with per-field messages. Only validated fields are saved (`matchedData`), so extra fields like `createdBy` are ignored |
| Search injection | Search text is regex-escaped before querying MongoDB |
| One version per drink | Unique, case-insensitive index on spec `name` (duplicate returns 409) |
| Brute force | **express-rate-limit**: 20 auth requests per IP per 15 minutes |
| User enumeration | Login returns the same "Invalid email or password" for wrong email or wrong password |
| HTTP headers | **helmet** |
| Cross-origin | **CORS** restricted to `CLIENT_URL` |
| Secrets | Kept in `.env` (git-ignored); `.env.example` documents them |
| Client routes | `ProtectedRoute` hides pages from logged-out users / non-managers; this is UX only, the server is the real gatekeeper |

## API endpoints

| Method | Endpoint | Access | Phase |
|--------|----------|--------|-------|
| GET    | `/api/health` | Public | 1 |
| POST   | `/api/auth/register` | Public (rate-limited) | 2 |
| POST   | `/api/auth/login` | Public (rate-limited) | 2 |
| GET    | `/api/auth/me` | Logged in | 2 |
| GET    | `/api/specs?search=&category=` | Logged in | 3 |
| GET    | `/api/specs/:id` | Logged in | 3 |
| GET    | `/api/specs/:id/history` | Logged in | Upgrade |
| POST   | `/api/specs` | Manager | 3 |
| PUT    | `/api/specs/:id` | Manager | 3 |
| DELETE | `/api/specs/:id` | Manager | 3 |
| GET    | `/api/push/vapid-public-key` | Logged in | 5 |
| POST   | `/api/push/subscribe` | Logged in | 5 |
| DELETE | `/api/push/subscribe` | Logged in | 5 |

## Build progress

- [x] Phase 1: Project setup
- [x] Phase 2: Authentication and security
- [x] Phase 3: Spec CRUD (manager)
- [x] Phase 4: Search, spec detail, PWA and offline
- [x] Phase 5: Push notifications
- [ ] Phase 6: Polish and deployment
