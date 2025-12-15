import { FastifyInstance } from "fastify";
import { ensureUser, getUser, updateUsername } from "../services/users";

export async function userRoutes(fastify: FastifyInstance) {
  fastify.get("/me", { preHandler: [fastify.authenticate] }, async (request) => {
    const publicKey = (request as any).user?.publicKey;
    const user = (await getUser(publicKey)) ?? (await ensureUser(publicKey));
    return { publicKey, username: user?.username ?? publicKey };
  });

  fastify.patch("/me", { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const publicKey = (request as any).user?.publicKey;
    const body: any = request.body || {};
    const username = (body.username || "").trim();
    if (!username || username.length < 3 || username.length > 32) {
      return reply.code(400).send({ error: "Username must be 3-32 characters" });
    }
    // simple allowlist: letters, numbers, underscore, dash, dot
    if (!/^[a-zA-Z0-9._-]+$/.test(username)) {
      return reply.code(400).send({ error: "Username can only contain letters, numbers, ., _, -" });
    }
    try {
      const updated = await updateUsername(publicKey, username);
      return { publicKey, username: updated.username };
    } catch (err: any) {
      if (err?.code === "P2002") {
        return reply.code(409).send({ error: "Username already taken" });
      }
      request.log.error(err);
      return reply.code(500).send({ error: "Failed to update username" });
    }
  });
}
