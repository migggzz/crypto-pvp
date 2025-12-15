import { FastifyInstance } from "fastify";
import NodeCache from "node-cache";
import { PublicKey } from "@solana/web3.js";
import { randomBytes } from "crypto";
import { config } from "../config";
import nacl from "tweetnacl";

const nonceCache = new NodeCache({ stdTTL: 300 });

export async function authRoutes(fastify: FastifyInstance) {
  fastify.get("/nonce", async () => {
    const nonce = randomBytes(16).toString("hex");
    nonceCache.set(nonce, true);
    return { nonce };
  });

  fastify.post("/verify", async (request, reply) => {
    const body: any = request.body || {};
    const { publicKey, signature, message } = body;
    if (!publicKey || !signature || !message) {
      return reply.code(400).send({ error: "Missing fields" });
    }

    const nonceLine = message.split("\n").find((l: string) => l.startsWith("Nonce:"));
    const nonce = nonceLine?.split("Nonce:")[1]?.trim();
    if (!nonce || !nonceCache.take(nonce)) {
      return reply.code(400).send({ error: "Nonce invalid or expired" });
    }

    try {
      const pubkey = new PublicKey(publicKey);
      const msg = new TextEncoder().encode(message);
      const sig = Buffer.from(signature, "base64");
      const ok = nacl.sign.detached.verify(msg, sig, pubkey.toBytes());
      if (!ok) return reply.code(401).send({ error: "Invalid signature" });

      const token = fastify.jwt.sign({ publicKey }, { expiresIn: "1d" });
      return { token, publicKey };
    } catch (err: any) {
      request.log.error(err);
      return reply.code(500).send({ error: "Verification failed" });
    }
  });

  fastify.get("/me", { preHandler: [fastify.authenticate] }, async (request) => {
    return { publicKey: (request as any).user?.publicKey };
  });
}
