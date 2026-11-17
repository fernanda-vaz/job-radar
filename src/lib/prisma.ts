import "dotenv/config";
import * as Prisma from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL não configurada.");
}

const adapter = new PrismaPg({ connectionString });
// The generated Prisma client is produced by `npm run db:generate`.
// Keeping this lookup dynamic also lets the rule tests run before a database is installed.
const PrismaClient = (Prisma as unknown as { PrismaClient: new (options: unknown) => unknown }).PrismaClient;
export const prisma = new PrismaClient({ adapter }) as any;
