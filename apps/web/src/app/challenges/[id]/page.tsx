"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import RequireAuth from "../../../components/RequireAuth";
import { api } from "../../../lib/api";

type Challenge = {
  id: string;
  ticker: string;
  status: string;
  creatorSide: number;
  opponentSide?: number;
  stakeLamports: number;
  resultSide?: number;
};

export default function ChallengeDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [error, setError] = useState("");
  const [joinSide, setJoinSide] = useState(1);
  const [message, setMessage] = useState("");
  const [depositLamports, setDepositLamports] = useState(1000000);

  const load = () =>
    api
      .challenge(id)
      .then((res) => setChallenge(res.challenge || res))
      .catch((err) => setError(err.message));

  useEffect(() => {
    if (id) load();
  }, [id]);

  const join = async () => {
    try {
      setMessage("Joining...");
      await api.joinChallenge(id, { opponentSide: Number(joinSide) });
      setMessage("Join submitted. Deposit on-chain to go live.");
      load();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const deposit = async () => {
    try {
      setMessage("Depositing...");
      await api.deposit(id, { lamports: Number(depositLamports) });
      setMessage("Deposit requested. Confirm wallet transaction.");
      load();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (!challenge) {
    return (
      <RequireAuth>
        <div className="card glass">Loading challenge...</div>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <div className="card glass">
        <h2 style={{ marginTop: 0 }}>Challenge {challenge.id}</h2>
        <div style={{ display: "grid", gap: 6, color: "var(--muted)" }}>
          <div className="pill">Ticker: {challenge.ticker}</div>
          <span>Status: {challenge.status}</span>
          <span>Stake: {challenge.stakeLamports} lamports</span>
          <span>Creator side: {challenge.creatorSide}</span>
          <span>Opponent side: {challenge.opponentSide ?? "TBD"}</span>
          {challenge.resultSide !== undefined && <span>Result side: {challenge.resultSide}</span>}
        </div>
        <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
          <div className="card glass" style={{ minWidth: 240 }}>
            <h4>Join</h4>
            <p>Pick the opposite side to join.</p>
            <input type="number" value={joinSide} onChange={(e) => setJoinSide(Number(e.target.value))} />
            <button onClick={join} className="btn-primary" style={{ marginTop: 8 }}>
              Join Challenge
            </button>
          </div>
          <div className="card glass" style={{ minWidth: 240 }}>
            <h4>Deposit</h4>
            <p>Submit on-chain deposit to escrow vault.</p>
            <input type="number" value={depositLamports} onChange={(e) => setDepositLamports(Number(e.target.value))} />
            <button onClick={deposit} className="btn-primary" style={{ marginTop: 8 }}>
              Deposit Stake
            </button>
          </div>
        </div>
        {message && <p>{message}</p>}
        {error && <p style={{ color: "#ff7b7b" }}>{error}</p>}
      </div>
    </RequireAuth>
  );
}
