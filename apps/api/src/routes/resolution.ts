import { FastifyInstance } from "fastify";
import { markResolved, getChallenge } from "../services/challenges";
import { resolveOnChain } from "../services/solana";
import { config } from "../config";
import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";

export async function resolutionRoutes(fastify: FastifyInstance) {
  fastify.post("/:id", { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const userPk = (request as any).user?.publicKey;
    if (config.adminPublicKey && config.adminPublicKey !== userPk) {
      return reply.code(403).send({ error: "Forbidden" });
    }
    const id = (request.params as any).id;
    const body: any = request.body;
    const challenge = await getChallenge(id);
    if (!challenge) return reply.code(404).send({ error: "Not found" });

    try {
      if (challenge.challengeId && challenge.creatorPublicKey) {
        await resolveOnChain(new anchor.BN(challenge.challengeId.toString()), new PublicKey(challenge.creatorPublicKey), Number(body.side));
      }
    } catch (err: any) {
      request.log.error({ err }, "On-chain resolve failed, marking off-chain only.");
    }
    const updated = await markResolved(id, Number(body.side));
    return { challenge: updated };
  });
}
