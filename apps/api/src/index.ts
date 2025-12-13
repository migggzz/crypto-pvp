import Fastify, { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import fastifyJwt from "@fastify/jwt";
import { config } from "./config";
import { healthRoutes } from "./routes/health";
import { authRoutes } from "./routes/auth";
import { marketRoutes } from "./routes/markets";
import { challengeRoutes } from "./routes/challenges";
import { resolutionRoutes } from "./routes/resolution";

declare module "fastify" {
  interface FastifyInstance {
    authenticate: any;
  }
  interface FastifyRequest {
    user: { publicKey: string };
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { publicKey: string };
    user: { publicKey: string };
  }
}

export function buildServer(): FastifyInstance {
  const app = Fastify({ logger: true });
  app.register(cors, { origin: [config.webOrigin, "http://localhost:3000"], credentials: true });
  app.register(fastifyJwt, { secret: config.jwtSecret });

  app.decorate("authenticate", async function (request: any, reply: any) {
    try {
      const decoded = await request.jwtVerify();
      request.user = decoded;
    } catch (err) {
      reply.send(err);
    }
  });

  app.register(healthRoutes, { prefix: "/health" });
  app.register(authRoutes, { prefix: "/auth" });
  app.register(marketRoutes, { prefix: "/markets" });
  app.register(challengeRoutes, { prefix: "/challenges" });
  app.register(resolutionRoutes, { prefix: "/resolution" });

  return app;
}

const server = buildServer();
server.listen({ port: config.port, host: "0.0.0.0" }).catch((err) => {
  server.log.error(err);
  process.exit(1);
});
