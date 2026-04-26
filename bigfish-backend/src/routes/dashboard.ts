// src/routes/dashboard.ts
import { Router, Request, Response } from 'express'
import { prisma } from '../db.js'
import { requireAuth } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/errorHandler.js'

const router = Router()

function getUtcToday(): Date {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
}

router.get('/summary', requireAuth, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { xp: true }
  })
  const userXp = user?.xp ?? 0

  const today = getUtcToday()
  const historyDates = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today)
    date.setUTCDate(date.getUTCDate() - (6 - index))
    return date.toISOString().split('T')[0]
  })

  res.json({
    userXp,
    stats: {
      streak: {
        current: 0,
        longest: 0,
        lastActiveDate: null,
        history: Array(7).fill(false),
        historyDates,
      },
      activity: { timeSpent: 0, quizAttempts: 0 }
    },
    recentTopics: [],
    dailyGoals: [],
    weakSpots: [],
    tipOfTheDay: '',
    achievements: []
  })
}))

export default router
