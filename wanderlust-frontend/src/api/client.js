import axios from "axios";

const api = axios.create({
  baseURL: "/api",          // uses Vite proxy
  withCredentials: true,    // sends auth cookies
});

export default api;
