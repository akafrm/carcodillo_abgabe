/**
 * Prisma Database Client
 * 
 * Provides a singleton instance of the Prisma Client for database operations.
 * Uses global object to ensure only one instance exists during development hot reloading.
 */
import { PrismaClient } from "@prisma/client"

// Type augmentation for the global object
const globalForPrisma = global as unknown as { prisma: PrismaClient }

/**
 * Prisma client instance with query logging enabled
 * Reuses existing instance if available in global scope
 */
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query"],
  })

// Store the instance on global object in non-production environments
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

export default prisma