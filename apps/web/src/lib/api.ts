import { getSessionToken } from "./siws";

const apiBase = process.env.NEXT_PUBLIC_API_BASE || "https://api.idareyou.ainanosolutions.com";

async function request(path: string, init?: RequestInit) {
  const token = getSessionToken();
  const headers = new Headers(init?.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (!headers.has("Content-Type") && init?.body) headers.set("Content-Type", "application/json");

  const res = await fetch(`${apiBase}${path}`, { ...init, headers, cache: "no-store" });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res.json();
}

export const api = {
  markets: () => request("/markets"),
  challenges: () => request("/challenges"),
  challenge: (id: string) => request(`/challenges/${id}`),
  createChallenge: (body: unknown) => request("/challenges", { method: "POST", body: JSON.stringify(body) }),
  joinChallenge: (id: string, body: unknown) => request(`/challenges/${id}/join`, { method: "POST", body: JSON.stringify(body) }),
  deposit: (id: string, body: unknown) => request(`/challenges/${id}/deposit`, { method: "POST", body: JSON.stringify(body) }),
  resolve: (id: string, side: number) => request(`/resolution/${id}`, { method: "POST", body: JSON.stringify({ side }) })
};
