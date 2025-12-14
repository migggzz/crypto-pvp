"use client";

import { useEffect, useState } from "react";
import RequireAuth from "../../components/RequireAuth";
import { api } from "../../lib/api";

type Market = {
  ticker: string;
  title: string;
  closeTime: string;
  status: string;
  lastPrice?: number;
};

export default function MarketsPage() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .markets()
      .then((res) => setMarkets(res.markets || res))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <RequireAuth>
      <div className="card glass">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ margin: 0 }}>Kalshi Markets</h2>
            <p style={{ color: "var(--muted)" }}>Live pull from Kalshi API (falls back to stub if unavailable).</p>
          </div>
          <span className="pill">{markets.length} markets</span>
        </div>
        {error && <p style={{ color: "#ff7b7b" }}>{error}</p>}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14, marginTop: 16 }}>
          {markets.map((m) => (
            <div key={m.ticker} className="card glass">
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <h4 style={{ margin: 0 }}>{m.title}</h4>
                <span className="pill">{m.status}</span>
              </div>
              <p style={{ color: "var(--muted)" }}>Ticker: {m.ticker}</p>
              <p style={{ color: "var(--muted)" }}>Close: {new Date(m.closeTime).toLocaleString()}</p>
              <p style={{ color: "var(--muted)" }}>Last price: {m.lastPrice ?? "n/a"}</p>
            </div>
          ))}
        </div>
      </div>
    </RequireAuth>
  );
}
