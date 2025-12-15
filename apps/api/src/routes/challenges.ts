import { FastifyInstance } from "fastify";
import { createChallenge, getChallenge, joinChallenge, listChallenges, recordDeposit } from "../services/challenges";

export async function challengeRoutes(fastify: FastifyInstance) {
  const serialize = (data: any): any => {
    if (typeof data === "bigint") return data.toString();
    if (data instanceof Date) return data.toISOString();
    if (Array.isArray(data)) return data.map(serialize);
    if (data && typeof data === "object") {
      const out: any = {};
      for (const [k, v] of Object.entries(data)) out[k] = serialize(v);
      return out;
    }
    return data;
  };
  const withNames = (challenge: any) => {
    const serialized = serialize(challenge);
    const creatorName = challenge?.creatorUser?.username || challenge?.creatorPublicKey;
    return { ...serialized, creatorName };
  };

  fastify.get("/", { preHandler: [fastify.authenticate] }, async () => {
    const challenges = await listChallenges();
    return { challenges: serialize(challenges).map(withNames) };
  });

  fastify.get("/:id", { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const id = (request.params as any).id;
    const challenge = await getChallenge(id);
    if (!challenge) return reply.code(404).send({ error: "Not found" });
    return { challenge: withNames(challenge) };
  });

  fastify.post("/", { preHandler: [fastify.authenticate] }, async (request) => {
    const body: any = request.body;
    const challenge = await createChallenge({
      ticker: body.ticker,
      creatorPublicKey: (request as any).user?.publicKey,
      creatorSide: Number(body.creatorSide),
      stakeLamports: Number(body.stakeLamports)
    });
    return { challenge: withNames(challenge) };
  });

  fastify.post("/:id/join", { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const id = (request.params as any).id;
    const body: any = request.body;
    const challenge = await joinChallenge(id, (request as any).user?.publicKey, Number(body.opponentSide));
    return { challenge: withNames(challenge) };
  });

  fastify.post("/:id/deposit", { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const id = (request.params as any).id;
    const body: any = request.body;
    const result = await recordDeposit(id, (request as any).user?.publicKey, Number(body.lamports));
    return serialize(result);
  });
}
