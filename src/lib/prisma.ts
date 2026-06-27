import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma3: PrismaClient };

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// Force a completely fresh instance so it picks up the regenerated schema containing 'subject'
export const prisma = new PrismaClient({
  adapter,
  log: ["query"],
});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma3 = prisma;
