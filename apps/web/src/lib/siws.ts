import Cookies from "js-cookie";

const TOKEN_KEY = "siws_token";

export function setSessionToken(token: string) {
  Cookies.set(TOKEN_KEY, token, { sameSite: "lax" });
}

export function getSessionToken(): string | undefined {
  return Cookies.get(TOKEN_KEY);
}

export function clearSession() {
  Cookies.remove(TOKEN_KEY);
}

export async function requestNonce(apiBase: string) {
  const res = await fetch(`${apiBase}/auth/nonce`);
  if (!res.ok) throw new Error("Failed to fetch nonce");
  const data = await res.json();
  return data.nonce as string;
}

export async function verifySignature(apiBase: string, payload: { publicKey: string; signature: string; message: string }) {
  const res = await fetch(`${apiBase}/auth/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Signature verification failed");
  const data = await res.json();
  setSessionToken(data.token);
  return data.token as string;
}
