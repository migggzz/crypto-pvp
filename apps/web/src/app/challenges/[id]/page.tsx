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
        <div className="card">Loading challenge...</div>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <div className="card">
        <h2>Challenge {challenge.id}</h2>
        <p>Ticker: {challenge.ticker}</p>
        <p>Status: {challenge.status}</p>
        <p>Stake: {challenge.stakeLamports} lamports</p>
        <p>Creator side: {challenge.creatorSide}</p>
        <p>Opponent side: {challenge.opponentSide ?? "TBD"}</p>
        {challenge.resultSide !== undefined && <p>Result side: {challenge.resultSide}</p>}
        <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
          <div className="card" style={{ minWidth: 240 }}>
            <h4>Join</h4>
            <p>Pick the opposite side to join.</p>
            <input type="number" value={joinSide} onChange={(e) => setJoinSide(Number(e.target.value))} />
            <button onClick={join} style={{ marginTop: 8, padding: "8px 12px", borderRadius: 8, border: "none", background: "#2b74ff", color: "white" }}>
              Join Challenge
            </button>
          </div>
          <div className="card" style={{ minWidth: 240 }}>
            <h4>Deposit</h4>
            <p>Submit on-chain deposit to escrow vault.</p>
            <input type="number" value={depositLamports} onChange={(e) => setDepositLamports(Number(e.target.value))} />
            <button onClick={deposit} style={{ marginTop: 8, padding: "8px 12px", borderRadius: 8, border: "none", background: "#2b74ff", color: "white" }}>
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
