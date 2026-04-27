import { Prisma } from '@prisma/client'
import { prisma } from '../db.js'
import { AppError } from '../utils/AppError.js'

export async function redeemAccessCode(studentId: string, codeString: string) {
  const accessCode = await prisma.accessCode.findUnique({
    where: { code: codeString },
    select: {
      id: true,
      maxUses: true,
      currentUses: true,
      code: true,
    },
  })

  if (!accessCode) {
    throw AppError.notFound('Invalid code')
  }

  if (accessCode.currentUses >= accessCode.maxUses) {
    throw AppError.badRequest('Code has reached its usage limit')
  }

  try {
    const updatedStudent = await prisma.$transaction(async (tx) => {
      const updatedAccessCode = await tx.accessCode.updateMany({
        where: {
          id: accessCode.id,
          currentUses: {
            lt: accessCode.maxUses,
          },
        },
        data: {
          currentUses: {
            increment: 1,
          },
        },
      })

      if (updatedAccessCode.count === 0) {
        throw AppError.badRequest('Code has reached its usage limit')
      }

      return tx.user.update({
        where: { id: studentId },
        data: {
          tokens: {
            increment: 1,
          },
        },
        select: {
          id: true,
          tokens: true,
        },
      })
    })

    return {
      message: 'Access code redeemed successfully',
      tokenBalance: updatedStudent.tokens,
    }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      throw AppError.notFound('Student not found')
    }

    throw error
  }
}