function normalizeBaseUrl(value: string) {
  return value.replace(/\/+$/, "");
}

function getPublicEnvVar(name: "NEXT_PUBLIC_API_BASE_URL" | "NEXT_PUBLIC_SITE_URL", fallback: string) {
  const value = process.env[name]?.trim();
  if (value) {
    return normalizeBaseUrl(value);
  }

  return normalizeBaseUrl(fallback);
}

export const CLIENT_API_BASE = getPublicEnvVar(
  "NEXT_PUBLIC_API_BASE_URL",
  "http://localhost:8000/api/v1"
);

export const SERVER_API_BASE = normalizeBaseUrl(process.env.BACKEND_INTERNAL_API_URL?.trim() || CLIENT_API_BASE);

export const SITE_URL = getPublicEnvVar("NEXT_PUBLIC_SITE_URL", "http://localhost:3000");
