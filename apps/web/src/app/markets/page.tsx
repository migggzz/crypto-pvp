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
      <div className="card">
        <h2>Kalshi Markets (stub)</h2>
        <p>Data fetched from API cache. Replace with official Kalshi endpoints once available.</p>
        {error && <p style={{ color: "#ff7b7b" }}>{error}</p>}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12, marginTop: 12 }}>
          {markets.map((m) => (
            <div key={m.ticker} className="card">
              <h4>{m.title}</h4>
              <p>Ticker: {m.ticker}</p>
              <p>Close: {new Date(m.closeTime).toLocaleString()}</p>
              <p>Status: {m.status}</p>
              <p>Last price: {m.lastPrice ?? "n/a"}</p>
            </div>
          ))}
        </div>
      </div>
    </RequireAuth>
  );
}
