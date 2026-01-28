import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // e.g. https://...onrender.com/api
  withCredentials: true, // REQUIRED because backend uses session cookies
});

export default api;
