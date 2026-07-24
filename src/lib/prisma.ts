import { PrismaClient } from "@prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

async function createPrismaClient(): Promise<PrismaClient> {
  const { env } = await getCloudflareContext({ async: true });
  const adapter = new PrismaD1(env.traderstape);
  return new PrismaClient({ adapter });
}

let clientPromise: Promise<PrismaClient> | undefined;

function getClient(): Promise<PrismaClient> {
  if (globalForPrisma.prisma) {
    return Promise.resolve(globalForPrisma.prisma);
  }
  if (!clientPromise) {
    clientPromise = createPrismaClient();
  }
  return clientPromise.then((client) => {
    if (process.env.NODE_ENV !== "production") {
      globalForPrisma.prisma = client;
    }
    return client;
  });
}

/**
 * Creates a Proxy that lazily initializes the PrismaClient on first use.
 * Supports both:
 *   - 1-level deep: prisma.$transaction(...)
 *   - 2-level deep: prisma.user.findMany(...)
 * All consumers keep using `import { prisma } from "@/lib/prisma"` unchanged.
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    // For 1-level deep calls like prisma.$transaction(...)
    const directHandler = (...args: any[]) =>
      getClient().then((client) => {
        const value = (client as any)[prop];
        if (typeof value === "function") {
          return value.apply(client, args);
        }
        return value;
      });

    // For 2-level deep calls like prisma.user.findMany(...)
    return new Proxy(directHandler, {
      apply(_target, _thisArg, args) {
        return directHandler(...args);
      },
      get(_handlerTarget, nsProp) {
        return (...args: any[]) =>
          getClient().then((client) => {
            const namespace = (client as any)[prop];
            if (namespace && typeof namespace === "object") {
              const method = namespace[nsProp as string];
              if (typeof method === "function") {
                return method.apply(namespace, args);
              }
              return method;
            }
            return undefined;
          });
      },
    });
  },
});