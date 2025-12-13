import "./globals.css";
import { ReactNode } from "react";
import Link from "next/link";
import WalletContext from "../components/WalletContext";
import WalletConnect from "../components/WalletConnect";

export const metadata = {
  title: "Kalshi Solana PvP",
  description: "Binary outcome challenges backed by Kalshi markets and Solana escrow."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <WalletContext>
          <header style={{ padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#0c132a", borderBottom: "1px solid #1f2a4d" }}>
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <Link href="/" style={{ fontWeight: 700, textDecoration: "none", color: "#f0f4ff" }}>
                Kalshi Solana PvP
              </Link>
              <nav style={{ display: "flex", gap: 10, fontSize: 14 }}>
                <Link href="/dashboard">Dashboard</Link>
                <Link href="/markets">Markets</Link>
                <Link href="/challenges">Challenges</Link>
                <Link href="/admin/resolve">Admin</Link>
              </nav>
            </div>
            <WalletConnect />
          </header>
          <main style={{ padding: "20px", maxWidth: 1100, margin: "0 auto" }}>{children}</main>
        </WalletContext>
      </body>
    </html>
  );
}
