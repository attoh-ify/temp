const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_KEY = "user";

let privateKey: CryptoKey | null = null;

export function setSession(data: {
  access_token: string;
  refresh_token: string;
  user: any;
}) {
  sessionStorage.setItem(ACCESS_TOKEN_KEY, data.access_token);
  sessionStorage.setItem("refresh_token", data.refresh_token);
  sessionStorage.setItem("user", JSON.stringify(data.user));
}

export function getToken() {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getUser() {
  if (typeof window === "undefined") return null;
  const stored = sessionStorage.getItem(USER_KEY);
  return stored ? JSON.parse(stored) : null;
}

export function clearSession() {
  sessionStorage.clear();
  privateKey = null;
}

/* ---------------- CRYPTO ---------------- */

export function setPrivateKey(key: CryptoKey) {
  privateKey = key;
}

export function getPrivateKey(): CryptoKey {
  if (!privateKey) throw new Error("No private key in memory");
  return privateKey;
}