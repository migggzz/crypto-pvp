"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import WalletConnect from "../../components/WalletConnect";
import { requestNonce, verifySignature } from "../../lib/siws";
import { Buffer } from "buffer";

export default function LoginPage() {
  const { publicKey, signMessage, connected } = useWallet();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

  const handleSign = async () => {
    if (!publicKey || !signMessage) {
      setError("Connect a wallet that supports message signing.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const nonce = await requestNonce(apiBase);
      const message = `Sign in to Kalshi Solana PvP\nNonce: ${nonce}`;
      const encodedMessage = new TextEncoder().encode(message);
      const signature = await signMessage(encodedMessage);
      const sigBase64 = Buffer.from(signature).toString("base64");
      await verifySignature(apiBase, {
        publicKey: publicKey.toBase58(),
        signature: sigBase64,
        message
      });
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h1>Sign-In With Solana</h1>
      <p>Authenticate by signing a message with your wallet. No email/password required.</p>
      <div style={{ margin: "12px 0" }}>
        <WalletConnect />
      </div>
      <button onClick={handleSign} disabled={!connected || loading} style={{ padding: "10px 16px", borderRadius: 8, border: "none", background: "#2b74ff", color: "white" }}>
        {loading ? "Signing..." : "Sign Message"}
      </button>
      {error && <p style={{ color: "#ff7b7b" }}>{error}</p>}
    </div>
  );
}
