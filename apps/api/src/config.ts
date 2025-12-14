import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: Number(process.env.PORT || 8000),
  dbUrl: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/kalshi_sol_pvp",
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
  jwtSecret: process.env.API_JWT_SECRET || "dev-secret",
  kalshiBaseUrl: process.env.KALSHI_BASE_URL || "https://api.elections.kalshi.com/trade-api/v2",
  kalshiApiKey: process.env.KALSHI_API_KEY || "",
  solanaRpcUrl: process.env.SOLANA_RPC_URL || "http://localhost:8899",
  programId: process.env.PROGRAM_ID || "",
  oracleAuthority: process.env.ORACLE_AUTHORITY_KEYPAIR || "",
  treasuryPubkey: process.env.TREASURY_PUBKEY || "",
  webOrigin: process.env.WEB_ORIGIN || "http://localhost:3000",
  adminPublicKey: process.env.ADMIN_PUBLIC_KEY || ""
};
