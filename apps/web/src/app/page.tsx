import Link from "next/link";
import WalletConnect from "../components/WalletConnect";

export default function HomePage() {
  return (
    <div className="card">
      <h1>Kalshi-Solana PvP</h1>
      <p>Challenge friends on Kalshi market outcomes and settle trustlessly via Solana escrow.</p>
      <div style={{ display: "flex", gap: 12, marginTop: 12, alignItems: "center" }}>
        <Link href="/login" style={{ padding: "10px 16px", background: "#2b74ff", borderRadius: 8, color: "white" }}>
          Sign in with wallet
        </Link>
        <WalletConnect />
      </div>
    </div>
  );
}
