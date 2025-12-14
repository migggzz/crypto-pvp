import { FastifyInstance } from "fastify";
import { listMarkets, syncMarkets } from "../services/kalshi";

export async function marketRoutes(fastify: FastifyInstance) {
  fastify.get("/", async () => {
    const markets = await listMarkets();
    return { markets };
  });

  fastify.post("/refresh", { preHandler: [fastify.authenticate] }, async () => {
    const markets = await syncMarkets();
    return { markets, refreshed: true };
  });
}
