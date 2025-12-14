import Link from "next/link";
import WalletConnect from "../components/WalletConnect";

export default function HomePage() {
  return (
    <div style={{ display: "grid", gap: 24 }}>
      <section className="card glass" style={{ padding: "32px", display: "grid", gap: 12 }}>
        <div className="pill">Solana PvP • Kalshi Oracle</div>
        <h1 style={{ fontSize: 36, margin: 0, lineHeight: 1.2 }}>Bet on real-world outcomes. Escrowed on-chain. Settled by Kalshi signals.</h1>
        <p style={{ color: "var(--muted)", maxWidth: 680 }}>
          Create or join binary challenges tied to Kalshi markets, deposit SOL into a program-controlled vault, and let the oracle authority resolve
          winners transparently.
        </p>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <Link href="/dashboard" className="btn-primary">
            Launch Dashboard
          </Link>
          <Link href="/markets" className="btn-ghost">
            Browse Markets
          </Link>
          <WalletConnect />
        </div>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
        <div className="card glass">
          <h3>Program Escrow</h3>
          <p style={{ color: "var(--muted)" }}>Lamports stay in vault PDAs until resolution; no server custody.</p>
        </div>
        <div className="card glass">
          <h3>Oracle Authority</h3>
          <p style={{ color: "var(--muted)" }}>Admin key triggers resolve based on Kalshi outcomes (MVP), auditable on-chain.</p>
        </div>
        <div className="card glass">
          <h3>SIWS Auth</h3>
          <p style={{ color: "var(--muted)" }}>Sign-In With Solana keeps sessions wallet-native; no passwords.</p>
        </div>
      </section>
    </div>
  );
}
