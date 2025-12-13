"use client";

import Link from "next/link";
import RequireAuth from "../../components/RequireAuth";

export default function DashboardPage() {
  return (
    <RequireAuth>
      <div className="card">
        <h2>Dashboard</h2>
        <p>View markets, create challenges, and manage live positions.</p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 10 }}>
          <Link href="/markets" className="card" style={{ textDecoration: "none", color: "inherit", minWidth: 220 }}>
            <h3>Markets</h3>
            <p>Browse Kalshi markets mirrored for PvP challenges.</p>
          </Link>
          <Link href="/challenges" className="card" style={{ textDecoration: "none", color: "inherit", minWidth: 220 }}>
            <h3>Challenges</h3>
            <p>Create or join binary outcome challenges.</p>
          </Link>
          <Link href="/admin/resolve" className="card" style={{ textDecoration: "none", color: "inherit", minWidth: 220 }}>
            <h3>Admin Resolve</h3>
            <p>Oracle authority finalizes outcomes and triggers payouts.</p>
          </Link>
        </div>
      </div>
    </RequireAuth>
  );
}
