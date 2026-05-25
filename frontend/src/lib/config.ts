export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  pocMode: import.meta.env.VITE_POC_MODE === "true",
  appName: import.meta.env.VITE_APP_NAME || "APAD",
};
