"use client";

import { useEffect, useState } from "react";
import RequireAuth from "../../../components/RequireAuth";
import { api } from "../../../lib/api";

export default function ResolvePage() {
  const [eligible, setEligible] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = () =>
    api
      .challenges()
      .then((res) => {
        const list = res.challenges || res;
        setEligible(list.filter((c: any) => c.status === "READY_FOR_RESOLVE" || c.status === "LIVE"));
      })
      .catch((err) => setError(err.message));

  useEffect(() => {
    load();
  }, []);

  const resolve = async (id: string, side: number) => {
    try {
      setMessage(`Resolving ${id}...`);
      await api.resolve(id, side);
      setMessage(`Resolved ${id}`);
      load();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <RequireAuth>
      <div className="card glass">
        <h2 style={{ marginTop: 0 }}>Admin Resolution</h2>
        <p style={{ color: "var(--muted)" }}>Oracle authority uses backend-admin key to call on-chain resolve instruction.</p>
        {eligible.map((c) => (
          <div key={c.id} className="card glass" style={{ marginTop: 10 }}>
            <p style={{ margin: 0, fontWeight: 700 }}>{c.ticker}</p>
            <p style={{ color: "var(--muted)" }}>ID: {c.id}</p>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => resolve(c.id, 0)} className="btn-ghost">
                Resolve NO (0)
              </button>
              <button onClick={() => resolve(c.id, 1)} className="btn-primary">
                Resolve YES (1)
              </button>
            </div>
          </div>
        ))}
        {message && <p>{message}</p>}
        {error && <p style={{ color: "#ff7b7b" }}>{error}</p>}
      </div>
    </RequireAuth>
  );
}
