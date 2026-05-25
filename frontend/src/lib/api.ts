import axios from "axios";
import { config } from "./config";
import { getToken, logout } from "./auth";

export const api = axios.create({
  baseURL: config.apiBaseUrl,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((req) => {
  const token = getToken();
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      logout();
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

export const apiPublic = axios.create({
  baseURL: config.apiBaseUrl,
  headers: { "Content-Type": "application/json" },
});
