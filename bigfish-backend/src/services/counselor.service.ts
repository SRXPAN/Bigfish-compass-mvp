import { randomInt } from 'crypto'
import { Prisma } from '@prisma/client'
import { prisma } from '../db.js'
import { AppError } from '../utils/AppError.js'

const ACCESS_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function generateAccessCodeValue(length = randomInt(6, 9)): string {
  let code = ''

  for (let index = 0; index < length; index += 1) {
    code += ACCESS_CODE_ALPHABET[randomInt(ACCESS_CODE_ALPHABET.length)]
  }

  return code
}

export async function generateAccessCode(counselorId: string, maxUses: number) {
  const counselor = await prisma.user.findUnique({
    where: { id: counselorId },
    select: {
      id: true,
      role: true,
      seatsAvailable: true,
    },
  })

  if (!counselor) {
    throw AppError.notFound('Counselor not found')
  }

  if (counselor.role !== 'COUNSELOR') {
    throw AppError.forbidden('Only counselors can generate access codes')
  }

  if (counselor.seatsAvailable < maxUses) {
    throw AppError.badRequest('Not enough seats available')
  }

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = generateAccessCodeValue()

    try {
      const accessCode = await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: counselorId },
          data: {
            seatsAvailable: {
              decrement: maxUses,
            },
          },
        })

        return tx.accessCode.create({
          data: {
            code,
            maxUses,
            counselorId,
          },
        })
      })

      return accessCode
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        continue
      }

      throw error
    }
  }

  throw AppError.internal('Unable to generate a unique access code')
}