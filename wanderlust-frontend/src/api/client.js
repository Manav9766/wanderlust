import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,         // uses Vite proxy
  withCredentials: true,    // sends auth cookies
});

export default api;
