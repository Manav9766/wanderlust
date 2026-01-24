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


