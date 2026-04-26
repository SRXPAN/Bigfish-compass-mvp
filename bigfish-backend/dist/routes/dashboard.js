// src/routes/dashboard.ts
import { Router } from 'express';
import { prisma } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { calculateStreak, getRecentActivity, getViewedMaterialIds, } from '../services/progress.service.js';
const router = Router();
router.get('/summary', requireAuth, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const lang = (req.query.lang || 'EN');
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { xp: true }
    });
    const userXp = user?.xp ?? 0;
    const completedLessonsCount = await prisma.materialView.count({
        where: { userId }
    });
    const streakData = await calculateStreak(userId);
    const activities = await getRecentActivity(userId, 7);
    const totalTimeSpent = activities.reduce((sum, a) => sum + a.timeSpent, 0);
    const totalQuizAttempts = activities.reduce((sum, a) => sum + a.quizAttempts, 0);
    const viewedMaterialIds = new Set(await getViewedMaterialIds(userId));
    const recentViews = await prisma.materialView.findMany({
        where: { userId },
        orderBy: { viewedAt: 'desc' },
        take: 50,
        select: { materialId: true, viewedAt: true },
    });
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const activityDates = new Set(activities.map(a => new Date(a.date).toISOString().split('T')[0]));
    const history = [];
    const historyDates = [];
    for (let i = 6; i >= 0; i--) {
        const checkDate = new Date(today);
        checkDate.setUTCDate(checkDate.getUTCDate() - i);
        const dateStr = checkDate.toISOString().split('T')[0];
        historyDates.push(dateStr);
        history.push(activityDates.has(dateStr));
    }
    if (recentViews.length === 0) {
        return res.json({
            userXp,
            completedLessons: completedLessonsCount,
            stats: {
                streak: { ...streakData, history, historyDates },
                activity: { timeSpent: 0, quizAttempts: 0 }
            },
            recentTopics: [],
            achievements: []
        });
    }
    const materials = await prisma.material.findMany({
        where: { id: { in: recentViews.map(v => v.materialId) } },
        select: { id: true, topicId: true }
    });
    const uniqueTopicIds = new Set();
    const topicLastViewedMap = new Map();
    for (const view of recentViews) {
        const mat = materials.find(m => m.id === view.materialId);
        if (mat && mat.topicId) {
            if (!uniqueTopicIds.has(mat.topicId)) {
                uniqueTopicIds.add(mat.topicId);
                topicLastViewedMap.set(mat.topicId, view.viewedAt);
            }
        }
        if (uniqueTopicIds.size >= 4)
            break;
    }
    const topicsData = await prisma.topic.findMany({
        where: { id: { in: Array.from(uniqueTopicIds) } },
        select: {
            id: true,
            name: true,
            nameJson: true,
            slug: true,
            materials: { select: { id: true } }
        }
    });
    const recentTopics = topicsData.map(topic => {
        const viewedCount = topic.materials.filter(m => viewedMaterialIds.has(m.id)).length;
        const totalCount = topic.materials.length;
        const progress = totalCount > 0 ? Math.round((viewedCount / totalCount) * 100) : 0;
        return {
            id: topic.id,
            name: topic.name,
            nameJson: topic.nameJson,
            slug: topic.slug,
            progress,
            lastViewedAt: topicLastViewedMap.get(topic.id) || new Date(0)
        };
    }).sort((a, b) => b.lastViewedAt.getTime() - a.lastViewedAt.getTime());
    res.json({
        userXp,
        completedLessons: completedLessonsCount,
        stats: {
            streak: { ...streakData, history, historyDates },
            activity: { timeSpent: totalTimeSpent, quizAttempts: totalQuizAttempts }
        },
        recentTopics,
        achievements: []
    });
}));
export default router;
