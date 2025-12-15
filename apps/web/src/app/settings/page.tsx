"use client";

import { useEffect, useState } from "react";
import RequireAuth from "../../components/RequireAuth";
import { api } from "../../lib/api";

export default function SettingsPage() {
  const [username, setUsername] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .me()
      .then((res) => {
        setUsername(res.username || res.publicKey);
        setPublicKey(res.publicKey);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load profile");
        setLoading(false);
      });
  }, []);

  const save = async () => {
    try {
      setError("");
      setMessage("Saving...");
      const res = await api.updateUsername(username);
      setUsername(res.username);
      setMessage("Username updated");
    } catch (err: any) {
      setError(err.message || "Failed to update username");
    } finally {
      setTimeout(() => setMessage(""), 1200);
    }
  };

  return (
    <RequireAuth>
      <div className="card glass">
        <h2 style={{ marginTop: 0 }}>Settings</h2>
        {loading ? (
          <p style={{ color: "var(--muted)" }}>Loading profile...</p>
        ) : (
          <>
            <p style={{ color: "var(--muted)" }}>Wallet: {publicKey}</p>
            <div style={{ display: "grid", gap: 8, maxWidth: 360 }}>
              <label style={{ display: "grid", gap: 4 }}>
                <span style={{ color: "var(--muted)" }}>Username</span>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Pick a username"
                  style={{ padding: 10, borderRadius: 8, border: "1px solid var(--border)", background: "#0f1833", color: "var(--text)" }}
                />
                <span style={{ color: "var(--muted)", fontSize: 12 }}>3-32 characters, letters/numbers/._-</span>
              </label>
              <button onClick={save} className="btn-primary" style={{ width: "fit-content" }}>
                Save
              </button>
            </div>
            {message && <p>{message}</p>}
            {error && <p style={{ color: "#ff7b7b" }}>{error}</p>}
          </>
        )}
      </div>
    </RequireAuth>
  );
}
