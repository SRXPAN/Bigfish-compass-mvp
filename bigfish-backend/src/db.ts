import { config } from 'dotenv'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { PrismaClient } from '@prisma/client'

// Load .env
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
config({ path: resolve(__dirname, '../../.env') })

// Base client
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? [] : ['error', 'warn'],
  })
}

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof prismaClientSingleton>
}

const basePrisma = globalForPrisma.prisma ?? prismaClientSingleton()

// EXTENDED CLIENT (Better Soft Delete)
export const prisma = basePrisma.$extends({
  model: {
    $allModels: {
      // Helper method to soft delete
      async softDelete(id: string) {
        return (this as any).update({
          where: { id },
          data: { deletedAt: new Date() },
        })
      },
      // Helper to restore
      async restore(id: string) {
        return (this as any).update({
          where: { id },
          data: { deletedAt: null },
        })
      }
    },
  },
  query: {
    quiz: {
      async findMany({ args, query }: { args: any; query: (args: any) => Promise<any> }) {
        if (args.where?.deletedAt === undefined) {
          args.where = { ...args.where, deletedAt: null }
        }
        return query(args)
      },
      async findFirst({ args, query }: { args: any; query: (args: any) => Promise<any> }) {
        if (args.where?.deletedAt === undefined) {
          args.where = { ...args.where, deletedAt: null }
        }
        return query(args)
      },
    },
  },
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = basePrisma