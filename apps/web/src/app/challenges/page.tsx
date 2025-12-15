"use client";

import { useEffect, useState } from "react";
import RequireAuth from "../../components/RequireAuth";
import { api } from "../../lib/api";

type Challenge = {
  id: string;
  ticker: string;
  creatorSide: number;
  opponentSide?: number;
  status: string;
  stakeLamports: number;
};

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [form, setForm] = useState({ ticker: "CPI_YOY", side: 0, stakeLamports: 1000000 });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = () =>
    api
      .challenges()
      .then((res) => setChallenges(res.challenges || res))
      .catch((err) => setError(err.message));

  useEffect(() => {
    load();
  }, []);

  const submit = async () => {
    try {
      setError("");
      setMessage("Creating challenge...");
      await api.createChallenge({
        ticker: form.ticker,
        creatorSide: Number(form.side),
        stakeLamports: Number(form.stakeLamports)
      });
      setMessage("Challenge created and on-chain init requested.");
      load();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <RequireAuth>
      <div className="card glass">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ margin: 0 }}>Challenges</h2>
            <p style={{ color: "var(--muted)" }}>Create or join binary challenges; escrow handled by the program.</p>
          </div>
          <span className="pill">{challenges.length} open</span>
        </div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 12 }}>
          <div className="card glass" style={{ minWidth: 280, flex: "0 0 320px" }}>
            <h4>Create Challenge</h4>
            <label style={{ display: "grid", gap: 6, marginTop: 8 }}>
              <span style={{ color: "var(--muted)" }}>Ticker</span>
              <input value={form.ticker} onChange={(e) => setForm({ ...form, ticker: e.target.value })} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid var(--border)", background: "#0f1833", color: "var(--text)" }} />
            </label>
            <label style={{ display: "grid", gap: 6, marginTop: 8 }}>
              <span style={{ color: "var(--muted)" }}>Your Side (0 = NO, 1 = YES)</span>
              <input type="number" value={form.side} onChange={(e) => setForm({ ...form, side: Number(e.target.value) })} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid var(--border)", background: "#0f1833", color: "var(--text)" }} />
            </label>
            <label style={{ display: "grid", gap: 6, marginTop: 8 }}>
              <span style={{ color: "var(--muted)" }}>Stake (lamports)</span>
              <input type="number" value={form.stakeLamports} onChange={(e) => setForm({ ...form, stakeLamports: Number(e.target.value) })} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid var(--border)", background: "#0f1833", color: "var(--text)" }} />
            </label>
            <button onClick={submit} className="btn-primary" style={{ marginTop: 12 }}>
              Create Challenge
            </button>
            {message && <p>{message}</p>}
            {error && <p style={{ color: "#ff7b7b" }}>{error}</p>}
          </div>
          <div style={{ flex: 1 }}>
            <h4>Open Challenges</h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
              {challenges.map((c) => (
                <div key={c.id} className="card glass">
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <p style={{ margin: 0, fontWeight: 700 }}>{c.ticker}</p>
                    <span className="pill">{c.status}</span>
                  </div>
                  <p style={{ color: "var(--muted)" }}>Stake: {c.stakeLamports} lamports</p>
                  <p style={{ color: "var(--muted)" }}>Creator side: {c.creatorSide}</p>
                  <a href={`/challenges/${c.id}`} style={{ color: "var(--accent)" }}>
                    View details
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
