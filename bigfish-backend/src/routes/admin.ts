import { Router, type Request, type Response } from 'express'
import { prisma } from '../db.js'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import { ok } from '../utils/response.js'

const router = Router()

router.get(
  '/stats',
  requireAuth,
  requireRole(['ADMIN']),
  asyncHandler(async (_req: Request, res: Response) => {
    const [totalUsers, totalSchools, totalAssessments, totalAccessCodes] = await Promise.all([
      prisma.user.count(),
      prisma.school.count(),
      prisma.assessmentSession.count(),
      prisma.accessCode.count(),
    ])

    return ok(res, {
      totalUsers,
      totalSchools,
      totalAssessments,
      totalAccessCodes,
    })
  })
)

export default router