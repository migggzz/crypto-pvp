"use client";

import Link from "next/link";
import RequireAuth from "../../components/RequireAuth";

export default function DashboardPage() {
  return (
    <RequireAuth>
      <div className="card glass">
        <h2 style={{ marginTop: 0 }}>Control Center</h2>
        <p style={{ color: "var(--muted)" }}>Track markets, spin up challenges, and resolve outcomes.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12, marginTop: 14 }}>
          <Link href="/markets" className="card glass" style={{ textDecoration: "none", color: "inherit" }}>
            <h3>Markets</h3>
            <p style={{ color: "var(--muted)" }}>Live Kalshi mirrors cached by the API.</p>
          </Link>
          <Link href="/challenges" className="card glass" style={{ textDecoration: "none", color: "inherit" }}>
            <h3>Challenges</h3>
            <p style={{ color: "var(--muted)" }}>Create or join PvP positions, then deposit escrow.</p>
          </Link>
          <Link href="/admin/resolve" className="card glass" style={{ textDecoration: "none", color: "inherit" }}>
            <h3>Admin Resolve</h3>
            <p style={{ color: "var(--muted)" }}>Oracle authority triggers payouts.</p>
          </Link>
          <Link href="/settings" className="card glass" style={{ textDecoration: "none", color: "inherit" }}>
            <h3>Settings</h3>
            <p style={{ color: "var(--muted)" }}>Pick or change your username linked to this wallet.</p>
          </Link>
        </div>
      </div>
    </RequireAuth>
  );
}
