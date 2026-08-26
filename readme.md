# 🌍 Wanderlust — Full-Stack Rental Listings Platform

Wanderlust is a full-stack web application inspired by modern vacation rental platforms. It allows users to browse listings, view detailed property information, leave reviews, and manage listings through authenticated accounts.

The project uses a React/Vite frontend and a Node.js/Express/MongoDB backend, with authentication, authorization, pagination, API security, image uploads, maps, and AI-assisted features.

---

## 🚀 Features

### 🔐 Authentication & Authorization
- User signup and login
- Secure authentication with server-side sessions and HTTP-only cookies
- Persistent login with session hydration
- Protected routes for authenticated users
- Listing-owner authorization

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

### 🤖 AI Features
- Generate listing descriptions
- Summarize guest reviews
- OpenAI-backed API endpoints protected by authentication

### ⚙️ Backend & API
- RESTful API built with Express
- MongoDB database with Mongoose
- Pagination, filtering, and sorting implemented server-side
- Secure session storage using `connect-mongo`
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
- `express-session` and `connect-mongo`
- Cloudinary
- OpenAI API
- Helmet, CORS, and rate limiting

---

## ▶️ Local Setup

### Prerequisites

- Node.js and npm
- A MongoDB connection string
- Cloudinary credentials for image uploads
- An OpenAI API key for AI-assisted features

### 1. Clone the repository

```bash
git clone https://github.com/Manav9766/wanderlust.git
cd wanderlust
```

### 2. Configure the backend

Install dependencies:

```bash
cd wanderlust-backend
npm install
```

Create a `.env` file inside `wanderlust-backend`:

```env
ATLASDB_URL=your_mongodb_connection_string
SESSION_SECRET=your_session_secret
CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret
OPENAI_API_KEY=your_openai_api_key
FRONTEND_URL=http://localhost:5173
```

Start the backend in development mode:

```bash
npm run dev
```

The backend uses port `8080` by default unless `PORT` is set in the environment.

### 3. Configure the frontend

In a second terminal:

```bash
cd wanderlust-frontend
npm install
npm run dev
```

Vite serves the frontend locally and typically uses `http://localhost:5173`.

### 4. Production checks

Before opening a pull request or deploying the frontend, run:

```bash
cd wanderlust-frontend
npm run lint
npm run build
```

---

## 📁 Project Structure

```text
wanderlust/
├── wanderlust-backend/   # Express API, authentication, database, uploads, AI routes
├── wanderlust-frontend/  # React/Vite client
└── readme.md
```

Do not commit `.env` files or real credentials. Keep deployment secrets in the environment configuration provided by your hosting platform.
