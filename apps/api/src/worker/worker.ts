import { createWorker } from "../redis";
import { enqueueResolvedChallenges } from "./jobs";
import { markResolved, getChallenge } from "../services/challenges";
import { resolveOnChain } from "../services/solana";
import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";

async function start() {
  // basic poller
  setInterval(enqueueResolvedChallenges, 60_000);

  createWorker(async (jobName, data) => {
    if (jobName === "resolve") {
      const challenge = await getChallenge(data.challengeId);
      if (!challenge) return;
      const side = data.side ?? 0;
      if (challenge.challengeId && challenge.creatorPublicKey) {
        try {
          await resolveOnChain(new anchor.BN(challenge.challengeId.toString()), new PublicKey(challenge.creatorPublicKey), Number(side));
        } catch (err) {
          console.error("resolve job on-chain failed", err);
        }
      }
      await markResolved(challenge.id, Number(side));
    }
  });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
