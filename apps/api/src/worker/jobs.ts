import { resolutionQueue } from "../redis";
import { listMarkets, syncMarkets } from "../services/kalshi";
import { listChallenges } from "../services/challenges";

export async function enqueueResolvedChallenges() {
  // Refresh markets before resolution to catch latest status
  await syncMarkets().catch(() => null);
  const markets = await listMarkets();
  const resolvedTickers = markets.filter((m: any) => m.status === "RESOLVED").map((m: any) => m.ticker);
  if (resolvedTickers.length === 0) return;
  const challenges = await listChallenges();
  for (const ch of challenges) {
    if (resolvedTickers.includes(ch.ticker) && ch.status !== "RESOLVED") {
      await resolutionQueue.add("resolve", { challengeId: ch.id, ticker: ch.ticker }, { removeOnComplete: true });
    }
  }
}
