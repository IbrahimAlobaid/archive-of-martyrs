export const CLIENT_API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

export const SERVER_API_BASE = process.env.BACKEND_INTERNAL_API_URL ?? CLIENT_API_BASE;

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
