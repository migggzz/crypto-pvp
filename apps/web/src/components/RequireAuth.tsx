"use client";

import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import { getSessionToken, clearSession } from "../lib/siws";
import { useWallet } from "@solana/wallet-adapter-react";
import WalletConnect from "./WalletConnect";

export default function RequireAuth({ children }: { children: ReactNode }) {
  const { connected, publicKey } = useWallet();
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const token = getSessionToken();
    setAuthed(!!token || connected);
    setReady(true);
  }, [connected]);

  if (!ready) return <div>Loading session...</div>;

  if (!authed) {
    return (
      <div className="card">
        <p>You need to sign in with your wallet to access this page.</p>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <WalletConnect />
          <Link href="/login">Go to SIWS login</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
        <button
          onClick={() => {
            clearSession();
            window.location.href = "/login";
          }}
          style={{ padding: "6px 12px", borderRadius: 8, background: "#222d4f", color: "#c3d3ff", border: "1px solid #2f3d6a" }}
        >
          Sign out
        </button>
      </div>
      {children}
    </div>
  );
}
