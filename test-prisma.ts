import { PrismaClient } from "@prisma/client";

async function main() {
  const prisma = new PrismaClient();
  try {
    const config = await prisma.config.findFirst();
    console.log("Config:", config);
    const skills = await prisma.skillItem.findMany();
    console.log("Skills count:", skills.length);
  } catch (e) {
    console.error("Prisma test failed:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
