// Prisma client singleton for Next.js
// Next.js hot reload in dev creates multiple Prisma instances — prevent this by
// attaching the client to globalThis and reusing it across reloads
// In production, always create a fresh instance
// Use Neon serverless adapter (@prisma/adapter-neon) initialised with DATABASE_URL
// Export the single instance as `db`

// import { PrismaClient } from '@prisma/client';
// import { PrismaNeon } from '@prisma/adapter-neon';
// import { Pool } from '@neondatabase/serverless';

// const globalForPrisma = global as any;

// let prisma: PrismaClient;

// if (process.env.NODE_ENV === 'production') {
//     // PRODUCTION
//     prisma = new PrismaClient({
//     adapter: new PrismaNeon(
//       new Pool({ connectionString: process.env.DATABASE_URL }) as any
//     ),
//   });
// } else {
//     // DEV
//     if (!globalForPrisma.prisma) {
//     globalForPrisma.prisma = new PrismaClient();
//   }
//   prisma = globalForPrisma.prisma;
// }

// export const db = prisma; 

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from "@prisma/adapter-pg";
import { recordDbOperation } from '@/lib/adminTelemetry';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

function createClient() {
  const prisma = new PrismaClient({ adapter });

  return prisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ operation, args, query }) {
          try {
            const result = await query(args);
            recordDbOperation(operation, false);
            return result;
          } catch (error) {
            recordDbOperation(operation, true);
            throw error;
          }
        },
      },
    },
  });
}

const globalForPrisma = global as typeof globalThis & {
  prisma?: ReturnType<typeof createClient>;
};

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = createClient();
}

export const db = globalForPrisma.prisma;