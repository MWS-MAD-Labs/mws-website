import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

declare global {
  var __mwsWebsitePrisma: PrismaClient | undefined;
}

export function getPrisma(): PrismaClient {
  if (globalThis.__mwsWebsitePrisma) {
    return globalThis.__mwsWebsitePrisma;
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  if (process.env.NODE_ENV !== "production") {
    globalThis.__mwsWebsitePrisma = prisma;
  }

  return prisma;
}
