import axios from "axios";

const base = import.meta.env.VITE_API_BASE_URL; // should be https://....onrender.com

const api = axios.create({
  baseURL: base ? `${base.replace(/\/$/, "")}/api` : "/api",
  withCredentials: true,
});

export default api;
