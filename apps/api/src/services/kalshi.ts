import { prisma } from "../db";
import { config } from "../config";
import { request } from "undici";

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

function normalizeMarket(raw: any): Market | null {
  if (!raw) return null;
  // Kalshi public docs expose tickers like "FED_CUT_2024" with close_time/market_ticker fields.
  const ticker = raw.ticker || raw.market_ticker || raw.event_ticker;
  const title = raw.title || raw.market_title || raw.name;
  const close = raw.close_time || raw.closeTime || raw.end_date || raw.expiration_time;
  const status = (raw.status || raw.state || "TRADING").toString().toUpperCase();
  if (!ticker || !title || !close) return null;
  return {
    ticker,
    title,
    closeTime: new Date(close).toISOString(),
    status,
    lastPrice: raw.last_price ?? raw.lastPrice ?? raw.last_trade_price ?? undefined
  };
}

async function fetchKalshiMarkets(): Promise<Market[]> {
  const headers: Record<string, string> = {};
  if (config.kalshiApiKey) headers["X-API-Key"] = config.kalshiApiKey;
  const url = `${config.kalshiBaseUrl.replace(/\/$/, "")}/markets?limit=200`;
  const res = await request(url, { method: "GET", headers });
  if (res.statusCode >= 400) throw new Error(`Kalshi ${res.statusCode}`);
  const body: any = await res.body.json();
  const markets = Array.isArray(body?.markets) ? body.markets : Array.isArray(body) ? body : [];
  const normalized = markets.map(normalizeMarket).filter(Boolean) as Market[];
  if (normalized.length === 0) throw new Error("No markets returned");
  return normalized;
}

async function upsertMarkets(markets: Market[]) {
  for (const m of markets) {
    await prisma.market.upsert({
      where: { ticker: m.ticker },
      update: {
        title: m.title,
        closeTime: new Date(m.closeTime),
        status: m.status,
        lastPrice: m.lastPrice ?? null
      },
      create: {
        ticker: m.ticker,
        title: m.title,
        closeTime: new Date(m.closeTime),
        status: m.status,
        lastPrice: m.lastPrice ?? null
      }
    });
  }
}

export async function syncMarkets(): Promise<Market[]> {
  try {
    const live = await fetchKalshiMarkets();
    await upsertMarkets(live);
    return live;
  } catch (err) {
    // Fallback to stub if remote fails
    await upsertMarkets(stubMarkets);
    return stubMarkets;
  }
}

export async function listMarkets() {
  const dbMarkets = await prisma.market.findMany({ orderBy: { closeTime: "asc" } });
  if (dbMarkets.length === 0) {
    return syncMarkets();
  }
  return dbMarkets.map((m) => ({
    ticker: m.ticker,
    title: m.title,
    closeTime: m.closeTime.toISOString(),
    status: m.status,
    lastPrice: m.lastPrice ?? undefined
  }));
}
