import { clearSession, getToken } from "../auth/session";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://whisperbox.koyeb.app";

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = getToken();
  console.log("TOKEN:", token);

  const isInternal = endpoint.startsWith("/api/");

  const url = isInternal
    ? endpoint
    : `${BASE_URL}${endpoint}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const text = await res.text();

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = null;
  }

  if (!res.ok) {
    throw data || { error: "Request failed", raw: text };
  }

  return data;
}