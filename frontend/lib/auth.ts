const COOKIE_NAME = "admin_token";

export function setAdminToken(token: string) {
  document.cookie = `${COOKIE_NAME}=${token}; path=/; max-age=86400; samesite=lax`;
}

export function getAdminToken(): string | null {
  if (typeof document === "undefined") {
    return null;
  }
  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${COOKIE_NAME}=`));
  return cookie ? decodeURIComponent(cookie.split("=")[1]) : null;
}

export function clearAdminToken() {
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; samesite=lax`;
}
