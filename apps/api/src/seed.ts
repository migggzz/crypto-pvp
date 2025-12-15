import { prisma } from "./db";

async function main() {
  await prisma.market.upsert({
    where: { ticker: "DEMO" },
    update: { title: "Demo Market", closeTime: new Date(Date.now() + 86400000), status: "TRADING" },
    create: { ticker: "DEMO", title: "Demo Market", closeTime: new Date(Date.now() + 86400000), status: "TRADING" }
  });
  console.log("Seeded demo market");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
