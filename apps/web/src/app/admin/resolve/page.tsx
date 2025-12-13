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
      <div className="card">
        <h2>Admin Resolution</h2>
        <p>Oracle authority uses backend-admin key to call on-chain resolve instruction.</p>
        {eligible.map((c) => (
          <div key={c.id} className="card" style={{ marginTop: 10 }}>
            <p>ID: {c.id}</p>
            <p>Ticker: {c.ticker}</p>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => resolve(c.id, 0)} style={{ padding: "8px 12px", borderRadius: 8, border: "none", background: "#233058", color: "#c3d3ff" }}>
                Resolve NO (0)
              </button>
              <button onClick={() => resolve(c.id, 1)} style={{ padding: "8px 12px", borderRadius: 8, border: "none", background: "#2b74ff", color: "white" }}>
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
