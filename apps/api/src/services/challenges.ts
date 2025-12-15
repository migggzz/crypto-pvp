import { randomUUID } from "crypto";
import { prisma } from "../db";

type CreateChallengeInput = {
  ticker: string;
  creatorPublicKey: string;
  creatorSide: number;
  stakeLamports: number;
};

export async function listChallenges() {
  return prisma.challenge.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
}

export async function getChallenge(id: string) {
  return prisma.challenge.findUnique({ where: { id }, include: { deposits: true } });
}

export async function createChallenge(input: CreateChallengeInput) {
  const challengeId = BigInt(Date.now());
  return prisma.challenge.create({
    data: {
      id: randomUUID(),
      challengeId,
      ticker: input.ticker,
      creatorPublicKey: input.creatorPublicKey,
      creatorSide: input.creatorSide,
      stakeLamports: BigInt(input.stakeLamports),
      status: "OPEN"
    }
  });
}

export async function joinChallenge(id: string, opponentPublicKey: string, opponentSide: number) {
  return prisma.challenge.update({
    where: { id },
    data: { opponentPublicKey, opponentSide, status: "OPEN" }
  });
}

export async function recordDeposit(id: string, userPublicKey: string, lamports: number) {
  const challenge = await prisma.challenge.findUnique({ where: { id }, include: { deposits: true } });
  if (!challenge) throw new Error("Challenge not found");
  const deposit = await prisma.deposit.create({
    data: {
      challengeId: id,
      userPublicKey,
      lamports: BigInt(lamports)
    }
  });
  const totalByUser = challenge.deposits.filter((d) => d.userPublicKey === userPublicKey).reduce((acc, d) => acc + Number(d.lamports), 0) + lamports;
  let status = challenge.status;
  const creatorDeposits = challenge.deposits.filter((d) => d.userPublicKey === challenge.creatorPublicKey).reduce((acc, d) => acc + Number(d.lamports), 0) + (userPublicKey === challenge.creatorPublicKey ? lamports : 0);
  const opponentDeposits = challenge.deposits.filter((d) => d.userPublicKey === challenge.opponentPublicKey).reduce((acc, d) => acc + Number(d.lamports), 0) + (userPublicKey === challenge.opponentPublicKey ? lamports : 0);
  if (creatorDeposits >= Number(challenge.stakeLamports) && opponentDeposits >= Number(challenge.stakeLamports)) {
    status = "LIVE";
  }
  await prisma.challenge.update({ where: { id }, data: { status } });
  return { deposit, totalByUser, status };
}

export async function markResolved(id: string, resultSide: number) {
  return prisma.challenge.update({ where: { id }, data: { status: "RESOLVED", resultSide } });
}
