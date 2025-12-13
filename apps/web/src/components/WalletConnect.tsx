"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useEffect, useState } from "react";

export default function WalletConnect() {
  const { publicKey, connected, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      const t = setTimeout(() => setCopied(false), 800);
      return () => clearTimeout(t);
    }
  }, [copied]);

  if (!connected) {
    return (
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <WalletMultiButton style={{ background: "#2b74ff", color: "white", borderRadius: 8, padding: "10px 16px" }} />
        <button onClick={() => setVisible(true)} style={{ padding: "10px 16px", borderRadius: 8, background: "#233058", color: "white", border: "1px solid #3a4b7d" }}>
          Open Modal
        </button>
      </div>
    );
  }

  const short = `${publicKey?.toBase58().slice(0, 4)}...${publicKey?.toBase58().slice(-4)}`;

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <button
        onClick={() => {
          navigator.clipboard.writeText(publicKey?.toBase58() || "");
          setCopied(true);
        }}
        style={{ padding: "8px 12px", borderRadius: 8, background: "#121a33", border: "1px solid #2b74ff", color: "#dfe8ff" }}
      >
        {copied ? "Copied" : short}
      </button>
      <button onClick={() => disconnect()} style={{ padding: "8px 12px", borderRadius: 8, background: "#233058", border: "1px solid #3a4b7d", color: "#dfe8ff" }}>
        Disconnect
      </button>
    </div>
  );
}
