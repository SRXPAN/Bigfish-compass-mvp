// src/services/progress.service.ts
import { prisma } from '../db.js'

function getUtcToday(): Date {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
}

export async function markMaterialViewed(_userId: string, _materialId: string, _timeSpent?: number): Promise<void> {
  return
}

export async function getViewedMaterialIds(_userId: string): Promise<string[]> {
  return []
}

export async function isMaterialViewed(_userId: string, _materialId: string): Promise<boolean> {
  return false
}

export async function getMaterialViewStats(_materialIds: string[]): Promise<Record<string, number>> {
  return {}
}

export async function updateDailyActivity(
  userId: string,
  updates: {
    timeSpent?: number
    quizAttempts?: number
    materialsViewed?: number
    goalsCompleted?: number
  }
): Promise<void> {
  const today = getUtcToday()
  await prisma.userActivity.upsert({
    where: { userId_date: { userId, date: today } },
    create: {
      userId,
      date: today,
      timeSpent: updates.timeSpent ?? 0,
      quizAttempts: updates.quizAttempts ?? 0,
      materialsViewed: updates.materialsViewed ?? 0,
      goalsCompleted: updates.goalsCompleted ?? 0,
    },
    update: {
      timeSpent: updates.timeSpent ? { increment: updates.timeSpent } : undefined,
      quizAttempts: updates.quizAttempts ? { increment: updates.quizAttempts } : undefined,
      materialsViewed: updates.materialsViewed ? { increment: updates.materialsViewed } : undefined,
      goalsCompleted: updates.goalsCompleted ? { increment: updates.goalsCompleted } : undefined,
    },
  })
}

export async function getRecentActivity(userId: string, days: number = 7) {
  const startDate = getUtcToday()
  startDate.setUTCDate(startDate.getUTCDate() - days)
  return prisma.userActivity.findMany({
    where: { userId, date: { gte: startDate } },
    orderBy: { date: 'asc' },
  })
}

export async function calculateStreak(userId: string): Promise<{
  current: number
  longest: number
  lastActiveDate: Date | null
}> {
  const activities = await prisma.userActivity.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    select: { date: true },
  })

  if (activities.length === 0) {
    return { current: 0, longest: 0, lastActiveDate: null }
  }

  const msPerDay = 1000 * 60 * 60 * 24
  const today = getUtcToday()
  const lastActivityDate = new Date(activities[0].date)
  const daysDiff = Math.floor((today.getTime() - lastActivityDate.getTime()) / msPerDay)

  let current = 0
  if (daysDiff <= 1) {
    current = 1
    for (let i = 1; i < activities.length; i++) {
      const prevDate = new Date(activities[i - 1].date)
      const currDate = new Date(activities[i].date)
      const diff = Math.round((prevDate.getTime() - currDate.getTime()) / msPerDay)
      if (diff === 1) current++
      else break
    }
  }

  let longest = activities.length > 0 ? 1 : 0
  let temp = 1
  for (let i = 1; i < activities.length; i++) {
    const prevDate = new Date(activities[i - 1].date)
    const currDate = new Date(activities[i].date)
    const diff = Math.round((prevDate.getTime() - currDate.getTime()) / msPerDay)
    temp = diff === 1 ? temp + 1 : 1
    longest = Math.max(longest, temp)
  }

  return {
    current,
    longest: Math.max(longest, current),
    lastActiveDate: activities[0]?.date ?? null,
  }
}

export async function getUserStats(userId: string) {
  const [streak, recentActivity] = await Promise.all([
    calculateStreak(userId),
    getRecentActivity(userId, 7),
  ])

  const totalTimeSpent = recentActivity.reduce((sum, a) => sum + a.timeSpent, 0)
  const totalQuizAttempts = recentActivity.reduce((sum, a) => sum + a.quizAttempts, 0)

  return {
    streak: streak.current,
    longestStreak: streak.longest,
    lastActiveDate: streak.lastActiveDate,
    totalTimeSpent,
    totalQuizAttempts,
    totalMaterialsViewed: 0,
    last7DaysActivity: recentActivity,
  }
}

export async function syncViewedMaterials(_userId: string, localMaterialIds: string[]): Promise<string[]> {
  return [...new Set(localMaterialIds)]
}