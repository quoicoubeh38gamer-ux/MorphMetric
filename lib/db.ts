import { PrismaClient } from "@prisma/client";

// Prisma singleton — avoids exhausting connections during dev hot-reload.
// Instantiation is lazy about connecting, so importing this without a live
// DATABASE_URL is safe; queries only connect when actually run.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ log: ["warn", "error"] });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
