import { FastifyInstance } from "fastify";
import { listMarkets } from "../services/kalshi";

export async function marketRoutes(fastify: FastifyInstance) {
  fastify.get("/", async () => {
    const markets = await listMarkets();
    return { markets };
  });
}
