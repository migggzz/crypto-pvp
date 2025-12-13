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
      <div className="card">
        <h2>Challenges</h2>
        <p>Create or join a binary challenge. On-chain escrow handled by the Anchor program.</p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div className="card" style={{ minWidth: 260 }}>
            <h4>Create Challenge</h4>
            <label>
              Ticker
              <input value={form.ticker} onChange={(e) => setForm({ ...form, ticker: e.target.value })} style={{ width: "100%" }} />
            </label>
            <label>
              Your Side (0 = NO, 1 = YES)
              <input type="number" value={form.side} onChange={(e) => setForm({ ...form, side: Number(e.target.value) })} style={{ width: "100%" }} />
            </label>
            <label>
              Stake (lamports)
              <input type="number" value={form.stakeLamports} onChange={(e) => setForm({ ...form, stakeLamports: Number(e.target.value) })} style={{ width: "100%" }} />
            </label>
            <button onClick={submit} style={{ marginTop: 8, padding: "8px 12px", borderRadius: 8, border: "none", background: "#2b74ff", color: "white" }}>
              Create
            </button>
            {message && <p>{message}</p>}
            {error && <p style={{ color: "#ff7b7b" }}>{error}</p>}
          </div>
          <div style={{ flex: 1 }}>
            <h4>Open Challenges</h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
              {challenges.map((c) => (
                <div key={c.id} className="card">
                  <p>Ticker: {c.ticker}</p>
                  <p>Status: {c.status}</p>
                  <p>Stake: {c.stakeLamports} lamports</p>
                  <p>Creator side: {c.creatorSide}</p>
                  <a href={`/challenges/${c.id}`} style={{ color: "#8bd3ff" }}>
                    View
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
