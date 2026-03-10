# 🔗 Lynkr — Production URL Shortener

A full-stack URL shortener with analytics, authentication, QR codes, and rate limiting.

## Tech Stack

**Backend:** Node.js · Express · MongoDB · Mongoose · JWT · bcrypt · nanoid · express-validator · express-rate-limit · QRCode  
**Frontend:** React 18 · Vite · TailwindCSS · Chart.js · React Router v6 · Axios · react-hot-toast

---

## Project Structure

```
url-shortener/
├── backend/
│   ├── controllers/        # Route handlers (auth, url, redirect)
│   ├── models/             # Mongoose schemas (User, Url)
│   ├── routes/             # Express routers (auth, url, redirect)
│   ├── middleware/         # JWT auth, input validation
│   ├── services/           # (extend here: email, redis cache)
│   ├── config/             # (extend here: db connection, redis)
│   ├── server.js           # App entry point
│   └── .env.example        # Environment variable template
└── frontend/
    ├── src/
    │   ├── components/     # Reusable UI (Navbar, ProtectedRoute)
    │   ├── pages/          # Route-level pages (Home, Dashboard, etc.)
    │   ├── context/        # React context (AuthContext)
    │   ├── services/       # Axios instance with interceptors
    │   └── hooks/          # (extend here: useLinks, useDebounce)
    ├── index.html
    ├── vite.config.js      # Proxies /api → backend in dev
    └── tailwind.config.js
```

---

## APIs

| Method | Endpoint                  | Auth | Description                          |
|--------|---------------------------|------|--------------------------------------|
| POST   | /api/auth/register        | ✗    | Create account, returns JWT          |
| POST   | /api/auth/login           | ✗    | Authenticate, returns JWT            |
| GET    | /api/auth/me              | ✓    | Get current user profile             |
| POST   | /api/url/shorten          | ✓    | Shorten a URL (custom code optional) |
| GET    | /api/url/user-links       | ✓    | Paginated list of user's links       |
| GET    | /api/url/dashboard        | ✓    | Aggregate stats + chart data         |
| GET    | /api/url/analytics/:id    | ✓    | Per-link deep analytics              |
| GET    | /api/url/qr/:id           | ✓    | Generate QR code (base64 PNG)        |
| DELETE | /api/url/:id              | ✓    | Delete a link (owner only)           |
| GET    | /:shortCode               | ✗    | Redirect to original URL             |

---

## Quick Start

### 1. Clone & Install

```bash
# Backend
cd url-shortener/backend
npm install

# Frontend
cd url-shortener/frontend
npm install
```

### 2. Configure Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

Required `.env` values:
```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/urlshortener
JWT_SECRET=change_this_to_a_long_random_string
BASE_URL=http://localhost:5000
CLIENT_URL=http://localhost:5173
```

### 3. Run Backend

```bash
cd backend
npm run dev          # Uses nodemon for hot-reload
# Server starts at http://localhost:5000
```

### 4. Run Frontend

```bash
cd frontend
npm run dev          # Vite dev server with /api proxy
# App starts at http://localhost:5173
```

---

## MongoDB Setup (Atlas)

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas) and create a free cluster
2. Create a database user (remember username/password)
3. Whitelist your IP (or 0.0.0.0/0 for dev)
4. Copy the connection string into `MONGO_URI`

---

## Deployment

### Frontend → Vercel
```bash
cd frontend
npm run build        # Creates dist/
# Push to GitHub, import repo in Vercel
# Set VITE_API_URL env var if using separate domains
```

### Backend → Render
1. Create new Web Service on [Render](https://render.com)
2. Connect GitHub repo, set root directory to `backend`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variables (MONGO_URI, JWT_SECRET, BASE_URL, CLIENT_URL)

### Database → MongoDB Atlas
Already set up above — just ensure your Render IP is whitelisted.

---

## Security Features

- **JWT** — Signed tokens with configurable expiry (default 7 days)
- **bcrypt** — Password hashing with cost factor 12
- **Rate limiting** — Global 100 req/15min, Auth 5 req/15min, Shorten 20 req/10min
- **CORS** — Restricted to configured CLIENT_URL
- **Input validation** — express-validator on all endpoints
- **Expired links** — Automatically return 410 Gone

---

## Extending the Project

- **Redis caching** — Add `ioredis`, cache shortCode lookups in redirect controller
- **Custom domains** — Add a `domain` field to the URL model
- **Click geo data** — Integrate `geoip-lite` for country/city tracking
- **Email verification** — Add nodemailer to send confirmation emails
- **Team workspaces** — Add a Workspace model and link ownership to teams
