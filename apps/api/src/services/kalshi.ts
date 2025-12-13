import { prisma } from "../db";

type Market = {
  ticker: string;
  title: string;
  closeTime: string;
  status: string;
  lastPrice?: number;
};

const stubMarkets: Market[] = [
  {
    ticker: "CPI_YOY",
    title: "Will CPI YoY be above 3.0%?",
    closeTime: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    status: "TRADING",
    lastPrice: 0.48
  },
  {
    ticker: "RATE_CUT_Q3",
    title: "Will the Fed cut rates by Q3?",
    closeTime: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
    status: "TRADING",
    lastPrice: 0.35
  }
];

export async function syncStubMarkets() {
  for (const m of stubMarkets) {
    await prisma.market.upsert({
      where: { ticker: m.ticker },
      update: { title: m.title, closeTime: new Date(m.closeTime), status: m.status, lastPrice: m.lastPrice ?? null },
      create: { ticker: m.ticker, title: m.title, closeTime: new Date(m.closeTime), status: m.status, lastPrice: m.lastPrice ?? null }
    });
  }
  return stubMarkets;
}

export async function listMarkets() {
  const dbMarkets = await prisma.market.findMany({ orderBy: { closeTime: "asc" } });
  if (dbMarkets.length === 0) {
    await syncStubMarkets();
    return stubMarkets;
  }
  return dbMarkets.map((m) => ({
    ticker: m.ticker,
    title: m.title,
    closeTime: m.closeTime.toISOString(),
    status: m.status,
    lastPrice: m.lastPrice ?? undefined
  }));
}
