import Fastify, { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import fastifyJwt from "@fastify/jwt";
import { config } from "./config";
import { healthRoutes } from "./routes/health";
import { authRoutes } from "./routes/auth";
import { marketRoutes } from "./routes/markets";
import { challengeRoutes } from "./routes/challenges";
import { resolutionRoutes } from "./routes/resolution";
import { userRoutes } from "./routes/users";

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

declare global {
  interface BigInt {
    toJSON(): string;
  }
}

// Ensure BigInt fields (from Prisma) serialize cleanly in API responses
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

export function buildServer(): FastifyInstance {
  const app = Fastify({ logger: true });
  const allowedOrigins = Array.from(
    new Set(
      [config.webOrigin, config.webOrigin.replace(/^http:\/\//, "https://"), "http://localhost:3000", "https://localhost:3000"].filter(Boolean)
    )
  );
  app.register(cors, {
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // allow server-to-server/no-origin
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error("Origin not allowed"), false);
    },
    credentials: true
  });
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
  app.register(userRoutes, { prefix: "/users" });
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
