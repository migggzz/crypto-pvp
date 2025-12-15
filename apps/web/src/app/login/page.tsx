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
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || "https://apiidareyou.ainanosolutions.com";

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
    <div className="card glass">
      <h1 style={{ marginTop: 0 }}>Sign-In With Solana</h1>
      <p style={{ color: "var(--muted)" }}>Authenticate by signing a message with your wallet. No email/password required.</p>
      <div style={{ margin: "12px 0" }}>
        <WalletConnect />
      </div>
      <button onClick={handleSign} disabled={!connected || loading} className="btn-primary">
        {loading ? "Signing..." : "Sign Message"}
      </button>
      {error && <p style={{ color: "#ff7b7b" }}>{error}</p>}
    </div>
  );
}
