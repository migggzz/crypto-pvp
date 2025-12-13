import { FastifyInstance } from "fastify";
import { createChallenge, getChallenge, joinChallenge, listChallenges, recordDeposit } from "../services/challenges";

export async function challengeRoutes(fastify: FastifyInstance) {
  fastify.get("/", { preHandler: [fastify.authenticate] }, async () => {
    const challenges = await listChallenges();
    return { challenges };
  });

  fastify.get("/:id", { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const id = (request.params as any).id;
    const challenge = await getChallenge(id);
    if (!challenge) return reply.code(404).send({ error: "Not found" });
    return { challenge };
  });

  fastify.post("/", { preHandler: [fastify.authenticate] }, async (request) => {
    const body: any = request.body;
    const challenge = await createChallenge({
      ticker: body.ticker,
      creatorPublicKey: (request as any).user?.publicKey,
      creatorSide: Number(body.creatorSide),
      stakeLamports: Number(body.stakeLamports)
    });
    return { challenge };
  });

  fastify.post("/:id/join", { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const id = (request.params as any).id;
    const body: any = request.body;
    const challenge = await joinChallenge(id, (request as any).user?.publicKey, Number(body.opponentSide));
    return { challenge };
  });

  fastify.post("/:id/deposit", { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const id = (request.params as any).id;
    const body: any = request.body;
    const result = await recordDeposit(id, (request as any).user?.publicKey, Number(body.lamports));
    return result;
  });
}
