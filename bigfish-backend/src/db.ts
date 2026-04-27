import { config } from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { PrismaClient } from '@prisma/client'

// Завантаження змінних оточення
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
config({ path: resolve(__dirname, '../../.env') })

// Створюємо та ОДРАЗУ розширюємо клієнт
const prismaClientSingleton = () => {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? [] : ['error', 'warn'],
  })

  return client.$extends({
    model: {
      user: {
        async softDelete(id: string) {
          return client.user.update({
            where: { id },
            data: { deletedAt: new Date() },
          })
        },
        async restore(id: string) {
          return client.user.update({
            where: { id },
            data: { deletedAt: null },
          })
        },
      },
    },
    query: {
      user: {
        async findMany({ args, query }) {
          if (args.where?.deletedAt === undefined) {
            args.where = { ...args.where, deletedAt: null }
          }
          return query(args)
        },
        async findFirst({ args, query }) {
          if (args.where?.deletedAt === undefined) {
            args.where = { ...args.where, deletedAt: null }
          }
          return query(args)
        },
      },
    },
  })
}

// Витягуємо точний тип розширеного клієнта за допомогою ReturnType
type ExtendedPrismaClient = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = globalThis as unknown as {
  prisma: ExtendedPrismaClient | undefined
}

// Експортуємо готовий, безпечний екземпляр
export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

// Зберігаємо його для гарячого перезавантаження в режимі розробки
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}