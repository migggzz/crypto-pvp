import { prisma } from "../db";

export async function ensureUser(publicKey: string) {
  const username = publicKey;
  return prisma.user.upsert({
    where: { publicKey },
    update: {},
    create: { publicKey, username }
  });
}

export async function getUser(publicKey: string) {
  return prisma.user.findUnique({ where: { publicKey } });
}

export async function updateUsername(publicKey: string, username: string) {
  return prisma.user.update({ where: { publicKey }, data: { username } });
}
