# 🌍 Wanderlust — Full-Stack Rental Listings Platform

Wanderlust is a full-stack web application inspired by modern vacation rental platforms. It allows users to browse listings, view detailed property information, leave reviews, and manage listings through authenticated accounts.

The project is built using the MERN stack, with a clear separation between frontend and backend , and follows production-ready practices such as authentication, authorization, pagination, and API security.

---

## 🚀 Features

### 🔐 Authentication & Authorization
- User signup and login
- Secure authentication using JWT stored in HTTP-only cookies
- Persistent login with session hydration
- Protected routes for authenticated users
- Role-based access (listing owners only)

### 🏠 Listings
- Browse all listings with pagination
- Filter by category and sort options
- View detailed listing pages
- Create, edit, and delete listings (owner only)

### ⭐ Reviews
- Add one review per user per listing
- Edit or delete your own reviews
- Average rating calculation per listing

### 🗺️ Maps Integration
- Interactive map display using MapLibre
- Location markers based on listing coordinates
- Graceful fallback when coordinates are unavailable

### ⚙️ Backend & API
- RESTful API built with Express
- MongoDB database hosted on MongoDB Atlas
- Pagination, filtering, and sorting implemented server-side
- Secure session storage using connect-mongo
- Rate limiting and security headers via Helmet

---

## 🛠️ Tech Stack

### Frontend
- React
- Vite
- React Router
- Axios
- Context API
- MapLibre GL

### Backend
- Node.js
- Express.js
- MongoDB & Mongoose
- Passport.js
- JWT Authentication
- connect-mongo
- Helmet, CORS, Rate Limiting

---

## Local development

Requires Node.js **20.19+ or 22.12+** (as required by the frontend's Vite 7 toolchain) and npm, a reachable MongoDB database (the backend uses `ATLASDB_URL`), and Cloudinary credentials for image uploads. Check `node --version` before installing dependencies; older Node.js releases can fail to run the frontend development server.

1. Install dependencies separately in `wanderlust-backend/` and `wanderlust-frontend/` with `npm install`.
2. Create `wanderlust-backend/.env` with your own credentials (do not commit it):

   ```dotenv
   ATLASDB_URL=mongodb_connection_string
   SESSION_SECRET=replace_with_a_long_random_secret
   CLOUD_NAME=your_cloudinary_cloud_name
   CLOUD_API_KEY=your_cloudinary_api_key
   CLOUD_API_SECRET=your_cloudinary_api_secret
   ```

3. From `wanderlust-backend/`, run `npm run dev` (or `npm start`). The API listens on port 8080 by default.
4. In a second terminal, from `wanderlust-frontend/`, run `npm run dev`. Open the URL printed by Vite (typically `http://localhost:5173`).

The Vite development server proxies `/api` requests to `http://localhost:8080`. If you change the backend port, update the proxy target in `wanderlust-frontend/vite.config.js` too. The backend's `FRONTEND_URL` setting can add a deployed frontend origin to its CORS configuration.

**Keep secrets private:** Store real database, session, and Cloudinary credentials only in your local environment or deployment secret manager; never add them to Git.

